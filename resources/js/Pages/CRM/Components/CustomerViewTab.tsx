import React from 'react';
import { toRupiah } from '@/Components/CurrencyInput';
import { User, MapPin, Calendar, FileText, ArrowRight, Eye, Edit3 } from 'lucide-react';
import { Customer, JamaahDocItem, DOCUMENT_TYPES } from './types';

interface Props {
    customer: Customer;
    packagePrice?: number;
    onEdit?: (customer: Customer) => void;
    onPreviewDoc: (doc: JamaahDocItem) => void;
    onSwitchToDocuments?: () => void;
}

export default function CustomerViewTab({
    customer,
    packagePrice,
    onEdit,
    onPreviewDoc,
    onSwitchToDocuments,
}: Props) {
    const finalPackagePrice = packagePrice ?? (customer.paket?.harga || 0);
    const customerDocuments = customer.documents || [];

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

            {/* Lampiran Dokumen Persyaratan Card */}
            <div className="bg-card p-4 rounded-2xl border border-border/80 shadow-2xs flex flex-col gap-3">
                <div className="flex items-center justify-between pb-2 border-b border-border/60">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5" /> Berkas Persyaratan ({customerDocuments.length})
                    </h4>
                    <button
                        type="button"
                        onClick={onSwitchToDocuments}
                        className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                    >
                        <span>Kelola Dokumen</span>
                        <ArrowRight className="w-3 h-3" />
                    </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {DOCUMENT_TYPES.filter((dt) => dt.value !== 'other').map((dt) => {
                        const docs = customerDocuments.filter((d) => d.type === dt.value);
                        const hasDocs = docs.length > 0;
                        return (
                            <div
                                key={dt.value}
                                className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition-all ${
                                    hasDocs ? 'bg-muted/30 border-border' : 'bg-muted/10 border-dashed border-border/60 opacity-60'
                                }`}
                            >
                                <span className="font-medium text-foreground">{dt.label}</span>
                                {hasDocs ? (
                                    <div className="flex items-center gap-1">
                                        {docs.map((doc) => (
                                            <button
                                                key={doc.id}
                                                type="button"
                                                onClick={() => onPreviewDoc(doc)}
                                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground font-bold text-[10px] transition cursor-pointer"
                                                title={`Lihat ${doc.file_name}`}
                                            >
                                                <Eye className="w-3 h-3" />
                                                <span>{doc.is_pdf ? 'PDF' : 'IMG'}</span>
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <span className="text-[10px] text-muted-foreground italic">Belum Ada</span>
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
