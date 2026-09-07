<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice Pembayaran</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 24px; }
        .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
        .header { background: #0f766e; color: #ffffff; padding: 24px; text-align: center; }
        .header h1 { margin: 0 0 6px; font-size: 20px; font-weight: 700; }
        .header p { margin: 0; font-size: 14px; opacity: 0.9; }
        .content { padding: 24px; }
        .invoice-box { background: #f1f5f9; border-radius: 8px; padding: 16px; margin: 16px 0; }
        .invoice-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; }
        .invoice-row:last-child { margin-bottom: 0; }
        .invoice-row.total { font-size: 16px; font-weight: bold; border-top: 1px solid #cbd5e1; padding-top: 8px; margin-top: 8px; color: #0f766e; }
        .badge { display: inline-block; background: #dcfce7; color: #15803d; font-size: 12px; font-weight: bold; padding: 4px 10px; border-radius: 9999px; }
        .footer { text-align: center; font-size: 12px; color: #64748b; padding: 16px 24px 24px; border-top: 1px solid #f1f5f9; }
    </style>
</head>
<body>
    <div class="card">
        <div class="header">
            <h1>{{ $tenant?->nama_travel ?? 'Travel Umroh & Haji' }}</h1>
            <p>Tanda Terima & Konfirmasi Pembayaran Resmi</p>
        </div>
        <div class="content">
            <p>Assalamu'alaikum Wr. Wb. <strong>{{ $jamaah?->nama_lengkap }}</strong>,</p>
            <p>Alhamdulillah, pembayaran Anda telah berhasil kami terima dan verifikasi dengan rincian berikut:</p>

            <div class="invoice-box">
                <div class="invoice-row">
                    <span>Nomor Transaksi:</span>
                    <strong>#INV-{{ str_pad($pembayaran->id, 6, '0', STR_PAD_LEFT) }}</strong>
                </div>
                <div class="invoice-row">
                    <span>Paket Umroh:</span>
                    <strong>{{ $paket?->nama_paket ?? '-' }}</strong>
                </div>
                <div class="invoice-row">
                    <span>Tipe Pembayaran:</span>
                    <strong>{{ $pembayaran->tipe_pembayaran }}</strong>
                </div>
                <div class="invoice-row">
                    <span>Status:</span>
                    <span class="badge">TERVERIFIKASI</span>
                </div>
                <div class="invoice-row total">
                    <span>Nominal Dibayarkan:</span>
                    <span>Rp {{ number_format($pembayaran->nominal, 0, ',', '.') }}</span>
                </div>
            </div>

            <p style="font-size: 13px; color: #475569; line-height: 1.6;">
                Semoga Allah SWT memudahkan segala persiapan perjalanan ibadah Anda menuju Tanah Suci dan menjadikannya ibadah yang mabrur. Aamiin.
            </p>
        </div>
        <div class="footer">
            <p>&copy; {{ date('Y') }} {{ $tenant?->nama_travel ?? 'Travel Umroh' }}. Seluruh hak cipta dilindungi.</p>
        </div>
    </div>
</body>
</html>
