import React, { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import CurrencyInput, { toRupiah } from '@/Components/CurrencyInput';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter,
} from '@/Components/ui/sheet';
import {
    Calendar,
    Banknote,
    Percent,
} from 'lucide-react';
import { PackageItem, InventoryItem } from './types';

interface AddPackageModalProps {
    isOpen: boolean;
    onClose: () => void;
    inventoryItems: InventoryItem[];
}

export function AddPackageModal({ isOpen, onClose, inventoryItems }: AddPackageModalProps) {
    const [commissionType, setCommissionType] = useState<'flat' | 'percentage'>('flat');
    const { data, setData, post, processing, errors, reset } = useForm({
        nama_paket: '',
        harga: '',
        komisi_flat: '1500000',
        komisi_persentase: '5',
        periode_mulai: '',
        periode_selesai: '',
        is_active: true,
        inventaris_ids: [] as number[],
    });

    useEffect(() => {
        if (isOpen) {
            reset();
            setCommissionType('flat');
            setData({
                nama_paket: '',
                harga: '',
                komisi_flat: '1500000',
                komisi_persentase: '5',
                periode_mulai: '',
                periode_selesai: '',
                is_active: true,
                inventaris_ids: [],
            });
        }
    }, [isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('settings.master.store-package'), {
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
                    <SheetTitle>Tambah Paket Umroh & Haji</SheetTitle>
                    <SheetDescription>Daftarkan produk paket travel, skema komisi agen (standar / persentase), dan paket perlengkapan.</SheetDescription>
                </SheetHeader>
                <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-4 flex-1 overflow-y-auto">
                    <div>
                        <InputLabel htmlFor="nama_paket" value="Nama Paket" />
                        <TextInput
                            id="nama_paket"
                            type="text"
                            value={data.nama_paket}
                            className="mt-1 block w-full"
                            onChange={(e) => setData('nama_paket', e.target.value)}
                            required
                            placeholder="Misal: Umroh Ramadhan VIP 2027"
                        />
                        <InputError message={errors.nama_paket} className="mt-2" />
                    </div>

                    <div>
                        <InputLabel htmlFor="harga" value="Harga Paket" />
                        <div className="mt-1">
                            <CurrencyInput
                                id="harga"
                                value={data.harga}
                                onChange={(val) => setData('harga', val)}
                                placeholder="35.000.000"
                                required
                            />
                        </div>
                        <InputError message={errors.harga} className="mt-2" />
                    </div>

                    {/* Commission Type Switcher */}
                    <div className="flex flex-col gap-2 p-4 rounded-xl bg-muted/40 border border-border">
                        <InputLabel value="Skema Komisi Agen" />
                        <div className="grid grid-cols-2 gap-2 mt-1">
                            <button
                                type="button"
                                onClick={() => {
                                    setCommissionType('flat');
                                    setData('komisi_persentase', '0');
                                }}
                                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition cursor-pointer border ${
                                    commissionType === 'flat'
                                        ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                                        : 'bg-background text-muted-foreground border-border hover:text-foreground'
                                }`}
                            >
                                <Banknote className="w-3.5 h-3.5" />
                                <span>Nominal Standar (Rp)</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setCommissionType('percentage');
                                    setData('komisi_flat', '0');
                                }}
                                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition cursor-pointer border ${
                                    commissionType === 'percentage'
                                        ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                                        : 'bg-background text-muted-foreground border-border hover:text-foreground'
                                }`}
                            >
                                <Percent className="w-3.5 h-3.5" />
                                <span>Persentase (%)</span>
                            </button>
                        </div>

                        {commissionType === 'flat' ? (
                            <div className="mt-2">
                                <InputLabel htmlFor="komisi_flat" value="Nominal Komisi Flat" />
                                <div className="mt-1">
                                    <CurrencyInput
                                        id="komisi_flat"
                                        value={data.komisi_flat}
                                        onChange={(val) => setData('komisi_flat', val)}
                                        placeholder="1.500.000"
                                    />
                                </div>
                                <InputError message={errors.komisi_flat} className="mt-2" />
                            </div>
                        ) : (
                            <div className="mt-2">
                                <InputLabel htmlFor="komisi_persentase" value="Persentase Komisi (%)" />
                                <div className="relative mt-1 flex items-center">
                                    <TextInput
                                        id="komisi_persentase"
                                        type="number"
                                        min="0"
                                        max="100"
                                        step="0.1"
                                        value={data.komisi_persentase}
                                        className="block w-full pr-8"
                                        onChange={(e) => setData('komisi_persentase', e.target.value)}
                                        placeholder="5"
                                    />
                                    <span className="absolute right-3 text-sm font-bold text-muted-foreground">%</span>
                                </div>
                                <p className="text-[11px] text-muted-foreground mt-1">
                                    Perkiraan komisi per jamaah: <strong className="text-foreground">{toRupiah((Number(data.harga || 0) * Number(data.komisi_persentase || 0)) / 100)}</strong>
                                </p>
                                <InputError message={errors.komisi_persentase} className="mt-2" />
                            </div>
                        )}
                    </div>

                    {/* Active Period Configuration */}
                    <div className="flex flex-col gap-3 p-4 rounded-xl bg-muted/40 border border-border">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-primary" />
                            <span className="text-xs font-bold text-foreground">Pengaturan Periode Aktif Paket</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
                            <div>
                                <InputLabel htmlFor="pkg_periode_mulai" value="Tanggal Mulai Berlaku (Opsional)" />
                                <TextInput
                                    id="pkg_periode_mulai"
                                    type="date"
                                    value={data.periode_mulai}
                                    className="mt-1 block w-full text-xs"
                                    onChange={(e) => setData('periode_mulai', e.target.value)}
                                />
                                <InputError message={errors.periode_mulai} className="mt-1" />
                            </div>
                            <div>
                                <InputLabel htmlFor="pkg_periode_selesai" value="Tanggal Berakhir (Opsional)" />
                                <TextInput
                                    id="pkg_periode_selesai"
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
                            <span>Status Paket Langsung Aktif Ditawarkan</span>
                        </label>
                    </div>

                    {/* Inventory items attachment */}
                    {inventoryItems.length > 0 && (
                        <div className="flex flex-col gap-2">
                            <InputLabel value="Paket Logistik & Perlengkapan Bawaan" />
                            <div className="grid grid-cols-1 gap-2 max-h-36 overflow-y-auto p-2 border border-border rounded-xl bg-background">
                                {inventoryItems.map((inv) => {
                                    const isChecked = data.inventaris_ids.includes(inv.id);
                                    return (
                                        <label key={inv.id} className="flex items-center gap-2.5 text-xs text-foreground cursor-pointer p-1.5 rounded-lg hover:bg-muted">
                                            <input
                                                type="checkbox"
                                                checked={isChecked}
                                                onChange={(e) => {
                                                    const current = data.inventaris_ids;
                                                    if (e.target.checked) {
                                                        setData('inventaris_ids', [...current, inv.id]);
                                                    } else {
                                                        setData('inventaris_ids', current.filter((id) => id !== inv.id));
                                                    }
                                                }}
                                                className="rounded border-border text-primary focus:ring-primary"
                                            />
                                            <span>{inv.nama_barang}</span>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    <SheetFooter>
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-border rounded-xl text-sm font-medium cursor-pointer"
                        >
                            Batal
                        </button>
                        <PrimaryButton disabled={processing}>Simpan Paket</PrimaryButton>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    );
}

interface EditPackageModalProps {
    editingPackage: PackageItem | null;
    onClose: () => void;
    inventoryItems: InventoryItem[];
}

export function EditPackageModal({ editingPackage, onClose, inventoryItems }: EditPackageModalProps) {
    const [editCommissionType, setEditCommissionType] = useState<'flat' | 'percentage'>('flat');
    const { data, setData, put, processing, errors, reset } = useForm({
        nama_paket: '',
        harga: '',
        komisi_flat: '0',
        komisi_persentase: '0',
        periode_mulai: '',
        periode_selesai: '',
        is_active: true,
        inventaris_ids: [] as number[],
    });

    useEffect(() => {
        if (editingPackage) {
            const isPct = Number(editingPackage.komisi_persentase) > 0;
            setEditCommissionType(isPct ? 'percentage' : 'flat');

            setData({
                nama_paket: editingPackage.nama_paket,
                harga: editingPackage.harga.toString(),
                komisi_flat: (editingPackage.komisi_flat || 0).toString(),
                komisi_persentase: (editingPackage.komisi_persentase || 0).toString(),
                periode_mulai: editingPackage.periode_mulai ? editingPackage.periode_mulai.split('T')[0] : '',
                periode_selesai: editingPackage.periode_selesai ? editingPackage.periode_selesai.split('T')[0] : '',
                is_active: editingPackage.is_active !== false,
                inventaris_ids: (editingPackage.inventaris || []).map((i) => i.id),
            });
        }
    }, [editingPackage]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingPackage) return;

        put(route('settings.master.update-package', editingPackage.id), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    return (
        <Sheet open={!!editingPackage} onOpenChange={(open) => { if (!open) onClose(); }}>
            <SheetContent side="right" className="w-full sm:max-w-xl md:w-1/2">
                <SheetHeader>
                    <SheetTitle>Edit Paket Umroh & Haji</SheetTitle>
                    <SheetDescription>Perbarui rincian harga paket, skema komisi agen, masa aktif, atau paket inventaris bawaan.</SheetDescription>
                </SheetHeader>
                <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-4 flex-1 overflow-y-auto">
                    <div>
                        <InputLabel htmlFor="edit_nama_paket" value="Nama Paket" />
                        <TextInput
                            id="edit_nama_paket"
                            type="text"
                            value={data.nama_paket}
                            className="mt-1 block w-full"
                            onChange={(e) => setData('nama_paket', e.target.value)}
                            required
                        />
                        <InputError message={errors.nama_paket} className="mt-2" />
                    </div>

                    <div>
                        <InputLabel htmlFor="edit_harga" value="Harga Paket" />
                        <div className="mt-1">
                            <CurrencyInput
                                id="edit_harga"
                                value={data.harga}
                                onChange={(val) => setData('harga', val)}
                                placeholder="35.000.000"
                                required
                            />
                        </div>
                        <InputError message={errors.harga} className="mt-2" />
                    </div>

                    {/* Commission Type Switcher */}
                    <div className="flex flex-col gap-2 p-4 rounded-xl bg-muted/40 border border-border">
                        <InputLabel value="Skema Komisi Agen" />
                        <div className="grid grid-cols-2 gap-2 mt-1">
                            <button
                                type="button"
                                onClick={() => {
                                    setEditCommissionType('flat');
                                    setData('komisi_persentase', '0');
                                }}
                                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition cursor-pointer border ${
                                    editCommissionType === 'flat'
                                        ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                                        : 'bg-background text-muted-foreground border-border hover:text-foreground'
                                }`}
                            >
                                <Banknote className="w-3.5 h-3.5" />
                                <span>Nominal Standar (Rp)</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setEditCommissionType('percentage');
                                    setData('komisi_flat', '0');
                                }}
                                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition cursor-pointer border ${
                                    editCommissionType === 'percentage'
                                        ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                                        : 'bg-background text-muted-foreground border-border hover:text-foreground'
                                }`}
                            >
                                <Percent className="w-3.5 h-3.5" />
                                <span>Persentase (%)</span>
                            </button>
                        </div>

                        {editCommissionType === 'flat' ? (
                            <div className="mt-2">
                                <InputLabel htmlFor="edit_komisi_flat" value="Nominal Komisi Flat" />
                                <div className="mt-1">
                                    <CurrencyInput
                                        id="edit_komisi_flat"
                                        value={data.komisi_flat}
                                        onChange={(val) => setData('komisi_flat', val)}
                                        placeholder="1.500.000"
                                    />
                                </div>
                                <InputError message={errors.komisi_flat} className="mt-2" />
                            </div>
                        ) : (
                            <div className="mt-2">
                                <InputLabel htmlFor="edit_komisi_persentase" value="Persentase Komisi (%)" />
                                <div className="relative mt-1 flex items-center">
                                    <TextInput
                                        id="edit_komisi_persentase"
                                        type="number"
                                        min="0"
                                        max="100"
                                        step="0.1"
                                        value={data.komisi_persentase}
                                        className="block w-full pr-8"
                                        onChange={(e) => setData('komisi_persentase', e.target.value)}
                                        placeholder="5"
                                    />
                                    <span className="absolute right-3 text-sm font-bold text-muted-foreground">%</span>
                                </div>
                                <p className="text-[11px] text-muted-foreground mt-1">
                                    Perkiraan komisi per jamaah: <strong className="text-foreground">{toRupiah((Number(data.harga || 0) * Number(data.komisi_persentase || 0)) / 100)}</strong>
                                </p>
                                <InputError message={errors.komisi_persentase} className="mt-2" />
                            </div>
                        )}
                    </div>

                    {/* Active Period Configuration */}
                    <div className="flex flex-col gap-3 p-4 rounded-xl bg-muted/40 border border-border">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-primary" />
                            <span className="text-xs font-bold text-foreground">Pengaturan Periode Aktif Paket</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
                            <div>
                                <InputLabel htmlFor="edit_pkg_periode_mulai" value="Tanggal Mulai Berlaku (Opsional)" />
                                <TextInput
                                    id="edit_pkg_periode_mulai"
                                    type="date"
                                    value={data.periode_mulai}
                                    className="mt-1 block w-full text-xs"
                                    onChange={(e) => setData('periode_mulai', e.target.value)}
                                />
                                <InputError message={errors.periode_mulai} className="mt-1" />
                            </div>
                            <div>
                                <InputLabel htmlFor="edit_pkg_periode_selesai" value="Tanggal Berakhir (Opsional)" />
                                <TextInput
                                    id="edit_pkg_periode_selesai"
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
                            <span>Status Paket Langsung Aktif Ditawarkan</span>
                        </label>
                    </div>

                    {/* Inventory items attachment */}
                    {inventoryItems.length > 0 && (
                        <div className="flex flex-col gap-2">
                            <InputLabel value="Paket Logistik & Perlengkapan Bawaan" />
                            <div className="grid grid-cols-1 gap-2 max-h-36 overflow-y-auto p-2 border border-border rounded-xl bg-background">
                                {inventoryItems.map((inv) => {
                                    const isChecked = data.inventaris_ids.includes(inv.id);
                                    return (
                                        <label key={inv.id} className="flex items-center gap-2.5 text-xs text-foreground cursor-pointer p-1.5 rounded-lg hover:bg-muted">
                                            <input
                                                type="checkbox"
                                                checked={isChecked}
                                                onChange={(e) => {
                                                    const current = data.inventaris_ids;
                                                    if (e.target.checked) {
                                                        setData('inventaris_ids', [...current, inv.id]);
                                                    } else {
                                                        setData('inventaris_ids', current.filter((id) => id !== inv.id));
                                                    }
                                                }}
                                                className="rounded border-border text-primary focus:ring-primary"
                                            />
                                            <span>{inv.nama_barang}</span>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    <SheetFooter>
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-border rounded-xl text-sm font-medium cursor-pointer"
                        >
                            Batal
                        </button>
                        <PrimaryButton disabled={processing}>Simpan Perubahan</PrimaryButton>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    );
}
