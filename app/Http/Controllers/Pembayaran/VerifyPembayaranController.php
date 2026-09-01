<?php

namespace App\Http\Controllers\Pembayaran;

use App\Http\Controllers\Controller;
use App\Models\Pembayaran;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class VerifyPembayaranController extends Controller
{
    /**
     * Handle verification trigger.
     */
    public function __invoke(Request $request, Pembayaran $pembayaran): RedirectResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'in:Verified,Rejected'],
        ]);

        $pembayaran->update([
            'status_verifikasi' => $validated['status'],
            'verified_by' => auth()->id(),
        ]);

        return redirect()->back();
    }
}
