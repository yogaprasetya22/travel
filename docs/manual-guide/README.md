# 📖 BUKU PANDUAN PENGGUNA (USER MANUAL GUIDE)

**Sistem Informasi & CRM Travel Umroh Multi-Tenant**

*Panduan ini disusun untuk memandu seluruh peran (Owner Travel, Admin Operasional, Keuangan, Kasir, dan Mitra Agen).* 

---

## 👥 Akun Akses Demo / Peran Sistem

- **Owner Travel (Level 1)**: `superadmin@hajjflow.com` (Password: `password`)
- **Mitra Agen (Level 2/3)**: `agent2.t2@travel.com` (Password: `password`)

---

## 🗺️ Alur Bisnis: Dari Mendapatkan Jamaah Hingga Closing & Berangkat

Berikut adalah perbandingan tanggung jawab dan alur kerja antara **Owner Travel (Level 1)** dan **Mitra Agen (Level 2/3)**:

| Tahapan Alur | Tanggung Jawab Owner Travel (Level 1) | Tanggung Jawab Mitra Agen (Level 2/3) |
| :--- | :--- | :--- |
| **1. Setup & Branding** | Mengatur Profil Travel, Logo, Rekening Bank, Tema Landing Page, Master Paket Umroh, dan Kuota. | Melengkapi Profil Bio Link di `/profile`, foto diri, kota, dan tautan sosial media. |
| **2. Promosi & Leads** | Memonitor seluruh pergerakan leads travel secara makro. | Menyebarkan Bio Link personal (`/agen/AG-XXX`) ke WhatsApp, Instagram, dan relasi. |
| **3. Pendaftaran Prospek** | Menerima leads organik dari website pusat atau pendaftaran agen. | Mendaftarkan calon jamaah langsung atau menerima leads otomatis via referral link. |
| **4. CRM & Dokumen** | Memantau papan Kanban seluruh tim dan memvalidasi berkas paspor/visa. | Mengawal kelengkapan berkas jamaah binaan (Paspor, KTP, Buku Nikah, Vaksin). |
| **5. Pembayaran (Closing)** | Kasir/Keuangan memvalidasi bukti transfer DP/Lunas dan menerbitkan invoice resmi. | Mengarahkan jamaah transfer ke rekening resmi travel & mengunggah bukti bayar. |
| **6. Logistik & Manifest** | Menyerahkan koper & perlengkapan di gudang, mengunci manifest seat penerbangan & hotel. | Mengabari jamaah jadwal pengambilan koper, manasik, dan briefing keberangkatan. |
| **7. Pencairan Komisi** | Mentransfer pencairan komisi agen yang jamaahnya sudah lunas. | Memonitor akumulasi komisi di menu Komisi dan menerima transfer hasil closing. |

---

## 📑 Daftar Modul & Panduan Lengkap

### 01. [Panduan Login & Dashboard Utama (Owner)](01_01_LOGIN_DAN_DASHBOARD.md)
- **Target Role**: `Owner (Level 1)` (Akun: `superadmin@hajjflow.com`)
- **Fase Alur**: 1. Setup & Master Data
- **Deskripsi**: Dashboard memberikan visibilitas menyeluruh terhadap kinerja travel, akumulasi omzet, jumlah jamaah, dan grafik tren keberangkatan.

### 02. [Setup Bio Link & Landing Page Personal Agen](02_02_PENGATURAN_BIO_LINK_AGEN.md)
- **Target Role**: `Agen Mitra (Level 2/3)` (Akun: `agent2.t2@travel.com`)
- **Fase Alur**: 2. Promosi & Akuisisi
- **Deskripsi**: Pusat kustomisasi website mini Bio Link (Linktree Islami) untuk Mitra Agen agar dapat mempromosikan paket dan menjaring leads secara digital.

### 03. [Manajemen Prospek Jamaah (Kanban Board Leads to Closing)](03_03_CRM_PIPELINE_KANBAN.md)
- **Target Role**: `Semua Role` (Akun: `superadmin@hajjflow.com`)
- **Fase Alur**: 3. Manajemen Leads & CRM
- **Deskripsi**: Papan Kanban interaktif untuk memonitor perpindahan status jamaah dari tahap Inquiry (Calon) hingga Berangkat dan Pasca-Kepulangan.

