<?php

namespace Tests\Feature;

use App\Models\CrmStage;
use App\Models\Jamaah;
use App\Models\Paket;
use App\Models\Pembayaran;
use App\Models\RekeningTenant;
use App\Models\Tenant;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class DashboardFilterTest extends TestCase
{
    use DatabaseTransactions;

    protected Tenant $tenant;

    protected User $owner;

    protected Paket $paket;

    protected CrmStage $stage;

    protected RekeningTenant $rekening;

    protected function setUp(): void
    {
        parent::setUp();

        $this->tenant = Tenant::create([
            'nama_travel' => 'Travel Filter Test',
            'domain_atau_subdomain' => 'filter-test-'.uniqid(),
        ]);

        $this->owner = User::create([
            'tenant_id' => $this->tenant->id,
            'name' => 'Owner Filter Test',
            'email' => 'owner_filter_'.uniqid().'@test.com',
            'password' => bcrypt('password'),
            'role' => 'owner_travel',
        ]);

        $this->paket = Paket::create([
            'tenant_id' => $this->tenant->id,
            'nama_paket' => 'Paket Reguler 12 Hari',
            'harga' => 30000000,
            'durasi_hari' => 12,
            'status' => 'Aktif',
        ]);

        $this->stage = CrmStage::create([
            'tenant_id' => $this->tenant->id,
            'nama_tahap' => 'Deal / DP',
            'urutan' => 1,
            'color' => '#10b981',
        ]);

        $this->rekening = RekeningTenant::create([
            'tenant_id' => $this->tenant->id,
            'nama_bank' => 'BSI',
            'nomor_rekening' => '7123456789',
            'atas_nama' => 'PT Travel Filter Test',
        ]);
    }

    public function test_dashboard_renders_with_default_this_year_filter(): void
    {
        $response = $this->actingAs($this->owner)->get(route('dashboard'));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Dashboard')
            ->has('filters')
            ->where('filters.period', 'this_year')
            ->has('stats')
            ->has('analytics')
            ->has('availableKloters')
        );
    }

    public function test_dashboard_filters_by_period_and_kloter(): void
    {
        // 1. Create jamaah and payment in current year with specific kloter
        $currentDate = Carbon::now();
        $kloterCurrent = $currentDate->format('Y-m');

        $jamaahCurrent = Jamaah::create([
            'tenant_id' => $this->tenant->id,
            'paket_id' => $this->paket->id,
            'crm_stage_id' => $this->stage->id,
            'nama_lengkap' => 'Jamaah Current Year',
            'nik' => '3201000000000001',
            'no_hp' => '081234567890',
            'jenis_kelamin' => 'L',
            'tanggal_keberangkatan' => $currentDate->format('Y-m-d'),
            'created_at' => $currentDate,
        ]);

        Pembayaran::create([
            'tenant_id' => $this->tenant->id,
            'jamaah_id' => $jamaahCurrent->id,
            'rekening_tenant_id' => $this->rekening->id,
            'nominal' => 5000000,
            'tipe_pembayaran' => 'DP',
            'status_verifikasi' => 'Verified',
            'created_at' => $currentDate,
        ]);

        // 2. Create jamaah in last year with past kloter
        $lastYearDate = Carbon::now()->subYear();
        $kloterLastYear = $lastYearDate->format('Y-m');

        $jamaahPast = Jamaah::create([
            'tenant_id' => $this->tenant->id,
            'paket_id' => $this->paket->id,
            'crm_stage_id' => $this->stage->id,
            'nama_lengkap' => 'Jamaah Last Year',
            'nik' => '3201000000000002',
            'no_hp' => '081234567891',
            'jenis_kelamin' => 'P',
            'tanggal_keberangkatan' => $lastYearDate->format('Y-m-d'),
        ]);
        $jamaahPast->timestamps = false;
        $jamaahPast->created_at = $lastYearDate;
        $jamaahPast->save();

        $pembayaranPast = Pembayaran::create([
            'tenant_id' => $this->tenant->id,
            'jamaah_id' => $jamaahPast->id,
            'rekening_tenant_id' => $this->rekening->id,
            'nominal' => 10000000,
            'tipe_pembayaran' => 'DP',
            'status_verifikasi' => 'Verified',
        ]);
        $pembayaranPast->timestamps = false;
        $pembayaranPast->created_at = $lastYearDate;
        $pembayaranPast->save();

        // Request with this_year
        $respThisYear = $this->actingAs($this->owner)->get(route('dashboard', ['period' => 'this_year']));
        $respThisYear->assertOk();
        $respThisYear->assertInertia(fn (Assert $page) => $page
            ->where('stats.total_leads', 1)
            ->where('stats.total_omzet', 5000000)
        );

        // Request with last_year
        $respLastYear = $this->actingAs($this->owner)->get(route('dashboard', ['period' => 'last_year']));
        $respLastYear->assertOk();
        $respLastYear->assertInertia(fn (Assert $page) => $page
            ->where('stats.total_leads', 1)
            ->where('stats.total_omzet', 10000000)
        );

        // Request with kloter filter
        $respKloter = $this->actingAs($this->owner)->get(route('dashboard', ['kloter_ym' => $kloterCurrent]));
        $respKloter->assertOk();
        $respKloter->assertInertia(fn (Assert $page) => $page
            ->where('stats.total_leads', 1)
            ->where('stats.total_omzet', 5000000)
        );
    }
}
