<?php

namespace Database\Seeders;

use App\Models\Paket;
use Illuminate\Database\Seeder;

class PaketRundownSeeder extends Seeder
{
    /**
     * Run the database seeds to populate rich itineraries & daily rundowns for all packages.
     */
    public function run(): void
    {
        // 1. Rundown untuk Paket Umroh Reguler 9 Hari
        $rundownReguler9Hari = [
            [
                'day' => 1,
                'title' => 'Keberangkatan Jakarta Menuju Madinah',
                'location' => 'Bandara Soekarno Hatta - Madinah',
                'description' => 'Berkumpul di Bandara Internasional Soekarno-Hatta (Terminal 3). Penerbangan langsung menuju Bandara Internasional Madinah. Tiba di Madinah, proses imigrasi dan check-in hotel.',
                'rundowns' => [
                    ['time' => '08:00', 'activity' => 'Briefing & penyerahan paspor di lounge bandara', 'notes' => 'Terminal 3 Ultimate'],
                    ['time' => '12:30', 'activity' => 'Take-off penerbangan menuju Madinah', 'notes' => 'Makan di pesawat'],
                    ['time' => '18:30', 'activity' => 'Tiba di Madinah & proses bagasi', 'notes' => 'Airport handling resmi'],
                    ['time' => '20:30', 'activity' => 'Check-in hotel & makan malam', 'notes' => 'Istirahat persiapan ibadah'],
                ],
            ],
            [
                'day' => 2,
                'title' => 'Ziarah Raudhah Syarifah & Masjid Nabawi',
                'location' => 'Masjid Nabawi, Madinah',
                'description' => 'Ibadah Sholat Fardhu berjamaah di Masjid Nabawi. Mengikuti ziarah makam Rasulullah SAW, Sayyidina Abu Bakar Ash-Shiddiq, Umar bin Khattab, dan Ibadah di Raudhah (Taman Surga) dengan bimbingan Muthawwif.',
                'rundowns' => [
                    ['time' => '04:00', 'activity' => 'Qiyamullail & Sholat Subuh berjamaah', 'notes' => 'Masjid Nabawi'],
                    ['time' => '07:30', 'activity' => 'Ziarah Makam Baqi & Sekitar Nabawi', 'notes' => 'Dipandu Muthawwif'],
                    ['time' => '10:00', 'activity' => 'Masuk Raudhah sesuai jadwal Tasreh', 'notes' => 'Sesuai barcode Nusuk'],
                    ['time' => '20:00', 'activity' => 'Tausiyah penguatan makna hijrah di hotel', 'notes' => 'Ruang pertemuan hotel'],
                ],
            ],
            [
                'day' => 3,
                'title' => 'City Tour & Ziarah Bersejarah Kota Madinah',
                'location' => 'Quba, Uhud, Qiblatain & Kebun Kurma',
                'description' => 'Mengunjungi Masjid Quba (shalat sunnah pahala setara umroh), Jabal Uhud & Makam Syuhada Uhud, Masjid Qiblatain, dan wisata belanja kurma segar di Perkebunan Kurma Madinah.',
                'rundowns' => [
                    ['time' => '07:00', 'activity' => 'Ziarah Masjid Quba & Shalat Sunnah 2 Rakaat', 'notes' => 'Pahala setara umroh'],
                    ['time' => '09:00', 'activity' => 'Ziarah Jabal Uhud & Makam Syuhada Uhud', 'notes' => 'Tadabbur perang Uhud'],
                    ['time' => '10:30', 'activity' => 'Kunjungan Kebun Kurma Madinah', 'notes' => 'Belanja oleh-oleh kurma'],
                    ['time' => '16:00', 'activity' => 'Ibadah mandiri Ashar & Maghrib di Nabawi', 'notes' => 'Memperbanyak shalawat'],
                ],
            ],
            [
                'day' => 4,
                'title' => 'Mengambil Miqat di Bir Ali & Menuju Kota Suci Makkah (Umroh Ke-1)',
                'location' => 'Bir Ali - Makkah Al-Mukarramah',
                'description' => 'Mandi ihram di hotel Madinah. Berangkat menuju Masjid Dzulhulaifah (Bir Ali) untuk berniat ihram dan mengambil miqat umroh. Melanjutkan perjalanan ke Makkah menggunakan Bus AC VIP / Kereta Cepat Haramain. Tiba di Makkah, check-in hotel, dan melaksanakan prosesi Umroh Pertama (Thawaf, Sa’i, dan Tahallul).',
                'rundowns' => [
                    ['time' => '09:00', 'activity' => 'Mandi Ihram & persiapan koper di hotel', 'notes' => 'Pakaian ihram siap'],
                    ['time' => '11:00', 'activity' => 'Shalat Sunnah Ihram & Niat Miqat di Bir Ali', 'notes' => 'Menjaga larangan ihram'],
                    ['time' => '14:00', 'activity' => 'Perjalanan darat menuju Makkah', 'notes' => 'Talbiyah bersama di bus'],
                    ['time' => '18:00', 'activity' => 'Tiba di Makkah & check-in hotel', 'notes' => 'Makan malam sejenak'],
                    ['time' => '20:30', 'activity' => 'Pelaksanaan Umroh Pertama (Thawaf, Sa\'i, Tahallul)', 'notes' => 'Dipandu Muthawwif hingga selesai'],
                ],
            ],
            [
                'day' => 5,
                'title' => 'Memperbanyak Ibadah Khusyuk di Masjidil Haram',
                'location' => 'Masjidil Haram, Makkah',
                'description' => 'Fokus memperbanyak ibadah wajib dan sunnah di depan Ka’bah, Thawaf sunnah, tadarus Al-Qur’an, istighfar, dan minum air Zamzam sepuasnya.',
                'rundowns' => [
                    ['time' => '03:30', 'activity' => 'Qiyamullail & Sholat Subuh di depan Ka\'bah', 'notes' => 'Masjidil Haram'],
                    ['time' => '09:00', 'activity' => 'Bimbingan evaluasi ibadah & konsultasi fiqih', 'notes' => 'Lobby lounge hotel'],
                    ['time' => '15:00', 'activity' => 'Thawaf Sunnah & doa di Multazam / Hijir Ismail', 'notes' => 'Kondisional keramaian'],
                ],
            ],
            [
                'day' => 6,
                'title' => 'Ziarah Kota Makkah & Pelaksanaan Umroh Ke-2 (Miqat Ji\'ranah)',
                'location' => 'Arafah, Muzdalifah, Mina, Ji\'ranah',
                'description' => 'Ziarah napak tilas rute haji: Padang Arafah (Jabal Rahmah), Muzdalifah, Mina, dan Jabal Tsur. Menuju Masjid Ji’ranah bagi jamaah yang ingin mengambil Miqat untuk melaksanakan Umroh Kedua.',
                'rundowns' => [
                    ['time' => '07:00', 'activity' => 'Napak tilas Arafah & Jabal Rahmah', 'notes' => 'Doa bersama jamaah'],
                    ['time' => '09:00', 'activity' => 'Melewati Muzdalifah & Mina (Tenda Haji)', 'notes' => 'Edukasi manasik haji'],
                    ['time' => '10:30', 'activity' => 'Niat Miqat di Masjid Ji\'ranah', 'notes' => 'Bagi yang umroh ke-2'],
                    ['time' => '14:00', 'activity' => 'Pelaksanaan Umroh Ke-2 di Masjidil Haram', 'notes' => 'Thawaf, Sa\'i & Tahallul'],
                ],
            ],
            [
                'day' => 7,
                'title' => 'Ibadah Mandiri & City Tour Makkah',
                'location' => 'Masjidil Haram & Pusat Perbelanjaan Makkah',
                'description' => 'Ibadah bebas di Masjidil Haram. Jamaah dapat berbelanja kurma, minyak wangi, dan cenderamata khas tanah suci di sekitar Clock Tower Makkah.',
                'rundowns' => [
                    ['time' => '04:00', 'activity' => 'Shalat Subuh & Thawaf Sunnah pagi hari', 'notes' => 'Masjidil Haram'],
                    ['time' => '10:00', 'activity' => 'Wisata belanja cenderamata & oleh-oleh', 'notes' => 'Pusat belanja Souq'],
                    ['time' => '17:00', 'activity' => 'Ibadah Maghrib & Isya berjamaah', 'notes' => 'Masjidil Haram'],
                ],
            ],
            [
                'day' => 8,
                'title' => 'Thawaf Wada’ & Perjalanan ke Bandara Jeddah',
                'location' => 'Makkah - Corniche Jeddah - Bandara',
                'description' => 'Melaksanakan Thawaf Wada’ (thawaf perpisahan dengan Ka’bah). Check-out hotel dan perjalanan ke Jeddah. City Tour singkat di Corniche Jeddah / Balad dan menuju Bandara King Abdulaziz.',
                'rundowns' => [
                    ['time' => '06:00', 'activity' => 'Pelaksanaan Thawaf Wada\' bersama', 'notes' => 'Thawaf perpisahan'],
                    ['time' => '10:00', 'activity' => 'Check-out hotel & perjalanan ke Jeddah', 'notes' => 'Bus AC Pariwisata'],
                    ['time' => '13:00', 'activity' => 'City tour singkat Corniche & Laut Merah', 'notes' => 'Jeddah City Tour'],
                    ['time' => '17:00', 'activity' => 'Tiba di Bandara Internasional King Abdulaziz', 'notes' => 'Proses check-in tiket & bagasi'],
                    ['time' => '21:00', 'activity' => 'Penerbangan kembali menuju Jakarta', 'notes' => 'Direct Flight'],
                ],
            ],
            [
                'day' => 9,
                'title' => 'Tiba di Jakarta (Tanah Air)',
                'location' => 'Bandara Soekarno-Hatta (CGK), Tangerang',
                'description' => 'Mendarat di Bandara Internasional Soekarno-Hatta Jakarta dengan selamat. Pembagian Air Zamzam resmi (5 liter) dan penutupan program oleh tour leader.',
                'rundowns' => [
                    ['time' => '11:30', 'activity' => 'Mendarat di Terminal 3 Bandara Soetta', 'notes' => 'Imigrasi & Bea Cukai'],
                    ['time' => '13:00', 'activity' => 'Pengambilan Air Zamzam 5L & Foto bersama', 'notes' => 'Alhamdulillah Umroh Mabrur'],
                ],
            ],
        ];

        // 2. Rundown untuk Paket Umroh VIP Bintang 5 (12 Hari)
        $rundownVIP12Hari = [
            [
                'day' => 1,
                'title' => 'Penerbangan VIP Jakarta - Madinah',
                'location' => 'Jakarta - Madinah',
                'description' => 'Keberangkatan dengan maskapai bintang 5 Saudia / Garuda Indonesia langsung menuju Madinah.',
                'rundowns' => [
                    ['time' => '09:00', 'activity' => 'Lounge VIP Bandara Soekarno Hatta', 'notes' => 'Handling khusus'],
                    ['time' => '13:00', 'activity' => 'Penerbangan Direct ke Madinah', 'notes' => 'Full Service In-flight Meals'],
                    ['time' => '19:00', 'activity' => 'Check-in Hotel Bintang 5 Pelataran Nabawi', 'notes' => 'Dar Al Taqwa / Setaraf'],
                ],
            ],
            [
                'day' => 2,
                'title' => 'Ziarah Raudhah VIP & Tadabbur Nabawi',
                'location' => 'Masjid Nabawi',
                'description' => 'Memaksimalkan ibadah di Raudhah Syarifah dengan slot Tasreh resmi terverifikasi dan bimbingan Ustadz pembimbing.',
                'rundowns' => [
                    ['time' => '04:00', 'activity' => 'Shalat Subuh & Dzikir Pagi', 'notes' => 'Masjid Nabawi'],
                    ['time' => '08:30', 'activity' => 'Ziarah Raudhah & Makam Rasulullah SAW', 'notes' => 'Jalur Tasreh Resmi'],
                    ['time' => '20:00', 'activity' => 'Kajian Sirah Nabawiyah Eksklusif', 'notes' => 'Lounge VIP Hotel'],
                ],
            ],
            [
                'day' => 3,
                'title' => 'Ziarah Bersejarah Kota Suci Madinah',
                'location' => 'Quba, Uhud, Khandaq, Kebun Kurma',
                'description' => 'Kunjungan ziarah edukatif ke Masjid Quba, Makam Syuhada Uhud, lokasi Perang Khandaq, dan belanja kurma Ajwa premium.',
                'rundowns' => [
                    ['time' => '07:30', 'activity' => 'Shalat Sunnah di Masjid Quba', 'notes' => 'Pahala 1x Umroh'],
                    ['time' => '09:30', 'activity' => 'Ziarah Jabal Uhud & Doa Syuhada', 'notes' => 'Pemanduan sejarah'],
                    ['time' => '11:00', 'activity' => 'Wisata Kebun Kurma Madinah', 'notes' => 'Kurma Ajwa & Sukari'],
                ],
            ],
            [
                'day' => 4,
                'title' => 'Kereta Cepat Haramain (High Speed Train) Madinah ke Makkah',
                'location' => 'Haramain Train - Makkah',
                'description' => 'Perjalanan eksklusif dengan Kereta Cepat Haramain (kecepatan 300 km/jam) memangkas waktu tempuh hanya 2 jam 15 menit. Niat Miqat di Bir Ali dan Umroh Pertama di Makkah.',
                'rundowns' => [
                    ['time' => '09:00', 'activity' => 'Mandi Ihram di Hotel & Miqat Bir Ali', 'notes' => 'Pakaian Ihram'],
                    ['time' => '13:00', 'activity' => 'Naik Kereta Cepat Haramain Train', 'notes' => 'Gerbong Nyaman & Cepat'],
                    ['time' => '15:30', 'activity' => 'Check-in Hotel Bintang 5 Depan Masjidil Haram', 'notes' => 'Fairmont Clock Tower / Pullman Zamzam'],
                    ['time' => '20:00', 'activity' => 'Pelaksanaan Umroh Pertama Bersama', 'notes' => 'Thawaf, Sa\'i & Tahallul'],
                ],
            ],
            [
                'day' => 5,
                'title' => 'Fokus Ibadah di Depan Ka\'bah Al-Musyarrafah',
                'location' => 'Masjidil Haram',
                'description' => 'Memaksimalkan ibadah sholat 5 waktu di pelataran Masjidil Haram (1 rakaat senilai 100.000 rakaat).',
                'rundowns' => [
                    ['time' => '03:30', 'activity' => 'Tahajjud & Subuh di Masjidil Haram', 'notes' => 'Depan Ka\'bah'],
                    ['time' => '16:00', 'activity' => 'Thawaf Sunnah & Doa di Multazam', 'notes' => 'Bimbingan Muthawwif'],
                ],
            ],
            [
                'day' => 6,
                'title' => 'Ziarah Kota Makkah & Umroh Ke-2',
                'location' => 'Jabal Tsur, Arafah, Mina, Ji\'ranah',
                'description' => 'Ziarah napak tilas ke Padang Arafah, Jabal Rahmah, Mina, dan mengambil Miqat di Masjid Ji’ranah untuk Umroh ke-2.',
                'rundowns' => [
                    ['time' => '07:00', 'activity' => 'Ziarah Jabal Tsur & Padang Arafah', 'notes' => 'Doa mustajab di Jabal Rahmah'],
                    ['time' => '10:30', 'activity' => 'Ambil Miqat di Ji\'ranah', 'notes' => 'Niat Umroh Ke-2'],
                    ['time' => '14:00', 'activity' => 'Pelaksanaan Umroh Ke-2', 'notes' => 'Masjidil Haram'],
                ],
            ],
            [
                'day' => 7,
                'title' => 'Wisata Sejarah Kota Thaif (Pabrik Parfum & Cable Car)',
                'location' => 'Kota Pegunungan Thaif',
                'description' => 'Perjalanan ke kota sejuk Thaif. Mengunjungi Masjid Abdullah bin Abbas, Pabrik Penyulingan Parfum Mawar, mencicipi nasi kabsah kambing khas Thaif, dan Miqat di Qarnul Manazil bagi yang ingin Umroh ke-3.',
                'rundowns' => [
                    ['time' => '07:30', 'activity' => 'Berangkat ke Kota Sejuk Thaif', 'notes' => 'Bus AC Eksekutif'],
                    ['time' => '10:00', 'activity' => 'Ziarah Masjid Abdullah bin Abbas & Pabrik Parfum', 'notes' => 'Mawar Thaif Asli'],
                    ['time' => '13:00', 'activity' => 'Makan siang kuliner khas Thaif & Cable Car Teleferik', 'notes' => 'Pemandangan pegunungan'],
                    ['time' => '16:00', 'activity' => 'Miqat Qarnul Manazil (As-Sail Al-Kabir)', 'notes' => 'Opsional Umroh Ke-3'],
                ],
            ],
            [
                'day' => 8,
                'title' => 'Ibadah Khusyuk & Khataman Qur\'an',
                'location' => 'Masjidil Haram',
                'description' => 'Ibadah mandiri, dzikir akbar, dan istighotsah bersama di pelataran Ka’bah.',
                'rundowns' => [
                    ['time' => '04:00', 'activity' => 'Qiyamullail & Subuh Berjamaah', 'notes' => 'Masjidil Haram'],
                    ['time' => '14:00', 'activity' => 'Tadarus Al-Quran & Khotmil Quran', 'notes' => 'Pelataran lantai 2 Haram'],
                ],
            ],
            [
                'day' => 9,
                'title' => 'Ziarah Museum Wahyu Jabal Nur & Gua Hira',
                'location' => 'Hira Cultural District, Makkah',
                'description' => 'Mengunjungi Hira Cultural District di kaki Jabal Nur untuk menyaksikan visualisasi sejarah turunnya wahyu pertama kepada Nabi Muhammad SAW.',
                'rundowns' => [
                    ['time' => '08:30', 'activity' => 'Museum Wahyu & Gua Hira Exhibition', 'notes' => 'Hira Cultural District'],
                    ['time' => '15:00', 'activity' => 'Ibadah Ashar & Maghrib di Masjidil Haram', 'notes' => 'Memperbanyak doa'],
                ],
            ],
            [
                'day' => 10,
                'title' => 'Thawaf Wada\' & City Tour Jeddah',
                'location' => 'Makkah - Jeddah Corniche',
                'description' => 'Thawaf perpisahan (Thawaf Wada\') dengan Ka’bah. Perjalanan ke Jeddah, belanja di Corniche Commercial Center dan foto di Masjid Terapung Laut Merah.',
                'rundowns' => [
                    ['time' => '08:00', 'activity' => 'Thawaf Wada\' bersama seluruh jamaah', 'notes' => 'Pakaian bebas rapi'],
                    ['time' => '11:00', 'activity' => 'Check-out hotel & menuju Jeddah', 'notes' => 'Bus Pariwisata'],
                    ['time' => '14:00', 'activity' => 'City Tour Balad, Corniche & Masjid Rahmah', 'notes' => 'Jeddah Waterfront'],
                ],
            ],
            [
                'day' => 11,
                'title' => 'Penerbangan Pulang ke Indonesia',
                'location' => 'Bandara Internasional Jeddah (JED)',
                'description' => 'Proses check-in bagasi dan penerbangan direct menuju Bandara Internasional Soekarno-Hatta Jakarta.',
                'rundowns' => [
                    ['time' => '16:00', 'activity' => 'Proses Imigrasi & Boarding di Bandara Jeddah', 'notes' => 'Lounge'],
                    ['time' => '20:30', 'activity' => 'Take-off penerbangan menuju Jakarta', 'notes' => 'In-flight Rest'],
                ],
            ],
            [
                'day' => 12,
                'title' => 'Tiba di Jakarta dengan Selamat',
                'location' => 'Bandara Soekarno Hatta (CGK)',
                'description' => 'Tiba di Bandara Soetta, pembagian Air Zamzam 5L resmi dan kembali ke rumah masing-masing membawa predikat Umroh Mabrurah.',
                'rundowns' => [
                    ['time' => '10:30', 'activity' => 'Mendarat di Jakarta & Pengambilan Koper', 'notes' => 'Terminal 3'],
                    ['time' => '12:00', 'activity' => 'Penyerahan Air Zamzam & Pelepasan Jamaah', 'notes' => 'Umroh Mabrurah Insya Allah'],
                ],
            ],
        ];

        // 3. Rundown untuk Paket Umroh Plus Turki & Cappadocia
        $rundownTurkiPlus = [
            [
                'day' => 1,
                'title' => 'Keberangkatan Jakarta Menuju Istanbul (Turki)',
                'location' => 'Jakarta (CGK) - Istanbul (IST)',
                'description' => 'Penerbangan internasional dengan Turkish Airlines menuju Istanbul.',
                'rundowns' => [
                    ['time' => '18:00', 'activity' => 'Berkumpul di Terminal 3 Bandara Soetta', 'notes' => 'Check-in bagasi'],
                    ['time' => '21:40', 'activity' => 'Take-off penerbangan ke Istanbul', 'notes' => 'Direct Flight'],
                ],
            ],
            [
                'day' => 2,
                'title' => 'Eksplorasi Kota Sejarah Istanbul & Bosphorus Cruise',
                'location' => 'Istanbul, Turki',
                'description' => 'City Tour Istanbul: Blue Mosque (Sultan Ahmed), Hagia Sophia, Hippodrome, Topkapi Palace, dan naik kapal pesiar Bosphorus Cruise melintasi benua Asia dan Eropa.',
                'rundowns' => [
                    ['time' => '08:00', 'activity' => 'Ziarah Masjid Biru & Hagia Sophia', 'notes' => 'Ikon peradaban Islam'],
                    ['time' => '11:00', 'activity' => 'Kunjungan Istana Topkapi', 'notes' => 'Melihat peninggalan pedang & jubah Rasulullah'],
                    ['time' => '15:00', 'activity' => 'Bosphorus Cruise Private Boat', 'notes' => 'Pemandangan selat Bosphorus'],
                ],
            ],
            [
                'day' => 3,
                'title' => 'Perjalanan ke Cappadocia & Lembah Batu Ajaib',
                'location' => 'Cappadocia, Turki',
                'description' => 'Penerbangan domestik ke Cappadocia. Mengunjungi Goreme Open Air Museum, Underground City (Kota Bawah Tanah Kaymakli), dan Pigeon Valley.',
                'rundowns' => [
                    ['time' => '08:00', 'activity' => 'Fly to Cappadocia & Check-in Cave Hotel', 'notes' => 'Hotel Nuansa Gua'],
                    ['time' => '13:00', 'activity' => 'Eksplorasi Kota Bawah Tanah & Lembah Goreme', 'notes' => 'Keajaiban alam'],
                ],
            ],
            [
                'day' => 4,
                'title' => 'Hot Air Balloon Cappadocia & Penerbangan ke Madinah',
                'location' => 'Cappadocia - Madinah Al-Munawwarah',
                'description' => 'Menaiki Balon Udara Cappadocia saat matahari terbit (Sunrise Hot Air Balloon) dan melanjutkan penerbangan internasional ke kota suci Madinah.',
                'rundowns' => [
                    ['time' => '05:30', 'activity' => 'Hot Air Balloon Ride Sunrise', 'notes' => 'Pengalaman tak terlupakan'],
                    ['time' => '14:00', 'activity' => 'Penerbangan Cappadocia - Istanbul - Madinah', 'notes' => 'Menuju Tanah Suci'],
                    ['time' => '21:00', 'activity' => 'Tiba di Madinah & Check-in Hotel', 'notes' => 'Dekat Masjid Nabawi'],
                ],
            ],
            [
                'day' => 5,
                'title' => 'Ibadah di Masjid Nabawi & Ziarah Raudhah Syarifah',
                'location' => 'Masjid Nabawi, Madinah',
                'description' => 'Ibadah khusyuk di Masjid Nabawi dan berziarah ke Makam Rasulullah SAW serta berdoa di Raudhah.',
                'rundowns' => [
                    ['time' => '04:00', 'activity' => 'Sholat Subuh di Nabawi', 'notes' => 'Masjid Nabawi'],
                    ['time' => '09:00', 'activity' => 'Ziarah Raudhah sesuai Tasreh', 'notes' => 'Taman Surga'],
                ],
            ],
            [
                'day' => 6,
                'title' => 'Ziarah Kota Madinah & Persiapan Umroh',
                'location' => 'Quba, Uhud & Kebun Kurma',
                'description' => 'Ziarah Masjid Quba, Jabal Uhud, dan belanja kurma sebelum esok harinya bertolak ke Makkah.',
                'rundowns' => [
                    ['time' => '07:30', 'activity' => 'Ziarah Quba & Uhud', 'notes' => 'Dipandu Muthawwif'],
                ],
            ],
            [
                'day' => 7,
                'title' => 'Miqat Bir Ali & Melaksanakan Ibadah Umroh di Makkah',
                'location' => 'Bir Ali - Masjidil Haram, Makkah',
                'description' => 'Mandi ihram, berniat umroh di Bir Ali, dan menuju Makkah untuk melaksanakan Thawaf, Sa’i, dan Tahallul.',
                'rundowns' => [
                    ['time' => '10:00', 'activity' => 'Niat Miqat di Bir Ali', 'notes' => 'Menuju Makkah'],
                    ['time' => '19:30', 'activity' => 'Pelaksanaan Prosesi Ibadah Umroh', 'notes' => 'Thawaf, Sa\'i & Tahallul'],
                ],
            ],
            [
                'day' => 8,
                'title' => 'Fokus Ibadah di Masjidil Haram',
                'location' => 'Masjidil Haram, Makkah',
                'description' => 'Memperbanyak thawaf sunnah dan sholat fardhu berjamaah di Masjidil Haram.',
                'rundowns' => [
                    ['time' => '04:00', 'activity' => 'Shalat Subuh & Thawaf Sunnah', 'notes' => 'Masjidil Haram'],
                ],
            ],
            [
                'day' => 9,
                'title' => 'Ziarah Kota Makkah & Umroh Ke-2',
                'location' => 'Arafah, Muzdalifah, Mina, Ji\'ranah',
                'description' => 'Ziarah sejarah haji dan Miqat Ji’ranah untuk umroh kedua.',
                'rundowns' => [
                    ['time' => '07:30', 'activity' => 'Ziarah Arafah, Mina & Miqat Ji\'ranah', 'notes' => 'Umroh Ke-2'],
                ],
            ],
            [
                'day' => 10,
                'title' => 'Thawaf Wada\' & Kepulangan ke Indonesia',
                'location' => 'Makkah - Bandara Jeddah',
                'description' => 'Thawaf Wada’ perpisahan, check-out hotel, dan terbang pulang ke Jakarta.',
                'rundowns' => [
                    ['time' => '08:00', 'activity' => 'Thawaf Wada\'', 'notes' => 'Perpisahan Ka\'bah'],
                    ['time' => '14:00', 'activity' => 'Menuju Bandara Jeddah', 'notes' => 'Boarding Pesawat'],
                ],
            ],
            [
                'day' => 11,
                'title' => 'Tiba di Tanah Air Jakarta',
                'location' => 'Bandara Soekarno-Hatta (CGK)',
                'description' => 'Tiba di Jakarta dengan selamat dan membawa kenangan indah Umroh Plus Turki.',
                'rundowns' => [
                    ['time' => '15:00', 'activity' => 'Mendarat di Jakarta & Pengambilan Zamzam', 'notes' => 'Selesai Program'],
                ],
            ],
        ];

        // 4. Rundown untuk Paket Haji Furoda / Khusus Mujamalah
        $rundownHajiFuroda = [
            [
                'day' => 1,
                'title' => 'Keberangkatan Jakarta Langsung Menuju Makkah Al-Mukarramah',
                'location' => 'Jakarta - Jeddah - Makkah',
                'description' => 'Penerbangan VIP menuju Jeddah, check-in Hotel Bintang 5 di Makkah (Clock Tower), dan pelaksanaan Thawaf Qudum.',
                'rundowns' => [
                    ['time' => '09:00', 'activity' => 'Pelepasan Jamaah Haji Furoda di Lounge VIP Soetta', 'notes' => 'Visa Haji Mujamalah Resmi'],
                    ['time' => '18:00', 'activity' => 'Tiba di Makkah & Thawaf Qudum', 'notes' => 'Dipandu Ustadz Pembimbing'],
                ],
            ],
            [
                'day' => 2,
                'title' => 'Pemantapan Manasik Haji Akbar & Ibadah di Masjidil Haram',
                'location' => 'Masjidil Haram, Makkah',
                'description' => 'Bimbingan intensif persiapan rukun dan wajib haji menjelang Hari Tarwiyah.',
                'rundowns' => [
                    ['time' => '09:00', 'activity' => 'Manasik Haji & Edukasi Puncak Armuzna', 'notes' => 'Ruang VIP Hotel'],
                    ['time' => '16:00', 'activity' => 'Ibadah di Masjidil Haram', 'notes' => 'Doa memohon haji mabrur'],
                ],
            ],
            [
                'day' => 3,
                'title' => 'Hari Tarwiyah (8 Dzulhijjah) - Menuju Tenda AC VIP Mina',
                'location' => 'Mina (Tenda Maktab VIP Furoda)',
                'description' => 'Memulai rangkaian ibadah haji dengan sunnah Tarwiyah menuju Mina, menempati Tenda Maktab VIP ber-AC dengan sofa bed dan katering khusus.',
                'rundowns' => [
                    ['time' => '08:00', 'activity' => 'Niat Ihram Haji di Makkah', 'notes' => 'Pakaian Ihram'],
                    ['time' => '10:00', 'activity' => 'Menempati Tenda Maktab VIP Mina', 'notes' => 'Sholat Dzuhur s/d Subuh di Mina'],
                ],
            ],
            [
                'day' => 4,
                'title' => 'Puncak Wukuf di Padang Arafah (9 Dzulhijjah) & Mabit Muzdalifah',
                'location' => 'Padang Arafah & Muzdalifah',
                'description' => 'PUNCAK IBADAH HAJI: Wukuf di Arafah, mendengarkan Khutbah Wukuf, muhasabah, dan doa akbar. Setelah terbenam matahari, bertolak ke Muzdalifah untuk mabit dan mengumpulkan kerikil jumrah.',
                'rundowns' => [
                    ['time' => '08:00', 'activity' => 'Bergerak dari Mina menuju Padang Arafah', 'notes' => 'Bus Khusus VIP'],
                    ['time' => '12:20', 'activity' => 'Khutbah Wukuf & Sholat Jamak Taqdim Qashar', 'notes' => 'Haji adalah Arafah'],
                    ['time' => '13:00', 'activity' => 'Muhasabah & Doa Wukuf Mustajab', 'notes' => 'Waktu paling mustajab'],
                    ['time' => '19:00', 'activity' => 'Menuju Muzdalifah untuk Mabit & Mengambil Kerikil', 'notes' => 'Mabit Muzdalifah'],
                ],
            ],
            [
                'day' => 5,
                'title' => 'Hari Nahr (10 Dzulhijjah) - Lempar Jumrah Aqabah, Tahallul & Thawaf Ifadhah',
                'location' => 'Mina (Jamarat) & Masjidil Haram',
                'description' => 'Melontar Jumrah Aqabah di Jamarat, memotong hewan Dam/Qurban, Tahallul Awwal (berganti pakaian biasa), dan menuju Masjidil Haram untuk Thawaf Ifadhah dan Sa’i Haji.',
                'rundowns' => [
                    ['time' => '07:00', 'activity' => 'Melontar Jumrah Aqabah (7 butir kerikil)', 'notes' => 'Jembatan Jamarat VIP'],
                    ['time' => '09:00', 'activity' => 'Penyembelihan Dam & Tahallul Awwal', 'notes' => 'Cukur gundul / potong rambut'],
                    ['time' => '14:00', 'activity' => 'Thawaf Ifadhah & Sa\'i Haji di Ka\'bah', 'notes' => 'Rukun Haji terpenuhi'],
                    ['time' => '20:00', 'activity' => 'Kembali ke Tenda Mina untuk Mabit', 'notes' => 'Istirahat di Mina'],
                ],
            ],
            [
                'day' => 6,
                'title' => 'Hari Tasyrik Ke-1 (11 Dzulhijjah) - Lempar 3 Jumrah',
                'location' => 'Mina (Jamarat)',
                'description' => 'Mabit di Mina dan melontar tiga jumrah (Ula, Wustha, dan Aqabah) masing-masing 7 butir kerikil setelah waktu zawal (tergelincir matahari).',
                'rundowns' => [
                    ['time' => '13:30', 'activity' => 'Melontar 3 Jumrah (Ula, Wustha, Aqabah)', 'notes' => 'Total 21 butir kerikil'],
                    ['time' => '16:00', 'activity' => 'Ibadah dzikir & kajian fiqih haji di tenda Mina', 'notes' => 'Tenda Maktab VIP'],
                ],
            ],
            [
                'day' => 7,
                'title' => 'Hari Tasyrik Ke-2 (12 Dzulhijjah) - Nafar Awwal & Kembali ke Hotel Makkah',
                'location' => 'Mina - Makkah',
                'description' => 'Melontar 3 Jumrah kedua kalinya, menyelesaikan prosesi Nafar Awwal, dan kembali ke hotel bintang 5 Makkah.',
                'rundowns' => [
                    ['time' => '13:30', 'activity' => 'Melontar 3 Jumrah & Nafar Awwal', 'notes' => 'Selesai wajib haji Mina'],
                    ['time' => '16:30', 'activity' => 'Kembali ke Hotel Makkah & Istirahat', 'notes' => 'Pembersihan diri di hotel'],
                ],
            ],
            [
                'day' => 8,
                'title' => 'Thawaf Wada\' & Perjalanan ke Madinah',
                'location' => 'Makkah - Madinah',
                'description' => 'Thawaf perpisahan (Wada’) dan perjalanan menuju kota Nabi Madinah Al-Munawwarah menggunakan Kereta Cepat Haramain.',
                'rundowns' => [
                    ['time' => '08:00', 'activity' => 'Thawaf Wada\' bersama seluruh jamaah haji', 'notes' => 'Air mata perpisahan Ka\'bah'],
                    ['time' => '13:00', 'activity' => 'Menuju Madinah via Kereta Cepat Haramain', 'notes' => 'Check-in Hotel Madinah'],
                ],
            ],
            [
                'day' => 9,
                'title' => 'Ziarah Makam Rasulullah SAW & Raudhah Syarifah',
                'location' => 'Masjid Nabawi, Madinah',
                'description' => 'Ibadah di Masjid Nabawi, ziarah Makam Nabi SAW, dan doa di Raudhah Syarifah.',
                'rundowns' => [
                    ['time' => '04:00', 'activity' => 'Shalat Subuh & Dzikir di Nabawi', 'notes' => 'Masjid Nabawi'],
                    ['time' => '09:00', 'activity' => 'Masuk Raudhah VIP Tasreh', 'notes' => 'Taman Surga'],
                ],
            ],
            [
                'day' => 10,
                'title' => 'Kepulangan ke Tanah Air (Jakarta)',
                'location' => 'Madinah - Jakarta (CGK)',
                'description' => 'Penerbangan pulang ke Indonesia dan penutupan program Haji Khusus Furoda.',
                'rundowns' => [
                    ['time' => '14:00', 'activity' => 'Penerbangan ke Jakarta', 'notes' => 'Direct Flight'],
                    ['time' => '22:00', 'activity' => 'Tiba di Jakarta & Penyerahan Zamzam', 'notes' => 'Haji Mabrur Insya Allah'],
                ],
            ],
        ];

        // 5. Update atau Seeding ke Database untuk seluruh paket
        $allPackages = Paket::all();

        foreach ($allPackages as $paket) {
            $name = strtolower($paket->nama_paket);

            if (str_contains($name, 'vip') || str_contains($name, '12 hari')) {
                $paket->update([
                    'itinerary' => $rundownVIP12Hari,
                    'kuota' => $paket->kuota ?: 45,
                    'fasilitas' => ['Garuda / Saudia Direct', 'Fairmont Clock Tower ⭐5', 'Kereta Cepat Haramain', 'Raudhah VIP Tasreh', 'Air Zamzam 5L'],
                    'deskripsi' => 'Paket Umroh Eksklusif Bintang 5 (12 Hari) dengan fasilitas Kereta Cepat Haramain High Speed Train, hotel pelataran Masjidil Haram & Nabawi, serta bimbingan ibadah intensif.',
                ]);
            } elseif (str_contains($name, 'plus') || str_contains($name, 'turki') || str_contains($name, 'cappadocia')) {
                $paket->update([
                    'itinerary' => $rundownTurkiPlus,
                    'kuota' => $paket->kuota ?: 45,
                    'fasilitas' => ['Turkish Airlines', 'Pullman Zamzam ⭐5', 'Cave Hotel Cappadocia', 'Hot Air Balloon Sunrise', 'Bosphorus Cruise'],
                    'deskripsi' => 'Perpaduan ibadah umroh khusyuk di Tanah Suci dan wisata sejarah peradaban Islam di Istanbul & Cappadocia Turki dengan pengalaman Sunrise Hot Air Balloon.',
                ]);
            } elseif (str_contains($name, 'haji') || str_contains($name, 'furoda') || str_contains($name, 'mujamalah')) {
                $paket->update([
                    'itinerary' => $rundownHajiFuroda,
                    'kuota' => $paket->kuota ?: 45,
                    'fasilitas' => ['Visa Haji Furoda Resmi', 'Tenda Maktab VIP Mina AC', 'Raffles Makkah Palace ⭐5', 'The Oberoi Madinah ⭐5', 'Fast Track Airport'],
                    'deskripsi' => 'Program Haji Khusus Furoda / Mujamalah Resmi Tanpa Antre dengan Fasilitas Tenda Maktab VIP Mina ber-AC, Hotel Bintang 5 depan Ka\'bah, dan bimbingan Ustadz Ahli Fiqih Haji.',
                ]);
            } else {
                // Default: Umroh Reguler 9 Hari
                $paket->update([
                    'itinerary' => $rundownReguler9Hari,
                    'kuota' => $paket->kuota ?: 45,
                    'fasilitas' => ['Saudia / Lion Premium Direct', 'Anjum Makkah ⭐5', 'Grand Plaza Madinah ⭐4', 'Muthawwif Berpengalaman', 'Air Zamzam 5L'],
                    'deskripsi' => 'Program ibadah umroh reguler 9 hari yang nyaman, hemat dan amanah dengan akomodasi hotel bintang, penerbangan direct, dan bimbingan Muthawwif berpengalaman.',
                ]);
            }
        }
    }
}
