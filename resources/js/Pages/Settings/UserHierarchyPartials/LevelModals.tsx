import React, { useEffect } from 'react';
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
import { HierarchyLevelItem } from './types';

interface LevelFormModalProps {
    mode: 'create' | 'edit' | null;
    editingLevel: HierarchyLevelItem | null;
    selectedParentLevelId: number | null;
    allLevels: HierarchyLevelItem[];
    currentUserRole?: string;
    onClose: () => void;
}

export function LevelFormModal({
    mode,
    editingLevel,
    selectedParentLevelId,
    allLevels,
    currentUserRole,
    onClose,
}: LevelFormModalProps) {
    const { data, setData, post, put, processing, errors, reset } = useForm<{
        nama_level: string;
        parent_id: string;
        role_key: string;
        deskripsi: string;
        wewenang_note: string;
    }>({
        nama_level: '',
        parent_id: '',
        role_key: 'agen',
        deskripsi: '',
        wewenang_note: '',
    });

    useEffect(() => {
        if (mode === 'create') {
            reset();
            setData({
                nama_level: '',
                parent_id: selectedParentLevelId ? selectedParentLevelId.toString() : (allLevels[0]?.id?.toString() || ''),
                role_key: 'agen',
                deskripsi: '',
                wewenang_note: '',
            });
        } else if (mode === 'edit' && editingLevel) {
            setData({
                nama_level: editingLevel.nama_level,
                parent_id: editingLevel.parent_id ? editingLevel.parent_id.toString() : '',
                role_key: editingLevel.role_key || 'agen',
                deskripsi: editingLevel.deskripsi || '',
                wewenang_note: editingLevel.wewenang_note || '',
            });
        }
    }, [mode, editingLevel, selectedParentLevelId]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (mode === 'create') {
            post(route('settings.users.levels.store'), {
                preserveScroll: true,
                onSuccess: () => {
                    reset();
                    onClose();
                },
            });
        } else if (mode === 'edit' && editingLevel) {
            put(route('settings.users.levels.update', editingLevel.id), {
                preserveScroll: true,
                onSuccess: () => {
                    reset();
                    onClose();
                },
            });
        }
    };

    return (
        <Sheet open={!!mode} onOpenChange={(open) => { if (!open) onClose(); }}>
            <SheetContent side="right" className="w-full sm:max-w-5xl md:w-1/2">
                <SheetHeader>
                    <SheetTitle>
                        {mode === 'create' ? 'Tambah Tingkatan Jabatan Baru' : `Edit Level: ${editingLevel?.nama_level}`}
                    </SheetTitle>
                    <SheetDescription>
                        Atur nama jabatan, atasan langsung (parent), wewenang, dan role sistem.
                    </SheetDescription>
                </SheetHeader>
                <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-4 flex-1 overflow-y-auto">
                    <div>
                        <InputLabel htmlFor="nama_level" value="Nama Jabatan / Level *" />
                        <TextInput
                            id="nama_level"
                            type="text"
                            value={data.nama_level}
                            onChange={(e) => setData('nama_level', e.target.value)}
                            className="mt-1 block w-full"
                            required
                            placeholder="Misal: Koordinator Wilayah, Senior Agen, Branch Manager"
                        />
                        <InputError message={errors.nama_level} className="mt-2" />
                    </div>

                    {mode === 'create' && (
                        <div>
                            <InputLabel htmlFor="parent_id" value="Atasan Langsung (Parent Level) *" />
                            <select
                                id="parent_id"
                                value={data.parent_id}
                                onChange={(e) => {
                                    const pid = e.target.value;
                                    const parentObj = allLevels.find((l) => l.id.toString() === pid);
                                    setData((prev) => ({
                                        ...prev,
                                        parent_id: pid,
                                        role_key: parentObj?.role_key === 'owner_travel' ? 'admin_travel' : 'agen',
                                    }));
                                }}
                                className="mt-1 block w-full bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                                required={currentUserRole !== 'super_admin_master'}
                            >
                                {currentUserRole === 'super_admin_master' && (
                                    <option value="">Level Tertinggi (Root / Tanpa Atasan)</option>
                                )}
                                {allLevels.map((lvl) => (
                                    <option key={lvl.id} value={lvl.id.toString()}>
                                        {lvl.nama_level} {lvl.role_key === 'owner_travel' ? '(Pimpinan Tertinggi)' : ''}
                                    </option>
                                ))}
                            </select>
                            <InputError message={errors.parent_id} className="mt-2" />
                        </div>
                    )}

                    <div>
                        <InputLabel htmlFor="role_key" value="Role Sistem Dasar (Hak Akses Sistem) *" />
                        <select
                            id="role_key"
                            value={data.role_key}
                            onChange={(e) => setData('role_key', e.target.value as any)}
                            className="mt-1 block w-full bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                            required
                        >
                            <option value="agen">Agen (Direct Sales / Mitra Lapangan)</option>
                            <option value="admin_travel">Admin Travel (Pengawas Tim / Operasional)</option>
                            {currentUserRole === 'super_admin_master' && (
                                <option value="owner_travel">Owner Travel (Pimpinan Penuh)</option>
                            )}
                        </select>
                        <InputError message={errors.role_key} className="mt-2" />
                    </div>

                    <div>
                        <InputLabel htmlFor="deskripsi" value="Deskripsi Singkat" />
                        <TextInput
                            id="deskripsi"
                            type="text"
                            value={data.deskripsi}
                            onChange={(e) => setData('deskripsi', e.target.value)}
                            className="mt-1 block w-full"
                            placeholder="Contoh: Mengkoordinasikan pendaftaran agen wilayah barat"
                        />
                    </div>

                    <div>
                        <InputLabel htmlFor="wewenang_note" value="Catatan Wewenang & Tanggung Jawab" />
                        <textarea
                            id="wewenang_note"
                            rows={3}
                            value={data.wewenang_note}
                            onChange={(e) => setData('wewenang_note', e.target.value)}
                            className="mt-1 block w-full bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                            placeholder="Deskripsikan wewenang atau KPI utama pemegang jabatan ini..."
                        />
                    </div>

                    <SheetFooter>
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-border rounded-lg text-sm"
                        >
                            Batal
                        </button>
                        <PrimaryButton disabled={processing}>
                            {mode === 'create' ? 'Tambah Level' : 'Simpan Perubahan'}
                        </PrimaryButton>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    );
}

