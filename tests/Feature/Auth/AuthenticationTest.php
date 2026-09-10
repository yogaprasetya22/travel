<?php

namespace Tests\Feature\Auth;

use App\Models\Tenant;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_screen_can_be_rendered(): void
    {
        $response = $this->get('/login');

        $response->assertStatus(200);
    }

    public function test_users_can_authenticate_using_the_login_screen(): void
    {
        $user = User::factory()->create();

        $response = $this->post('/login', [
            'email' => $user->email,
            'password' => 'password',
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect(route('dashboard', absolute: false));
    }

    public function test_users_can_not_authenticate_with_invalid_password(): void
    {
        $user = User::factory()->create();

        $this->post('/login', [
            'email' => $user->email,
            'password' => 'wrong-password',
        ]);

        $this->assertGuest();
    }

    public function test_superadmin_master_can_authenticate_via_seeder(): void
    {
        $this->seed(DatabaseSeeder::class);

        $response = $this->post('/login', [
            'email' => 'superadmin@hajjflow.com',
            'password' => 'password',
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect(route('dashboard', absolute: false));
    }

    public function test_users_can_logout(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post('/logout');

        $this->assertGuest();
        $response->assertRedirect('/');
    }

    public function test_user_cannot_login_to_different_tenant_subdomain(): void
    {
        $tenantBarokah = Tenant::create([
            'nama_travel' => 'Barokah Travel',
            'domain_atau_subdomain' => 'barokah',
            'email' => 'barokah@travel.id',
            'telepon' => '081234567891',
        ]);

        $tenantHajjflow = Tenant::create([
            'nama_travel' => 'Hajjflow Travel',
            'domain_atau_subdomain' => 'hajjflow',
            'email' => 'hajjflow@travel.id',
            'telepon' => '081234567892',
        ]);

        // Agent belongs to Hajjflow
        $agentHajjflow = User::factory()->create([
            'tenant_id' => $tenantHajjflow->id,
            'role' => 'agen',
            'email' => 'agent@hajjflow.com',
            'password' => bcrypt('password'),
        ]);

        // Attempt login on barokah subdomain
        $response = $this->post('http://barokah.72.62.125.68.nip.io:8085/login', [
            'email' => 'agent@hajjflow.com',
            'password' => 'password',
        ]);

        $this->assertGuest();
        $response->assertSessionHasErrors(['email']);
    }

    public function test_user_can_login_to_their_own_tenant_subdomain(): void
    {
        $tenantBarokah = Tenant::create([
            'nama_travel' => 'Barokah Travel',
            'domain_atau_subdomain' => 'barokah',
            'email' => 'barokah@travel.id',
            'telepon' => '081234567891',
        ]);

        $agentBarokah = User::factory()->create([
            'tenant_id' => $tenantBarokah->id,
            'role' => 'agen',
            'email' => 'agent@barokah.com',
            'password' => bcrypt('password'),
        ]);

        $response = $this->post('http://barokah.72.62.125.68.nip.io:8085/login', [
            'email' => 'agent@barokah.com',
            'password' => 'password',
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect(route('dashboard', absolute: false));
    }

    public function test_superadmin_can_login_to_any_tenant_subdomain(): void
    {
        $tenantBarokah = Tenant::create([
            'nama_travel' => 'Barokah Travel',
            'domain_atau_subdomain' => 'barokah',
            'email' => 'barokah@travel.id',
            'telepon' => '081234567891',
        ]);

        $superadmin = User::factory()->create([
            'role' => 'super_admin_master',
            'email' => 'super@master.com',
            'password' => bcrypt('password'),
        ]);

        $response = $this->post('http://barokah.72.62.125.68.nip.io:8085/login', [
            'email' => 'super@master.com',
            'password' => 'password',
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect(route('dashboard', absolute: false));
    }
}
