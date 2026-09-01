export interface Tenant {
    id: number;
    nama_travel: string;
    domain_atau_subdomain: string;
    logo?: string | null;
    created_at?: string;
    updated_at?: string;
}

export interface User {
    id: number;
    tenant_id?: number | null;
    hierarchy_level_id?: number | null;
    name: string;
    email: string;
    email_verified_at?: string;
    role: string;
    jabatan?: string | null;
    level: number;
    level_label?: string;
    level_badge?: string;
    tenant?: Tenant | null;
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

export interface CrmStage {
    id: number;
    tenant_id: number;
    nama_tahap: string;
    urutan: number;
    tenant?: Tenant;
    created_at?: string;
    updated_at?: string;
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

export interface PaketInventaris {
    id: number;
    paket_id: number;
    inventaris_id: number;
    qty: number;
    created_at?: string;
    updated_at?: string;
}

export interface OverrideKomisiAgen {
    id: number;
    tenant_id: number;
    paket_id: number;
    agen_id: number;
    komisi_flat?: number | null;
    komisi_persentase?: number | null;
    tenant?: Tenant;
    paket?: Paket;
    agen?: User;
    created_at?: string;
    updated_at?: string;
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

export interface InventarisTransaksi {
    id: number;
    tenant_id: number;
    inventaris_id: number;
    jamaah_id?: number | null;
    qty: number;
    tipe: 'IN' | 'OUT';
    tenant?: Tenant;
    inventaris?: Inventaris;
    jamaah?: Jamaah | null;
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
