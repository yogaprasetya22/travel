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
import { Building2, Users, CreditCard } from 'lucide-react';
import { HierarchyLevelItem, HierarchyUser, TenantItem, BANK_OPTIONS } from './types';

interface AddUserSheetProps {
    isOpen: boolean;
    onClose: () => void;
    allLevels: HierarchyLevelItem[];
    tenants: TenantItem[];
    users: HierarchyUser[];
    currentUserRole?: string;
    selectedTenantId?: number | null;
    defaultLevelId?: number | null;
}

export function AddUserSheet({
    isOpen,
    onClose,
    allLevels,
    tenants,
    users,
    currentUserRole,
    selectedTenantId,
    defaultLevelId,
}: AddUserSheetProps) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        hierarchy_level_id: defaultLevelId ? defaultLevelId.toString() : (allLevels[0]?.id ? allLevels[0].id.toString() : ''),
        tenant_id: selectedTenantId ? selectedTenantId.toString() : (tenants[0]?.id?.toString() || ''),
        nik: '',
        no_hp: '',
        kota: '',
        alamat: '',
        status_karyawan: 'aktif',
        nama_bank: '',
        nomor_rekening: '',
        atas_nama_rekening: '',
        created_by: '',
    });

    useEffect(() => {
        if (isOpen) {
            reset();
            setData({
                name: '',
                email: '',
                password: '',
                hierarchy_level_id: defaultLevelId ? defaultLevelId.toString() : (allLevels[0]?.id?.toString() || ''),
                tenant_id: selectedTenantId ? selectedTenantId.toString() : '',
                nik: '',
                no_hp: '',
                kota: '',
                alamat: '',
                status_karyawan: 'aktif',
                nama_bank: '',
                nomor_rekening: '',
                atas_nama_rekening: '',
                created_by: '',
            });
        }
    }, [isOpen, defaultLevelId, selectedTenantId]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('settings.users.store'), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    return (
        <Sheet open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
            <SheetContent side="right" className="w-full sm:max-w-2xl flex flex-col p-0 gap-0">
                <SheetHeader className="p-6 border-b border-border bg-muted/30">
                    <SheetTitle>Tambah Pengguna Baru</SheetTitle>
                    <SheetDescription>Daftarkan akun karyawan / mitra agen baru ke dalam struktur organisasi dan data payroll.</SheetDescription>
                </SheetHeader>
                <form onSubmit={handleSubmit} className="flex flex-col gap-6 p-6 flex-1 overflow-y-auto">
                    {/* SECTION 1: Akun & Posisi Organisasi */}
                    <div className="flex flex-col gap-3 p-4 rounded-2xl bg-card border border-border/80 shadow-xs">
                        <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider">
                            <Building2 className="w-4 h-4" />
                            <span>1. Akun &amp; Posisi Organisasi</span>
                        </div>

                        {currentUserRole === 'super_admin_master' && tenants.length > 0 && (
                            <div>
                                <InputLabel htmlFor="add_tenant_id" value="Pilih Tenant Travel *" />
                                <select
                                    id="add_tenant_id"
                                    value={data.tenant_id}
                                    onChange={(e) => setData('tenant_id', e.target.value)}
                                    className="mt-1 block w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    required
                                >
                                    {tenants.map((t) => (
                                        <option key={t.id} value={t.id.toString()}>{t.nama_travel}</option>
                                    ))}
                                </select>
                                <InputError message={errors.tenant_id} className="mt-1" />
                            </div>
                        )}

                        <div>
                            <InputLabel htmlFor="add_name" value="Nama Lengkap *" />
                            <TextInput
                                id="add_name"
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className="mt-1 block w-full text-xs"
                                required
                                placeholder="Contoh: Ust. Syahrul Ramadhan, S.Pd"
                            />
                            <InputError message={errors.name} className="mt-1" />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <InputLabel htmlFor="add_email" value="Alamat Email *" />
                                <TextInput
                                    id="add_email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    className="mt-1 block w-full text-xs"
                                    required
                                    placeholder="syahrul@travel.com"
                                />
                                <InputError message={errors.email} className="mt-1" />
                            </div>

                            <div>
                                <InputLabel htmlFor="add_password" value="Kata Sandi Awal *" />
                                <TextInput
                                    id="add_password"
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    className="mt-1 block w-full text-xs"
                                    required
                                    placeholder="Minimal 6 karakter"
                                />
                                <InputError message={errors.password} className="mt-1" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <InputLabel htmlFor="add_hierarchy_level_id" value="Tingkatan Jabatan *" />
                                <select
                                    id="add_hierarchy_level_id"
                                    value={data.hierarchy_level_id}
                                    onChange={(e) => setData('hierarchy_level_id', e.target.value)}
                                    className="mt-1 block w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    required
                                >
                                    {allLevels.map((lvl) => (
                                        <option key={lvl.id} value={lvl.id.toString()}>
                                            Level {lvl.urutan} - {lvl.nama_level} ({lvl.role_key})
                                        </option>
                                    ))}
                                </select>
                                <InputError message={errors.hierarchy_level_id} className="mt-1" />
                            </div>

                            <div>
                                <InputLabel htmlFor="add_created_by" value="Atasan Langsung / Leader" />
                                <select
                                    id="add_created_by"
                                    value={data.created_by}
                                    onChange={(e) => setData('created_by', e.target.value)}
                                    className="mt-1 block w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                                >
                                    <option value="">Langsung di bawah Travel</option>
                                    {users.map((u) => (
                                        <option key={u.id} value={u.id.toString()}>
                                            {u.name} ({u.jabatan || u.role})
                                        </option>
                                    ))}
                                </select>
                                <InputError message={errors.created_by} className="mt-1" />
                            </div>
                        </div>
                    </div>

                    {/* SECTION 2: Data Pribadi & Kepegawaian */}
                    <div className="flex flex-col gap-3 p-4 rounded-2xl bg-card border border-border/80 shadow-xs">
                        <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider">
                            <Users className="w-4 h-4" />
                            <span>2. Data Identitas &amp; Kepegawaian</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <InputLabel htmlFor="add_nik" value="NIK / No. KTP" />
                                <TextInput
                                    id="add_nik"
                                    type="text"
                                    value={data.nik}
                                    onChange={(e) => setData('nik', e.target.value)}
                                    className="mt-1 block w-full text-xs font-mono"
                                    placeholder="16 digit NIK KTP"
                                />
                                <InputError message={errors.nik} className="mt-1" />
                            </div>

                            <div>
                                <InputLabel htmlFor="add_status_karyawan" value="Status Kepegawaian" />
                                <select
                                    id="add_status_karyawan"
                                    value={data.status_karyawan}
                                    onChange={(e) => setData('status_karyawan', e.target.value)}
                                    className="mt-1 block w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                                >
                                    <option value="aktif">Aktif</option>
                                    <option value="tetap">Karyawan Tetap</option>
                                    <option value="kontrak">Kontrak / PKWT</option>
                                    <option value="non_aktif">Non-Aktif</option>
                                </select>
                                <InputError message={errors.status_karyawan} className="mt-1" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <InputLabel htmlFor="add_no_hp" value="Nomor WhatsApp / HP" />
                                <TextInput
                                    id="add_no_hp"
                                    type="text"
                                    value={data.no_hp}
                                    onChange={(e) => setData('no_hp', e.target.value)}
                                    className="mt-1 block w-full text-xs"
                                    placeholder="Contoh: 081234567890"
                                />
                                <InputError message={errors.no_hp} className="mt-1" />
                            </div>

                            <div>
                                <InputLabel htmlFor="add_kota" value="Kota / Domisili" />
                                <TextInput
                                    id="add_kota"
                                    type="text"
                                    value={data.kota}
                                    onChange={(e) => setData('kota', e.target.value)}
                                    className="mt-1 block w-full text-xs"
                                    placeholder="Contoh: Jakarta Selatan"
                                />
                                <InputError message={errors.kota} className="mt-1" />
                            </div>
                        </div>

                        <div>
                            <InputLabel htmlFor="add_alamat" value="Alamat Lengkap KTP / Domisili" />
                            <textarea
                                id="add_alamat"
                                value={data.alamat}
                                onChange={(e) => setData('alamat', e.target.value)}
                                rows={2}
                                className="mt-1 block w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                                placeholder="Jalan, RT/RW, Kelurahan, Kecamatan..."
                            />
                            <InputError message={errors.alamat} className="mt-1" />
                        </div>
                    </div>

                    {/* SECTION 3: Data Rekening Bank Pencairan Komisi / Gaji */}
                    <div className="flex flex-col gap-3 p-4 rounded-2xl bg-card border border-border/80 shadow-xs">
                        <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider">
                            <CreditCard className="w-4 h-4" />
                            <span>3. Rekening Bank (Pencairan Komisi / Payroll)</span>
                        </div>

                        <div>
                            <InputLabel htmlFor="add_nama_bank" value="Nama Bank" />
                            <div className="flex gap-2 mt-1">
                                <select
                                    id="add_nama_bank_select"
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
                                    <option value="">Pilih Bank Populer...</option>
                                    {BANK_OPTIONS.map((b) => (
                                        <option key={b} value={b}>{b}</option>
                                    ))}
                                </select>

                                <TextInput
                                    id="add_nama_bank"
                                    type="text"
                                    value={data.nama_bank}
                                    onChange={(e) => setData('nama_bank', e.target.value)}
                                    className="w-1/2 text-xs"
                                    placeholder="Ketik Nama Bank jika Lainnya"
                                />
                            </div>
                            <InputError message={errors.nama_bank} className="mt-1" />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <InputLabel htmlFor="add_nomor_rekening" value="Nomor Rekening" />
                                <TextInput
                                    id="add_nomor_rekening"
                                    type="text"
                                    value={data.nomor_rekening}
                                    onChange={(e) => setData('nomor_rekening', e.target.value)}
                                    className="mt-1 block w-full text-xs font-mono font-semibold"
                                    placeholder="Contoh: 1234567890"
                                />
                                <InputError message={errors.nomor_rekening} className="mt-1" />
                            </div>

                            <div>
                                <InputLabel htmlFor="add_atas_nama_rekening" value="Atas Nama Rekening (Pemilik)" />
                                <TextInput
                                    id="add_atas_nama_rekening"
                                    type="text"
                                    value={data.atas_nama_rekening}
                                    onChange={(e) => setData('atas_nama_rekening', e.target.value)}
                                    className="mt-1 block w-full text-xs"
                                    placeholder="Sesuai Buku Tabungan"
                                />
                                <InputError message={errors.atas_nama_rekening} className="mt-1" />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t border-border">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-border rounded-xl text-xs font-semibold hover:bg-muted transition"
                        >
                            Batal
                        </button>
                        <PrimaryButton disabled={processing} className="rounded-xl text-xs">
                            {processing ? 'Menyimpan...' : 'Simpan Akun Pengguna'}
                        </PrimaryButton>
                    </div>
                </form>
            </SheetContent>
        </Sheet>
    );
}

