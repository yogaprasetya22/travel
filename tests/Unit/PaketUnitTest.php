<?php

namespace Tests\Unit;

use App\Models\CrmStage;
use App\Models\Jamaah;
use App\Models\Paket;
use App\Models\Pembayaran;
use App\Models\RekeningTenant;
use App\Models\Tenant;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PaketUnitTest extends TestCase
{
    use RefreshDatabase;

    protected Tenant $tenant;

    protected function setUp(): void
    {
        parent::setUp();

        $this->tenant = Tenant::create([
            'nama_travel' => 'Berkah Travel Test',
            'domain_atau_subdomain' => 'berkahtest',
        ]);
    }

    public function test_available_seats_calculation(): void
    {
        $paket = Paket::create([
            'tenant_id' => $this->tenant->id,
            'nama_paket' => 'Paket Umroh Plus Turki',
            'harga' => 35000000,
            'kuota' => 10,
            'is_active' => true,
        ]);

        $stage = CrmStage::create([
            'tenant_id' => $this->tenant->id,
            'nama_tahap' => 'Closing',
            'urutan' => 1,
            'is_active' => true,
        ]);

        $this->assertEquals(10, $paket->available_seats);

        // Add 3 jamaahs with verified DP payment
        $bank = RekeningTenant::create([
            'tenant_id' => $this->tenant->id,
            'nama_bank' => 'BSI',
            'nomor_rekening' => '1234567890',
            'atas_nama' => 'Travel Berkah',
            'is_active' => true,
        ]);

        for ($i = 1; $i <= 3; $i++) {
            $jamaah = Jamaah::create([
                'tenant_id' => $this->tenant->id,
                'crm_stage_id' => $stage->id,
                'paket_id' => $paket->id,
                'nama_lengkap' => "Jamaah $i",
                'no_hp' => "08123456789$i",
            ]);

            Pembayaran::create([
                'tenant_id' => $this->tenant->id,
                'jamaah_id' => $jamaah->id,
                'rekening_tenant_id' => $bank->id,
                'tipe_pembayaran' => 'DP',
                'nominal' => 5000000,
                'status_verifikasi' => 'Verified',
            ]);
        }

        $paket->refresh();
        $this->assertEquals(7, $paket->available_seats);
    }

    public function test_available_seats_never_negative_on_overbooked_edge_case(): void
    {
        $bank = RekeningTenant::create([
            'tenant_id' => $this->tenant->id,
            'nama_bank' => 'BSI 2',
            'nomor_rekening' => '999888777',
            'atas_nama' => 'Travel Berkah',
            'is_active' => true,
        ]);

        $paket = Paket::create([
            'tenant_id' => $this->tenant->id,
            'nama_paket' => 'Paket Promo Terbatas',
            'harga' => 25000000,
            'kuota' => 2,
            'is_active' => true,
        ]);

        $stage = CrmStage::create([
            'tenant_id' => $this->tenant->id,
            'nama_tahap' => 'Closing',
            'urutan' => 1,
            'is_active' => true,
        ]);

        // Register 4 jamaahs with verified payment on a 2-seat package
        for ($i = 1; $i <= 4; $i++) {
            $jamaah = Jamaah::create([
                'tenant_id' => $this->tenant->id,
                'crm_stage_id' => $stage->id,
                'paket_id' => $paket->id,
                'nama_lengkap' => "Jamaah Promo $i",
                'no_hp' => "081299900$i",
            ]);

            Pembayaran::create([
                'tenant_id' => $this->tenant->id,
                'jamaah_id' => $jamaah->id,
                'rekening_tenant_id' => $bank->id,
                'tipe_pembayaran' => 'DP',
                'nominal' => 5000000,
                'status_verifikasi' => 'Verified',
            ]);
        }

        $paket->refresh();
        $this->assertEquals(0, $paket->available_seats);
    }

    public function test_itinerary_json_casting(): void
    {
        $itinerary = [
            ['day' => 1, 'title' => 'Jakarta ke Madinah', 'description' => 'Penerbangan langsung Jakarta - Madinah.'],
            ['day' => 2, 'title' => 'Ziarah Kota Madinah', 'description' => 'Mengunjungi Masjid Quba dan Jabal Uhud.'],
        ];

        $paket = Paket::create([
            'tenant_id' => $this->tenant->id,
            'nama_paket' => 'Paket Ramadhan',
            'harga' => 40000000,
            'kuota' => 30,
            'itinerary' => $itinerary,
            'is_active' => true,
        ]);

        $paket->refresh();
        $this->assertIsArray($paket->itinerary);
        $this->assertCount(2, $paket->itinerary);
        $this->assertEquals('Jakarta ke Madinah', $paket->itinerary[0]['title']);
    }

    public function test_paket_belongs_to_tenant_relation(): void
    {
        $paket = Paket::create([
            'tenant_id' => $this->tenant->id,
            'nama_paket' => 'Paket Arafah',
            'harga' => 50000000,
            'kuota' => 20,
            'is_active' => true,
        ]);

        $this->assertInstanceOf(Tenant::class, $paket->tenant);
        $this->assertEquals($this->tenant->id, $paket->tenant->id);
    }
}
