import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

interface StepGuide {
    id: string;
    category: string;
    title: string;
    targetRole: 'Owner (Level 1)' | 'Agen Mitra (Level 2/3)';
    loginAs: 'superadmin' | 'agent';
    workflowStage: string;
    route: string;
    description: string;
    crudActions: {
        create?: string[];
        read?: string[];
        update?: string[];
        delete?: string[];
        special?: string[];
    };
    actions?: (page: any, screenshotsDir: string) => Promise<void>;
    steps: string[];
    tips?: string[];
}

const BASE_URL = process.env.GUIDE_BASE_URL || 'http://localhost:8000';
const ROOT_DOCS_DIR = path.resolve(process.cwd(), 'docs/manual-guide');

const USERS = {
    superadmin: {
        email: 'superadmin@hajjflow.com',
        password: 'password',
        label: 'Owner / Superadmin (Level 1)'
    },
    agent: {
        email: 'agent2.t2@travel.com',
        password: 'password',
        label: 'Mitra Agen (Level 2/3)'
    }
};

const OWNER_MODULES: StepGuide[] = [
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
        category: 'CRM & Pipeline',
        targetRole: 'Owner (Level 1)',
        loginAs: 'superadmin',
        workflowStage: '2. Pengawasan Pipa Penjualan',
        route: '/crm',
        description: 'Papan visual Kanban untuk memantau pergerakan seluruh prospek jamaah dari tahap pendaftaran awal, verifikasi DP, kelengkapan paspor/visa, pelunasan, hingga siap berangkat.',
        crudActions: {
            read: [
                'Melihat kartu seluruh jamaah dari semua agen di masing-masing kolom tahapan.',
                'Filter jamaah berdasarkan Paket Keberangkatan atau Agen Perujuk.'
            ],
            update: [
                'Drag-and-drop kartu jamaah antar-kolom tahapan secara realtime.',
                'Klik kartu jamaah untuk membuka Laci Detail (Drawer) dan memperbarui data berkas.'
            ],
            special: [
                'Sinkronisasi instan antar-perangkat saat status tahapan jamaah digeser.'
            ]
        },
        steps: [
            'Masuk ke menu CRM > Pipeline Kanban.',
            'Gunakan filter di bagian atas untuk menyaring jamaah per paket atau per agen.',
            'Geser kartu jamaah ke kanan setelah jamaah menyelesaikan persyaratan tahapan (misal: DP Terbayar ➔ Berkas Paspor Lengkap).'
        ]
    },
    {
        id: '03_data_jamaah_dan_kasir',
        title: 'Master Data Jamaah, Kasir & Kuitansi Pembayaran',
        category: 'CRM & Kasir',
        targetRole: 'Owner (Level 1)',
        loginAs: 'superadmin',
        workflowStage: '3. Transaksi & Validasi Pembayaran',
        route: '/crm/customers',
        description: 'Master data seluruh jamaah terdaftar dengan fungsi Kasir untuk memverifikasi pembayaran transfer bank, mencatat cicilan/pelunasan, dan menerbitkan invoice resmi.',
        crudActions: {
            create: [
                'Klik tombol "+ Tambah Jamaah" untuk menginput pendaftaran calon jamaah baru secara manual oleh staf kantor.'
            ],
            read: [
                'Pencarian data jamaah berdasarkan Nama, Nomor Telepon/WhatsApp, NIK, atau Nomor Paspor.',
                'Melihat riwayat log pembayaran dan sisa tagihan per jamaah.'
            ],
            update: [
                'Klik tombol "Edit Data" untuk mengubah data pribadi, nomor paspor, kamar hotel, atau paket yang dipilih.',
                'Klik tombol "Kasir / Pembayaran" untuk menginput penerimaan dana DP atau Pelunasan.'
            ],
            delete: [
                'Hapus data pendaftaran jamaah yang dibatalkan melalui opsi tindakan di baris tabel.'
            ],
            special: [
                'Cetak Kuitansi Pembayaran & Invoice Digital Resmi bertanda tangan travel.'
            ]
        },
        steps: [
            'Masuk ke menu CRM > Data Jamaah.',
            'Cari nama jamaah yang melakukan transfer pembayaran.',
            'Klik tombol "Detail / Kasir" ➔ Input nominal uang yang masuk dan pilih rekening bank tujuan.',
            'Klik "Simpan Pembayaran" ➔ Sistem otomatis memutakhirkan status menjadi Lunas atau Sisa Piutang.'
        ]
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
                'Melihat daftar jamaah per jadwal keberangkatan beserta status kelengkapan perlengkapannya.'
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
            'Pilih paket keberangkatan yang sedang dipersiapkan.',
            'Centang item yang diserahkan ke jamaah (misal: Koper, Batik, Kain Ihram).',
            'Klik Simpan untuk memperbarui rekaman logistik.'
        ]
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
                'Klik "Tambah Jadwal" untuk membuka kloter keberangkatan musim baru dengan tanggal, maskapai, dan kuota tertentu.'
            ],
            read: [
                'Melihat persentase keterisian kursi (Seat Occupancy) per tanggal keberangkatan.'
            ],
            update: [
                'Ubah tanggal terbang, ganti maskapai penerbangan, atau tambah batas kuota kursi.'
            ],
            delete: [
                'Hapus jadwal keberangkatan yang belum memiliki jamaah terdaftar.'
            ]
        },
        steps: [
            'Buka menu Operasional > Jadwal Keberangkatan.',
            'Klik "+ Tambah Jadwal" ➔ Masukkan Nama Keberangkatan, Tanggal Keberangkatan, Maskapai, dan Kuota Maksimal.',
            'Simpan data jadwal.'
        ]
    },
    {
        id: '06_manajemen_mitra_agen',
        title: 'Manajemen Mitra Agen & Persetujuan Akun',
        category: 'Keagenan & Kemitraan',
        targetRole: 'Owner (Level 1)',
        loginAs: 'superadmin',
        workflowStage: '5. Tata Kelola Mitra Penjualan',
        route: '/agents',
        description: 'Pusat pengelolaan mitra agen travel, pembuatan akun agen baru, verifikasi persetujuan kemitraan, dan pengaturan kode referral.',
        crudActions: {
            create: [
                'Klik "+ Tambah Agen" untuk mendaftarkan mitra agen / konsultan baru langsung dari kantor pusat.'
            ],
            read: [
                'Melihat daftar seluruh agen, total perolehan jamaah binaan, dan nomor kontak WhatsApp aktif.'
            ],
            update: [
                'Edit data profil agen, ganti nomor telepon, atau ubah status persetujuan akun (Active/Suspended).'
            ],
            delete: [
                'Hapus akun kemitraan agen yang sudah tidak aktif.'
            ]
        },
        steps: [
            'Buka menu Keagenan > Daftar Mitra Agen.',
            'Verifikasi data agen yang baru bergabung dan pastikan statusnya Aktif.',
            'Salin Kode Referral unik agen untuk konfirmasi.'
        ]
    },
    {
        id: '07_pencairan_komisi_agen',
        title: 'Rekapitulasi & Pencairan Komisi Mitra Agen',
        category: 'Keuangan & Komisi',
        targetRole: 'Owner (Level 1)',
        loginAs: 'superadmin',
        workflowStage: '6. Payout & Pembagian Hasil',
        route: '/commissions',
        description: 'Modul rekapitulasi dan pembayaran komisi mitra agen yang jamaahnya telah menyelesaikan pelunasan pembayaran paket.',
        crudActions: {
            read: [
                'Melihat daftar komisi pending (belum lunas) dan komisi yang siap dicairkan.',
                'Audit perolehan komisi langsung per jamaah dan komisi override leader.'
            ],
            update: [
                'Klik "Cairkan Komisi" setelah mentransfer hak komisi ke rekening bank agen.'
            ],
            special: [
                'Unggah bukti transfer perbankan sebagai rekaman audit keuangan resmi.'
            ]
        },
        steps: [
            'Buka menu Keagenan > Komisi Agen.',
            'Filter daftar komisi dengan status "Siap Cair".',
            'Lakukan transfer ke rekening agen ➔ Klik tombol "Cairkan Komisi" dan lampirkan referensi transfer.'
        ]
    },
    {
        id: '08_monitoring_pohon_jaringan',
        title: 'Monitoring Struktur Tim & Pohon Jaringan Agen',
        category: 'Keagenan & Hierarki',
        targetRole: 'Owner (Level 1)',
        loginAs: 'superadmin',
        workflowStage: '5. Tata Kelola Mitra Penjualan',
        route: '/monitoring',
        description: 'Visualisasi pohon jaringan hierarki multi-tier (Master Agen / Leader Level 1 ➔ Sub-Agen Level 2 ➔ Konsultan Level 3) beserta kontribusi omzet grup.',
        crudActions: {
            read: [
                'Navigasi pohon struktur jaringan tim agen.',
                'Melihat total omzet grup dan jumlah jamaah per cabang tim.'
            ]
        },
        steps: [
            'Buka menu Keagenan > Monitoring Tim.',
            'Klik pada nama Leader untuk membuka bagan rantai downline di bawahnya.'
        ]
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
                'Klik "Tambah Barang Masuk" saat menerima pengiriman stok baru dari vendor konveksi/pabrik.'
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
            'Periksa jumlah stok pada tabel inventaris.',
            'Klik tombol "Tambah Barang Masuk" untuk menambah kuantiti stok yang baru diterima.'
        ]
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
            'Tab "Paket Umroh": Atur paket-paket yang akan dijual agen beserta besaran komisi mitra.',
            'Tab "Rekening Bank": Masukkan nomor rekening resmi travel yang akan muncul di formulir pembayaran jamaah.'
        ]
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
                'Klik "+ Tambah Pengguna" untuk memberikan hak akses login ke staf baru.'
            ],
            read: [
                'Melihat daftar pengguna internal beserta peran hak aksesnya (*Role*).'
            ],
            update: [
                'Gunakan tombol "Reassign / Pindahkan Atasan" untuk merestrukturisasi rantai hierarki.'
            ],
            delete: [
                'Hapus atau nonaktifkan akses akun staf yang sudah tidak bekerja.'
            ]
        },
        steps: [
            'Buka menu Pengaturan > Hirarki Pengguna & Level.',
            'Klik "+ Tambah Pengguna" ➔ Masukkan Nama, Email, Password, dan Peran staf kantor.',
            'Simpan akun pengguna.'
        ]
    }
];

