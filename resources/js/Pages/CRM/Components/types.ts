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
        nomor_invoice?: string;
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

export interface DocumentPermissionItem {
    id?: number;
    role_name: string;
    document_type: string;
    is_active?: boolean;
    can_view: boolean;
    can_upload: boolean;
    can_delete: boolean;
}

export interface DocumentTypeDefinition {
    value: string;
    label: string;
    category?: string;
    description?: string;
}

export const DOCUMENT_TYPES: DocumentTypeDefinition[] = [
    { value: 'ktp', label: 'KTP (Identitas)', category: 'Identitas & Kependudukan', description: 'Kartu Tanda Penduduk WNI' },
    { value: 'kk', label: 'Kartu Keluarga (KK)', category: 'Identitas & Kependudukan', description: 'Salinan Kartu Keluarga' },
    { value: 'buku_nikah', label: 'Buku Nikah / Akta Perkawinan', category: 'Identitas & Kependudukan', description: 'Bagi pasangan suami-istri' },
    { value: 'akta_lahir', label: 'Akta Kelahiran', category: 'Identitas & Kependudukan', description: 'Bagi anak atau persyaratan imigrasi' },
    { value: 'paspor', label: 'Buku Paspor Asli', category: 'Dokumen Perjalanan Internasional', description: 'Paspor masa berlaku min. 8 bulan' },
    { value: 'foto', label: 'Pas Foto 4x6 Latar Putih', category: 'Dokumen Perjalanan Internasional', description: 'Fokus wajah 80% latar putih' },
    { value: 'visa', label: 'E-Visa Umroh / Haji', category: 'Dokumen Perjalanan Internasional', description: 'Visa resmi terbitan Kementerian Haji' },
    { value: 'tiket', label: 'Tiket Pesawat PP', category: 'Dokumen Perjalanan Internasional', description: 'E-Ticket penerbangan pulang-pergi' },
    { value: 'siskopatuh', label: 'Bukti SISKOPATUH', category: 'Kesehatan & Regulasi Resmi', description: 'Pengawasan Terpadu Umroh Kemenag' },
    { value: 'vaksin', label: 'Sertifikat Vaksin (Meningitis/Polio)', category: 'Kesehatan & Regulasi Resmi', description: 'Buku kuning atau sertifikat resmi' },
    { value: 'asuransi', label: 'Polis Asuransi Perjalanan', category: 'Kesehatan & Regulasi Resmi', description: 'Polis asuransi perlindungan jamaah' },
    { value: 'surat_rekomendasi', label: 'Surat Rekomendasi Kemenag/Imigrasi', category: 'Legalitas & Dokumen Tambahan', description: 'Surat pengantar paspor umroh' },
    { value: 'surat_mahram', label: 'Surat Pernyataan / Izin Mahram', category: 'Legalitas & Dokumen Tambahan', description: 'Surat izin mahram jamaah wanita' },
    { value: 'other', label: 'Dokumen Lainnya', category: 'Legalitas & Dokumen Tambahan', description: 'Berkas pendukung operasional travel' },
];


