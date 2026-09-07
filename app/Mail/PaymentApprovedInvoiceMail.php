<?php

namespace App\Mail;

use App\Models\Pembayaran;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PaymentApprovedInvoiceMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(public Pembayaran $pembayaran) {}

    public function envelope(): Envelope
    {
        $jamaah = $this->pembayaran->jamaah;
        $tenantName = $this->pembayaran->tenant?->nama_travel ?? 'Travel Umroh';

        return new Envelope(
            subject: "[Invoice Resmi #INV-{$this->pembayaran->id}] Pembayaran Disetujui - {$tenantName}",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.payment_approved_invoice',
            with: [
                'pembayaran' => $this->pembayaran,
                'jamaah' => $this->pembayaran->jamaah,
                'paket' => $this->pembayaran->jamaah?->paket,
                'tenant' => $this->pembayaran->tenant,
            ]
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
