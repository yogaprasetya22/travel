import React, { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
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
} from '@/Components/ui/sheet';
import { Agent, HierarchyLevelItem, LeaderItem, BANK_OPTIONS } from './types';

interface AddAgentSheetProps {
    isOpen: boolean;
    onClose: () => void;
    hierarchyLevels: HierarchyLevelItem[];
    leaders: LeaderItem[];
}

export function AddAgentSheet({
    isOpen,
    onClose,
    hierarchyLevels,
    leaders,
}: AddAgentSheetProps) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        nik: '',
        no_hp: '',
        kota: '',
        alamat: '',
        status_karyawan: 'aktif',
        nama_bank: '',
        nomor_rekening: '',
        atas_nama_rekening: '',
        jabatan: 'Konsultan Bimbingan Umroh',
        hierarchy_level_id: hierarchyLevels.length > 0 ? String(hierarchyLevels[hierarchyLevels.length - 1].id) : '',
        created_by: '',
    });

    useEffect(() => {
        if (isOpen) {
            reset();
            setData({
                name: '',
                email: '',
                password: '',
                nik: '',
                no_hp: '',
                kota: '',
                alamat: '',
                status_karyawan: 'aktif',
                nama_bank: '',
                nomor_rekening: '',
                atas_nama_rekening: '',
                jabatan: 'Konsultan Bimbingan Umroh',
                hierarchy_level_id: hierarchyLevels.length > 0 ? String(hierarchyLevels[hierarchyLevels.length - 1].id) : '',
                created_by: '',
            });
        }
    }, [isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('keagenan.agents.store'), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    return (
        <Sheet open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
            <SheetContent side="right" className="w-full sm:max-w-xl flex flex-col p-0 gap-0">
                <SheetHeader className="p-6 border-b border-border bg-muted/30">
                    <SheetTitle>Tambah Mitra Agen Baru</SheetTitle>
                    <SheetDescription>Daftarkan akun lengkap mitra agen / konsultan umroh baru beserta data rekening.</SheetDescription>
                </SheetHeader>
                <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-6 overflow-y-auto flex-1 low-scrollbar">
                    <div>
                        <InputLabel htmlFor="create-name" value="Nama Lengkap Agen *" />
                        <TextInput
                            id="create-name"
                            type="text"
                            value={data.name}
                            className="mt-1 block w-full text-xs"
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="Contoh: Ahmad Subagja, S.Pd"
                            required
                        />
                        <InputError message={errors.name} className="mt-1" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <InputLabel htmlFor="create-email" value="Alamat Email *" />
                            <TextInput
                                id="create-email"
                                type="email"
                                value={data.email}
                                className="mt-1 block w-full text-xs"
                                onChange={(e) => setData('email', e.target.value)}
                                placeholder="agen@travel.com"
                                required
                            />
                            <InputError message={errors.email} className="mt-1" />
                        </div>

                        <div>
                            <InputLabel htmlFor="create-password" value="Password Akun *" />
                            <TextInput
                                id="create-password"
                                type="password"
                                value={data.password}
                                className="mt-1 block w-full text-xs"
                                onChange={(e) => setData('password', e.target.value)}
                                placeholder="Min. 6 karakter"
                                required
                            />
                            <InputError message={errors.password} className="mt-1" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <InputLabel htmlFor="create-nik" value="NIK / No. KTP" />
                            <TextInput
                                id="create-nik"
                                type="text"
                                value={data.nik}
                                className="mt-1 block w-full text-xs font-mono"
                                onChange={(e) => setData('nik', e.target.value)}
                                placeholder="16 digit NIK"
                            />
                            <InputError message={errors.nik} className="mt-1" />
                        </div>

                        <div>
                            <InputLabel htmlFor="create-nohp" value="Nomor WhatsApp / HP" />
                            <TextInput
                                id="create-nohp"
                                type="text"
                                value={data.no_hp}
                                className="mt-1 block w-full text-xs"
                                onChange={(e) => setData('no_hp', e.target.value)}
                                placeholder="Contoh: 081234567890"
                            />
                            <InputError message={errors.no_hp} className="mt-1" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <InputLabel htmlFor="create-kota" value="Kota / Domisili" />
                            <TextInput
                                id="create-kota"
                                type="text"
                                value={data.kota}
                                className="mt-1 block w-full text-xs"
                                onChange={(e) => setData('kota', e.target.value)}
                                placeholder="Contoh: Jakarta Selatan"
                            />
                            <InputError message={errors.kota} className="mt-1" />
                        </div>

                        <div>
                            <InputLabel htmlFor="create-jabatan" value="Jabatan / Posisi" />
                            <TextInput
                                id="create-jabatan"
                                type="text"
                                value={data.jabatan}
                                className="mt-1 block w-full text-xs"
                                onChange={(e) => setData('jabatan', e.target.value)}
                                placeholder="Konsultan Bimbingan Umroh"
                            />
                            <InputError message={errors.jabatan} className="mt-1" />
                        </div>
                    </div>

                    <div>
                        <InputLabel htmlFor="create-alamat" value="Alamat Lengkap KTP / Domisili" />
                        <textarea
                            id="create-alamat"
                            value={data.alamat}
                            onChange={(e) => setData('alamat', e.target.value)}
                            rows={2}
                            className="mt-1 block w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                            placeholder="Jalan, RT/RW, Kelurahan, Kecamatan..."
                        />
                        <InputError message={errors.alamat} className="mt-1" />
                    </div>

                    {/* Rekening Bank Section */}
                    <div className="p-4 rounded-2xl bg-muted/30 border border-border/60 flex flex-col gap-3">
                        <span className="text-xs font-bold text-primary uppercase tracking-wider">
                            Data Rekening Bank (Pencairan Komisi)
                        </span>

                        <div>
                            <InputLabel htmlFor="create-bank" value="Nama Bank" />
                            <div className="flex gap-2 mt-1">
                                <select
                                    id="create-bank-select"
                                    value={BANK_OPTIONS.includes(data.nama_bank) ? data.nama_bank : (data.nama_bank ? 'Lainnya' : '')}
                                    onChange={(e) => {
                                        if (e.target.value !== 'Lainnya') {
                                            setData('nama_bank', e.target.value);
                                        } else {
                                            setData('nama_bank', '');
                                        }
                                    }}
                                    className="w-1/2 bg-background border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                                >
                                    <option value="">Pilih Bank...</option>
                                    {BANK_OPTIONS.map((b) => (
                                        <option key={b} value={b}>{b}</option>
                                    ))}
                                </select>
                                <TextInput
                                    id="create-bank"
                                    type="text"
                                    value={data.nama_bank}
                                    className="w-1/2 text-xs"
                                    onChange={(e) => setData('nama_bank', e.target.value)}
                                    placeholder="Ketik jika lainnya"
                                />
                            </div>
                            <InputError message={errors.nama_bank} className="mt-1" />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <InputLabel htmlFor="create-rek" value="Nomor Rekening" />
                                <TextInput
                                    id="create-rek"
                                    type="text"
                                    value={data.nomor_rekening}
                                    className="mt-1 block w-full text-xs font-mono font-semibold"
                                    onChange={(e) => setData('nomor_rekening', e.target.value)}
                                    placeholder="Contoh: 1234567890"
                                />
                                <InputError message={errors.nomor_rekening} className="mt-1" />
                            </div>

                            <div>
                                <InputLabel htmlFor="create-an" value="Atas Nama Rekening" />
                                <TextInput
                                    id="create-an"
                                    type="text"
                                    value={data.atas_nama_rekening}
                                    className="mt-1 block w-full text-xs"
                                    onChange={(e) => setData('atas_nama_rekening', e.target.value)}
                                    placeholder="Nama Pemilik Rekening"
                                />
                                <InputError message={errors.atas_nama_rekening} className="mt-1" />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <InputLabel htmlFor="create-level" value="Level Hierarki Organisasi" />
                            <select
                                id="create-level"
                                value={data.hierarchy_level_id}
                                onChange={(e) => setData('hierarchy_level_id', e.target.value)}
                                className="mt-1 block w-full rounded-xl border-border bg-background text-foreground text-xs h-10 px-3 focus:border-primary focus:ring-primary"
                            >
                                <option value="">Pilih Level Hierarki...</option>
                                {hierarchyLevels.map((lvl) => (
                                    <option key={lvl.id} value={lvl.id}>
                                        Level {lvl.urutan} - {lvl.nama_level}
                                    </option>
                                ))}
                            </select>
                            <InputError message={errors.hierarchy_level_id} className="mt-1" />
                        </div>

                        <div>
                            <InputLabel htmlFor="create-leader" value="Atasan Langsung / Leader Pembina" />
                            <select
                                id="create-leader"
                                value={data.created_by}
                                onChange={(e) => setData('created_by', e.target.value)}
                                className="mt-1 block w-full rounded-xl border-border bg-background text-foreground text-xs h-10 px-3 focus:border-primary focus:ring-primary"
                            >
                                <option value="">Langsung di bawah Travel</option>
                                {leaders.map((ldr) => (
                                    <option key={ldr.id} value={ldr.id}>
                                        {ldr.name} ({ldr.jabatan || ldr.role})
                                    </option>
                                ))}
                            </select>
                            <InputError message={errors.created_by} className="mt-1" />
                        </div>
                    </div>

                    <div className="mt-4 flex justify-end gap-2 pt-4 border-t border-border">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-border text-foreground hover:bg-muted/40 rounded-xl text-xs font-semibold transition"
                        >
                            Batal
                        </button>
                        <PrimaryButton disabled={processing} className="rounded-xl text-xs">
                            {processing ? 'Menyimpan...' : 'Simpan Agen Baru'}
                        </PrimaryButton>
                    </div>
                </form>
            </SheetContent>
        </Sheet>
    );
}

interface EditAgentSheetProps {
    editingAgent: Agent | null;
    onClose: () => void;
    hierarchyLevels: HierarchyLevelItem[];
    leaders: LeaderItem[];
}

export function EditAgentSheet({
    editingAgent,
    onClose,
    hierarchyLevels,
    leaders,
}: EditAgentSheetProps) {
    const { data, setData, put, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        nik: '',
        no_hp: '',
        kota: '',
        alamat: '',
        status_karyawan: 'aktif',
        nama_bank: '',
        nomor_rekening: '',
        atas_nama_rekening: '',
        jabatan: '',
        hierarchy_level_id: '',
        created_by: '',
    });

    useEffect(() => {
        if (editingAgent) {
            setData({
                name: editingAgent.name,
                email: editingAgent.email,
                password: '',
                nik: editingAgent.nik || '',
                no_hp: editingAgent.no_hp || '',
                kota: editingAgent.kota || '',
                alamat: editingAgent.alamat || '',
                status_karyawan: editingAgent.status_karyawan || 'aktif',
                nama_bank: editingAgent.nama_bank || '',
                nomor_rekening: editingAgent.nomor_rekening || '',
                atas_nama_rekening: editingAgent.atas_nama_rekening || '',
                jabatan: editingAgent.jabatan || '',
                hierarchy_level_id: editingAgent.hierarchy_level_id ? String(editingAgent.hierarchy_level_id) : '',
                created_by: editingAgent.created_by ? String(editingAgent.created_by) : '',
            });
        }
    }, [editingAgent]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingAgent) return;
        put(route('keagenan.agents.update', editingAgent.id), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    return (
        <Sheet open={!!editingAgent} onOpenChange={(open) => { if (!open) onClose(); }}>
            <SheetContent side="right" className="w-full sm:max-w-xl flex flex-col p-0 gap-0">
                <SheetHeader className="p-6 border-b border-border bg-muted/30">
                    <SheetTitle>Edit Data Mitra Agen</SheetTitle>
                    <SheetDescription>Perbarui data profil, kontak, jabatan, dan rekening bank agen.</SheetDescription>
                </SheetHeader>
                <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-6 overflow-y-auto flex-1 low-scrollbar">
                    <div>
                        <InputLabel htmlFor="edit-name" value="Nama Lengkap Agen *" />
                        <TextInput
                            id="edit-name"
                            type="text"
                            value={data.name}
                            className="mt-1 block w-full text-xs"
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="Nama Lengkap"
                            required
                        />
                        <InputError message={errors.name} className="mt-1" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <InputLabel htmlFor="edit-email" value="Alamat Email *" />
                            <TextInput
                                id="edit-email"
                                type="email"
                                value={data.email}
                                className="mt-1 block w-full text-xs"
                                onChange={(e) => setData('email', e.target.value)}
                                placeholder="agen@travel.com"
                                required
                            />
                            <InputError message={errors.email} className="mt-1" />
                        </div>

                        <div>
                            <InputLabel htmlFor="edit-password" value="Password Baru (Opsional)" />
                            <TextInput
                                id="edit-password"
                                type="password"
                                value={data.password}
                                className="mt-1 block w-full text-xs"
                                onChange={(e) => setData('password', e.target.value)}
                                placeholder="Kosongkan jika tidak diubah"
                            />
                            <InputError message={errors.password} className="mt-1" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <InputLabel htmlFor="edit-nik" value="NIK / No. KTP" />
                            <TextInput
                                id="edit-nik"
                                type="text"
                                value={data.nik}
                                className="mt-1 block w-full text-xs font-mono"
                                onChange={(e) => setData('nik', e.target.value)}
                                placeholder="16 digit NIK"
                            />
                            <InputError message={errors.nik} className="mt-1" />
                        </div>

                        <div>
                            <InputLabel htmlFor="edit-nohp" value="Nomor WhatsApp / HP" />
                            <TextInput
                                id="edit-nohp"
                                type="text"
                                value={data.no_hp}
                                className="mt-1 block w-full text-xs"
                                onChange={(e) => setData('no_hp', e.target.value)}
                                placeholder="Contoh: 081234567890"
                            />
                            <InputError message={errors.no_hp} className="mt-1" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <InputLabel htmlFor="edit-kota" value="Kota / Domisili" />
                            <TextInput
                                id="edit-kota"
                                type="text"
                                value={data.kota}
                                className="mt-1 block w-full text-xs"
                                onChange={(e) => setData('kota', e.target.value)}
                                placeholder="Contoh: Jakarta Selatan"
                            />
                            <InputError message={errors.kota} className="mt-1" />
                        </div>

                        <div>
                            <InputLabel htmlFor="edit-jabatan" value="Jabatan / Posisi" />
                            <TextInput
                                id="edit-jabatan"
                                type="text"
                                value={data.jabatan}
                                className="mt-1 block w-full text-xs"
                                onChange={(e) => setData('jabatan', e.target.value)}
                                placeholder="Konsultan Bimbingan Umroh"
                            />
                            <InputError message={errors.jabatan} className="mt-1" />
                        </div>
                    </div>

                    <div>
                        <InputLabel htmlFor="edit-alamat" value="Alamat Lengkap KTP / Domisili" />
                        <textarea
                            id="edit-alamat"
                            value={data.alamat}
                            onChange={(e) => setData('alamat', e.target.value)}
                            rows={2}
                            className="mt-1 block w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                            placeholder="Jalan, RT/RW, Kelurahan, Kecamatan..."
                        />
                        <InputError message={errors.alamat} className="mt-1" />
                    </div>

                    {/* Rekening Bank Section */}
                    <div className="p-4 rounded-2xl bg-muted/30 border border-border/60 flex flex-col gap-3">
                        <span className="text-xs font-bold text-primary uppercase tracking-wider">
                            Data Rekening Bank (Pencairan Komisi)
                        </span>

                        <div>
                            <InputLabel htmlFor="edit-bank" value="Nama Bank" />
                            <div className="flex gap-2 mt-1">
                                <select
                                    id="edit-bank-select"
                                    value={BANK_OPTIONS.includes(data.nama_bank) ? data.nama_bank : (data.nama_bank ? 'Lainnya' : '')}
                                    onChange={(e) => {
                                        if (e.target.value !== 'Lainnya') {
                                            setData('nama_bank', e.target.value);
                                        } else {
                                            setData('nama_bank', '');
                                        }
                                    }}
                                    className="w-1/2 bg-background border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                                >
                                    <option value="">Pilih Bank...</option>
                                    {BANK_OPTIONS.map((b) => (
                                        <option key={b} value={b}>{b}</option>
                                    ))}
                                </select>
                                <TextInput
                                    id="edit-bank"
                                    type="text"
                                    value={data.nama_bank}
                                    className="w-1/2 text-xs"
                                    onChange={(e) => setData('nama_bank', e.target.value)}
                                    placeholder="Ketik jika lainnya"
                                />
                            </div>
                            <InputError message={errors.nama_bank} className="mt-1" />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <InputLabel htmlFor="edit-rek" value="Nomor Rekening" />
                                <TextInput
                                    id="edit-rek"
                                    type="text"
                                    value={data.nomor_rekening}
                                    className="mt-1 block w-full text-xs font-mono font-semibold"
                                    onChange={(e) => setData('nomor_rekening', e.target.value)}
                                    placeholder="Contoh: 1234567890"
                                />
                                <InputError message={errors.nomor_rekening} className="mt-1" />
                            </div>

                            <div>
                                <InputLabel htmlFor="edit-an" value="Atas Nama Rekening" />
                                <TextInput
                                    id="edit-an"
                                    type="text"
                                    value={data.atas_nama_rekening}
                                    className="mt-1 block w-full text-xs"
                                    onChange={(e) => setData('atas_nama_rekening', e.target.value)}
                                    placeholder="Nama Pemilik Rekening"
                                />
                                <InputError message={errors.atas_nama_rekening} className="mt-1" />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <InputLabel htmlFor="edit-level" value="Level Hierarki Organisasi" />
                            <select
                                id="edit-level"
                                value={data.hierarchy_level_id}
                                onChange={(e) => setData('hierarchy_level_id', e.target.value)}
                                className="mt-1 block w-full rounded-xl border-border bg-background text-foreground text-xs h-10 px-3 focus:border-primary focus:ring-primary"
                            >
                                <option value="">Pilih Level Hierarki...</option>
                                {hierarchyLevels.map((lvl) => (
                                    <option key={lvl.id} value={lvl.id}>
                                        Level {lvl.urutan} - {lvl.nama_level}
                                    </option>
                                ))}
                            </select>
                            <InputError message={errors.hierarchy_level_id} className="mt-1" />
                        </div>

                        <div>
                            <InputLabel htmlFor="edit-leader" value="Atasan Langsung / Leader Pembina" />
                            <select
                                id="edit-leader"
                                value={data.created_by}
                                onChange={(e) => setData('created_by', e.target.value)}
                                className="mt-1 block w-full rounded-xl border-border bg-background text-foreground text-xs h-10 px-3 focus:border-primary focus:ring-primary"
                            >
                                <option value="">Langsung di bawah Travel</option>
                                {leaders.filter((ldr) => ldr.id !== editingAgent?.id).map((ldr) => (
                                    <option key={ldr.id} value={ldr.id}>
                                        {ldr.name} ({ldr.jabatan || ldr.role})
                                    </option>
                                ))}
                            </select>
                            <InputError message={errors.created_by} className="mt-1" />
                        </div>
                    </div>

                    <div className="mt-4 flex justify-end gap-2 pt-4 border-t border-border">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-border text-foreground hover:bg-muted/40 rounded-xl text-xs font-semibold transition"
                        >
                            Batal
                        </button>
                        <PrimaryButton disabled={processing} className="rounded-xl text-xs">
                            {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </PrimaryButton>
                    </div>
                </form>
            </SheetContent>
        </Sheet>
    );
}
