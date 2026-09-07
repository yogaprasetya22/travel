<?php

namespace App\Console\Commands;

use App\Models\CrmStage;
use App\Models\CrmStageLog;
use App\Models\Jamaah;
use App\Models\JamaahDocument;
use App\Models\Pembayaran;
use App\Models\RekeningTenant;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

class SeedCrmTestDataCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'crm:seed-test-data 
                            {--tenant= : Specific tenant ID or slug} 
                            {--jamaah= : Specific Jamaah ID or Full Name (e.g. 179 or "Eko Saputra 154")}
                            {--count=5 : Number of jamaah to populate per tenant if jamaah not specified}
                            {--all : Populate all jamaah in the tenant}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Seed comprehensive CRM test data (Stage progression logs, KTP/KK/Passport documents, and payments with proof)';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('🚀 Generating CRM Test Data: Stage Logs, Documents & Payments...');

        $jamaahOption = $this->option('jamaah');

        // If specific jamaah is requested directly by ID or Name
        if ($jamaahOption) {
            $jamaahQuery = Jamaah::query();
            if (is_numeric($jamaahOption)) {
                $jamaahQuery->where('id', (int) $jamaahOption);
            } else {
                $jamaahQuery->where('nama_lengkap', 'like', "%{$jamaahOption}%");
            }

            $targetJamaah = $jamaahQuery->get();
            if ($targetJamaah->isEmpty()) {
                $this->error("❌ Jamaah '{$jamaahOption}' not found.");

                return self::FAILURE;
            }

            $this->ensureSampleAssetsExist();

            foreach ($targetJamaah as $jamaah) {
                $tenant = Tenant::find($jamaah->tenant_id);
                if (! $tenant) {
                    continue;
                }

                $this->info("🎯 Targeting Specific Jamaah: <comment>{$jamaah->nama_lengkap}</comment> (ID: #{$jamaah->id}) - Tenant: {$tenant->name}");

                $this->fillSampleBiodataIfMissing($jamaah);

                $stages = CrmStage::where('tenant_id', $tenant->id)->orderBy('urutan')->get();
                $users = User::where('tenant_id', $tenant->id)->get();
                $defaultUser = $users->first() ?? User::first();
                $rekening = RekeningTenant::where('tenant_id', $tenant->id)->first();

                $this->seedStageLogsForJamaah($tenant, $jamaah, $stages, $users);
                $this->seedDocumentsForJamaah($tenant, $jamaah, $defaultUser);
                $this->seedPaymentsForJamaah($tenant, $jamaah, $rekening, $defaultUser);

                $this->info("   ✅ Data for <comment>{$jamaah->nama_lengkap} (#{$jamaah->id})</comment> successfully populated!");
            }

            $this->line('');
            $this->info("🎉 Done! Open: http://localhost:8000/crm/customers?customer_id={$targetJamaah->first()->id}&tab=view");

            return self::SUCCESS;
        }

        // Otherwise handle tenant-wide seeding
        $tenantQuery = Tenant::query();
        if ($tenantOption = $this->option('tenant')) {
            $tenantQuery->where('id', $tenantOption)->orWhere('slug', $tenantOption);
        }

        $tenants = $tenantQuery->get();

        if ($tenants->isEmpty()) {
            $this->error('❌ No tenants found. Please run database seeders first.');

            return self::FAILURE;
        }

        // Ensure storage directory and dummy sample files exist
        $this->ensureSampleAssetsExist();

        foreach ($tenants as $tenant) {
            $this->line('');
            $this->info("🏢 Processing Tenant: <comment>{$tenant->name}</comment> (ID: {$tenant->id})");

            $stages = CrmStage::where('tenant_id', $tenant->id)->orderBy('urutan')->get();
            if ($stages->isEmpty()) {
                $this->warn("   ⚠️ No CRM stages found for tenant {$tenant->name}. Skipping.");

                continue;
            }

            $users = User::where('tenant_id', $tenant->id)->get();
            $defaultUser = $users->first() ?? User::first();
            $rekening = RekeningTenant::where('tenant_id', $tenant->id)->first();

            $jamaahQuery = Jamaah::where('tenant_id', $tenant->id);
            if (! $this->option('all')) {
                $jamaahQuery->take((int) $this->option('count'));
            }
            $jamaahList = $jamaahQuery->get();

            if ($jamaahList->isEmpty()) {
                $this->warn("   ⚠️ No Jamaah found for tenant {$tenant->name}.");

                continue;
            }

            $seededCount = 0;
            foreach ($jamaahList as $jamaah) {
                $this->fillSampleBiodataIfMissing($jamaah);
                $this->seedStageLogsForJamaah($tenant, $jamaah, $stages, $users);
                $this->seedDocumentsForJamaah($tenant, $jamaah, $defaultUser);
                $this->seedPaymentsForJamaah($tenant, $jamaah, $rekening, $defaultUser);
                $seededCount++;
            }

            $this->info("   ✅ Successfully populated {$seededCount} jamaah records with rich stage logs, documents & payments.");
        }

        $this->line('');
        $this->info('🎉 All CRM test data successfully seeded! You can now test http://localhost:8000/crm and http://localhost:8000/crm/customers');

        return self::SUCCESS;
    }

    /**
     * Populate sample biodata if empty.
     */
    protected function fillSampleBiodataIfMissing(Jamaah $jamaah): void
    {
        $needsUpdate = false;
        $updates = [];

        if (empty($jamaah->jenis_kelamin)) {
            $updates['jenis_kelamin'] = 'L';
            $needsUpdate = true;
        }
        if (empty($jamaah->tempat_lahir)) {
            $updates['tempat_lahir'] = 'Surabaya';
            $needsUpdate = true;
        }
        if (empty($jamaah->tanggal_lahir)) {
            $updates['tanggal_lahir'] = '1988-06-15';
            $needsUpdate = true;
        }
        if (empty($jamaah->alamat_ktp)) {
            $updates['alamat_ktp'] = 'Jl. Raya Darmo No. 45, Wonokromo, Surabaya, Jawa Timur';
            $needsUpdate = true;
        }
        if (empty($jamaah->alamat_domisili)) {
            $updates['alamat_domisili'] = 'Jl. Raya Darmo No. 45, Wonokromo, Surabaya, Jawa Timur';
            $needsUpdate = true;
        }
        if (empty($jamaah->golongan_darah)) {
            $updates['golongan_darah'] = 'O';
            $needsUpdate = true;
        }
        if (empty($jamaah->status_pernikahan)) {
            $updates['status_pernikahan'] = 'Menikah';
            $needsUpdate = true;
        }
        if (empty($jamaah->nomor_paspor)) {
            $updates['nomor_paspor'] = 'X'.rand(1000000, 9999999);
            $needsUpdate = true;
        }
        if (empty($jamaah->tanggal_keberangkatan)) {
            $updates['tanggal_keberangkatan'] = now()->addMonths(2)->format('Y-m-d');
            $needsUpdate = true;
        }
        if (empty($jamaah->kontak_darurat_nama)) {
            $updates['kontak_darurat_nama'] = 'Siti Rahmawati (Istri)';
            $updates['kontak_darurat_hp'] = '081298765432';
            $updates['kontak_darurat_hubungan'] = 'Istri';
            $needsUpdate = true;
        }

        if ($needsUpdate) {
            $jamaah->update($updates);
        }
    }

    /**
     * Ensure dummy image and PDF files exist in public storage.
     */
    protected function ensureSampleAssetsExist(): void
    {
        Storage::disk('public')->makeDirectory('sample_docs');
        Storage::disk('public')->makeDirectory('bukti_transfer');

        $sampleKtpSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="380" viewBox="0 0 600 380">
            <rect width="600" height="380" rx="16" fill="#1e293b"/>
            <rect x="20" y="20" width="560" height="340" rx="12" fill="#0f172a" stroke="#334155" stroke-width="2"/>
            <rect x="40" y="50" width="120" height="150" rx="8" fill="#3b82f6"/>
            <circle cx="100" cy="100" r="35" fill="#e2e8f0"/>
            <path d="M60 170 C60 140 140 140 140 170 Z" fill="#e2e8f0"/>
            <text x="180" y="75" fill="#f8fafc" font-size="20" font-family="sans-serif" font-weight="bold">REPUBLIK INDONESIA</text>
            <text x="180" y="105" fill="#94a3b8" font-size="14" font-family="sans-serif">KARTU TANDA PENDUDUK (DUMMY)</text>
            <text x="180" y="145" fill="#38bdf8" font-size="16" font-family="monospace" font-weight="bold">NIK: 3201234567890001</text>
            <text x="180" y="175" fill="#e2e8f0" font-size="13" font-family="sans-serif">Nama: CALON JAMAAH TEST</text>
            <text x="180" y="200" fill="#e2e8f0" font-size="13" font-family="sans-serif">Tempat/Tgl Lahir: SURABAYA, 15-06-1988</text>
            <text x="180" y="225" fill="#e2e8f0" font-size="13" font-family="sans-serif">Alamat: JL. RAYA DARMO NO. 45</text>
            <rect x="40" y="280" width="520" height="40" rx="6" fill="#1e293b"/>
            <text x="55" y="305" fill="#22c55e" font-size="12" font-family="sans-serif">✓ DOKUMEN ASLI TELAH DIVERIFIKASI SISTEM TRAVEL</text>
        </svg>';

        $samplePassportSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
            <rect width="600" height="400" rx="16" fill="#064e3b"/>
            <rect x="20" y="20" width="560" height="360" rx="12" fill="#022c22" stroke="#059669" stroke-width="2"/>
            <text x="50" y="70" fill="#fde047" font-size="22" font-family="serif" font-weight="bold">PASPOR INDONESIA</text>
            <rect x="50" y="100" width="130" height="170" rx="8" fill="#10b981"/>
            <circle cx="115" cy="160" r="40" fill="#ecfdf5"/>
            <text x="210" y="125" fill="#a7f3d0" font-size="14" font-family="sans-serif">Nomor Paspor / Passport No.</text>
            <text x="210" y="150" fill="#ffffff" font-size="18" font-family="monospace" font-weight="bold">X9876543</text>
            <text x="210" y="185" fill="#a7f3d0" font-size="14" font-family="sans-serif">Masa Berlaku / Date of Expiry</text>
            <text x="210" y="210" fill="#ffffff" font-size="16" font-family="sans-serif" font-weight="bold">15 AUG 2034</text>
            <text x="210" y="245" fill="#a7f3d0" font-size="14" font-family="sans-serif">Kantor Penerbit / Issuing Office</text>
            <text x="210" y="270" fill="#ffffff" font-size="16" font-family="sans-serif">KANIM KELAS I JAKARTA SELATAN</text>
        </svg>';

        $sampleSlipSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="500" height="650" viewBox="0 0 500 650">
            <rect width="500" height="650" rx="16" fill="#ffffff"/>
            <rect x="0" y="0" width="500" height="100" fill="#4f46e5"/>
            <text x="30" y="60" fill="#ffffff" font-size="22" font-family="sans-serif" font-weight="bold">BUKTI TRANSFER BERHASIL</text>
            <text x="30" y="140" fill="#64748b" font-size="13" font-family="sans-serif">Nominal Transfer</text>
            <text x="30" y="180" fill="#0f172a" font-size="28" font-family="sans-serif" font-weight="bold">Rp 10.000.000</text>
            <line x1="30" y1="210" x2="470" y2="210" stroke="#e2e8f0" stroke-width="2"/>
            <text x="30" y="240" fill="#64748b" font-size="12">Dari Rekening</text>
            <text x="30" y="260" fill="#0f172a" font-size="14" font-weight="bold">BCA - 1234567890 (EKO SAPUTRA 154)</text>
            <text x="30" y="300" fill="#64748b" font-size="12">Rekening Tujuan</text>
            <text x="30" y="320" fill="#0f172a" font-size="14" font-weight="bold">MANDIRI - 9876543210 (TRAVEL UMROH)</text>
            <text x="30" y="360" fill="#64748b" font-size="12">Waktu Transaksi</text>
            <text x="30" y="380" fill="#0f172a" font-size="14">05 Sep 2026, 14:04 WIB</text>
            <text x="30" y="420" fill="#64748b" font-size="12">Nomor Referensi</text>
            <text x="30" y="440" fill="#4f46e5" font-size="14" font-family="monospace">TRX-20260905-00892</text>
            <rect x="30" y="490" width="440" height="90" rx="8" fill="#f8fafc" stroke="#e2e8f0"/>
            <text x="50" y="530" fill="#15803d" font-size="16" font-weight="bold">✓ TRANSAKSI SUKSES DIVERIFIKASI</text>
            <text x="50" y="555" fill="#64748b" font-size="12">Pembayaran uang muka cicilan paket umroh.</text>
        </svg>';

        Storage::disk('public')->put('sample_docs/sample_ktp.svg', $sampleKtpSvg);
        Storage::disk('public')->put('sample_docs/sample_paspor.svg', $samplePassportSvg);
        Storage::disk('public')->put('bukti_transfer/sample_slip.svg', $sampleSlipSvg);
    }

    /**
     * Seed chronological stage movement and follow-up notes.
     */
    protected function seedStageLogsForJamaah(Tenant $tenant, Jamaah $jamaah, $stages, $users): void
    {
        CrmStageLog::where('jamaah_id', $jamaah->id)->delete();

        $user1 = $users->first();
        $user2 = $users->count() > 1 ? $users->get(1) : $user1;

        $targetStageIndex = 0;
        foreach ($stages as $idx => $stg) {
            if ($stg->id === $jamaah->crm_stage_id) {
                $targetStageIndex = $idx;
                break;
            }
        }

        $time = now()->subDays(max(3, $targetStageIndex * 2 + 1));

        for ($i = 0; $i <= $targetStageIndex; $i++) {
            $fromStage = $i > 0 ? $stages[$i - 1] : null;
            $toStage = $stages[$i];

            $notes = match ($i) {
                0 => 'Calon jamaah masuk melalui form prospek website / landing page agen.',
                1 => 'Follow-up ke-1: Menghubungi via WhatsApp, jamaah tertarik paket 9 hari bintang 4 dan meminta rincian biaya.',
                2 => 'Follow-up ke-2: Jamaah mengirimkan foto KTP & KK untuk pengecekan ketersediaan seat penerbangan.',
                3 => 'Jamaah menyetujui jadwal keberangkatan dan melakukan pembayaran DP awal.',
                4 => 'Berkas paspor dan kelengkapan dokumen telah diverifikasi oleh tim operasional.',
                default => "Perpindahan tahap prospek menuju tahap {$toStage->nama_tahap}.",
            };

            CrmStageLog::create([
                'tenant_id' => $tenant->id,
                'jamaah_id' => $jamaah->id,
                'user_id' => ($i % 2 === 0 ? $user1?->id : $user2?->id),
                'from_stage_id' => $fromStage?->id,
                'to_stage_id' => $toStage->id,
                'catatan' => $notes,
                'created_at' => $time->copy(),
                'updated_at' => $time->copy(),
            ]);

            $time->addHours(rand(12, 36));
        }

        CrmStageLog::create([
            'tenant_id' => $tenant->id,
            'jamaah_id' => $jamaah->id,
            'user_id' => $user1?->id,
            'from_stage_id' => null,
            'to_stage_id' => $stages[$targetStageIndex]->id,
            'catatan' => 'Follow-up berkala: Mengingatkan jadwal pengumpulan paspor asli dan konfirmasi ukuran seragam batik.',
            'created_at' => now()->subHours(4),
            'updated_at' => now()->subHours(4),
        ]);
    }

    /**
     * Seed uploaded documents (KTP, KK, Paspor, etc.).
     */
    protected function seedDocumentsForJamaah(Tenant $tenant, Jamaah $jamaah, ?User $uploader): void
    {
        JamaahDocument::where('jamaah_id', $jamaah->id)->delete();

        $docs = [
            [
                'type' => 'ktp',
                'title' => 'KTP Elektronik Asli',
                'file_path' => 'sample_docs/sample_ktp.svg',
                'file_name' => 'ktp_elektronik_'.$jamaah->nik.'.svg',
                'mime_type' => 'image/svg+xml',
                'file_size' => 1024 * 120,
                'notes' => 'NIK 16 digit terverifikasi dengan data Disdukcapil.',
            ],
            [
                'type' => 'kk',
                'title' => 'Kartu Keluarga (KK)',
                'file_path' => 'sample_docs/sample_ktp.svg',
                'file_name' => 'kartu_keluarga_'.$jamaah->id.'.svg',
                'mime_type' => 'image/svg+xml',
                'file_size' => 1024 * 240,
                'notes' => 'Nomor KK dan susunan keluarga valid.',
            ],
            [
                'type' => 'paspor',
                'title' => 'Buku Paspor Republik Indonesia',
                'file_path' => 'sample_docs/sample_paspor.svg',
                'file_name' => 'paspor_'.($jamaah->nomor_paspor ?: 'X1234567').'.svg',
                'mime_type' => 'image/svg+xml',
                'file_size' => 1024 * 310,
                'notes' => 'Masa berlaku paspor lebih dari 8 bulan sebelum keberangkatan.',
            ],
        ];

        foreach ($docs as $d) {
            JamaahDocument::create([
                'tenant_id' => $tenant->id,
                'jamaah_id' => $jamaah->id,
                'type' => $d['type'],
                'title' => $d['title'],
                'file_path' => $d['file_path'],
                'file_name' => $d['file_name'],
                'mime_type' => $d['mime_type'],
                'file_size' => $d['file_size'],
                'notes' => $d['notes'],
                'uploaded_by' => $uploader?->id,
            ]);
        }
    }

    /**
     * Seed payments (DP, Cicilan, Pelunasan) with valid transfer slip.
     */
    protected function seedPaymentsForJamaah(Tenant $tenant, Jamaah $jamaah, ?RekeningTenant $rekening, ?User $verifier): void
    {
        Pembayaran::where('jamaah_id', $jamaah->id)->delete();

        // 1. DP Payment (Verified)
        Pembayaran::create([
            'tenant_id' => $tenant->id,
            'jamaah_id' => $jamaah->id,
            'rekening_tenant_id' => $rekening?->id,
            'tipe_pembayaran' => 'DP',
            'nominal' => 5000000,
            'bukti_transfer' => 'bukti_transfer/sample_slip.svg',
            'status_verifikasi' => 'Verified',
            'verified_by' => $verifier?->id,
            'created_at' => now()->subDays(5),
            'updated_at' => now()->subDays(5),
        ]);

        // 2. Installment Payment
        Pembayaran::create([
            'tenant_id' => $tenant->id,
            'jamaah_id' => $jamaah->id,
            'rekening_tenant_id' => $rekening?->id,
            'tipe_pembayaran' => 'Cicilan',
            'nominal' => 10000000,
            'bukti_transfer' => 'bukti_transfer/sample_slip.svg',
            'status_verifikasi' => 'Verified',
            'verified_by' => $verifier?->id,
            'created_at' => now()->subDays(2),
            'updated_at' => now()->subDays(2),
        ]);
    }
}
