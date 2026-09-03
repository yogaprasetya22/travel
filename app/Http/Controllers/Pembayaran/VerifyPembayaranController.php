<?php

namespace App\Http\Controllers\Pembayaran;

use App\Http\Controllers\Controller;
use App\Models\Pembayaran;
use App\Models\User;
use App\Notifications\PaymentVerifiedNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

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

        if ($validated['status'] === 'Verified') {
            try {
                $jamaah = $pembayaran->jamaah;
                $formattedNominal = 'Rp '.number_format($pembayaran->nominal, 0, ',', '.');
                $notification = new PaymentVerifiedNotification(
                    pembayaran: $pembayaran,
                    jamaahName: $jamaah?->nama_lengkap ?? 'Jamaah',
                    nominalFormatted: $formattedNominal
                );

                // Notify Assigned Agent
                if ($jamaah?->agen) {
                    $jamaah->agen->notify($notification);
                }

                // Notify Tenant Owner / Admins
                $admins = User::where('tenant_id', $pembayaran->tenant_id)
                    ->whereIn('role', ['tenant_owner', 'super_admin', 'admin', 'owner_travel', 'admin_travel'])
                    ->where('id', '!=', auth()->id())
                    ->get();

                foreach ($admins as $admin) {
                    $admin->notify($notification);
                }
            } catch (\Throwable $e) {
                Log::warning('Payment verification broadcast error: '.$e->getMessage());
            }
        }

        return redirect()->back();
    }
}
