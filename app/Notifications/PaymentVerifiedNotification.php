<?php

namespace App\Notifications;

use App\Models\Pembayaran;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class PaymentVerifiedNotification extends Notification implements ShouldBroadcastNow
{
    use Queueable;

    public function __construct(
        public Pembayaran $pembayaran,
        public string $jamaahName,
        public string $nominalFormatted
    ) {}

    public function via(object $notifiable): array
    {
        return ['database', 'broadcast'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'payment_verified',
            'title' => 'Pembayaran Terverifikasi',
            'message' => "Pembayaran {$this->pembayaran->jenis_pembayaran} sebesar {$this->nominalFormatted} a.n {$this->jamaahName} telah diverifikasi.",
            'pembayaran_id' => $this->pembayaran->id,
            'jamaah_id' => $this->pembayaran->jamaah_id,
            'nominal' => $this->pembayaran->nominal,
            'tenant_id' => $this->pembayaran->tenant_id,
            'status' => $this->pembayaran->status,
            'created_at' => now()->toISOString(),
        ];
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage($this->toArray($notifiable));
    }
}
