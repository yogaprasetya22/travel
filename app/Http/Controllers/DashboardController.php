<?php

namespace App\Http\Controllers;

use App\Models\CrmStage;
use App\Models\Jamaah;
use App\Models\KomisiAgen;
use App\Models\Paket;
use App\Models\Pembayaran;
use App\Models\Tenant;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Show main dashboard with focused Active Tenant CRM, Omzet Analytics, Logistics, and Commission stats.
     */
    public function __invoke(Request $request): Response
    {
        $user = $request->user();
        $tenantId = $user->getActiveTenantId();
        $tenant = Tenant::find($tenantId) ?? Tenant::oldest('id')->first();

        // Parameter filter periode & kloter (Ponytail: simple, direct query filtering)
        $period = $request->input('period', 'this_year');
        $customStart = $request->input('start_date');
        $customEnd = $request->input('end_date');
        $kloterYm = $request->input('kloter_ym');

        $startDate = null;
        $endDate = null;

        if ($period === 'this_year') {
            $startDate = Carbon::now()->startOfYear();
            $endDate = Carbon::now()->endOfYear();
        } elseif ($period === 'last_year') {
            $startDate = Carbon::now()->subYear()->startOfYear();
            $endDate = Carbon::now()->subYear()->endOfYear();
        } elseif ($period === 'this_month') {
            $startDate = Carbon::now()->startOfMonth();
            $endDate = Carbon::now()->endOfMonth();
        } elseif ($period === 'custom' && $customStart && $customEnd) {
            $startDate = Carbon::parse($customStart)->startOfDay();
            $endDate = Carbon::parse($customEnd)->endOfDay();
        }

        // Available Kloters for filter dropdown
        $availableKloters = Jamaah::where('tenant_id', $tenantId)
            ->whereNotNull('tanggal_keberangkatan')
            ->selectRaw("TO_CHAR(tanggal_keberangkatan, 'YYYY-MM') as ym")
            ->distinct()
            ->orderByDesc('ym')
            ->pluck('ym')
            ->map(function ($ym) {
                try {
                    $date = Carbon::createFromFormat('Y-m', $ym);

                    return [
                        'value' => $ym,
                        'label' => 'Kloter '.$date->translatedFormat('F Y'),
                    ];
                } catch (\Exception $e) {
                    return [
                        'value' => $ym,
                        'label' => 'Kloter '.$ym,
                    ];
                }
            })
            ->values();

        // 1. Leads and Jamaah metrics
        $leadsQuery = Jamaah::where('tenant_id', $tenantId);
        if ($startDate && $endDate) {
            $leadsQuery->whereBetween('created_at', [$startDate, $endDate]);
        }
        if ($kloterYm) {
            $leadsQuery->whereRaw("TO_CHAR(tanggal_keberangkatan, 'YYYY-MM') = ?", [$kloterYm]);
        }
        if ($user->role === 'agen') {
            $leadsQuery->where('agen_id', $user->id);
        }
        $totalLeads = $leadsQuery->count();

        // 2. Closing / Verified DP metrics
        $closingQuery = Jamaah::where('tenant_id', $tenantId)
            ->whereHas('pembayaran', function ($q) use ($startDate, $endDate) {
                $q->where('status_verifikasi', 'Verified');
                if ($startDate && $endDate) {
                    $q->whereBetween('created_at', [$startDate, $endDate]);
                }
            });
        if ($kloterYm) {
            $closingQuery->whereRaw("TO_CHAR(tanggal_keberangkatan, 'YYYY-MM') = ?", [$kloterYm]);
        }
        if ($user->role === 'agen') {
            $closingQuery->where('agen_id', $user->id);
        }
        $closingCount = $closingQuery->count();

        // 3. Total Omzet of Active Tenant
        $omzetQuery = Pembayaran::where('tenant_id', $tenantId)
            ->where('status_verifikasi', 'Verified');
        if ($startDate && $endDate) {
            $omzetQuery->whereBetween('created_at', [$startDate, $endDate]);
        }
        if ($kloterYm) {
            $omzetQuery->whereHas('jamaah', function ($q) use ($kloterYm) {
                $q->whereRaw("TO_CHAR(tanggal_keberangkatan, 'YYYY-MM') = ?", [$kloterYm]);
            });
        }
        if ($user->role === 'agen') {
            $omzetQuery->whereHas('jamaah', function ($q) use ($user) {
                $q->where('agen_id', $user->id);
            });
        }
        $totalOmzet = (float) $omzetQuery->sum('nominal');

        // 4. Logistics Ready metrics (Jamaah whose inventory has been deducted)
        $logisticsReadyQuery = Jamaah::where('tenant_id', $tenantId)
            ->whereHas('inventarisTransaksi', function ($q) {
                $q->where('tipe', 'OUT');
            })
            ->with(['paket', 'agen', 'inventarisTransaksi.inventaris']);
        if ($startDate && $endDate) {
            $logisticsReadyQuery->whereBetween('created_at', [$startDate, $endDate]);
        }
        if ($kloterYm) {
            $logisticsReadyQuery->whereRaw("TO_CHAR(tanggal_keberangkatan, 'YYYY-MM') = ?", [$kloterYm]);
        }
        if ($user->role === 'agen') {
            $logisticsReadyQuery->where('agen_id', $user->id);
        }
        $logisticsReadyList = (clone $logisticsReadyQuery)->latest()->take(6)->get();
        $logisticsReadyCount = $logisticsReadyQuery->count();

        // 5. Commission metrics
        $commissionQuery = KomisiAgen::where('tenant_id', $tenantId);
        if ($startDate && $endDate) {
            $commissionQuery->whereBetween('created_at', [$startDate, $endDate]);
        }
        if ($kloterYm) {
            $commissionQuery->whereHas('jamaah', function ($q) use ($kloterYm) {
                $q->whereRaw("TO_CHAR(tanggal_keberangkatan, 'YYYY-MM') = ?", [$kloterYm]);
            });
        }
        if ($user->role === 'agen') {
            $commissionQuery->where('agen_id', $user->id);
        }
        $totalCommission = (float) (clone $commissionQuery)->sum('nominal_komisi');
        $paidCommission = (float) (clone $commissionQuery)->where('status_pencairan', 'Paid')->sum('nominal_komisi');
        $readyCommission = (float) (clone $commissionQuery)->where('status_pencairan', 'Ready_to_Pay')->sum('nominal_komisi');

        // 6. Recent pending payment verification (for admin/owner/superadmin)
        $pendingPayments = [];
        if (in_array($user->role, ['owner_travel', 'admin_travel', 'super_admin_master'])) {
            $pendingPayments = Pembayaran::where('tenant_id', $tenantId)
                ->where('status_verifikasi', 'Pending')
                ->with(['jamaah.paket', 'jamaah.agen', 'rekeningTenant'])
                ->latest()
                ->take(5)
                ->get();
        }

        // 7. Analytics: Monthly Trend (Dynamically adapt to chosen period)
        $monthlyTrend = [];
        $monthsToDisplay = [];
        if ($period === 'this_year') {
            for ($m = 1; $m <= 12; $m++) {
                $monthsToDisplay[] = Carbon::create(Carbon::now()->year, $m, 1);
            }
        } elseif ($period === 'last_year') {
            for ($m = 1; $m <= 12; $m++) {
                $monthsToDisplay[] = Carbon::create(Carbon::now()->year - 1, $m, 1);
            }
        } elseif ($startDate && $endDate) {
            $cursor = $startDate->copy()->startOfMonth();
            while ($cursor <= $endDate && count($monthsToDisplay) < 24) {
                $monthsToDisplay[] = $cursor->copy();
                $cursor->addMonth();
            }
        } else {
            // Default 6 months
            for ($i = 5; $i >= 0; $i--) {
                $monthsToDisplay[] = Carbon::now()->subMonths($i)->startOfMonth();
            }
        }

        foreach ($monthsToDisplay as $date) {
            $monthOmzetQuery = Pembayaran::where('tenant_id', $tenantId)
                ->where('status_verifikasi', 'Verified')
                ->whereYear('created_at', $date->year)
                ->whereMonth('created_at', $date->month);
            if ($kloterYm) {
                $monthOmzetQuery->whereHas('jamaah', function ($q) use ($kloterYm) {
                    $q->whereRaw("TO_CHAR(tanggal_keberangkatan, 'YYYY-MM') = ?", [$kloterYm]);
                });
            }
            if ($user->role === 'agen') {
                $monthOmzetQuery->whereHas('jamaah', function ($q) use ($user) {
                    $q->where('agen_id', $user->id);
                });
            }
            $monthOmzet = (float) $monthOmzetQuery->sum('nominal');

            $monthLeadsQuery = Jamaah::where('tenant_id', $tenantId)
                ->whereYear('created_at', $date->year)
                ->whereMonth('created_at', $date->month);
            if ($kloterYm) {
                $monthLeadsQuery->whereRaw("TO_CHAR(tanggal_keberangkatan, 'YYYY-MM') = ?", [$kloterYm]);
            }
            if ($user->role === 'agen') {
                $monthLeadsQuery->where('agen_id', $user->id);
            }
            $monthLeads = $monthLeadsQuery->count();

            $monthClosingQuery = Jamaah::where('tenant_id', $tenantId)
                ->whereHas('pembayaran', function ($q) use ($date) {
                    $q->where('status_verifikasi', 'Verified')
                        ->whereYear('created_at', $date->year)
                        ->whereMonth('created_at', $date->month);
                });
            if ($kloterYm) {
                $monthClosingQuery->whereRaw("TO_CHAR(tanggal_keberangkatan, 'YYYY-MM') = ?", [$kloterYm]);
            }
            if ($user->role === 'agen') {
                $monthClosingQuery->where('agen_id', $user->id);
            }
            $monthClosing = $monthClosingQuery->count();

            $monthlyTrend[] = [
                'month' => $date->translatedFormat('M Y'),
                'omzet' => $monthOmzet,
                'closing' => $monthClosing,
                'leads' => $monthLeads,
            ];
        }

        // 8. Analytics: Omzet By Package
        $packages = Paket::where('tenant_id', $tenantId)->get();
        $omzetByPackage = [];
        foreach ($packages as $pkg) {
            $pkgOmzetQuery = Pembayaran::where('tenant_id', $tenantId)
                ->where('status_verifikasi', 'Verified')
                ->whereHas('jamaah', function ($q) use ($pkg, $kloterYm) {
                    $q->where('paket_id', $pkg->id);
                    if ($kloterYm) {
                        $q->whereRaw("TO_CHAR(tanggal_keberangkatan, 'YYYY-MM') = ?", [$kloterYm]);
                    }
                });
            if ($startDate && $endDate) {
                $pkgOmzetQuery->whereBetween('created_at', [$startDate, $endDate]);
            }
            if ($user->role === 'agen') {
                $pkgOmzetQuery->whereHas('jamaah', function ($q) use ($user) {
                    $q->where('agen_id', $user->id);
                });
            }
            $pkgOmzet = (float) $pkgOmzetQuery->sum('nominal');

            $pkgJamaahQuery = Jamaah::where('tenant_id', $tenantId)
                ->where('paket_id', $pkg->id);
            if ($startDate && $endDate) {
                $pkgJamaahQuery->whereBetween('created_at', [$startDate, $endDate]);
            }
            if ($kloterYm) {
                $pkgJamaahQuery->whereRaw("TO_CHAR(tanggal_keberangkatan, 'YYYY-MM') = ?", [$kloterYm]);
            }
            if ($user->role === 'agen') {
                $pkgJamaahQuery->where('agen_id', $user->id);
            }
            $pkgJamaah = $pkgJamaahQuery->count();

            $omzetByPackage[] = [
                'name' => $pkg->nama_paket,
                'omzet' => $pkgOmzet,
                'jamaah_count' => $pkgJamaah,
                'harga' => (float) $pkg->harga,
            ];
        }

        // 9. Analytics: Omzet By Kloter Keberangkatan
        $departureMonthsQuery = Jamaah::where('tenant_id', $tenantId)
            ->whereNotNull('tanggal_keberangkatan');
        if ($startDate && $endDate) {
            $departureMonthsQuery->whereBetween('tanggal_keberangkatan', [$startDate, $endDate]);
        }
        $departureMonths = $departureMonthsQuery->selectRaw("TO_CHAR(tanggal_keberangkatan, 'YYYY-MM') as ym")
            ->distinct()
            ->orderBy('ym')
            ->take(12)
            ->pluck('ym');

        $omzetByKloter = [];
        foreach ($departureMonths as $ym) {
            try {
                $date = Carbon::createFromFormat('Y-m', $ym);
                $kloterLabel = 'Kloter '.$date->translatedFormat('M Y');
            } catch (\Exception $e) {
                $kloterLabel = 'Kloter '.$ym;
            }

            $kloterOmzetQuery = Pembayaran::where('tenant_id', $tenantId)
                ->where('status_verifikasi', 'Verified')
                ->whereHas('jamaah', function ($q) use ($ym) {
                    $q->whereRaw("TO_CHAR(tanggal_keberangkatan, 'YYYY-MM') = ?", [$ym]);
                });
            if ($user->role === 'agen') {
                $kloterOmzetQuery->whereHas('jamaah', function ($q) use ($user) {
                    $q->where('agen_id', $user->id);
                });
            }
            $kloterOmzet = (float) $kloterOmzetQuery->sum('nominal');

            $kloterJamaahQuery = Jamaah::where('tenant_id', $tenantId)
                ->whereRaw("TO_CHAR(tanggal_keberangkatan, 'YYYY-MM') = ?", [$ym]);
            if ($user->role === 'agen') {
                $kloterJamaahQuery->where('agen_id', $user->id);
            }
            $kloterJamaah = $kloterJamaahQuery->count();

            $omzetByKloter[] = [
                'kloter' => $kloterLabel,
                'omzet' => $kloterOmzet,
                'jamaah_count' => $kloterJamaah,
            ];
        }

        // 10. Analytics: Package Distribution (Donut)
        $packageDistribution = Paket::where('tenant_id', $tenantId)
            ->withCount(['jamaah' => function ($q) use ($startDate, $endDate, $kloterYm, $user) {
                if ($startDate && $endDate) {
                    $q->whereBetween('created_at', [$startDate, $endDate]);
                }
                if ($kloterYm) {
                    $q->whereRaw("TO_CHAR(tanggal_keberangkatan, 'YYYY-MM') = ?", [$kloterYm]);
                }
                if ($user->role === 'agen') {
                    $q->where('agen_id', $user->id);
                }
            }])
            ->orderByDesc('jamaah_count')
            ->get()
            ->map(function ($p) {
                return [
                    'name' => $p->nama_paket,
                    'value' => (int) $p->jamaah_count,
                    'harga' => (float) $p->harga,
                ];
            });

        // 11. Analytics: CRM Funnel
        $crmFunnel = CrmStage::where('tenant_id', $tenantId)
            ->withCount(['jamaah' => function ($q) use ($startDate, $endDate, $kloterYm, $user) {
                if ($startDate && $endDate) {
                    $q->whereBetween('created_at', [$startDate, $endDate]);
                }
                if ($kloterYm) {
                    $q->whereRaw("TO_CHAR(tanggal_keberangkatan, 'YYYY-MM') = ?", [$kloterYm]);
                }
                if ($user->role === 'agen') {
                    $q->where('agen_id', $user->id);
                }
            }])
            ->orderBy('urutan')
            ->get()
            ->map(function ($s) {
                return [
                    'stage' => $s->nama_tahap,
                    'count' => (int) $s->jamaah_count,
                    'urutan' => (int) $s->urutan,
                ];
            });

        // 12. Analytics: Top 5 Agents Leaderboard
        $topAgents = User::where('tenant_id', $tenantId)
            ->where('role', 'agen')
            ->withCount(['jamaah as closing_count' => function ($q) use ($startDate, $endDate, $kloterYm) {
                if ($startDate && $endDate) {
                    $q->whereBetween('created_at', [$startDate, $endDate]);
                }
                if ($kloterYm) {
                    $q->whereRaw("TO_CHAR(tanggal_keberangkatan, 'YYYY-MM') = ?", [$kloterYm]);
                }
                $q->whereHas('pembayaran', function ($qp) {
                    $qp->where('status_verifikasi', 'Verified');
                });
            }])
            ->withSum(['komisi as total_komisi' => function ($q) use ($startDate, $endDate) {
                if ($startDate && $endDate) {
                    $q->whereBetween('created_at', [$startDate, $endDate]);
                }
            }], 'nominal_komisi')
            ->orderByDesc('closing_count')
            ->take(5)
            ->get()
            ->map(function ($a) {
                return [
                    'id' => $a->id,
                    'name' => $a->name,
                    'email' => $a->email,
                    'closing_count' => (int) ($a->closing_count ?? 0),
                    'total_komisi' => (float) ($a->total_komisi ?? 0),
                ];
            });

        return Inertia::render('Dashboard', [
            'tenant' => [
                'id' => $tenant?->id,
                'nama_travel' => $tenant?->nama_travel ?? 'Travel Active',
                'domain_atau_subdomain' => $tenant?->domain_atau_subdomain ?? 'app',
            ],
            'filters' => [
                'period' => $period,
                'start_date' => $customStart,
                'end_date' => $customEnd,
                'kloter_ym' => $kloterYm,
            ],
            'availableKloters' => $availableKloters,
            'stats' => [
                'total_leads' => $totalLeads,
                'closing_count' => $closingCount,
                'total_omzet' => $totalOmzet,
                'logistics_ready_count' => $logisticsReadyCount,
                'total_commission' => $totalCommission,
                'paid_commission' => $paidCommission,
                'ready_commission' => $readyCommission,
            ],
            'analytics' => [
                'monthly_trend' => $monthlyTrend,
                'omzet_by_package' => $omzetByPackage,
                'omzet_by_kloter' => $omzetByKloter,
                'package_distribution' => $packageDistribution,
                'crm_funnel' => $crmFunnel,
                'top_agents' => $topAgents,
            ],
            'logisticsReadyList' => $logisticsReadyList,
            'pendingPayments' => $pendingPayments,
        ]);
    }
}
