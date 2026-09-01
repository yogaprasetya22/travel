import React, { useState, useEffect } from 'react';
import { useForm, usePage, router } from '@inertiajs/react';
import { PageProps } from '@/Types';
import PageLayout from '@/Components/Layouts/PageLayout';
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
    GitPullRequest,
    Package,
    Landmark,
    Plus,
    CheckCircle2,
    Layers,
    Share2,
    SlidersHorizontal,
    Tag,
    Percent,
    Banknote,
    Calendar,
    Edit2,
    Trash2,
    Power,
    Check,
} from 'lucide-react';

interface Stage {
    id: number;
    nama_tahap: string;
    urutan: number;
    periode_mulai?: string | null;
    periode_selesai?: string | null;
    is_active?: boolean;
}

interface PackageItem {
    id: number;
    nama_paket: string;
    harga: number;
    komisi_flat: number;
    komisi_persentase: number;
    periode_mulai?: string | null;
    periode_selesai?: string | null;
    is_active?: boolean;
    inventaris?: Array<{
        id: number;
        nama_barang: string;
    }>;
}

interface BankItem {
    id: number;
    nama_bank: string;
    nomor_rekening: string;
    atas_nama: string;
    is_active: boolean;
}

interface InventoryItem {
    id: number;
    nama_barang: string;
}

interface MasterDataProps extends PageProps {
    stages: Stage[];
    packages: PackageItem[];
    banks: BankItem[];
    inventoryItems: InventoryItem[];
    activeTab?: string;
}