### 04. [Data Jamaah, Verifikasi Kasir & Invoice Pembayaran](04_04_DATA_JAMAAH_DAN_PEMBAYARAN.md)
- **Target Role**: `Owner (Level 1)` (Akun: `superadmin@hajjflow.com`)
- **Fase Alur**: 3. Manajemen Leads & CRM
- **Deskripsi**: Tabel master data seluruh jamaah terdaftar dengan kemampuan pencarian cepat, filter status lunas, dan input pembayaran DP/Pelunasan.

### 05. [Distribusi Logistik & Perlengkapan Jamaah](05_05_DISTRIBUSI_LOGISTIK_DAN_KOPER.md)
- **Target Role**: `Owner (Level 1)` (Akun: `superadmin@hajjflow.com`)
- **Fase Alur**: 4. Operasional & Keberangkatan
- **Deskripsi**: Modul pelacakan pembagian perlengkapan umroh (koper, kain ihram, mukena, seragam, dan buku doa) kepada setiap jamaah.

### 06. [Jadwal & Kuota Keberangkatan](06_06_JADWAL_KEBERANGKATAN.md)
- **Target Role**: `Owner (Level 1)` (Akun: `superadmin@hajjflow.com`)
- **Fase Alur**: 4. Operasional & Keberangkatan
- **Deskripsi**: Manajemen tanggal keberangkatan, batas kuota kursi penerbangan, hotel Makkah/Madinah, dan status ketersediaan seat.

### 07. [Manajemen Mitra Agen & Verifikasi Akun](07_07_KEAGENAN_DAN_BIO_LINK.md)
- **Target Role**: `Owner (Level 1)` (Akun: `superadmin@hajjflow.com`)
- **Fase Alur**: 1. Setup & Master Data
- **Deskripsi**: Pusat pengelolaan mitra agen travel, pembuatan kode referral unik, dan pengaturan izin kemitraan.

### 08. [Pencatatan & Pencairan Komisi Agen](08_08_PEMBAGIAN_KOMISI_AGEN.md)
- **Target Role**: `Semua Role` (Akun: `superadmin@hajjflow.com`)
- **Fase Alur**: 5. Keuangan & Komisi
- **Deskripsi**: Rekapitulasi komisi agen berdasarkan skema flat atau persentase per jamaah yang telah menyelesaikan pembayaran.

### 09. [Monitoring Kinerja & Struktur Tim Agen](09_09_MONITORING_DAN_POHON_JARINGAN.md)
- **Target Role**: `Owner (Level 1)` (Akun: `superadmin@hajjflow.com`)
- **Fase Alur**: 5. Keuangan & Komisi
- **Deskripsi**: Visualisasi pohon jaringan (hierarki leader, agen level 2, agen level 3) beserta perolehan omzet per grup tim.

### 10. [Inventaris Stok & Perlengkapan Gudang](10_10_INVENTARIS_DAN_STOK_BARANG.md)
- **Target Role**: `Owner (Level 1)` (Akun: `superadmin@hajjflow.com`)
- **Fase Alur**: 4. Operasional & Keberangkatan
- **Deskripsi**: Pencatatan stok fisik perlengkapan travel, peringatan stok minimum, dan riwayat mutasi barang masuk/keluar.

### 11. [Pengaturan Data Master, Paket Umroh & Rekening Bank](11_11_PENGATURAN_DATA_MASTER.md)
- **Target Role**: `Owner (Level 1)` (Akun: `superadmin@hajjflow.com`)
- **Fase Alur**: 1. Setup & Master Data
- **Deskripsi**: Konfigurasi master paket umroh, harga, komisi default, fasilitas hotel, rekening bank resmi, dan sumber leads.

### 12. [Pengaturan Pengguna & Hierarki Level Jabatan](12_12_PENGATURAN_PENGGUNA_DAN_LEVEL.md)
- **Target Role**: `Owner (Level 1)` (Akun: `superadmin@hajjflow.com`)
- **Fase Alur**: 1. Setup & Master Data
- **Deskripsi**: Pengelolaan akun pengguna staff internal (Owner, Admin, Keuangan, Kasir) dan penentuan jenjang level kemitraan agen.