const AGENT_MODULES: StepGuide[] = [
    {
        id: '01_setup_bio_link_landing_page',
        title: 'Setup Profil Bio Link & Landing Page Agen',
        category: 'Promosi & Digital Marketing',
        targetRole: 'Agen Mitra (Level 2/3)',
        loginAs: 'agent',
        workflowStage: '1. Setup Profil & Branding Mandiri',
        route: '/profile',
        description: 'Pusat kustomisasi website mini Bio Link personal agen (Linktree Islami) yang berfungsi sebagai etalase promosi online dan media penangkap leads jamaah.',
        crudActions: {
            read: [
                'Melihat tampilan preview real-time landing page pada bingkai smartphone mockup di sebelah kanan layar.'
            ],
            update: [
                'Edit Nama Konsultan, Kota Domisili, dan Kalimat Komitmen Amanah.',
                'Atur tombol tindakan cepat: WhatsApp Konsultasi Pribadi, WhatsApp CS Travel Pusat, atau Formulir Pendaftaran.',
                'Tautkan akun sosial media (Instagram, TikTok, YouTube, Facebook).'
            ],
            special: [
                'Salin Tautan Bio Link Personal (contoh: `http://travel.com/agen/AG-504A79`) untuk disebarkan ke media sosial.'
            ]
        },
        steps: [
            'Login ke sistem menggunakan akun Mitra Agen (`agent2.t2@travel.com`).',
            'Buka menu Profil Akun > Pengaturan Bio Link Agen.',
            'Lengkapi Foto Profil diri, Kota Domisili, dan Bio Singkat.',
            'Periksa hasil tampilan pada Live Mobile Preview di sisi kanan.',
            'Klik tombol "Simpan Perubahan" dan salin link landing page personal Anda.'
        ],
        tips: [
            'Pasang tautan Bio Link Anda pada Profil Instagram dan status WhatsApp untuk menjaring calon jamaah secara otomatis.'
        ]
    },
    {
        id: '02_input_dan_pendaftaran_jamaah',
        title: 'Pendaftaran & Input Data Jamaah Binaan',
        category: 'Penjualan & Pendaftaran',
        targetRole: 'Agen Mitra (Level 2/3)',
        loginAs: 'agent',
        workflowStage: '2. Pendaftaran & Akuisisi Calon Jamaah',
        route: '/crm/customers',
        description: 'Modul bagi agen untuk mendaftarkan calon jamaah binaannya secara langsung ke dalam sistem travel menggunakan kode referral otomatis.',
        crudActions: {
            create: [
                'Klik "+ Tambah Jamaah" untuk menginput data calon jamaah binaan (Nama, No WA, Alamat, Pilihan Paket).'
            ],
            read: [
                'Melihat daftar seluruh jamaah yang terdaftar di bawah referral agen Anda.'
            ],
            update: [
                'Perbarui berkas dokumen jamaah (unggah foto Paspor, KTP, Kartu Keluarga, dan Buku Nikah).'
            ]
        },
        steps: [
            'Buka menu CRM > Data Jamaah.',
            'Klik tombol "+ Tambah Jamaah".',
            'Isi formulir calon jamaah secara lengkap dan pilih paket keberangkatan yang diminati.',
            'Simpan data pendaftaran ➔ Jamaah otomatis tercatat di bawah akun agen Anda.'
        ]
    },
    {
        id: '03_monitoring_crm_pipeline_binaan',
        title: 'Monitoring Pipeline Kanban Jamaah Binaan',
        category: 'CRM & Follow Up',
        targetRole: 'Agen Mitra (Level 2/3)',
        loginAs: 'agent',
        workflowStage: '3. Pengawalan Prospek Hingga Lunas',
        route: '/crm',
        description: 'Papan Kanban visual khusus bagi agen untuk mengawal jamaah binaan melewati setiap tahapan: Booking ➔ DP Terbayar ➔ Berkas Lengkap ➔ Pelunasan ➔ Siap Berangkat.',
        crudActions: {
            read: [
                'Memantau status tahapan terkini dari seluruh jamaah binaan agen.'
            ],
            update: [
                'Buka laci detail jamaah untuk mengecek status validasi dokumen paspor dan visa oleh pihak travel.'
            ]
        },
        steps: [
            'Buka menu CRM > Pipeline Kanban.',
            'Lihat kartu-kartu jamaah binaan Anda di setiap kolom.',
            'Lakukan follow-up pada jamaah yang masih berada di tahap "Booking" agar segera melakukan pembayaran DP.'
        ]
    },
    {
        id: '04_rekap_komisi_dan_pencairan_agen',
        title: 'Rekap Komisi Penjualan & Saldo Agen',
        category: 'Keuangan & Reward',
        targetRole: 'Agen Mitra (Level 2/3)',
        loginAs: 'agent',
        workflowStage: '4. Hasil Penjualan & Payout',
        route: '/commissions',
        description: 'Pusat transparansi saldo komisi agen, riwayat komisi per jamaah yang telah lunas, dan status pencairan dana oleh kantor pusat.',
        crudActions: {
            read: [
                'Melihat Akumulasi Total Komisi yang sudah dicairkan.',
                'Melihat Komisi Siap Cair (jamaah telah lunas dan siap ditransfer kantor pusat).',
                'Melihat Komisi Pending (jamaah masih dalam proses cicilan/DP).',
                'Melihat rincian komisi override jika agen memiliki sub-agen binaan (Level Leader).'
            ]
        },
        steps: [
            'Buka menu Keagenan > Komisi Saya.',
            'Periksa status komisi jamaah yang baru saja menyelesaikan pelunasan.',
            'Pantau status transfer pencairan dari pihak manajemen travel.'
        ]
    }
];

