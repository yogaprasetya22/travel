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

interface BankModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function BankModal({ isOpen, onClose }: BankModalProps) {
    const { data, setData, post, processing, errors, reset } = useForm({
        nama_bank: '',
        nomor_rekening: '',
        atas_nama: '',
    });

    useEffect(() => {
        if (isOpen) {
            reset();
            setData({
                nama_bank: '',
                nomor_rekening: '',
                atas_nama: '',
            });
        }
    }, [isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('settings.master.store-bank'), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    return (
        <Sheet open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
            <SheetContent side="right" className="w-full sm:max-w-5xl md:w-1/2">
                <SheetHeader>
                    <SheetTitle>Tambah Rekening Bank Travel</SheetTitle>
                    <SheetDescription>Daftarkan rekening bank resmi travel untuk penerimaan pembayaran jamaah.</SheetDescription>
                </SheetHeader>
                <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-4 flex-1">
                    <div>
                        <InputLabel htmlFor="nama_bank" value="Nama Bank" />
                        <TextInput
                            id="nama_bank"
                            type="text"
                            value={data.nama_bank}
                            className="mt-1 block w-full text-xs"
                            onChange={(e) => setData('nama_bank', e.target.value)}
                            required
                            placeholder="Misal: Bank Syariah Indonesia (BSI)"
                        />
                        <InputError message={errors.nama_bank} className="mt-2" />
                    </div>
                    <div>
                        <InputLabel htmlFor="nomor_rekening" value="Nomor Rekening" />
                        <TextInput
                            id="nomor_rekening"
                            type="text"
                            value={data.nomor_rekening}
                            className="mt-1 block w-full text-xs font-mono font-bold"
                            onChange={(e) => setData('nomor_rekening', e.target.value)}
                            required
                            placeholder="7123456789"
                        />
                        <InputError message={errors.nomor_rekening} className="mt-2" />
                    </div>
                    <div>
                        <InputLabel htmlFor="atas_nama" value="Atas Nama" />
                        <TextInput
                            id="atas_nama"
                            type="text"
                            value={data.atas_nama}
                            className="mt-1 block w-full text-xs"
                            onChange={(e) => setData('atas_nama', e.target.value)}
                            required
                            placeholder="PT Travel Umroh Barokah"
                        />
                        <InputError message={errors.atas_nama} className="mt-2" />
                    </div>
                    <SheetFooter>
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-border rounded-xl text-sm font-medium cursor-pointer"
                        >
                            Batal
                        </button>
                        <PrimaryButton disabled={processing}>Simpan Rekening</PrimaryButton>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    );
}
