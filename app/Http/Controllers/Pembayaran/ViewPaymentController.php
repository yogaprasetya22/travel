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

        $payments = Pembayaran::with(['jamaah.paket', 'rekeningTenant', 'verifiedBy'])
            ->orderByDesc('created_at')
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('Pembayaran/VerifyList', [
            'payments' => $payments,
        ]);
    }
}
