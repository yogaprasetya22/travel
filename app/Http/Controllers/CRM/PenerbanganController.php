<?php

namespace App\Http\Controllers\CRM;

use App\Http\Controllers\Controller;
use App\Models\Penerbangan;
use App\Traits\AuthorizesTravelCatalog;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class PenerbanganController extends Controller
{
    use AuthorizesTravelCatalog;

    public function store(Request $request): RedirectResponse
    {
        $this->authorizeCatalog($request);

        Penerbangan::create($this->validated($request) + ['tenant_id' => $request->user()->getActiveTenantId()]);

        return redirect()->back()->with('success', 'Penerbangan berhasil ditambahkan.');
    }

    public function update(Request $request, Penerbangan $penerbangan): RedirectResponse
    {
        $this->authorizeCatalog($request, $penerbangan);

        $penerbangan->update($this->validated($request));

        return redirect()->back()->with('success', 'Penerbangan berhasil diperbarui.');
    }

    public function destroy(Request $request, Penerbangan $penerbangan): RedirectResponse
    {
        $this->authorizeCatalog($request, $penerbangan);

        if ($penerbangan->keberangkatan()->exists()) {
            return redirect()->back()->withErrors(['hapus' => 'Penerbangan masih dipakai keberangkatan, lepas dulu dari keberangkatannya.']);
        }

        $penerbangan->delete();

        return redirect()->back()->with('success', 'Penerbangan berhasil dihapus.');
    }

    /**
     * @return array<string, mixed>
     */
    private function validated(Request $request): array
    {
        return $request->validate([
            'maskapai' => ['required', 'string', 'max:100'],
            'nomor_penerbangan' => ['required', 'string', 'max:30'],
            'bandara_asal' => ['required', 'string', 'max:100'],
            'bandara_tujuan' => ['required', 'string', 'max:100'],
            'waktu_berangkat' => ['nullable', 'date'],
            'waktu_tiba' => ['nullable', 'date', 'after_or_equal:waktu_berangkat'],
            'harga' => ['nullable', 'numeric', 'min:0'],
            'sumber' => ['required', Rule::in(Penerbangan::SUMBER)],
            'sumber_ref' => ['nullable', 'string', 'max:150'],
            'sumber_url' => ['nullable', 'url', 'max:500'],
        ]);
    }
}
