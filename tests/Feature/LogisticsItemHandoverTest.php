<?php

namespace Tests\Feature;

use App\Models\CrmStage;
use App\Models\Inventaris;
use App\Models\ItemDistribution;
use App\Models\Jamaah;
use App\Models\Paket;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LogisticsItemHandoverTest extends TestCase
{
    use RefreshDatabase;

    protected Tenant $tenant;

    protected User $owner;

    protected CrmStage $stage;

    protected Paket $paket;

    protected Jamaah $jamaah;

    protected Inventaris $itemKoper;

    protected Inventaris $itemBatik;

    protected function setUp(): void
    {
        parent::setUp();

        $this->tenant = Tenant::create([
            'nama_travel' => 'Berkah Logistics Travel',
            'domain_atau_subdomain' => 'berkahlogistics',
        ]);

        $this->owner = User::create([
            'tenant_id' => $this->tenant->id,
            'name' => 'Owner Logistik',
            'email' => 'owner@logistics.com',
            'password' => bcrypt('password'),
            'role' => 'owner_travel',
        ]);

        $this->stage = CrmStage::create([
            'tenant_id' => $this->tenant->id,
            'nama_tahap' => 'Persiapan Keberangkatan',
            'urutan' => 1,
            'is_active' => true,
        ]);

        $this->paket = Paket::create([
            'tenant_id' => $this->tenant->id,
            'nama_paket' => 'Paket Umroh Plus',
            'harga' => 32000000,
            'kuota' => 30,
            'is_active' => true,
        ]);

        $this->jamaah = Jamaah::create([
            'tenant_id' => $this->tenant->id,
            'crm_stage_id' => $this->stage->id,
            'paket_id' => $this->paket->id,
            'nama_lengkap' => 'H. Sulaiman',
            'no_hp' => '081233445566',
            'status_logistik' => 'Pending',
        ]);

        $this->itemKoper = Inventaris::create([
            'tenant_id' => $this->tenant->id,
            'nama_barang' => 'Koper 24 Inch Dark Blue',
            'sku' => 'KOP-BLU-24',
            'stok_tersedia' => 20,
            'stok_minimum' => 5,
        ]);

        $this->itemBatik = Inventaris::create([
            'tenant_id' => $this->tenant->id,
            'nama_barang' => 'Kain Seragam Batik',
            'sku' => 'BATIK-SER-01',
            'stok_tersedia' => 50,
            'stok_minimum' => 10,
        ]);
    }

    public function test_item_handover_creates_distribution_record(): void
    {
        $response = $this->actingAs($this->owner)->post(route('crm.logistics.item-handover', $this->jamaah->id), [
            'inventaris_id' => $this->itemKoper->id,
            'status' => 'Delivered',
            'receiver_name' => 'H. Sulaiman (Sendiri)',
            'notes' => 'Diserahkan saat manasik akbar',
        ]);

        $response->assertRedirect();

        $this->assertDatabaseHas('item_distributions', [
            'tenant_id' => $this->tenant->id,
            'jamaah_id' => $this->jamaah->id,
            'inventaris_id' => $this->itemKoper->id,
            'status' => 'Delivered',
            'receiver_name' => 'H. Sulaiman (Sendiri)',
            'notes' => 'Diserahkan saat manasik akbar',
        ]);
    }

    public function test_item_handover_status_toggle_to_pending(): void
    {
        $distribution = ItemDistribution::create([
            'tenant_id' => $this->tenant->id,
            'jamaah_id' => $this->jamaah->id,
            'inventaris_id' => $this->itemBatik->id,
            'status' => 'Delivered',
            'receiver_name' => 'H. Sulaiman',
            'delivered_at' => now(),
        ]);

        // Toggle back to Pending
        $response = $this->actingAs($this->owner)->post(route('crm.logistics.item-handover', $this->jamaah->id), [
            'inventaris_id' => $this->itemBatik->id,
            'status' => 'Pending',
        ]);

        $response->assertRedirect();
        $distribution->refresh();

        $this->assertEquals('Pending', $distribution->status);
        $this->assertNull($distribution->delivered_at);
    }
}
