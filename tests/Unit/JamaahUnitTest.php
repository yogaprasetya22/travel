<?php

namespace Tests\Unit;

use App\Models\CrmStage;
use App\Models\Inventaris;
use App\Models\ItemDistribution;
use App\Models\Jamaah;
use App\Models\JamaahDocument;
use App\Models\Paket;
use App\Models\Pembayaran;
use App\Models\RekeningTenant;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class JamaahUnitTest extends TestCase
{
    use RefreshDatabase;

    protected Tenant $tenant;

    protected CrmStage $stage;

    protected Paket $paket;

    protected User $agent;

    protected function setUp(): void
    {
        parent::setUp();

        $this->tenant = Tenant::create([
            'nama_travel' => 'Berkah Travel Test',
            'domain_atau_subdomain' => 'berkahtest',
        ]);

        $this->stage = CrmStage::create([
            'tenant_id' => $this->tenant->id,
            'nama_tahap' => 'Jamaah Terdaftar',
            'urutan' => 1,
            'is_active' => true,
        ]);

        $this->paket = Paket::create([
            'tenant_id' => $this->tenant->id,
            'nama_paket' => 'Paket Reguler',
            'harga' => 30000000,
            'kuota' => 40,
            'is_active' => true,
        ]);

        $this->agent = User::create([
            'tenant_id' => $this->tenant->id,
            'name' => 'Agen Sukses',
            'email' => 'agensukses@example.com',
            'password' => bcrypt('password'),
            'role' => 'agen',
        ]);
    }

    public function test_jamaah_extended_biodata_persisted(): void
    {
        $jamaah = Jamaah::create([
            'tenant_id' => $this->tenant->id,
            'crm_stage_id' => $this->stage->id,
            'paket_id' => $this->paket->id,
            'agen_id' => $this->agent->id,
            'nama_lengkap' => 'H. Muhammad Yusuf',
            'jenis_kelamin' => 'L',
            'nik' => '3273123456780001',
            'tempat_lahir' => 'Bandung',
            'tanggal_lahir' => '1985-05-15',
            'no_hp' => '08122334455',
            'email' => 'yusuf@example.com',
            'alamat_ktp' => 'Jl. Dago Asri No. 12, Bandung',
            'kontak_darurat_nama' => 'Fatimah (Istri)',
            'kontak_darurat_hp' => '081299887766',
        ]);

        $jamaah->refresh();

        $this->assertEquals('H. Muhammad Yusuf', $jamaah->nama_lengkap);
        $this->assertEquals('L', $jamaah->jenis_kelamin);
        $this->assertEquals('3273123456780001', $jamaah->nik);
        $this->assertEquals('Bandung', $jamaah->tempat_lahir);
        $this->assertEquals('1985-05-15', $jamaah->tanggal_lahir->format('Y-m-d'));
        $this->assertEquals('Jl. Dago Asri No. 12, Bandung', $jamaah->alamat_ktp);
        $this->assertEquals('Fatimah (Istri)', $jamaah->kontak_darurat_nama);
    }

    public function test_jamaah_relationships(): void
    {
        $jamaah = Jamaah::create([
            'tenant_id' => $this->tenant->id,
            'crm_stage_id' => $this->stage->id,
            'paket_id' => $this->paket->id,
            'agen_id' => $this->agent->id,
            'nama_lengkap' => 'Hj. Aminah',
            'no_hp' => '081344556677',
        ]);

        // Document relation
        JamaahDocument::create([
            'tenant_id' => $this->tenant->id,
            'jamaah_id' => $jamaah->id,
            'type' => 'paspor',
            'file_name' => 'paspor_aminah.pdf',
            'file_path' => 'documents/paspor_aminah.pdf',
            'mime_type' => 'application/pdf',
            'file_size' => 102400,
        ]);

        // Item distribution relation
        $item = Inventaris::create([
            'tenant_id' => $this->tenant->id,
            'nama_barang' => 'Koper 24 Inch',
            'sku' => 'KOP-24',
            'stok_tersedia' => 10,
            'stok_minimum' => 2,
        ]);

        ItemDistribution::create([
            'tenant_id' => $this->tenant->id,
            'jamaah_id' => $jamaah->id,
            'inventaris_id' => $item->id,
            'status' => 'Delivered',
            'receiver_name' => 'Hj. Aminah',
            'delivered_at' => now(),
        ]);

        // Pembayaran relation
        $bank = RekeningTenant::create([
            'tenant_id' => $this->tenant->id,
            'nama_bank' => 'BSI',
            'nomor_rekening' => '1234567890',
            'atas_nama' => 'Travel Berkah',
            'is_active' => true,
        ]);

        Pembayaran::create([
            'tenant_id' => $this->tenant->id,
            'jamaah_id' => $jamaah->id,
            'rekening_tenant_id' => $bank->id,
            'tipe_pembayaran' => 'DP',
            'nominal' => 10000000,
            'status_verifikasi' => 'Verified',
        ]);

        $jamaah->refresh();

        $this->assertEquals($this->paket->id, $jamaah->paket->id);
        $this->assertEquals($this->agent->id, $jamaah->agen->id);
        $this->assertCount(1, $jamaah->documents);
        $this->assertEquals('paspor', $jamaah->documents->first()->type);
        $this->assertCount(1, $jamaah->itemDistributions);
        $this->assertEquals('Delivered', $jamaah->itemDistributions->first()->status);
        $this->assertCount(1, $jamaah->pembayaran);
        $this->assertEquals(10000000, $jamaah->pembayaran->where('status_verifikasi', 'Verified')->sum('nominal'));
    }
}
