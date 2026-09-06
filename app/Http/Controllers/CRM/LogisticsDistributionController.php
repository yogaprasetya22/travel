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
            ->where(function ($q) {
                $q->whereHas('inventarisTransaksi', function ($tq) {
                    $tq->where('tipe', 'OUT');
                })
                    ->orWhereHas('pembayaran')
                    ->orWhereHas('crmStage', function ($sq) {
                        $sq->where('nama_tahap', 'ilike', '%closing%')
                            ->orWhere('nama_tahap', 'ilike', '%won%')
                            ->orWhere('nama_tahap', 'ilike', '%selesai%');
                    });
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
            $status = $request->input('status');
            if ($status === 'Ready_to_Pickup') {
                $query->whereIn('status_logistik', ['Pending', 'Ready_to_Pickup']);
            } else {
                $query->where('status_logistik', $status);
            }
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
        $user = $request->user();
        if ($user->role !== 'super_admin_master' && $jamaah->tenant_id !== $user->getActiveTenantId()) {
            abort(403, 'Aksi tidak diizinkan.');
        }

        if ($user->role === 'agen' && $jamaah->agen_id !== $user->id) {
            abort(403, 'Anda hanya dapat melakukan serah terima untuk jamaah binaan Anda sendiri.');
        }

        $jamaah->update([
            'status_logistik' => 'Handed_Over',
            'tanggal_serah_terima_logistik' => now(),
        ]);

        return redirect()->back()->with('success', 'Perlengkapan berhasil diserahterimakan kepada jamaah.');
    }
}