async function ensureLoggedIn(page: any, context: any, role: 'superadmin' | 'agent', currentRole: { value: string | null }) {
    if (currentRole.value === role) {
        return;
    }

    console.log(`🔑 Berpindah sesi login sebagai: ${USERS[role].label} (${USERS[role].email})...`);
    await context.clearCookies();
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
    
    const emailInput = page.locator('input[type="email"], input[name="email"]');
    const passwordInput = page.locator('input[type="password"], input[name="password"]');
    
    if (await emailInput.isVisible()) {
        await emailInput.fill(USERS[role].email);
        await passwordInput.fill(USERS[role].password);
        await page.locator('button[type="submit"]').click();
        await page.waitForNavigation({ waitUntil: 'networkidle' }).catch(() => {});
        await page.waitForTimeout(1500);
        currentRole.value = role;
        console.log(`✅ Berhasil masuk sebagai ${USERS[role].label}.`);
    }
}

async function generateRoleSection(page: any, context: any, roleKey: 'owner' | 'agent', modules: StepGuide[], currentRole: { value: string | null }) {
    const roleTitle = roleKey === 'owner' ? 'Owner Travel (Level 1)' : 'Mitra Agen (Level 2/3)';
    const targetDir = path.join(ROOT_DOCS_DIR, roleKey);
    const ssDir = path.join(targetDir, 'screenshots');
    fs.mkdirSync(ssDir, { recursive: true });

    console.log(`\n======================================================`);
    console.log(`📘 MENYUSUN PANDUAN: ${roleTitle.toUpperCase()}`);
    console.log(`📁 Folder: ${targetDir}`);
    console.log(`======================================================\n`);

    let readmeContent = `# 📖 BUKU PANDUAN PENGGUNA: ${roleTitle.toUpperCase()}\n\n`;
    readmeContent += `**Sistem Manajemen Operasional & CRM Travel Umroh Multi-Tenant**\n\n`;
    readmeContent += `Panduan ini memuat seluruh panduan langkah demi langkah, operasi CRUD lengkap, dan tata kelola sistem khusus untuk peran **${roleTitle}**.\n\n`;
    readmeContent += `---\n\n## 🗺️ Alur Perjalanan Kerja (End-to-End Workflow)\n\n`;

    if (roleKey === 'owner') {
        readmeContent += `### Roadmap Kerja Owner Travel (Level 1):\n`;
        readmeContent += `1. **Setup & Master Data**: Menyiapkan profil travel, tema landing page, rekening bank resmi, dan katalog paket umroh.\n`;
        readmeContent += `2. **Manajemen Mitra Agen**: Menerima pendaftaran agen baru, menyetujui akun, dan menentukan struktur komisi.\n`;
        readmeContent += `3. **Pengawasan Pipa Prospek (CRM)**: Memonitor seluruh prospek jamaah di papan Kanban global dan memverifikasi berkas paspor/visa.\n`;
        readmeContent += `4. **Kasir & Pelunasan**: Memvalidasi bukti transfer bank DP/Pelunasan jamaah dan menerbitkan kuitansi/invoice resmi.\n`;
        readmeContent += `5. **Operasional & Logistik**: Menyiapkan koper/perlengkapan di gudang, mencatat serah terima, dan mengunci manifest seat penerbangan.\n`;
        readmeContent += `6. **Pencairan Komisi**: Mentransfer hak bagi hasil komisi kepada mitra agen yang jamaahnya sudah lunas.\n\n`;
    } else {
        readmeContent += `### Roadmap Kerja Mitra Agen (Level 2/3):\n`;
        readmeContent += `1. **Setup Bio Link Mandiri**: Melengkapi foto profil, bio komitmen pelayanan, dan tombol WhatsApp di \`/profile\`.\n`;
        readmeContent += `2. **Promosi & Akuisisi Leads**: Menyebarkan tautan Bio Link personal (\`/agen/AG-XXX\`) ke media sosial untuk menjaring calon jamaah secara otomatis.\n`;
        readmeContent += `3. **Pendaftaran Jamaah**: Mendaftarkan calon jamaah langsung ke sistem atau menerima leads via referral code agen.\n`;
        readmeContent += `4. **Pengawalan CRM**: Mengawal kelengkapan berkas jamaah binaan (Paspor, KTP, Buku Nikah, Vaksin) di papan Kanban.\n`;
        readmeContent += `5. **Pembayaran & Closing**: Mengarahkan jamaah melakukan transfer ke rekening resmi travel dan mengunggah bukti bayar.\n`;
        readmeContent += `6. **Pencairan Komisi**: Memonitor akumulasi saldo komisi langsung dan komisi override sub-agen hingga dicairkan oleh kantor pusat.\n\n`;
    }

    readmeContent += `---\n\n## 📑 Daftar Modul & Panduan Lengkap\n\n`;

    for (let i = 0; i < modules.length; i++) {
        const mod = modules[i];
        const orderNum = String(i + 1).padStart(2, '0');
        console.log(`📸 [${orderNum}/${modules.length}] [${roleKey.toUpperCase()}] Mengambil data: ${mod.title}...`);

        await ensureLoggedIn(page, context, mod.loginAs, currentRole);

        await page.goto(`${BASE_URL}${mod.route}`, { waitUntil: 'networkidle' });
        await page.waitForTimeout(1200);

        const screenshotName = `${mod.id}.png`;
        const screenshotPath = path.join(ssDir, screenshotName);
        await page.screenshot({ path: screenshotPath, fullPage: false });

        if (mod.actions) {
            try {
                await mod.actions(page, ssDir);
            } catch (err: any) {
                console.log(`   ⚠️ Info aksi modul: ${err.message}`);
            }
        }

        const fileBasename = `${orderNum}_${mod.id.toUpperCase()}.md`;
        const filePath = path.join(targetDir, fileBasename);

        let docContent = `# ${mod.title}\n\n`;
        docContent += `> **Target Peran**: \`${mod.targetRole}\` | **Login Akun**: \`${USERS[mod.loginAs].email}\`\n`;
        docContent += `> **Tahapan Alur**: \`${mod.workflowStage}\` | **Kategori**: \`${mod.category}\` | **Rute**: \`${mod.route}\`\n\n`;
        docContent += `## 📋 Deskripsi Fitur\n${mod.description}\n\n`;
        docContent += `## 🖼️ Tampilan Antarmuka\n\n`;
        docContent += `![Tampilan ${mod.title}](screenshots/${screenshotName})\n\n`;

        docContent += `## ⚡ Aksi & Fitur Lengkap (CRUD Matrix)\n\n`;
        if (mod.crudActions.create && mod.crudActions.create.length > 0) {
            docContent += `### ➕ Create (Tambah / Input Baru)\n`;
            mod.crudActions.create.forEach(item => { docContent += `- ${item}\n`; });
            docContent += `\n`;
        }
        if (mod.crudActions.read && mod.crudActions.read.length > 0) {
            docContent += `### 🔍 Read (Lihat / Pencarian / Filter Data)\n`;
            mod.crudActions.read.forEach(item => { docContent += `- ${item}\n`; });
            docContent += `\n`;
        }
        if (mod.crudActions.update && mod.crudActions.update.length > 0) {
            docContent += `### ✏️ Update (Edit / Pembaruan Status)\n`;
            mod.crudActions.update.forEach(item => { docContent += `- ${item}\n`; });
            docContent += `\n`;
        }
        if (mod.crudActions.delete && mod.crudActions.delete.length > 0) {
            docContent += `### 🗑️ Delete (Hapus Data)\n`;
            mod.crudActions.delete.forEach(item => { docContent += `- ${item}\n`; });
            docContent += `\n`;
        }
        if (mod.crudActions.special && mod.crudActions.special.length > 0) {
            docContent += `### ✨ Fitur Khusus & Otomasi\n`;
            mod.crudActions.special.forEach(item => { docContent += `- ${item}\n`; });
            docContent += `\n`;
        }

        docContent += `## 🛠️ Langkah-Langkah Penggunaan\n\n`;
        mod.steps.forEach((step, idx) => {
            docContent += `${idx + 1}. ${step}\n`;
        });
        docContent += `\n`;

        if (mod.tips && mod.tips.length > 0) {
            docContent += `## 💡 Tips & Catatan Penting\n\n`;
            mod.tips.forEach((tip) => {
                docContent += `- 💡 ${tip}\n`;
            });
            docContent += `\n`;
        }

        docContent += `---\n*Buku Panduan Resmi Sistem Travel Umroh Multi-Tenant.*\n`;

        fs.writeFileSync(filePath, docContent, 'utf-8');

        readmeContent += `### ${orderNum}. [${mod.title}](${fileBasename})\n`;
        readmeContent += `- **Fase**: ${mod.workflowStage}\n`;
        readmeContent += `- **Kategori**: ${mod.category}\n`;
        readmeContent += `- **Deskripsi**: ${mod.description}\n\n`;
    }

    fs.writeFileSync(path.join(targetDir, 'README.md'), readmeContent, 'utf-8');
}

