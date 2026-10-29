<?php

namespace App\Http\Controllers\CRM;

use App\Http\Controllers\Controller;
use App\Models\Jamaah;
use App\Models\Paket;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class DepartureScheduleController extends Controller
{
    /**
     * Display departure schedule and group manifest with server-side pagination, period filters, and search.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $tenantId = $user->getActiveTenantId();
        $search = $request->input('search');
        $statusFilter = $request->input('status', 'ALL'); // ALL, SCHEDULED, UNSCHEDULED
        $periodFilter = $request->input('period', 'ALL'); // ALL or 'YYYY-MM'
        $docFilter = $request->input('doc', 'ALL'); // ALL, PASSPORT_READY, PASSPORT_PENDING
        $paketFilter = $request->input('paket_id', 'ALL');
        $paymentStatusFilter = $request->input('payment_status', 'ALL'); // ALL, LUNAS, BELUM_LUNAS
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

        if ($user->role === 'agen') {
            $baseQuery->where('jamaah.agen_id', $user->id);
        }

        // Distinct departure periods for dynamic filter dropdown
        $departureDates = (clone $baseQuery)
            ->whereNotNull('jamaah.tanggal_keberangkatan')
            ->pluck('tanggal_keberangkatan');

        $availablePeriods = $departureDates
            ->map(function ($date) {
                try {
                    $c = Carbon::parse($date);

                    return [
                        'key' => $c->format('Y-m'),
                        'label' => $c->translatedFormat('F Y'),
                    ];
                } catch (\Exception $e) {
                    return null;
                }
            })
            ->filter()
            ->unique('key')
            ->values()
            ->all();

        // Summary metrics
        $allLeads = (clone $baseQuery)->get(['id', 'tanggal_keberangkatan', 'nomor_paspor']);
        $totalScheduled = $allLeads->filter(fn ($j) => ! empty($j->tanggal_keberangkatan))->count();
        $totalUnscheduled = $allLeads->filter(fn ($j) => empty($j->tanggal_keberangkatan))->count();
        $totalPassportReady = $allLeads->filter(fn ($j) => ! empty($j->nomor_paspor))->count();

        // Query with search and filters
        $query = clone $baseQuery;
        if (! empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('jamaah.nama_lengkap', 'ilike', "%{$search}%")
                    ->orWhere('jamaah.no_hp', 'ilike', "%{$search}%")
                    ->orWhere('jamaah.nomor_paspor', 'ilike', "%{$search}%")
                    ->orWhereHas('paket', function ($pq) use ($search) {
                        $pq->where('paket.nama_paket', 'ilike', "%{$search}%");
                    })
                    ->orWhereHas('agen', function ($aq) use ($search) {
                        $aq->where('users.name', 'ilike', "%{$search}%");
                    });
            });
        }

        if ($statusFilter === 'SCHEDULED') {
            $query->whereNotNull('jamaah.tanggal_keberangkatan');
        } elseif ($statusFilter === 'UNSCHEDULED') {
            $query->whereNull('jamaah.tanggal_keberangkatan');
        }

        if ($periodFilter !== 'ALL' && ! empty($periodFilter)) {
            $query->where('jamaah.tanggal_keberangkatan', 'like', "{$periodFilter}%");
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

        // Apply Payment Status Filter
        if ($paymentStatusFilter === 'LUNAS') {
            $query->whereRaw('(SELECT COALESCE(SUM(nominal), 0) FROM pembayaran WHERE pembayaran.jamaah_id = jamaah.id AND pembayaran.status_verifikasi = \'Verified\') >= (SELECT COALESCE(harga, 0) FROM paket WHERE paket.id = jamaah.paket_id) AND (SELECT COALESCE(harga, 0) FROM paket WHERE paket.id = jamaah.paket_id) > 0');
        } elseif ($paymentStatusFilter === 'BELUM_LUNAS') {
            $query->whereRaw('(SELECT COALESCE(SUM(nominal), 0) FROM pembayaran WHERE pembayaran.jamaah_id = jamaah.id AND pembayaran.status_verifikasi = \'Verified\') < (SELECT COALESCE(harga, 0) FROM paket WHERE paket.id = jamaah.paket_id)');
        }

        // Paginated Table Data
        $paginatedJamaah = (clone $query)
            ->with([
                'paket:id,nama_paket,harga',
                'agen:id,name,email',
                'crmStage:id,nama_tahap',
                'pembayaran',
                'inventarisTransaksi.inventaris',
            ])
            ->orderByRaw('jamaah.tanggal_keberangkatan IS NULL, jamaah.tanggal_keberangkatan ASC')
            ->latest('jamaah.created_at')
            ->paginate($perPage)
            ->withQueryString();

        // Kloter Groups
        $kloterRecords = (clone $query)
            ->with([
                'paket:id,nama_paket,harga',
                'agen:id,name,email',
                'crmStage:id,nama_tahap',
                'pembayaran',
                'inventarisTransaksi.inventaris',
            ])
            ->orderByRaw('jamaah.tanggal_keberangkatan IS NULL, jamaah.tanggal_keberangkatan ASC')
            ->take(300)
            ->get();

        $schedules = $kloterRecords->groupBy(function ($j) {
            return ! empty($j->tanggal_keberangkatan)
                ? Carbon::parse($j->tanggal_keberangkatan)->format('Y-m-d')
                : 'Belum Ditentukan';
        });

        $pakets = Paket::where('tenant_id', $tenantId)
            ->where('is_active', true)
            ->orderBy('nama_paket')
            ->get(['id', 'nama_paket', 'harga']);

        return Inertia::render('CRM/DepartureSchedule', [
            'schedules' => $schedules,
            'paginatedJamaah' => $paginatedJamaah,
            'availablePeriods' => $availablePeriods,
            'pakets' => $pakets,
            'metrics' => [
                'total_closing' => $allLeads->count(),
                'total_scheduled' => $totalScheduled,
                'total_unscheduled' => $totalUnscheduled,
                'total_passport_ready' => $totalPassportReady,
            ],
            'filters' => [
                'search' => $search ?? '',
                'status' => $statusFilter,
                'period' => $periodFilter,
                'doc' => $docFilter,
                'paket_id' => $paketFilter,
                'payment_status' => $paymentStatusFilter,
                'per_page' => $perPage,
            ],
        ]);
    }

    /**
     * Update departure schedule for a jamaah.
     */
    public function updateDeparture(Request $request, Jamaah $jamaah): RedirectResponse
    {
        $user = $request->user();
        if ($user->role !== 'super_admin_master' && $jamaah->tenant_id !== $user->getActiveTenantId()) {
            abort(403, 'Aksi tidak diizinkan.');
        }

        if ($user->role === 'agen' && $jamaah->agen_id !== $user->id) {
            abort(403, 'Anda hanya dapat mengatur jadwal keberangkatan untuk jamaah binaan Anda sendiri.');
        }

        $validated = $request->validate([
            'tanggal_keberangkatan' => ['nullable', 'date'],
        ]);

        $jamaah->update([
            'tanggal_keberangkatan' => $validated['tanggal_keberangkatan'] ?? null,
        ]);

        $statusMsg = ! empty($validated['tanggal_keberangkatan'])
            ? "Jadwal keberangkatan {$jamaah->nama_lengkap} berhasil diatur ke ".Carbon::parse($validated['tanggal_keberangkatan'])->translatedFormat('d F Y').'.'
            : "Jadwal keberangkatan {$jamaah->nama_lengkap} berhasil dikembalikan ke antrean belum terjadwal.";

        return redirect()->back()->with('success', $statusMsg);
    }
}
