# Panduan Pengerjaan — HajjFlow Pro

> Sistem manajemen perjalanan Haji & Umroh berbasis SaaS multi-tenant.  
> Stack: **Laravel 13 + Inertia.js v2 + React 18 + TypeScript + PostgreSQL**

---

## Daftar Isi

1. [Tech Stack](#1-tech-stack)
2. [Struktur Proyek](#2-struktur-proyek)
3. [Menjalankan Proyek](#3-menjalankan-proyek)
4. [Konvensi Kode](#4-konvensi-kode)
5. [Arsitektur Frontend](#5-arsitektur-frontend)
6. [Arsitektur Backend](#6-arsitektur-backend)
7. [Database & Multi-Tenant](#7-database--multi-tenant)
8. [Routing](#8-routing)
9. [Validasi Form (Zod)](#9-validasi-form-zod)
10. [Autentikasi & RBAC](#10-autentikasi--rbac)
11. [Alur Kerja Pengembangan](#11-alur-kerja-pengembangan)
12. [Modul yang Ada](#12-modul-yang-ada)
13. [Hal yang Belum Selesai](#13-hal-yang-belum-selesai)

---

## 1. Tech Stack

| Layer | Teknologi | Versi |
|---|---|---|
| Backend framework | Laravel | 13.x |
| PHP | PHP | 8.3 |
| Frontend adapter | Inertia.js | 2.x |
| UI framework | React | 18.x |
| Bahasa frontend | TypeScript | 5.x |
| Database | PostgreSQL | 16.x |
| Styling | Tailwind CSS | 3.x |
| Komponen UI | shadcn/ui (Base UI) | - |
| Ikon | Lucide React | 1.x |
| Validasi frontend | Zod | 4.x |
| Package manager JS | **bun** (untuk install), npm (untuk build/dev) |
| Code formatter PHP | Laravel Pint | 1.x |
| Build tool | Vite | 8.x |

---

## 2. Struktur Proyek

```
travel/
├── app/
│   └── Http/
│       └── Controllers/
│           ├── Auth/           # Login, Register, Reset Password
│           ├── CRM/            # Kanban board, guest registration
│           ├── Inventaris/     # Stok & log perlengkapan
│           ├── Keagenan/       # Mitra agen & komisi
│           ├── Pembayaran/     # Verifikasi transfer
│           ├── Settings/       # Menu management
│           └── ProfileController.php
├── database/
│   ├── migrations/             # Semua migrasi tabel
│   └── seeders/
│       └── DatabaseSeeder.php  # Menu + tenant seed
├── resources/
│   └── js/
│       ├── Components/
│       │   ├── Layouts/
│       │   │   ├── PageLayout.tsx      # ⭐ Layout utama semua halaman
│       │   │   ├── AuthenticatedLayout.tsx
│       │   │   └── GuestLayout.tsx
│       │   ├── ui/                     # shadcn/ui components
│       │   ├── app-sidebar.tsx         # Sidebar navigasi
│       │   ├── nav-user.tsx            # User dropdown + logout
│       │   └── team-switcher.tsx       # Tenant switcher
│       ├── Pages/
│       │   ├── Auth/           # Login, Register, dll
│       │   ├── CRM/            # KanbanBoard, GuestRegisterForm
│       │   ├── Inventory/      # Inventory.tsx
│       │   ├── Keagenan/       # Agents, Commissions
│       │   ├── Pembayaran/     # VerifyList
│       │   ├── Profile/        # Edit profile
│       │   ├── Settings/       # Menu management
│       │   └── Dashboard.tsx
│       ├── lib/
│       │   └── schemas.ts      # ⭐ Semua Zod schema validasi
│       └── Types/              # TypeScript interfaces
└── routes/
    └── web.php
```

---

## 3. Menjalankan Proyek

### Setup awal
```bash
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
```

### Development (jalankan bersamaan)
```bash
# Terminal 1 — Laravel server
php artisan serve

# Terminal 2 — Vite dev server (hot reload)
npm run dev

# Atau keduanya sekaligus
composer run dev
```

### Build production
```bash
npm run build
```

### Install package JS baru
```bash
# SELALU gunakan bun untuk install
bun add <package-name>
bun add -D <package-name>   # dev dependency
```

### Format PHP (wajib setelah edit file PHP)
```bash
vendor/bin/pint --dirty --format agent
```

### Jalankan test
```bash
php artisan test --compact
# atau filter spesifik:
php artisan test --filter=NamaTest --compact
```

---

## 4. Konvensi Kode

### PHP
- Gunakan **PHP 8 constructor property promotion**
- **Curly braces selalu** untuk control structure, meskipun satu baris
- Return type hints wajib di semua method: `function foo(User $user): bool`
- PHPDoc block untuk dokumentasi, bukan inline comment
- Jalankan `vendor/bin/pint --dirty --format agent` setelah edit file PHP apapun

### TypeScript / React
- Semua halaman baru **WAJIB menggunakan `PageLayout`** dari `@/Components/Layouts/PageLayout`
- Gunakan **design tokens** (`bg-card`, `border-border`, `text-foreground`, `text-muted-foreground`) bukan hardcode warna `gray-*`
- Validasi form **WAJIB menggunakan Zod** — tambahkan schema di `resources/js/lib/schemas.ts`
- Tidak ada `max-w-*` yang membatasi konten di dalam `PageLayout` — konten full-width dengan padding saja
- Enum / konstanta: gunakan TitleCase

---

## 5. Arsitektur Frontend

### PageLayout — Pola Wajib

Semua halaman dashboard **harus** menggunakan `PageLayout`. Jangan menulis ulang `SidebarProvider + AppSidebar + SidebarInset` secara manual.

```tsx
import PageLayout from '@/Components/Layouts/PageLayout';

export default function MyPage({ data }: Props) {
    return (
        <PageLayout
            title="Judul Tab Browser"
            breadcrumbParent="Modul Induk"   // optional
            breadcrumbPage="Nama Sub-halaman"
            // contentClass default: "p-6 md:p-8 space-y-6"
            // Untuk kanban / full-height:
            // contentClass="p-6 md:p-8 flex flex-col gap-4 h-[calc(100vh-4rem)] overflow-hidden"
        >
            {/* Konten halaman langsung di sini */}
        </PageLayout>
    );
}
```

### Struktur konten standar dalam PageLayout

```tsx
{/* 1. Page header: judul + action button */}
<div className="flex justify-between items-start">
    <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Judul</h1>
        <p className="text-sm text-muted-foreground mt-1">Deskripsi singkat.</p>
    </div>
    <button className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black ...">
        Tambah Data
    </button>
</div>

{/* 2. Tabel data */}
<div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
    <table className="w-full text-left border-collapse">
        <thead>
            <tr className="border-b border-border bg-muted/40">
                <th className="px-6 py-4 text-sm font-semibold text-foreground">Kolom</th>
            </tr>
        </thead>
        <tbody className="divide-y divide-border">
            {/* rows */}
        </tbody>
    </table>
</div>
```

### Modal standar

```tsx
{isOpen && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
        <div className="bg-card border border-border rounded-xl shadow-xl max-w-md w-full overflow-hidden">
            <div className="p-6 border-b border-border flex justify-between items-center">
                <h3 className="text-lg font-bold text-foreground">Judul Modal</h3>
                <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* form fields */}
            </form>
        </div>
    </div>
)}
```

---

## 6. Arsitektur Backend

### Controller — Pola Resource

Buat controller dengan Artisan:
```bash
php artisan make:controller NamaModul/NamaController --resource --no-interaction
```

Controller tidak boleh berisi logika bisnis kompleks — delegasikan ke Service class jika perlu.

```php
// Contoh controller sederhana
class InventarisController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Inventory/Inventory', [
            'items' => InventarisItem::all(),
            'logs'  => TransaksiLog::with(['inventaris', 'jamaah'])->latest()->get(),
        ]);
    }
}
```

### Response Inertia

```php
// Render halaman
return Inertia::render('NamaPage/NamaKomponen', ['data' => $data]);

// Redirect setelah mutasi
return redirect()->route('nama.route')->with('success', 'Pesan sukses');
```

---

## 7. Database & Multi-Tenant

### Tabel utama

| Tabel | Deskripsi |
|---|---|
| `tenants` | Data travel (multi-tenant) |
| `users` | User dengan role (Owner, Admin, Agen) |
| `pakets` | Paket umroh/haji |
| `jamaah` | Calon jamaah (pilgrim) |
| `crm_stages` | Tahapan pipeline CRM |
| `pembayarans` | Transaksi pembayaran |
| `rekening_tenants` | Rekening bank travel |
| `inventaris_items` | Barang inventaris |
| `transaksi_logs` | Log keluar-masuk stok |
| `mitra_agens` | Tabel pivot agen |
| `commissions` | Komisi agen |
| `menus` | Menu navigasi sidebar (parent-child) |

### Seeder

```bash
php artisan db:seed
# atau reset total:
php artisan migrate:fresh --seed
```

File: `database/seeders/DatabaseSeeder.php`
Berisi: data tenant demo, user Owner, paket, CRM stages, dan struktur menu sidebar.

---

## 8. Routing

Semua route ada di `routes/web.php`.

| Route | Method | Nama Route |
|---|---|---|
| `/dashboard` | GET | `dashboard` |
| `/crm` | GET | `crm.index` |
| `/crm/jamaah/{jamaah}/stage` | PATCH | `crm.update-stage` |
| `/finance/payment` | GET | `payment.index` |
| `/finance/payment/{pembayaran}/verify` | POST | `payment.verify` |
| `/inventaris` | GET/POST/PUT | `inventaris.*` |
| `/agents` | GET/POST | `keagenan.agents.*` |
| `/commissions` | GET/PUT | `keagenan.commissions.*` |
| `/profile` | GET/PATCH/DELETE | `profile.*` |
| `/settings/menus` | GET/PUT | `settings.menus.*` |
| `/register/{email}` | GET | `crm.guest-register-form` |
| `/register/submit` | POST | `crm.guest-register-submit` |

### Memanggil route di frontend (Ziggy)
```tsx
import { route } from 'ziggy-js';

route('inventaris.store')         // → '/inventaris'
route('inventaris.update', id)    // → '/inventaris/5'
```

---

## 9. Validasi Form (Zod)

### File schema: `resources/js/lib/schemas.ts`

Semua schema validasi ada di satu file terpusat. **Tambahkan schema baru di sini**, jangan membuat file validasi terpisah.

### Cara pakai di form baru

```tsx
import { useForm } from '@inertiajs/react';
import { mySchema, zodErrors } from '@/lib/schemas';

export default function MyForm() {
    const { data, setData, post, errors, setError } = useForm({
        name: '',
        email: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // 1. Validasi client-side
        const clientErrors = zodErrors(mySchema, data);
        if (Object.keys(clientErrors).length > 0) {
            setError(clientErrors as any);
            return; // batalkan submit
        }

        // 2. Kirim ke server hanya jika lolos
        post(route('my.route'));
    };
}
```

### Menambah schema baru

```ts
// Di resources/js/lib/schemas.ts — tambahkan di section yang relevan:

export const myNewSchema = z.object({
    name: z.string().min(2, 'Nama minimal 2 karakter.'),
    email: z.email({ error: 'Email tidak valid.' }),
    amount: z.number().positive('Nominal harus positif.'),
});
```

### Schema yang tersedia

| Schema | Digunakan di |
|---|---|
| `loginSchema` | `Auth/Login.tsx` |
| `registerSchema` | `Auth/Register.tsx` |
| `forgotPasswordSchema` | `Auth/ForgotPassword.tsx` |
| `resetPasswordSchema` | `Auth/ResetPassword.tsx` (belum diterapkan) |
| `updateProfileSchema` | `Profile/Partials/UpdateProfileInformationForm.tsx` |
| `updatePasswordSchema` | `Profile/Partials/UpdatePasswordForm.tsx` |
| `guestRegisterSchema` | `CRM/GuestRegisterForm.tsx` |
| `agentSchema` | `Keagenan/Agents.tsx` |
| `inventarisSchema` | `Inventory/Inventory.tsx` |

---

## 10. Autentikasi & RBAC

### Role User

| Role | Akses |
|---|---|
| `Owner` | Full akses semua modul + Settings |
| `Admin` | Akses operasional (CRM, Keuangan, Inventaris, Keagenan) |
| `Agen` | Hanya lihat komisi miliknya |

### Menu berbasis database

Menu navigasi sidebar dikontrol via tabel `menus` (bukan hardcode).
Struktur parent → child (parent_id):

```
Dashboard
CRM (Leads Kanban)
Keuangan
  └─ Verifikasi Pembayaran
Keagenan & Komisi
  ├─ Daftar Mitra Agen
  └─ Pembagian Komisi
Inventaris / Logistik
  └─ Stok & Log Perlengkapan
Settings Travel
```

---

## 11. Alur Kerja Pengembangan

### Membuat fitur baru

```bash
# 1. Buat migrasi tabel
php artisan make:migration create_jadwals_table --no-interaction

# 2. Buat model + factory + seeder
php artisan make:model Jadwal -fs --no-interaction

# 3. Buat controller
php artisan make:controller Jadwal/JadwalController --resource --no-interaction

# 4. Tambah route di routes/web.php

# 5. Jalankan migrasi
php artisan migrate

# 6. Buat halaman React di resources/js/Pages/Jadwal/Jadwal.tsx
#    Gunakan PageLayout sebagai wrapper!

# 7. Format PHP
vendor/bin/pint --dirty --format agent

# 8. Build / dev server
npm run build
```

### Checklist sebelum commit

- [ ] Semua file PHP diformat: `vendor/bin/pint --dirty --format agent`
- [ ] Halaman baru menggunakan `PageLayout`
- [ ] Form baru memiliki schema Zod di `lib/schemas.ts`
- [ ] `npm run build` sukses tanpa error TypeScript
- [ ] Test ditambahkan/diperbarui: `php artisan test --compact`

---

## 12. Modul yang Ada

| Modul | URL | Status |
|---|---|---|
| Dashboard | `/dashboard` | ✅ Ada |
| CRM Leads (Kanban) | `/crm` | ✅ Ada |
| Guest Registration | `/register/{email}` | ✅ Ada |
| Verifikasi Pembayaran | `/finance/payment` | ✅ Ada |
| Daftar Mitra Agen | `/agents` | ✅ Ada |
| Pembagian Komisi | `/commissions` | ✅ Ada |
| Inventaris & Logistik | `/inventaris` | ✅ Ada |
| Profile | `/profile` | ✅ Ada |
| Settings Menu | `/settings/menus` | ✅ Ada |

---

## 13. Hal yang Belum Selesai

### Prioritas Tinggi
- [ ] **RBAC middleware** — route protection per role belum diimplementasikan di `web.php`
- [ ] **Sidebar menu dinamis** — `app-sidebar.tsx` masih hardcode, belum fetch dari tabel `menus`
- [ ] **ResetPassword Zod** — `resetPasswordSchema` sudah ada di `schemas.ts` tapi belum diterapkan ke `Auth/ResetPassword.tsx`

### Prioritas Sedang
- [ ] **Dashboard** — masih placeholder, belum ada data agregasi nyata
- [ ] **Upload dokumen** — GuestRegisterForm memiliki UI upload KTP/Passport tapi belum fungsional
- [ ] **Laporan keuangan** — belum ada halaman ringkasan keuangan/PDF export

### Prioritas Rendah
- [ ] **Multi-tenant switching** — `team-switcher.tsx` belum fungsional
- [ ] **Settings rekening bank** — belum ada CRUD rekening & paket di Settings
- [ ] **Dark mode toggle** — belum ada tombol switch

---

## Catatan Penting

> **Pint wajib** — Setiap kali mengubah file PHP, jalankan:
> `vendor/bin/pint --dirty --format agent`

> **bun untuk install** — Gunakan bun, bukan npm/yarn:
> `bun add <package>`

> **Jangan gunakan max-w-* di dalam PageLayout** — Ini yang menyebabkan konten terlihat kecil/sempit. Konten sudah full-width secara default dengan padding `p-6 md:p-8`.

> **Jika UI tidak update** — Pastikan `npm run dev` sedang berjalan, atau jalankan `npm run build`.
