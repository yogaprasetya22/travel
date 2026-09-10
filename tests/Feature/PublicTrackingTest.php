<?php

namespace Tests\Feature;

use App\Models\CrmStage;
use App\Models\Jamaah;
use App\Models\Paket;
use App\Models\Pembayaran;
use App\Models\RekeningTenant;
use App\Models\Tenant;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class PublicTrackingTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_tracking_page_can_be_rendered(): void
    {
        $tenant = Tenant::create([
            'nama_travel' => 'Barakah Umroh Tour',
            'domain_atau_subdomain' => 'barakah',
        ]);

        $response = $this->get(route('public.tracking'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Public/TrackingStatus')
            ->has('tenant')
            ->where('searchPerformed', false)
        );
    }

    public function test_jamaah_can_search_tracking_by_registration_code(): void
    {
        $tenant = Tenant::create([
            'nama_travel' => 'Barakah Umroh Tour',
            'domain_atau_subdomain' => 'barakah',
        ]);

        $bank = RekeningTenant::create([
            'tenant_id' => $tenant->id,
            'nama_bank' => 'BSI (Bank Syariah Indonesia)',
            'nomor_rekening' => '7123456789',
            'atas_nama' => 'PT Barakah Umroh Tour',
            'is_active' => true,
        ]);

        $stage = CrmStage::create([
            'tenant_id' => $tenant->id,
            'nama_tahap' => 'DP Masuk',
            'urutan' => 2,
        ]);

        $paket = Paket::create([
            'tenant_id' => $tenant->id,
            'nama_paket' => 'Umroh VIP Ramadhan 1447 H',
            'harga' => 35000000,
            'kuota' => 40,
        ]);

        $jamaah = Jamaah::create([
            'tenant_id' => $tenant->id,
            'crm_stage_id' => $stage->id,
            'paket_id' => $paket->id,
            'kode_pendaftaran' => 'REG-2026090001-TEST123',
            'nama_lengkap' => 'Ahmad Sholihin',
            'nik' => '3201012345678805',
            'no_hp' => '081298765432',
        ]);

        Pembayaran::create([
            'tenant_id' => $tenant->id,
            'jamaah_id' => $jamaah->id,
            'rekening_tenant_id' => $bank->id,
            'nomor_invoice' => 'INV-2026090001-DP01',
            'nominal' => 10000000,
            'tipe_pembayaran' => 'DP',
            'status_verifikasi' => 'Verified',
        ]);

        // 1. Without PIN -> Prompt requirePin
        $responseNoPin = $this->get(route('public.tracking', ['code' => 'REG-2026090001-TEST123']));
        $responseNoPin->assertStatus(200);
        $responseNoPin->assertInertia(fn ($page) => $page
            ->component('Public/TrackingStatus')
            ->where('searchPerformed', true)
            ->where('requirePin', true)
            ->where('candidateHint.pin_type', 'NIK')
            ->where('jamaah', null)
        );

        // 2. With wrong PIN -> Prompt invalidPin
        $responseWrongPin = $this->get(route('public.tracking', ['code' => 'REG-2026090001-TEST123', 'pin' => '9999']));
        $responseWrongPin->assertStatus(200);
        $responseWrongPin->assertInertia(fn ($page) => $page
            ->component('Public/TrackingStatus')
            ->where('searchPerformed', true)
            ->where('invalidPin', true)
            ->where('jamaah', null)
        );

        // 3. With correct NIK PIN (8805) -> Unlocks data with masked PII
        $response = $this->get(route('public.tracking', ['code' => 'REG-2026090001-TEST123', 'pin' => '8805']));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Public/TrackingStatus')
            ->where('searchPerformed', true)
            ->where('notFound', false)
            ->where('jamaah.nama_lengkap', 'Ahmad Sholihin')
            ->where('jamaah.kode_pendaftaran', 'REG-2026090001-TEST123')
            ->where('jamaah.nik', '3201 •••••• 8805')
            ->where('jamaah.financial_summary.total_biaya', 35000000)
            ->where('jamaah.financial_summary.total_terbayar', 10000000)
            ->where('jamaah.financial_summary.sisa_tagihan', 25000000)
        );
    }

    public function test_jamaah_can_search_tracking_by_invoice_number(): void
    {
        $tenant = Tenant::create([
            'nama_travel' => 'Barakah Umroh Tour',
            'domain_atau_subdomain' => 'barakah',
        ]);

        $bank = RekeningTenant::create([
            'tenant_id' => $tenant->id,
            'nama_bank' => 'BSI (Bank Syariah Indonesia)',
            'nomor_rekening' => '7123456789',
            'atas_nama' => 'PT Barakah Umroh Tour',
            'is_active' => true,
        ]);

        $stage = CrmStage::create([
            'tenant_id' => $tenant->id,
            'nama_tahap' => 'Lunas',
            'urutan' => 4,
        ]);

        $paket = Paket::create([
            'tenant_id' => $tenant->id,
            'nama_paket' => 'Umroh Hemat Syawal',
            'harga' => 25000000,
            'kuota' => 45,
        ]);

        $jamaah = Jamaah::create([
            'tenant_id' => $tenant->id,
            'crm_stage_id' => $stage->id,
            'paket_id' => $paket->id,
            'kode_pendaftaran' => 'REG-2026090002-LUNAS99',
            'nama_lengkap' => 'Hj. Fatimah Zahra',
            'no_hp' => '081388889999',
        ]);

        Pembayaran::create([
            'tenant_id' => $tenant->id,
            'jamaah_id' => $jamaah->id,
            'rekening_tenant_id' => $bank->id,
            'nomor_invoice' => 'INV-2026090002-PELUNASAN',
            'nominal' => 25000000,
            'tipe_pembayaran' => 'Pelunasan',
            'status_verifikasi' => 'Verified',
        ]);

        $response = $this->get(route('public.tracking', ['code' => 'INV-2026090002-PELUNASAN', 'pin' => '9999']));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Public/TrackingStatus')
            ->where('jamaah.nama_lengkap', 'Hj. Fatimah Zahra')
            ->where('jamaah.financial_summary.is_lunas', true)
            ->where('jamaah.financial_summary.sisa_tagihan', 0)
        );
    }

    public function test_jamaah_can_access_tracking_directly_with_token(): void
    {
        $tenant = Tenant::create([
            'nama_travel' => 'Barakah Umroh Tour',
            'domain_atau_subdomain' => 'barakah',
        ]);

        $stage = CrmStage::create([
            'tenant_id' => $tenant->id,
            'nama_tahap' => 'DP Masuk',
            'urutan' => 2,
        ]);

        $paket = Paket::create([
            'tenant_id' => $tenant->id,
            'nama_paket' => 'Umroh VIP',
            'harga' => 30000000,
            'kuota' => 20,
        ]);

        $jamaah = Jamaah::create([
            'tenant_id' => $tenant->id,
            'crm_stage_id' => $stage->id,
            'paket_id' => $paket->id,
            'kode_pendaftaran' => 'REG-2026090009-TOKEN',
            'nama_lengkap' => 'Ust. Mansyur',
            'no_hp' => '081234567890',
        ]);

        $response = $this->get(route('public.tracking', [
            'code' => 'REG-2026090009-TOKEN',
            'token' => $jamaah->getTrackingToken(),
        ]));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Public/TrackingStatus')
            ->where('notFound', false)
            ->where('jamaah.nama_lengkap', 'Ust. Mansyur')
        );
    }

    public function test_jamaah_can_submit_installment_payment_from_tracking_page(): void
    {
        Storage::fake('public');

        $tenant = Tenant::create([
            'nama_travel' => 'Barakah Umroh Tour',
            'domain_atau_subdomain' => 'barakah',
        ]);

        $bank = RekeningTenant::create([
            'tenant_id' => $tenant->id,
            'nama_bank' => 'BSI (Bank Syariah Indonesia)',
            'nomor_rekening' => '7123456789',
            'atas_nama' => 'PT Barakah Umroh Tour',
            'is_active' => true,
        ]);

        $stage = CrmStage::create([
            'tenant_id' => $tenant->id,
            'nama_tahap' => 'DP Masuk',
            'urutan' => 2,
        ]);

        $paket = Paket::create([
            'tenant_id' => $tenant->id,
            'nama_paket' => 'Umroh Hemat Syawal',
            'harga' => 25000000,
            'kuota' => 45,
        ]);

        $jamaah = Jamaah::create([
            'tenant_id' => $tenant->id,
            'crm_stage_id' => $stage->id,
            'paket_id' => $paket->id,
            'kode_pendaftaran' => 'REG-2026090003-CICIL',
            'nama_lengkap' => 'Muhammad Ridwan',
            'no_hp' => '081233445566',
        ]);

        $file = UploadedFile::fake()->create('bukti_transfer.jpg', 200, 'image/jpeg');

        $response = $this->post(route('public.submit-installment'), [
            'jamaah_id' => $jamaah->id,
            'nominal' => 5000000,
            'rekening_tenant_id' => $bank->id,
            'tipe_pembayaran' => 'Cicilan',
            'bukti_transfer' => $file,
            'keterangan' => 'Transfer dari Bank Mandiri a.n Muhammad Ridwan',
        ]);

        $response->assertRedirect(route('public.tracking', [
            'code' => 'REG-2026090003-CICIL',
            'token' => $jamaah->getTrackingToken(),
        ]));
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('pembayaran', [
            'tenant_id' => $tenant->id,
            'jamaah_id' => $jamaah->id,
            'rekening_tenant_id' => $bank->id,
            'nominal' => 5000000,
            'tipe_pembayaran' => 'Cicilan',
            'status_verifikasi' => 'Pending',
        ]);

        $this->assertDatabaseHas('jamaah_documents', [
            'tenant_id' => $tenant->id,
            'jamaah_id' => $jamaah->id,
            'type' => 'pembayaran',
        ]);
    }
}
