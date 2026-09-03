<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class CommissionEarnedNotification extends Notification implements ShouldBroadcastNow
{
    use Queueable;

    public function __construct(
        public float|int $nominal,
        public string $nominalFormatted,
        public string $jamaahName,
        public int $tenantId
    ) {}

    public function via(object $notifiable): array
    {
        return ['database', 'broadcast'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'commission_earned',
            'title' => 'Komisi Agen Baru!',
            'message' => "Selamat! Anda mendapatkan komisi sebesar {$this->nominalFormatted} dari pendaftaran jamaah {$this->jamaahName}.",
            'nominal' => $this->nominal,
            'jamaah_name' => $this->jamaahName,
            'tenant_id' => $this->tenantId,
            'created_at' => now()->toISOString(),
        ];
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage($this->toArray($notifiable));
    }
}
