# Manajemen Staf Internal & Hierarki Pengguna

> **Target Peran**: `Owner (Level 1)` | **Login Akun**: `test@example.com`
> **Tahapan Alur**: `1. Setup & Konfigurasi Awal` | **Kategori**: `Pengaturan Akun` | **Rute / URL**: `/settings/users`

## 📋 Deskripsi Fitur
Pengelolaan akun login staf kantor internal (Admin, Keuangan, Kasir) dan pengaturan pohon hierarki atasan-bawahan.

## 🖼️ Tampilan Antarmuka Utama

![Tampilan Manajemen Staf Internal & Hierarki Pengguna (Light)](screenshots/11_pengaturan_pengguna_dan_level_light.webp#gh-light-mode-only)
![Tampilan Manajemen Staf Internal & Hierarki Pengguna (Dark)](screenshots/11_pengaturan_pengguna_dan_level_dark.webp#gh-dark-mode-only)

## ⚡ Aksi & Fitur Lengkap (CRUD Matrix)

### ➕ Create (Tambah / Input Baru)
- Klik "+ Tambah Level" untuk menambah tingkatan hierarki baru.
- Buka laci detail level dan klik "+ Tambah User" untuk menambah akun staf baru.

### 🔍 Read (Lihat / Pencarian / Filter Data)
- Melihat bagan visual rantai komando jabatan per tenant.
- Klik pil tingkatan jabatan untuk membuka laci pengguna di level tersebut.

### ✏️ Update (Edit / Pembaruan Status)
- Pindahkan atasan (*Reassign*) staf untuk merestrukturisasi hierarki.

### 🗑️ Delete (Hapus Data)
- Hapus atau nonaktifkan akses akun staf yang sudah tidak bekerja.

## 🛠️ Langkah-Langkah Penggunaan

1. Buka menu Pengaturan > Hirarki Pengguna & Level.
2. Klik pil level jabatan untuk membuka laci anggota di level tersebut.
3. Gunakan tombol "+ Tambah User" untuk memberikan hak akses staf baru.

---
*Buku Panduan Resmi Sistem Travel Umroh Multi-Tenant.*
