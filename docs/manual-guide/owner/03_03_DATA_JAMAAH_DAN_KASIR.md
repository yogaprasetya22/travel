# Master Data Jamaah, Kasir & Kuitansi Pembayaran

> **Target Peran**: `Owner (Level 1)` | **Login Akun**: `superadmin@hajjflow.com`
> **Tahapan Alur**: `3. Transaksi & Validasi Pembayaran` | **Kategori**: `CRM & Kasir` | **Rute**: `/crm/customers`

## 📋 Deskripsi Fitur
Master data seluruh jamaah terdaftar dengan fungsi Kasir untuk memverifikasi pembayaran transfer bank, mencatat cicilan/pelunasan, dan menerbitkan invoice resmi.

## 🖼️ Tampilan Antarmuka

![Tampilan Master Data Jamaah, Kasir & Kuitansi Pembayaran](screenshots/03_data_jamaah_dan_kasir.png)

## ⚡ Aksi & Fitur Lengkap (CRUD Matrix)

### ➕ Create (Tambah / Input Baru)
- Klik tombol "+ Tambah Jamaah" untuk menginput pendaftaran calon jamaah baru secara manual oleh staf kantor.

### 🔍 Read (Lihat / Pencarian / Filter Data)
- Pencarian data jamaah berdasarkan Nama, Nomor Telepon/WhatsApp, NIK, atau Nomor Paspor.
- Melihat riwayat log pembayaran dan sisa tagihan per jamaah.

### ✏️ Update (Edit / Pembaruan Status)
- Klik tombol "Edit Data" untuk mengubah data pribadi, nomor paspor, kamar hotel, atau paket yang dipilih.
- Klik tombol "Kasir / Pembayaran" untuk menginput penerimaan dana DP atau Pelunasan.

### 🗑️ Delete (Hapus Data)
- Hapus data pendaftaran jamaah yang dibatalkan melalui opsi tindakan di baris tabel.

### ✨ Fitur Khusus & Otomasi
- Cetak Kuitansi Pembayaran & Invoice Digital Resmi bertanda tangan travel.

## 🛠️ Langkah-Langkah Penggunaan

1. Masuk ke menu CRM > Data Jamaah.
2. Cari nama jamaah yang melakukan transfer pembayaran.
3. Klik tombol "Detail / Kasir" ➔ Input nominal uang yang masuk dan pilih rekening bank tujuan.
4. Klik "Simpan Pembayaran" ➔ Sistem otomatis memutakhirkan status menjadi Lunas atau Sisa Piutang.

---
*Buku Panduan Resmi Sistem Travel Umroh Multi-Tenant.*
