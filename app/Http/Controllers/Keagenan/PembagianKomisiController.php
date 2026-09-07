<?php

namespace App\Http\Controllers\Keagenan;

use App\Http\Controllers\Controller;
use App\Models\KomisiAgen;
use App\Models\Paket;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PembagianKomisiController extends Controller
{
    /**
     * Display the commissions list and summary statistics with tenant isolation.
     */
    public function index(Request $request): Response
    {
        $user = auth()->user();
        if (! in_array($user->role, ['owner_travel', 'admin_travel', 'super_admin_master'])) {
            abort(403, 'Unauthorized action.');
        }

        $tenantId = $user->getActiveTenantId();
        $search = $request->input('search');
        $status = $request->input('status', 'ALL');
        $agenId = $request->input('agen_id', 'ALL');
        $paketId = $request->input('paket_id', 'ALL');
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');
        $dateField = $request->input('date_field', 'created_at');
        $perPage = (int) $request->input('per_page', 15);

        $query = KomisiAgen::where('tenant_id', $tenantId)
            ->with(['agen', 'jamaah.paket']);

        if ($user->role === 'agen') {
            $query->where('agen_id', $user->id);
        } elseif ($agenId && $agenId !== 'ALL') {
            $query->where('agen_id', $agenId);
        }

        if ($paketId && $paketId !== 'ALL') {
            $query->whereHas('jamaah', function ($q) use ($paketId) {
                $q->where('paket_id', $paketId);
            });
        }

        if (! empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->whereHas('agen', function ($qa) use ($search) {
                    $qa->where('name', 'ilike', "%{$search}%")
                        ->orWhere('email', 'ilike', "%{$search}%");
                })->orWhereHas('jamaah', function ($qj) use ($search) {
                    $qj->where('nama_lengkap', 'ilike', "%{$search}%")
                        ->orWhereHas('paket', function ($qp) use ($search) {
                            $qp->where('nama_paket', 'ilike', "%{$search}%");
                        });
                })->orWhere('nomor_referensi', 'ilike', "%{$search}%");
            });
        }

        if (! empty($status) && in_array($status, ['Pending', 'Ready_to_Pay', 'Paid'])) {
            $query->where('status_pencairan', $status);
        }

        if (! empty($startDate)) {
            $col = $dateField === 'tanggal_pencairan' ? 'tanggal_pencairan' : 'created_at';
            $query->whereDate($col, '>=', $startDate);
        }

        if (! empty($endDate)) {
            $col = $dateField === 'tanggal_pencairan' ? 'tanggal_pencairan' : 'created_at';
            $query->whereDate($col, '<=', $endDate);
        }

        $allFilteredCommissions = (clone $query)->orderBy('created_at', 'desc')->get();

        $commissions = $query
            ->orderBy('created_at', 'desc')
            ->paginate($perPage)
            ->withQueryString();

        $statsQuery = KomisiAgen::where('tenant_id', $tenantId);
        if ($user->role === 'agen') {
            $statsQuery->where('agen_id', $user->id);
        }

        $stats = [
            'total_paid' => (float) (clone $statsQuery)->where('status_pencairan', 'Paid')->sum('nominal_komisi'),
            'total_ready' => (float) (clone $statsQuery)->where('status_pencairan', 'Ready_to_Pay')->sum('nominal_komisi'),
            'total_pending' => (float) (clone $statsQuery)->where('status_pencairan', 'Pending')->sum('nominal_komisi'),
        ];

        // Agents eligible for batch payout (having Ready_to_Pay commissions)
        $readyAgents = [];
        if ($user->role !== 'agen') {
            $readyAgents = User::where('tenant_id', $tenantId)
                ->where('role', 'agen')
                ->whereHas('komisi', function ($q) {
                    $q->where('status_pencairan', 'Ready_to_Pay');
                })
                ->withSum(['komisi as ready_nominal' => function ($q) {
                    $q->where('status_pencairan', 'Ready_to_Pay');
                }], 'nominal_komisi')
                ->withCount(['komisi as ready_count' => function ($q) {
                    $q->where('status_pencairan', 'Ready_to_Pay');
                }])
                ->get()
                ->map(function ($a) {
                    return [
                        'id' => $a->id,
                        'name' => $a->name,
                        'email' => $a->email,
                        'nama_bank' => $a->nama_bank,
                        'nomor_rekening' => $a->nomor_rekening,
                        'atas_nama_rekening' => $a->atas_nama_rekening,
                        'ready_nominal' => (float) ($a->ready_nominal ?? 0),
                        'ready_count' => (int) ($a->ready_count ?? 0),
                    ];
                });
        }

        // All agents for filter dropdown
        $agentList = User::where('tenant_id', $tenantId)
            ->where('role', 'agen')
            ->select('id', 'name', 'email', 'nama_bank', 'nomor_rekening', 'atas_nama_rekening')
            ->orderBy('name')
            ->get();

        // All packages for filter dropdown
        $packageList = Paket::where('tenant_id', $tenantId)
            ->select('id', 'nama_paket')
            ->orderBy('nama_paket')
            ->get();

        return Inertia::render('Keagenan/Commissions', [
            'commissions' => $commissions,
            'allCommissions' => $allFilteredCommissions,
            'stats' => $stats,
            'readyAgents' => $readyAgents,
            'agentList' => $agentList,
            'packageList' => $packageList,
            'tenantName' => $user->tenant?->name ?? 'Travel Umroh & Haji',
            'filters' => [
                'search' => $search ?? '',
                'status' => $status ?? 'ALL',
                'agen_id' => $agenId,
                'paket_id' => $paketId,
                'start_date' => $startDate ?? '',
                'end_date' => $endDate ?? '',
                'date_field' => $dateField,
                'per_page' => $perPage,
            ],
            'isAgent' => $user->role === 'agen',
        ]);
    }

    /**
     * Update the disbursement status of a specific commission with payment reference.
     */
    public function update(Request $request, KomisiAgen $commission): RedirectResponse
    {
        $user = auth()->user();
        if (! in_array($user->role, ['owner_travel', 'admin_travel', 'super_admin_master'])) {
            abort(403, 'Unauthorized action.');
        }

        $tenantId = $user->getActiveTenantId();
        if ($commission->tenant_id !== $tenantId) {
            abort(403, 'Komisi tidak ditemukan pada tenant ini.');
        }

        $validated = $request->validate([
            'status_pencairan' => 'required|string|in:Pending,Ready_to_Pay,Paid',
            'nomor_referensi' => 'nullable|string|max:100',
            'metode_pembayaran' => 'nullable|string|max:100',
            'catatan_pencairan' => 'nullable|string|max:500',
        ]);

        $updateData = [
            'status_pencairan' => $validated['status_pencairan'],
            'nomor_referensi' => $validated['nomor_referensi'] ?? null,
            'metode_pembayaran' => $validated['metode_pembayaran'] ?? 'Transfer Bank',
            'catatan_pencairan' => $validated['catatan_pencairan'] ?? null,
        ];

        if ($validated['status_pencairan'] === 'Paid' && ! $commission->tanggal_pencairan) {
            $updateData['tanggal_pencairan'] = Carbon::now();
        }

        $commission->update($updateData);

        return redirect()->back()->with('success', 'Status pencairan komisi berhasil diperbarui.');
    }

    /**
     * Batch payout: Disburse ready-to-pay commissions for an agent or selected commission IDs.
     */
    public function batchPayout(Request $request): RedirectResponse
    {
        $user = auth()->user();
        if (! in_array($user->role, ['owner_travel', 'admin_travel', 'super_admin_master'])) {
            abort(403, 'Unauthorized action.');
        }

        $tenantId = $user->getActiveTenantId();

        $validated = $request->validate([
            'agen_id' => 'nullable|integer|exists:users,id',
            'commission_ids' => 'nullable|array',
            'commission_ids.*' => 'integer|exists:komisi_agen,id',
            'nomor_referensi' => 'nullable|string|max:100',
            'metode_pembayaran' => 'nullable|string|max:100',
            'catatan_pencairan' => 'nullable|string|max:500',
        ]);

        $query = KomisiAgen::where('tenant_id', $tenantId)
            ->where('status_pencairan', 'Ready_to_Pay');

        if (! empty($validated['commission_ids'])) {
            $query->whereIn('id', $validated['commission_ids']);
        } elseif (! empty($validated['agen_id'])) {
            $query->where('agen_id', $validated['agen_id']);
        } else {
            return redirect()->back()->withErrors(['agen_id' => 'Harap pilih agen atau centang komisi yang ingin dicairkan.']);
        }

        $affected = $query->update([
            'status_pencairan' => 'Paid',
            'nomor_referensi' => $validated['nomor_referensi'] ?? 'BATCH-'.time(),
            'metode_pembayaran' => $validated['metode_pembayaran'] ?? 'Transfer Bank',
            'catatan_pencairan' => $validated['catatan_pencairan'] ?? null,
            'tanggal_pencairan' => Carbon::now(),
        ]);

        return redirect()->back()->with('success', "Berhasil mencairkan {$affected} item komisi.");
    }
}
