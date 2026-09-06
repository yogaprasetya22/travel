import { StepGuide } from "../types";

export const AGENT_MODULES: StepGuide[] = [
    {
        id: '01_setup_bio_link_dan_profil_agen',
        title: 'Setup Profil, Password & Live Customizer Bio Link',
        category: 'Promosi & Profil Akun',
        targetRole: 'Mitra Agen (Level 2/3)',
        loginAs: 'agent',
        workflowStage: '1. Setup Profil & Branding Mandiri',
        route: '/profile',
        description: 'Pusat pengaturan profil akun agen, ganti password, nomor WhatsApp konsultasi, bio sambutan, tautan media sosial, serta live preview tampilan mobile sebelum disebarkan ke publik.',
        crudActions: {
            read: [
                'Melihat tampilan preview real-time landing page pada bingkai smartphone mockup di sebelah kanan layar.'
            ],
            update: [
                'Edit Nama Konsultan, Kota Domisili, Nomor WA Konsultasi, dan Bio Sambutan.',
                'Atur tombol tindakan cepat: WhatsApp Konsultasi Pribadi, WhatsApp CS Travel Pusat, atau Formulir Pendaftaran.',
                'Tautkan akun sosial media (Instagram, TikTok, YouTube, Facebook).',
                'Perbarui Kata Sandi / Password login akun agen.'
            ],
            special: [
                'Live Mobile Mockup Preview interaktif.',
                'Salin Tautan Bio Link Personal (contoh: `http://barokah.travel.com/agen/AG-504A79`) untuk dipasang di bio Instagram/TikTok/WhatsApp.'
            ]
        },
        steps: [
            'Login ke sistem menggunakan akun Mitra Agen (`agent2.t2@travel.com`).',
            'Buka menu Profil Akun > Pengaturan Bio Link Agen.',
            'Lengkapi Foto Profil diri, Kota Domisili, Nomor WhatsApp, dan Bio Sambutan.',
            'Periksa hasil tampilan pada Live Mobile Preview di sisi kanan.',
            'Klik tombol "Simpan Perubahan" dan salin link landing page personal Anda.'
        ],
        tips: [
            'Pasang tautan Bio Link Anda pada Profil Instagram dan status WhatsApp untuk menjaring calon jamaah secara otomatis.'
        ],
        actions: async (page: any, ssDir: string) => {
            // Capture the smartphone mockup preview
            const phoneMockup = page.locator('div[class*="rounded-[42px]"]').first();
            if (await phoneMockup.isVisible({ timeout: 3000 }).catch(() => false)) {
                await phoneMockup.scrollIntoViewIfNeeded();
                await page.waitForTimeout(800);
                await page.screenshot({ path: `${ssDir}/01_setup_bio_link_dan_profil_agen_live_preview.webp`, fullPage: false, type: 'webp', quality: 85 });
            }
        }
    },
    {
        id: '02_tampilan_landing_page_bio_link_publik',
        title: 'Halaman Publik Bio Link Mitra Agen (Mobile Landing Page)',
        category: 'Digital Marketing & Leads Capture',
        targetRole: 'Mitra Agen (Level 2/3)',
        loginAs: 'agent',
        workflowStage: '2. Promosi & Penangkapan Leads',
        route: 'http://barokah.localhost:8000/agen/AG-504A79',
        description: 'Halaman web publik resmi milik agen yang diakses oleh calon jamaah melalui klik tautan di Instagram, TikTok, Facebook, atau WhatsApp. Berisi profil konsultan terverifikasi, tombol chat WhatsApp, daftar paket umroh unggulan travel, dan tombol registrasi langsung.',
        crudActions: {
            read: [
                'Calon jamaah dapat membaca profil konsultan pembina resmi travel.',
                'Melihat paket-paket umroh yang sedang dibuka beserta harga dan fasilitasnya.',
                'Melihat ulasan dan testimoni jamaah terdahulu.'
            ],
            special: [
                'Tombol direct chat WhatsApp ke nomor agen secara instan.',
                'Tombol "Daftar Sekarang" yang otomatis mengarahkan ke formulir registrasi dengan kode referral agen (`AG-504A79`).'
            ]
        },
        steps: [
            'Sebarkan URL landing page publik Anda (`http://barokah.travel.com/agen/AG-504A79`) ke prospek jamaah.',
            'Calon jamaah membuka halaman melalui smartphone atau browser laptop.',
            'Calon jamaah dapat langsung berkonsultasi via WhatsApp atau mengklik tombol "Daftar Sekarang".'
        ],
        tips: [
            'Halaman ini didesain mobile-first sehingga sangat ringan dan cepat saat diakses jamaah melalui smartphone.'
        ]
    },
    {
        id: '03_form_pendaftaran_jamaah_referral_publik',
        title: 'Formulir Pendaftaran Online Mandiri Jamaah (Referral Link)',
        category: 'Registrasi & Referral Jamaah',
        targetRole: 'Mitra Agen (Level 2/3)',
        loginAs: 'agent',
        workflowStage: '2. Pendaftaran & Akuisisi Calon Jamaah',
        route: 'http://barokah.localhost:8000/daftar?ref=AG-504A79',
        description: 'Formulir pendaftaran mandiri calon jamaah via tautan referral agen. Memuat informasi paket yang dipilih, data diri calon jamaah, nomor paspor, pilihan kamar, dan nomor rekening resmi travel untuk transfer DP. Agen otomatis tercatat sebagai pembina jamaah.',
        crudActions: {
            create: [
                'Calon jamaah mengisi formulir online: Nama Lengkap, Nomor WhatsApp, Email, NIK KTP, Alamat, Pilihan Paket, dan Pilihan Kamar (Quad/Triple/Double).'
            ],
            read: [
                'Menampilkan banner verifikasi mitra agen pembina (`Referral: Aisyah Putri Azzahra - Barokah`).',
                'Menampilkan daftar nomor rekening bank resmi travel untuk pembayaran DP.'
            ],
            special: [
                'Calon jamaah otomatis terdaftar dan masuk ke tahap "Booking" di CRM sistem travel.',
                'Notifikasi otomatis dikirimkan ke WhatsApp agen pembina dan staf travel pusat.'
            ]
        },
        steps: [
            'Calon jamaah mengklik tombol pendaftaran dari Bio Link agen atau menerima link referral langsung.',
            'Calon jamaah mengisi data diri lengkap pada formulir online.',
            'Calon jamaah memilih metode pembayaran dan mentransfer DP ke rekening resmi travel.',
            'Data langsung tersimpan dan muncul di Kanban CRM agen serta travel pusat.'
        ],
        actions: async (page: any, ssDir: string) => {
            // Test submitting empty form to capture validation error states
            const submitBtn = page.locator('button[type="submit"]:has-text("Daftar"), button:has-text("Kirim Pendaftaran"), button:has-text("Daftar Sekarang")').first();
            if (await submitBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
                await submitBtn.click();
                await page.waitForTimeout(1000);
                await page.screenshot({ path: `${ssDir}/03_form_pendaftaran_jamaah_referral_publik_validasi_error.webp`, fullPage: false, type: 'webp', quality: 85 });
            }
        }
    },
    {
        id: '03a_alur_form_publik_ke_new_leads',
        title: 'Alur Form Pendaftaran Publik → Masuk New Leads CRM (Agen)',
        category: 'Digital Marketing & Leads Capture',
        targetRole: 'Mitra Agen (Level 2/3)',
        loginAs: 'agent',
        workflowStage: '2. Pendaftaran & Akuisisi Calon Jamaah',
        route: '/daftar',
        description: 'Alur end-to-end: calon jamaah mengisi formulir publik via link referral agen → data otomatis masuk ke sistem sebagai New Leads di papan CRM agen. Agen tidak perlu mengentry ulang data apapun.',
        crudActions: {
            create: [
                'Calon jamaah membuka link referral agen: contoh `/daftar?ref=AG-DXPP4B`.',
                'Mengisi formulir: Nama, No WA, Email, NIK, Alamat, dan Pilihan Paket.',
                'Klik Submit ➔ data langsung tersimpan di database.'
            ],
            read: [
                'Agen login ke dashboard ➔ buka CRM > Kanban ➔ kartu jamaah baru muncul di kolom **New Leads**.',
                'Notifikasi otomatis masuk ke dashboard agen bahwa ada leads baru.'
            ],
            special: [
                'Kode referral agen tertanam otomatis di URL sehingga tidak perlu diisi manual oleh calon jamaah.',
                'Agen terdaftar sebagai pembina tetap jamaah tersebut selama proses hingga closing.'
            ]
        },
        steps: [
            'Agen menyebarkan link referral: `http://hajjflow.localhost:8000/daftar?ref=AG-DXPP4B` ke WhatsApp atau media sosial.',
            'Calon jamaah membuka link dan mengisi formulir pendaftaran.',
            'Klik tombol Daftar / Submit.',
            'Agen login ke dashboard ➔ buka CRM > Kanban ➔ pastikan kartu jamaah baru muncul di kolom New Leads.',
            'Klik kartu jamaah untuk melengkapi atau memverifikasi data yang diisi.'
        ],
        tips: [
            'Bagikan link referral di story Instagram setiap hari untuk mendapatkan leads organik secara konsisten.'
        ]
    },
    {
        id: '04_input_dan_pendaftaran_jamaah_internal',
        title: 'Pendaftaran & Input Data Jamaah Binaan Secara Manual (Internal Agen)',
        category: 'Penjualan & Pendaftaran',
        targetRole: 'Mitra Agen (Level 2/3)',
        loginAs: 'agent',
        workflowStage: '2. Pendaftaran & Akuisisi Calon Jamaah',
        route: '/crm',
        description: 'Agen dapat mendaftarkan jamaah secara manual dari dashboard jika calon jamaah mendaftar secara tatap muka (offline) atau melalui chat pribadi tanpa mengklik link referral.',
        crudActions: {
            create: [
                'Klik "+ Tambah Calon Nasabah" untuk menginput data calon jamaah binaan (Nama, No WA, Alamat, Pilihan Paket).'
            ],
            read: [
                'Melihat daftar seluruh jamaah yang terdaftar di bawah referral agen Anda.'
            ],
            update: [
                'Perbarui berkas dokumen jamaah (unggah foto Paspor, KTP, Kartu Keluarga, dan Buku Nikah).'
            ]
        },
        steps: [
            'Login sebagai Agen, buka menu CRM > Pipeline Leads.',
            'Klik tombol "+ Tambah Calon Nasabah".',
            'Isi formulir: Nama Lengkap, No HP/WA, NIK, Alamat, dan pilih Paket Umroh yang diminati.',
            'Klik Simpan ➔ jamaah otomatis tercatat sebagai binaan agen dan masuk stage New Leads.'
        ],
        actions: async (page: any, ssDir: string) => {
            const addBtn = page.getByRole('button', { name: /Tambah Calon Nasabah/i }).first();
            if (await addBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
                await addBtn.click();
                await page.waitForTimeout(1000);

                // Screenshot drawer form kosong
                await page.screenshot({ path: `${ssDir}/04_input_dan_pendaftaran_jamaah_internal_modal_tambah.webp`, fullPage: false, type: 'webp', quality: 85 });

                // Isi data form calon jamaah secara lengkap
                await page.locator('#nama_lengkap').fill('H. Ahmad Fauzi (Binaan Budi)');
                await page.locator('#nik').fill('3201234567890001');
                await page.locator('#no_hp').fill('081298765432');
                await page.locator('#email').fill('ahmad.fauzi@example.com');
                
                // Pilih paket umroh pertama yang tersedia
                const paketSelect = page.locator('#paket_id');
                const options = await paketSelect.locator('option').all();
                if (options.length > 1) {
                    const val = await options[1].getAttribute('value');
                    if (val) await paketSelect.selectOption(val);
                }

                await page.locator('#catatan_admin').fill('Mendaftar paket umroh VIP bersama istri, rencana berangkat bulan depan.');
                await page.waitForTimeout(500);

                // Screenshot formulir yang sudah terisi lengkap
                await page.screenshot({ path: `${ssDir}/04_input_dan_pendaftaran_jamaah_internal_form_terisi.webp`, fullPage: false, type: 'webp', quality: 85 });

                // Klik simpan data prospek
                const saveBtn = page.locator('button[type="submit"]:has-text("Simpan"), button:has-text("Simpan Prospek")').first();
                if (await saveBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
                    await saveBtn.click();
                    await page.waitForTimeout(1500);
                }
            }
        }
    },
    {
        id: '04b_upload_bukti_transfer_agen',
        title: 'Upload Bukti Transfer Pembayaran oleh Agen',
        category: 'Penjualan & Pembayaran',
        targetRole: 'Mitra Agen (Level 2/3)',
        loginAs: 'agent',
        workflowStage: '3. Pengawalan Prospek Hingga Lunas',
        route: '/crm/customers',
        description: 'Setelah jamaah binaan mentransfer DP atau cicilan ke rekening travel, agen mengunggah foto bukti transfer dari dashboard agen. Bukti akan diperiksa dan disetujui oleh pihak manajemen travel.',
        crudActions: {
            create: [
                'Buka detail jamaah ➔ klik tombol "Rincian & Bayar" ➔ klik "Catat Pelunasan / Cicilan".',
                'Pilih Tipe: DP atau Cicilan.',
                'Isi Nominal yang ditransfer jamaah.',
                'Unggah foto/screenshot bukti transfer dari galeri atau kamera.',
                'Klik Simpan ➔ status pembayaran menjadi Pending Verifikasi.'
            ],
            read: [
                'Pantau status verifikasi di panel detail jamaah: Pending → Verified.',
                'Lihat riwayat semua pembayaran beserta nominal dan tanggal.'
            ],
            special: [
                'Setelah diverifikasi oleh kantor travel, saldo komisi agen otomatis masuk ke rekap komisi agen.'
            ]
        },
        steps: [
            'Login sebagai Agen, buka CRM > Data Jamaah.',
            'Cari nama jamaah yang baru saja mentransfer DP.',
            'Klik tombol "Rincian & Bayar" pada baris jamaah.',
            'Klik tombol "Catat Pelunasan / Cicilan".',
            'Isi nominal DP, pilih rekening tujuan yang dipakai jamaah, dan unggah foto bukti transfer.',
            'Klik Simpan — status berubah ke Pending dan menunggu verifikasi dari kantor travel.'
        ],
        tips: [
            'Pastikan foto bukti transfer jelas dan terbaca (nama pengirim, nominal, dan tanggal transfer harus terlihat).'
        ],
        actions: async (page: any, ssDir: string) => {
            const finBtn = page.getByRole('button', { name: /Rincian & Bayar/i }).first();
            if (await finBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
                await finBtn.click();
                await page.waitForTimeout(1000);

                // 1. Capture Financial tab & payment drawer
                const payBtn = page.getByRole('button', { name: /Catat Pelunasan \/ Cicilan/i }).first();
                if (await payBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
                    await payBtn.click();
                    await page.waitForTimeout(800);
                }
                await page.screenshot({ path: `${ssDir}/04b_upload_bukti_transfer_agen_drawer_financial.webp`, fullPage: false, type: 'webp', quality: 85 });

                // 2. Switch to Biodata tab
                const biodataTab = page.locator('button:has-text("Biodata"), [role="tab"]:has-text("Biodata")').first();
                if (await biodataTab.isVisible({ timeout: 2000 }).catch(() => false)) {
                    await biodataTab.click();
                    await page.waitForTimeout(800);
                    await page.screenshot({ path: `${ssDir}/04b_upload_bukti_transfer_agen_drawer_biodata.webp`, fullPage: false, type: 'webp', quality: 85 });
                }

                await page.keyboard.press('Escape');
                await page.waitForTimeout(600);
            }

            // 3. Test empty search state in Customer List
            const searchInput = page.locator('input[placeholder*="Cari"]').first();
            if (await searchInput.isVisible({ timeout: 2000 }).catch(() => false)) {
                await searchInput.fill('ZZZ_TIDAK_ADA_DATA_999');
                await page.waitForTimeout(1000);
                await page.screenshot({ path: `${ssDir}/04b_upload_bukti_transfer_agen_empty_state.webp`, fullPage: false, type: 'webp', quality: 85 });
                await searchInput.fill('');
                await page.waitForTimeout(600);
            }
        }
    },
    {
        id: '04c_monitoring_status_pembayaran_agen',
        title: 'Memantau Status Pembayaran & Pindah Stage Kanban (Agen)',
        category: 'CRM & Follow Up',
        targetRole: 'Mitra Agen (Level 2/3)',
        loginAs: 'agent',
        workflowStage: '3. Pengawalan Prospek Hingga Lunas',
        route: '/crm',
        description: 'Setelah bukti transfer diverifikasi oleh kantor, agen dapat memantau perpindahan status jamaah di papan Kanban CRM dan memindahkan stage jamaah yang sudah negosiasi ke tahap berikutnya.',
        crudActions: {
            read: [
                'Lihat status terkini kartu jamaah di setiap kolom Kanban (New Leads, Follow Up, Negosiasi, Closing).',
                'Kartu jamaah yang sudah terverifikasi pembayarannya akan berpindah stage secara otomatis.'
            ],
            update: [
                'Agen dapat memindahkan stage jamaah secara manual via tombol aksi di panel detail jamaah.',
                'Tambahkan catatan follow-up atau pengingat konsultasi di panel detail jamaah.'
            ],
            special: [
                'Filter Kanban berdasarkan stage tertentu untuk fokus follow-up pada leads yang sudah siap closing.'
            ]
        },
        steps: [
            'Login sebagai Agen, buka CRM > Pipeline Kanban.',
            'Pantau kartu jamaah yang baru saja diupload bukti transfernya.',
            'Setelah status diverifikasi kantor, kartu otomatis berpindah stage.',
            'Untuk memindahkan manual: klik kartu jamaah ➔ ubah stage ➔ simpan.',
            'Lakukan follow-up pada jamaah di kolom New Leads dan Follow Up untuk mendorong ke tahap Negosiasi.'
        ],
        tips: [
            'Jamaah di kolom Follow Up yang belum bergerak selama 7 hari perlu dihubungi ulang via WhatsApp untuk menghindari leads dingin.'
        ],
        actions: async (page: any, ssDir: string) => {
            const followBtn = page.getByRole('button', { name: /Follow-up/i }).first();
            if (await followBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
                await followBtn.click();
                await page.waitForTimeout(1000);
                await page.screenshot({ path: `${ssDir}/04c_monitoring_status_pembayaran_agen_modal_followup.webp`, fullPage: false, type: 'webp', quality: 85 });
                await page.keyboard.press('Escape');
                await page.waitForTimeout(600);
            }
        }
    },
    {
        id: '05_monitoring_crm_pipeline_binaan',
        title: 'Monitoring Pipeline Kanban Jamaah Binaan',
        category: 'CRM & Follow Up',
        targetRole: 'Mitra Agen (Level 2/3)',
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
        ],
        actions: async (page: any, ssDir: string) => {
            const editBtn = page.locator('button[title*="Edit Data Calon Nasabah"]').first();
            if (await editBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
                await editBtn.click();
                await page.waitForTimeout(1000);
                await page.screenshot({ path: `${ssDir}/05_monitoring_crm_pipeline_binaan_drawer_edit.webp`, fullPage: false, type: 'webp', quality: 85 });
                await page.keyboard.press('Escape');
                await page.waitForTimeout(600);
            }
        }
    },
    {
        id: '05b_monitoring_pohon_jaringan_tim_agen',
        title: 'Monitoring Pohon Jaringan & Performa Tim Sub-Agen',
        category: 'Keagenan & Jaringan',
        targetRole: 'Mitra Agen (Level 2/3)',
        loginAs: 'agent',
        workflowStage: '4. Pengembangan Tim & Sub-Agen',
        route: '/monitoring',
        description: 'Dashboard struktur pohon jaringan agen (Downline). Agen dapat memantau produktivitas sub-agen binaannya, total omzet tim, dan estimasi komisi override.',
        crudActions: {
            read: [
                'Melihat kartu ringkasan KPI Tim: Total Anggota, Total Jamaah Tim, Akumulasi Omzet Tim, dan Komisi Override.',
                'Melihat bagan struktur atasan-bawahan downline keagenan.',
                'Klik tombol "Lihat Nasabah" pada baris anggota untuk membuka laci daftar jamaah yang dibina sub-agen.'
            ],
            special: [
                'Filter pencarian anggota tim berdasarkan nama atau level keagenan.'
            ]
        },
        steps: [
            'Buka menu Keagenan > Monitoring Jaringan.',
            'Pantau metrik penjualan dan pertumbuhan tim binaan Anda.',
            'Klik tombol "Lihat Nasabah" untuk melihat prospek dan progres pelunasan jamaah dari sub-agen terkait.'
        ],
        actions: async (page: any, ssDir: string) => {
            const viewCustBtn = page.getByRole('button', { name: /Lihat Nasabah/i }).first();
            if (await viewCustBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
                await viewCustBtn.click();
                await page.waitForTimeout(1000);
                await page.screenshot({ path: `${ssDir}/05b_monitoring_pohon_jaringan_tim_agen_drawer_nasabah.webp`, fullPage: false, type: 'webp', quality: 85 });
                await page.keyboard.press('Escape');
                await page.waitForTimeout(600);
            }
        }
    },
    {
        id: '06_rekap_komisi_dan_pencairan_agen',
        title: 'Rekap Komisi Penjualan & Saldo Agen',
        category: 'Keuangan & Reward',
        targetRole: 'Mitra Agen (Level 2/3)',
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
        ],
        actions: async (page: any, ssDir: string) => {
            // Filter by Pending / Siap Cair
            const statusSelect = page.locator('select').first();
            if (await statusSelect.isVisible({ timeout: 2000 }).catch(() => false)) {
                await statusSelect.selectOption({ label: 'Menunggu DP' }).catch(() => {});
                await page.waitForTimeout(800);
                await page.screenshot({ path: `${ssDir}/06_rekap_komisi_dan_pencairan_agen_filter_status.webp`, fullPage: false, type: 'webp', quality: 85 });
            }
        }
    }
];
