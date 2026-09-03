import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

interface StepGuide {
    id: string;
    category: string;
    title: string;
    route: string;
    description: string;
    actions?: (page: any, screenshotsDir: string) => Promise<void>;
    steps: string[];
    tips?: string[];
}

const BASE_URL = process.env.GUIDE_BASE_URL || 'http://localhost:8000';
const DOCS_DIR = path.resolve(process.cwd(), 'docs/manual-guide');
const SCREENSHOTS_DIR = path.join(DOCS_DIR, 'screenshots');

const MODULES: StepGuide[] = [
    {
        id: '01_login_dan_dashboard',
        category: 'Umum & Dashboard',
        title: 'Panduan Login & Dashboard Utama',
        route: '/dashboard',
        description: 'Dashboard memberikan visibilitas menyeluruh terhadap kinerja travel, akumulasi omzet, jumlah jamaah, dan grafik tren keberangkatan.',
        steps: [
            'Buka halaman login dan masukkan Email serta Password akun Anda.',
            'Setelah berhasil masuk, Anda akan langsung diarahkan ke Dashboard Utama.',
            'Perhatikan ringkasan KPI di bagian atas: Total Jamaah, Omzet Terkumpul, Sisa Tagihan, dan Jumlah Agen Aktif.',
            'Gunakan filter rentang tanggal untuk menganalisis data dalam periode tertentu.'
        ],
        tips: [
            'Anda dapat mengganti tema warna aplikasi (Dark/Light/Coffee/Luxury) melalui menu profil di pojok kanan atas.'
        ]
    },
    {
        id: '02_crm_pipeline_kanban',
        category: 'CRM & Pipeline',
        title: 'Manajemen Prospek Jamaah (Kanban Board)',
        route: '/crm',
        description: 'Papan Kanban interaktif untuk memonitor perpindahan status jamaah dari tahap Inquiry (Calon) hingga Berangkat dan Pasca-Kepulangan.',
        actions: async (page, ssDir) => {
            // Wait for Kanban columns to render
            await page.waitForTimeout(1500);
            
            // Try clicking first jamaah card if exists to open Drawer
            const firstCard = page.locator('div[data-testid="jamaah-card"], div[role="button"]').first();
            if (await firstCard.isVisible()) {
                await firstCard.click();
                await page.waitForTimeout(800);
                await page.screenshot({ path: path.join(ssDir, '02_crm_drawer_detail.png'), fullPage: false });
                
                // Close drawer
                const closeBtn = page.locator('button:has-text("Tutup"), button[aria-label="Close"]').first();
                if (await closeBtn.isVisible()) {
                    await closeBtn.click();
                    await page.waitForTimeout(400);
                }
            }
        },
        steps: [
            'Masuk ke menu CRM > Pipeline Kanban.',
            'Setiap kolom mewakili tahapan (Tahap 1: Booking, Tahap 2: DP Terbayar, Tahap 3: Berkas Lengkap, Tahap 4: Pelunasan, Tahap 5: Berangkat).',
            'Geser (*drag-and-drop*) kartu jamaah ke kolom sebelah kanan saat jamaah memenuhi syarat tahapan berikutnya.',
            'Klik kartu jamaah untuk membuka Laci Detail (Drawer) yang memuat riwayat pembayaran, dokumen paspor, dan kontak agen perujuk.'
        ],
        tips: [
            'Perubahan tahapan di papan Kanban akan langsung tersinkronisasi ke seluruh tim tanpa perlu refresh halaman.'
        ]
    },
    {
        id: '03_data_jamaah_dan_pembayaran',
        category: 'CRM & Jamaah',
        title: 'Data Jamaah & Riwayat Pembayaran',
        route: '/crm/customers',
        description: 'Tabel master data seluruh jamaah terdaftar dengan kemampuan pencarian cepat, filter status lunas, dan input pembayaran DP/Pelunasan.',
        steps: [
            'Masuk ke menu CRM > Data Jamaah.',
            'Gunakan kolom pencarian di bagian atas untuk mencari jamaah berdasarkan Nama, Nomor HP, atau NIK.',
            'Klik tombol "Detail / Kasir" pada baris jamaah yang dituju untuk menginput bukti transfer DP atau Pelunasan.',
            'Sistem akan otomatis menghitung sisa tagihan dan mencetak bukti pembayaran digital.'
        ],
        tips: [
            'Pastikan rekening tujuan pembayaran sesuai dengan rekening resmi travel yang telah diverifikasi.'
        ]
    },
    {
        id: '04_distribusi_logistik_dan_koper',
        category: 'Logistik & Perlengkapan',
        title: 'Distribusi Logistik & Perlengkapan Jamaah',
        route: '/crm/logistics',
        description: 'Modul pelacakan pembagian perlengkapan umroh (koper, kain ihram, mukena, seragam, dan buku doa) kepada setiap jamaah.',
        steps: [
            'Buka menu CRM > Logistik Jamaah.',
            'Pilih paket keberangkatan untuk menyaring jamaah.',
            'Centang item perlengkapan yang telah diserahkan kepada jamaah (misal: Koper Bagasi, Kain Ihram).',
            'Klik simpan status penyerahan logistik untuk memperbarui data gudang secara *real-time*.'
        ]
    },
    {
        id: '05_jadwal_keberangkatan',
        category: 'Operasional',
        title: 'Jadwal & Kuota Keberangkatan',
        route: '/crm/schedules',
        description: 'Manajemen tanggal keberangkatan, batas kuota kursi penerbangan, hotel Makkah/Madinah, dan status ketersediaan seat.',
        steps: [
            'Buka menu Operasional > Jadwal Keberangkatan.',
            'Lihat daftar jadwal beserta persentase keterisian kursi (*seat occupancy*).',
            'Klik tombol "Tambah Jadwal" untuk membuka keberangkatan musim baru.',
            'Atur batas kuota maksimal agar pendaftaran otomatis tertutup saat kuota penuh.'
        ]
    },
    {
        id: '06_keagenan_dan_bio_link',
        category: 'Keagenan & Kemitraan',
        title: 'Manajemen Mitra Agen & Bio Link Mandiri',
        route: '/agents',
        description: 'Pusat pengelolaan mitra agen travel, pembuatan kode referral unik, dan pembuatan website Bio Link instan untuk masing-masing agen.',
        steps: [
            'Buka menu Keagenan > Daftar Mitra Agen.',
            'Klik "Tambah Agen Baru" untuk mendaftarkan mitra atau konsultan umroh.',
            'Setiap agen memiliki Kode Referral khusus (misal: `AG-88291`).',
            'Klik tombol "Salin Bio Link" untuk menyalin tautan promosi agen (misal: `http://travel.com/agen/AG-88291`) yang dapat disebarkan ke media sosial WhatsApp/Instagram.'
        ],
        tips: [
            'Setiap calon jamaah yang mendaftar via Bio Link agen akan otomatis tercatat di bawah komisi agen yang bersangkutan.'
        ]
    },
    {
        id: '07_pembagian_komisi_agen',
        category: 'Keagenan & Keuangan',
        title: 'Pencatatan & Pencairan Komisi Agen',
        route: '/commissions',
        description: 'Rekapitulasi komisi agen berdasarkan skema flat atau persentase per jamaah yang telah menyelesaikan pembayaran.',
        steps: [
            'Buka menu Keagenan > Komisi Agen.',
            'Lihat status komisi: Pending (menunggu pembayaran jamaah lunas) dan Siap Cair.',
            'Klik tombol "Cairkan Komisi" setelah mentransfer hak komisi ke rekening bank agen.',
            'Unggah atau catat nomor referensi transfer bank sebagai bukti audit keuangan.'
        ]
    },
    {
        id: '08_monitoring_dan_pohon_jaringan',
        category: 'Keagenan & Hierarki',
        title: 'Monitoring Kinerja & Struktur Tim Agen',
        route: '/monitoring',
        description: 'Visualisasi pohon jaringan (hierarki leader, agen silver, agen gold) beserta perolehan omzet per grup tim.',
        steps: [
            'Buka menu Keagenan > Monitoring Tim.',
            'Pilih nama Leader untuk melihat seluruh struktur downline/sub-agen di bawahnya.',
            'Pantau kontribusi jumlah jamaah dan total akumulasi omzet dari masing-masing level keagenan.'
        ]
    },
    {
        id: '09_inventaris_dan_stok_barang',
        category: 'Gudang & Inventaris',
        title: 'Inventaris Stok & Perlengkapan Gudang',
        route: '/inventaris',
        description: 'Pencatatan stok fisik perlengkapan travel, peringatan stok minimum, dan riwayat mutasi barang masuk/keluar.',
        steps: [
            'Buka menu Inventaris > Stok Perlengkapan.',
            'Periksa jumlah stok saat ini pada item Koper, Kain Ihram, Mukena, Batik, dll.',
            'Klik "Tambah Barang Masuk" saat menerima pengiriman barang dari vendor konveksi.',
            'Sistem akan otomatis mengurangi stok ketika item dibagikan ke jamaah di modul Logistik.'
        ]
    },
    {
        id: '10_pengaturan_data_master',
        category: 'Pengaturan',
        title: 'Pengaturan Data Master, Paket Umroh & Rekening Bank',
        route: '/settings/master',
        description: 'Konfigurasi master paket umroh, harga, komisi default, fasilitas hotel, rekening bank resmi, dan sumber leads.',
        steps: [
            'Buka menu Pengaturan > Data Master.',
            'Tab "Paket Umroh": Tambah atau edit paket, atur harga, nominal komisi agen, dan item perlengkapan bawaan paket.',
            'Tab "Rekening Bank": Kelola daftar rekening resmi travel yang tampil di formulir transfer jamaah.',
            'Tab "Tahapan CRM": Kustomisasi nama kolom alur tahapan pipa penjualan.'
        ]
    },
    {
        id: '11_pengaturan_pengguna_dan_level',
        category: 'Pengaturan',
        title: 'Pengaturan Pengguna & Level Jabatan',
        route: '/settings/users',
        description: 'Pengelolaan akun pengguna staff internal (Owner, Admin, Keuangan, Kasir) dan penentuan jenjang level kemitraan agen.',
        steps: [
            'Buka menu Pengaturan > Hirarki Pengguna & Level.',
            'Klik "Tambah Pengguna" untuk memberikan akses login ke staf baru.',
            'Tentukan peran (*Role*) dan atasan langsung (*Upline / Atasan*).',
            'Gunakan tombol "Reassign / Pindahkan Bawahan" jika ada perubahan struktur mutasi staf.'
        ]
    }
];

