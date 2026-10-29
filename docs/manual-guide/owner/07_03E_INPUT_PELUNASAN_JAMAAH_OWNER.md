---
peran: Owner
kategori: CRM & Kasir
halaman: /crm/customers
ringkasan: Catat pelunasan saat total pembayaran sudah sama dengan harga paket. Jamaah otomatis pindah ke Closing dan komisi agen dicatat.
---

# Mencatat Pelunasan

Catat pelunasan saat total pembayaran sudah sama dengan harga paket. Jamaah otomatis pindah ke Closing dan komisi agen dicatat.

## Cara menggunakan

1. Buka CRM > Data Jamaah → cari jamaah yang akan dilunasi.
2. Klik tombol "Rincian & Bayar" pada baris jamaah.
3. Input sisa nominal pelunasan, pilih rekening, dan unggah bukti transfer terakhir.
4. Klik Simpan → sistem otomatis menandai jamaah sebagai Lunas.
5. Buka Finance > Verifikasi Pembayaran → setujui bukti pelunasan.
6. Jamaah otomatis berpindah ke kolom Closing di papan CRM Kanban.

## Tampilan

![Mencatat Pelunasan](screenshots/light/03e_input_pelunasan_jamaah_owner.webp#gh-light-mode-only)
![Mencatat Pelunasan](screenshots/dark/03e_input_pelunasan_jamaah_owner.webp#gh-dark-mode-only)

### Drawer

![Drawer](screenshots/light/03e_input_pelunasan_jamaah_owner_drawer.webp#gh-light-mode-only)
![Drawer](screenshots/dark/03e_input_pelunasan_jamaah_owner_drawer.webp#gh-dark-mode-only)

## Yang bisa dilakukan

### Menambah data

- Buka laci kasir jamaah → klik "Catat Pelunasan / Cicilan".
- Pilih Tipe Pembayaran: **Pelunasan**.
- Sistem mendeteksi jika total pembayaran = harga paket → status otomatis berubah menjadi **LUNAS (100%)**.

### Fitur lain

- Komisi agen otomatis berpindah ke status Ready_to_Pay setelah lunas terverifikasi.
- Notifikasi dikirim ke dashboard agen bahwa jamaah binaan telah lunas.
