# 📖 BUKU PANDUAN PENGGUNA: OWNER TRAVEL (LEVEL 1)

**Sistem Manajemen Operasional & CRM Travel Umroh Multi-Tenant**

Panduan ini memuat seluruh panduan langkah demi langkah, operasi CRUD lengkap, dan tata kelola sistem khusus untuk peran **Owner Travel (Level 1)**.

---

## 🗺️ Alur Perjalanan Kerja (End-to-End Workflow)

### Roadmap Kerja Owner Travel (Level 1):
1. **Setup & Master Data**: Menyiapkan profil travel, tema landing page, rekening bank resmi, dan katalog paket umroh.
2. **Manajemen Mitra Agen**: Menerima pendaftaran agen baru, menyetujui akun, dan menentukan struktur komisi.
3. **Pengawasan Pipa Prospek (CRM)**: Memonitor seluruh prospek jamaah di papan Kanban global dan memverifikasi berkas paspor/visa.
4. **Kasir & Pelunasan**: Memvalidasi bukti transfer bank DP/Pelunasan jamaah dan menerbitkan kuitansi/invoice resmi.
5. **Operasional & Logistik**: Menyiapkan koper/perlengkapan di gudang, mencatat serah terima, dan mengunci manifest seat penerbangan.
6. **Pencairan Komisi**: Mentransfer hak bagi hasil komisi kepada mitra agen yang jamaahnya sudah lunas.

---

## 📑 Daftar Modul & Panduan Lengkap

### 01. [Dashboard Utama & Ringkasan KPI Eksekutif](01_01_DASHBOARD_UTAMA_OWNER.md)
- **Fase**: 1. Monitoring & Analitik Bisnis
- **Kategori**: Eksekutif & Dashboard
- **Deskripsi**: Pusat kendali eksekutif untuk melihat performa bisnis travel, total omzet masuk, sisa piutang, keterisian kuota jamaah, dan performa penjualan seluruh agen secara makro.

### 02. [Papan CRM Kanban Pipeline Jamaah (Leads to Closing)](02_02_CRM_PIPELINE_KANBAN.md)
- **Fase**: 2. Pengawalan Leads & Prospek
- **Kategori**: CRM & Penjualan
- **Deskripsi**: Papan Kanban visual interaktif untuk mengawal alur prospek calon jamaah dari tahap Kontak Pertama, Konsultasi, Booking Kursi, Pembayaran DP, Pengumpulan Berkas, hingga Pelunasan.

### 03. [Tambah Jamaah Baru Manual oleh Owner/Staf (CRM Create)](03_03_TAMBAH_JAMAAH_MANUAL_OWNER.md)
- **Fase**: 3. Pendaftaran Jamaah Manual
- **Kategori**: CRM & Kasir
- **Deskripsi**: Owner atau staf kantor dapat mendaftarkan calon jamaah secara manual langsung dari papan CRM, misalnya untuk pendaftaran tatap muka, lewat telepon, atau pameran.

### 04. [Master Data Jamaah, Kasir & Kuitansi Pembayaran](04_03B_DATA_JAMAAH_DAN_KASIR.md)
- **Fase**: 3. Transaksi & Validasi Pembayaran
- **Kategori**: CRM & Kasir
- **Deskripsi**: Master data seluruh jamaah terdaftar dengan fungsi Kasir untuk memverifikasi pembayaran transfer bank, mencatat cicilan/pelunasan, dan menerbitkan invoice resmi.

### 05. [Input Pembayaran DP Jamaah oleh Owner/Kasir](05_03C_INPUT_DP_PEMBAYARAN_OWNER.md)
- **Fase**: 3. Transaksi & Validasi Pembayaran
- **Kategori**: CRM & Kasir
- **Deskripsi**: Kasir atau Owner memasukkan penerimaan uang muka (Down Payment / DP) jamaah ke dalam sistem setelah konfirmasi transfer bank diterima. Nominal DP bisa berapa saja sesuai kebijakan travel.

### 06. [Verifikasi & Persetujuan Bukti Transfer (Finance)](06_03D_VERIFIKASI_BUKTI_TRANSFER_OWNER.md)
- **Fase**: 3. Transaksi & Validasi Pembayaran
- **Kategori**: Keuangan & Verifikasi
- **Deskripsi**: Halaman Finance Payment adalah pusat validasi kasir untuk menyetujui atau menolak bukti transfer yang diunggah jamaah atau agen. Setelah diverifikasi, dana dianggap masuk resmi ke kas travel.

### 07. [Input Pelunasan Penuh (Lunas) Jamaah oleh Kasir](07_03E_INPUT_PELUNASAN_JAMAAH_OWNER.md)
- **Fase**: 3. Transaksi & Validasi Pembayaran
- **Kategori**: CRM & Kasir
- **Deskripsi**: Proses pencatatan pelunasan akhir jamaah saat total pembayaran telah memenuhi harga paket. Sistem otomatis memindahkan jamaah ke stage Closing dan menerbitkan notifikasi komisi agen.

### 08. [Memindahkan Stage Jamaah di Papan Kanban CRM](08_03F_PINDAH_STAGE_KANBAN_OWNER.md)
- **Fase**: 2. Pengawalan Leads & Prospek
- **Kategori**: CRM & Penjualan
- **Deskripsi**: Owner dapat menggeser kartu jamaah antar-kolom tahapan CRM (New Leads → Follow Up → Negosiasi → Closing) baik secara drag & drop maupun via tombol follow-up dan edit.

