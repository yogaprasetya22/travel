<?php

namespace Tests\Feature;

use App\Mail\PaymentApprovedInvoiceMail;
use App\Models\CrmStage;
use App\Models\Inventaris;
use App\Models\Jamaah;
use App\Models\Paket;
use App\Models\Pembayaran;
use App\Models\RekeningTenant;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class TravelRequirementsEnhancedTest extends TestCase
{
    use RefreshDatabase;

    protected Tenant $tenant;

    protected User $owner;

    protected User $agent;

    protected CrmStage $stage;

    protected Paket $paket;

    protected RekeningTenant $bank;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');
        Mail::fake();

        $this->tenant = Tenant::create([
            'nama_travel' => 'Travel Berkah Al-Falah',
            'domain_atau_subdomain' => 'berkah',
        ]);

        $this->owner = User::create([
            'tenant_id' => $this->tenant->id,
            'name' => 'Owner Travel',
            'email' => 'owner@travel.com',
            'password' => bcrypt('password'),
            'role' => 'owner_travel',
        ]);

        $this->agent = User::create([
            'tenant_id' => $this->tenant->id,
            'created_by' => $this->owner->id,
            'name' => 'Mitra Agen 1',
            'email' => 'agen@travel.com',
            'password' => bcrypt('password'),
            'role' => 'agen',
        ]);

        $this->stage = CrmStage::create([
            'tenant_id' => $this->tenant->id,
            'nama_tahap' => 'Closing / Jamaah Resmi',
            'urutan' => 1,
            'is_active' => true,
        ]);

        $this->paket = Paket::create([
            'tenant_id' => $this->tenant->id,
            'nama_paket' => 'Umroh Syawal 9 Hari',
            'harga' => 30000000,
            'kuota' => 45,
            'komisi_flat' => 1500000,
            'itinerary' => [
                ['day' => 1, 'title' => 'Jakarta - Jeddah - Madinah', 'description' => 'Keberangkatan CGK menuju JED, perjalanan darat ke Madinah, check-in hotel.'],
                ['day' => 2, 'title' => 'Ziarah Raudhah', 'description' => 'Ibadah di Raudhah dan Masjid Nabawi.'],
            ],
            'is_active' => true,
        ]);

        $this->bank = RekeningTenant::create([
            'tenant_id' => $this->tenant->id,
            'nama_bank' => 'Bank Syariah Indonesia (BSI)',
            'nomor_rekening' => '7778889990',
            'atas_nama' => 'PT Travel Berkah',
            'is_active' => true,
        ]);
    }

    public function test_public_registration_requires_mandatory_ktp_and_kk_files(): void
    {
        // Missing files should fail validation
        $response = $this->post(route('public.register.submit'), [
            'nama_lengkap' => 'Ahmad Fulan',
            'no_hp' => '081234567890',
            'paket_id' => $this->paket->id,
        ]);

        $response->assertSessionHasErrors(['file_ktp', 'file_kk']);

        // With mandatory files it succeeds
        $fileKtp = UploadedFile::fake()->create('ktp_ahmad.jpg', 500, 'image/jpeg');
        $fileKk = UploadedFile::fake()->create('kk_ahmad.pdf', 800, 'application/pdf');

        $responseValid = $this->post(route('public.register.submit'), [
            'nama_lengkap' => 'Ahmad Fulan',
            'jenis_kelamin' => 'L',
            'no_hp' => '081234567890',
            'email' => 'ahmad@example.com',
            'nik' => '3201123456789012',
            'paket_id' => $this->paket->id,
            'file_ktp' => $fileKtp,
            'file_kk' => $fileKk,
        ]);

        $responseValid->assertRedirect();
        $this->assertDatabaseHas('jamaah', [
            'nama_lengkap' => 'Ahmad Fulan',
            'email' => 'ahmad@example.com',
            'tenant_id' => $this->tenant->id,
        ]);

        $this->assertDatabaseHas('jamaah_documents', [
            'type' => 'ktp',
            'tenant_id' => $this->tenant->id,
        ]);
        $this->assertDatabaseHas('jamaah_documents', [
            'type' => 'kk',
            'tenant_id' => $this->tenant->id,
        ]);
    }

    public function test_inventory_stock_update_bug_fix_and_transaction_audit(): void
    {
        $this->actingAs($this->owner);

        $item = Inventaris::create([
            'tenant_id' => $this->tenant->id,
            'nama_barang' => 'Koper Fiber 24 Inch',
            'sku' => 'INV-KOP-001',
            'stok_tersedia' => 20,
            'stok_minimum' => 5,
        ]);

        // Update stock directly in master data form
        $response = $this->put(route('inventaris.update', $item->id), [
            'nama_barang' => 'Koper Fiber 24 Inch Premium',
            'stok_tersedia' => 35, // +15 difference
            'stok_minimum' => 5,
        ]);

        $response->assertRedirect();
        $item->refresh();

        $this->assertEquals(35, $item->stok_tersedia);
        $this->assertEquals('Koper Fiber 24 Inch Premium', $item->nama_barang);

        // Transaction log was automatically recorded
        $this->assertDatabaseHas('inventaris_transaksi', [
            'inventaris_id' => $item->id,
            'qty' => 15,
            'tipe' => 'IN',
        ]);
    }

    public function test_payment_approval_dispatches_invoice_email_to_jamaah(): void
    {
        $this->actingAs($this->owner);

        $jamaah = Jamaah::create([
            'tenant_id' => $this->tenant->id,
            'crm_stage_id' => $this->stage->id,
            'paket_id' => $this->paket->id,
            'nama_lengkap' => 'Siti Khadijah',
            'email' => 'siti@example.com',
            'no_hp' => '081298765432',
        ]);

        $pembayaran = Pembayaran::create([
            'tenant_id' => $this->tenant->id,
            'jamaah_id' => $jamaah->id,
            'rekening_tenant_id' => $this->bank->id,
            'tipe_pembayaran' => 'DP',
            'nominal' => 5000000,
            'status_verifikasi' => 'Pending',
        ]);

        // Verify and Approve payment
        $response = $this->post(route('payment.verify', $pembayaran->id), [
            'status' => 'Verified',
        ]);

        $response->assertRedirect();
        $pembayaran->refresh();

        $this->assertEquals('Verified', $pembayaran->status_verifikasi);

        // Verify that PaymentApprovedInvoiceMail was queued for sending
        Mail::assertQueued(PaymentApprovedInvoiceMail::class, function ($mail) use ($jamaah) {
            return $mail->hasTo($jamaah->email);
        });
    }

    public function test_item_distribution_handover_checklist(): void
    {
        $this->actingAs($this->owner);

        $item = Inventaris::create([
            'tenant_id' => $this->tenant->id,
            'nama_barang' => 'Kain Ihram Pria',
            'sku' => 'INV-IHR-001',
            'stok_tersedia' => 50,
            'stok_minimum' => 10,
        ]);

        $jamaah = Jamaah::create([
            'tenant_id' => $this->tenant->id,
            'crm_stage_id' => $this->stage->id,
            'paket_id' => $this->paket->id,
            'nama_lengkap' => 'Ust. Umar',
            'no_hp' => '081233445566',
            'status_logistik' => 'Pending',
        ]);

        // Handover item
        $response = $this->post(route('crm.logistics.item-handover', $jamaah->id), [
            'inventaris_id' => $item->id,
            'status' => 'Delivered',
            'receiver_name' => 'Ust. Umar',
            'notes' => 'Diambil langsung di kantor cabang',
        ]);

        $response->assertRedirect();

        $this->assertDatabaseHas('item_distributions', [
            'jamaah_id' => $jamaah->id,
            'inventaris_id' => $item->id,
            'status' => 'Delivered',
            'receiver_name' => 'Ust. Umar',
        ]);
    }

    public function test_document_rbac_settings_and_permissions(): void
    {
        $this->actingAs($this->owner);

        $response = $this->post(route('settings.master.document-permissions'), [
            'permissions' => [
                [
                    'role_name' => 'agen',
                    'document_type' => 'visa',
                    'can_view' => true,
                    'can_upload' => false,
                    'can_delete' => false,
                ],
            ],
        ]);

        $response->assertRedirect();

        $this->assertDatabaseHas('document_permissions', [
            'tenant_id' => $this->tenant->id,
            'role_name' => 'agen',
            'document_type' => 'visa',
            'can_upload' => false,
        ]);
    }

    public function test_crm_lead_creation_requires_mandatory_ktp_and_kk_with_optional_foto_and_paspor(): void
    {
        $this->actingAs($this->owner);

        // Missing KTP and KK files should fail validation
        $response = $this->post(route('crm.store'), [
            'crm_stage_id' => $this->stage->id,
            'nama_lengkap' => 'Prospek Tanpa File',
            'no_hp' => '081234567891',
        ]);

        $response->assertSessionHasErrors(['file_ktp', 'file_kk']);

        // With mandatory KTP and KK + optional Foto & Paspor
        $fileKtp = UploadedFile::fake()->create('ktp_calon.jpg', 300, 'image/jpeg');
        $fileKk = UploadedFile::fake()->create('kk_calon.pdf', 500, 'application/pdf');
        $fileFoto = UploadedFile::fake()->create('foto_calon.jpg', 200, 'image/jpeg');
        $filePaspor = UploadedFile::fake()->create('paspor_calon.pdf', 600, 'application/pdf');

        $responseSuccess = $this->post(route('crm.store'), [
            'crm_stage_id' => $this->stage->id,
            'paket_id' => $this->paket->id,
            'nama_lengkap' => 'Prospek Lengkap',
            'email' => 'prospek@example.com',
            'no_hp' => '081234567892',
            'nik' => '3201998877660001',
            'file_ktp' => $fileKtp,
            'file_kk' => $fileKk,
            'file_foto' => $fileFoto,
            'file_paspor' => $filePaspor,
        ]);

        $responseSuccess->assertRedirect();
        $this->assertDatabaseHas('jamaah', [
            'tenant_id' => $this->tenant->id,
            'nama_lengkap' => 'Prospek Lengkap',
            'email' => 'prospek@example.com',
        ]);

        $this->assertDatabaseHas('jamaah_documents', [
            'tenant_id' => $this->tenant->id,
            'type' => 'ktp',
        ]);
        $this->assertDatabaseHas('jamaah_documents', [
            'tenant_id' => $this->tenant->id,
            'type' => 'kk',
        ]);
        $this->assertDatabaseHas('jamaah_documents', [
            'tenant_id' => $this->tenant->id,
            'type' => 'foto',
        ]);
        $this->assertDatabaseHas('jamaah_documents', [
            'tenant_id' => $this->tenant->id,
            'type' => 'paspor',
        ]);
    }

    public function test_public_registration_with_dp_and_bukti_transfer_upload(): void
    {
        $fileKtp = UploadedFile::fake()->create('ktp_ahmad.jpg', 500, 'image/jpeg');
        $fileKk = UploadedFile::fake()->create('kk_ahmad.pdf', 800, 'application/pdf');
        $fileBukti = UploadedFile::fake()->create('struk_transfer_bsi.jpg', 400, 'image/jpeg');

        $response = $this->post(route('public.register.submit'), [
            'nama_lengkap' => 'Fulan bin Fulan',
            'jenis_kelamin' => 'L',
            'no_hp' => '081299998888',
            'email' => 'fulan@example.com',
            'paket_id' => $this->paket->id,
            'rekening_tenant_id' => $this->bank->id,
            'nominal_dp' => 5000000,
            'file_ktp' => $fileKtp,
            'file_kk' => $fileKk,
            'bukti_transfer' => $fileBukti,
        ]);

        $response->assertRedirect();

        $this->assertDatabaseHas('jamaah', [
            'tenant_id' => $this->tenant->id,
            'nama_lengkap' => 'Fulan bin Fulan',
        ]);

        $this->assertDatabaseHas('pembayaran', [
            'tenant_id' => $this->tenant->id,
            'nominal' => 5000000,
            'tipe_pembayaran' => 'DP',
            'status_verifikasi' => 'Pending',
        ]);

        $this->assertDatabaseHas('jamaah_documents', [
            'tenant_id' => $this->tenant->id,
            'type' => 'pembayaran',
        ]);
    }
}
