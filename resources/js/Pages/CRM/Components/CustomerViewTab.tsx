import React, { useState, useRef } from 'react';
import { usePage, router } from '@inertiajs/react';
import { toRupiah } from '@/Components/CurrencyInput';
import {
    User,
    MapPin,
    Calendar,
    FileText,
    ArrowRight,
    Eye,
    Edit3,
    Upload,
    Plus,
    Trash2,
    Loader2,
    CheckCircle2,
    Download,
} from 'lucide-react';
import { Customer, JamaahDocItem, DOCUMENT_TYPES, DocumentPermissionItem } from './types';

interface Props {
    customer: Customer;
    packagePrice?: number;
    onEdit?: (customer: Customer) => void;
    onPreviewDoc: (doc: JamaahDocItem) => void;
    onSwitchToDocuments?: () => void;
    documentPermissions?: DocumentPermissionItem[];
}

export default function CustomerViewTab({
    customer,
    packagePrice,
    onEdit,
    onPreviewDoc,
    onSwitchToDocuments,
    documentPermissions: propPermissions,
}: Props) {
    const pageProps = usePage().props as any;
    const authUser = pageProps.auth?.user;
    const isSuperOrOwner =
        authUser?.is_super_admin ||
        authUser?.role === 'super_admin' ||
        authUser?.role === 'owner_travel' ||
        authUser?.role === 'tenant_owner' ||
        authUser?.role === 'admin_travel';

    const documentPermissions: DocumentPermissionItem[] =
        propPermissions || pageProps.documentPermissions || [];

    const userRole = authUser?.role || 'staff';

    const isTypeActive = (type: string): boolean => {
        const perm = documentPermissions.find((p) => p.document_type === type);
        return perm ? perm.is_active !== false : true;
    };

    const canUploadType = (type: string): boolean => {
        if (!isTypeActive(type)) return false;
        if (isSuperOrOwner) return true;
        const perm = documentPermissions.find(
            (p) => p.role_name === userRole && p.document_type === type
        );
        return perm ? perm.can_upload : userRole !== 'staff';
    };

    const canViewType = (type: string): boolean => {
        if (!isTypeActive(type)) return false;
        if (isSuperOrOwner) return true;
        const perm = documentPermissions.find(
            (p) => p.role_name === userRole && p.document_type === type
        );
        return perm ? perm.can_view : true;
    };

    const canDeleteType = (type: string): boolean => {
        if (!isTypeActive(type)) return false;
        if (isSuperOrOwner) return true;
        const perm = documentPermissions.find(
            (p) => p.role_name === userRole && p.document_type === type
        );
        return perm ? perm.can_delete : false;
    };

    const [uploadingType, setUploadingType] = useState<string | null>(null);
    const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

    const finalPackagePrice = packagePrice ?? (customer.paket?.harga || 0);
    const customerDocuments = (customer.documents || []).filter((d) => canViewType(d.type));

    const handleFileSelect = (type: string, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !customer) return;

        const formData = new FormData();
        formData.append('type', type);
        formData.append('file', file);
        formData.append('title', `${type.toUpperCase()} - ${customer.nama_lengkap}`);

        setUploadingType(type);

        router.post(route('crm.jamaah.documents.store', customer.id), formData, {
            forceFormData: true,
            preserveScroll: true,
            onFinish: () => {
                setUploadingType(null);
                if (fileInputRefs.current[type]) {
                    fileInputRefs.current[type]!.value = '';
                }
            },
        });
    };

    const handleDeleteDoc = (e: React.MouseEvent, doc: JamaahDocItem) => {
        e.stopPropagation();
        if (!canDeleteType(doc.type)) {
            alert('Anda tidak memiliki hak akses untuk menghapus dokumen ini.');
            return;
        }

        if (!confirm(`Hapus berkas ${doc.file_name}?`)) return;

        router.delete(route('crm.jamaah.documents.destroy', doc.id), {
            preserveScroll: true,
        });
    };

    return (
        <div className="flex flex-col gap-4">
            {/* Identitas Diri Card */}
            <div className="bg-card p-4 rounded-2xl border border-border/80 shadow-2xs flex flex-col gap-3">
                <div className="flex items-center justify-between pb-2 border-b border-border/60">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5" /> Identitas Pribadi Calon Jamaah
                    </h4>
                    {onEdit && (
                        <button
                            type="button"
                            onClick={() => onEdit(customer)}
                            className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline cursor-pointer"
                        >
                            <Edit3 className="w-3 h-3" />
                            <span>Edit Biodata</span>
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                        <span className="text-muted-foreground block text-[11px]">Nama Lengkap:</span>
                        <span className="font-bold text-foreground text-sm">{customer.nama_lengkap}</span>
                    </div>
                    <div>
                        <span className="text-muted-foreground block text-[11px]">NIK (KTP 16 Digit):</span>
                        <span className="font-mono font-semibold text-foreground">{customer.nik || '-'}</span>
                    </div>
                    <div>
                        <span className="text-muted-foreground block text-[11px]">Jenis Kelamin:</span>
                        <span className="font-medium text-foreground">
                            {customer.jenis_kelamin === 'L' ? 'Laki-laki' : customer.jenis_kelamin === 'P' ? 'Perempuan' : customer.jenis_kelamin || '-'}
                        </span>
                    </div>
                    <div>
                        <span className="text-muted-foreground block text-[11px]">Tempat, Tanggal Lahir:</span>
                        <span className="font-medium text-foreground">
                            {customer.tempat_lahir || '-'}, {customer.tanggal_lahir ? new Date(customer.tanggal_lahir).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                        </span>
                    </div>
                    <div>
                        <span className="text-muted-foreground block text-[11px]">Nomor Paspor:</span>
                        <span className="font-mono font-bold text-foreground uppercase">{customer.nomor_paspor || 'Belum Ada / Belum Terbit'}</span>
                    </div>
                    <div>
                        <span className="text-muted-foreground block text-[11px]">Status Pernikahan / Gol. Darah:</span>
                        <span className="font-medium text-foreground">{customer.status_pernikahan || '-'} • Gol: {customer.golongan_darah || '-'}</span>
                    </div>
                </div>
            </div>

            {/* Kontak & Domisili Card */}
            <div className="bg-card p-4 rounded-2xl border border-border/80 shadow-2xs flex flex-col gap-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5 pb-2 border-b border-border/60">
                    <MapPin className="w-3.5 h-3.5" /> Kontak, Domisili &amp; Darurat
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                        <span className="text-muted-foreground block text-[11px]">Nomor WhatsApp / HP:</span>
                        <span className="font-bold text-foreground">{customer.no_hp}</span>
                    </div>
                    <div>
                        <span className="text-muted-foreground block text-[11px]">Email:</span>
                        <span className="font-medium text-foreground">{customer.email || '-'}</span>
                    </div>
                    <div className="sm:col-span-2">
                        <span className="text-muted-foreground block text-[11px]">Alamat Lengkap Sesuai KTP:</span>
                        <span className="font-medium text-foreground leading-relaxed">{customer.alamat_ktp || '-'}</span>
                    </div>
                    {customer.alamat_domisili && (
                        <div className="sm:col-span-2">
                            <span className="text-muted-foreground block text-[11px]">Alamat Domisili:</span>
                            <span className="font-medium text-foreground leading-relaxed">{customer.alamat_domisili}</span>
                        </div>
                    )}
                    <div>
                        <span className="text-muted-foreground block text-[11px]">Kontak Darurat:</span>
                        <span className="font-semibold text-foreground">
                            {customer.kontak_darurat_nama || '-'} {customer.kontak_darurat_hubungan ? `(${customer.kontak_darurat_hubungan})` : ''}
                        </span>
                    </div>
                    <div>
                        <span className="text-muted-foreground block text-[11px]">No. HP Darurat:</span>
                        <span className="font-mono text-foreground">{customer.kontak_darurat_hp || '-'}</span>
                    </div>
                </div>
            </div>

            {/* Operasional & Keberangkatan Card */}
            <div className="bg-card p-4 rounded-2xl border border-border/80 shadow-2xs flex flex-col gap-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5 pb-2 border-b border-border/60">
                    <Calendar className="w-3.5 h-3.5" /> Paket &amp; Rencana Keberangkatan
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                        <span className="text-muted-foreground block text-[11px]">Paket Pilihan:</span>
                        <span className="font-bold text-foreground">{customer.paket?.nama_paket}</span>
                    </div>
                    <div>
                        <span className="text-muted-foreground block text-[11px]">Biaya Paket:</span>
                        <span className="font-extrabold text-emerald-600 dark:text-emerald-400 font-mono text-sm">{toRupiah(finalPackagePrice)}</span>
                    </div>
                    <div>
                        <span className="text-muted-foreground block text-[11px]">Jadwal Keberangkatan:</span>
                        <span className="font-bold text-foreground">
                            {customer.tanggal_keberangkatan ? new Date(customer.tanggal_keberangkatan).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Belum Dijadwalkan'}
                        </span>
                    </div>
                    <div>
                        <span className="text-muted-foreground block text-[11px]">Agen Pembimbing:</span>
                        <span className="font-semibold text-primary">{customer.agen ? customer.agen.name : 'Pendaftaran Mandiri / Kantor'}</span>
                    </div>
                    {customer.catatan_admin && (
                        <div className="sm:col-span-2 p-2.5 rounded-xl bg-muted/40 text-[11px] text-foreground/80 italic">
                            Catatan: {customer.catatan_admin}
                        </div>
                    )}
                </div>
            </div>

            {/* Lampiran Dokumen Persyaratan Card with Direct Upload & Multi-Doc View */}
            <div className="bg-card p-4 rounded-2xl border border-border/80 shadow-2xs flex flex-col gap-3">
                <div className="flex items-center justify-between pb-2 border-b border-border/60">
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5" /> Berkas Persyaratan Jamaah ({customerDocuments.length})
                        </h4>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                            Lihat, preview (PDF/Gambar), dan unggah berkas KTP, Paspor, SISKOPATUH, dll langsung di sini.
                        </p>
                    </div>
                    {onSwitchToDocuments && (
                        <button
                            type="button"
                            onClick={onSwitchToDocuments}
                            className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer shrink-0"
                        >
                            <span>Kelola Detail</span>
                            <ArrowRight className="w-3 h-3" />
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {DOCUMENT_TYPES.filter((dt) => canViewType(dt.value)).map((dt) => {
                        const docs = customerDocuments.filter((d) => d.type === dt.value);
                        const hasDocs = docs.length > 0;
                        const canUpload = canUploadType(dt.value);
                        const isUploading = uploadingType === dt.value;

                        return (
                            <div
                                key={dt.value}
                                className={`p-3 rounded-xl border flex flex-col gap-2 text-xs transition-all ${
                                    hasDocs
                                        ? 'bg-card border-border/90 shadow-2xs'
                                        : 'bg-muted/10 border-dashed border-border/60 opacity-80'
                                }`}
                            >
                                <div className="flex items-center justify-between gap-2">
                                    <span className="font-bold text-foreground flex items-center gap-1.5">
                                        {hasDocs && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                                        {dt.label}
                                    </span>

                                    {/* Direct Upload Button */}
                                    {canUpload && (
                                        <div>
                                            <input
                                                type="file"
                                                accept=".jpg,.jpeg,.png,.webp,.pdf"
                                                ref={(el) => (fileInputRefs.current[dt.value] = el)}
                                                onChange={(e) => handleFileSelect(dt.value, e)}
                                                className="hidden"
                                                id={`upload-doc-${dt.value}`}
                                            />
                                            <label
                                                htmlFor={`upload-doc-${dt.value}`}
                                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                                                    isUploading
                                                        ? 'bg-muted text-muted-foreground'
                                                        : 'bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground'
                                                }`}
                                            >
                                                {isUploading ? (
                                                    <>
                                                        <Loader2 className="w-3 h-3 animate-spin" />
                                                        <span>Menyimpan...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Plus className="w-3 h-3" />
                                                        <span>{hasDocs ? 'Tambah File' : 'Upload'}</span>
                                                    </>
                                                )}
                                            </label>
                                        </div>
                                    )}
                                </div>

                                {/* Multi-document list for this type */}
                                {hasDocs ? (
                                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                        {docs.map((doc, dIdx) => (
                                            <div
                                                key={doc.id}
                                                className="inline-flex items-center gap-1 bg-muted/50 hover:bg-muted border border-border/70 rounded-lg p-1 pr-1.5 text-[11px] transition group"
                                            >
                                                <button
                                                    type="button"
                                                    onClick={() => onPreviewDoc(doc)}
                                                    className="inline-flex items-center gap-1 font-semibold text-foreground hover:text-primary cursor-pointer"
                                                    title={`Klik untuk lihat berkas #${dIdx + 1}: ${doc.file_name}`}
                                                >
                                                    <span
                                                        className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase ${
                                                            doc.is_pdf
                                                                ? 'bg-rose-500/10 text-rose-600'
                                                                : 'bg-blue-500/10 text-blue-600'
                                                        }`}
                                                    >
                                                        {doc.is_pdf ? 'PDF' : 'IMG'} {docs.length > 1 ? `#${dIdx + 1}` : ''}
                                                    </span>
                                                    <span className="truncate max-w-[100px] text-[10px]">
                                                        {doc.file_name}
                                                    </span>
                                                </button>

                                                {doc.url && (
                                                    <a
                                                        href={doc.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-muted-foreground hover:text-primary p-0.5"
                                                        title="Download / Buka Tab Baru"
                                                    >
                                                        <Download className="w-3 h-3" />
                                                    </a>
                                                )}

                                                {canDeleteType(doc.type) && (
                                                    <button
                                                        type="button"
                                                        onClick={(e) => handleDeleteDoc(e, doc)}
                                                        className="text-muted-foreground hover:text-rose-500 p-0.5 cursor-pointer"
                                                        title="Hapus file ini"
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <span className="text-[10px] text-muted-foreground italic">
                                        Belum ada dokumen yang diunggah.
                                    </span>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Action Bar */}
            {onEdit && (
                <div className="flex justify-end gap-2 pt-2">
                    <button
                        type="button"
                        onClick={() => onEdit(customer)}
                        className="px-4 py-2.5 bg-primary text-primary-foreground text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs hover:opacity-90 transition cursor-pointer"
                    >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit Data Jamaah Ini</span>
                    </button>
                </div>
            )}
        </div>
    );
}

