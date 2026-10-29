<?php

namespace App\Http\Controllers\CRM;

use App\Http\Controllers\Controller;
use App\Models\Hotel;
use App\Models\Keberangkatan;
use App\Models\Paket;
use App\Models\Penerbangan;
use App\Traits\AuthorizesTravelCatalog;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class KeberangkatanController extends Controller
{
    use AuthorizesTravelCatalog;

    public function index(Request $request): Response
    {
        $this->authorizeCatalog($request);

        $tenantId = $request->user()->getActiveTenantId();
        $search = $request->input('search');
        $status = $request->input('status', 'ALL');
        $perPage = in_array((int) $request->input('per_page'), [10, 15, 25, 50, 100], true) ? (int) $request->input('per_page') : 15;

        $keberangkatan = Keberangkatan::where('tenant_id', $tenantId)
            ->with(['paket:id,nama_paket', 'penerbangan', 'hotel'])
            ->when($search, fn ($q) => $q->where(function ($q) use ($search) {
                $q->where('kode', 'ilike', "%{$search}%")
                    ->orWhere('muthawwif', 'ilike', "%{$search}%")
                    ->orWhereHas('paket', fn ($p) => $p->where('nama_paket', 'ilike', "%{$search}%"));
            }))
            ->when($status !== 'ALL', fn ($q) => $q->where('status', $status))
            ->orderBy('tanggal_berangkat')
            ->orderBy('kode')
            ->paginate($perPage)
            ->withQueryString();

        $statusCounts = Keberangkatan::where('tenant_id', $tenantId)
            ->selectRaw('status, count(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        return Inertia::render('CRM/Keberangkatan', [
            'keberangkatan' => $keberangkatan,
            'metrics' => [
                'total' => (int) $statusCounts->sum(),
                'terbuka' => (int) ($statusCounts['Terbuka'] ?? 0),
                'penuh' => (int) ($statusCounts['Penuh'] ?? 0),
                'total_kuota' => (int) Keberangkatan::where('tenant_id', $tenantId)->sum('kuota'),
            ],
            'penerbangan' => Penerbangan::where('tenant_id', $tenantId)->orderBy('waktu_berangkat')->orderBy('nomor_penerbangan')->get(),
            'hotel' => Hotel::where('tenant_id', $tenantId)->orderBy('kota')->orderBy('nama')->get(),
            'pakets' => Paket::where('tenant_id', $tenantId)->orderBy('nama_paket')->get(['id', 'nama_paket']),
            'statuses' => Keberangkatan::STATUSES,
            'sumberOptions' => Penerbangan::SUMBER,
            'filters' => ['search' => $search ?? '', 'status' => $status, 'per_page' => $perPage],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorizeCatalog($request);

        $tenantId = $request->user()->getActiveTenantId();
        $data = $this->validated($request, $tenantId);

        $keberangkatan = Keberangkatan::create(collect($data)->except(['penerbangan', 'hotel'])->all() + ['tenant_id' => $tenantId]);
        $this->syncRelations($keberangkatan, $data);

        return redirect()->back()->with('success', 'Paket keberangkatan berhasil ditambahkan.');
    }

    public function update(Request $request, Keberangkatan $keberangkatan): RedirectResponse
    {
        $this->authorizeCatalog($request, $keberangkatan);

        $data = $this->validated($request, $keberangkatan->tenant_id, $keberangkatan);

        $keberangkatan->update(collect($data)->except(['penerbangan', 'hotel'])->all());
        $this->syncRelations($keberangkatan, $data);

        return redirect()->back()->with('success', 'Paket keberangkatan berhasil diperbarui.');
    }

    public function destroy(Request $request, Keberangkatan $keberangkatan): RedirectResponse
    {
        $this->authorizeCatalog($request, $keberangkatan);

        $keberangkatan->delete();

        return redirect()->back()->with('success', 'Paket keberangkatan berhasil dihapus.');
    }

    /**
     * @param  array<string, mixed>  $data
     */
    private function syncRelations(Keberangkatan $keberangkatan, array $data): void
    {
        $keberangkatan->penerbangan()->sync(
            collect($data['penerbangan'] ?? [])->mapWithKeys(fn ($row) => [$row['id'] => ['arah' => $row['arah']]])->all()
        );

        $keberangkatan->hotel()->sync(
            collect($data['hotel'] ?? [])->mapWithKeys(fn ($row) => [$row['id'] => [
                'check_in' => $row['check_in'] ?? null,
                'check_out' => $row['check_out'] ?? null,
            ]])->all()
        );
    }

    /**
     * @return array<string, mixed>
     */
    private function validated(Request $request, int $tenantId, ?Keberangkatan $current = null): array
    {
        return $request->validate([
            'kode' => [
                'required', 'string', 'max:50',
                Rule::unique('keberangkatan', 'kode')->where('tenant_id', $tenantId)->ignore($current?->id),
            ],
            'paket_id' => ['nullable', Rule::exists('paket', 'id')->where('tenant_id', $tenantId)],
            'tanggal_berangkat' => ['required', 'date'],
            'tanggal_pulang' => ['required', 'date', 'after_or_equal:tanggal_berangkat'],
            'status' => ['required', Rule::in(Keberangkatan::STATUSES)],
            'kuota' => ['nullable', 'integer', 'min:1'],
            'penerbangan' => ['nullable', 'array', 'max:10'],
            'penerbangan.*.id' => ['required', 'distinct', Rule::exists('penerbangan', 'id')->where('tenant_id', $tenantId)],
            'penerbangan.*.arah' => ['required', Rule::in(['pergi', 'pulang'])],
            'hotel' => ['nullable', 'array', 'max:10'],
            'hotel.*.id' => ['required', 'distinct', Rule::exists('hotel', 'id')->where('tenant_id', $tenantId)],
            'hotel.*.check_in' => ['nullable', 'date'],
            'hotel.*.check_out' => ['nullable', 'date', 'after_or_equal:hotel.*.check_in'],
            'muthawwif' => ['nullable', 'string', 'max:100'],
            'tour_leader' => ['nullable', 'string', 'max:100'],
            'transportasi' => ['nullable', 'string', 'max:100'],
            'catatan' => ['nullable', 'string', 'max:2000'],
        ]);
    }
}
