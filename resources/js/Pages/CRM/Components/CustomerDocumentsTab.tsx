import React, { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import { UploadCloud, File, Image, Eye, Download, Trash2 } from 'lucide-react';
import { Customer, JamaahDocItem, DOCUMENT_TYPES } from './types';

interface Props {
    customer: Customer;
    onPreviewDoc: (doc: JamaahDocItem) => void;
}

export default function CustomerDocumentsTab({ customer, onPreviewDoc }: Props) {
    const [docFilterType, setDocFilterType] = useState<string>('all');

    const docUploadForm = useForm<{
        type: string;
        title: string;
        file: File | null;
        notes: string;
    }>({
        type: 'ktp',
        title: '',
        file: null,
        notes: '',
    });

    const handleUploadDocument = (e: React.FormEvent) => {
        e.preventDefault();
        if (!customer || !docUploadForm.data.file) return;

        docUploadForm.post(route('crm.jamaah.documents.store', customer.id), {
            preserveScroll: true,
            onSuccess: () => {
                docUploadForm.reset('file', 'title', 'notes');
            },
        });
    };

    const handleDeleteDocument = (docId: number) => {
        if (!confirm('Apakah Anda yakin ingin menghapus dokumen ini?')) return;

        router.delete(route('crm.jamaah.documents.destroy', docId), {
            preserveScroll: true,
        });
    };

    const customerDocuments = customer.documents || [];
    const filteredDocs = docFilterType === 'all'
        ? customerDocuments
        : customerDocuments.filter((d) => d.type === docFilterType);

    return (
        <div className="flex flex-col gap-4">
            {/* Upload Document Box */}
            <div className="p-4 bg-muted/40 rounded-2xl border border-border/80 flex flex-col gap-3">
                <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <UploadCloud className="w-4 h-4 text-primary" /> Unggah Dokumen Baru
                </h4>
                <form onSubmit={handleUploadDocument} className="flex flex-col gap-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <InputLabel value="Tipe Dokumen *" />
                            <select
                                value={docUploadForm.data.type}
                                onChange={(e) => docUploadForm.setData('type', e.target.value)}
                                className="mt-1 block w-full text-xs py-2 px-3 rounded-xl border border-border bg-background"
                            >
                                {DOCUMENT_TYPES.map((dt) => (
                                    <option key={dt.value} value={dt.value}>{dt.label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <InputLabel value="Pilih File (JPG/PNG/PDF maks 10MB) *" />
                            <input
                                type="file"
                                accept=".jpg,.jpeg,.png,.webp,.pdf"
                                onChange={(e) => docUploadForm.setData('file', e.target.files?.[0] || null)}
                                className="mt-1 block w-full text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
                                required
                            />
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <PrimaryButton disabled={docUploadForm.processing || !docUploadForm.data.file}>
                            {docUploadForm.processing ? 'Mengunggah...' : 'Upload Dokumen'}
                        </PrimaryButton>
                    </div>
                </form>
            </div>

            {/* Document Type Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 low-scrollbar">
                <button
                    type="button"
                    onClick={() => setDocFilterType('all')}
                    className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                        docFilterType === 'all'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                    }`}
                >
                    Semua ({customerDocuments.length})
                </button>
                {DOCUMENT_TYPES.map((dt) => {
                    const count = customerDocuments.filter((d) => d.type === dt.value).length;
                    return (
                        <button
                            key={dt.value}
                            type="button"
                            onClick={() => setDocFilterType(dt.value)}
                            className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                                docFilterType === dt.value
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                            }`}
                        >
                            {dt.label} {count > 0 ? `(${count})` : ''}
                        </button>
                    );
                })}
            </div>

            {/* Document Grid List */}
            {filteredDocs.length === 0 ? (
                <div className="p-8 text-center bg-card rounded-2xl border border-dashed border-border/80 text-muted-foreground text-xs">
                    Belum ada dokumen yang diunggah untuk kategori ini.
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {filteredDocs.map((doc) => (
                        <div
                            key={doc.id}
                            className="p-3 bg-card border border-border/80 rounded-xl hover:border-primary/50 transition flex items-center justify-between gap-3 shadow-2xs"
                        >
                            <div
                                onClick={() => onPreviewDoc(doc)}
                                className="flex items-center gap-2.5 overflow-hidden flex-1 cursor-pointer"
                            >
                                <div className={`p-2 rounded-lg ${doc.is_pdf ? 'bg-rose-500/10 text-rose-500' : 'bg-blue-500/10 text-blue-500'}`}>
                                    {doc.is_pdf ? <File className="w-5 h-5" /> : <Image className="w-5 h-5" />}
                                </div>
                                <div className="overflow-hidden flex-1">
                                    <div className="font-bold text-xs text-foreground truncate">
                                        {doc.title || doc.file_name}
                                    </div>
                                    <div className="text-[10px] text-muted-foreground truncate uppercase">
                                        {doc.type} • {doc.file_size ? `${(doc.file_size / 1024).toFixed(0)} KB` : ''}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-1">
                                <button
                                    type="button"
                                    onClick={() => onPreviewDoc(doc)}
                                    className="p-1.5 text-muted-foreground hover:text-primary transition rounded-lg hover:bg-muted cursor-pointer"
                                    title="Preview Dokumen"
                                >
                                    <Eye className="w-4 h-4" />
                                </button>
                                {doc.url && (
                                    <a
                                        href={doc.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-1.5 text-muted-foreground hover:text-primary transition rounded-lg hover:bg-muted cursor-pointer"
                                        title="Buka / Unduh File"
                                    >
                                        <Download className="w-4 h-4" />
                                    </a>
                                )}
                                <button
                                    type="button"
                                    onClick={() => handleDeleteDocument(doc.id)}
                                    className="p-1.5 text-muted-foreground hover:text-rose-500 transition rounded-lg hover:bg-rose-500/10 cursor-pointer"
                                    title="Hapus Dokumen"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
