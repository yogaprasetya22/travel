<?php

namespace Tests\Feature;

use App\Mail\PaymentApprovedInvoiceMail;
use App\Models\CrmStage;
use App\Models\Jamaah;
use App\Models\Paket;
use App\Models\Pembayaran;
use App\Models\RekeningTenant;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class PaymentVerificationWorkflowTest extends TestCase
{
    use RefreshDatabase;

    protected Tenant $tenant;

    protected User $owner;

    protected User $staff;

    protected CrmStage $stage;

    protected Paket $paket;

    protected RekeningTenant $bank;

    protected Jamaah $jamaah;

    protected function setUp(): void
    {
        parent::setUp();
        Mail::fake();

        $this->tenant = Tenant::create([
            'nama_travel' => 'Berkah Travel Finance',
            'domain_atau_subdomain' => 'berkahfinance',
        ]);

        $this->owner = User::create([
            'tenant_id' => $this->tenant->id,
            'name' => 'Owner Finance',
            'email' => 'owner@finance.com',
            'password' => bcrypt('password'),
            'role' => 'owner_travel',
        ]);

        $this->staff = User::create([
            'tenant_id' => $this->tenant->id,
            'name' => 'Staff Keuangan',
            'email' => 'staff@finance.com',
            'password' => bcrypt('password'),
            'role' => 'admin_travel',
            'jabatan' => 'Staff Keuangan',
        ]);

        $this->stage = CrmStage::create([
            'tenant_id' => $this->tenant->id,
            'nama_tahap' => 'Tahap Verifikasi',
            'urutan' => 1,
            'is_active' => true,
        ]);

        $this->paket = Paket::create([
            'tenant_id' => $this->tenant->id,
            'nama_paket' => 'Umroh VIP Bintang 5',
            'harga' => 45000000,
            'kuota' => 25,
            'is_active' => true,
        ]);

        $this->bank = RekeningTenant::create([
            'tenant_id' => $this->tenant->id,
            'nama_bank' => 'Bank Mandiri',
            'nomor_rekening' => '1400012345678',
            'atas_nama' => 'PT Berkah Finance',
            'is_active' => true,
        ]);

        $this->jamaah = Jamaah::create([
            'tenant_id' => $this->tenant->id,
            'crm_stage_id' => $this->stage->id,
            'paket_id' => $this->paket->id,
            'nama_lengkap' => 'Bapak Abdullah',
            'email' => 'abdullah@example.com',
            'no_hp' => '081299998888',
        ]);
    }

    public function test_payment_approval_updates_status_and_sends_invoice_mail(): void
    {
        $pembayaran = Pembayaran::create([
            'tenant_id' => $this->tenant->id,
            'jamaah_id' => $this->jamaah->id,
            'rekening_tenant_id' => $this->bank->id,
            'tipe_pembayaran' => 'DP',
            'nominal' => 10000000,
            'status_verifikasi' => 'Pending',
        ]);

        $response = $this->actingAs($this->owner)->post(route('payment.verify', $pembayaran->id), [
            'status' => 'Verified',
        ]);

        $response->assertRedirect();
        $pembayaran->refresh();

        $this->assertEquals('Verified', $pembayaran->status_verifikasi);

        Mail::assertQueued(PaymentApprovedInvoiceMail::class, function ($mail) {
            return $mail->hasTo('abdullah@example.com') &&
                   $mail->pembayaran->nominal == 10000000;
        });
    }

    public function test_payment_rejection_updates_status_without_sending_invoice_mail(): void
    {
        $pembayaran = Pembayaran::create([
            'tenant_id' => $this->tenant->id,
            'jamaah_id' => $this->jamaah->id,
            'rekening_tenant_id' => $this->bank->id,
            'tipe_pembayaran' => 'Cicilan',
            'nominal' => 5000000,
            'status_verifikasi' => 'Pending',
        ]);

        $response = $this->actingAs($this->owner)->post(route('payment.verify', $pembayaran->id), [
            'status' => 'Rejected',
        ]);

        $response->assertRedirect();
        $pembayaran->refresh();

        $this->assertEquals('Rejected', $pembayaran->status_verifikasi);
        Mail::assertNothingQueued();
    }
}
