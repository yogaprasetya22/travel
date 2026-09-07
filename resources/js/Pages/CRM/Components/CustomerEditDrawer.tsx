import React, { useEffect, useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter,
} from '@/Components/ui/sheet';
import { User, MapPin, Phone, Calendar, HeartPulse, Shield, FileText, CheckCircle2, UploadCloud, AlertCircle, Eye } from 'lucide-react';
import type { Customer } from './CustomerDrawer';
import { DOCUMENT_TYPES } from './types';

interface Props {
    customer: Customer | null;
    isOpen: boolean;
    onClose: () => void;
}

export default function CustomerEditDrawer({ customer, isOpen, onClose }: Props) {
    const [docFiles, setDocFiles] = useState<Record<string, File | null>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const editForm = useForm({
        nama_lengkap: '',
        jenis_kelamin: 'L',
        tempat_lahir: '',
        tanggal_lahir: '',
        nik: '',
        alamat_ktp: '',
        alamat_domisili: '',
        golongan_darah: '',
        status_pernikahan: 'Menikah',
        riwayat_penyakit: '',
        kontak_darurat_nama: '',
        kontak_darurat_hp: '',
        kontak_darurat_hubungan: '',
        no_hp: '',
        email: '',
        nomor_paspor: '',
        tanggal_keberangkatan: '',
        catatan_admin: '',
    });

    useEffect(() => {
        if (customer) {
            editForm.setData({
                nama_lengkap: customer.nama_lengkap || '',
                jenis_kelamin: customer.jenis_kelamin || 'L',
                tempat_lahir: customer.tempat_lahir || '',
                tanggal_lahir: customer.tanggal_lahir || '',
                nik: customer.nik || '',
                alamat_ktp: customer.alamat_ktp || '',
                alamat_domisili: customer.alamat_domisili || '',
                golongan_darah: customer.golongan_darah || '',
                status_pernikahan: customer.status_pernikahan || 'Menikah',
                riwayat_penyakit: customer.riwayat_penyakit || '',
                kontak_darurat_nama: customer.kontak_darurat_nama || '',
                kontak_darurat_hp: customer.kontak_darurat_hp || '',
                kontak_darurat_hubungan: customer.kontak_darurat_hubungan || '',
                no_hp: customer.no_hp || '',
                email: customer.email || '',
                nomor_paspor: customer.nomor_paspor || '',
                tanggal_keberangkatan: customer.tanggal_keberangkatan || '',
                catatan_admin: customer.catatan_admin || '',
            });
            editForm.clearErrors();
            setDocFiles({});
        }
    }, [customer, isOpen]);

    const handleFileChange = (type: string, file: File | null) => {
        setDocFiles((prev) => ({
            ...prev,
            [type]: file,
        }));
    };

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!customer) return;

        setIsSubmitting(true);
        const formData = new FormData();
        formData.append('_method', 'PUT');

        Object.entries(editForm.data).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
                formData.append(key, String(value));
            }
        });

        Object.entries(docFiles).forEach(([type, file]) => {
            if (file) {
                formData.append(`doc_files[${type}]`, file);
            }
        });

        router.post(route('crm.jamaah.update', customer.id), formData, {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                setIsSubmitting(false);
                setDocFiles({});
                onClose();
            },
            onError: (errors) => {
                setIsSubmitting(false);
                editForm.setError(errors as any);
            },
        });
    };

    if (!customer) return null;

    return (
        <Sheet open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
            <SheetContent side="right" className="w-full sm:max-w-3xl lg:max-w-5xl flex flex-col justify-between p-0">
                <div className="p-6 border-b border-border/80 bg-muted/20">
                    <SheetHeader>
                        <SheetTitle className="text-lg sm:text-xl font-bold text-foreground flex items-center gap-2">
                            <User className="w-5 h-5 text-primary" />
                            <span>Edit Data Jamaah: {customer.nama_lengkap}</span>
                        </SheetTitle>
                        <SheetDescription className="text-xs text-muted-foreground mt-1">
                            Perbarui identitas biodata, data paspor, kontak darurat, serta catatan operasional jamaah.
                        </SheetDescription>
                    </SheetHeader>
                </div>

                <form id="customer-edit-form" onSubmit={handleUpdate} className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 low-scrollbar">
                    {/* Seksi 1: Data Diri & Identitas */}
                    <div className="bg-card p-4 rounded-2xl border border-border/80 shadow-2xs flex flex-col gap-3.5">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5 pb-2 border-b border-border/60">
                            <User className="w-3.5 h-3.5" /> Identitas Pribadi
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <InputLabel htmlFor="edit_nama_lengkap" value="Nama Lengkap Sesuai KTP / Paspor *" className="text-xs font-semibold" />
                                <TextInput
                                    id="edit_nama_lengkap"
                                    type="text"
                                    value={editForm.data.nama_lengkap}
                                    className="mt-1 block w-full text-xs font-medium"
                                    onChange={(e) => editForm.setData('nama_lengkap', e.target.value)}
                                    required
                                />
                                <InputError message={editForm.errors.nama_lengkap} className="mt-1" />
                            </div>

                            <div>
                                <InputLabel htmlFor="edit_nik" value="NIK (KTP 16 Digit) *" className="text-xs font-semibold" />
                                <TextInput
                                    id="edit_nik"
                                    type="text"
                                    maxLength={16}
                                    value={editForm.data.nik}
                                    className="mt-1 block w-full text-xs font-mono"
                                    onChange={(e) => editForm.setData('nik', e.target.value)}
                                    placeholder="32xxxxxxxxxxxxxx"
                                />
                                <InputError message={editForm.errors.nik} className="mt-1" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                                <InputLabel htmlFor="edit_jenis_kelamin" value="Jenis Kelamin" className="text-xs font-semibold" />
                                <select
                                    id="edit_jenis_kelamin"
                                    value={editForm.data.jenis_kelamin}
                                    onChange={(e) => editForm.setData('jenis_kelamin', e.target.value)}
                                    className="mt-1 block w-full text-xs rounded-xl border border-border bg-background p-2.5 text-foreground focus:ring-primary focus:border-primary"
                                >
                                    <option value="L">Laki-laki</option>
                                    <option value="P">Perempuan</option>
                                </select>
                            </div>

                            <div>
                                <InputLabel htmlFor="edit_tempat_lahir" value="Tempat Lahir" className="text-xs font-semibold" />
                                <TextInput
                                    id="edit_tempat_lahir"
                                    type="text"
                                    value={editForm.data.tempat_lahir}
                                    className="mt-1 block w-full text-xs"
                                    onChange={(e) => editForm.setData('tempat_lahir', e.target.value)}
                                />
                            </div>

                            <div>
                                <InputLabel htmlFor="edit_tanggal_lahir" value="Tanggal Lahir" className="text-xs font-semibold" />
                                <TextInput
                                    id="edit_tanggal_lahir"
                                    type="date"
                                    value={editForm.data.tanggal_lahir}
                                    className="mt-1 block w-full text-xs"
                                    onChange={(e) => editForm.setData('tanggal_lahir', e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                                <InputLabel htmlFor="edit_nomor_paspor" value="Nomor Paspor" className="text-xs font-semibold" />
                                <TextInput
                                    id="edit_nomor_paspor"
                                    type="text"
                                    value={editForm.data.nomor_paspor}
                                    className="mt-1 block w-full text-xs font-mono uppercase"
                                    placeholder="A1234567"
                                    onChange={(e) => editForm.setData('nomor_paspor', e.target.value)}
                                />
                            </div>

                            <div>
                                <InputLabel htmlFor="edit_golongan_darah" value="Golongan Darah" className="text-xs font-semibold" />
                                <select
                                    id="edit_golongan_darah"
                                    value={editForm.data.golongan_darah}
                                    onChange={(e) => editForm.setData('golongan_darah', e.target.value)}
                                    className="mt-1 block w-full text-xs rounded-xl border border-border bg-background p-2.5 text-foreground focus:ring-primary focus:border-primary"
                                >
                                    <option value="">- Belum Ditentukan -</option>
                                    <option value="A">A</option>
                                    <option value="B">B</option>
                                    <option value="AB">AB</option>
                                    <option value="O">O</option>
                                </select>
                            </div>

                            <div>
                                <InputLabel htmlFor="edit_status_pernikahan" value="Status Pernikahan" className="text-xs font-semibold" />
                                <select
                                    id="edit_status_pernikahan"
                                    value={editForm.data.status_pernikahan}
                                    onChange={(e) => editForm.setData('status_pernikahan', e.target.value)}
                                    className="mt-1 block w-full text-xs rounded-xl border border-border bg-background p-2.5 text-foreground focus:ring-primary focus:border-primary"
                                >
                                    <option value="Menikah">Menikah</option>
                                    <option value="Belum Menikah">Belum Menikah</option>
                                    <option value="Duda/Janda">Duda / Janda</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Seksi 2: Kontak & Alamat Domisili */}
                    <div className="bg-card p-4 rounded-2xl border border-border/80 shadow-2xs flex flex-col gap-3.5">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5 pb-2 border-b border-border/60">
                            <Phone className="w-3.5 h-3.5" /> Kontak &amp; Alamat
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <InputLabel htmlFor="edit_no_hp" value="Nomor WhatsApp / HP *" className="text-xs font-semibold" />
                                <TextInput
                                    id="edit_no_hp"
                                    type="text"
                                    value={editForm.data.no_hp}
                                    className="mt-1 block w-full text-xs font-mono"
                                    onChange={(e) => editForm.setData('no_hp', e.target.value)}
                                    required
                                />
                                <InputError message={editForm.errors.no_hp} className="mt-1" />
                            </div>
                            <div>
                                <InputLabel htmlFor="edit_email" value="Alamat Email" className="text-xs font-semibold" />
                                <TextInput
                                    id="edit_email"
                                    type="email"
                                    value={editForm.data.email}
                                    className="mt-1 block w-full text-xs"
                                    onChange={(e) => editForm.setData('email', e.target.value)}
                                />
                                <InputError message={editForm.errors.email} className="mt-1" />
                            </div>
                        </div>

                        <div>
                            <InputLabel htmlFor="edit_alamat_ktp" value="Alamat Lengkap Sesuai KTP" className="text-xs font-semibold" />
                            <textarea
                                id="edit_alamat_ktp"
                                rows={2}
                                value={editForm.data.alamat_ktp}
                                onChange={(e) => editForm.setData('alamat_ktp', e.target.value)}
                                className="mt-1 block w-full text-xs rounded-xl border border-border bg-background p-2.5 text-foreground focus:ring-primary focus:border-primary"
                                placeholder="Jalan, RT/RW, Kelurahan, Kecamatan, Kota/Kabupaten, Provinsi"
                            />
                        </div>

                        <div>
                            <InputLabel htmlFor="edit_alamat_domisili" value="Alamat Domisili (Bila berbeda dengan KTP)" className="text-xs font-semibold" />
                            <textarea
                                id="edit_alamat_domisili"
                                rows={2}
                                value={editForm.data.alamat_domisili}
                                onChange={(e) => editForm.setData('alamat_domisili', e.target.value)}
                                className="mt-1 block w-full text-xs rounded-xl border border-border bg-background p-2.5 text-foreground focus:ring-primary focus:border-primary"
                                placeholder="Alamat tempat tinggal saat ini..."
                            />
                        </div>
                    </div>

                    {/* Seksi 3: Kontak Darurat & Riwayat Kesehatan */}
                    <div className="bg-card p-4 rounded-2xl border border-border/80 shadow-2xs flex flex-col gap-3.5">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5 pb-2 border-b border-border/60">
                            <HeartPulse className="w-3.5 h-3.5" /> Kontak Darurat &amp; Riwayat Penyakit
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                                <InputLabel htmlFor="edit_kontak_darurat_nama" value="Nama Kontak Darurat" className="text-xs font-semibold" />
                                <TextInput
                                    id="edit_kontak_darurat_nama"
                                    type="text"
                                    value={editForm.data.kontak_darurat_nama}
                                    className="mt-1 block w-full text-xs"
                                    onChange={(e) => editForm.setData('kontak_darurat_nama', e.target.value)}
                                />
                            </div>
                            <div>
                                <InputLabel htmlFor="edit_kontak_darurat_hp" value="No. HP Darurat" className="text-xs font-semibold" />
                                <TextInput
                                    id="edit_kontak_darurat_hp"
                                    type="text"
                                    value={editForm.data.kontak_darurat_hp}
                                    className="mt-1 block w-full text-xs font-mono"
                                    onChange={(e) => editForm.setData('kontak_darurat_hp', e.target.value)}
                                />
                            </div>
                            <div>
                                <InputLabel htmlFor="edit_kontak_darurat_hubungan" value="Hubungan Keluarga" className="text-xs font-semibold" />
                                <TextInput
                                    id="edit_kontak_darurat_hubungan"
                                    type="text"
                                    value={editForm.data.kontak_darurat_hubungan}
                                    className="mt-1 block w-full text-xs"
                                    placeholder="Suami/Istri/Anak/Saudara"
                                    onChange={(e) => editForm.setData('kontak_darurat_hubungan', e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <InputLabel htmlFor="edit_riwayat_penyakit" value="Riwayat Penyakit / Catatan Khusus Medis" className="text-xs font-semibold" />
                            <TextInput
                                id="edit_riwayat_penyakit"
                                type="text"
                                value={editForm.data.riwayat_penyakit}
                                className="mt-1 block w-full text-xs"
                                placeholder="Contoh: Asma, Hipertensi, Alergi Makanan Laut, dll"
                                onChange={(e) => editForm.setData('riwayat_penyakit', e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Seksi 5: Berkas Persyaratan & Dokumen */}
                    <div className="bg-card p-4 rounded-2xl border border-border/80 shadow-2xs flex flex-col gap-3.5">
                        <div className="flex items-center justify-between pb-2 border-b border-border/60">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                                <FileText className="w-3.5 h-3.5" /> Berkas Persyaratan &amp; Dokumen
                            </h4>
                            <span className="text-[11px] text-muted-foreground">
                                Upload atau ganti berkas langsung saat edit data
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {DOCUMENT_TYPES.filter((dt) => dt.value !== 'other').map((dt) => {
                                const existingDoc = (customer.documents || []).find((d) => d.type === dt.value);
                                const selectedFile = docFiles[dt.value];

                                return (
                                    <div
                                        key={dt.value}
                                        className={`p-3 rounded-xl border transition flex flex-col justify-between gap-2.5 ${
                                            selectedFile
                                                ? 'bg-primary/5 border-primary/40'
                                                : existingDoc
                                                ? 'bg-emerald-500/5 border-emerald-500/20'
                                                : 'bg-muted/30 border-border/70'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-2">
                                                {existingDoc ? (
                                                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                                ) : (
                                                    <AlertCircle className="w-4 h-4 text-amber-500/70 shrink-0" />
                                                )}
                                                <span className="text-xs font-bold text-foreground">
                                                    {dt.label}
                                                </span>
                                            </div>

                                            {existingDoc ? (
                                                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
                                                    Tersedia
                                                </span>
                                            ) : (
                                                <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-muted text-muted-foreground shrink-0">
                                                    Belum Ada
                                                </span>
                                            )}
                                        </div>

                                        {existingDoc && (
                                            <div className="text-[11px] text-muted-foreground truncate flex items-center gap-1.5 bg-background/50 px-2 py-1 rounded-lg border border-border/50">
                                                <FileText className="w-3 h-3 text-muted-foreground shrink-0" />
                                                <span className="truncate">{existingDoc.file_name}</span>
                                            </div>
                                        )}

                                        <div>
                                            <label className="text-[11px] font-medium text-muted-foreground block mb-1">
                                                {existingDoc ? 'Ganti Berkas / Upload Ulang:' : 'Pilih File (JPG/PNG/PDF):'}
                                            </label>
                                            <input
                                                type="file"
                                                accept=".jpg,.jpeg,.png,.webp,.pdf"
                                                onChange={(e) => handleFileChange(dt.value, e.target.files?.[0] || null)}
                                                className="block w-full text-[11px] file:mr-2.5 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[11px] file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer text-muted-foreground"
                                            />
                                        </div>

                                        {selectedFile && (
                                            <div className="text-[10px] text-primary font-semibold truncate flex items-center gap-1">
                                                <UploadCloud className="w-3 h-3 shrink-0" />
                                                <span>Akan diunggah: {selectedFile.name}</span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </form>

                <SheetFooter className="p-4 border-t border-border/80 bg-muted/20 flex flex-row items-center justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="px-4 py-2.5 rounded-xl border border-border text-xs font-semibold hover:bg-muted text-muted-foreground hover:text-foreground transition cursor-pointer"
                    >
                        Batal
                    </button>
                    <PrimaryButton
                        form="customer-edit-form"
                        type="submit"
                        disabled={isSubmitting}
                        className="text-xs font-bold px-5 py-2.5"
                    >
                        {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan Data'}
                    </PrimaryButton>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
