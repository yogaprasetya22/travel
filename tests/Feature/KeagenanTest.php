<?php

namespace Tests\Feature;

use App\Models\CrmStage;
use App\Models\Jamaah;
use App\Models\KomisiAgen;
use App\Models\Paket;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class KeagenanTest extends TestCase
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

    public function test_guests_cannot_access_keagenan_endpoints(): void
    {
        $this->get(route('keagenan.agents.index'))->assertRedirect(route('login'));
        $this->get(route('keagenan.commissions.index'))->assertRedirect(route('login'));
    }

    public function test_agents_cannot_access_keagenan_endpoints(): void
    {
        $this->actingAs($this->agent);

        $this->get(route('keagenan.agents.index'))->assertStatus(403);
        $this->get(route('keagenan.commissions.index'))->assertStatus(403);
    }

    public function test_owner_and_admin_can_access_keagenan_endpoints(): void
    {
        $this->actingAs($this->owner);
        $this->get(route('keagenan.agents.index'))->assertStatus(200);
        $this->get(route('keagenan.commissions.index'))->assertStatus(200);

        $this->actingAs($this->admin);
        $this->get(route('keagenan.agents.index'))->assertStatus(200);
        $this->get(route('keagenan.commissions.index'))->assertStatus(200);
    }

    public function test_owner_can_register_new_agent(): void
    {
        $this->actingAs($this->owner);

        $response = $this->post(route('keagenan.agents.store'), [
            'name' => 'New Agent',
            'email' => 'newagent@test.com',
            'password' => 'password123',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('users', [
            'tenant_id' => $this->tenant->id,
            'email' => 'newagent@test.com',
            'role' => 'agen',
        ]);
    }

    public function test_owner_can_update_commission_status(): void
    {
        $this->actingAs($this->owner);

        $stage = CrmStage::create([
            'tenant_id' => $this->tenant->id,
            'nama_tahap' => 'New',
            'urutan' => 1,
        ]);

        $paket = Paket::create([
            'tenant_id' => $this->tenant->id,
            'nama_paket' => 'Paket Hemat',
            'harga' => 25000000,
        ]);

        $jamaah = Jamaah::create([
            'tenant_id' => $this->tenant->id,
            'crm_stage_id' => $stage->id,
            'nama_lengkap' => 'Calon Jamaah',
            'no_hp' => '0812345678',
            'email' => 'jamaah@gmail.com',
            'paket_id' => $paket->id,
        ]);

        $commission = KomisiAgen::create([
            'tenant_id' => $this->tenant->id,
            'agen_id' => $this->agent->id,
            'jamaah_id' => $jamaah->id,
            'nominal_komisi' => 1000000,
            'status_pencairan' => 'Ready_to_Pay',
        ]);

        $response = $this->put(route('keagenan.commissions.update', $commission->id), [
            'status_pencairan' => 'Paid',
        ]);

        $response->assertRedirect();
        $this->assertEquals('Paid', $commission->fresh()->status_pencairan);
    }
}
