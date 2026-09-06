import { StepGuide } from "../types";

export const OWNER_MODULES: StepGuide[] = [
    {
        id: '01_dashboard_utama_owner',
        title: 'Dashboard Utama & Ringkasan KPI Eksekutif',
        category: 'Eksekutif & Dashboard',
        targetRole: 'Owner (Level 1)',
        loginAs: 'superadmin',
        workflowStage: '1. Monitoring & Analitik Bisnis',
        route: '/dashboard',
        description: 'Pusat kendali eksekutif untuk melihat performa bisnis travel, total omzet masuk, sisa piutang, keterisian kuota jamaah, dan performa penjualan seluruh agen secara makro.',
        crudActions: {
            read: [
                'Melihat 4 Kartu KPI Utama: Total Jamaah, Akumulasi Omzet, Sisa Tagihan Jamaah, dan Jumlah Mitra Agen Aktif.',
                'Melihat grafik tren pendaftaran jamaah per bulan.',
                'Memantau daftar keberangkatan terdekat beserta status keterisian seat.'
            ],
            special: [
                'Filter analitik berdasarkan rentang tanggal kustom.',
                'Ganti tema tampilan sistem (Luxury, Dark, Light, Emerald) melalui menu profil.'
            ]
        },
        steps: [
            'Buka halaman login dan masukkan kredensial Owner (`superadmin@hajjflow.com`).',
            'Periksa ringkasan angka pada kartu KPI di baris paling atas.',
            'Analisis grafik tren pendaftaran untuk merencanakan promosi keberangkatan musim berikutnya.'
        ]
    },
    {
        id: '02_crm_pipeline_kanban',
        title: 'Papan CRM Kanban Pipeline Jamaah (Leads to Closing)',
        category: 'CRM & Penjualan',
        targetRole: 'Owner (Level 1)',
        loginAs: 'superadmin',
        workflowStage: '2. Pengawalan Leads & Prospek',
        route: '/crm',
        description: 'Papan Kanban visual interaktif untuk mengawal alur prospek calon jamaah dari tahap Kontak Pertama, Konsultasi, Booking Kursi, Pembayaran DP, Pengumpulan Berkas, hingga Pelunasan.',
        crudActions: {
            create: [
                'Klik "+ Tambah Calon Nasabah" pada tombol utama untuk memasukkan data prospek baru secara instan.'
            ],
            read: [
                'Melihat sebaran jamaah di setiap tahapan pipeline (New Leads, Follow Up, Booking, DP, Pelunasan).',
                'Filter kartu jamaah berdasarkan Agen Pembina, Paket Umroh, atau Jadwal Keberangkatan.'
            ],
            update: [
                'Drag & Drop (geser) kartu jamaah antar-kolom status untuk memindahkan progres secara realtime.',
                'Buka laci detail jamaah untuk melengkapi data paspor, foto KTP, dan buku nikah.'
            ],
            delete: [
                'Arsipkan atau hapus data prospek yang batal mendaftar dari laci detail.'
            ],
            special: [
                'Klik tombol WhatsApp pada kartu jamaah untuk mengirim pesan follow-up instan dengan template otomatis.'
            ]
        },
        steps: [
            'Buka menu CRM > Pipeline Kanban.',
            'Pantau kolom "New Leads" yang masuk dari formulir website atau referral agen.',
            'Tarik (drag) kartu jamaah ke kolom "Booking / DP" jika calon jamaah sudah menyetujui paket.',
            'Buka kartu untuk memverifikasi dokumen paspor dan visa.'
        ],
        actions: async (page: any, ssDir: string) => {
            // Open Add Lead modal
            const addBtn = page.getByRole('button', { name: /Tambah Calon Nasabah/i }).first();
            if (await addBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
                await addBtn.click();
                await page.waitForTimeout(1000);
                await page.screenshot({ path: `${ssDir}/02_crm_pipeline_kanban_modal_tambah_leads.webp`, fullPage: false, type: 'webp', quality: 85 });
                await page.keyboard.press('Escape');
                await page.waitForTimeout(600);
            }
        }
    },
    {
        id: '03_tambah_jamaah_manual_owner',
        title: 'Tambah Jamaah Baru Manual oleh Owner/Staf (CRM Create)',
        category: 'CRM & Kasir',
        targetRole: 'Owner (Level 1)',
        loginAs: 'superadmin',
        workflowStage: '3. Pendaftaran Jamaah Manual',
        route: '/crm',
        description: 'Owner atau staf kantor dapat mendaftarkan calon jamaah secara manual langsung dari papan CRM, misalnya untuk pendaftaran tatap muka, lewat telepon, atau pameran.',
        crudActions: {
            create: [
                'Klik tombol "+ Tambah Calon Nasabah" pada papan CRM.',
                'Isi formulir: Nama Lengkap, No HP/WhatsApp, Email, NIK KTP, Pilihan Paket Umroh, dan Agen Pembina (opsional).',
                'Klik Simpan — jamaah otomatis masuk ke stage "New Leads" di papan CRM Kanban.'
            ],
            read: [
                'Pencarian data jamaah berdasarkan Nama, Nomor Telepon/WhatsApp, NIK, atau Paket.',
                'Melihat riwayat log aktivitas dan prospek jamaah.'
            ],
            update: [
                'Klik tombol Edit Data untuk mengubah data pribadi, nomor paspor, atau paket yang dipilih.'
            ],
            special: [
                'Otomatis terhubung dengan pipeline agen pembina jika dipilih.'
            ]
        },
        steps: [
            'Login sebagai Owner, buka menu CRM > Pipeline Leads.',
            'Klik tombol "+ Tambah Calon Nasabah" di pojok kanan atas.',
            'Isi semua field yang wajib: Nama, No HP, NIK, dan pilih Paket Umroh.',
            'Tentukan Agen Pembina jika calon jamaah direferensikan oleh agen tertentu.',
            'Klik Simpan — jamaah baru langsung muncul di kolom New Leads.'
        ],
        tips: [
            'Untuk mendaftarkan jamaah walk-in (hadir langsung ke kantor), gunakan fitur ini agar data langsung tercatat dan terintegrasi ke CRM agen.'
        ],
        actions: async (page: any, ssDir: string) => {
            const addBtn = page.getByRole('button', { name: /Tambah Calon Nasabah/i }).first();
            if (await addBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
                await addBtn.click();
                await page.waitForTimeout(1000);
                await page.screenshot({ path: `${ssDir}/03_tambah_jamaah_manual_owner_drawer.webp`, fullPage: false, type: 'webp', quality: 85 });
                await page.keyboard.press('Escape');
                await page.waitForTimeout(600);
            }
        }
    },
    {
        id: '03b_data_jamaah_dan_kasir',
        title: 'Master Data Jamaah, Kasir & Kuitansi Pembayaran',
        category: 'CRM & Kasir',
        targetRole: 'Owner (Level 1)',
        loginAs: 'superadmin',
        workflowStage: '3. Transaksi & Validasi Pembayaran',
        route: '/crm/customers',
        description: 'Master data seluruh jamaah terdaftar dengan fungsi Kasir untuk memverifikasi pembayaran transfer bank, mencatat cicilan/pelunasan, dan menerbitkan invoice resmi.',
        crudActions: {
            create: [
                'Mencatat transaksi pelunasan, cicilan, atau uang muka jamaah secara langsung di tab keuangan.'
            ],
            read: [
                'Pencarian data jamaah berdasarkan Nama, Nomor Telepon/WhatsApp, NIK, atau Nomor Paspor.',
                'Melihat riwayat log pembayaran dan sisa tagihan per jamaah.'
            ],
            update: [
                'Klik tombol "Edit Data" untuk mengubah data pribadi, nomor paspor, kamar hotel, atau paket yang dipilih.',
                'Klik tombol "Rincian & Bayar" untuk membuka laci kasir keuangan.'
            ],
            delete: [
                'Hapus data pendaftaran jamaah yang dibatalkan melalui opsi tindakan.'
            ],
            special: [
                'Cetak Kuitansi Pembayaran & Invoice Digital Resmi bertanda tangan travel.'
            ]
        },
        steps: [
            'Masuk ke menu CRM > Data Jamaah.',
            'Cari nama jamaah yang melakukan transfer pembayaran.',
            'Klik tombol "Edit Data" ➔ Lengkapi paspor dan data personal.',
            'Klik tombol "Rincian & Bayar" ➔ Sistem menampilkan status Lunas atau Sisa Piutang.'
        ],
        actions: async (page: any, ssDir: string) => {
            // Click first row's "Edit Data" button
            const detailBtn = page.getByRole('button', { name: /Edit Data/i }).first();
            if (await detailBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
                await detailBtn.click();
                await page.waitForTimeout(1200);
                await page.screenshot({ path: `${ssDir}/03b_data_jamaah_dan_kasir_drawer.webp`, fullPage: false, type: 'webp', quality: 85 });
                await page.keyboard.press('Escape');
                await page.waitForTimeout(600);
            }
        }
    },
    {
        id: '03c_input_dp_pembayaran_owner',
        title: 'Input Pembayaran DP Jamaah oleh Owner/Kasir',
        category: 'CRM & Kasir',
        targetRole: 'Owner (Level 1)',
        loginAs: 'superadmin',
        workflowStage: '3. Transaksi & Validasi Pembayaran',
        route: '/crm/customers',
        description: 'Kasir atau Owner memasukkan penerimaan uang muka (Down Payment / DP) jamaah ke dalam sistem setelah konfirmasi transfer bank diterima. Nominal DP bisa berapa saja sesuai kebijakan travel.',
        crudActions: {
            create: [
                'Buka laci detail jamaah ➔ klik tombol "Rincian & Bayar" ➔ klik "Catat Pelunasan / Cicilan".',
                'Pilih Tipe Pembayaran: **DP** (uang muka).',
                'Isi Nominal DP yang ditransfer jamaah.',
                'Pilih Rekening Bank Tujuan (rekening travel yang digunakan jamaah).',
                'Unggah foto/scan Bukti Transfer.',
                'Klik Simpan — saldo tagihan jamaah otomatis berkurang.'
            ],
            read: [
                'Riwayat semua pembayaran jamaah tersusun kronologis di bagian bawah halaman detail.'
            ],
            special: [
                'Sistem menghitung otomatis Sisa Tagihan = Harga Paket − Total Pembayaran Masuk.'
            ]
        },
        steps: [
            'Buka CRM > Data Jamaah, cari nama jamaah yang mentransfer DP.',
            'Klik tombol "Rincian & Bayar" pada baris jamaah.',
            'Klik tombol "Catat Pelunasan / Cicilan" jika masih ada sisa tagihan.',
            'Pilih tipe "DP", isi nominal, pilih rekening, unggah bukti transfer.',
            'Klik Simpan — status pembayaran jamaah terupdate dan sisa tagihan berkurang.'
        ],
        tips: [
            'Satu jamaah dapat memiliki beberapa transaksi DP (cicilan), semuanya terakumulasi otomatis oleh sistem.'
        ],
        actions: async (page: any, ssDir: string) => {
            const finBtn = page.getByRole('button', { name: /Rincian & Bayar/i }).first();
            if (await finBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
                await finBtn.click();
                await page.waitForTimeout(1000);
                const payBtn = page.getByRole('button', { name: /Catat Pelunasan \/ Cicilan/i }).first();
                if (await payBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
                    await payBtn.click();
                    await page.waitForTimeout(800);
                }
                await page.screenshot({ path: `${ssDir}/03c_input_dp_pembayaran_owner_drawer.webp`, fullPage: false, type: 'webp', quality: 85 });
                await page.keyboard.press('Escape');
                await page.waitForTimeout(600);
            }
        }
    },
    {
        id: '03d_verifikasi_bukti_transfer_owner',
        title: 'Verifikasi & Persetujuan Bukti Transfer (Finance)',
        category: 'Keuangan & Verifikasi',
        targetRole: 'Owner (Level 1)',
        loginAs: 'superadmin',
        workflowStage: '3. Transaksi & Validasi Pembayaran',
        route: '/finance/payment',
        description: 'Halaman Finance Payment adalah pusat validasi kasir untuk menyetujui atau menolak bukti transfer yang diunggah jamaah atau agen. Setelah diverifikasi, dana dianggap masuk resmi ke kas travel.',
        crudActions: {
            read: [
                'Melihat semua pengajuan pembayaran dengan status Pending Verifikasi yang menunggu konfirmasi.',
                'Klik "Lihat Bukti" untuk membuka pratinjau lembar foto/scan transfer bank asli.'
            ],
            update: [
                'Klik tombol "Setujui" untuk mengesahkan pembayaran — status berubah ke Verified.',
                'Klik tombol "Tolak" jika bukti transfer tidak valid atau dana belum masuk rekening.'
            ],
            special: [
                'Setelah diverifikasi, komisi agen terkait otomatis berstatus Eligible (siap dicairkan).',
                'Jamaah yang sudah Lunas total otomatis pindah ke stage Closing di Kanban CRM.'
            ]
        },
        steps: [
            'Login sebagai Owner, buka menu Finance > Verifikasi Pembayaran.',
            'Cari baris pembayaran dengan status "Pending" (belum diverifikasi).',
            'Klik tombol "Lihat Bukti" untuk melihat pratinjau bukti transfer.',
            'Konfirmasi kesesuaian nominal dengan mutasi bank travel.',
            'Klik tombol "Setujui" — status berubah menjadi Verified dan sistem memproses komisi agen secara otomatis.'
        ],
        tips: [
            'Selalu cocokkan nominal yang tertera di bukti transfer dengan mutasi rekening bank resmi sebelum menyetujui.'
        ],
        actions: async (page: any, ssDir: string) => {
            const slipBtn = page.getByRole('button', { name: /Lihat Bukti/i }).first();
            if (await slipBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
                await slipBtn.click();
                await page.waitForTimeout(1000);
                await page.screenshot({ path: `${ssDir}/03d_verifikasi_bukti_transfer_owner_pratinjau_bukti.webp`, fullPage: false, type: 'webp', quality: 85 });
                await page.keyboard.press('Escape');
                await page.waitForTimeout(600);
            }
        }
    },
    {
        id: '03e_input_pelunasan_jamaah_owner',
        title: 'Input Pelunasan Penuh (Lunas) Jamaah oleh Kasir',
        category: 'CRM & Kasir',
        targetRole: 'Owner (Level 1)',
        loginAs: 'superadmin',
        workflowStage: '3. Transaksi & Validasi Pembayaran',
        route: '/crm/customers',
        description: 'Proses pencatatan pelunasan akhir jamaah saat total pembayaran telah memenuhi harga paket. Sistem otomatis memindahkan jamaah ke stage Closing dan menerbitkan notifikasi komisi agen.',
        crudActions: {
            create: [
                'Buka laci kasir jamaah ➔ klik "Catat Pelunasan / Cicilan".',
                'Pilih Tipe Pembayaran: **Pelunasan**.',
                'Sistem mendeteksi jika total pembayaran = harga paket ➔ status otomatis berubah menjadi **LUNAS (100%)**.'
            ],
            special: [
                'Komisi agen otomatis berpindah ke status Ready_to_Pay setelah lunas terverifikasi.',
                'Notifikasi dikirim ke dashboard agen bahwa jamaah binaan telah lunas.'
            ]
        },
        steps: [
            'Buka CRM > Data Jamaah ➔ cari jamaah yang akan dilunasi.',
            'Klik tombol "Rincian & Bayar" pada baris jamaah.',
            'Input sisa nominal pelunasan, pilih rekening, dan unggah bukti transfer terakhir.',
            'Klik Simpan ➔ sistem otomatis menandai jamaah sebagai Lunas.',
            'Buka Finance > Verifikasi Pembayaran ➔ setujui bukti pelunasan.',
            'Jamaah otomatis berpindah ke kolom Closing di papan CRM Kanban.'
        ],
        actions: async (page: any, ssDir: string) => {
            const finBtn = page.getByRole('button', { name: /Rincian & Bayar/i }).first();
            if (await finBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
                await finBtn.click();
                await page.waitForTimeout(1200);
                await page.screenshot({ path: `${ssDir}/03e_input_pelunasan_jamaah_owner_drawer.webp`, fullPage: false, type: 'webp', quality: 85 });
                await page.keyboard.press('Escape');
                await page.waitForTimeout(600);
            }
        }
    },
    {
        id: '03f_pindah_stage_kanban_owner',
        title: 'Memindahkan Stage Jamaah di Papan Kanban CRM',
        category: 'CRM & Penjualan',
        targetRole: 'Owner (Level 1)',
        loginAs: 'superadmin',
        workflowStage: '2. Pengawalan Leads & Prospek',
        route: '/crm',
        description: 'Owner dapat menggeser kartu jamaah antar-kolom tahapan CRM (New Leads → Follow Up → Negosiasi → Closing) baik secara drag & drop maupun via tombol follow-up dan edit.',
        crudActions: {
            update: [
                'Drag & Drop kartu jamaah dari kolom satu ke kolom berikutnya secara langsung.',
                'Atau klik tombol Follow-up pada kartu jamaah untuk mencatat progres negosiasi.',
                'Setiap perpindahan stage tercatat otomatis di log aktivitas jamaah.'
            ],
            read: [
                'Lihat jumlah jamaah per stage di header setiap kolom.',
                'Filter kartu berdasarkan nama, nomor HP, paket, atau agen.'
            ]
        },
        steps: [
            'Buka menu CRM > Pipeline Leads.',
            'Temukan kartu jamaah yang ingin dipindahkan stagenya.',
            'Seret (drag) kartu ke kolom stage yang baru atau klik tombol Follow-up.',
            'Konfirmasi perpindahan — log stage otomatis terupdate di histori jamaah.'
        ],
        tips: [
            'Perpindahan dari stage Negosiasi ke Closing hanya bisa dilakukan setelah ada minimal satu pembayaran yang sudah terverifikasi.'
        ],
        actions: async (page: any, ssDir: string) => {
            const followBtn = page.getByRole('button', { name: /Follow-up/i }).first();
            if (await followBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
                await followBtn.click();
                await page.waitForTimeout(1000);
                await page.screenshot({ path: `${ssDir}/03f_pindah_stage_kanban_owner_modal_followup.webp`, fullPage: false, type: 'webp', quality: 85 });
                await page.keyboard.press('Escape');
                await page.waitForTimeout(600);
            }
        }
    },
    {
        id: '04_distribusi_logistik',
        title: 'Distribusi & Serah Terima Logistik Perlengkapan',
        category: 'Operasional Gudang',
        targetRole: 'Owner (Level 1)',
        loginAs: 'superadmin',
        workflowStage: '4. Eksekusi & Serah Terima Perlengkapan',
        route: '/crm/logistics',
        description: 'Modul serah terima barang perlengkapan ibadah (koper bagasi, kain ihram/mukena, buku doa, id card) kepada jamaah yang telah melunasi pembayaran.',
        crudActions: {
            read: [
                'Melihat daftar jamaah per jadwal keberangkatan beserta status kelengkapan perlengkapannya.',
                'Buka laci detail serah terima untuk memeriksa daftar item perlengkapan.'
            ],
            update: [
                'Centang (checklist) item perlengkapan yang diserahkan fisik kepada jamaah.',
                'Simpan status serah terima barang secara realtime.'
            ],
            special: [
                'Otomatis memotong jumlah stok fisik di modul Inventaris Gudang saat item dicentang.'
            ]
        },
        steps: [
            'Buka menu CRM > Logistik Jamaah.',
            'Klik kartu jamaah yang ingin diserahkan perlengkapannya.',
            'Centang item yang diserahkan ke jamaah (misal: Koper, Batik, Kain Ihram).',
            'Klik Simpan untuk memperbarui rekaman logistik.'
        ],
        actions: async (page: any, ssDir: string) => {
            const firstCard = page.locator('div[class*="group"]').first();
            if (await firstCard.isVisible({ timeout: 3000 }).catch(() => false)) {
                await firstCard.click();
                await page.waitForTimeout(1200);
                await page.screenshot({ path: `${ssDir}/04_distribusi_logistik_drawer_serah_terima.webp`, fullPage: false, type: 'webp', quality: 85 });
                await page.keyboard.press('Escape');
                await page.waitForTimeout(600);
            }
        }
    },
    {
        id: '05_jadwal_keberangkatan',
        title: 'Jadwal, Maskapai & Manajemen Kuota Kursi',
        category: 'Operasional',
        targetRole: 'Owner (Level 1)',
        loginAs: 'superadmin',
        workflowStage: '4. Manajemen Kloter & Kuota Seat',
        route: '/crm/schedules',
        description: 'Manajemen kloter keberangkatan, batas kuota kursi pesawat, hotel Makkah/Madinah, dan status ketersediaan seat.',
        crudActions: {
            create: [
                'Plot tanggal terbang jamaah ke jadwal kloter keberangkatan baru.'
            ],
            read: [
                'Melihat persentase keterisian kursi (Seat Occupancy) per tanggal keberangkatan.',
                'Buka laci detail manifest jamaah untuk memeriksa status paspor dan penerbangan.'
            ],
            update: [
                'Ubah tanggal terbang, jadwalkan ulang (reschedule) jamaah, atau export manifest CSV.'
            ]
        },
        steps: [
            'Buka menu CRM > Jadwal Keberangkatan.',
            'Periksa sisa kuota kursi pada paket umroh musim aktif.',
            'Klik kartu jamaah untuk membuka laci rincian manifest dan mengatur jadwal terbang.'
        ],
        actions: async (page: any, ssDir: string) => {
            const firstJamaahCard = page.locator('div[class*="shadow-2xs"]').first();
            if (await firstJamaahCard.isVisible({ timeout: 3000 }).catch(() => false)) {
                await firstJamaahCard.click();
                await page.waitForTimeout(1200);
                await page.screenshot({ path: `${ssDir}/05_jadwal_keberangkatan_drawer_manifest.webp`, fullPage: false, type: 'webp', quality: 85 });
                await page.keyboard.press('Escape');
                await page.waitForTimeout(600);
            }
        }
    },
    {
        id: '06_manajemen_mitra_agen',
        title: 'Manajemen Mitra Agen & Persetujuan Akun',
        category: 'Keagenan',
        targetRole: 'Owner (Level 1)',
        loginAs: 'superadmin',
        workflowStage: '2. Rekrutmen & Manajemen Kemitraan',
        route: '/agents',
        description: 'Daftar seluruh agen mitra konsultan, status persetujuan akun baru, level hierarki, kode referral personal, dan penunjukan Leader/Upline.',
        crudActions: {
            create: [
                'Klik "Tambah Agen" untuk mendaftarkan mitra baru secara manual dari kantor.'
            ],
            read: [
                'Melihat data kontak agen, kode referral, level kemitraan, dan jumlah total jamaah yang berhasil direkrut.',
                'Klik tombol "X Jamaah" atau tombol Eye untuk membuka drawer rincian jamaah binaan agen.'
            ],
            update: [
                'Ubah level agen (Konsultan -> Leader -> Cabang) untuk penyesuaian tier komisi.',
                'Ubah status akun (Aktif / Nonaktif / Suspended).'
            ],
            delete: [
                'Hapus akun agen mitra yang sudah tidak bekerjasama.'
            ]
        },
        steps: [
            'Buka menu Keagenan > Mitra Agen.',
            'Klik tombol "+ Tambah Agen" untuk menambah akun konsultan baru.',
            'Klik tombol "X Jamaah" pada baris agen untuk membuka drawer nasabah binaannya.'
        ],
        actions: async (page: any, ssDir: string) => {
            // 1. Capture Add Agent Sheet
            const addBtn = page.getByRole('button', { name: /Tambah Agen/i }).first();
            if (await addBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
                await addBtn.click();
                await page.waitForTimeout(1000);
                await page.screenshot({ path: `${ssDir}/06_manajemen_mitra_agen_sheet_tambah_agen.webp`, fullPage: false, type: 'webp', quality: 85 });
                await page.keyboard.press('Escape');
                await page.waitForTimeout(600);
            }

            // 2. Capture Agent Jamaah Drawer
            const jamaahBtn = page.locator('table tbody tr').first().locator('button:has-text("Jamaah")').first();
            if (await jamaahBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
                await jamaahBtn.click();
                await page.waitForTimeout(1500);
                await page.screenshot({ path: `${ssDir}/06_manajemen_mitra_agen_drawer_jamaah_binaan.webp`, fullPage: false, type: 'webp', quality: 85 });
                await page.keyboard.press('Escape');
                await page.waitForTimeout(600);
            }
        }
    },
    {
        id: '07_pencairan_komisi_agen',
        title: 'Rekapitulasi & Pencairan Komisi Mitra Agen',
        category: 'Keuangan & Komisi',
        targetRole: 'Owner (Level 1)',
        loginAs: 'superadmin',
        workflowStage: '6. Validasi & Pembayaran Komisi',
        route: '/commissions',
        description: 'Modul keuangan untuk memvalidasi hak komisi penjualan agen atas jamaah yang telah lunas dan memproses pencairan transfer dana ke rekening bank agen.',
        crudActions: {
            read: [
                'Melihat daftar komisi per transaksi jamaah dengan status: Pending, Siap Dicairkan (*Eligible*), atau Selesai Ditransfer (*Paid*).'
            ],
            update: [
                'Ubah status komisi individual menjadi "Paid" setelah bukti transfer diunggah.'
            ],
            special: [
                'Fitur **Batch Payout**: Cairkan komisi banyak agen sekaligus dengan sekali centang dan satu klik validasi.',
                'Ekspor rekapitulasi pencairan komisi ke format Excel/PDF untuk arsip akuntansi.'
            ]
        },
        steps: [
            'Buka menu Keagenan > Pembagian Komisi.',
            'Pilih baris komisi yang berstatus "Siap Dicairkan".',
            'Klik tombol "Cairkan Massal" atau klik "Cairkan" pada baris komisi.',
            'Simpan status pembayaran ➔ Notifikasi terkirim ke dashboard agen.'
        ],
        actions: async (page: any, ssDir: string) => {
            const batchBtn = page.getByRole('button', { name: /Cairkan Massal/i }).first();
            if (await batchBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
                await batchBtn.click();
                await page.waitForTimeout(1000);
                await page.screenshot({ path: `${ssDir}/07_pencairan_komisi_agen_modal_batch_payout.webp`, fullPage: false, type: 'webp', quality: 85 });
                await page.keyboard.press('Escape');
                await page.waitForTimeout(600);
            }
        }
    },
    {
        id: '08_monitoring_pohon_jaringan',
        title: 'Monitoring Struktur Tim & Pohon Jaringan Agen',
        category: 'Keagenan & MLM Syariah',
        targetRole: 'Owner (Level 1)',
        loginAs: 'superadmin',
        workflowStage: '2. Pengawasan Jaringan Penjualan',
        route: '/monitoring',
        description: 'Visualisasi pohon jaringan (Network Tree) keagenan bertingkat untuk melihat hubungan Upline-Downline, struktur Leader, dan perolehan omzet grup.',
        crudActions: {
            read: [
                'Melihat diagram hierarki dan distribusi anggota tim per tingkat.',
                'Klik "Lihat Nasabah" pada baris anggota tim untuk membuka laci daftar jamaah binaannya secara detail.'
            ]
        },
        steps: [
            'Buka menu Keagenan > Monitoring Tim.',
            'Pantau kontribusi omzet dan total jamaah per anggota.',
            'Klik tombol "Lihat Nasabah" pada anggota tim untuk melihat daftar jamaah yang dibinanya.'
        ],
        actions: async (page: any, ssDir: string) => {
            const lihatBtn = page.getByRole('button', { name: /Lihat Nasabah/i }).first();
            if (await lihatBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
                await lihatBtn.click();
                await page.waitForTimeout(1500);
                await page.screenshot({ path: `${ssDir}/08_monitoring_pohon_jaringan_drawer_nasabah_tim.webp`, fullPage: false, type: 'webp', quality: 85 });
                await page.keyboard.press('Escape');
                await page.waitForTimeout(600);
            }
        }
    },
    {
        id: '09_inventaris_dan_stok_barang',
        title: 'Inventaris Stok Fisik Gudang & Barang Masuk',
        category: 'Gudang & Inventaris',
        targetRole: 'Owner (Level 1)',
        loginAs: 'superadmin',
        workflowStage: '4. Eksekusi & Serah Terima Perlengkapan',
        route: '/inventaris',
        description: 'Pencatatan persediaan fisik perlengkapan travel di gudang (koper, kain ihram, mukena, seragam) beserta riwayat barang masuk dari vendor.',
        crudActions: {
            create: [
                'Klik "Daftarkan Barang Baru" untuk memasukkan item inventaris perlengkapan baru.',
                'Klik "Restock" pada baris barang untuk mencatat penyesuaian stok masuk (Stock IN).'
            ],
            read: [
                'Cek saldo stok fisik terkini dan peringatan stok menipis (*Low Stock Alert*).'
            ],
            update: [
                'Penyesuaian stok (*Stock Opname*) untuk koreksi jumlah barang fisik.'
            ]
        },
        steps: [
            'Buka menu Inventaris > Stok Perlengkapan.',
            'Klik tombol "+ Daftarkan Barang Baru" untuk registrasi barang baru.',
            'Klik tombol "Restock" pada baris barang untuk menambah stok masuk dari vendor.'
        ],
        actions: async (page: any, ssDir: string) => {
            // 1. Click Restock button
            const restockBtn = page.getByRole('button', { name: /Restock/i }).first();
            if (await restockBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
                await restockBtn.click();
                await page.waitForTimeout(1000);
                await page.screenshot({ path: `${ssDir}/09_inventaris_dan_stok_barang_sheet_restock.webp`, fullPage: false, type: 'webp', quality: 85 });
                await page.keyboard.press('Escape');
                await page.waitForTimeout(600);
            }

            // 2. Click Daftarkan Barang Baru
            const addBtn = page.getByRole('button', { name: /Daftarkan Barang Baru/i }).first();
            if (await addBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
                await addBtn.click();
                await page.waitForTimeout(1000);
                await page.screenshot({ path: `${ssDir}/09_inventaris_dan_stok_barang_sheet_tambah_barang.webp`, fullPage: false, type: 'webp', quality: 85 });
                await page.keyboard.press('Escape');
                await page.waitForTimeout(600);
            }
        }
    },
    {
        id: '10_pengaturan_data_master',
        title: 'Pengaturan Master Paket, Rekening & CRM',
        category: 'Master Data',
        targetRole: 'Owner (Level 1)',
        loginAs: 'superadmin',
        workflowStage: '1. Setup & Konfigurasi Awal',
        route: '/settings/master',
        description: 'Konfigurasi sentral paket umroh & haji, nominal komisi default, fasilitas hotel, rekening bank resmi penerima dana, dan sumber prospek leads.',
        crudActions: {
            create: [
                'Tambah Paket Umroh baru (Harga, Komisi Agen, Kuota, Fasilitas).',
                'Tambah Rekening Bank Resmi Travel (BCA, BSI, Mandiri, dll).',
                'Tambah Sumber Prospek (Instagram Ads, Brosur, Pengajian, Walk-In).'
            ],
            read: [
                'Melihat seluruh katalog paket, rekening aktif, dan tahapan pipeline CRM.'
            ],
            update: [
                'Ubah harga paket, edit fasilitas hotel, atau update nama tahapan CRM.'
            ],
            delete: [
                'Hapus paket atau rekening yang sudah tidak digunakan.'
            ]
        },
        steps: [
            'Buka menu Pengaturan > Data Master.',
            'Tab "Paket Umroh & Haji": Klik "+ Tambah Paket" untuk menambah produk baru.',
            'Tab "Rekening Bank": Klik "+ Tambah Rekening" untuk mendaftarkan rekening tujuan transfer.'
        ],
        actions: async (page: any, ssDir: string) => {
            // Click Tab Paket Umroh & Haji
            const pkgTab = page.getByRole('tab', { name: /Paket Umroh/i }).first();
            if (await pkgTab.isVisible({ timeout: 3000 }).catch(() => false)) {
                await pkgTab.click();
                await page.waitForTimeout(800);
                const addPkgBtn = page.getByRole('button', { name: /Tambah Paket/i }).first();
                if (await addPkgBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
                    await addPkgBtn.click();
                    await page.waitForTimeout(1000);
                    await page.screenshot({ path: `${ssDir}/10_pengaturan_data_master_sheet_tambah_paket.webp`, fullPage: false, type: 'webp', quality: 85 });
                    await page.keyboard.press('Escape');
                    await page.waitForTimeout(600);
                }
            }
        }
    },
    {
        id: '11_pengaturan_pengguna_dan_level',
        title: 'Manajemen Staf Internal & Hierarki Pengguna',
        category: 'Pengaturan Akun',
        targetRole: 'Owner (Level 1)',
        loginAs: 'superadmin',
        workflowStage: '1. Setup & Konfigurasi Awal',
        route: '/settings/users',
        description: 'Pengelolaan akun login staf kantor internal (Admin, Keuangan, Kasir) dan pengaturan pohon hierarki atasan-bawahan.',
        crudActions: {
            create: [
                'Klik "+ Tambah Level" untuk menambah tingkatan hierarki baru.',
                'Buka laci detail level dan klik "+ Tambah User" untuk menambah akun staf baru.'
            ],
            read: [
                'Melihat bagan visual rantai komando jabatan per tenant.',
                'Klik pil tingkatan jabatan untuk membuka laci pengguna di level tersebut.'
            ],
            update: [
                'Pindahkan atasan (*Reassign*) staf untuk merestrukturisasi hierarki.'
            ],
            delete: [
                'Hapus atau nonaktifkan akses akun staf yang sudah tidak bekerja.'
            ]
        },
        steps: [
            'Buka menu Pengaturan > Hirarki Pengguna & Level.',
            'Klik pil level jabatan untuk membuka laci anggota di level tersebut.',
            'Gunakan tombol "+ Tambah User" untuk memberikan hak akses staf baru.'
        ],
        actions: async (page: any, ssDir: string) => {
            // Click first level node button or pill on the visual hierarchy tree
            const levelPill = page.locator('button[type="button"]:has(span.rounded-full)').first();
            if (await levelPill.isVisible({ timeout: 3000 }).catch(() => false)) {
                await levelPill.click();
                await page.waitForTimeout(1200);
                await page.screenshot({ path: `${ssDir}/11_pengaturan_pengguna_dan_level_drawer_level_users.webp`, fullPage: false, type: 'webp', quality: 85 });
                await page.keyboard.press('Escape');
                await page.waitForTimeout(600);
            }
        }
    },
    {
        id: '12_pengaturan_profil_owner',
        title: 'Profil Akun, Tema & Keamanan Owner',
        category: 'Profil & Keamanan',
        targetRole: 'Owner (Level 1)',
        loginAs: 'superadmin',
        workflowStage: '1. Setup & Konfigurasi Akun',
        route: '/profile',
        description: 'Pengaturan profil personal direksi/owner travel, pembaruan kata sandi akun demi keamanan data, dan pengaturan preferensi tema tampilan antarmuka (Luxury, Emerald, Light, Dark).',
        crudActions: {
            read: [
                'Melihat identitas profil login, email resmi, dan status tingkat akun Superadmin/Owner.'
            ],
            update: [
                'Perbarui Nama Lengkap dan Alamat Email resmi.',
                'Ganti Kata Sandi / Password login akun Owner.',
                'Pilih Tema Warna Aplikasi (Coffee Luxury, Emerald Syariah, Classic Light, Modern Dark).'
            ],
            special: [
                'Pergantian tema langsung diterapkan secara instan (*realtime live theme switch*).'
            ]
        },
        steps: [
            'Klik avatar/nama pengguna di pojok kanan atas ➔ Pilih "Profile".',
            'Pada bagian Informasi Profil, perbarui data nama atau email bila diperlukan.',
            'Pada bagian Perbarui Kata Sandi, masukkan password lama dan password baru secara berkala demi keamanan.',
            'Klik "Simpan" untuk mengonfirmasi perubahan.'
        ]
    },
    {
        id: '13_manajemen_multi_tenant_platform',
        title: 'Manajemen Multi-Tenant & Entitas Travel Agensi',
        category: 'Platform Superadmin',
        targetRole: 'Superadmin Master',
        loginAs: 'superadmin_master',
        workflowStage: '1. Setup & Multi-Tenant Ekosistem',
        route: '/tenants',
        description: 'Pusat kendali multi-tenant platform untuk melihat seluruh travel agensi terdaftar, isolasi database, statistik omzet per travel, dan onboarding tenant baru.',
        crudActions: {
            create: [
                'Klik "Onboard Tenant Baru" untuk mendaftarkan agensi travel umroh baru ke dalam sistem.'
            ],
            read: [
                'Melihat 4 Kartu Metrik Platform: Total Travel Agensi, Staff & Mitra Agen, Total Jamaah, dan Omzet Platform.',
                'Melihat daftar kartu agensi travel, domain/subdomain, tema aktif, dan Super Owner agensi.'
            ],
            update: [
                'Edit nama travel, domain subdomain, tema bawaan, dan kontak travel.'
            ],
            special: [
                'Fitur "Masuk ke Travel": Beralih konteks kerja langsung ke ruang kerja agensi travel yang dipilih.'
            ]
        },
        steps: [
            'Masuk ke menu Platform Master > Tenants Management.',
            'Pantau seluruh travel agensi yang berjalan di atas sistem HajjFlow.',
            'Klik tombol "Onboard Tenant Baru" jika ingin mendaftarkan brand travel baru.',
            'Klik "Masuk ke Travel" untuk beralih sesi ke agensi yang dituju.'
        ],
        actions: async (page: any, ssDir: string) => {
            const onboardBtn = page.getByRole('button', { name: /Onboard Tenant Baru/i }).first();
            if (await onboardBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
                await onboardBtn.click();
                await page.waitForTimeout(1000);
                await page.screenshot({ path: `${ssDir}/13_manajemen_multi_tenant_platform_sheet_onboard.webp`, fullPage: false, type: 'webp', quality: 85 });
                await page.keyboard.press('Escape');
                await page.waitForTimeout(600);
            }
        }
    },
    {
        id: '14_pengaturan_aplikasi_dan_tema',
        title: 'Pengaturan Sistem, Notifikasi & Kustomisasi Tema',
        category: 'Pengaturan Sistem',
        targetRole: 'Owner (Level 1)',
        loginAs: 'superadmin',
        workflowStage: '1. Setup & Konfigurasi Awal',
        route: '/settings/app',
        description: 'Pusat preferensi sistem travel: pemilihan palet tema warna (Luxury, Emerald, Royal, Obsidian), konfigurasi notifikasi alert email/suara, dan format regional mata uang.',
        crudActions: {
            read: [
                'Melihat preview palet tema warna antarmuka travel.',
                'Melihat status preferensi alert pendaftaran jamaah, pembayaran, dan stok menipis.'
            ],
            update: [
                'Pilih tema visual yang diinginkan dengan sekali klik.',
                'Aktifkan atau matikan toggle notifikasi email dan audio alert.'
            ]
        },
        steps: [
            'Buka menu Pengaturan Travel > Pengaturan Aplikasi.',
            'Tab "Tampilan & Tema": Pilih palet tema yang sesuai dengan branding travel Anda.',
            'Tab "Notifikasi & Alert": Atur pemberitahuan instan saat ada pembayaran baru atau stok kritis.'
        ],
        actions: async (page: any, ssDir: string) => {
            const notifTab = page.getByRole('tab', { name: /Notifikasi & Alert/i }).first();
            if (await notifTab.isVisible({ timeout: 3000 }).catch(() => false)) {
                await notifTab.click();
                await page.waitForTimeout(800);
                await page.screenshot({ path: `${ssDir}/14_pengaturan_aplikasi_dan_tema_tab_notifikasi.webp`, fullPage: false, type: 'webp', quality: 85 });
            }
        }
    },
    {
        id: '15_pusat_notifikasi_dan_broadcast',
        title: 'Pusat Notifikasi & Kirim Pengumuman Siaran (Broadcast)',
        category: 'Komunikasi & Notifikasi',
        targetRole: 'Owner (Level 1)',
        loginAs: 'superadmin',
        workflowStage: '1. Komunikasi & Pengumuman Internal',
        route: '/dashboard',
        description: 'Laci pusat notifikasi real-time dan fitur Broadcast Announcement untuk mengirimkan pesan siaran penting ke seluruh staf kantor dan mitra agen.',
        crudActions: {
            create: [
                'Klik tombol "Kirim Pengumuman Siaran" untuk membuka form Broadcast Announcement.',
                'Pilih target penerima (Semua Staf & Agen, Hanya Staf, atau Hanya Mitra Agen), kategori (Info, Urgent, Promo, System), isi pesan, dan kirim.'
            ],
            read: [
                'Melihat daftar pemberitahuan masuk real-time dengan filter Belum Dibaca atau Semua.'
            ],
            update: [
                'Tandai semua notifikasi telah dibaca (*Mark All as Read*).'
            ],
            delete: [
                'Hapus notifikasi individual dari laci.'
            ]
        },
        steps: [
            'Klik ikon Lonceng Notifikasi di pojok kanan atas layar.',
            'Periksa daftar notifikasi transaksi dan leads terbaru.',
            'Klik tombol "Kirim Pengumuman Siaran" untuk mengirim pesan blast pengumuman ke agen.',
            'Pilih kategori pesan dan klik Kirim Siaran.'
        ],
        actions: async (page: any, ssDir: string) => {
            const bellBtn = page.locator('button[title*="Notifikasi"], button:has(svg.lucide-bell)').first();
            if (await bellBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
                await bellBtn.click();
                await page.waitForTimeout(1000);
                await page.screenshot({ path: `${ssDir}/15_pusat_notifikasi_dan_broadcast_drawer_notifikasi.webp`, fullPage: false, type: 'webp', quality: 85 });

                const blastBtn = page.getByRole('button', { name: /Kirim Pengumuman Siaran/i }).first();
                if (await blastBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
                    await blastBtn.click();
                    await page.waitForTimeout(1000);
                    await page.screenshot({ path: `${ssDir}/15_pusat_notifikasi_dan_broadcast_sheet_broadcast.webp`, fullPage: false, type: 'webp', quality: 85 });
                    await page.keyboard.press('Escape');
                    await page.waitForTimeout(600);
                }

                await page.keyboard.press('Escape');
                await page.waitForTimeout(600);
            }
        }
    }
];;
