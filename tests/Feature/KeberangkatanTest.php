<?php

namespace Tests\Feature;

use App\Models\Hotel;
use App\Models\Keberangkatan;
use App\Models\Penerbangan;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class KeberangkatanTest extends TestCase
{
    use DatabaseTransactions;

    protected Tenant $tenant;

    protected User $owner;

    protected function setUp(): void
    {
        parent::setUp();

        $this->tenant = Tenant::create(['nama_travel' => 'Test Travel', 'domain_atau_subdomain' => 'kbr-test']);
        $this->owner = $this->makeUser($this->tenant, 'owner_travel', 'owner-kbr@test.com');
    }

    private function makeUser(Tenant $tenant, string $role, string $email): User
    {
        return User::create([
            'tenant_id' => $tenant->id,
            'name' => $role,
            'email' => $email,
            'password' => bcrypt('password'),
            'role' => $role,
        ]);
    }

    /**
     * @param  array<string, mixed>  $override
     * @return array<string, mixed>
     */
    private function payload(array $override = []): array
    {
        return array_merge([
            'kode' => 'KBR-001',
            'tanggal_berangkat' => '2026-12-01',
            'tanggal_pulang' => '2026-12-10',
            'status' => 'Terbuka',
        ], $override);
    }

    public function test_guest_is_redirected_to_login(): void
    {
        $this->get(route('crm.keberangkatan.index'))->assertRedirect(route('login'));
    }

    public function test_agent_cannot_access_any_endpoint(): void
    {
        $agent = $this->makeUser($this->tenant, 'agen', 'agen-kbr@test.com');

        $this->actingAs($agent)->get(route('crm.keberangkatan.index'))->assertForbidden();
        $this->actingAs($agent)->post(route('crm.keberangkatan.store'), $this->payload())->assertForbidden();
        $this->actingAs($agent)->post(route('crm.penerbangan.store'), [])->assertForbidden();
        $this->actingAs($agent)->post(route('crm.hotel.store'), [])->assertForbidden();
    }

    public function test_one_departure_can_use_many_flights_and_hotels_from_catalog(): void
    {
        $pergi = Penerbangan::factory()->create(['tenant_id' => $this->tenant->id]);
        $pulang = Penerbangan::factory()->create(['tenant_id' => $this->tenant->id]);
        $makkah = Hotel::factory()->create(['tenant_id' => $this->tenant->id, 'kota' => 'Makkah']);
        $madinah = Hotel::factory()->create(['tenant_id' => $this->tenant->id, 'kota' => 'Madinah']);

        $this->actingAs($this->owner)->post(route('crm.keberangkatan.store'), $this->payload([
            'penerbangan' => [['id' => $pergi->id, 'arah' => 'pergi'], ['id' => $pulang->id, 'arah' => 'pulang']],
            'hotel' => [
                ['id' => $madinah->id, 'check_in' => '2026-12-02', 'check_out' => '2026-12-05'],
                ['id' => $makkah->id, 'check_in' => '2026-12-05', 'check_out' => '2026-12-09'],
            ],
        ]))->assertRedirect();

        $item = Keberangkatan::where('kode', 'KBR-001')->firstOrFail();
        $this->assertSame($this->tenant->id, $item->tenant_id);
        $this->assertCount(2, $item->penerbangan);
        $this->assertCount(2, $item->hotel);
        $this->assertSame('pulang', $item->penerbangan->firstWhere('id', $pulang->id)->pivot->arah);
    }

    public function test_same_flight_can_serve_multiple_departures(): void
    {
        $flight = Penerbangan::factory()->create(['tenant_id' => $this->tenant->id]);

        foreach (['KBR-A', 'KBR-B'] as $kode) {
            $this->actingAs($this->owner)->post(route('crm.keberangkatan.store'), $this->payload([
                'kode' => $kode,
                'penerbangan' => [['id' => $flight->id, 'arah' => 'pergi']],
            ]))->assertRedirect();
        }

        $this->assertSame(2, $flight->keberangkatan()->count());
    }

    public function test_cannot_attach_other_tenant_catalog(): void
    {
        $other = Tenant::create(['nama_travel' => 'Other', 'domain_atau_subdomain' => 'kbr-other']);
        $foreignFlight = Penerbangan::factory()->create(['tenant_id' => $other->id]);

        $this->actingAs($this->owner)->post(route('crm.keberangkatan.store'), $this->payload([
            'penerbangan' => [['id' => $foreignFlight->id, 'arah' => 'pergi']],
        ]))->assertSessionHasErrors('penerbangan.0.id');
    }

    public function test_return_date_must_not_precede_departure(): void
    {
        $this->actingAs($this->owner)
            ->post(route('crm.keberangkatan.store'), $this->payload(['tanggal_pulang' => '2026-11-30']))
            ->assertSessionHasErrors('tanggal_pulang');
    }

    public function test_code_must_be_unique_per_tenant(): void
    {
        Keberangkatan::factory()->create(['tenant_id' => $this->tenant->id, 'kode' => 'KBR-001']);

        $this->actingAs($this->owner)
            ->post(route('crm.keberangkatan.store'), $this->payload())
            ->assertSessionHasErrors('kode');
    }

    public function test_update_replaces_relations_and_delete_keeps_catalog(): void
    {
        $flight = Penerbangan::factory()->create(['tenant_id' => $this->tenant->id]);
        $item = Keberangkatan::factory()->create(['tenant_id' => $this->tenant->id, 'kode' => 'KBR-001']);
        $item->penerbangan()->attach($flight->id, ['arah' => 'pergi']);

        $this->actingAs($this->owner)
            ->put(route('crm.keberangkatan.update', $item), $this->payload(['penerbangan' => []]))
            ->assertRedirect();
        $this->assertCount(0, $item->fresh()->penerbangan);

        $this->actingAs($this->owner)->delete(route('crm.keberangkatan.destroy', $item))->assertRedirect();
        $this->assertModelMissing($item);
        $this->assertModelExists($flight);
    }

    public function test_cannot_modify_other_tenant_departure(): void
    {
        $other = Tenant::create(['nama_travel' => 'Other', 'domain_atau_subdomain' => 'kbr-other']);
        $item = Keberangkatan::factory()->create(['tenant_id' => $other->id, 'muthawwif' => 'Asli']);

        $this->actingAs($this->owner)
            ->put(route('crm.keberangkatan.update', $item), $this->payload(['muthawwif' => 'Hacked']))
            ->assertClientError();
        $this->actingAs($this->owner)->delete(route('crm.keberangkatan.destroy', $item))->assertClientError();

        $this->assertSame('Asli', $item->fresh()->muthawwif);
    }

    public function test_flight_crud_and_source_marker(): void
    {
        $this->actingAs($this->owner)->post(route('crm.penerbangan.store'), [
            'maskapai' => 'Garuda', 'nomor_penerbangan' => 'GA980', 'bandara_asal' => 'CGK', 'bandara_tujuan' => 'JED',
            'sumber' => 'traveloka', 'sumber_ref' => 'TVL-123', 'sumber_url' => 'https://www.traveloka.com/x',
        ])->assertRedirect();

        $flight = Penerbangan::where('nomor_penerbangan', 'GA980')->firstOrFail();
        $this->assertSame('traveloka', $flight->sumber);

        $this->actingAs($this->owner)->post(route('crm.penerbangan.store'), [
            'maskapai' => 'X', 'nomor_penerbangan' => 'X1', 'bandara_asal' => 'A', 'bandara_tujuan' => 'B', 'sumber' => 'bukan-sumber',
        ])->assertSessionHasErrors('sumber');

        $this->actingAs($this->owner)->put(route('crm.penerbangan.update', $flight), [
            'maskapai' => 'Garuda', 'nomor_penerbangan' => 'GA981', 'bandara_asal' => 'CGK', 'bandara_tujuan' => 'JED', 'sumber' => 'manual',
        ])->assertRedirect();
        $this->assertSame('GA981', $flight->fresh()->nomor_penerbangan);

        $this->actingAs($this->owner)->delete(route('crm.penerbangan.destroy', $flight))->assertRedirect();
        $this->assertModelMissing($flight);
    }

    public function test_hotel_crud_and_cannot_delete_when_used(): void
    {
        $this->actingAs($this->owner)->post(route('crm.hotel.store'), [
            'nama' => 'Swissotel Makkah', 'kota' => 'Makkah', 'bintang' => 5, 'jarak_ke_masjid' => 50, 'sumber' => 'agoda',
        ])->assertRedirect();

        $hotel = Hotel::where('nama', 'Swissotel Makkah')->firstOrFail();
        $item = Keberangkatan::factory()->create(['tenant_id' => $this->tenant->id]);
        $item->hotel()->attach($hotel->id);

        $this->actingAs($this->owner)->delete(route('crm.hotel.destroy', $hotel))->assertSessionHasErrors('hapus');
        $this->assertModelExists($hotel);

        $item->hotel()->detach();
        $this->actingAs($this->owner)->delete(route('crm.hotel.destroy', $hotel))->assertRedirect();
        $this->assertModelMissing($hotel);
    }

    public function test_index_paginates_and_reports_metrics(): void
    {
        Keberangkatan::factory()->count(12)->sequence(
            ['status' => 'Terbuka'], ['status' => 'Penuh'], ['status' => 'Terbuka'],
        )->create(['tenant_id' => $this->tenant->id, 'kuota' => 10]);

        $this->actingAs($this->owner)
            ->get(route('crm.keberangkatan.index', ['per_page' => 10]))
            ->assertInertia(fn ($page) => $page
                ->component('CRM/Keberangkatan')
                ->has('keberangkatan.data', 10)
                ->where('keberangkatan.total', 12)
                ->where('metrics.total', 12)
                ->where('metrics.terbuka', 8)
                ->where('metrics.penuh', 4)
                ->where('metrics.total_kuota', 120));

        $this->actingAs($this->owner)
            ->get(route('crm.keberangkatan.index', ['status' => 'Penuh']))
            ->assertInertia(fn ($page) => $page->where('keberangkatan.total', 4));
    }
}
