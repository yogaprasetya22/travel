<?php

namespace App\Http\Controllers\CRM;

use App\Http\Controllers\Controller;
use App\Models\Jamaah;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DepartureScheduleController extends Controller
{
    /**
     * Display departure schedule and group manifest with server-side pagination and search.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $tenantId = $user->tenant_id;
        $search = $request->input('search');
        $statusFilter = $request->input('status', 'ALL'); // ALL, SCHEDULED, UNSCHEDULED
        $perPage = (int) $request->input('per_page', 15);

        $baseQuery = Jamaah::where('jamaah.tenant_id', $tenantId)
            ->whereHas('pembayaran', function ($q) {
                $q->where('status_verifikasi', 'Verified');
            });

        if ($user->role === 'agen') {
            $baseQuery->where('jamaah.agen_id', $user->id);
        }

        // Summary metrics
        $allLeads = (clone $baseQuery)->get(['id', 'tanggal_keberangkatan', 'nomor_paspor']);
        $totalScheduled = $allLeads->filter(fn ($j) => ! empty($j->tanggal_keberangkatan))->count();
        $totalUnscheduled = $allLeads->filter(fn ($j) => empty($j->tanggal_keberangkatan))->count();
        $totalPassportReady = $allLeads->filter(fn ($j) => ! empty($j->nomor_paspor))->count();

        // Query with search
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

        // Paginated Table Data
        $paginatedJamaah = (clone $query)
            ->with([
                'paket:id,nama_paket,harga',
                'agen:id,name,email',
            ])
            ->orderByRaw('jamaah.tanggal_keberangkatan IS NULL, jamaah.tanggal_keberangkatan ASC')
            ->latest('jamaah.created_at')
            ->paginate($perPage)
            ->withQueryString();

        // Kloter Groups (ambil 200 data terdekat untuk visualisasi kartu rombongan)
        $kloterRecords = (clone $query)
            ->with(['paket:id,nama_paket', 'agen:id,name'])
            ->orderByRaw('jamaah.tanggal_keberangkatan IS NULL, jamaah.tanggal_keberangkatan ASC')
            ->take(200)
            ->get();

        $schedules = $kloterRecords->groupBy(function ($j) {
            return $j->tanggal_keberangkatan ? $j->tanggal_keberangkatan : 'Belum Ditentukan';
        });

        return Inertia::render('CRM/DepartureSchedule', [
            'schedules' => $schedules,
            'paginatedJamaah' => $paginatedJamaah,
            'metrics' => [
                'total_closing' => $allLeads->count(),
                'total_scheduled' => $totalScheduled,
                'total_unscheduled' => $totalUnscheduled,
                'total_passport_ready' => $totalPassportReady,
            ],
            'filters' => [
                'search' => $search ?? '',
                'status' => $statusFilter,
                'per_page' => $perPage,
            ],
        ]);
    }
}
