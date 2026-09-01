<?php

namespace App\Http\Controllers\CRM;

use App\Http\Controllers\Controller;
use App\Models\Jamaah;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LogisticsDistributionController extends Controller
{
    /**
     * Display logistics distribution and handover list.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $tenantId = $user->getActiveTenantId();

        $query = Jamaah::where('tenant_id', $tenantId)
            ->whereHas('inventarisTransaksi', function ($q) {
                $q->where('tipe', 'OUT');
            })
            ->with(['paket', 'agen', 'inventarisTransaksi.inventaris', 'crmStage', 'pembayaran']);

        if ($user->role === 'agen') {
            $query->where('agen_id', $user->id);
        }

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('nama_lengkap', 'ilike', "%{$search}%")
                    ->orWhere('no_hp', 'like', "%{$search}%")
                    ->orWhereHas('agen', function ($aq) use ($search) {
                        $aq->where('name', 'ilike', "%{$search}%");
                    });
            });
        }

        if ($request->filled('status') && $request->input('status') !== 'ALL') {
            $query->where('status_logistik', $request->input('status'));
        }

        $perPage = (int) $request->input('per_page', 15);
        $logisticsList = $query->latest()->paginate($perPage)->withQueryString();

        return Inertia::render('CRM/LogisticsDistribution', [
            'logisticsList' => $logisticsList,
            'filters' => [
                'search' => $request->input('search', ''),
                'status' => $request->input('status', 'ALL'),
                'per_page' => $perPage,
            ],
        ]);
    }

    /**
     * Mark logistics package as handed over.
     */
    public function handover(Request $request, Jamaah $jamaah): RedirectResponse
    {
        $jamaah->update([
            'status_logistik' => 'Handed_Over',
            'tanggal_serah_terima_logistik' => now(),
        ]);

        return redirect()->back()->with('success', 'Perlengkapan berhasil diserahterimakan kepada jamaah/agen.');
    }
}
