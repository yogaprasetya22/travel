# 📖 BUKU PANDUAN PENGGUNA: MITRA AGEN (LEVEL 2/3)

**Sistem Manajemen Operasional & CRM Travel Umroh Multi-Tenant**

Panduan ini memuat seluruh panduan langkah demi langkah, operasi CRUD lengkap, dan tata kelola sistem khusus untuk peran **Mitra Agen (Level 2/3)**.

---

## 🗺️ Alur Perjalanan Kerja (End-to-End Workflow)

### Roadmap Kerja Mitra Agen (Level 2/3):
1. **Setup Bio Link Mandiri**: Melengkapi foto profil, bio komitmen pelayanan, dan tombol WhatsApp di `/profile`.
2. **Promosi & Akuisisi Leads**: Menyebarkan tautan Bio Link personal (`/agen/AG-XXX`) dan Link Referral Form ke media sosial untuk menjaring calon jamaah secara otomatis.
3. **Pendaftaran Jamaah**: Mendaftarkan calon jamaah langsung ke sistem atau menerima leads via referral code agen.
4. **Pengawalan CRM**: Mengawal kelengkapan berkas jamaah binaan (Paspor, KTP, Buku Nikah, Vaksin) di papan Kanban.
5. **Pembayaran & Closing**: Mengarahkan jamaah melakukan transfer ke rekening resmi travel dan mengunggah bukti bayar.
6. **Pencairan Komisi**: Memonitor akumulasi saldo komisi langsung dan komisi override sub-agen hingga dicairkan oleh kantor pusat.

---

## 📑 Daftar Modul & Panduan Lengkap

### 01. [Setup Profil, Password & Live Customizer Bio Link](01_01_SETUP_BIO_LINK_DAN_PROFIL_AGEN.md)
- **Fase**: 1. Setup Profil & Branding Mandiri
- **Kategori**: Promosi & Profil Akun
- **Deskripsi**: Pusat pengaturan profil akun agen, ganti password, nomor WhatsApp konsultasi, bio sambutan, tautan media sosial, serta live preview tampilan mobile sebelum disebarkan ke publik.

### 02. [Halaman Publik Bio Link Mitra Agen (Mobile Landing Page)](02_02_TAMPILAN_LANDING_PAGE_BIO_LINK_PUBLIK.md)
- **Fase**: 2. Promosi & Penangkapan Leads
- **Kategori**: Digital Marketing & Leads Capture
- **Deskripsi**: Halaman web publik resmi milik agen yang diakses oleh calon jamaah melalui klik tautan di Instagram, TikTok, Facebook, atau WhatsApp. Berisi profil konsultan terverifikasi, tombol chat WhatsApp, daftar paket umroh unggulan travel, dan tombol registrasi langsung.

### 03. [Formulir Pendaftaran Online Mandiri Jamaah (Referral Link)](03_03_FORM_PENDAFTARAN_JAMAAH_REFERRAL_PUBLIK.md)
- **Fase**: 2. Pendaftaran & Akuisisi Calon Jamaah
- **Kategori**: Registrasi & Referral Jamaah
- **Deskripsi**: Formulir pendaftaran mandiri calon jamaah via tautan referral agen. Memuat informasi paket yang dipilih, data diri calon jamaah, nomor paspor, pilihan kamar, dan nomor rekening resmi travel untuk transfer DP. Agen otomatis tercatat sebagai pembina jamaah.

### 04. [Alur Form Pendaftaran Publik → Masuk New Leads CRM (Agen)](04_03A_ALUR_FORM_PUBLIK_KE_NEW_LEADS.md)
- **Fase**: 2. Pendaftaran & Akuisisi Calon Jamaah
- **Kategori**: Digital Marketing & Leads Capture
- **Deskripsi**: Alur end-to-end: calon jamaah mengisi formulir publik via link referral agen → data otomatis masuk ke sistem sebagai New Leads di papan CRM agen. Agen tidak perlu mengentry ulang data apapun.

### 05. [Pendaftaran & Input Data Jamaah Binaan Secara Manual (Internal Agen)](05_04_INPUT_DAN_PENDAFTARAN_JAMAAH_INTERNAL.md)
- **Fase**: 2. Pendaftaran & Akuisisi Calon Jamaah
- **Kategori**: Penjualan & Pendaftaran
- **Deskripsi**: Agen dapat mendaftarkan jamaah secara manual dari dashboard jika calon jamaah mendaftar secara tatap muka (offline) atau melalui chat pribadi tanpa mengklik link referral.

### 06. [Upload Bukti Transfer Pembayaran oleh Agen](06_04B_UPLOAD_BUKTI_TRANSFER_AGEN.md)
- **Fase**: 3. Pengawalan Prospek Hingga Lunas
- **Kategori**: Penjualan & Pembayaran
- **Deskripsi**: Setelah jamaah binaan mentransfer DP atau cicilan ke rekening travel, agen mengunggah foto bukti transfer dari dashboard agen. Bukti akan diperiksa dan disetujui oleh pihak manajemen travel.

### 07. [Memantau Status Pembayaran & Pindah Stage Kanban (Agen)](07_04C_MONITORING_STATUS_PEMBAYARAN_AGEN.md)
- **Fase**: 3. Pengawalan Prospek Hingga Lunas
- **Kategori**: CRM & Follow Up
- **Deskripsi**: Setelah bukti transfer diverifikasi oleh kantor, agen dapat memantau perpindahan status jamaah di papan Kanban CRM dan memindahkan stage jamaah yang sudah negosiasi ke tahap berikutnya.

### 08. [Monitoring Pipeline Kanban Jamaah Binaan](08_05_MONITORING_CRM_PIPELINE_BINAAN.md)
- **Fase**: 3. Pengawalan Prospek Hingga Lunas
- **Kategori**: CRM & Follow Up
- **Deskripsi**: Papan Kanban visual khusus bagi agen untuk mengawal jamaah binaan melewati setiap tahapan: Booking ➔ DP Terbayar ➔ Berkas Lengkap ➔ Pelunasan ➔ Siap Berangkat.

### 09. [Monitoring Pohon Jaringan & Performa Tim Sub-Agen](09_05B_MONITORING_POHON_JARINGAN_TIM_AGEN.md)
- **Fase**: 4. Pengembangan Tim & Sub-Agen
- **Kategori**: Keagenan & Jaringan
- **Deskripsi**: Dashboard struktur pohon jaringan agen (Downline). Agen dapat memantau produktivitas sub-agen binaannya, total omzet tim, dan estimasi komisi override.

### 10. [Rekap Komisi Penjualan & Saldo Agen](10_06_REKAP_KOMISI_DAN_PENCAIRAN_AGEN.md)
- **Fase**: 4. Hasil Penjualan & Payout
- **Kategori**: Keuangan & Reward
- **Deskripsi**: Pusat transparansi saldo komisi agen, riwayat komisi per jamaah yang telah lunas, dan status pencairan dana oleh kantor pusat.

