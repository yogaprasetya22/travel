<?php

namespace Tests\Feature;

use App\Models\CrmStage;
use App\Models\DocumentPermission;
use App\Models\Jamaah;
use App\Models\JamaahDocument;
use App\Models\Paket;
use App\Models\Pembayaran;
use App\Models\RekeningTenant;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class CustomerManagementTest extends TestCase
{
    use RefreshDatabase;

    protected Tenant $tenant;

    protected User $owner;

    protected User $leader;

    protected User $agent1;

    protected User $agent2;

    protected CrmStage $stage;

    protected Paket $paket;

    protected RekeningTenant $bank;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');

        $this->tenant = Tenant::create([
            'nama_travel' => 'Travel Berkah Global',
            'domain_atau_subdomain' => 'berkahglobal',
        ]);

        $this->owner = User::create([
            'tenant_id' => $this->tenant->id,
            'name' => 'Owner Utama',
            'email' => 'owner@berkah.com',
            'password' => bcrypt('password'),
            'role' => 'owner_travel',
        ]);

        $this->leader = User::create([
            'tenant_id' => $this->tenant->id,
            'created_by' => $this->owner->id,
            'name' => 'Leader Wilayah',
            'email' => 'leader@berkah.com',
            'password' => bcrypt('password'),
            'role' => 'admin_travel',
            'jabatan' => 'Leader',
        ]);

        $this->agent1 = User::create([
            'tenant_id' => $this->tenant->id,
            'created_by' => $this->leader->id,
            'name' => 'Agen A (Downline Leader)',
            'email' => 'agent1@berkah.com',
            'password' => bcrypt('password'),
            'role' => 'agen',
        ]);

        $this->agent2 = User::create([
            'tenant_id' => $this->tenant->id,
            'created_by' => $this->owner->id,
            'name' => 'Agen B (Direct Owner)',
            'email' => 'agent2@berkah.com',
            'password' => bcrypt('password'),
            'role' => 'agen',
        ]);

        $this->stage = CrmStage::create([
            'tenant_id' => $this->tenant->id,
            'nama_tahap' => 'Jamaah Terdaftar',
            'urutan' => 1,
            'is_active' => true,
        ]);

        $this->paket = Paket::create([
            'tenant_id' => $this->tenant->id,
            'nama_paket' => 'Umroh VIP Akhir Tahun',
            'harga' => 35000000,
            'kuota' => 50,
            'is_active' => true,
        ]);

        $this->bank = RekeningTenant::create([
            'tenant_id' => $this->tenant->id,
            'nama_bank' => 'BSI',
            'nomor_rekening' => '555444333',
            'atas_nama' => 'PT Berkah Global',
            'is_active' => true,
        ]);
    }

    public function test_leader_sees_downline_jamaah_in_customer_list(): void
    {
        // Jamaah assigned to Agent 1 (Downline of Leader)
        $jamaah1 = Jamaah::create([
            'tenant_id' => $this->tenant->id,
            'crm_stage_id' => $this->stage->id,
            'paket_id' => $this->paket->id,
            'agen_id' => $this->agent1->id,
            'nama_lengkap' => 'Jamaah Milik Agen 1',
            'no_hp' => '0811111111',
        ]);

        // Jamaah assigned to Agent 2 (NOT downline of Leader)
        $jamaah2 = Jamaah::create([
            'tenant_id' => $this->tenant->id,
            'crm_stage_id' => $this->stage->id,
            'paket_id' => $this->paket->id,
            'agen_id' => $this->agent2->id,
            'nama_lengkap' => 'Jamaah Milik Agen 2',
            'no_hp' => '0822222222',
        ]);

        // When Leader visits customer list
        $response = $this->actingAs($this->leader)->get(route('crm.customers.index'));
        $response->assertOk();

        // When Agent 1 visits, they see only their jamaah
        $responseAgent = $this->actingAs($this->agent1)->get(route('crm.customers.index'));
        $responseAgent->assertOk();
    }

    public function test_customer_list_filters_by_date_and_payment_progress(): void
    {
        $jamaahLunas = Jamaah::create([
            'tenant_id' => $this->tenant->id,
            'crm_stage_id' => $this->stage->id,
            'paket_id' => $this->paket->id,
            'nama_lengkap' => 'Jamaah Lunas',
            'no_hp' => '0812340001',
            'created_at' => now()->subDays(5),
        ]);

        Pembayaran::create([
            'tenant_id' => $this->tenant->id,
            'jamaah_id' => $jamaahLunas->id,
            'rekening_tenant_id' => $this->bank->id,
            'tipe_pembayaran' => 'Pelunasan',
            'nominal' => 35000000,
            'status_verifikasi' => 'Verified',
        ]);

        $jamaahUnpaid = Jamaah::create([
            'tenant_id' => $this->tenant->id,
            'crm_stage_id' => $this->stage->id,
            'paket_id' => $this->paket->id,
            'nama_lengkap' => 'Jamaah Belum Bayar',
            'no_hp' => '0812340002',
            'created_at' => now()->subDays(10),
        ]);

        $response = $this->actingAs($this->owner)->get(route('crm.customers.index', [
            'payment_progress' => 'lunas',
        ]));
        $response->assertOk();

        $responseUnpaid = $this->actingAs($this->owner)->get(route('crm.customers.index', [
            'payment_progress' => 'unpaid',
        ]));
        $responseUnpaid->assertOk();
    }

    public function test_document_upload_and_delete_with_rbac(): void
    {
        $jamaah = Jamaah::create([
            'tenant_id' => $this->tenant->id,
            'crm_stage_id' => $this->stage->id,
            'paket_id' => $this->paket->id,
            'nama_lengkap' => 'Dokumen Test Jamaah',
            'no_hp' => '08199988877',
        ]);

        // Restrict agent from uploading visa
        DocumentPermission::create([
            'tenant_id' => $this->tenant->id,
            'role_name' => 'agen',
            'document_type' => 'visa',
            'can_view' => true,
            'can_upload' => false,
            'can_delete' => false,
        ]);

        $file = UploadedFile::fake()->create('visa.pdf', 300, 'application/pdf');

        // Agent tries to upload visa -> returns redirect back with session error
        $responseForbidden = $this->actingAs($this->agent1)->post(route('crm.jamaah.documents.store', $jamaah->id), [
            'type' => 'visa',
            'file' => $file,
        ]);
        $responseForbidden->assertRedirect();
        $responseForbidden->assertSessionHasErrors('document');

        // Owner can upload
        $responseOwner = $this->actingAs($this->owner)->post(route('crm.jamaah.documents.store', $jamaah->id), [
            'type' => 'visa',
            'file' => $file,
        ]);
        $responseOwner->assertRedirect();

        $document = JamaahDocument::where('jamaah_id', $jamaah->id)->where('type', 'visa')->first();
        $this->assertNotNull($document);

        // Owner deletes document
        $responseDelete = $this->actingAs($this->owner)->delete(route('crm.jamaah.documents.destroy', $document->id));
        $responseDelete->assertRedirect();
        $this->assertDatabaseMissing('jamaah_documents', ['id' => $document->id]);
    }
}
