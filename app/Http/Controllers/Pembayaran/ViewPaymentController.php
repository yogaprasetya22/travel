<?php

namespace App\Http\Controllers\Pembayaran;

use App\Http\Controllers\Controller;
use App\Models\Pembayaran;
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

        $payments = Pembayaran::with(['jamaah.paket', 'rekeningTenant', 'verifiedBy'])
            ->when($search, function ($query, $search) {
                $query->whereHas('jamaah', function ($q) use ($search) {
                    $q->where('nama_lengkap', 'ilike', '%' . $search . '%');
                });
            })
            ->orderByDesc('created_at')
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('Pembayaran/VerifyList', [
            'payments' => $payments,
        ]);
    }
}
