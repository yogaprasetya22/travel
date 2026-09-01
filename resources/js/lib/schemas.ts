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
    nik: z.string().length(16, 'NIK harus 16 digit.').regex(/^\d+$/, 'NIK hanya boleh angka.').optional().or(z.literal('')),
    no_hp: z.string().min(9, 'Nomor HP tidak valid.').regex(/^[0-9+\-\s]+$/, 'Format nomor HP tidak valid.'),
    email: z.email({ error: 'Alamat email tidak valid.' }),
    paket_id: z.string().min(1, 'Pilih paket umroh terlebih dahulu.'),
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
    stok_tersedia: z.number().int().min(0, 'Stok tidak boleh negatif.'),
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
