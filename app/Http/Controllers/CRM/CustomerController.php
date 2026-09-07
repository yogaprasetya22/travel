<?php

namespace App\Http\Controllers\CRM;

use App\Http\Controllers\Controller;
use App\Models\DocumentPermission;
use App\Models\Jamaah;
use App\Models\JamaahDocument;
use App\Models\Paket;
use App\Models\Pembayaran;
use App\Models\RekeningTenant;
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
        $statusFilter = $request->input('status', 'ALL'); // ALL, LUNAS, BELUM_LUNAS, DP_PENDING, DP, CICILAN, UNPAID
        $docFilter = $request->input('doc', 'ALL'); // ALL, PASSPORT_READY, PASSPORT_PENDING
        $paketFilter = $request->input('paket_id', 'ALL');
        $scheduleFilter = $request->input('schedule', 'ALL'); // ALL, SCHEDULED, UNSCHEDULED
        $dateType = $request->input('date_type', 'created_at'); // created_at, keberangkatan
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');
        $perPage = (int) $request->input('per_page', 15);

        $baseQuery = Jamaah::where('jamaah.tenant_id', $tenantId)
            ->where(function ($q) {
                $q->whereHas('pembayaran')
                    ->orWhereHas('crmStage', function ($sq) {
                        $sq->where('nama_tahap', 'ilike', '%closing%')
                            ->orWhere('nama_tahap', 'ilike', '%won%')
                            ->orWhere('nama_tahap', 'ilike', '%selesai%');
                    });
            });

        // Leader Staff and Agent Hierarchy Scope:
        if ($user->role === 'agen') {
            $baseQuery->where('jamaah.agen_id', $user->id);
        } elseif ($user->level > 1) {
            $allowedAgentIds = array_unique(array_merge([$user->id], $user->getDownlineUserIds()));
            $baseQuery->whereIn('jamaah.agen_id', $allowedAgentIds);
        }

        // Calculate Overall Financial KPI Metrics for Closing Customers
        $allClosingJamaah = (clone $baseQuery)
            ->with(['paket:id,harga', 'pembayaran', 'komisiAgen'])
            ->get();

        $totalCustomers = $allClosingJamaah->count();
        $totalRevenueTarget = $allClosingJamaah->sum(fn ($j) => (float) ($j->paket->harga ?? 0));
        $totalPaidReceived = $allClosingJamaah->sum(fn ($j) => (float) $j->pembayaran->where('status_verifikasi', 'Verified')->sum('nominal'));
        $totalPendingReceivables = max(0, $totalRevenueTarget - $totalPaidReceived);
        $totalCommissionPayable = $allClosingJamaah->sum(fn ($j) => (float) $j->komisiAgen->sum('nominal_komisi'));
        $lunasCount = $allClosingJamaah->filter(fn ($j) => $j->pembayaran->where('status_verifikasi', 'Verified')->sum('nominal') >= ($j->paket->harga ?? 0) && ($j->paket->harga ?? 0) > 0)->count();

        // Apply Search
        $query = clone $baseQuery;
        if (! empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('jamaah.nama_lengkap', 'ilike', "%{$search}%")
                    ->orWhere('jamaah.no_hp', 'ilike', "%{$search}%")
                    ->orWhere('jamaah.nik', 'ilike', "%{$search}%")
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

        // Apply Date Range Filter (Pendaftaran vs Keberangkatan)
        if ($startDate || $endDate) {
            $query->filterDateRange($dateType, $startDate, $endDate);
        }

        // Apply Payment / Progress Filter
        if ($statusFilter === 'LUNAS') {
            $query->whereRaw('(SELECT COALESCE(SUM(nominal), 0) FROM pembayaran WHERE pembayaran.jamaah_id = jamaah.id AND pembayaran.status_verifikasi = \'Verified\') >= (SELECT COALESCE(harga, 0) FROM paket WHERE paket.id = jamaah.paket_id) AND (SELECT COALESCE(harga, 0) FROM paket WHERE paket.id = jamaah.paket_id) > 0');
        } elseif ($statusFilter === 'BELUM_LUNAS') {
            $query->whereRaw('(SELECT COALESCE(SUM(nominal), 0) FROM pembayaran WHERE pembayaran.jamaah_id = jamaah.id AND pembayaran.status_verifikasi = \'Verified\') < (SELECT COALESCE(harga, 0) FROM paket WHERE paket.id = jamaah.paket_id)');
        } elseif ($statusFilter === 'DP') {
            $query->whereHas('pembayaran', function ($pq) {
                $pq->where('status_verifikasi', 'Verified')->where('tipe_pembayaran', 'DP');
            })->whereDoesntHave('pembayaran', function ($pq) {
                $pq->where('status_verifikasi', 'Verified')->whereIn('tipe_pembayaran', ['Cicilan', 'Lunas']);
            });
        } elseif ($statusFilter === 'CICILAN') {
            $query->whereHas('pembayaran', function ($pq) {
                $pq->where('status_verifikasi', 'Verified')->where('tipe_pembayaran', 'Cicilan');
            });
        } elseif ($statusFilter === 'UNPAID') {
            $query->whereDoesntHave('pembayaran', function ($pq) {
                $pq->where('status_verifikasi', 'Verified');
            });
        } elseif ($statusFilter === 'DP_PENDING') {
            $query->whereHas('pembayaran', function ($pq) {
                $pq->where('status_verifikasi', 'Pending');
            });
        }

        // Apply Document / Paspor Filter
        if ($docFilter === 'PASSPORT_READY') {
            $query->whereNotNull('jamaah.nomor_paspor')->where('jamaah.nomor_paspor', '!=', '');
        } elseif ($docFilter === 'PASSPORT_PENDING') {
            $query->where(function ($q) {
                $q->whereNull('jamaah.nomor_paspor')->orWhere('jamaah.nomor_paspor', '');
            });
        }

        // Apply Package Filter
        if (! empty($paketFilter) && $paketFilter !== 'ALL') {
            $query->where('jamaah.paket_id', $paketFilter);
        }

        // Apply Schedule Filter
        if ($scheduleFilter === 'SCHEDULED') {
            $query->whereNotNull('jamaah.tanggal_keberangkatan');
        } elseif ($scheduleFilter === 'UNSCHEDULED') {
            $query->whereNull('jamaah.tanggal_keberangkatan');
        }

        $customers = $query->with([
            'paket:id,nama_paket,harga,kuota',
            'agen:id,name,email',
            'pembayaran' => function ($q) {
                $q->orderBy('created_at', 'asc');
            },
            'documents.uploader:id,name',
            'itemDistributions.inventaris',
            'komisiAgen',
            'inventarisTransaksi.inventaris',
            'stageLogs.fromStage',
            'stageLogs.toStage',
            'stageLogs.user',
        ])
            ->latest('jamaah.created_at')
            ->paginate($perPage)
            ->withQueryString();

        $banks = RekeningTenant::where('tenant_id', $tenantId)
            ->where('is_active', true)
            ->get(['id', 'nama_bank', 'nomor_rekening', 'atas_nama']);

        $pakets = Paket::where('tenant_id', $tenantId)
            ->where('is_active', true)
            ->orderBy('nama_paket')
            ->get(['id', 'nama_paket', 'harga', 'kuota']);

        $documentPermissions = DocumentPermission::where('tenant_id', $tenantId)
            ->where('role_name', $user->role ?? 'staff')
            ->get();

        return Inertia::render('CRM/CustomerList', [
            'customers' => $customers,
            'banks' => $banks,
            'pakets' => $pakets,
            'documentPermissions' => $documentPermissions,
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
                'paket_id' => $paketFilter,
                'schedule' => $scheduleFilter,
                'date_type' => $dateType,
                'start_date' => $startDate ?? '',
                'end_date' => $endDate ?? '',
                'per_page' => $perPage,
            ],
        ]);
    }

    /**
     * Update customer complete profile (biodata, personal details, passport, departure date, emergency contacts, notes, and documents).
     */
    public function update(Request $request, Jamaah $jamaah): RedirectResponse
    {
        $validated = $request->validate([
            'nama_lengkap' => ['required', 'string', 'max:255'],
            'jenis_kelamin' => ['nullable', 'string', 'in:L,P,Laki-laki,Perempuan'],
            'tempat_lahir' => ['nullable', 'string', 'max:100'],
            'tanggal_lahir' => ['nullable', 'date'],
            'nik' => ['nullable', 'string', 'max:20'],
            'alamat_ktp' => ['nullable', 'string', 'max:500'],
            'alamat_domisili' => ['nullable', 'string', 'max:500'],
            'golongan_darah' => ['nullable', 'string', 'max:10'],
            'status_pernikahan' => ['nullable', 'string', 'max:30'],
            'riwayat_penyakit' => ['nullable', 'string', 'max:500'],
            'kontak_darurat_nama' => ['nullable', 'string', 'max:255'],
            'kontak_darurat_hp' => ['nullable', 'string', 'max:30'],
            'kontak_darurat_hubungan' => ['nullable', 'string', 'max:50'],
            'no_hp' => ['required', 'string', 'max:25'],
            'email' => ['nullable', 'email', 'max:255'],
            'nomor_paspor' => ['nullable', 'string', 'max:50'],
            'tanggal_keberangkatan' => ['nullable', 'date'],
            'catatan_admin' => ['nullable', 'string', 'max:1000'],
            'doc_files' => ['nullable', 'array'],
            'doc_files.*' => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp,pdf', 'max:10240'],
        ]);

        $jamaahData = collect($validated)->except(['doc_files'])->toArray();
        $jamaah->update($jamaahData);

        if ($request->hasFile('doc_files')) {
            $tenantId = $jamaah->tenant_id;
            $userId = $request->user()->id;

            foreach ($request->file('doc_files') as $type => $file) {
                if ($file && $file->isValid()) {
                    $filename = time().'_'.preg_replace('/[^a-zA-Z0-9._-]/', '', $file->getClientOriginalName());
                    $path = $file->storeAs("tenants/{$tenantId}/jamaah/{$jamaah->id}/documents", $filename, 'public');

                    JamaahDocument::create([
                        'tenant_id' => $tenantId,
                        'jamaah_id' => $jamaah->id,
                        'type' => $type,
                        'title' => strtoupper($type).' - '.$jamaah->nama_lengkap,
                        'file_path' => $path,
                        'file_name' => $file->getClientOriginalName(),
                        'mime_type' => $file->getClientMimeType(),
                        'file_size' => $file->getSize(),
                        'uploaded_by' => $userId,
                    ]);
                }
            }
        }

        return redirect()->back()->with('success', 'Data lengkap dan berkas nasabah berhasil diperbarui.');
    }

    /**
     * Record settlement or installment payment directly from Customer CRM drawer.
     */
    public function recordPayment(Request $request, Jamaah $jamaah): RedirectResponse
    {
        $validated = $request->validate([
            'nominal' => ['required', 'numeric', 'min:10000'],
            'tipe_pembayaran' => ['required', 'string', 'in:Cicilan,Pelunasan,DP,Tambahan,Lunas'],
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
