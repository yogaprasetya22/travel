<?php

namespace Database\Seeders;

use App\Models\Hotel;
use App\Models\Keberangkatan;
use App\Models\Paket;
use App\Models\Penerbangan;
use App\Models\Tenant;
use Illuminate\Database\Seeder;

/**
 * Data contoh: 100 keberangkatan umrah dari katalog penerbangan & hotel.
 * Jadwal & jarak yang ada diambil dari pencarian web (trip.com, booking.com, idxchannel, accor); harga sengaja dikosongkan.
 */
class KeberangkatanDummySeeder extends Seeder
{
    private const TOTAL = 100;

    public function run(): void
    {
        $tenant = Tenant::where('domain_atau_subdomain', 'setiaharamaintour')->first();

        if (! $tenant) {
            $this->command?->warn('Tenant setiaharamaintour belum ada, jalankan SetiaHaramainTourSeeder dulu.');

            return;
        }

        app()->instance('tenant', $tenant);

        $makkah = $this->hotels($tenant->id, [
            ['makkah_fairmont', 'Makkah Clock Royal Tower, A Fairmont Hotel', 50, 'https://www.idxchannel.com/syariah/10-hotel-di-mekkah-dekat-masjidil-haram-yang-direkomendasikan/all'],
            ['makkah_swissotel', 'Swissotel Makkah', 100, 'https://www.booking.com/fivestars/city/sa/mecca.html'],
            ['makkah_pullman', 'Pullman ZamZam Makkah', 320, 'https://all.accor.com/hotel/6036/index.id.shtml'],
            ['makkah_almaqam', 'Swissôtel Al Maqam Makkah', 330, 'https://id.trip.com/hotels/landmark/sa/masjid-al-haram.html'],
            ['makkah_raffles', 'Raffles Makkah Palace', null, null],
            ['makkah_hyatt', 'Hyatt Regency Makkah Jabal Omar', null, null],
        ], 'Makkah');

        $madinah = $this->hotels($tenant->id, [
            ['madinah_anwar', 'Anwar Al Madinah Mövenpick', null, 'https://movenpick.accor.com/en/middle-east/saudi-arabia/madinah/hotel-madinah-anwar.html'],
            ['madinah_dartaqwa', 'Dar Al Taqwa Hotel', null, 'https://hotelscombined.ca/Place/Medinah.htm'],
            ['madinah_pullman', 'Pullman ZamZam Madinah', null, null],
            ['madinah_shaza', 'Shaza Al Madina', null, null],
            ['madinah_crowne', 'Crowne Plaza Madinah', null, null],
        ], 'Madinah');

        $pakets = Paket::where('tenant_id', $tenant->id)->where('is_active', true)->orderBy('id')->limit(3)->get()
            ->map(fn (Paket $paket, int $i) => ['model' => $paket, 'hari' => [9, 12, 12][$i]]);

        if ($pakets->count() < 3) {
            $this->command?->warn('Paket tenant kurang dari 3, jalankan SetiaHaramainTourSeeder dulu.');

            return;
        }

        $muthawwif = ['Ustadz Fauzan Hakim, Lc', 'Ustadz Abdurrahman Siddiq, Lc', 'Ustadz Hanif Maulana, MA'];
        $tourLeader = ['H. Rahmat Hidayat, S.Ag', 'Hj. Siti Aminah', 'Ahmad Zaki Fuadi'];
        $start = strtotime('2026-11-05');

        for ($i = 0; $i < self::TOTAL; $i++) {
            $group = intdiv($i, 3);
            $paket = $pakets[$i % 3];
            $berangkat = date('Y-m-d', strtotime("+{$group} weeks +{$group} days", $start));
            $pulang = date('Y-m-d', strtotime("{$berangkat} +".($paket['hari'] - 1).' days'));
            $kode = 'KBR-'.date('ymd', strtotime($berangkat)).'-'.['R', 'V', 'P'][$i % 3];

            $keberangkatan = Keberangkatan::firstOrCreate(
                ['tenant_id' => $tenant->id, 'kode' => $kode],
                [
                    'paket_id' => $paket['model']->id,
                    'tanggal_berangkat' => $berangkat,
                    'tanggal_pulang' => $pulang,
                    'status' => $i % 10 === 0 ? 'Draft' : ($i % 7 === 0 ? 'Penuh' : 'Terbuka'),
                    'kuota' => 40 + ($i % 3) * 2,
                    'muthawwif' => $muthawwif[$i % 3],
                    'tour_leader' => $tourLeader[($i + 1) % 3],
                    'transportasi' => $i % 3 === 0 ? 'Bus AC Full' : 'Bus VIP AC Full',
                ]
            );

            $pergi = $this->flight($tenant->id, $berangkat, 'SV817', 'CGK', 'JED', "{$berangkat} 09:10", "{$berangkat} 14:25");
            $kembali = $this->flight($tenant->id, $pulang, 'SV818', 'JED', 'CGK', "{$pulang} 01:55", "{$pulang} 16:00");
            $keberangkatan->penerbangan()->syncWithoutDetaching([
                $pergi->id => ['arah' => 'pergi'],
                $kembali->id => ['arah' => 'pulang'],
            ]);

            $hotelMadinah = $madinah[$i % count($madinah)];
            $hotelMakkah = $makkah[$i % count($makkah)];
            $nightsMadinah = $paket['hari'] > 9 ? 4 : 3;
            $keberangkatan->hotel()->syncWithoutDetaching([
                $hotelMadinah->id => [
                    'check_in' => date('Y-m-d', strtotime("{$berangkat} +1 day")),
                    'check_out' => date('Y-m-d', strtotime("{$berangkat} +".(1 + $nightsMadinah).' days')),
                ],
                $hotelMakkah->id => [
                    'check_in' => date('Y-m-d', strtotime("{$berangkat} +".(1 + $nightsMadinah).' days')),
                    'check_out' => date('Y-m-d', strtotime("{$pulang} -1 day")),
                ],
            ]);
        }
    }

    /**
     * @param  array<int, array{0: string, 1: string, 2: int|null, 3: string|null}>  $rows
     * @return array<int, Hotel>
     */
    private function hotels(int $tenantId, array $rows, string $kota): array
    {
        return array_map(fn ($row) => Hotel::firstOrCreate(
            ['tenant_id' => $tenantId, 'sumber' => 'lainnya', 'sumber_ref' => $row[0]],
            ['nama' => $row[1], 'kota' => $kota, 'bintang' => 5, 'jarak_ke_masjid' => $row[2], 'sumber_url' => $row[3]]
        ), $rows);
    }

    private function flight(int $tenantId, string $tanggal, string $nomor, string $asal, string $tujuan, string $berangkat, string $tiba): Penerbangan
    {
        return Penerbangan::firstOrCreate(
            ['tenant_id' => $tenantId, 'sumber' => 'lainnya', 'sumber_ref' => "{$nomor}-{$tanggal}"],
            [
                'maskapai' => 'Saudia',
                'nomor_penerbangan' => $nomor,
                'bandara_asal' => $asal,
                'bandara_tujuan' => $tujuan,
                'waktu_berangkat' => $berangkat,
                'waktu_tiba' => $tiba,
                'sumber_url' => 'https://www.flightstats.com/v2/flight-details/SV/'.substr($nomor, 2),
            ]
        );
    }
}
