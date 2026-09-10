import React, { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
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
import { HierarchyLevelItem, HierarchyUser } from './types';

interface UserReassignModalProps {
    reassigningUser: HierarchyUser | null;
    allLevels: HierarchyLevelItem[];
    onClose: () => void;
}

export function UserReassignModal({
    reassigningUser,
    allLevels,
    onClose,
}: UserReassignModalProps) {
    const { data, setData, post, processing, errors, reset } = useForm({
        target_level_id: '',
    });

    useEffect(() => {
        if (reassigningUser) {
            reset();
            setData('target_level_id', reassigningUser.hierarchy_level_id ? reassigningUser.hierarchy_level_id.toString() : '');
        }
    }, [reassigningUser]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!reassigningUser) return;

        post(route('settings.users.reassign', reassigningUser.id), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    return (
        <Sheet open={!!reassigningUser} onOpenChange={(open) => { if (!open) onClose(); }}>
            <SheetContent side="right" className="w-full sm:max-w-5xl md:w-1/2">
                <SheetHeader>
                    <SheetTitle>Pindahkan Jabatan: {reassigningUser?.name}</SheetTitle>
                    <SheetDescription>
                        Pindahkan akun pengguna ke tingkatan struktur jabatan yang baru. Hak akses dan role sistem akan disinkronkan secara otomatis.
                    </SheetDescription>
                </SheetHeader>
                <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-4 flex-1">
                    <div className="p-3.5 bg-muted/40 rounded-xl border border-border text-xs">
                        <span className="text-muted-foreground">Jabatan Saat Ini: </span>
                        <span className="font-bold text-foreground">
                            {reassigningUser?.jabatan || reassigningUser?.hierarchy_level?.nama_level || 'Belum Ditentukan'}
                        </span>
                    </div>

                    <div>
                        <InputLabel htmlFor="target_level_id" value="Pilih Tingkatan Jabatan Tujuan *" />
                        <select
                            id="target_level_id"
                            value={data.target_level_id}
                            onChange={(e) => setData('target_level_id', e.target.value)}
                            className="mt-1 block w-full bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                            required
                        >
                            {allLevels.map((lvl) => (
                                <option key={lvl.id} value={lvl.id.toString()}>
                                    {lvl.nama_level} (Role: {lvl.role_key})
                                </option>
                            ))}
                        </select>
                        <InputError message={errors.target_level_id} className="mt-2" />
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
                            Pindahkan User
                        </PrimaryButton>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    );
}
