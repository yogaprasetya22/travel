import React from 'react';
import { router } from '@inertiajs/react';
import { toRupiah } from '@/Components/CurrencyInput';
import {
    Plus,
    Calendar,
    Edit2,
    Trash2,
    Power,
} from 'lucide-react';
import { PackageItem } from './types';

interface PackagesTabProps {
    packages: PackageItem[];
    onOpenAddPackage: () => void;
    onOpenEditPackage: (pkg: PackageItem) => void;
}

export function PackagesTab({
    packages,
    onOpenAddPackage,
    onOpenEditPackage,
}: PackagesTabProps) {
    const handleTogglePackage = (pkg: PackageItem) => {
        router.patch(
            route('settings.master.toggle-package', pkg.id),
            {},
            { preserveScroll: true }
        );
    };

    const handleDeletePackage = (pkg: PackageItem) => {
        if (window.confirm(`Apakah Anda yakin ingin menghapus paket travel "${pkg.nama_paket}"?`)) {
            router.delete(route('settings.master.destroy-package', pkg.id), {
                preserveScroll: true,
            });
        }
    };

    return (
        <div className="flex flex-col gap-5 bg-card/70 border border-border/80 rounded-2xl p-6 shadow-xs">
            <div className="flex justify-between items-center pb-3 border-b border-border/60">
                <div>
                    <h3 className="font-bold text-base text-foreground">Daftar Paket Umroh & Haji</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Produk layanan travel lengkap dengan komisi agen dan paket inventaris.</p>
                </div>
                <button
                    type="button"
                    onClick={onOpenAddPackage}
                    className="inline-flex items-center gap-2 px-3.5 py-2 bg-primary text-primary-foreground font-semibold rounded-xl text-xs hover:opacity-90 transition cursor-pointer shadow-xs"
                >
                    <Plus className="w-4 h-4" />
                    <span>Tambah Paket</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {packages.map((pkg) => {
                    const hasPercentage = Number(pkg.komisi_persentase) > 0;
                    const hasPeriod = pkg.periode_mulai || pkg.periode_selesai;
                    const isActive = pkg.is_active !== false;

                    return (
                        <div
                            key={pkg.id}
                            className={`p-4 rounded-xl border flex flex-col justify-between gap-3 shadow-xs transition-all ${
                                isActive
                                    ? 'border-border/70 bg-card/60'
                                    : 'border-dashed border-border/60 bg-muted/20 opacity-80'
                            }`}
                        >
                            <div>
                                <div className="flex items-start justify-between gap-2">
                                    <div>
                                        <h4 className="font-bold text-sm text-foreground">{pkg.nama_paket}</h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                                hasPercentage
                                                    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                                                    : 'bg-primary/10 text-primary border-primary/20'
                                            }`}>
                                                {hasPercentage ? `Komisi ${pkg.komisi_persentase}%` : 'Komisi Flat'}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => handleTogglePackage(pkg)}
                                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition cursor-pointer flex items-center gap-1 ${
                                                    isActive
                                                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                                                        : 'bg-muted text-muted-foreground border-border hover:bg-muted/80'
                                                }`}
                                                title="Klik untuk mengubah status aktif/non-aktif"
                                            >
                                                <Power className="w-2.5 h-2.5" />
                                                <span>{isActive ? 'Aktif' : 'Non-Aktif'}</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Card Actions: Edit & Delete */}
                                    <div className="flex items-center gap-1 shrink-0">
                                        <button
                                            type="button"
                                            onClick={() => onOpenEditPackage(pkg)}
                                            className="p-1.5 rounded-lg border border-border/80 bg-card text-muted-foreground hover:text-foreground hover:bg-muted transition cursor-pointer shadow-2xs"
                                            title="Edit Paket"
                                        >
                                            <Edit2 className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleDeletePackage(pkg)}
                                            className="p-1.5 rounded-lg border border-red-500/20 bg-red-500/5 text-red-600 dark:text-red-400 hover:bg-red-500/15 transition cursor-pointer shadow-2xs"
                                            title="Hapus Paket"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>

                                <div className="text-base font-extrabold text-primary mt-2">
                                    {toRupiah(pkg.harga)}
                                </div>
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                                    <Calendar className="w-3.5 h-3.5 text-primary shrink-0" />
                                    <span>
                                        {hasPeriod
                                            ? `${pkg.periode_mulai ? new Date(pkg.periode_mulai).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Awal'} s/d ${pkg.periode_selesai ? new Date(pkg.periode_selesai).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Seterusnya'}`
                                            : 'Periode Aktif: Berlaku Selamanya'}
                                    </span>
                                </div>
                            </div>

                            <div className="text-xs text-muted-foreground pt-2 border-t border-border/40 flex flex-col gap-1.5">
                                <div className="flex justify-between items-center">
                                    <span>Skema Komisi Agen:</span>
                                    <strong className="text-foreground">
                                        {hasPercentage
                                            ? `${pkg.komisi_persentase}% (${toRupiah((Number(pkg.harga) * Number(pkg.komisi_persentase)) / 100)})`
                                            : toRupiah(pkg.komisi_flat)}
                                    </strong>
                                </div>
                                {pkg.inventaris && pkg.inventaris.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {pkg.inventaris.map((inv) => (
                                            <span key={inv.id} className="px-2 py-0.5 bg-muted rounded text-[10px] text-foreground/80">
                                                {inv.nama_barang}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
                {packages.length === 0 && (
                    <div className="col-span-2 py-12 text-center text-xs text-muted-foreground italic">
                        Belum ada paket perjalanan umroh/haji yang didaftarkan.
                    </div>
                )}
            </div>
        </div>
    );
}
