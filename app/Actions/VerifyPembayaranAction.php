<?php

namespace App\Actions;

use App\Models\Pembayaran;

class VerifyPembayaranAction
{
    /**
     * Execute the action to verify payment and trigger status updates.
     */
    public function execute(Pembayaran $pembayaran, int $verifiedByUserId): void
    {
        $pembayaran->update([
            'status_verifikasi' => 'Verified',
            'verified_by' => $verifiedByUserId,
        ]);
    }
}
