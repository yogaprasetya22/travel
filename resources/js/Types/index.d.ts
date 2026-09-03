export interface Tenant {
    id: number;
    nama_travel: string;
    domain_atau_subdomain: string;
    logo?: string | null;
    created_at?: string;
    updated_at?: string;
}

export interface HierarchyLevelItem {
    id: number;
    tenant_id?: number;
    parent_id?: number | null;
    nama_level: string;
    role_key?: string;
    urutan?: number;
    deskripsi?: string | null;
    wewenang_note?: string | null;
    children?: HierarchyLevelItem[];
}

export interface LandingLinkItem {
    id?: string;
    title: string;
    url: string;
    icon?: string;
    is_highlight?: boolean;
}

export interface SocialLinks {
    instagram?: string;
    tiktok?: string;
    youtube?: string;
    facebook?: string;
}

export interface LeaderItem {
    id: number;
    name: string;
    role: string;
    jabatan?: string | null;
    hierarchy_level_id?: number | null;
}

export interface User {
    id: number;
    tenant_id?: number | null;
    hierarchy_level_id?: number | null;
    name: string;
    email: string;
    email_verified_at?: string;
    nik?: string | null;
    no_hp?: string | null;
    kota?: string | null;
    alamat?: string | null;
    status_karyawan?: string | null;
    nama_bank?: string | null;
    nomor_rekening?: string | null;
    atas_nama_rekening?: string | null;
    avatar?: string | null;
    avatar_url?: string;
    role: string;
    jabatan?: string | null;
    bio?: string | null;
    referral_code?: string;
    landing_links?: LandingLinkItem[] | null;
    social_links?: SocialLinks | null;
    created_by?: number | null;
    created_at?: string;
    updated_at?: string;
    level?: number;
    level_label?: string;
    level_badge?: string;
    jamaah_count?: number;
    total_komisi?: number;
    tenant?: Tenant | null;
    hierarchy_level?: HierarchyLevelItem | null;
    creator?: {
        id: number;
        name: string;
        role: string;
        jabatan?: string | null;
    } | null;
}

export interface RekeningTenant {
    id: number;
    tenant_id: number;
    nama_bank: string;
    nomor_rekening: string;
    atas_nama: string;
    is_active: boolean;
    tenant?: Tenant;
    created_at?: string;
    updated_at?: string;
}

export interface BankItem {
    id: number;
    nama_bank: string;
    nomor_rekening: string;
    atas_nama: string;
    is_active: boolean;
}

export interface Stage {
    id: number;
    nama_tahap: string;
    urutan: number;
    periode_mulai?: string | null;
    periode_selesai?: string | null;
    is_active?: boolean;
}

export interface CrmStage {
    id: number;
    tenant_id: number;
    nama_tahap: string;
    urutan: number;
    tenant?: Tenant;
    created_at?: string;
    updated_at?: string;
}

export interface PackageItem {
    id: number;
    nama_paket: string;
    harga: number;
    komisi_flat: number;
    komisi_persentase: number;
    periode_mulai?: string | null;
    periode_selesai?: string | null;
    is_active?: boolean;
    inventaris?: Array<{
        id: number;
        nama_barang: string;
    }>;
}

export interface Paket {
    id: number;
    tenant_id: number;
    nama_paket: string;
    harga: number;
    komisi_flat: number;
    komisi_persentase: number;
    tenant?: Tenant;
    created_at?: string;
    updated_at?: string;
}

export interface Inventaris {
    id: number;
    tenant_id: number;
    nama_barang: string;
    stok_tersedia: number;
    stok_minimum: number;
    tenant?: Tenant;
    created_at?: string;
    updated_at?: string;
}

export interface InventoryItem {
    id: number;
    nama_barang: string;
}

export interface AgentJamaahItem {
    id: number;
    nama_lengkap: string;
    no_hp: string;
    email?: string | null;
    nik?: string | null;
    nama_paket: string;
    harga_paket: number;
    total_paid: number;
    sisa_tagihan: number;
    status_bayar: 'Lunas' | 'DP Terbayar' | 'Belum Bayar';
    stage: string;
    tanggal_keberangkatan?: string | null;
    created_at: string;
}

export interface Jamaah {
    id: number;
    tenant_id: number;
    agen_id?: number | null;
    crm_stage_id: number;
    nama_lengkap: string;
    nik?: string | null;
    no_hp: string;
    email?: string | null;
    paket_id: number;
    catatan_admin?: string | null;
    tenant?: Tenant;
    agen?: User | null;
    crm_stage?: CrmStage;
    paket?: Paket;
    created_at?: string;
    updated_at?: string;
}

export interface Pembayaran {
    id: number;
    tenant_id: number;
    jamaah_id: number;
    rekening_tenant_id: number;
    tipe_pembayaran: 'DP' | 'Cicilan' | 'Lunas';
    nominal: number;
    bukti_transfer?: string | null;
    status_verifikasi: 'Pending' | 'Verified' | 'Rejected';
    verified_by?: number | null;
    tenant?: Tenant;
    jamaah?: Jamaah;
    rekening_tenant?: RekeningTenant;
    verified_by_user?: User | null;
    created_at?: string;
    updated_at?: string;
}

export interface KomisiAgen {
    id: number;
    tenant_id: number;
    agen_id: number;
    jamaah_id: number;
    nominal_komisi: number;
    status_pencairan: 'Pending' | 'Ready_to_Pay' | 'Paid';
    tenant?: Tenant;
    agen?: User;
    jamaah?: Jamaah;
    created_at?: string;
    updated_at?: string;
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User;
        active_tenant?: Tenant | null;
        tenants?: Tenant[];
    };
};
