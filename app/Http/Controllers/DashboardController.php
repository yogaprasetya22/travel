<?php

namespace App\Http\Controllers;

use App\Models\Jamaah;
use App\Models\KomisiAgen;
use App\Models\Pembayaran;
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
        $tenantId = $user->tenant_id;

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

        return Inertia::render('Dashboard', [
            'stats' => [
                'total_leads' => $totalLeads,
                'closing_count' => $closingCount,
                'logistics_ready_count' => $logisticsReadyCount,
                'total_commission' => $totalCommission,
                'paid_commission' => $paidCommission,
                'ready_commission' => $readyCommission,
            ],
            'logisticsReadyList' => $logisticsReadyList,
            'pendingPayments' => $pendingPayments,
        ]);
    }
}
