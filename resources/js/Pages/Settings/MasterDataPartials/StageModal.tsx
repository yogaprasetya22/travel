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
    SheetFooter,
} from '@/Components/ui/sheet';
import { Calendar } from 'lucide-react';

interface StageModalProps {
    isOpen: boolean;
    onClose: () => void;
    nextUrutan: number;
}

export function StageModal({ isOpen, onClose, nextUrutan }: StageModalProps) {
    const { data, setData, post, processing, errors, reset } = useForm({
        nama_tahap: '',
        urutan: nextUrutan,
        periode_mulai: '',
        periode_selesai: '',
        is_active: true,
    });

    useEffect(() => {
        if (isOpen) {
            reset();
            setData({
                nama_tahap: '',
                urutan: nextUrutan,
                periode_mulai: '',
                periode_selesai: '',
                is_active: true,
            });
        }
    }, [isOpen, nextUrutan]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('settings.master.store-stage'), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    return (
        <Sheet open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
            <SheetContent side="right" className="w-full sm:max-w-xl md:w-1/2">
                <SheetHeader>
                    <SheetTitle>Tambah Tahapan Pipeline CRM</SheetTitle>
                    <SheetDescription>Daftarkan tahapan baru pada siklus prospek jamaah beserta periode waktu aktif berlakunya.</SheetDescription>
                </SheetHeader>
                <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-4 flex-1 overflow-y-auto">
                    <div>
                        <InputLabel htmlFor="nama_tahap" value="Nama Tahapan" />
                        <TextInput
                            id="nama_tahap"
                            type="text"
                            value={data.nama_tahap}
                            className="mt-1 block w-full"
                            onChange={(e) => setData('nama_tahap', e.target.value)}
                            required
                            placeholder="Contoh: Jadwal Manasik..."
                        />
                        <InputError message={errors.nama_tahap} className="mt-2" />
                    </div>

                    <div>
                        <InputLabel htmlFor="urutan" value="Nomor Urutan Alur" />
                        <TextInput
                            id="urutan"
                            type="number"
                            value={data.urutan}
                            className="mt-1 block w-full"
                            onChange={(e) => setData('urutan', parseInt(e.target.value, 10))}
                            required
                        />
                        <InputError message={errors.urutan} className="mt-2" />
                    </div>

                    {/* Active Period Configuration */}
                    <div className="flex flex-col gap-3 p-4 rounded-xl bg-muted/40 border border-border">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-primary" />
                            <span className="text-xs font-bold text-foreground">Pengaturan Periode Aktif Tahap</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
                            <div>
                                <InputLabel htmlFor="periode_mulai" value="Tanggal Mulai Berlaku (Opsional)" />
                                <TextInput
                                    id="periode_mulai"
                                    type="date"
                                    value={data.periode_mulai}
                                    className="mt-1 block w-full text-xs"
                                    onChange={(e) => setData('periode_mulai', e.target.value)}
                                />
                                <InputError message={errors.periode_mulai} className="mt-1" />
                            </div>
                            <div>
                                <InputLabel htmlFor="periode_selesai" value="Tanggal Berakhir (Opsional)" />
                                <TextInput
                                    id="periode_selesai"
                                    type="date"
                                    value={data.periode_selesai}
                                    className="mt-1 block w-full text-xs"
                                    onChange={(e) => setData('periode_selesai', e.target.value)}
                                />
                                <InputError message={errors.periode_selesai} className="mt-1" />
                            </div>
                        </div>
                        <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer pt-1">
                            <input
                                type="checkbox"
                                checked={data.is_active}
                                onChange={(e) => setData('is_active', e.target.checked)}
                                className="rounded border-border text-primary focus:ring-primary"
                            />
                            <span>Status Tahapan Langsung Aktif di CRM</span>
                        </label>
                    </div>

                    <SheetFooter>
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-border rounded-xl text-sm font-medium cursor-pointer"
                        >
                            Batal
                        </button>
                        <PrimaryButton disabled={processing}>Simpan Tahap</PrimaryButton>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    );
}
