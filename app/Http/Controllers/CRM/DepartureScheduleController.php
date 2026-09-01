<?php

namespace App\Http\Controllers\CRM;

use App\Http\Controllers\Controller;
use App\Models\Jamaah;
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
        $tenantId = $user->tenant_id;
        $search = $request->input('search');
        $statusFilter = $request->input('status', 'ALL'); // ALL, SCHEDULED, UNSCHEDULED
        $periodFilter = $request->input('period', 'ALL'); // ALL or 'YYYY-MM'
        $perPage = (int) $request->input('per_page', 15);

        $baseQuery = Jamaah::where('jamaah.tenant_id', $tenantId)
            ->whereHas('pembayaran', function ($q) {
                $q->where('status_verifikasi', 'Verified');
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

        // Group schedules per departure date from current paginated page
        $schedules = $paginatedJamaah->getCollection()->groupBy(function ($j) {
            return $j->tanggal_keberangkatan ? $j->tanggal_keberangkatan : 'Belum Ditentukan';
        });

        return Inertia::render('CRM/DepartureSchedule', [
            'schedules' => $schedules,
            'paginatedJamaah' => $paginatedJamaah,
            'availablePeriods' => $availablePeriods,
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
        if ($user->role !== 'super_admin_master' && $jamaah->tenant_id !== $user->tenant_id) {
            abort(403, 'Aksi tidak diizinkan.');
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