interface DeleteLevelModalProps {
    deletingLevel: HierarchyLevelItem | null;
    levelCounts: Record<number, number>;
    allLevels: HierarchyLevelItem[];
    onClose: () => void;
}

export function DeleteLevelModal({
    deletingLevel,
    levelCounts,
    allLevels,
    onClose,
}: DeleteLevelModalProps) {
    const { data, setData, delete: destroy, processing, errors, reset } = useForm({
        reassign_to_level_id: '',
    });

    useEffect(() => {
        if (deletingLevel) {
            reset();
            setData('reassign_to_level_id', '');
        }
    }, [deletingLevel]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!deletingLevel) return;

        router.delete(route('settings.users.levels.destroy', deletingLevel.id), {
            data: {
                reassign_to_level_id: data.reassign_to_level_id || null,
            },
            preserveScroll: true,
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    return (
        <Sheet open={!!deletingLevel} onOpenChange={(open) => { if (!open) onClose(); }}>
            <SheetContent side="right" className="w-full sm:max-w-5xl md:w-1/2">
                <SheetHeader>
                    <SheetTitle className="text-red-600">Hapus Tingkatan: {deletingLevel?.nama_level}</SheetTitle>
                    <SheetDescription>
                        Tindakan ini akan menghapus tingkatan jabatan dari pohon hierarki tenant Anda.
                    </SheetDescription>
                </SheetHeader>
                <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-4 flex-1">
                    {deletingLevel && (levelCounts[deletingLevel.id] || 0) > 0 ? (
                        <div className="flex flex-col gap-4">
                            <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-xs text-amber-900 dark:text-amber-200">
                                <strong className="block font-bold mb-1">
                                    Perhatian: Terdapat {levelCounts[deletingLevel.id]} akun pengguna di jabatan ini!
                                </strong>
                                Untuk mencegah user kehilangan jabatan, silakan pilih tingkatan jabatan baru untuk memindahkan seluruh user secara otomatis:
                            </div>

                            <div>
                                <InputLabel htmlFor="reassign_target" value="Pindahkan Seluruh User ke *" />
                                <select
                                    id="reassign_target"
                                    value={data.reassign_to_level_id}
                                    onChange={(e) => setData('reassign_to_level_id', e.target.value)}
                                    className="mt-1 block w-full bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    required
                                >
                                    <option value="">-- Pilih Jabatan Tujuan --</option>
                                    {allLevels
                                        .filter((l) => l.id !== deletingLevel.id)
                                        .map((lvl) => (
                                            <option key={lvl.id} value={lvl.id.toString()}>
                                                {lvl.nama_level} ({lvl.role_key})
                                            </option>
                                        ))}
                                </select>
                                <InputError message={errors.reassign_to_level_id} className="mt-2" />
                            </div>
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">
                            Tidak ada pengguna di tingkatan jabatan ini. Level ini dapat langsung dihapus dengan aman.
                        </p>
                    )}

                    <SheetFooter>
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-border rounded-lg text-sm"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-lg transition disabled:opacity-50"
                        >
                            Hapus &amp; Migrasikan
                        </button>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    );
}
