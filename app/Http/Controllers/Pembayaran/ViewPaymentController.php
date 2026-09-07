<?php

namespace App\Http\Controllers\Pembayaran;

use App\Http\Controllers\Controller;
use App\Models\Paket;
use App\Models\Pembayaran;
use App\Models\RekeningTenant;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ViewPaymentController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request): Response
    {
        $perPage = (int) $request->input('per_page', 15);
        $search = $request->input('search');
        $status = $request->input('status');
        $rekeningId = $request->input('rekening_id');
        $tipe = $request->input('tipe_pembayaran');
        $paketId = $request->input('paket_id');
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');

        $query = Pembayaran::with(['jamaah.paket', 'rekeningTenant', 'verifiedBy'])
            ->when($search, function ($q, $search) {
                $q->where(function ($sub) use ($search) {
                    $sub->whereHas('jamaah', function ($j) use ($search) {
                        $j->where('nama_lengkap', 'ilike', '%'.$search.'%')
                            ->orWhere('nik', 'ilike', '%'.$search.'%')
                            ->orWhere('no_hp', 'ilike', '%'.$search.'%');
                    });
                    if (is_numeric($search)) {
                        $sub->orWhere('id', (int) $search);
                    }
                });
            })
            ->when($status && $status !== 'all', function ($q) use ($status) {
                $q->whereRaw('LOWER(status_verifikasi) = ?', [strtolower($status)]);
            })
            ->when($rekeningId && $rekeningId !== 'all', function ($q) use ($rekeningId) {
                $q->where('rekening_tenant_id', $rekeningId);
            })
            ->when($tipe && $tipe !== 'all', function ($q) use ($tipe) {
                $q->where('tipe_pembayaran', $tipe);
            })
            ->when($paketId && $paketId !== 'all', function ($q) use ($paketId) {
                $q->whereHas('jamaah', function ($j) use ($paketId) {
                    $j->where('paket_id', $paketId);
                });
            })
            ->when($startDate, function ($q) use ($startDate) {
                $q->whereDate('created_at', '>=', $startDate);
            })
            ->when($endDate, function ($q) use ($endDate) {
                $q->whereDate('created_at', '<=', $endDate);
            });

        $payments = (clone $query)
            ->orderByDesc('created_at')
            ->paginate($perPage)
            ->withQueryString();

        // Calculate KPI Statistics
        $stats = [
            'total_verified_nominal' => (float) Pembayaran::whereRaw('LOWER(status_verifikasi) = ?', ['verified'])->sum('nominal'),
            'total_pending_nominal' => (float) Pembayaran::whereRaw('LOWER(status_verifikasi) = ?', ['pending'])->sum('nominal'),
            'pending_count' => Pembayaran::whereRaw('LOWER(status_verifikasi) = ?', ['pending'])->count(),
            'verified_count' => Pembayaran::whereRaw('LOWER(status_verifikasi) = ?', ['verified'])->count(),
            'rejected_count' => Pembayaran::whereRaw('LOWER(status_verifikasi) = ?', ['rejected'])->count(),
            'total_count' => Pembayaran::count(),
        ];

        $banks = RekeningTenant::where('is_active', true)
            ->orderBy('nama_bank')
            ->get(['id', 'nama_bank', 'nomor_rekening', 'atas_nama']);

        $packages = Paket::orderBy('nama_paket')
            ->get(['id', 'nama_paket', 'harga']);

        return Inertia::render('Pembayaran/VerifyList', [
            'payments' => $payments,
            'banks' => $banks,
            'packages' => $packages,
            'stats' => $stats,
            'filters' => [
                'search' => $search ?? '',
                'status' => $status ?? 'all',
                'rekening_id' => $rekeningId ?? 'all',
                'tipe_pembayaran' => $tipe ?? 'all',
                'paket_id' => $paketId ?? 'all',
                'start_date' => $startDate ?? '',
                'end_date' => $endDate ?? '',
                'per_page' => $perPage,
            ],
        ]);
    }
}
