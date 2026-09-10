<?php

namespace Tests\Feature;

use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LandingPageCmsTest extends TestCase
{
    use RefreshDatabase;

    public function test_owner_travel_can_view_landing_cms_page(): void
    {
        $tenant = Tenant::create([
            'nama_travel' => 'Berkah Travel Utama',
            'domain_atau_subdomain' => 'berkahtravel',
        ]);

        $owner = User::create([
            'tenant_id' => $tenant->id,
            'name' => 'Owner Berkah',
            'email' => 'owner@berkahtravel.com',
            'password' => bcrypt('password'),
            'role' => 'owner_travel',
        ]);

        $response = $this->actingAs($owner)->get(route('settings.landing.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Settings/LandingCms')
            ->has('tenant')
            ->has('landingConfig')
        );
    }

    public function test_owner_travel_can_update_landing_config(): void
    {
        $tenant = Tenant::create([
            'nama_travel' => 'Berkah Travel Utama',
            'domain_atau_subdomain' => 'berkahtravel',
        ]);

        $owner = User::create([
            'tenant_id' => $tenant->id,
            'name' => 'Owner Berkah',
            'email' => 'owner@berkahtravel.com',
            'password' => bcrypt('password'),
            'role' => 'owner_travel',
        ]);

        $newConfig = [
            'hero' => [
                'badge_text' => '🕋 Umroh Premium Bintang 5',
                'title' => 'Perjalanan Ibadah Khusyuk Bersama Berkah Travel',
                'subtitle' => 'Pelayanan terbaik dari hati untuk kenyamanan ibadah Anda.',
                'cta_package_text' => 'Lihat Semua Paket',
                'cta_calc_text' => 'Hitung Angsuran',
            ],
            'stats' => [
                'jamaah_count' => '12.500+',
                'satisfaction_rate' => '99.9%',
                'on_time_rate' => '100%',
                'experience_years' => '15+ Thn',
            ],
            'visibility' => [
                'hero' => true,
                'search_bar' => true,
                'stats' => true,
                'partners' => false,
                'katalog' => true,
                'kalkulator' => true,
                'legalitas' => true,
                'testimoni' => true,
                'tracking' => true,
            ],
            'legalitas' => [
                'nomor_ppiu' => 'Izin PPIU No. 999/2024',
                'akreditasi' => 'Akreditasi A Unggul',
                'title' => 'Komitmen 5 Pasti Umrah Berkah',
                'subtitle' => 'Jaminan kepastian ibadah sesuai standar Kemenag RI.',
            ],
            'partners' => [
                'airlines' => ['Saudia Airlines', 'Garuda Indonesia', 'Emirates'],
                'hotels' => ['Dar Al Iman InterContinental', 'Mövenpick Hotel Madinah'],
            ],
        ];

        $response = $this->actingAs($owner)->put(route('settings.landing.update'), [
            'landing_config' => $newConfig,
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success', 'Konfigurasi CMS Landing Page berhasil disimpan.');

        $tenant->refresh();
        $this->assertEquals('🕋 Umroh Premium Bintang 5', $tenant->landing_config['hero']['badge_text']);
        $this->assertEquals('12.500+', $tenant->landing_config['stats']['jamaah_count']);
        $this->assertFalse($tenant->landing_config['visibility']['partners']);
        $this->assertEquals('Izin PPIU No. 999/2024', $tenant->landing_config['legalitas']['nomor_ppiu']);
    }

    public function test_super_admin_master_can_update_tenant_landing_config_via_tenants_endpoint(): void
    {
        $tenant = Tenant::create([
            'nama_travel' => 'Amanah Haji Travel',
            'domain_atau_subdomain' => 'amanah',
        ]);

        $superAdmin = User::create([
            'name' => 'Super Admin Master',
            'email' => 'superadmin@travel.com',
            'password' => bcrypt('password'),
            'role' => 'super_admin_master',
            'tenant_id' => null,
        ]);

        $landingConfig = [
            'hero' => [
                'badge_text' => 'Official Travel Master',
                'title' => 'Kenyamanan Ibadah Amanah',
            ],
            'stats' => [
                'jamaah_count' => '3.000+',
            ],
            'visibility' => [
                'hero' => true,
                'stats' => true,
            ],
        ];

        $response = $this->actingAs($superAdmin)->put(route('tenants.update', $tenant->id), [
            'nama_travel' => 'Amanah Haji Travel (Updated)',
            'domain_atau_subdomain' => 'amanah-updated',
            'landing_config' => $landingConfig,
        ]);

        $response->assertRedirect();

        $tenant->refresh();
        $this->assertEquals('Amanah Haji Travel (Updated)', $tenant->nama_travel);
        $this->assertEquals('Official Travel Master', $tenant->landing_config['hero']['badge_text']);
        $this->assertEquals('3.000+', $tenant->landing_config['stats']['jamaah_count']);
    }
}
