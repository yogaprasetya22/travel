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
     * Show main dashboard with CRM, Logistics, and Commission stats.
     */
    public function __invoke(Request $request): Response
    {
        $user = $request->user();
        $tenantId = $user->getActiveTenantId();

        // 1. Leads and Jamaah metrics
        $leadsQuery = Jamaah::where('tenant_id', $tenantId);
        if ($user->role === 'agen') {
            $leadsQuery->where('agen_id', $user->id);
        }
        $totalLeads = $leadsQuery->count();

        // 2. Closing / Verified DP metrics
        $closingQuery = Jamaah::where('tenant_id', $tenantId)
            ->whereHas('pembayaran', function ($q) {
                $q->where('status_verifikasi', 'Verified');
            });
        if ($user->role === 'agen') {
            $closingQuery->where('agen_id', $user->id);
        }
        $closingCount = $closingQuery->count();

        // 3. Logistics Ready metrics (Jamaah whose inventory has been deducted)
        $logisticsReadyQuery = Jamaah::where('tenant_id', $tenantId)
            ->whereHas('inventarisTransaksi', function ($q) {
                $q->where('tipe', 'OUT');
            })
            ->with(['paket', 'agen', 'inventarisTransaksi.inventaris']);
        if ($user->role === 'agen') {
            $logisticsReadyQuery->where('agen_id', $user->id);
        }
        $logisticsReadyList = $logisticsReadyQuery->latest()->take(6)->get();
        $logisticsReadyCount = $logisticsReadyQuery->count();

        // 4. Commission metrics
        $commissionQuery = KomisiAgen::where('tenant_id', $tenantId);
        if ($user->role === 'agen') {
            $commissionQuery->where('agen_id', $user->id);
        }
        $totalCommission = (float) $commissionQuery->sum('nominal_komisi');
        $paidCommission = (float) $commissionQuery->where('status_pencairan', 'Paid')->sum('nominal_komisi');
        $readyCommission = (float) $commissionQuery->where('status_pencairan', 'Ready_to_Pay')->sum('nominal_komisi');

        // 5. Recent pending payment verification (for admin/owner)
        $pendingPayments = [];
        if (in_array($user->role, ['owner_travel', 'admin_travel', 'super_admin_master'])) {
            $pendingPayments = Pembayaran::where('tenant_id', $tenantId)
                ->where('status_verifikasi', 'Pending')
                ->with(['jamaah.paket', 'jamaah.agen', 'rekeningTenant'])
                ->latest()
                ->take(5)
                ->get();
        }

        // 6. Analytics: Omzet By Tenant (Multi-Tenant comparison for Super Admin)
        $omzetByTenant = [];
        if ($user->role === 'super_admin_master') {
            $tenants = Tenant::all();
            foreach ($tenants as $t) {
                $omzet = (float) Pembayaran::where('tenant_id', $t->id)
                    ->where('status_verifikasi', 'Verified')
                    ->sum('nominal');
                $omzetByTenant[] = [
                    'tenant_id' => $t->id,
                    'nama_travel' => $t->nama_travel,
                    'omzet' => $omzet,
                    'jamaah_count' => Jamaah::where('tenant_id', $t->id)->count(),
                ];
            }
        }

        // 7. Analytics: 6-Month Monthly Trend (Omzet & Leads)
        $monthlyTrend = [];
        for ($i = 5; $i >= 0; $i--) {
            $date = Carbon::now()->subMonths($i);
            $monthOmzet = (float) Pembayaran::where('tenant_id', $tenantId)
                ->where('status_verifikasi', 'Verified')
                ->whereYear('created_at', $date->year)
                ->whereMonth('created_at', $date->month)
                ->sum('nominal');

            $monthLeads = Jamaah::where('tenant_id', $tenantId)
                ->whereYear('created_at', $date->year)
                ->whereMonth('created_at', $date->month)
                ->count();

            $monthlyTrend[] = [
                'month' => $date->translatedFormat('M Y'),
                'omzet' => $monthOmzet,
                'leads' => $monthLeads,
            ];
        }

        // 8. Analytics: Package Distribution
        $packageDistribution = Paket::where('tenant_id', $tenantId)
            ->withCount('jamaah')
            ->orderByDesc('jamaah_count')
            ->get()
            ->map(function ($p) {
                return [
                    'name' => $p->nama_paket,
                    'value' => (int) $p->jamaah_count,
                    'harga' => (float) $p->harga,
                ];
            });

        // 9. Analytics: CRM Funnel
        $crmFunnel = CrmStage::where('tenant_id', $tenantId)
            ->withCount('jamaah')
            ->orderBy('urutan')
            ->get()
            ->map(function ($s) {
                return [
                    'stage' => $s->nama_tahap,
                    'count' => (int) $s->jamaah_count,
                    'urutan' => (int) $s->urutan,
                ];
            });

        // 10. Analytics: Top 5 Agents Leaderboard
        $topAgents = User::where('tenant_id', $tenantId)
            ->where('role', 'agen')
            ->withCount(['jamaah as closing_count' => function ($q) {
                $q->whereHas('pembayaran', function ($qp) {
                    $qp->where('status_verifikasi', 'Verified');
                });
            }])
            ->withSum('komisi as total_komisi', 'nominal_komisi')
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
            'stats' => [
                'total_leads' => $totalLeads,
                'closing_count' => $closingCount,
                'logistics_ready_count' => $logisticsReadyCount,
                'total_commission' => $totalCommission,
                'paid_commission' => $paidCommission,
                'ready_commission' => $readyCommission,
            ],
            'analytics' => [
                'omzet_by_tenant' => $omzetByTenant,
                'monthly_trend' => $monthlyTrend,
                'package_distribution' => $packageDistribution,
                'crm_funnel' => $crmFunnel,
                'top_agents' => $topAgents,
            ],
            'logisticsReadyList' => $logisticsReadyList,
            'pendingPayments' => $pendingPayments,
        ]);
    }
}