interface EditUserSheetProps {
    editingUser: HierarchyUser | null;
    onClose: () => void;
    allLevels: HierarchyLevelItem[];
    users: HierarchyUser[];
}

export function EditUserSheet({
    editingUser,
    onClose,
    allLevels,
    users,
}: EditUserSheetProps) {
    const { data, setData, put, processing, errors, reset } = useForm({
        name: '',
        email: '',
        hierarchy_level_id: '',
        password: '',
        nik: '',
        no_hp: '',
        kota: '',
        alamat: '',
        status_karyawan: 'aktif',
        nama_bank: '',
        nomor_rekening: '',
        atas_nama_rekening: '',
        created_by: '',
    });

    useEffect(() => {
        if (editingUser) {
            setData({
                name: editingUser.name,
                email: editingUser.email,
                hierarchy_level_id: editingUser.hierarchy_level_id ? editingUser.hierarchy_level_id.toString() : '',
                password: '',
                nik: editingUser.nik || '',
                no_hp: editingUser.no_hp || '',
                kota: editingUser.kota || '',
                alamat: editingUser.alamat || '',
                status_karyawan: editingUser.status_karyawan || 'aktif',
                nama_bank: editingUser.nama_bank || '',
                nomor_rekening: editingUser.nomor_rekening || '',
                atas_nama_rekening: editingUser.atas_nama_rekening || '',
                created_by: editingUser.created_by ? editingUser.created_by.toString() : '',
            });
        }
    }, [editingUser]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingUser) return;
        put(route('settings.users.update', editingUser.id), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    return (
        <Sheet open={!!editingUser} onOpenChange={(open) => { if (!open) onClose(); }}>
            <SheetContent side="right" className="w-full sm:max-w-5xl flex flex-col p-0 gap-0">
                <SheetHeader className="p-6 border-b border-border bg-muted/30">
                    <SheetTitle>Edit Pengguna: {editingUser?.name}</SheetTitle>
                    <SheetDescription>Perbarui data profil karyawan, hak akses jabatan, kontak, serta nomor rekening bank.</SheetDescription>
                </SheetHeader>
                <form onSubmit={handleSubmit} className="flex flex-col gap-6 p-6 flex-1 overflow-y-auto no-scrollbar">
                    {/* SECTION 1: Akun & Posisi Organisasi */}
                    <div className="flex flex-col gap-3 p-4 rounded-2xl bg-card border border-border/80 shadow-xs">
                        <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider">
                            <Building2 className="w-4 h-4" />
                            <span>1. Akun &amp; Posisi Organisasi</span>
                        </div>

                        <div>
                            <InputLabel htmlFor="edit_name" value="Nama Lengkap *" />
                            <TextInput
                                id="edit_name"
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className="mt-1 block w-full text-xs"
                                required
                            />
                            <InputError message={errors.name} className="mt-1" />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <InputLabel htmlFor="edit_email" value="Alamat Email *" />
                                <TextInput
                                    id="edit_email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    className="mt-1 block w-full text-xs"
                                    required
                                />
                                <InputError message={errors.email} className="mt-1" />
                            </div>

                            <div>
                                <InputLabel htmlFor="edit_password" value="Kata Sandi Baru (Opsional)" />
                                <TextInput
                                    id="edit_password"
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    className="mt-1 block w-full text-xs"
                                    placeholder="Kosongkan jika tidak diubah"
                                />
                                <InputError message={errors.password} className="mt-1" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <InputLabel htmlFor="edit_level" value="Tingkatan Jabatan" />
                                <select
                                    id="edit_level"
                                    value={data.hierarchy_level_id}
                                    onChange={(e) => setData('hierarchy_level_id', e.target.value)}
                                    className="mt-1 block w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                                >
                                    {allLevels.map((lvl) => (
                                        <option key={lvl.id} value={lvl.id.toString()}>
                                            Level {lvl.urutan} - {lvl.nama_level} ({lvl.role_key})
                                        </option>
                                    ))}
                                </select>
                                <InputError message={errors.hierarchy_level_id} className="mt-1" />
                            </div>

                            <div>
                                <InputLabel htmlFor="edit_created_by" value="Atasan Langsung / Leader" />
                                <select
                                    id="edit_created_by"
                                    value={data.created_by}
                                    onChange={(e) => setData('created_by', e.target.value)}
                                    className="mt-1 block w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                                >
                                    <option value="">Langsung di bawah Travel</option>
                                    {users.filter((u) => u.id !== editingUser?.id).map((u) => (
                                        <option key={u.id} value={u.id.toString()}>
                                            {u.name} ({u.jabatan || u.role})
                                        </option>
                                    ))}
                                </select>
                                <InputError message={errors.created_by} className="mt-1" />
                            </div>
                        </div>
                    </div>

                    {/* SECTION 2: Data Pribadi & Kepegawaian */}
                    <div className="flex flex-col gap-3 p-4 rounded-2xl bg-card border border-border/80 shadow-xs">
                        <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider">
                            <Users className="w-4 h-4" />
                            <span>2. Data Identitas &amp; Kepegawaian</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <InputLabel htmlFor="edit_nik" value="NIK / No. KTP" />
                                <TextInput
                                    id="edit_nik"
                                    type="text"
                                    value={data.nik}
                                    onChange={(e) => setData('nik', e.target.value)}
                                    className="mt-1 block w-full text-xs font-mono"
                                    placeholder="16 digit NIK KTP"
                                />
                                <InputError message={errors.nik} className="mt-1" />
                            </div>

                            <div>
                                <InputLabel htmlFor="edit_status_karyawan" value="Status Kepegawaian" />
                                <select
                                    id="edit_status_karyawan"
                                    value={data.status_karyawan}
                                    onChange={(e) => setData('status_karyawan', e.target.value)}
                                    className="mt-1 block w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                                >
                                    <option value="aktif">Aktif</option>
                                    <option value="tetap">Karyawan Tetap</option>
                                    <option value="kontrak">Kontrak / PKWT</option>
                                    <option value="non_aktif">Non-Aktif</option>
                                </select>
                                <InputError message={errors.status_karyawan} className="mt-1" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <InputLabel htmlFor="edit_nohp" value="Nomor WhatsApp / HP" />
                                <TextInput
                                    id="edit_nohp"
                                    type="text"
                                    value={data.no_hp}
                                    onChange={(e) => setData('no_hp', e.target.value)}
                                    className="mt-1 block w-full text-xs"
                                    placeholder="Contoh: 081234567890"
                                />
                                <InputError message={errors.no_hp} className="mt-1" />
                            </div>

                            <div>
                                <InputLabel htmlFor="edit_kota" value="Kota / Domisili" />
                                <TextInput
                                    id="edit_kota"
                                    type="text"
                                    value={data.kota}
                                    onChange={(e) => setData('kota', e.target.value)}
                                    className="mt-1 block w-full text-xs"
                                    placeholder="Contoh: Jakarta Selatan"
                                />
                                <InputError message={errors.kota} className="mt-1" />
                            </div>
                        </div>

                        <div>
                            <InputLabel htmlFor="edit_alamat" value="Alamat Lengkap KTP / Domisili" />
                            <textarea
                                id="edit_alamat"
                                value={data.alamat}
                                onChange={(e) => setData('alamat', e.target.value)}
                                rows={2}
                                className="mt-1 block w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                                placeholder="Jalan, RT/RW, Kelurahan, Kecamatan..."
                            />
                            <InputError message={errors.alamat} className="mt-1" />
                        </div>
                    </div>

                    {/* SECTION 3: Data Rekening Bank Pencairan Komisi / Gaji */}
                    <div className="flex flex-col gap-3 p-4 rounded-2xl bg-card border border-border/80 shadow-xs">
                        <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider">
                            <CreditCard className="w-4 h-4" />
                            <span>3. Rekening Bank (Pencairan Komisi / Payroll)</span>
                        </div>

                        <div>
                            <InputLabel htmlFor="edit_nama_bank" value="Nama Bank" />
                            <div className="flex gap-2 mt-1">
                                <select
                                    id="edit_nama_bank_select"
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
                                    <option value="">Pilih Bank Populer...</option>
                                    {BANK_OPTIONS.map((b) => (
                                        <option key={b} value={b}>{b}</option>
                                    ))}
                                </select>

                                <TextInput
                                    id="edit_nama_bank"
                                    type="text"
                                    value={data.nama_bank}
                                    onChange={(e) => setData('nama_bank', e.target.value)}
                                    className="w-1/2 text-xs"
                                    placeholder="Ketik Nama Bank jika Lainnya"
                                />
                            </div>
                            <InputError message={errors.nama_bank} className="mt-1" />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <InputLabel htmlFor="edit_nomor_rekening" value="Nomor Rekening" />
                                <TextInput
                                    id="edit_nomor_rekening"
                                    type="text"
                                    value={data.nomor_rekening}
                                    onChange={(e) => setData('nomor_rekening', e.target.value)}
                                    className="mt-1 block w-full text-xs font-mono font-semibold"
                                    placeholder="Contoh: 1234567890"
                                />
                                <InputError message={errors.nomor_rekening} className="mt-1" />
                            </div>

                            <div>
                                <InputLabel htmlFor="edit_atas_nama_rekening" value="Atas Nama Rekening (Pemilik)" />
                                <TextInput
                                    id="edit_atas_nama_rekening"
                                    type="text"
                                    value={data.atas_nama_rekening}
                                    onChange={(e) => setData('atas_nama_rekening', e.target.value)}
                                    className="mt-1 block w-full text-xs"
                                    placeholder="Sesuai Buku Tabungan"
                                />
                                <InputError message={errors.atas_nama_rekening} className="mt-1" />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t border-border">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-border rounded-xl text-xs font-semibold hover:bg-muted transition"
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
