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

    public function test_ship_selected_items_changes_status_to_shipped_and_decrements_stock(): void
    {
        $initialStock = $this->itemKoper->stok_tersedia;

        $response = $this->actingAs($this->owner)->post(route('crm.logistics.ship-items', $this->jamaah->id), [
            'item_ids' => [$this->itemKoper->id],
            'ekspedisi' => 'JNE Express',
            'no_resi' => 'JNE-123456789',
            'notes' => 'Kirim koper via paket reguler',
        ]);

        $response->assertRedirect();
        $this->jamaah->refresh();
        $this->itemKoper->refresh();

        $this->assertEquals('Shipped', $this->jamaah->status_logistik);
        $this->assertEquals('JNE Express', $this->jamaah->ekspedisi_logistik);
        $this->assertEquals('JNE-123456789', $this->jamaah->no_resi_logistik);
        $this->assertEquals($initialStock - 1, $this->itemKoper->stok_tersedia);

        $this->assertDatabaseHas('item_distributions', [
            'tenant_id' => $this->tenant->id,
            'jamaah_id' => $this->jamaah->id,
            'inventaris_id' => $this->itemKoper->id,
            'status' => 'Shipped',
        ]);

        $this->assertDatabaseHas('inventaris_transaksi', [
            'tenant_id' => $this->tenant->id,
            'inventaris_id' => $this->itemKoper->id,
            'jamaah_id' => $this->jamaah->id,
            'tipe' => 'OUT',
        ]);
    }

    public function test_confirm_delivery_changes_status_to_handed_over(): void
    {
        // First ship
        $this->actingAs($this->owner)->post(route('crm.logistics.ship-items', $this->jamaah->id), [
            'item_ids' => [$this->itemKoper->id, $this->itemBatik->id],
            'ekspedisi' => 'SiCepat Ekspres',
            'no_resi' => 'SCP-998877',
        ]);

        // Then confirm delivery
        $response = $this->actingAs($this->owner)->post(route('crm.logistics.confirm-delivery', $this->jamaah->id), [
            'receiver_name' => 'Istri H. Sulaiman',
            'notes' => 'Paket diterima dalam kondisi baik',
        ]);

        $response->assertRedirect();
        $this->jamaah->refresh();

        $this->assertEquals('Handed_Over', $this->jamaah->status_logistik);
        $this->assertNotNull($this->jamaah->tanggal_serah_terima_logistik);

        $this->assertDatabaseHas('item_distributions', [
            'tenant_id' => $this->tenant->id,
            'jamaah_id' => $this->jamaah->id,
            'inventaris_id' => $this->itemKoper->id,
            'status' => 'Delivered',
            'receiver_name' => 'Istri H. Sulaiman',
        ]);
    }

    public function test_confirm_delivery_only_affects_shipped_items_leaving_pending_items_intact(): void
    {
        // 1 item is Shipped, 1 item is Pending
        ItemDistribution::create([
            'tenant_id' => $this->tenant->id,
            'jamaah_id' => $this->jamaah->id,
            'inventaris_id' => $this->itemBatik->id,
            'status' => 'Pending',
            'qty' => 1,
        ]);

        $this->actingAs($this->owner)->post(route('crm.logistics.ship-items', $this->jamaah->id), [
            'item_ids' => [$this->itemKoper->id],
            'ekspedisi' => 'JNE',
            'no_resi' => 'JNE-PARTIAL-123',
        ]);

        // Confirm delivery
        $response = $this->actingAs($this->owner)->post(route('crm.logistics.confirm-delivery', $this->jamaah->id), [
            'receiver_name' => 'H. Sulaiman',
        ]);

        $response->assertRedirect();
        $this->jamaah->refresh();

        // itemKoper should be Delivered
        $this->assertDatabaseHas('item_distributions', [
            'tenant_id' => $this->tenant->id,
            'jamaah_id' => $this->jamaah->id,
            'inventaris_id' => $this->itemKoper->id,
            'status' => 'Delivered',
        ]);

        // itemBatik should STILL be Pending
        $this->assertDatabaseHas('item_distributions', [
            'tenant_id' => $this->tenant->id,
            'jamaah_id' => $this->jamaah->id,
            'inventaris_id' => $this->itemBatik->id,
            'status' => 'Pending',
        ]);

        // Jamaah status should be Ready_to_Pickup since there are still pending items
        $this->assertEquals('Ready_to_Pickup', $this->jamaah->status_logistik);
    }
}
