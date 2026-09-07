export interface JamaahDocItem {
    id: number;
    type: string;
    title: string | null;
    file_path: string;
    file_name: string;
    mime_type: string | null;
    file_size: number | null;
    notes: string | null;
    url: string | null;
    is_image: boolean;
    is_pdf: boolean;
    created_at: string;
    uploader?: {
        id: number;
        name: string;
    } | null;
}

export interface Customer {
    id: number;
    nama_lengkap: string;
    jenis_kelamin?: string | null;
    tempat_lahir?: string | null;
    tanggal_lahir?: string | null;
    nik: string | null;
    alamat_ktp?: string | null;
    alamat_domisili?: string | null;
    golongan_darah?: string | null;
    status_pernikahan?: string | null;
    riwayat_penyakit?: string | null;
    kontak_darurat_nama?: string | null;
    kontak_darurat_hp?: string | null;
    kontak_darurat_hubungan?: string | null;
    nomor_paspor: string | null;
    crm_stage_id?: number;
    no_hp: string;
    email: string | null;
    catatan_admin: string | null;
    tanggal_keberangkatan: string | null;
    paket: {
        id: number;
        nama_paket: string;
        harga: number;
    };
    agen: {
        id: number;
        name: string;
        email?: string;
    } | null;
    documents?: JamaahDocItem[];
    pembayaran: Array<{
        id: number;
        nominal: number;
        tipe_pembayaran: string;
        status_verifikasi: string;
        bukti_transfer?: string | null;
        rekening_tenant_id?: number | null;
        updated_at?: string;
        created_at: string;
    }>;
    komisi_agen: Array<{
        id: number;
        nominal_komisi: number;
        status_pencairan: string;
    }>;
    inventaris_transaksi: Array<{
        id: number;
        qty: number;
        inventaris: {
            nama_barang: string;
        };
    }>;
    stage_logs?: Array<{
        id: number;
        user?: {
            id: number;
            name: string;
        } | null;
        from_stage?: {
            id: number;
            nama_tahap: string;
        } | null;
        to_stage: {
            id: number;
            nama_tahap: string;
        };
        catatan: string | null;
        created_at: string;
    }>;
}

export interface BankAccount {
    id: number;
    nama_bank: string;
    nomor_rekening: string;
    atas_nama: string;
}

export const DOCUMENT_TYPES = [
    { value: 'ktp', label: 'KTP (Identitas)' },
    { value: 'kk', label: 'Kartu Keluarga (KK)' },
    { value: 'paspor', label: 'Buku Paspor' },
    { value: 'foto', label: 'Pas Foto 4x6' },
    { value: 'visa', label: 'E-Visa Umroh / Haji' },
    { value: 'tiket', label: 'Tiket Pesawat' },
    { value: 'asuransi', label: 'Polis Asuransi' },
    { value: 'siskopatuh', label: 'Bukti SISKOPATUH' },
    { value: 'vaksin', label: 'Buku / Sertifikat Vaksin' },
    { value: 'other', label: 'Dokumen Lainnya' },
];
