<?php

namespace Tests\Feature;

use App\Models\Inventaris;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class InventarisTest extends TestCase
{
    use DatabaseTransactions;

    protected Tenant $tenant;

    protected User $owner;

    protected User $admin;

    protected User $agent;

    protected function setUp(): void
    {
        parent::setUp();

        $this->tenant = Tenant::create([
            'nama_travel' => 'Test Travel',
            'domain_atau_subdomain' => 'test',
        ]);

        $this->owner = User::create([
            'tenant_id' => $this->tenant->id,
            'name' => 'Owner Test',
            'email' => 'owner@test.com',
            'password' => bcrypt('password'),
            'role' => 'owner_travel',
        ]);

        $this->admin = User::create([
            'tenant_id' => $this->tenant->id,
            'name' => 'Admin Test',
            'email' => 'admin@test.com',
            'password' => bcrypt('password'),
            'role' => 'admin_travel',
        ]);

        $this->agent = User::create([
            'tenant_id' => $this->tenant->id,
            'name' => 'Agent Test',
            'email' => 'agent@test.com',
            'password' => bcrypt('password'),
            'role' => 'agen',
        ]);
    }

    public function test_guests_cannot_access_inventaris_endpoints(): void
    {
        $this->get(route('inventaris.index'))->assertRedirect(route('login'));
    }

    public function test_agents_cannot_access_inventaris_endpoints(): void
    {
        $this->actingAs($this->agent);
        $this->get(route('inventaris.index'))->assertStatus(403);
    }

    public function test_owner_and_admin_can_access_inventaris_endpoints(): void
    {
        $this->actingAs($this->owner);
        $this->get(route('inventaris.index'))->assertStatus(200);

        $this->actingAs($this->admin);
        $this->get(route('inventaris.index'))->assertStatus(200);
    }

    public function test_owner_can_create_new_inventory_item_with_transaction_log(): void
    {
        $this->actingAs($this->owner);

        $response = $this->post(route('inventaris.store'), [
            'nama_barang' => 'Kain Ihram Premium',
            'stok_tersedia' => 30,
            'stok_minimum' => 5,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('inventaris', [
            'tenant_id' => $this->tenant->id,
            'nama_barang' => 'Kain Ihram Premium',
            'stok_tersedia' => 30,
        ]);

        $item = Inventaris::where('nama_barang', 'Kain Ihram Premium')->first();
        $this->assertDatabaseHas('inventaris_transaksi', [
            'tenant_id' => $this->tenant->id,
            'inventaris_id' => $item->id,
            'qty' => 30,
            'tipe' => 'IN',
            'jamaah_id' => null,
        ]);
    }

    public function test_owner_can_increase_stock_with_in_log(): void
    {
        $this->actingAs($this->owner);

        $item = Inventaris::create([
            'tenant_id' => $this->tenant->id,
            'nama_barang' => 'Buku Panduan Doa',
            'stok_tersedia' => 20,
            'stok_minimum' => 5,
        ]);

        $response = $this->put(route('inventaris.update', $item->id), [
            'nama_barang' => 'Buku Panduan Doa',
            'stok_tersedia' => 35, // increase by 15
            'stok_minimum' => 5,
        ]);

        $response->assertRedirect();
        $this->assertEquals(35, $item->fresh()->stok_tersedia);

        $this->assertDatabaseHas('inventaris_transaksi', [
            'tenant_id' => $this->tenant->id,
            'inventaris_id' => $item->id,
            'qty' => 15,
            'tipe' => 'IN',
            'jamaah_id' => null,
        ]);
    }

    public function test_owner_can_decrease_stock_with_out_log(): void
    {
        $this->actingAs($this->owner);

        $item = Inventaris::create([
            'tenant_id' => $this->tenant->id,
            'nama_barang' => 'Tas Serbaguna',
            'stok_tersedia' => 50,
            'stok_minimum' => 5,
        ]);

        $response = $this->put(route('inventaris.update', $item->id), [
            'nama_barang' => 'Tas Serbaguna',
            'stok_tersedia' => 42, // decrease by 8
            'stok_minimum' => 5,
        ]);

        $response->assertRedirect();
        $this->assertEquals(42, $item->fresh()->stok_tersedia);

        $this->assertDatabaseHas('inventaris_transaksi', [
            'tenant_id' => $this->tenant->id,
            'inventaris_id' => $item->id,
            'qty' => 8,
            'tipe' => 'OUT',
            'jamaah_id' => null,
        ]);
    }
}
