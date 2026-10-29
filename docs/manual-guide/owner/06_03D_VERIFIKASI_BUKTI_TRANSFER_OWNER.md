---
peran: Owner
kategori: Keuangan & Verifikasi
halaman: /finance/payment
ringkasan: Setujui atau tolak bukti transfer yang diunggah jamaah atau agen. Setelah disetujui, pembayaran tercatat resmi di kas travel.
---

# Verifikasi Bukti Transfer

Setujui atau tolak bukti transfer yang diunggah jamaah atau agen. Setelah disetujui, pembayaran tercatat resmi di kas travel.

## Cara menggunakan

1. Login sebagai Owner, buka menu Finance > Verifikasi Pembayaran.
2. Cari baris pembayaran dengan status "Pending" (belum diverifikasi).
3. Klik tombol "Lihat Bukti" untuk melihat pratinjau bukti transfer.
4. Konfirmasi kesesuaian nominal dengan mutasi bank travel.
5. Klik tombol "Setujui" — status berubah menjadi Verified dan sistem memproses komisi agen secara otomatis.

## Tampilan

![Verifikasi Bukti Transfer](screenshots/light/03d_verifikasi_bukti_transfer_owner.webp#gh-light-mode-only)
![Verifikasi Bukti Transfer](screenshots/dark/03d_verifikasi_bukti_transfer_owner.webp#gh-dark-mode-only)

### Pratinjau Bukti

![Pratinjau Bukti](screenshots/light/03d_verifikasi_bukti_transfer_owner_pratinjau_bukti.webp#gh-light-mode-only)
![Pratinjau Bukti](screenshots/dark/03d_verifikasi_bukti_transfer_owner_pratinjau_bukti.webp#gh-dark-mode-only)

## Yang bisa dilakukan

### Melihat dan mencari

- Melihat semua pengajuan pembayaran dengan status Pending Verifikasi yang menunggu konfirmasi.
- Klik "Lihat Bukti" untuk membuka pratinjau lembar foto/scan transfer bank asli.

### Mengubah data

- Klik tombol "Setujui" untuk mengesahkan pembayaran — status berubah ke Verified.
- Klik tombol "Tolak" jika bukti transfer tidak valid atau dana belum masuk rekening.

### Fitur lain

- Setelah diverifikasi, komisi agen terkait otomatis berstatus Eligible (siap dicairkan).
- Jamaah yang sudah Lunas total otomatis pindah ke stage Closing di Kanban CRM.

## Catatan

- Selalu cocokkan nominal yang tertera di bukti transfer dengan mutasi rekening bank resmi sebelum menyetujui.
