<?php

namespace App\Http\Controllers\CRM;

use App\Http\Controllers\Controller;
use App\Models\Jamaah;
use App\Models\Pembayaran;
use App\Models\RekeningTenant;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CustomerController extends Controller
{
    /**
     * Display list of official/closing customers with payment & commission info, KPI metrics, and filters.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $tenantId = $user->getActiveTenantId();
        $search = $request->input('search');
        $statusFilter = $request->input('status', 'ALL'); // ALL, LUNAS, CICILAN
        $docFilter = $request->input('doc', 'ALL'); // ALL, PASSPORT_READY, PASSPORT_PENDING
        $perPage = (int) $request->input('per_page', 15);

        $baseQuery = Jamaah::where('jamaah.tenant_id', $tenantId)
            ->whereHas('pembayaran', function ($q) {
                $q->where('status_verifikasi', 'Verified');
            });

        if ($user->role === 'agen') {
            $baseQuery->where('jamaah.agen_id', $user->id);
        } elseif ($user->role === 'admin_travel') {
            $subordinateAgentIds = User::where('created_by', $user->id)
                ->where('role', 'agen')
                ->pluck('id')
                ->toArray();
            $baseQuery->whereIn('jamaah.agen_id', $subordinateAgentIds);
        }

        // Calculate Overall Financial KPI Metrics for Closing Customers
        $allClosingJamaah = (clone $baseQuery)
            ->with(['paket:id,harga', 'pembayaran' => function ($pq) {
                $pq->where('status_verifikasi', 'Verified');
            }, 'komisiAgen'])
            ->get();

        $totalCustomers = $allClosingJamaah->count();
        $totalRevenueTarget = $allClosingJamaah->sum(fn ($j) => (float) ($j->paket->harga ?? 0));
        $totalPaidReceived = $allClosingJamaah->sum(fn ($j) => (float) $j->pembayaran->sum('nominal'));
        $totalPendingReceivables = max(0, $totalRevenueTarget - $totalPaidReceived);
        $totalCommissionPayable = $allClosingJamaah->sum(fn ($j) => (float) $j->komisiAgen->sum('nominal_komisi'));
        $lunasCount = $allClosingJamaah->filter(fn ($j) => $j->pembayaran->sum('nominal') >= ($j->paket->harga ?? 0))->count();

        // Apply Search
        $query = clone $baseQuery;
        if (! empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('jamaah.nama_lengkap', 'ilike', "%{$search}%")
                    ->orWhere('jamaah.no_hp', 'ilike', "%{$search}%")
                    ->orWhere('jamaah.nomor_paspor', 'ilike', "%{$search}%")
                    ->orWhere('jamaah.email', 'ilike', "%{$search}%")
                    ->orWhereHas('paket', function ($pq) use ($search) {
                        $pq->where('paket.nama_paket', 'ilike', "%{$search}%");
                    })
                    ->orWhereHas('agen', function ($aq) use ($search) {
                        $aq->where('users.name', 'ilike', "%{$search}%");
                    });
            });
        }

        // Apply Document Filter
        if ($docFilter === 'PASSPORT_READY') {
            $query->whereNotNull('jamaah.nomor_paspor')->where('jamaah.nomor_paspor', '!=', '');
        } elseif ($docFilter === 'PASSPORT_PENDING') {
            $query->where(function ($q) {
                $q->whereNull('jamaah.nomor_paspor')->orWhere('jamaah.nomor_paspor', '');
            });
        }

        $customers = $query->with([
            'paket:id,nama_paket,harga',
            'agen:id,name,email',
            'pembayaran' => function ($q) {
                $q->where('status_verifikasi', 'Verified')->orderBy('created_at', 'asc');
            },
            'komisiAgen',
            'inventarisTransaksi.inventaris',
        ])
            ->latest('jamaah.created_at')
            ->paginate($perPage)
            ->withQueryString();

        $banks = RekeningTenant::where('tenant_id', $tenantId)
            ->where('is_active', true)
            ->get(['id', 'nama_bank', 'nomor_rekening', 'atas_nama']);

        return Inertia::render('CRM/CustomerList', [
            'customers' => $customers,
            'banks' => $banks,
            'metrics' => [
                'total_customers' => $totalCustomers,
                'total_paid_received' => $totalPaidReceived,
                'total_pending_receivables' => $totalPendingReceivables,
                'total_commission_payable' => $totalCommissionPayable,
                'lunas_count' => $lunasCount,
            ],
            'filters' => [
                'search' => $search ?? '',
                'status' => $statusFilter,
                'doc' => $docFilter,
                'per_page' => $perPage,
            ],
        ]);
    }

    /**
     * Update customer complete profile (biodata, passport, departure date, notes).
     */
    public function update(Request $request, Jamaah $jamaah): RedirectResponse
    {
        $validated = $request->validate([
            'nama_lengkap' => ['required', 'string', 'max:255'],
            'nik' => ['nullable', 'string', 'max:20'],
            'no_hp' => ['required', 'string', 'max:25'],
            'email' => ['nullable', 'email', 'max:255'],
            'nomor_paspor' => ['nullable', 'string', 'max:50'],
            'tanggal_keberangkatan' => ['nullable', 'date'],
            'catatan_admin' => ['nullable', 'string', 'max:1000'],
        ]);

        $jamaah->update($validated);

        return redirect()->back()->with('success', 'Data lengkap nasabah berhasil diperbarui.');
    }

    /**
     * Record settlement or installment payment directly from Customer CRM drawer.
     */
    public function recordPayment(Request $request, Jamaah $jamaah): RedirectResponse
    {
        $validated = $request->validate([
            'nominal' => ['required', 'numeric', 'min:10000'],
            'tipe_pembayaran' => ['required', 'string', 'in:Cicilan,Pelunasan,DP,Tambahan'],
            'rekening_tenant_id' => ['required', 'exists:rekening_tenant,id'],
            'bukti_transfer' => ['nullable', 'file', 'image', 'max:4096'],
        ]);

        $buktiPath = null;
        if ($request->hasFile('bukti_transfer')) {
            $buktiPath = $request->file('bukti_transfer')->store('bukti_transfer', 'public');
        }

        Pembayaran::create([
            'tenant_id' => $request->user()->tenant_id,
            'jamaah_id' => $jamaah->id,
            'rekening_tenant_id' => $validated['rekening_tenant_id'],
            'tipe_pembayaran' => $validated['tipe_pembayaran'],
            'nominal' => $validated['nominal'],
            'bukti_transfer' => $buktiPath,
            'status_verifikasi' => 'Verified', // Auto-verified when entered by authorized staff/admin
            'verified_by' => $request->user()->id,
        ]);

        return redirect()->back()->with('success', 'Transaksi pembayaran berhasil dicatat dan diverifikasi.');
    }
}
