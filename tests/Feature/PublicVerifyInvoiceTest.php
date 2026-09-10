<?php

namespace Tests\Feature;

use App\Models\CrmStage;
use App\Models\Jamaah;
use App\Models\Paket;
use App\Models\Pembayaran;
use App\Models\RekeningTenant;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PublicVerifyInvoiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_view_public_verify_invoice_page(): void
    {
        $tenant = Tenant::create([
            'nama_travel' => 'Travel Test Mandiri',
            'domain_atau_subdomain' => 'test-travel',
            'email' => 'test@travel.id',
            'telepon' => '08123456789',
        ]);

        $paket = Paket::create([
            'tenant_id' => $tenant->id,
            'nama_paket' => 'Paket Umroh VIP Test',
            'harga' => 35000000,
            'kuota' => 45,
            'komisi_flat' => 1000000,
            'komisi_persentase' => 5,
            'is_active' => true,
        ]);

        $rekening = RekeningTenant::create([
            'tenant_id' => $tenant->id,
            'nama_bank' => 'Bank Syariah Indonesia',
            'nomor_rekening' => '7123456789',
            'atas_nama' => 'PT Travel Test Mandiri',
            'is_active' => true,
        ]);

        $user = User::factory()->create([
            'tenant_id' => $tenant->id,
            'role' => 'admin_travel',
            'name' => 'Petugas Keuangan Staff',
        ]);

        $stage = CrmStage::create([
            'tenant_id' => $tenant->id,
            'nama_tahap' => 'Closing',
            'urutan' => 1,
            'is_active' => true,
        ]);

        $jamaah = Jamaah::create([
            'tenant_id' => $tenant->id,
            'crm_stage_id' => $stage->id,
            'paket_id' => $paket->id,
            'nama_lengkap' => 'Ahmad Dahlan',
            'no_hp' => '081234567890',
            'nik' => '3201234567890001',
        ]);

        $pembayaran = Pembayaran::create([
            'tenant_id' => $tenant->id,
            'jamaah_id' => $jamaah->id,
            'rekening_tenant_id' => $rekening->id,
            'tipe_pembayaran' => 'DP',
            'nominal' => 10000000,
            'status_verifikasi' => 'Verified',
            'verified_by' => $user->id,
        ]);

        $response = $this->get(route('public.verify-invoice', $pembayaran->nomor_invoice));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Public/VerifyInvoice')
            ->has('payment')
            ->where('payment.id', $pembayaran->id)
            ->where('payment.nomor_invoice', $pembayaran->nomor_invoice)
            ->where('payment.status_verifikasi', 'Verified')
        );

        // Verify that guessing sequential integer IDs is strictly blocked (returns 404)
        $blockedResponse = $this->get('/verifikasi-pembayaran/1');
        $blockedResponse->assertStatus(404);
    }
}