async function run() {
    console.log(`\n🚀 Memulai Otomasi Scraper Manual Guide (Separate Owner & Agent Folders)...`);
    console.log(`📍 Target Server: ${BASE_URL}`);
    console.log(`📁 Root Output: ${ROOT_DOCS_DIR}\n`);

    fs.mkdirSync(ROOT_DOCS_DIR, { recursive: true });

    const browser = await chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const context = await browser.newContext({
        viewport: { width: 1440, height: 900 },
        deviceScaleFactor: 2
    });

    const page = await context.newPage();
    const currentRole: { value: string | null } = { value: null };

    try {
        // 1. Generate Owner Guide
        await generateRoleSection(page, context, 'owner', OWNER_MODULES, currentRole);

        // 2. Generate Agent Guide
        await generateRoleSection(page, context, 'agent', AGENT_MODULES, currentRole);

        // 3. Generate Master Landing README in ROOT_DOCS_DIR
        let rootReadme = `# 📖 PORTAL DOKUMENTASI & PANDUAN PENGGUNA (USER MANUAL GUIDE)\n\n`;
        rootReadme += `**Sistem Informasi & Manajemen Operasional Travel Umroh Multi-Tenant**\n\n`;
        rootReadme += `Selamat datang di portal dokumentasi resmi. Dokumentasi telah dipisahkan ke dalam 2 panduan khusus berdasarkan peran dan wewenang pengguna:\n\n`;
        rootReadme += `### 🏢 [1. Buku Panduan Khusus Owner Travel (Level 1)](owner/README.md)\n`;
        rootReadme += `> Panduan komprehensif untuk Direktur / Owner Travel, Staf Operasional, Keuangan, dan Kasir. Mencakup setup master paket umroh, rekening bank, verifikasi kasir, pembagian komisi, logistik gudang, dan hierarki keagenan.\n\n`;
        rootReadme += `### 🤝 [2. Buku Panduan Khusus Mitra Agen (Level 2/3)](agent/README.md)\n`;
        rootReadme += `> Panduan praktis untuk Konsultan & Mitra Agen Umroh. Mencakup kustomisasi Bio Link landing page personal di \`/profile\`, penyebaran link referral, input calon jamaah, pengawalan berkas paspor di CRM, dan pemantauan komisi penjualan.\n\n`;
        rootReadme += `---\n\n`;
        rootReadme += `### 🔑 Akun Akses Demo:\n`;
        rootReadme += `- **Owner / Superadmin (Level 1)**: \`${USERS.superadmin.email}\` | Password: \`${USERS.superadmin.password}\`\n`;
        rootReadme += `- **Mitra Agen (Level 2/3)**: \`${USERS.agent.email}\` | Password: \`${USERS.agent.password}\`\n\n`;

        fs.writeFileSync(path.join(ROOT_DOCS_DIR, 'README.md'), rootReadme, 'utf-8');
        console.log(`\n✨ Selesai! Seluruh panduan owner dan agen telah berhasil disusun dengan rapi di: ${ROOT_DOCS_DIR}\n`);

    } catch (error: any) {
        console.error(`❌ Terjadi kesalahan saat scraping panduan:`, error);
    } finally {
        await browser.close();
    }
}

run();
