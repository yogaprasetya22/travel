<?php

namespace App\Notifications;

use App\Models\Jamaah;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class JamaahRegisteredNotification extends Notification implements ShouldBroadcastNow
{
    use Queueable;

    public function __construct(
        public Jamaah $jamaah,
        public string $source = 'website',
        public ?string $agentName = null
    ) {}

    public function via(object $notifiable): array
    {
        return ['database', 'broadcast'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'jamaah_registered',
            'title' => 'Pendaftaran Jamaah Baru',
            'message' => "Jamaah {$this->jamaah->nama_lengkap} telah mendaftar".($this->agentName ? " melalui Agen {$this->agentName}" : ' via Website'),
            'jamaah_id' => $this->jamaah->id,
            'nama_lengkap' => $this->jamaah->nama_lengkap,
            'no_hp' => $this->jamaah->no_hp,
            'paket_id' => $this->jamaah->paket_id,
            'tenant_id' => $this->jamaah->tenant_id,
            'agent_name' => $this->agentName,
            'created_at' => now()->toISOString(),
        ];
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage($this->toArray($notifiable));
    }
}
