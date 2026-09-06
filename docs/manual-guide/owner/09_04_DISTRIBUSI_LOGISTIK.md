# Distribusi & Serah Terima Logistik Perlengkapan

> **Target Peran**: `Owner (Level 1)` | **Login Akun**: `test@example.com`
> **Tahapan Alur**: `4. Eksekusi & Serah Terima Perlengkapan` | **Kategori**: `Operasional Gudang` | **Rute / URL**: `/crm/logistics`

## 📋 Deskripsi Fitur
Modul serah terima barang perlengkapan ibadah (koper bagasi, kain ihram/mukena, buku doa, id card) kepada jamaah yang telah melunasi pembayaran.

## 🖼️ Tampilan Antarmuka Utama

![Tampilan Distribusi & Serah Terima Logistik Perlengkapan (Light)](screenshots/light/04_distribusi_logistik.webp#gh-light-mode-only)
![Tampilan Distribusi & Serah Terima Logistik Perlengkapan (Dark)](screenshots/dark/04_distribusi_logistik.webp#gh-dark-mode-only)

## 🗂️ Tampilan Drawer, Modal & Aksi Detail

### 📸 Tampilan Drawer Serah Terima

![Tampilan Drawer Serah Terima (Light)](screenshots/light/04_distribusi_logistik_drawer_serah_terima.webp#gh-light-mode-only)
![Tampilan Drawer Serah Terima (Dark)](screenshots/dark/04_distribusi_logistik_drawer_serah_terima.webp#gh-dark-mode-only)

## ⚡ Aksi & Fitur Lengkap (CRUD Matrix)

### 🔍 Read (Lihat / Pencarian / Filter Data)
- Melihat daftar jamaah per jadwal keberangkatan beserta status kelengkapan perlengkapannya.
- Buka laci detail serah terima untuk memeriksa daftar item perlengkapan.

### ✏️ Update (Edit / Pembaruan Status)
- Centang (checklist) item perlengkapan yang diserahkan fisik kepada jamaah.
- Simpan status serah terima barang secara realtime.

### ✨ Fitur Khusus & Otomasi
- Otomatis memotong jumlah stok fisik di modul Inventaris Gudang saat item dicentang.

## 🛠️ Langkah-Langkah Penggunaan

1. Buka menu CRM > Logistik Jamaah.
2. Klik kartu jamaah yang ingin diserahkan perlengkapannya.
3. Centang item yang diserahkan ke jamaah (misal: Koper, Batik, Kain Ihram).
4. Klik Simpan untuk memperbarui rekaman logistik.

---
*Buku Panduan Resmi Sistem Travel Umroh Multi-Tenant.*
