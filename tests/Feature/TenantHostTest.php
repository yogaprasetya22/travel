<?php

namespace Tests\Feature;

use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class TenantHostTest extends TestCase
{
    use DatabaseTransactions;

    private Tenant $default;

    private Tenant $barokah;

    protected function setUp(): void
    {
        parent::setUp();

        config(['app.url' => 'https://travel.kolibrinektara.com', 'app.default_tenant' => 'kbr-default']);

        $this->default = Tenant::create(['nama_travel' => 'Travel Kolibrinektara', 'domain_atau_subdomain' => 'kbr-default']);
        $this->barokah = Tenant::create(['nama_travel' => 'Barokah Madinah Wisata', 'domain_atau_subdomain' => 'kbr-barokah']);
    }

    public function test_base_host_serves_default_tenant(): void
    {
        $this->assertNull(Tenant::fromHost('travel.kolibrinektara.com'));
        $this->assertTrue($this->default->is(Tenant::default()));

        $this->get('https://travel.kolibrinektara.com/login')
            ->assertInertia(fn ($page) => $page->where('tenant.nama_travel', 'Travel Kolibrinektara'));
    }

    public function test_subdomain_serves_its_own_tenant(): void
    {
        $this->assertTrue($this->barokah->is(Tenant::fromHost('kbr-barokah.travel.kolibrinektara.com')));

        $this->get('https://kbr-barokah.travel.kolibrinektara.com/login')
            ->assertInertia(fn ($page) => $page->where('tenant.nama_travel', 'Barokah Madinah Wisata'));
    }

    public function test_unknown_subdomain_is_not_a_tenant(): void
    {
        $this->assertNull(Tenant::fromHost('tidak-ada.travel.kolibrinektara.com'));
        $this->assertFalse(Tenant::isBaseHost('tidak-ada.travel.kolibrinektara.com'));
    }

    public function test_public_url_uses_base_host_for_default_and_subdomain_for_others(): void
    {
        $this->assertSame('https://travel.kolibrinektara.com', $this->default->public_url);
        $this->assertSame('https://kbr-barokah.travel.kolibrinektara.com', $this->barokah->public_url);

        config(['app.url' => 'http://localhost:8000']);
        $this->assertSame('http://kbr-barokah.localhost:8000', $this->barokah->fresh()->public_url);
    }

    public function test_agent_profile_resolves_on_base_host_and_subdomain_but_not_across_tenants(): void
    {
        $agent = User::create([
            'tenant_id' => $this->barokah->id,
            'name' => 'Agen Barokah',
            'email' => 'agen-host@test.com',
            'password' => bcrypt('password'),
            'role' => 'agen',
            'referral_code' => 'AG-HOST01',
        ]);

        $this->get("https://kbr-barokah.travel.kolibrinektara.com/agen/{$agent->referral_code}")->assertOk();
        $this->get("https://travel.kolibrinektara.com/agen/{$agent->referral_code}")->assertNotFound();
        $this->get("https://tidak-ada.travel.kolibrinektara.com/agen/{$agent->referral_code}")->assertNotFound();
    }
}
