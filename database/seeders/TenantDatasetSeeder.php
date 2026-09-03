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
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class TenantDatasetSeeder extends Seeder
{
    /**
     * Seed 2 tenants with complete, realistic employee, agent, banking, and 10,000+ relational CRM records.
     */
    public function run(): void
    {
        $defaultPassword = Hash::make('password');

        $tenantsData = [
            [
                'name' => 'HajjFlow Travel Nusantara',
                'subdomain' => 'hajjflow',
                'owner_name' => 'H. Abdullah Hakim, Lc',
                'owner_email' => 'test@example.com',
                'owner_nik' => '3201011508820001',
                'owner_phone' => '081289901122',
                'owner_city' => 'Jakarta Selatan',
                'owner_address' => 'Jl. Kemang Raya No. 45, RT 02/RW 05, Bangka, Mampang Prapatan',
                'owner_bank' => 'Bank Syariah Indonesia (BSI)',
                'owner_rek' => '7123849102',
                'bank' => 'Bank Syariah Indonesia (BSI)',
                'acc_no' => '7123849102',
                'acc_name' => 'PT HajjFlow Nusantara Amanah',
            ],
            [
                'name' => 'Barokah Madinah Wisata',
                'subdomain' => 'barokah',
                'owner_name' => 'Hj. Siti Rahmawati, S.E.',
                'owner_email' => 'owner@barokah.com',
                'owner_nik' => '3273045209860003',
                'owner_phone' => '081398877665',
                'owner_city' => 'Bandung',
                'owner_address' => 'Jl. Ir. H. Juanda No. 128, Dago, Coblong',
                'owner_bank' => 'Bank Mandiri',
                'owner_rek' => '1420098765432',
                'bank' => 'Bank Mandiri',
                'acc_no' => '1420098765432',
                'acc_name' => 'PT Barokah Madinah Mandiri',
            ],
        ];

        $cities = ['Jakarta Selatan', 'Jakarta Timur', 'Bandung', 'Surabaya', 'Semarang', 'Yogyakarta', 'Medan', 'Makassar', 'Bekasi', 'Tangerang Selatan'];
        $banks = ['BCA', 'Bank Mandiri', 'BSI (Bank Syariah Indonesia)', 'BRI', 'BNI'];

        foreach ($tenantsData as $tIndex => $tData) {
            $this->command->info('Seeding Tenant '.($tIndex + 1).": {$tData['name']}...");

            $tenant = Tenant::create([
                'nama_travel' => $tData['name'],
                'domain_atau_subdomain' => $tData['subdomain'],
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
            $supervisors = [];
            for ($s = 1; $s <= 2; $s++) {
                $spvName = "Ustadz H. Rahmat Hidayat {$s}";
                $supervisors[] = User::create([
                    'tenant_id' => $tenant->id,
                    'hierarchy_level_id' => $spvLevel->id,
                    'name' => "{$spvName} (".($tIndex === 0 ? 'Pusat' : 'Cabang').')',
                    'email' => "spv{$s}.t".($tIndex + 1).'@travel.com',
                    'password' => $defaultPassword,
                    'role' => 'admin_travel',
                    'jabatan' => 'Supervisor',
                    'nik' => '32'.str_pad((string) (71000000000000 + ($tIndex * 100) + $s), 14, '0', STR_PAD_LEFT),
                    'no_hp' => '0812'.rand(10000000, 99999999),
                    'kota' => $cities[$s % count($cities)],
                    'alamat' => "Komplek Perkantoran Graha Travel Blok {$s}, Lt. 2",
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
                    $tlName = "Leader Pembina {$tlIdx} - ".($tIndex === 0 ? 'Jabodetabek' : 'Jawa Barat');
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
                        'kota' => $cities[($tlIdx + 2) % count($cities)],
                        'alamat' => "Jl. Boulevard Raya No. {$tlIdx}, Sentra Bisnis",
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
            $agentNames = [
                'Budi Santoso, S.Kom',
                'Aisyah Putri Azzahra',
                'H. Muhammad Fauzan',
                'Dewi Lestari, S.Pd',
                'dr. Hendra Kusuma',
                'Nurul Fadilah',
                'Agus Setiawan',
                'Ustadzah Maryam Fitriani',
                'Ridwan Kamiludin',
                'Fathimah Zahra',
                'Bambang Tri Nugroho',
                'Tri Wahyuni, M.Si',
                'Eko Prasetyo Utomo',
                'Siti Khodijah',
                'Wahyu Al-Fatih',
                'Laila Ramadhani',
            ];

            $agents = [];
            foreach ($teamLeaders as $tlIdx => $tl) {
                for ($ag = 1; $ag <= 4; $ag++) {
                    $agentNum = ($tlIdx * 4 + $ag);
                    $name = $agentNames[($agentNum - 1) % count($agentNames)];
                    $isPrimaryDemo = ($tIndex === 0 && $agentNum === 1);
                    $email = $isPrimaryDemo ? 'budi@example.com' : "agent{$agentNum}.t".($tIndex + 1).'@travel.com';
                    $referral = $isPrimaryDemo ? 'AG-DXPP4B' : 'AG-'.strtoupper(substr(md5("ag-{$tIndex}-{$agentNum}"), 0, 6));

                    $agents[] = User::create([
                        'tenant_id' => $tenant->id,
                        'hierarchy_level_id' => $agentLevel->id,
                        'name' => $isPrimaryDemo ? 'Budi Santoso (Agen Konsultan)' : "{$name} - ".($tIndex === 0 ? 'HajjFlow' : 'Barokah'),
                        'email' => $email,
                        'password' => $defaultPassword,
                        'role' => 'agen',
                        'jabatan' => 'Konsultan Bimbingan Umroh',
                        'nik' => '32'.str_pad((string) (73000000000000 + ($tIndex * 100) + $agentNum), 14, '0', STR_PAD_LEFT),
                        'no_hp' => '08'.($isPrimaryDemo ? '81234567890' : (rand(11, 19).rand(1000000, 9999999))),
                        'kota' => $cities[($agentNum * 3) % count($cities)],
                        'alamat' => "Jl. Dahlia Indah No. {$agentNum}, RT 04/RW 02",
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
                                'url' => 'https://wa.me/6281234567890?text=Halo%20saya%20tertarik%20paket%20Umroh%20Reguler',
                                'icon' => 'plane',
                                'is_highlight' => true,
                            ],
                            [
                                'id' => 'link-2',
                                'title' => 'Download Brosur & Jadwal Keberangkatan',
                                'url' => 'https://wa.me/6281234567890?text=Mohon%20kirimkan%20brosur%20paket%20terbaru',
                                'icon' => 'file',
                                'is_highlight' => false,
                            ],
                            [
                                'id' => 'link-3',
                                'title' => 'Konsultasi Tabungan Porsi Haji Furoda',
                                'url' => 'https://wa.me/6281234567890?text=Konsultasi%20Haji%20Furoda',
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

            // 6. Bulk Seed Realistic Jamaah & Relational Transactions per Tenant
            $totalRecords = ($tIndex === 0) ? 6500 : 9500;
            $chunkSize = 1000;
            $batches = ceil($totalRecords / $chunkSize);

            $this->command->info("Generating {$totalRecords} relational records in {$batches} chunks for Tenant ".($tIndex + 1).'...');

            $firstNames = ['Ahmad', 'Bambang', 'Chandra', 'Dewi', 'Eko', 'Fitri', 'Gita', 'Hadi', 'Indra', 'Joko', 'Kartika', 'Lestari', 'Muhammad', 'Nur', 'Oki', 'Putri', 'Rahmat', 'Siti', 'Tri', 'Umar', 'Wahyu', 'Yuliana', 'Zainal', 'Farhan', 'Anisa', 'Rizky', 'Ridwan', 'Aulia', 'Faisal', 'Nabila'];
            $lastNames = ['Pratama', 'Hidayat', 'Saputra', 'Wijaya', 'Kusuma', 'Santoso', 'Gunawan', 'Permana', 'Nugroho', 'Wibowo', 'Siregar', 'Lubis', 'Harahap', 'Nasution', 'Batubara', 'Tanjung', 'Pasaribu', 'Hutagalung', 'Al-Habsyi', 'Assegaf'];
            $fnCount = count($firstNames);
            $lnCount = count($lastNames);

            $numAgents = count($agentIds);

            for ($b = 0; $b < $batches; $b++) {
                $jamaahRows = [];
                $currentChunk = min($chunkSize, $totalRecords - ($b * $chunkSize));

                for ($i = 0; $i < $currentChunk; $i++) {
                    $recordIndex = ($b * $chunkSize) + $i + 1;
                    $fn = $firstNames[($recordIndex + ($i * 7)) % $fnCount];
                    $ln = $lastNames[($recordIndex * 5 + $i) % $lnCount];
                    $fullName = "{$fn} {$ln} {$recordIndex}";

                    $daysAgo = rand(0, 175);
                    $createdAt = now()->subDays($daysAgo)->subHours(rand(1, 23))->subMinutes(rand(1, 59));

                    // Realistic weighted Stage distribution
                    $stageRand = rand(1, 100);
                    if ($stageRand <= 38) {
                        $stageId = $stage1->id; // New Leads
                    } elseif ($stageRand <= 62) {
                        $stageId = $stage2->id; // Follow Up
                    } elseif ($stageRand <= 76) {
                        $stageId = $stage3->id; // Negosiasi
                    } else {
                        $stageId = $stage4->id; // Closing
                    }

                    // Weighted Package distribution (Reguler 45%, VIP 30%, Plus 18%, Haji 7%)
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

                    // Weighted agent allocation: superstar agents get more leads and closings
                    $agentRoll = rand(1, 100);
                    if ($agentRoll <= 30 && isset($agentIds[0])) {
                        $assignedAgentId = $agentIds[0];
                    } elseif ($agentRoll <= 55 && isset($agentIds[1])) {
                        $assignedAgentId = $agentIds[1];
                    } elseif ($agentRoll <= 72 && isset($agentIds[2])) {
                        $assignedAgentId = $agentIds[2];
                    } elseif ($agentRoll <= 88) {
                        $assignedAgentId = $agentIds[rand(3, max(3, $numAgents - 1))];
                    } else {
                        $assignedAgentId = null; // Direct organic web leads
                    }

                    $nik = '32'.str_pad((string) ($tenant->id * 10000000000000 + $recordIndex), 14, '0', STR_PAD_LEFT);
                    $phone = '08'.str_pad((string) (1200000000 + $recordIndex), 10, '0', STR_PAD_LEFT);
                    $email = "jamaah{$recordIndex}.t{$tenant->id}@mailtest.id";
                    $passport = ($stageId === $stage4->id) ? 'A'.str_pad((string) ($tenant->id * 1000000 + $recordIndex), 8, '0', STR_PAD_LEFT) : null;
                    $depDate = ($stageId === $stage4->id) ? date('Y-m-d', strtotime('+ '.(rand(15, 120)).' days')) : null;
                    $logStatus = ($stageId === $stage4->id) ? ((rand(1, 10) > 4) ? 'Handed_Over' : 'Ready_to_Pickup') : 'Pending';

                    $jamaahRows[] = [
                        'tenant_id' => $tenant->id,
                        'agen_id' => $assignedAgentId,
                        'crm_stage_id' => $stageId,
                        'nama_lengkap' => $fullName,
                        'nik' => $nik,
                        'nomor_paspor' => $passport,
                        'no_hp' => $phone,
                        'email' => $email,
                        'paket_id' => $selectedPkg['id'],
                        'tanggal_keberangkatan' => $depDate,
                        'catatan_admin' => "Pendaftaran paket {$selectedPkg['id']} prospek #{$recordIndex}",
                        'status_logistik' => $logStatus,
                        'tanggal_serah_terima_logistik' => ($logStatus === 'Handed_Over') ? $createdAt->copy()->addDays(rand(2, 10)) : null,
                        'created_at' => $createdAt,
                        'updated_at' => $createdAt,
                    ];
                }

                DB::table('jamaah')->insert($jamaahRows);

                $insertedJamaahs = DB::table('jamaah')
                    ->where('tenant_id', $tenant->id)
                    ->orderBy('id', 'desc')
                    ->limit($currentChunk)
                    ->get(['id', 'crm_stage_id', 'paket_id', 'agen_id', 'created_at'])
                    ->reverse();

                $pembayaranRows = [];
                $komisiRows = [];
                $transaksiRows = [];

                foreach ($insertedJamaahs as $jItem) {
                    $isClosing = ($jItem->crm_stage_id === $stage4->id);
                    $isNegotiation = ($jItem->crm_stage_id === $stage3->id);

                    if ($isClosing || $isNegotiation) {
                        $isVerified = $isClosing;
                        $pkgInfo = null;
                        foreach ($packagesList as $p) {
                            if ($p['id'] === $jItem->paket_id) {
                                $pkgInfo = $p;
                                break;
                            }
                        }
                        $pkgInfo = $pkgInfo ?? $packagesList[0];

                        $nominal = $isClosing ? $pkgInfo['harga'] : (rand(3, 10) * 1000000);
                        $payType = $isClosing ? 'Lunas' : 'DP';
                        $txDate = Carbon::parse($jItem->created_at);

                        $pembayaranRows[] = [
                            'tenant_id' => $tenant->id,
                            'jamaah_id' => $jItem->id,
                            'rekening_tenant_id' => $rekening->id,
                            'tipe_pembayaran' => $payType,
                            'nominal' => $nominal,
                            'bukti_transfer' => 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&auto=format&fit=crop&q=80',
                            'status_verifikasi' => $isVerified ? 'Verified' : 'Pending',
                            'verified_by' => $isVerified ? $owner->id : null,
                            'created_at' => $txDate,
                            'updated_at' => $txDate,
                        ];

                        if ($isVerified && $jItem->agen_id) {
                            $komisiRows[] = [
                                'tenant_id' => $tenant->id,
                                'agen_id' => $jItem->agen_id,
                                'jamaah_id' => $jItem->id,
                                'nominal_komisi' => $pkgInfo['komisi'],
                                'status_pencairan' => (rand(1, 10) > 4) ? 'Paid' : 'Ready_to_Pay',
                                'created_at' => $txDate,
                                'updated_at' => $txDate,
                            ];

                            $transaksiRows[] = [
                                'tenant_id' => $tenant->id,
                                'inventaris_id' => $invKoper->id,
                                'jamaah_id' => $jItem->id,
                                'qty' => 1,
                                'tipe' => 'OUT',
                                'created_at' => $txDate,
                                'updated_at' => $txDate,
                            ];
                        }
                    }
                }

                if (! empty($pembayaranRows)) {
                    DB::table('pembayaran')->insert($pembayaranRows);
                }
                if (! empty($komisiRows)) {
                    DB::table('komisi_agen')->insert($komisiRows);
                }
                if (! empty($transaksiRows)) {
                    DB::table('inventaris_transaksi')->insert($transaksiRows);
                }
            }

            $this->command->info('Tenant '.($tIndex + 1).' completed successfully!');
        }
    }
}