export default function MasterData({
    stages = [],
    packages = [],
    banks = [],
    inventoryItems = [],
}: MasterDataProps) {
    const { auth } = usePage<PageProps>().props;
    const [currentTab, setCurrentTab] = useState<'stages' | 'packages' | 'banks' | 'sources'>('stages');

    useEffect(() => {
        const path = window.location.pathname;
        if (path.includes('stages')) setCurrentTab('stages');
        else if (path.includes('packages')) setCurrentTab('packages');
        else if (path.includes('banks')) setCurrentTab('banks');
    }, []);

    // Drawers states
    const [isAddStageOpen, setIsAddStageOpen] = useState(false);
    const [isAddPackageOpen, setIsAddPackageOpen] = useState(false);
    const [isEditPackageOpen, setIsEditPackageOpen] = useState(false);
    const [editingPackage, setEditingPackage] = useState<PackageItem | null>(null);
    const [isAddBankOpen, setIsAddBankOpen] = useState(false);
    const [commissionType, setCommissionType] = useState<'flat' | 'percentage'>('flat');
    const [editCommissionType, setEditCommissionType] = useState<'flat' | 'percentage'>('flat');

    // Form Stage
    const stageForm = useForm({
        nama_tahap: '',
        urutan: stages.length + 1,
        periode_mulai: '',
        periode_selesai: '',
        is_active: true,
    });

    // Form Package (Create)
    const packageForm = useForm({
        nama_paket: '',
        harga: '',
        komisi_flat: '1500000',
        komisi_persentase: '5',
        periode_mulai: '',
        periode_selesai: '',
        is_active: true,
        inventaris_ids: [] as number[],
    });

    // Form Package (Edit)
    const editPackageForm = useForm({
        nama_paket: '',
        harga: '',
        komisi_flat: '0',
        komisi_persentase: '0',
        periode_mulai: '',
        periode_selesai: '',
        is_active: true,
        inventaris_ids: [] as number[],
    });

    // Form Bank
    const bankForm = useForm({
        nama_bank: '',
        nomor_rekening: '',
        atas_nama: '',
    });

    const handleStageSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        stageForm.post(route('settings.master.store-stage'), {
            onSuccess: () => {
                stageForm.reset();
                setIsAddStageOpen(false);
            },
        });
    };

    const handlePackageSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        packageForm.post(route('settings.master.store-package'), {
            onSuccess: () => {
                packageForm.reset();
                setIsAddPackageOpen(false);
            },
        });
    };

    const handleOpenEditPackage = (pkg: PackageItem) => {
        setEditingPackage(pkg);
        const isPct = Number(pkg.komisi_persentase) > 0;
        setEditCommissionType(isPct ? 'percentage' : 'flat');

        editPackageForm.setData({
            nama_paket: pkg.nama_paket,
            harga: pkg.harga.toString(),
            komisi_flat: (pkg.komisi_flat || 0).toString(),
            komisi_persentase: (pkg.komisi_persentase || 0).toString(),
            periode_mulai: pkg.periode_mulai ? pkg.periode_mulai.split('T')[0] : '',
            periode_selesai: pkg.periode_selesai ? pkg.periode_selesai.split('T')[0] : '',
            is_active: pkg.is_active !== false,
            inventaris_ids: (pkg.inventaris || []).map((i) => i.id),
        });

        setIsEditPackageOpen(true);
    };

    const handleEditPackageSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingPackage) return;

        editPackageForm.put(route('settings.master.update-package', editingPackage.id), {
            preserveScroll: true,
            onSuccess: () => {
                setIsEditPackageOpen(false);
                setEditingPackage(null);
            },
        });
    };

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

    const handleBankSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        bankForm.post(route('settings.master.store-bank'), {
            onSuccess: () => {
                bankForm.reset();
                setIsAddBankOpen(false);
            },
        });
    };

    return (
        <PageLayout
            title="Data Master Travel"
            breadcrumbParent="Settings Travel"
            breadcrumbPage="Data Master"
            contentClass="p-6 md:p-8 flex flex-col gap-6 w-full max-w-none"
        >
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-card/60 backdrop-blur-md p-6 rounded-2xl border border-border/80 shadow-xs">
                <div>
                    <div className="flex items-center gap-2.5">
                        <div className="h-8 w-1.5 rounded-full bg-primary" />
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                            Manajemen Data Master Operasional
                        </h1>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 ml-4">
                        Kelola data referensi tahapan pipeline CRM, paket umroh & haji, rekening bank resmi, dan klasifikasi prospek.
                    </p>
                </div>
            </div>

            {/* Master Data Grid Structure */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Navigation Categories Sidebar */}
                <div className="lg:col-span-3 flex flex-row lg:flex-col gap-1.5 bg-card/60 backdrop-blur-md p-3 rounded-2xl border border-border/80 shadow-xs overflow-x-auto">
                    <button
                        onClick={() => setCurrentTab('stages')}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all text-left w-full cursor-pointer ${
                            currentTab === 'stages'
                                ? 'bg-primary text-primary-foreground shadow-xs'
                                : 'text-foreground/80 hover:bg-muted hover:text-foreground'
                        }`}
                    >
                        <GitPullRequest className="w-4 h-4 shrink-0" />
                        <span>1. Tahapan CRM (Pipeline)</span>
                    </button>

                    <button
                        onClick={() => setCurrentTab('packages')}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all text-left w-full cursor-pointer ${
                            currentTab === 'packages'
                                ? 'bg-primary text-primary-foreground shadow-xs'
                                : 'text-foreground/80 hover:bg-muted hover:text-foreground'
                        }`}
                    >
                        <Package className="w-4 h-4 shrink-0" />
                        <span>2. Paket Umroh & Haji</span>
                    </button>

                    <button
                        onClick={() => setCurrentTab('banks')}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all text-left w-full cursor-pointer ${
                            currentTab === 'banks'
                                ? 'bg-primary text-primary-foreground shadow-xs'
                                : 'text-foreground/80 hover:bg-muted hover:text-foreground'
                        }`}
                    >
                        <Landmark className="w-4 h-4 shrink-0" />
                        <span>3. Rekening Bank Travel</span>
                    </button>

                    <button
                        onClick={() => setCurrentTab('sources')}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all text-left w-full cursor-pointer ${
                            currentTab === 'sources'
                                ? 'bg-primary text-primary-foreground shadow-xs'
                                : 'text-foreground/80 hover:bg-muted hover:text-foreground'
                        }`}
                    >
                        <Share2 className="w-4 h-4 shrink-0" />
                        <span>4. Sumber Prospek (Lead Sources)</span>
                    </button>
                </div>

                {/* Tab Content Panel */}
                <div className="lg:col-span-9 flex flex-col gap-6">
                    {/* 1. STAGES TAB */}
                    {currentTab === 'stages' && (
                        <div className="flex flex-col gap-5 bg-card/70 border border-border/80 rounded-2xl p-6 shadow-xs">
                            <div className="flex justify-between items-center pb-3 border-b border-border/60">
                                <div>
                                    <h3 className="font-bold text-base text-foreground">Daftar Tahapan Pipeline CRM</h3>
                                    <p className="text-xs text-muted-foreground mt-0.5">Urutan alur konversi leads dari pendaftaran awal hingga closing.</p>
                                </div>
                                <button
                                    onClick={() => setIsAddStageOpen(true)}
                                    className="inline-flex items-center gap-2 px-3.5 py-2 bg-primary text-primary-foreground font-semibold rounded-xl text-xs hover:opacity-90 transition cursor-pointer"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span>Tambah Tahap</span>
                                </button>
                            </div>

                            <div className="divide-y divide-border/60">
                                {stages.map((stg) => {
                                    const hasPeriod = stg.periode_mulai || stg.periode_selesai;
                                    const isActive = stg.is_active !== false;

                                    return (
                                        <div key={stg.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                            <div className="flex items-center gap-3">
                                                <span className="h-8 w-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                                                    {stg.urutan}
                                                </span>
                                                <div>
                                                    <div className="font-bold text-sm text-foreground">{stg.nama_tahap}</div>
                                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                                                        <Calendar className="w-3.5 h-3.5 text-primary" />
                                                        <span>
                                                            {hasPeriod
                                                                ? `${stg.periode_mulai ? new Date(stg.periode_mulai).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Awal'} s/d ${stg.periode_selesai ? new Date(stg.periode_selesai).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Seterusnya'}`
                                                                : 'Periode Aktif: Berlaku Selamanya'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 self-end sm:self-auto">
                                                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                                                    isActive
                                                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                                                        : 'bg-muted text-muted-foreground border-border'
                                                }`}>
                                                    {isActive ? 'Tahap Aktif' : 'Non-Aktif'}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* 2. PACKAGES TAB */}
                    {currentTab === 'packages' && (
                        <div className="flex flex-col gap-5 bg-card/70 border border-border/80 rounded-2xl p-6 shadow-xs">
                            <div className="flex justify-between items-center pb-3 border-b border-border/60">
                                <div>
                                    <h3 className="font-bold text-base text-foreground">Daftar Paket Umroh & Haji</h3>
                                    <p className="text-xs text-muted-foreground mt-0.5">Produk layanan travel lengkap dengan komisi agen dan paket inventaris.</p>
                                </div>
                                <button
                                    onClick={() => setIsAddPackageOpen(true)}
                                    className="inline-flex items-center gap-2 px-3.5 py-2 bg-primary text-primary-foreground font-semibold rounded-xl text-xs hover:opacity-90 transition cursor-pointer"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span>Tambah Paket</span>
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {packages.map((pkg) => {
                                    const hasPercentage = Number(pkg.komisi_persentase) > 0;
                                    const hasFlat = Number(pkg.komisi_flat) > 0;
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
                                                            onClick={() => handleOpenEditPackage(pkg)}
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
                            </div>
                        </div>
                    )}

                    {/* 3. BANKS TAB */}
                    {currentTab === 'banks' && (
                        <div className="flex flex-col gap-5 bg-card/70 border border-border/80 rounded-2xl p-6 shadow-xs">
                            <div className="flex justify-between items-center pb-3 border-b border-border/60">
                                <div>
                                    <h3 className="font-bold text-base text-foreground">Daftar Rekening Bank Resmi Travel</h3>
                                    <p className="text-xs text-muted-foreground mt-0.5">Rekening tujuan transfer dana calon jamaah dan verifikasi finance.</p>
                                </div>
                                <button
                                    onClick={() => setIsAddBankOpen(true)}
                                    className="inline-flex items-center gap-2 px-3.5 py-2 bg-primary text-primary-foreground font-semibold rounded-xl text-xs hover:opacity-90 transition cursor-pointer"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span>Tambah Rekening</span>
                                </button>
                            </div>

                            <div className="divide-y divide-border/60">
                                {banks.map((bnk) => (
                                    <div key={bnk.id} className="py-3.5 flex items-center justify-between">
                                        <div>
                                            <div className="font-bold text-sm text-foreground">{bnk.nama_bank} - {bnk.nomor_rekening}</div>
                                            <div className="text-xs text-muted-foreground mt-0.5">Atas Nama: <strong className="text-foreground">{bnk.atas_nama}</strong></div>
                                        </div>
                                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                            Aktif Menerima Transfer
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 4. SOURCES TAB */}
                    {currentTab === 'sources' && (
                        <div className="flex flex-col gap-5 bg-card/70 border border-border/80 rounded-2xl p-6 shadow-xs">
                            <div className="pb-3 border-b border-border/60">
                                <h3 className="font-bold text-base text-foreground">Kategori Sumber Prospek (Lead Channel Sources)</h3>
                                <p className="text-xs text-muted-foreground mt-0.5">Daftar saluran akuisisi leads untuk analisis konversi marketing.</p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {[
                                    { name: 'Instagram & Facebook Ads', desc: 'Iklan bersponsor media sosial' },
                                    { name: 'Referral Mitra Agen', desc: 'Direct sales dari mitra agen lapangan' },
                                    { name: 'Portal Pendaftaran Mandiri (B2C)', desc: 'Link registrasi email & website travel' },
                                    { name: 'Walk-in Kantor Pusat', desc: 'Jamaah datang langsung ke kantor' },
                                ].map((src, idx) => (
                                    <div key={idx} className="p-3.5 rounded-xl border border-border/60 bg-muted/30 flex items-center gap-3">
                                        <Tag className="w-4 h-4 text-primary shrink-0" />
                                        <div>
                                            <div className="font-bold text-sm text-foreground">{src.name}</div>
                                            <div className="text-xs text-muted-foreground">{src.desc}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Drawer: Add Stage */}
            <Sheet open={isAddStageOpen} onOpenChange={setIsAddStageOpen}>
                <SheetContent side="right" className="w-1/2 max-w-none">
                    <SheetHeader>
                        <SheetTitle>Tambah Tahapan Pipeline CRM</SheetTitle>
                        <SheetDescription>Daftarkan tahapan baru pada siklus prospek jamaah beserta periode waktu aktif berlakunya.</SheetDescription>
                    </SheetHeader>
                    <form onSubmit={handleStageSubmit} className="flex flex-col gap-5 p-4 flex-1 overflow-y-auto">
                        <div>
                            <InputLabel htmlFor="nama_tahap" value="Nama Tahapan" />
                            <TextInput id="nama_tahap" type="text" value={stageForm.data.nama_tahap} className="mt-1 block w-full"
                                onChange={(e) => stageForm.setData('nama_tahap', e.target.value)} required placeholder="Contoh: Jadwal Manasik..." />
                            <InputError message={stageForm.errors.nama_tahap} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="urutan" value="Nomor Urutan Alur" />
                            <TextInput id="urutan" type="number" value={stageForm.data.urutan} className="mt-1 block w-full"
                                onChange={(e) => stageForm.setData('urutan', parseInt(e.target.value, 10))} required />
                            <InputError message={stageForm.errors.urutan} className="mt-2" />
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
                                        value={stageForm.data.periode_mulai}
                                        className="mt-1 block w-full text-xs"
                                        onChange={(e) => stageForm.setData('periode_mulai', e.target.value)}
                                    />
                                    <InputError message={stageForm.errors.periode_mulai} className="mt-1" />
                                </div>
                                <div>
                                    <InputLabel htmlFor="periode_selesai" value="Tanggal Berakhir (Opsional)" />
                                    <TextInput
                                        id="periode_selesai"
                                        type="date"
                                        value={stageForm.data.periode_selesai}
                                        className="mt-1 block w-full text-xs"
                                        onChange={(e) => stageForm.setData('periode_selesai', e.target.value)}
                                    />
                                    <InputError message={stageForm.errors.periode_selesai} className="mt-1" />
                                </div>
                            </div>
                            <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer pt-1">
                                <input
                                    type="checkbox"
                                    checked={stageForm.data.is_active}
                                    onChange={(e) => stageForm.setData('is_active', e.target.checked)}
                                    className="rounded border-border text-primary focus:ring-primary"
                                />
                                <span>Status Tahapan Langsung Aktif di CRM</span>
                            </label>
                        </div>

                        <SheetFooter>
                            <button type="button" onClick={() => setIsAddStageOpen(false)} className="px-4 py-2 border border-border rounded-xl text-sm font-medium">Batal</button>
                            <PrimaryButton disabled={stageForm.processing}>Simpan Tahap</PrimaryButton>
                        </SheetFooter>
                    </form>
                </SheetContent>
            </Sheet>

            {/* Drawer: Add Package */}
            <Sheet open={isAddPackageOpen} onOpenChange={setIsAddPackageOpen}>
                <SheetContent side="right" className="w-1/2 max-w-none">
                    <SheetHeader>
                        <SheetTitle>Tambah Paket Umroh & Haji</SheetTitle>
                        <SheetDescription>Daftarkan produk paket travel, skema komisi agen (standar / persentase), dan paket perlengkapan.</SheetDescription>
                    </SheetHeader>
                    <form onSubmit={handlePackageSubmit} className="flex flex-col gap-5 p-4 flex-1 overflow-y-auto">
                        <div>
                            <InputLabel htmlFor="nama_paket" value="Nama Paket" />
                            <TextInput id="nama_paket" type="text" value={packageForm.data.nama_paket} className="mt-1 block w-full"
                                onChange={(e) => packageForm.setData('nama_paket', e.target.value)} required placeholder="Misal: Umroh Ramadhan VIP 2027" />
                            <InputError message={packageForm.errors.nama_paket} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="harga" value="Harga Paket" />
                            <div className="mt-1">
                                <CurrencyInput
                                    id="harga"
                                    value={packageForm.data.harga}
                                    onChange={(val) => packageForm.setData('harga', val)}
                                    placeholder="35.000.000"
                                    required
                                />
                            </div>
                            <InputError message={packageForm.errors.harga} className="mt-2" />
                        </div>

                        {/* Commission Type Switcher */}
                        <div className="flex flex-col gap-2 p-4 rounded-xl bg-muted/40 border border-border">
                            <InputLabel value="Skema Komisi Agen" />
                            <div className="grid grid-cols-2 gap-2 mt-1">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setCommissionType('flat');
                                        packageForm.setData('komisi_persentase', '0');
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
                                        packageForm.setData('komisi_flat', '0');
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
                                            value={packageForm.data.komisi_flat}
                                            onChange={(val) => packageForm.setData('komisi_flat', val)}
                                            placeholder="1.500.000"
                                        />
                                    </div>
                                    <InputError message={packageForm.errors.komisi_flat} className="mt-2" />
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
                                            value={packageForm.data.komisi_persentase}
                                            className="block w-full pr-8"
                                            onChange={(e) => packageForm.setData('komisi_persentase', e.target.value)}
                                            placeholder="5"
                                        />
                                        <span className="absolute right-3 text-sm font-bold text-muted-foreground">%</span>
                                    </div>
                                    <p className="text-[11px] text-muted-foreground mt-1">
                                        Perkiraan komisi per jamaah: <strong className="text-foreground">{toRupiah((Number(packageForm.data.harga || 0) * Number(packageForm.data.komisi_persentase || 0)) / 100)}</strong>
                                    </p>
                                    <InputError message={packageForm.errors.komisi_persentase} className="mt-2" />
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
                                        value={packageForm.data.periode_mulai}
                                        className="mt-1 block w-full text-xs"
                                        onChange={(e) => packageForm.setData('periode_mulai', e.target.value)}
                                    />
                                    <InputError message={packageForm.errors.periode_mulai} className="mt-1" />
                                </div>
                                <div>
                                    <InputLabel htmlFor="pkg_periode_selesai" value="Tanggal Berakhir (Opsional)" />
                                    <TextInput
                                        id="pkg_periode_selesai"
                                        type="date"
                                        value={packageForm.data.periode_selesai}
                                        className="mt-1 block w-full text-xs"
                                        onChange={(e) => packageForm.setData('periode_selesai', e.target.value)}
                                    />
                                    <InputError message={packageForm.errors.periode_selesai} className="mt-1" />
                                </div>
                            </div>
                            <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer pt-1">
                                <input
                                    type="checkbox"
                                    checked={packageForm.data.is_active}
                                    onChange={(e) => packageForm.setData('is_active', e.target.checked)}
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
                                        const isChecked = packageForm.data.inventaris_ids.includes(inv.id);
                                        return (
                                            <label key={inv.id} className="flex items-center gap-2.5 text-xs text-foreground cursor-pointer p-1.5 rounded-lg hover:bg-muted">
                                                <input
                                                    type="checkbox"
                                                    checked={isChecked}
                                                    onChange={(e) => {
                                                        const current = packageForm.data.inventaris_ids;
                                                        if (e.target.checked) {
                                                            packageForm.setData('inventaris_ids', [...current, inv.id]);
                                                        } else {
                                                            packageForm.setData('inventaris_ids', current.filter((id) => id !== inv.id));
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
                            <button type="button" onClick={() => setIsAddPackageOpen(false)} className="px-4 py-2 border border-border rounded-xl text-sm font-medium">Batal</button>
                            <PrimaryButton disabled={packageForm.processing}>Simpan Paket</PrimaryButton>
                        </SheetFooter>
                    </form>
                </SheetContent>
            </Sheet>

            {/* Drawer: Edit Package */}
            <Sheet open={isEditPackageOpen} onOpenChange={setIsEditPackageOpen}>
                <SheetContent side="right" className="w-1/2 max-w-none">
                    <SheetHeader>
                        <SheetTitle>Edit Paket Umroh & Haji</SheetTitle>
                        <SheetDescription>Perbarui rincian harga paket, skema komisi agen, masa aktif, atau paket inventaris bawaan.</SheetDescription>
                    </SheetHeader>
                    <form onSubmit={handleEditPackageSubmit} className="flex flex-col gap-5 p-4 flex-1 overflow-y-auto">
                        <div>
                            <InputLabel htmlFor="edit_nama_paket" value="Nama Paket" />
                            <TextInput
                                id="edit_nama_paket"
                                type="text"
                                value={editPackageForm.data.nama_paket}
                                className="mt-1 block w-full"
                                onChange={(e) => editPackageForm.setData('nama_paket', e.target.value)}
                                required
                            />
                            <InputError message={editPackageForm.errors.nama_paket} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="edit_harga" value="Harga Paket" />
                            <div className="mt-1">
                                <CurrencyInput
                                    id="edit_harga"
                                    value={editPackageForm.data.harga}
                                    onChange={(val) => editPackageForm.setData('harga', val)}
                                    placeholder="35.000.000"
                                    required
                                />
                            </div>
                            <InputError message={editPackageForm.errors.harga} className="mt-2" />
                        </div>

                        {/* Commission Type Switcher */}
                        <div className="flex flex-col gap-2 p-4 rounded-xl bg-muted/40 border border-border">
                            <InputLabel value="Skema Komisi Agen" />
                            <div className="grid grid-cols-2 gap-2 mt-1">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEditCommissionType('flat');
                                        editPackageForm.setData('komisi_persentase', '0');
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
                                        editPackageForm.setData('komisi_flat', '0');
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
                                            value={editPackageForm.data.komisi_flat}
                                            onChange={(val) => editPackageForm.setData('komisi_flat', val)}
                                            placeholder="1.500.000"
                                        />
                                    </div>
                                    <InputError message={editPackageForm.errors.komisi_flat} className="mt-2" />
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
                                            value={editPackageForm.data.komisi_persentase}
                                            className="block w-full pr-8"
                                            onChange={(e) => editPackageForm.setData('komisi_persentase', e.target.value)}
                                            placeholder="5"
                                        />
                                        <span className="absolute right-3 text-sm font-bold text-muted-foreground">%</span>
                                    </div>
                                    <p className="text-[11px] text-muted-foreground mt-1">
                                        Perkiraan komisi per jamaah: <strong className="text-foreground">{toRupiah((Number(editPackageForm.data.harga || 0) * Number(editPackageForm.data.komisi_persentase || 0)) / 100)}</strong>
                                    </p>
                                    <InputError message={editPackageForm.errors.komisi_persentase} className="mt-2" />
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
                                        value={editPackageForm.data.periode_mulai}
                                        className="mt-1 block w-full text-xs"
                                        onChange={(e) => editPackageForm.setData('periode_mulai', e.target.value)}
                                    />
                                    <InputError message={editPackageForm.errors.periode_mulai} className="mt-1" />
                                </div>
                                <div>
                                    <InputLabel htmlFor="edit_pkg_periode_selesai" value="Tanggal Berakhir (Opsional)" />
                                    <TextInput
                                        id="edit_pkg_periode_selesai"
                                        type="date"
                                        value={editPackageForm.data.periode_selesai}
                                        className="mt-1 block w-full text-xs"
                                        onChange={(e) => editPackageForm.setData('periode_selesai', e.target.value)}
                                    />
                                    <InputError message={editPackageForm.errors.periode_selesai} className="mt-1" />
                                </div>
                            </div>
                            <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer pt-1">
                                <input
                                    type="checkbox"
                                    checked={editPackageForm.data.is_active}
                                    onChange={(e) => editPackageForm.setData('is_active', e.target.checked)}
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
                                        const isChecked = editPackageForm.data.inventaris_ids.includes(inv.id);
                                        return (
                                            <label key={inv.id} className="flex items-center gap-2.5 text-xs text-foreground cursor-pointer p-1.5 rounded-lg hover:bg-muted">
                                                <input
                                                    type="checkbox"
                                                    checked={isChecked}
                                                    onChange={(e) => {
                                                        const current = editPackageForm.data.inventaris_ids;
                                                        if (e.target.checked) {
                                                            editPackageForm.setData('inventaris_ids', [...current, inv.id]);
                                                        } else {
                                                            editPackageForm.setData('inventaris_ids', current.filter((id) => id !== inv.id));
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
                            <button type="button" onClick={() => setIsEditPackageOpen(false)} className="px-4 py-2 border border-border rounded-xl text-sm font-medium cursor-pointer">Batal</button>
                            <PrimaryButton disabled={editPackageForm.processing}>Simpan Perubahan</PrimaryButton>
                        </SheetFooter>
                    </form>
                </SheetContent>
            </Sheet>

            {/* Drawer: Add Bank */}
            <Sheet open={isAddBankOpen} onOpenChange={setIsAddBankOpen}>
                <SheetContent side="right" className="w-1/2 max-w-none">
                    <SheetHeader>
                        <SheetTitle>Tambah Rekening Bank Travel</SheetTitle>
                        <SheetDescription>Daftarkan rekening bank resmi travel.</SheetDescription>
                    </SheetHeader>
                    <form onSubmit={handleBankSubmit} className="flex flex-col gap-5 p-4 flex-1">
                        <div>
                            <InputLabel htmlFor="nama_bank" value="Nama Bank" />
                            <TextInput id="nama_bank" type="text" value={bankForm.data.nama_bank} className="mt-1 block w-full"
                                onChange={(e) => bankForm.setData('nama_bank', e.target.value)} required placeholder="Misal: Bank Syariah Indonesia (BSI)" />
                            <InputError message={bankForm.errors.nama_bank} className="mt-2" />
                        </div>
                        <div>
                            <InputLabel htmlFor="nomor_rekening" value="Nomor Rekening" />
                            <TextInput id="nomor_rekening" type="text" value={bankForm.data.nomor_rekening} className="mt-1 block w-full"
                                onChange={(e) => bankForm.setData('nomor_rekening', e.target.value)} required placeholder="7123456789" />
                            <InputError message={bankForm.errors.nomor_rekening} className="mt-2" />
                        </div>
                        <div>
                            <InputLabel htmlFor="atas_nama" value="Atas Nama" />
                            <TextInput id="atas_nama" type="text" value={bankForm.data.atas_nama} className="mt-1 block w-full"
                                onChange={(e) => bankForm.setData('atas_nama', e.target.value)} required placeholder="PT Travel Umroh Barokah" />
                            <InputError message={bankForm.errors.atas_nama} className="mt-2" />
                        </div>
                        <SheetFooter>
                            <button type="button" onClick={() => setIsAddBankOpen(false)} className="px-4 py-2 border border-border rounded-lg text-sm">Batal</button>
                            <PrimaryButton disabled={bankForm.processing}>Simpan</PrimaryButton>
                        </SheetFooter>
                    </form>
                </SheetContent>
            </Sheet>
        </PageLayout>
    );
}
