<?php

namespace Tests\Feature\Auth;

use App\Models\CrmStage;
use App\Models\Paket;
use App\Models\Tenant;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class RegistrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_registration_screen_can_be_rendered(): void
    {
        $tenant = Tenant::create([
            'nama_travel' => 'Travel Berkah Registration',
            'domain_atau_subdomain' => 'berkahreg',
        ]);

        $response = $this->get(route('public.register'));

        $response->assertStatus(200);
    }

    public function test_public_registration_submits_jamaah_lead(): void
    {
        Storage::fake('public');

        $tenant = Tenant::create([
            'nama_travel' => 'Travel Berkah Registration',
            'domain_atau_subdomain' => 'berkahreg',
        ]);

        $stage = CrmStage::create([
            'tenant_id' => $tenant->id,
            'nama_tahap' => 'Lead Masuk',
            'urutan' => 1,
            'is_active' => true,
        ]);

        $paket = Paket::create([
            'tenant_id' => $tenant->id,
            'nama_paket' => 'Paket Umroh Hemat',
            'harga' => 25000000,
            'kuota' => 40,
            'is_active' => true,
        ]);

        $response = $this->post(route('public.register.submit'), [
            'nama_lengkap' => 'Calon Jamaah Baru',
            'no_hp' => '081234567890',
            'email' => 'calon@example.com',
            'paket_id' => $paket->id,
            'file_ktp' => UploadedFile::fake()->create('ktp.jpg', 200, 'image/jpeg'),
            'file_kk' => UploadedFile::fake()->create('kk.pdf', 300, 'application/pdf'),
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('jamaah', [
            'nama_lengkap' => 'Calon Jamaah Baru',
            'email' => 'calon@example.com',
        ]);
    }
}
