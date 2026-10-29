<?php

namespace Database\Seeders;

use App\Models\CrmStage;
use App\Models\HierarchyLevel;
use App\Models\Inventaris;
use App\Models\InventarisTransaksi;
use App\Models\Paket;
use App\Models\RekeningTenant;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class TenantDatasetSeeder extends Seeder
{
    /**
     * Bila diisi, hanya tenant dengan subdomain ini yang di-seed (dipakai seeder turunan per tenant).
     *
     * @var array<int, string>
     */
    protected array $onlySubdomains = [];

    /**
     * Seed 3 tenants with complete, realistic employee, agent, banking, and relational CRM records.
     */
    public function run(): void
    {
        $defaultPassword = Hash::make('password');

        $tenantsData = [
            [
                'name' => 'Travel Kolibrinektara',
                'subdomain' => 'hajjflow',
                'no_telepon' => '02178901234',
                'owner_name' => 'H. Abdullah Hakim, Lc',
                'owner_email' => 'test@example.com',
                'owner_nik' => '3201011508820001',
                'owner_phone' => '081289901122',
                'owner_city' => 'Jakarta Selatan',
                'owner_address' => 'Jl. Kemang Raya No. 45 RT 02/RW 05, Kel. Bangka, Kec. Mampang Prapatan, Kota Jakarta Selatan, DKI Jakarta 12730',
                'owner_bank' => 'Bank Syariah Indonesia (BSI)',
                'owner_rek' => '7123849102',
                'bank' => 'Bank Syariah Indonesia (BSI)',
                'acc_no' => '7123849102',
                'acc_name' => 'PT HajjFlow Nusantara Amanah',
            ],
            [
                'name' => 'Barokah Madinah Wisata',
                'subdomain' => 'barokah',
                'no_telepon' => '02287654321',
                'owner_name' => 'Hj. Siti Rahmawati, S.E.',
                'owner_email' => 'owner@barokah.com',
                'owner_nik' => '3273045209860003',
                'owner_phone' => '081398877665',
                'owner_city' => 'Bandung',
                'owner_address' => 'Jl. Ir. H. Juanda No. 128 RT 03/RW 06, Kel. Lebak Siliwangi, Kec. Coblong, Kota Bandung, Jawa Barat 40132',
                'owner_bank' => 'Bank Mandiri',
                'owner_rek' => '1420098765432',
                'bank' => 'Bank Mandiri',
                'acc_no' => '1420098765432',
                'acc_name' => 'PT Barokah Madinah Mandiri',
            ],
            [
                'name' => 'Setia Haramain Tour',
                'subdomain' => 'setiaharamaintour',
                'no_telepon' => '03155512345',
                'owner_name' => 'H. Muhammad Ridwan, Lc',
                'owner_email' => 'setiaharamaintour@travel.id',
                'owner_nik' => '3578101205780005',
                'owner_phone' => '081231245577',
                'owner_city' => 'Surabaya',
                'owner_address' => 'Jl. Raya Darmo No. 87 RT 04/RW 02, Kel. Darmo, Kec. Wonokromo, Kota Surabaya, Jawa Timur 60264',
                'owner_bank' => 'Bank Syariah Indonesia (BSI)',
                'owner_rek' => '7256091834',
                'bank' => 'Bank Syariah Indonesia (BSI)',
                'acc_no' => '7256091834',
                'acc_name' => 'PT Setia Haramain Wisata',
            ],
        ];

        $detailedAddresses = [
            [
                'alamat_ktp' => 'Jl. Margonda Raya No. 45 RT 03/RW 07, Kel. Kemiri Muka, Kec. Beji, Kota Depok, Jawa Barat 16424',
                'alamat_domisili' => 'Apartemen Margonda Residence Tower 2 No. 14B, Jl. Margonda Raya, Beji, Kota Depok 16424',
                'kota' => 'Kota Depok',
            ],
            [
                'alamat_ktp' => 'Jl. Tebet Barat Dalam Raya No. 18 RT 05/RW 02, Kel. Tebet Barat, Kec. Tebet, Kota Jakarta Selatan, DKI Jakarta 12810',
                'alamat_domisili' => 'Jl. Tebet Barat Dalam Raya No. 18 RT 05/RW 02, Kel. Tebet Barat, Kec. Tebet, Kota Jakarta Selatan, DKI Jakarta 12810',
                'kota' => 'Kota Jakarta Selatan',
            ],
            [
                'alamat_ktp' => 'Jl. Riau No. 102 RT 01/RW 04, Kel. Cihapit, Kec. Bandung Wetan, Kota Bandung, Jawa Barat 40114',
                'alamat_domisili' => 'Komplek Perumahan Dago Asri Blok C-12, Dago, Kec. Coblong, Kota Bandung 40135',
                'kota' => 'Kota Bandung',
            ],
            [
                'alamat_ktp' => 'Jl. Raya Darmo No. 88 RT 02/RW 06, Kel. Keputran, Kec. Tegalsari, Kota Surabaya, Jawa Timur 60265',
                'alamat_domisili' => 'Jl. Raya Darmo No. 88 RT 02/RW 06, Kel. Keputran, Kec. Tegalsari, Kota Surabaya, Jawa Timur 60265',
                'kota' => 'Kota Surabaya',
            ],
            [
                'alamat_ktp' => 'Jl. Kaliurang KM 5.5 No. 24 RT 04/RW 09, Kel. Caturtunggal, Kec. Depok, Kab. Sleman, D.I. Yogyakarta 55281',
                'alamat_domisili' => 'Jl. Kaliurang KM 5.5 No. 24 RT 04/RW 09, Kel. Caturtunggal, Kec. Depok, Kab. Sleman, D.I. Yogyakarta 55281',
                'kota' => 'Kabupaten Sleman',
            ],
            [
                'alamat_ktp' => 'Jl. Pajajaran No. 72 RT 03/RW 08, Kel. Baranangsiang, Kec. Bogor Timur, Kota Bogor, Jawa Barat 16143',
                'alamat_domisili' => 'Villa Duta Blok A5 No. 9, Baranangsiang, Kec. Bogor Timur, Kota Bogor 16143',
                'kota' => 'Kota Bogor',
            ],
            [
                'alamat_ktp' => 'Jl. Pemuda No. 142 RT 02/RW 03, Kel. Sekayu, Kec. Semarang Tengah, Kota Semarang, Jawa Tengah 50132',
                'alamat_domisili' => 'Jl. Pemuda No. 142 RT 02/RW 03, Kel. Sekayu, Kec. Semarang Tengah, Kota Semarang, Jawa Tengah 50132',
                'kota' => 'Kota Semarang',
            ],
            [
                'alamat_ktp' => 'Jl. Boulevard Barat Raya Blok LC7 No. 12 RT 06/RW 15, Kel. Kelapa Gading Barat, Kec. Kelapa Gading, Kota Jakarta Utara, DKI Jakarta 14240',
                'alamat_domisili' => 'Jl. Boulevard Barat Raya Blok LC7 No. 12 RT 06/RW 15, Kelapa Gading Barat, Kota Jakarta Utara 14240',
                'kota' => 'Kota Jakarta Utara',
            ],
            [
                'alamat_ktp' => 'Jl. Jenderal Sudirman No. 250 RT 01/RW 05, Kel. Damai, Kec. Balikpapan Kota, Kota Balikpapan, Kalimantan Timur 76114',
                'alamat_domisili' => 'Perumahan Balikpapan Baru Blok AB-3 No. 7, Damai, Kota Balikpapan 76114',
                'kota' => 'Kota Balikpapan',
            ],
            [
                'alamat_ktp' => 'Jl. Pettarani No. 89 RT 04/RW 01, Kel. Banta-Bantaeng, Kec. Rappocini, Kota Makassar, Sulawesi Selatan 90222',
                'alamat_domisili' => 'Jl. Pettarani No. 89 RT 04/RW 01, Kel. Banta-Bantaeng, Kec. Rappocini, Kota Makassar 90222',
                'kota' => 'Kota Makassar',
            ],
            [
                'alamat_ktp' => 'Jl. Gatot Subroto No. 64 RT 07/RW 03, Kel. Sei Putih Tengah, Kec. Medan Petisah, Kota Medan, Sumatera Utara 20118',
                'alamat_domisili' => 'Jl. Gatot Subroto No. 64 RT 07/RW 03, Kel. Sei Putih Tengah, Medan Petisah, Kota Medan 20118',
                'kota' => 'Kota Medan',
            ],
            [
                'alamat_ktp' => 'Jl. KH. Noer Ali No. 17 RT 05/RW 06, Kel. Jakasampurna, Kec. Bekasi Barat, Kota Bekasi, Jawa Barat 17145',
                'alamat_domisili' => 'Grand Galaxy City Cluster Victoria Garden Blok VC 2 No. 19, Jaka Setia, Bekasi Selatan 17147',
                'kota' => 'Kota Bekasi',
            ],
            [
                'alamat_ktp' => 'Jl. BSD Raya Utama Blok FL No. 8 RT 01/RW 09, Kel. Lengkong Kulon, Kec. Pagedangan, Kab. Tangerang, Banten 15331',
                'alamat_domisili' => 'Cluster Greenwich Park De Maja No. 33, BSD City, Tangerang 15331',
                'kota' => 'Kabupaten Tangerang',
            ],
            [
                'alamat_ktp' => 'Jl. Slamet Riyadi No. 312 RT 03/RW 05, Kel. Sriwedari, Kec. Laweyan, Kota Surakarta, Jawa Tengah 57141',
                'alamat_domisili' => 'Jl. Slamet Riyadi No. 312 RT 03/RW 05, Kel. Sriwedari, Kec. Laweyan, Kota Surakarta 57141',
                'kota' => 'Kota Surakarta',
            ],
            [
                'alamat_ktp' => 'Jl. Basuki Rahmat No. 45 RT 04/RW 02, Kel. Kauman, Kec. Klojen, Kota Malang, Jawa Timur 65119',
                'alamat_domisili' => 'Jl. Basuki Rahmat No. 45 RT 04/RW 02, Kel. Kauman, Kec. Klojen, Kota Malang 65119',
                'kota' => 'Kota Malang',
            ],
            [
                'alamat_ktp' => 'Jl. Khatib Sulaiman No. 77 RT 02/RW 04, Kel. Lolong Belanti, Kec. Padang Utara, Kota Padang, Sumatera Barat 25136',
                'alamat_domisili' => 'Jl. Khatib Sulaiman No. 77 RT 02/RW 04, Kel. Lolong Belanti, Kec. Padang Utara, Kota Padang 25136',
                'kota' => 'Kota Padang',
            ],
            [
                'alamat_ktp' => 'Jl. Jenderal Sudirman No. 108 RT 06/RW 02, Kel. 20 Ilir D. IV, Kec. Ilir Timur I, Kota Palembang, Sumatera Selatan 30121',
                'alamat_domisili' => 'Jl. Jenderal Sudirman No. 108 RT 06/RW 02, 20 Ilir D. IV, Ilir Timur I, Kota Palembang 30121',
                'kota' => 'Kota Palembang',
            ],
            [
                'alamat_ktp' => 'Jl. Cipto Mangunkusumo No. 58 RT 03/RW 05, Kel. Pekiringan, Kec. Kesambi, Kota Cirebon, Jawa Barat 45131',
                'alamat_domisili' => 'Jl. Cipto Mangunkusumo No. 58 RT 03/RW 05, Kel. Pekiringan, Kec. Kesambi, Kota Cirebon 45131',
                'kota' => 'Kota Cirebon',
            ],
        ];

        $banks = ['BCA', 'Bank Mandiri', 'BSI (Bank Syariah Indonesia)', 'BRI', 'BNI'];
        $bloodTypes = ['A', 'B', 'AB', 'O'];
        $maritalStatuses = ['Menikah', 'Belum Menikah', 'Janda/Duda'];
        $diseases = ['Tidak Ada', 'Tidak Ada', 'Hipertensi Ringan', 'Asma Terkontrol', 'Diabetes Melitus', 'Kolesterol', 'Tidak Ada'];
        $relations = ['Suami', 'Istri', 'Anak Kandung', 'Orang Tua', 'Kakak Kandung', 'Adik Kandung'];
        $couriers = ['JNE Express', 'SiCepat', 'J&T Express', 'POS Indonesia', 'TIKI'];

        foreach ($tenantsData as $tIndex => $tData) {
            if ($this->onlySubdomains && ! in_array($tData['subdomain'], $this->onlySubdomains, true)) {
                continue;
            }

            $this->command->info('Seeding Tenant '.($tIndex + 1).": {$tData['name']}...");

            // Cleanup existing tenant data with same subdomain if exists to allow clean reseeding
            $existingTenant = Tenant::where('domain_atau_subdomain', $tData['subdomain'])->first();
            if ($existingTenant) {
                User::where('tenant_id', $existingTenant->id)->delete();
                $existingTenant->delete();
            }

            $tenant = Tenant::create([
                'nama_travel' => $tData['name'],
                'domain_atau_subdomain' => $tData['subdomain'],
                'no_telepon' => $tData['no_telepon'],
                'logo' => null,
            ]);

            app()->instance('tenant', $tenant);

            // 1. Bank Rekening Resmi Travel
            $rekening = RekeningTenant::create([
                'tenant_id' => $tenant->id,
                'nama_bank' => $tData['bank'],
                'nomor_rekening' => $tData['acc_no'],
                'atas_nama' => $tData['acc_name'],
                'is_active' => true,
            ]);

            // Bank Sekunder Travel
            RekeningTenant::create([
                'tenant_id' => $tenant->id,
                'nama_bank' => 'BCA',
                'nomor_rekening' => '8830'.rand(100000, 999999),
                'atas_nama' => $tData['acc_name'],
                'is_active' => true,
            ]);

            // 2. CRM Stages
            $stage1 = CrmStage::create(['tenant_id' => $tenant->id, 'nama_tahap' => 'New Leads', 'urutan' => 1]);
            $stage2 = CrmStage::create(['tenant_id' => $tenant->id, 'nama_tahap' => 'Follow Up', 'urutan' => 2]);
            $stage3 = CrmStage::create(['tenant_id' => $tenant->id, 'nama_tahap' => 'Negosiasi', 'urutan' => 3]);
            $stage4 = CrmStage::create(['tenant_id' => $tenant->id, 'nama_tahap' => 'Closing', 'urutan' => 4]);

            // 3. Inventaris / Perlengkapan
            $invKoper = Inventaris::create([
                'tenant_id' => $tenant->id,
                'nama_barang' => 'Koper Fiber Executive 24 Inch',
                'stok_tersedia' => 25000,
                'stok_minimum' => 50,
            ]);
            $invKain = Inventaris::create([
                'tenant_id' => $tenant->id,
                'nama_barang' => 'Kain Ihram & Mukena Premium',
                'stok_tersedia' => 25000,
                'stok_minimum' => 50,
            ]);
            $invBuku = Inventaris::create([
                'tenant_id' => $tenant->id,
                'nama_barang' => 'Buku Panduan Doa & Tasbih Digital',
                'stok_tersedia' => 25000,
                'stok_minimum' => 50,
            ]);
            $invBatik = Inventaris::create([
                'tenant_id' => $tenant->id,
                'nama_barang' => 'Kain Seragam Batik Travel Eksklusif',
                'stok_tersedia' => 25000,
                'stok_minimum' => 50,
            ]);

            InventarisTransaksi::create(['tenant_id' => $tenant->id, 'inventaris_id' => $invKoper->id, 'jamaah_id' => null, 'qty' => 25000, 'tipe' => 'IN']);
            InventarisTransaksi::create(['tenant_id' => $tenant->id, 'inventaris_id' => $invKain->id, 'jamaah_id' => null, 'qty' => 25000, 'tipe' => 'IN']);
            InventarisTransaksi::create(['tenant_id' => $tenant->id, 'inventaris_id' => $invBuku->id, 'jamaah_id' => null, 'qty' => 25000, 'tipe' => 'IN']);
            InventarisTransaksi::create(['tenant_id' => $tenant->id, 'inventaris_id' => $invBatik->id, 'jamaah_id' => null, 'qty' => 25000, 'tipe' => 'IN']);

            // 4. Packages
            $paketReguler = Paket::create([
                'tenant_id' => $tenant->id,
                'nama_paket' => 'Umroh Reguler Hemat 9 Hari',
                'harga' => 28500000.00,
                'komisi_flat' => 1250000.00,
                'komisi_persentase' => 0.00,
            ]);
            $paketVIP = Paket::create([
                'tenant_id' => $tenant->id,
                'nama_paket' => 'Umroh VIP Bintang 5 (12 Hari)',
                'harga' => 38900000.00,
                'komisi_flat' => 2000000.00,
                'komisi_persentase' => 0.00,
            ]);
            $paketPlus = Paket::create([
                'tenant_id' => $tenant->id,
                'nama_paket' => 'Umroh Plus Turki & Cappadocia',
                'harga' => 46500000.00,
                'komisi_flat' => 2500000.00,
                'komisi_persentase' => 0.00,
            ]);
            $paketHaji = Paket::create([
                'tenant_id' => $tenant->id,
                'nama_paket' => 'Haji Furoda / Khusus Mujamalah',
                'harga' => 245000000.00,
                'komisi_flat' => 7500000.00,
                'komisi_persentase' => 0.00,
            ]);

            $paketReguler->inventaris()->attach([$invKoper->id => ['qty' => 1], $invKain->id => ['qty' => 1], $invBuku->id => ['qty' => 1], $invBatik->id => ['qty' => 1]]);
            $paketVIP->inventaris()->attach([$invKoper->id => ['qty' => 1], $invKain->id => ['qty' => 1], $invBuku->id => ['qty' => 1], $invBatik->id => ['qty' => 1]]);
            $paketPlus->inventaris()->attach([$invKoper->id => ['qty' => 1], $invKain->id => ['qty' => 1], $invBuku->id => ['qty' => 1], $invBatik->id => ['qty' => 1]]);
            $paketHaji->inventaris()->attach([$invKoper->id => ['qty' => 2], $invKain->id => ['qty' => 2], $invBuku->id => ['qty' => 2], $invBatik->id => ['qty' => 2]]);

            $packagesList = [
                ['id' => $paketReguler->id, 'harga' => 28500000, 'komisi' => 1250000],
                ['id' => $paketVIP->id, 'harga' => 38900000, 'komisi' => 2000000],
                ['id' => $paketPlus->id, 'harga' => 46500000, 'komisi' => 2500000],
                ['id' => $paketHaji->id, 'harga' => 245000000, 'komisi' => 7500000],
            ];

            // 5. Hierarchy Levels Structure
            $ownerLevel = HierarchyLevel::create([
                'tenant_id' => $tenant->id,
                'parent_id' => null,
                'nama_level' => 'Owner',
                'role_key' => 'owner_travel',
                'deskripsi' => 'Pimpinan Utama & Direksi Travel',
                'wewenang_note' => 'Akses penuh ke seluruh modul, keuangan, dan konfigurasi master.',
                'urutan' => 1,
            ]);

            $spvLevel = HierarchyLevel::create([
                'tenant_id' => $tenant->id,
                'parent_id' => $ownerLevel->id,
                'nama_level' => 'Supervisor',
                'role_key' => 'admin_travel',
                'deskripsi' => 'Pengawas Operasional & Finance Cabang',
                'wewenang_note' => 'Verifikasi bukti transfer jamaah, jadwal, dan inventaris logistik.',
                'urutan' => 2,
            ]);

            $leaderLevel = HierarchyLevel::create([
                'tenant_id' => $tenant->id,
                'parent_id' => $spvLevel->id,
                'nama_level' => 'Team Leader',
                'role_key' => 'admin_travel',
                'deskripsi' => 'Koordinator Pembina Tim Mitra Agen',
                'wewenang_note' => 'Monitoring performa penjualan tim agen dan pembagian lead CRM.',
                'urutan' => 3,
            ]);

            $agentLevel = HierarchyLevel::create([
                'tenant_id' => $tenant->id,
                'parent_id' => $leaderLevel->id,
                'nama_level' => 'Staff (Mitra Agen)',
                'role_key' => 'agen',
                'deskripsi' => 'Konsultan & Mitra Pemasaran Lapangan',
                'wewenang_note' => 'Pendaftaran calon jamaah, share bio link, dan klaim pencairan komisi.',
                'urutan' => 4,
            ]);

            // Seed Owner
            $owner = User::create([
                'tenant_id' => $tenant->id,
                'hierarchy_level_id' => $ownerLevel->id,
                'name' => $tData['owner_name'],
                'email' => $tData['owner_email'],
                'password' => $defaultPassword,
                'role' => 'owner_travel',
                'jabatan' => 'Owner',
                'nik' => $tData['owner_nik'],
                'no_hp' => $tData['owner_phone'],
                'kota' => $tData['owner_city'],
                'alamat' => $tData['owner_address'],
                'status_karyawan' => 'aktif',
                'nama_bank' => $tData['owner_bank'],
                'nomor_rekening' => $tData['owner_rek'],
                'atas_nama_rekening' => $tData['owner_name'],
                'bio' => "Direktur Utama {$tData['name']}. Melayani bimbingan ibadah Umroh dan Haji Khusus dengan amanah, nyaman, dan sesuai sunnah.",
                'social_links' => [
                    'instagram' => 'https://instagram.com/travel_resmi',
                    'facebook' => 'https://facebook.com/travel_resmi',
                ],
                'created_by' => null,
            ]);

            // Seed Supervisors
            $spvNames = [
                ['H. Rahmat Hidayat, S.Ag', 'Ustadz Fauzan Hakim, Lc'],
                ['Hj. Dewi Rahmawati, S.E.', 'H. Syamsul Arifin, M.Pd'],
                ['H. Abdul Karim, S.Pd.I', 'Hj. Nur Laila, S.Ag'],
            ];
            $supervisors = [];
            for ($s = 1; $s <= 2; $s++) {
                $spvName = $spvNames[$tIndex][$s - 1];
                $addrObj = $detailedAddresses[($s + 3 + $tIndex * 2) % count($detailedAddresses)];
                $supervisors[] = User::create([
                    'tenant_id' => $tenant->id,
                    'hierarchy_level_id' => $spvLevel->id,
                    'name' => $spvName,
                    'email' => "spv{$s}.t".($tIndex + 1).'@travel.com',
                    'password' => $defaultPassword,
                    'role' => 'admin_travel',
                    'jabatan' => 'Supervisor Operasional & Logistik',
                    'nik' => '32'.str_pad((string) (71000000000000 + ($tIndex * 100) + $s), 14, '0', STR_PAD_LEFT),
                    'no_hp' => '0812'.rand(10000000, 99999999),
                    'kota' => $addrObj['kota'],
                    'alamat' => $addrObj['alamat_ktp'],
                    'status_karyawan' => 'aktif',
                    'nama_bank' => $banks[$s % count($banks)],
                    'nomor_rekening' => '5300'.rand(100000, 999999),
                    'atas_nama_rekening' => $spvName,
                    'bio' => 'Supervisor Operasional & Pendamping Ibadah Umroh/Haji Resmi.',
                    'created_by' => $owner->id,
                ]);
            }

            // Seed Team Leaders
            $teamLeaders = [];
            foreach ($supervisors as $spvIdx => $spv) {
                for ($tl = 1; $tl <= 2; $tl++) {
                    $tlIdx = ($spvIdx * 2 + $tl);
                    $tlName = "Leader Pembina {$tlIdx} - ".(['Jabodetabek', 'Jawa Barat', 'Jawa Timur'][$tIndex] ?? 'Nasional');
                    $addrObj = $detailedAddresses[($tlIdx + 6) % count($detailedAddresses)];
                    $teamLeaders[] = User::create([
                        'tenant_id' => $tenant->id,
                        'hierarchy_level_id' => $leaderLevel->id,
                        'name' => $tlName,
                        'email' => "leader{$tlIdx}.t".($tIndex + 1).'@travel.com',
                        'password' => $defaultPassword,
                        'role' => 'admin_travel',
                        'jabatan' => 'Team Leader',
                        'nik' => '32'.str_pad((string) (72000000000000 + ($tIndex * 100) + $tlIdx), 14, '0', STR_PAD_LEFT),
                        'no_hp' => '0813'.rand(10000000, 99999999),
                        'kota' => $addrObj['kota'],
                        'alamat' => $addrObj['alamat_ktp'],
                        'status_karyawan' => 'aktif',
                        'nama_bank' => $banks[$tlIdx % count($banks)],
                        'nomor_rekening' => '7200'.rand(100000, 999999),
                        'atas_nama_rekening' => $tlName,
                        'bio' => 'Team Leader Konsultan Syiar Baitullah. Siap membantu kemitraan agen travel se-Indonesia.',
                        'created_by' => $spv->id,
                    ]);
                }
            }

            // Seed Agents
            $agentNamesByTenant = [
                // Tenant 0: HajjFlow
                [
                    'Budi Santoso, S.Kom', 'Aisyah Putri Azzahra', 'H. Muhammad Fauzan', 'Dewi Lestari, S.Pd',
                    'dr. Hendra Kusuma', 'Nurul Fadilah', 'Agus Setiawan', 'Ustadzah Maryam Fitriani',
                    'Ridwan Kamiludin', 'Fathimah Zahra', 'Bambang Tri Nugroho', 'Tri Wahyuni, M.Si',
                    'Eko Prasetyo Utomo', 'Siti Khodijah', 'Wahyu Al-Fatih', 'Laila Ramadhani',
                ],
                // Tenant 1: Barokah — entirely different names
                [
                    'Hasan Basri, S.Pd.I', 'Ummu Kultsum Azzahra', 'Drs. Irfan Maulana', 'Rini Setyowati, M.Kom',
                    'H. Zulkifli Ramadhan', 'Nisa Fauziah', 'Arif Budiman', 'Ustadzah Halimah Tusa\'diyah',
                    'Andri Firmansyah', 'Marisa Nur Hidayah', 'Teguh Wibowo, S.E.', 'Yeni Rahayu, S.H.',
                    'Doni Kurniawan', 'Khadijah Al-Hafidz', 'Harun Ar-Rasyid', 'Salma Fitriyani',
                ],
                // Tenant 2: Setia Haramain Tour
                [
                    'Moh. Syaiful Anam, S.Pd', 'Lailatul Fitriyah', 'H. Imam Syafi\'i', 'Dian Permatasari, S.E.',
                    'Ahmad Dahlan Hasibuan', 'Sri Wahyuningsih', 'Choirul Huda', 'Ustadzah Zulaikha Rahmah',
                    'Bayu Anggara Putra', 'Nur Aini Fadhilah', 'Slamet Riyadi', 'Retno Handayani, S.Kom',
                    'Fikri Alamsyah', 'Dewi Masitoh', 'Yusuf Maulidi', 'Anisa Rahmawati',
                ],
            ];
            $agentNames = $agentNamesByTenant[$tIndex] ?? $agentNamesByTenant[0];

            $agents = [];
            foreach ($teamLeaders as $tlIdx => $tl) {
                for ($ag = 1; $ag <= 4; $ag++) {
                    $agentNum = ($tlIdx * 4 + $ag);
                    $name = $agentNames[($agentNum - 1) % count($agentNames)];
                    $isPrimaryDemo = ($tIndex === 0 && $agentNum === 1);
                    $email = $isPrimaryDemo ? 'budi@example.com' : "agent{$agentNum}.t".($tIndex + 1).'@travel.com';
                    $referral = $isPrimaryDemo ? 'AG-DXPP4B' : 'AG-'.strtoupper(substr(md5("ag-{$tIndex}-{$agentNum}"), 0, 6));

                    $agentPhoneRaw = '08'.($isPrimaryDemo ? '88969991215' : (rand(11, 19).rand(1000000, 9999999)));
                    $agentPhoneWa = '62'.substr($agentPhoneRaw, 1);
                    $addrObj = $detailedAddresses[($agentNum + 2) % count($detailedAddresses)];

                    $agents[] = User::create([
                        'tenant_id' => $tenant->id,
                        'hierarchy_level_id' => $agentLevel->id,
                        'name' => $isPrimaryDemo ? 'Budi Santoso (Agen Konsultan)' : "{$name} - ".($tIndex === 0 ? 'HajjFlow' : 'Barokah'),
                        'email' => $email,
                        'password' => $defaultPassword,
                        'role' => 'agen',
                        'jabatan' => 'Konsultan Bimbingan Umroh',
                        'nik' => '32'.str_pad((string) (73000000000000 + ($tIndex * 100) + $agentNum), 14, '0', STR_PAD_LEFT),
                        'no_hp' => $agentPhoneRaw,
                        'kota' => $addrObj['kota'],
                        'alamat' => $addrObj['alamat_ktp'],
                        'status_karyawan' => 'aktif',
                        'nama_bank' => $banks[$agentNum % count($banks)],
                        'nomor_rekening' => ($agentNum % 2 === 0 ? '5385' : '7188').rand(100000, 999999),
                        'atas_nama_rekening' => $name,
                        'referral_code' => $referral,
                        'bio' => 'Konsultan Resmi Umroh & Haji Berizin Kemenag RI. Melayani konsultasi pendaftaran, tabungan umroh, dan bimbingan manasik.',
                        'landing_links' => [
                            [
                                'id' => 'link-1',
                                'title' => 'Daftar Paket Umroh Reguler Promo',
                                'url' => "https://wa.me/{$agentPhoneWa}?text=Halo%20saya%20tertarik%20paket%20Umroh%20Reguler",
                                'icon' => 'plane',
                                'is_highlight' => true,
                            ],
                            [
                                'id' => 'link-2',
                                'title' => 'Download Brosur & Jadwal Keberangkatan',
                                'url' => "https://wa.me/{$agentPhoneWa}?text=Mohon%20kirimkan%20brosur%20paket%20terbaru",
                                'icon' => 'file',
                                'is_highlight' => false,
                            ],
                            [
                                'id' => 'link-3',
                                'title' => 'Konsultasi Tabungan Porsi Haji Furoda',
                                'url' => "https://wa.me/{$agentPhoneWa}?text=Konsultasi%20Haji%20Furoda",
                                'icon' => 'chat',
                                'is_highlight' => false,
                            ],
                        ],
                        'social_links' => [
                            'instagram' => 'https://instagram.com/konsultan_umroh_resmi',
                            'tiktok' => 'https://tiktok.com/@konsultan_umroh',
                            'youtube' => 'https://youtube.com/@syiarumroh',
                            'facebook' => 'https://facebook.com/bimbinganumroh',
                        ],
                        'created_by' => $tl->id,
                    ]);
                }
            }
            $agentIds = array_map(fn ($a) => $a->id, $agents);

            // 6. Seed 10 Prospek Nasabah per Agen: 4 New Leads, 3 Follow Up, 3 Negosiasi (no Closing)
            $maleNames = ['Ahmad', 'Bambang', 'Chandra', 'Eko', 'Hadi', 'Indra', 'Joko', 'Muhammad', 'Rahmat', 'Umar', 'Wahyu', 'Zainal', 'Farhan', 'Rizky', 'Ridwan', 'Faisal', 'Taufik', 'Agus', 'Imam', 'Irfan'];
            $femaleNames = ['Dewi', 'Fitri', 'Gita', 'Kartika', 'Lestari', 'Nur', 'Putri', 'Siti', 'Tri', 'Yuliana', 'Anisa', 'Aulia', 'Nabila', 'Khodijah', 'Zahra', 'Indah', 'Rahmawati', 'Rina', 'Wulan', 'Dian'];
            $lastNames = ['Pratama', 'Hidayat', 'Saputra', 'Wijaya', 'Kusuma', 'Santoso', 'Gunawan', 'Permana', 'Nugroho', 'Wibowo', 'Siregar', 'Lubis', 'Harahap', 'Nasution', 'Batubara', 'Tanjung', 'Pasaribu', 'Hutagalung', 'Al-Habsyi', 'Assegaf'];
            $birthPlaces = ['Jakarta', 'Bandung', 'Surabaya', 'Medan', 'Semarang', 'Makassar', 'Yogyakarta', 'Solo', 'Bogor', 'Malang', 'Palembang', 'Padang', 'Cirebon', 'Banjarmasin', 'Balikpapan'];

            $stageSlots = [
                $stage1->id, $stage1->id, $stage1->id, $stage1->id, // 4× New Leads
                $stage2->id, $stage2->id, $stage2->id,               // 3× Follow Up
                $stage3->id, $stage3->id, $stage3->id,               // 3× Negosiasi
            ];

            $this->command->info('Generating 10 nasabah × '.count($agentIds).' agents for Tenant '.($tIndex + 1).'...');

            $globalIdx = 0;
            foreach ($agents as $agentObj) {
                $jamaahRows = [];
                foreach ($stageSlots as $slotStageId) {
                    $globalIdx++;
                    $isMale = ($globalIdx % 2 === 1);
                    // Use prime step (7) to avoid periodic collisions in deterministic modulo pattern
                    $fn = $isMale ? $maleNames[$globalIdx % count($maleNames)] : $femaleNames[$globalIdx % count($femaleNames)];
                    $ln = $lastNames[($globalIdx * 7 + $tIndex * 11) % count($lastNames)];
                    $gender = $isMale ? 'Laki-laki' : 'Perempuan';

                    $pkgRand = rand(1, 100);
                    if ($pkgRand <= 45) {
                        $selectedPkg = $packagesList[0];
                    } elseif ($pkgRand <= 75) {
                        $selectedPkg = $packagesList[1];
                    } elseif ($pkgRand <= 93) {
                        $selectedPkg = $packagesList[2];
                    } else {
                        $selectedPkg = $packagesList[3];
                    }

                    $daysAgo = rand(1, 120);
                    $createdAt = now()->subDays($daysAgo)->subHours(rand(1, 23))->subMinutes(rand(1, 59));

                    $nik = '32'.str_pad((string) ($tenant->id * 10000000000000 + $globalIdx), 14, '0', STR_PAD_LEFT);
                    $phone = '08'.str_pad((string) (1300000000 + ($tIndex * 100000) + $globalIdx), 10, '0', STR_PAD_LEFT);
                    $addr = $detailedAddresses[$globalIdx % count($detailedAddresses)];

                    $ageYears = rand(22, 65);
                    $birthDate = now()->subYears($ageYears)->subMonths(rand(1, 11))->subDays(rand(1, 28))->format('Y-m-d');
                    $emergencyName = ($isMale ? 'Hj. '.$femaleNames[($globalIdx + 2) % count($femaleNames)] : 'H. '.$maleNames[($globalIdx + 2) % count($maleNames)]).' '.$ln;

                    $jamaahRows[] = [
                        'tenant_id' => $tenant->id,
                        'agen_id' => $agentObj->id,
                        'crm_stage_id' => $slotStageId,
                        'nama_lengkap' => "{$fn} {$ln}",
                        'jenis_kelamin' => $gender,
                        'tempat_lahir' => $birthPlaces[$globalIdx % count($birthPlaces)],
                        'tanggal_lahir' => $birthDate,
                        'nik' => $nik,
                        'alamat_ktp' => $addr['alamat_ktp'],
                        'alamat_domisili' => $addr['alamat_domisili'],
                        'golongan_darah' => $bloodTypes[$globalIdx % count($bloodTypes)],
                        'status_pernikahan' => $maritalStatuses[$globalIdx % count($maritalStatuses)],
                        'riwayat_penyakit' => $diseases[$globalIdx % count($diseases)],
                        'kontak_darurat_nama' => $emergencyName,
                        'kontak_darurat_hp' => '08'.str_pad((string) (1800000000 + $globalIdx), 10, '0', STR_PAD_LEFT),
                        'kontak_darurat_hubungan' => $relations[$globalIdx % count($relations)],
                        'nomor_paspor' => null,
                        'no_hp' => $phone,
                        'email' => "nasabah{$globalIdx}.t{$tenant->id}@mailtest.id",
                        'paket_id' => $selectedPkg['id'],
                        'tanggal_keberangkatan' => null,
                        'catatan_admin' => "Calon jamaah via agen {$agentObj->name}. Tertarik paket berkah.",
                        'status_logistik' => 'Pending',
                        'tanggal_serah_terima_logistik' => null,
                        'created_at' => $createdAt,
                        'updated_at' => $createdAt,
                    ];
                }

                DB::table('jamaah')->insert($jamaahRows);
            }

            // 6a-2. Seed Pending DP pembayaran for some leads
            $sampleLeads = DB::table('jamaah')
                ->where('tenant_id', $tenant->id)
                ->whereIn('crm_stage_id', [$stage2->id, $stage3->id])
                ->limit(4)
                ->get();

            $pendingPayments = [];
            foreach ($sampleLeads as $lead) {
                $pendingPayments[] = [
                    'tenant_id' => $tenant->id,
                    'jamaah_id' => $lead->id,
                    'rekening_tenant_id' => $rekening->id,
                    'tipe_pembayaran' => 'DP',
                    'nominal' => 5000000.00,
                    'bukti_transfer' => 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&auto=format&fit=crop&q=80',
                    'status_verifikasi' => 'Pending',
                    'verified_by' => null,
                    'created_at' => now()->subHours(rand(1, 48)),
                    'updated_at' => now()->subHours(rand(1, 48)),
                ];
            }
            if (! empty($pendingPayments)) {
                DB::table('pembayaran')->insert($pendingPayments);
            }

            // 6b. Seed 5 Closing jamaah per agen (Lunas + Distribusi Logistik Realistis + Dokumen)
            $this->command->info('Generating 5 closing jamaah × '.count($agents).' agents for Tenant '.($tIndex + 1).'...');

            $closingIdx = 90000;
            $itemsList = [$invKoper->id, $invKain->id, $invBuku->id, $invBatik->id];

            foreach ($agents as $agentObj) {
                $closingRows = [];
                for ($c = 1; $c <= 5; $c++) {
                    $closingIdx++;
                    $isMale = ($closingIdx % 2 === 1);
                    $fn = $isMale ? $maleNames[$closingIdx % count($maleNames)] : $femaleNames[$closingIdx % count($femaleNames)];
                    $ln = $lastNames[($closingIdx * 13 + $tIndex * 7) % count($lastNames)];
                    $gender = $isMale ? 'Laki-laki' : 'Perempuan';

                    $pkgRand = rand(1, 100);
                    $selectedPkg = $pkgRand <= 45 ? $packagesList[0] : ($pkgRand <= 75 ? $packagesList[1] : ($pkgRand <= 93 ? $packagesList[2] : $packagesList[3]));

                    $daysAgo = rand(15, 90);
                    $createdAt = now()->subDays($daysAgo)->subHours(rand(1, 12));

                    $addr = $detailedAddresses[$closingIdx % count($detailedAddresses)];
                    $ageYears = rand(25, 68);
                    $birthDate = now()->subYears($ageYears)->subMonths(rand(1, 11))->subDays(rand(1, 28))->format('Y-m-d');
                    $emergencyName = ($isMale ? 'Hj. '.$femaleNames[($closingIdx + 3) % count($femaleNames)] : 'H. '.$maleNames[($closingIdx + 3) % count($maleNames)]).' '.$ln;

                    // Logistics status variation
                    $logStatusSeed = $closingIdx % 3;
                    $statusLogistik = 'Pending';
                    $tanggalKirim = null;
                    $tanggalSerah = null;
                    $ekspedisi = null;
                    $resi = null;

                    if ($logStatusSeed === 1) {
                        $statusLogistik = 'Shipped';
                        $ekspedisi = $couriers[$closingIdx % count($couriers)];
                        $resi = strtoupper(substr($ekspedisi, 0, 3)).str_pad((string) rand(1000000000, 9999999999), 10, '0');
                        $tanggalKirim = now()->subDays(rand(2, 6));
                    } elseif ($logStatusSeed === 2) {
                        $statusLogistik = 'Handed_Over';
                        $ekspedisi = $couriers[$closingIdx % count($couriers)];
                        $resi = strtoupper(substr($ekspedisi, 0, 3)).str_pad((string) rand(1000000000, 9999999999), 10, '0');
                        $tanggalKirim = now()->subDays(rand(7, 15));
                        $tanggalSerah = now()->subDays(rand(1, 5));
                    }

                    $closingSeq = ($closingIdx - 90001) % 80;
                    if ($closingSeq < 8) {
                        $departureDate = null; // Antrean Belum Ditentukan
                    } elseif ($closingSeq < 26) {
                        $departureDate = '2026-11-15'; // Kloter 1: 15 Nov 2026
                    } elseif ($closingSeq < 46) {
                        $departureDate = '2026-11-28'; // Kloter 2: 28 Nov 2026
                    } elseif ($closingSeq < 62) {
                        $departureDate = '2026-12-12'; // Kloter 3: 12 Des 2026
                    } elseif ($closingSeq < 76) {
                        $departureDate = '2026-12-26'; // Kloter 4: 26 Des 2026
                    } else {
                        $departureDate = '2027-01-16'; // Kloter 5: 16 Jan 2027
                    }

                    $closingRows[] = [
                        'tenant_id' => $tenant->id,
                        'agen_id' => $agentObj->id,
                        'crm_stage_id' => $stage4->id,
                        'nama_lengkap' => "{$fn} {$ln}",
                        'jenis_kelamin' => $gender,
                        'tempat_lahir' => $birthPlaces[$closingIdx % count($birthPlaces)],
                        'tanggal_lahir' => $birthDate,
                        'nik' => '32'.str_pad((string) ($tenant->id * 10000000000000 + $closingIdx), 14, '0', STR_PAD_LEFT),
                        'alamat_ktp' => $addr['alamat_ktp'],
                        'alamat_domisili' => $addr['alamat_domisili'],
                        'golongan_darah' => $bloodTypes[$closingIdx % count($bloodTypes)],
                        'status_pernikahan' => $maritalStatuses[$closingIdx % count($maritalStatuses)],
                        'riwayat_penyakit' => $diseases[$closingIdx % count($diseases)],
                        'kontak_darurat_nama' => $emergencyName,
                        'kontak_darurat_hp' => '08'.str_pad((string) (1900000000 + $closingIdx), 10, '0', STR_PAD_LEFT),
                        'kontak_darurat_hubungan' => $relations[$closingIdx % count($relations)],
                        'nomor_paspor' => chr(65 + ($closingIdx % 6)).str_pad((string) ($closingIdx), 7, '0', STR_PAD_LEFT),
                        'no_hp' => '08'.str_pad((string) (1500000000 + $closingIdx), 10, '0', STR_PAD_LEFT),
                        'email' => "jamaah{$closingIdx}.t{$tenant->id}@mailtest.id",
                        'paket_id' => $selectedPkg['id'],
                        'tanggal_keberangkatan' => $departureDate,
                        'catatan_admin' => "Jamaah lunas terdaftar via agen {$agentObj->name}. Perlengkapan siap diproses.",
                        'status_logistik' => $statusLogistik,
                        'no_resi_logistik' => $resi,
                        'ekspedisi_logistik' => $ekspedisi,
                        'tanggal_kirim_logistik' => $tanggalKirim,
                        'tanggal_serah_terima_logistik' => $tanggalSerah,
                        'created_at' => $createdAt,
                        'updated_at' => $createdAt,
                    ];
                }

                DB::table('jamaah')->insert($closingRows);

                // Insert Pembayaran, Komisi, Item Distributions, dan Jamaah Documents
                $insertedJamaahs = DB::table('jamaah')
                    ->where('tenant_id', $tenant->id)
                    ->where('crm_stage_id', $stage4->id)
                    ->where('agen_id', $agentObj->id)
                    ->orderBy('id', 'desc')
                    ->limit(5)
                    ->get();

                $pembayaranRows = [];
                $komisiRows = [];
                $itemDistRows = [];
                $docRows = [];

                foreach ($insertedJamaahs as $jIdx => $jamaah) {
                    $pkgInfo = collect($packagesList)->firstWhere('id', $jamaah->paket_id) ?? $packagesList[0];
                    $txDate = now()->subDays(rand(5, 30));

                    $pembayaranRows[] = [
                        'tenant_id' => $tenant->id,
                        'jamaah_id' => $jamaah->id,
                        'rekening_tenant_id' => $rekening->id,
                        'tipe_pembayaran' => 'Lunas',
                        'nominal' => $pkgInfo['harga'],
                        'bukti_transfer' => 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&auto=format&fit=crop&q=80',
                        'status_verifikasi' => 'Verified',
                        'verified_by' => $owner->id,
                        'created_at' => $txDate,
                        'updated_at' => $txDate,
                    ];

                    $komisiRows[] = [
                        'tenant_id' => $tenant->id,
                        'agen_id' => $agentObj->id,
                        'jamaah_id' => $jamaah->id,
                        'nominal_komisi' => $pkgInfo['komisi'],
                        'status_pencairan' => rand(0, 1) ? 'Paid' : 'Ready_to_Pay',
                        'created_at' => $txDate,
                        'updated_at' => $txDate,
                    ];

                    // Item Distributions for checklist
                    foreach ($itemsList as $invId) {
                        $itemDistRows[] = [
                            'tenant_id' => $tenant->id,
                            'jamaah_id' => $jamaah->id,
                            'inventaris_id' => $invId,
                            'qty' => 1,
                            'status' => $jamaah->status_logistik,
                            'shipped_at' => $jamaah->tanggal_kirim_logistik,
                            'delivered_at' => $jamaah->tanggal_serah_terima_logistik,
                            'receiver_name' => $jamaah->status_logistik === 'Handed_Over' ? $jamaah->nama_lengkap : null,
                            'handed_over_by' => $jamaah->status_logistik === 'Handed_Over' ? $owner->id : null,
                            'notes' => 'Paket perlengkapan resmi travel umroh',
                            'created_at' => $jamaah->created_at,
                            'updated_at' => $jamaah->updated_at,
                        ];
                    }

                    // Jamaah Documents (KTP, Paspor, Kartu Keluarga, Vaksin)
                    $docRows[] = [
                        'tenant_id' => $tenant->id,
                        'jamaah_id' => $jamaah->id,
                        'type' => 'ktp',
                        'title' => 'E-KTP '.$jamaah->nama_lengkap,
                        'file_path' => 'https://images.unsplash.com/photo-1633409381658-a0c36b446818?w=800&auto=format&fit=crop&q=80',
                        'file_name' => 'ktp_'.strtolower(str_replace(' ', '_', $jamaah->nama_lengkap)).'.jpg',
                        'mime_type' => 'image/jpeg',
                        'file_size' => 1024 * rand(250, 800),
                        'notes' => 'E-KTP valid terverifikasi Dukcapil',
                        'uploaded_by' => $agentObj->id,
                        'created_at' => $jamaah->created_at,
                        'updated_at' => $jamaah->created_at,
                    ];
                    $docRows[] = [
                        'tenant_id' => $tenant->id,
                        'jamaah_id' => $jamaah->id,
                        'type' => 'kartu_keluarga',
                        'title' => 'KK '.$jamaah->nama_lengkap,
                        'file_path' => 'https://images.unsplash.com/photo-1633409381658-a0c36b446818?w=800&auto=format&fit=crop&q=80',
                        'file_name' => 'kk_'.strtolower(str_replace(' ', '_', $jamaah->nama_lengkap)).'.jpg',
                        'mime_type' => 'image/jpeg',
                        'file_size' => 1024 * rand(300, 950),
                        'notes' => 'Kartu Keluarga asli',
                        'uploaded_by' => $agentObj->id,
                        'created_at' => $jamaah->created_at,
                        'updated_at' => $jamaah->created_at,
                    ];
                    if ($jamaah->nomor_paspor) {
                        $docRows[] = [
                            'tenant_id' => $tenant->id,
                            'jamaah_id' => $jamaah->id,
                            'type' => 'paspor',
                            'title' => 'Paspor RI - '.$jamaah->nomor_paspor,
                            'file_path' => 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&auto=format&fit=crop&q=80',
                            'file_name' => 'paspor_'.$jamaah->nomor_paspor.'.jpg',
                            'mime_type' => 'image/jpeg',
                            'file_size' => 1024 * rand(400, 1200),
                            'notes' => 'Masa berlaku paspor > 8 bulan',
                            'uploaded_by' => $agentObj->id,
                            'created_at' => $jamaah->created_at,
                            'updated_at' => $jamaah->created_at,
                        ];
                    }
                }

                if (! empty($pembayaranRows)) {
                    DB::table('pembayaran')->insert($pembayaranRows);
                }
                if (! empty($komisiRows)) {
                    DB::table('komisi_agen')->insert($komisiRows);
                }
                if (! empty($itemDistRows)) {
                    DB::table('item_distributions')->insert($itemDistRows);
                }
                if (! empty($docRows)) {
                    DB::table('jamaah_documents')->insert($docRows);
                }
            }

            $this->command->info('Tenant '.($tIndex + 1).' completed successfully!');
        }
    }
}