### 09. [Distribusi & Serah Terima Logistik Perlengkapan](09_04_DISTRIBUSI_LOGISTIK.md)
- **Fase**: 4. Eksekusi & Serah Terima Perlengkapan
- **Kategori**: Operasional Gudang
- **Deskripsi**: Modul serah terima barang perlengkapan ibadah (koper bagasi, kain ihram/mukena, buku doa, id card) kepada jamaah yang telah melunasi pembayaran.

### 10. [Jadwal, Maskapai & Manajemen Kuota Kursi](10_05_JADWAL_KEBERANGKATAN.md)
- **Fase**: 4. Manajemen Kloter & Kuota Seat
- **Kategori**: Operasional
- **Deskripsi**: Manajemen kloter keberangkatan, batas kuota kursi pesawat, hotel Makkah/Madinah, dan status ketersediaan seat.

### 11. [Manajemen Mitra Agen & Persetujuan Akun](11_06_MANAJEMEN_MITRA_AGEN.md)
- **Fase**: 2. Rekrutmen & Manajemen Kemitraan
- **Kategori**: Keagenan
- **Deskripsi**: Daftar seluruh agen mitra konsultan, status persetujuan akun baru, level hierarki, kode referral personal, dan penunjukan Leader/Upline.

### 12. [Rekapitulasi & Pencairan Komisi Mitra Agen](12_07_PENCAIRAN_KOMISI_AGEN.md)
- **Fase**: 6. Validasi & Pembayaran Komisi
- **Kategori**: Keuangan & Komisi
- **Deskripsi**: Modul keuangan untuk memvalidasi hak komisi penjualan agen atas jamaah yang telah lunas dan memproses pencairan transfer dana ke rekening bank agen.

### 13. [Monitoring Struktur Tim & Pohon Jaringan Agen](13_08_MONITORING_POHON_JARINGAN.md)
- **Fase**: 2. Pengawasan Jaringan Penjualan
- **Kategori**: Keagenan & MLM Syariah
- **Deskripsi**: Visualisasi pohon jaringan (Network Tree) keagenan bertingkat untuk melihat hubungan Upline-Downline, struktur Leader, dan perolehan omzet grup.

### 14. [Inventaris Stok Fisik Gudang & Barang Masuk](14_09_INVENTARIS_DAN_STOK_BARANG.md)
- **Fase**: 4. Eksekusi & Serah Terima Perlengkapan
- **Kategori**: Gudang & Inventaris
- **Deskripsi**: Pencatatan persediaan fisik perlengkapan travel di gudang (koper, kain ihram, mukena, seragam) beserta riwayat barang masuk dari vendor.

### 15. [Pengaturan Master Paket, Rekening & CRM](15_10_PENGATURAN_DATA_MASTER.md)
- **Fase**: 1. Setup & Konfigurasi Awal
- **Kategori**: Master Data
- **Deskripsi**: Konfigurasi sentral paket umroh & haji, nominal komisi default, fasilitas hotel, rekening bank resmi penerima dana, dan sumber prospek leads.

### 16. [Manajemen Staf Internal & Hierarki Pengguna](16_11_PENGATURAN_PENGGUNA_DAN_LEVEL.md)
- **Fase**: 1. Setup & Konfigurasi Awal
- **Kategori**: Pengaturan Akun
- **Deskripsi**: Pengelolaan akun login staf kantor internal (Admin, Keuangan, Kasir) dan pengaturan pohon hierarki atasan-bawahan.

### 17. [Profil Akun, Tema & Keamanan Owner](17_12_PENGATURAN_PROFIL_OWNER.md)
- **Fase**: 1. Setup & Konfigurasi Akun
- **Kategori**: Profil & Keamanan
- **Deskripsi**: Pengaturan profil personal direksi/owner travel, pembaruan kata sandi akun demi keamanan data, dan pengaturan preferensi tema tampilan antarmuka (Luxury, Emerald, Light, Dark).

### 18. [Manajemen Multi-Tenant & Entitas Travel Agensi](18_13_MANAJEMEN_MULTI_TENANT_PLATFORM.md)
- **Fase**: 1. Setup & Multi-Tenant Ekosistem
- **Kategori**: Platform Superadmin
- **Deskripsi**: Pusat kendali multi-tenant platform untuk melihat seluruh travel agensi terdaftar, isolasi database, statistik omzet per travel, dan onboarding tenant baru.

### 19. [Pengaturan Sistem, Notifikasi & Kustomisasi Tema](19_14_PENGATURAN_APLIKASI_DAN_TEMA.md)
- **Fase**: 1. Setup & Konfigurasi Awal
- **Kategori**: Pengaturan Sistem
- **Deskripsi**: Pusat preferensi sistem travel: pemilihan palet tema warna (Luxury, Emerald, Royal, Obsidian), konfigurasi notifikasi alert email/suara, dan format regional mata uang.

### 20. [Pusat Notifikasi & Kirim Pengumuman Siaran (Broadcast)](20_15_PUSAT_NOTIFIKASI_DAN_BROADCAST.md)
- **Fase**: 1. Komunikasi & Pengumuman Internal
- **Kategori**: Komunikasi & Notifikasi
- **Deskripsi**: Laci pusat notifikasi real-time dan fitur Broadcast Announcement untuk mengirimkan pesan siaran penting ke seluruh staf kantor dan mitra agen.