async function run() {
    console.log(`\n🚀 Memulai Otomasi Scraper Manual Guide...`);
    console.log(`📍 Target Server: ${BASE_URL}`);
    console.log(`📁 Output Direktori: ${DOCS_DIR}\n`);

    // Ensure output directories exist
    fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });

    const browser = await chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const context = await browser.newContext({
        viewport: { width: 1440, height: 900 },
        deviceScaleFactor: 2 // High-DPI screenshots
    });

    const page = await context.newPage();

    try {
        // 1. Auto-Login
        console.log(`🔑 Melakukan autentikasi login otomatis...`);
        await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
        
        // Fill login credentials
        const emailInput = page.locator('input[type="email"], input[name="email"]');
        const passwordInput = page.locator('input[type="password"], input[name="password"]');
        
        if (await emailInput.isVisible()) {
            await emailInput.fill('superadmin@hajjflow.com');
            await passwordInput.fill('password');
            await page.locator('button[type="submit"]').click();
            await page.waitForNavigation({ waitUntil: 'networkidle' }).catch(() => {});
            await page.waitForTimeout(1500);
            console.log(`✅ Berhasil login ke sistem.`);
        }

        // Table of Contents Markdown
        let masterIndexMarkdown = `# 📖 BUKU PANDUAN PENGGUNA (USER MANUAL GUIDE)\n\n`;
        masterIndexMarkdown += `**Sistem Informasi & Manajemen Travel Umroh & Haji Multi-Tenant**\n\n`;
        masterIndexMarkdown += `*Panduan ini disusun secara otomatis dan diperbarui untuk seluruh Staff Operasional, Keuangan, Kasir, dan Mitra Agen Travel.*\n\n`;
        masterIndexMarkdown += `---\n\n## 📑 Daftar Isi Modul Panduan\n\n`;

        // 2. Iterate each module
        for (let i = 0; i < MODULES.length; i++) {
            const mod = MODULES[i];
            const orderNum = String(i + 1).padStart(2, '0');
            console.log(`📸 [${orderNum}/${MODULES.length}] Menangkap layar & mengekstrak panduan: ${mod.title}...`);

            // Navigate to page
            await page.goto(`${BASE_URL}${mod.route}`, { waitUntil: 'networkidle' });
            await page.waitForTimeout(1200);

            // Capture main screenshot
            const screenshotName = `${mod.id}.png`;
            const screenshotPath = path.join(SCREENSHOTS_DIR, screenshotName);
            await page.screenshot({ path: screenshotPath, fullPage: false });

            // Run custom actions if defined (like opening drawers / tabs)
            if (mod.actions) {
                try {
                    await mod.actions(page, SCREENSHOTS_DIR);
                } catch (err: any) {
                    console.log(`   ⚠️ Info aksi modul: ${err.message}`);
                }
            }

            // Generate individual Markdown file
            const fileBasename = `${orderNum}_${mod.id.toUpperCase()}.md`;
            const filePath = path.join(DOCS_DIR, fileBasename);

            let docContent = `# ${mod.title}\n\n`;
            docContent += `> **Kategori**: \`${mod.category}\` | **Rute Halaman**: \`${mod.route}\`\n\n`;
            docContent += `## 📋 Deskripsi Fitur\n${mod.description}\n\n`;
            docContent += `## 🖼️ Tampilan Antarmuka\n\n`;
            docContent += `![Tampilan ${mod.title}](screenshots/${screenshotName})\n\n`;

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

            docContent += `---\n*Dihasilkan secara otomatis oleh Travel Scraper Manual Guide Engine.*\n`;

            fs.writeFileSync(filePath, docContent, 'utf-8');

            // Append to Master Index
            masterIndexMarkdown += `### ${orderNum}. [${mod.title}](${fileBasename})\n`;
            masterIndexMarkdown += `- **Kategori**: ${mod.category}\n`;
            masterIndexMarkdown += `- **Deskripsi**: ${mod.description}\n\n`;
        }

        // Save Master README.md
        fs.writeFileSync(path.join(DOCS_DIR, 'README.md'), masterIndexMarkdown, 'utf-8');
        console.log(`\n✨ Selesai! Seluruh panduan telah berhasil disusun di folder: ${DOCS_DIR}\n`);

    } catch (error: any) {
        console.error(`❌ Terjadi kesalahan saat scraping panduan:`, error);
    } finally {
        await browser.close();
    }
}

run();
