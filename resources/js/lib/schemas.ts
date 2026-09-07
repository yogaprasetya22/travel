import { z } from 'zod';

// ─── Auth ────────────────────────────────────────────────────────────────────

export const loginSchema = z.object({
    email: z.email({ error: 'Alamat email tidak valid.' }),
    password: z.string().min(1, 'Password tidak boleh kosong.'),
    remember: z.boolean(),
});

export const registerSchema = z.object({
    name: z.string().min(2, 'Nama minimal 2 karakter.'),
    email: z.email({ error: 'Alamat email tidak valid.' }),
    password: z.string().min(8, 'Password minimal 8 karakter.'),
    password_confirmation: z.string(),
}).refine((d) => d.password === d.password_confirmation, {
    message: 'Konfirmasi password tidak cocok.',
    path: ['password_confirmation'],
});

export const forgotPasswordSchema = z.object({
    email: z.email({ error: 'Alamat email tidak valid.' }),
});

export const resetPasswordSchema = z.object({
    password: z.string().min(8, 'Password minimal 8 karakter.'),
    password_confirmation: z.string(),
}).refine((d) => d.password === d.password_confirmation, {
    message: 'Konfirmasi password tidak cocok.',
    path: ['password_confirmation'],
});

// ─── Profile ─────────────────────────────────────────────────────────────────

export const updateProfileSchema = z.object({
    name: z.string().min(2, 'Nama minimal 2 karakter.'),
    email: z.email({ error: 'Alamat email tidak valid.' }),
    no_hp: z.string().max(30).optional().nullable(),
    kota: z.string().max(100).optional().nullable(),
    bio: z.string().max(1000, 'Bio maksimal 1000 karakter.').optional().nullable(),
    landing_links: z.array(z.object({
        title: z.string().min(1, 'Judul link wajib diisi'),
        url: z.string().min(1, 'URL wajib diisi'),
        icon: z.string().optional(),
        is_highlight: z.boolean().optional(),
    })).optional().nullable(),
    social_links: z.object({
        instagram: z.string().optional().nullable(),
        tiktok: z.string().optional().nullable(),
        youtube: z.string().optional().nullable(),
        facebook: z.string().optional().nullable(),
    }).optional().nullable(),
});

export const updatePasswordSchema = z.object({
    current_password: z.string().min(1, 'Password saat ini tidak boleh kosong.'),
    password: z.string().min(8, 'Password baru minimal 8 karakter.'),
    password_confirmation: z.string(),
}).refine((d) => d.password === d.password_confirmation, {
    message: 'Konfirmasi password tidak cocok.',
    path: ['password_confirmation'],
});

// ─── CRM ─────────────────────────────────────────────────────────────────────

export const guestRegisterSchema = z.object({
    nama_lengkap: z.string().min(2, 'Nama lengkap minimal 2 karakter.'),
    nik: z.string().regex(/^\d{16}$/, 'NIK harus 16 digit angka.').optional().or(z.literal('')),
    no_hp: z.string().min(9, 'Nomor HP minimal 9 karakter.').regex(/^[0-9+\-\s]+$/, 'Format nomor HP tidak valid.'),
    email: z.string().email('Alamat email tidak valid.').optional().or(z.literal('')),
    paket_id: z.string().min(1, 'Pilih paket umroh terlebih dahulu.'),
});

export const crmLeadSchema = z.object({
    nama_lengkap: z.string().min(2, 'Nama lengkap calon jamaah minimal 2 karakter.'),
    nik: z.string().regex(/^\d{16}$/, 'NIK harus tepat 16 digit angka.').optional().or(z.literal('')),
    no_hp: z.string().min(9, 'Nomor HP minimal 9 karakter.').max(20, 'Nomor HP maksimal 20 karakter.').regex(/^[0-9+\-\s]+$/, 'Format nomor HP tidak valid.'),
    email: z.string().email('Alamat email tidak valid.').optional().or(z.literal('')),
    paket_id: z.string().min(1, 'Pilih paket umroh terlebih dahulu.'),
    agen_id: z.string().optional().or(z.literal('')),
    tanggal_keberangkatan: z.string().optional().or(z.literal('')),
    catatan_admin: z.string().max(1000, 'Catatan maksimal 1000 karakter.').optional().or(z.literal('')),
    file_ktp: z.any().optional(),
    file_kk: z.any().optional(),
    file_foto: z.any().optional(),
    file_paspor: z.any().optional(),
});

// ─── Keagenan ────────────────────────────────────────────────────────────────

export const agentSchema = z.object({
    name: z.string().min(2, 'Nama agen minimal 2 karakter.'),
    email: z.email({ error: 'Alamat email tidak valid.' }),
    password: z.string().min(8, 'Password minimal 8 karakter.'),
});

// ─── Inventaris ──────────────────────────────────────────────────────────────

export const inventarisSchema = z.object({
    nama_barang: z.string().min(2, 'Nama barang minimal 2 karakter.'),
    sku: z.string().optional(),
    kategori: z.string().optional(),
    satuan: z.string().optional(),
    harga_pokok: z.number().min(0, 'Harga pokok tidak boleh negatif.').optional(),
    stok_tersedia: z.number().int().min(0, 'Stok tidak boleh negatif.').optional(),
    stok_minimum: z.number().int().min(0, 'Batas minimum tidak boleh negatif.'),
    lokasi_rak: z.string().optional(),
});

// ─── Helper: flatten ZodError into a Record<string, string> ─────────────────

export type FormErrors<T extends object> = Partial<Record<keyof T, string>>;

export function zodErrors<T extends object>(
    schema: z.ZodType<T>,
    data: unknown
): FormErrors<T> {
    const result = schema.safeParse(data);
    if (result.success) return {};
    const out: Record<string, string> = {};
    for (const issue of result.error.issues) {
        const key = issue.path[0] as string;
        if (!out[key]) out[key] = issue.message;
    }
    return out as FormErrors<T>;
}
