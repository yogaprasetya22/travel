import React, { useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import PageLayout from '@/Components/Layouts/PageLayout';
import { PageProps } from '@/Types';
import {
    Building2,
    Users,
    Package,
    Plus,
    Search,
    ExternalLink,
    Crown,
    ArrowRight,
    Edit2,
    Trash2,
    ShieldCheck,
    Check,
    Coins,
    Globe,
    Layers,
    Sparkles,
    AlertCircle,
} from 'lucide-react';
import PerPageSelector from '@/Components/PerPageSelector';
import DataTablePagination from '@/Components/DataTablePagination';

interface TenantOwner {
    id: number;
    name: string;
    email: string;
}

interface TenantItem {
    id: number;
    nama_travel: string;
    domain_atau_subdomain: string;
    logo?: string | null;
    created_at?: string;
    users_count: number;
    jamaah_count: number;
    paket_count: number;
    total_omzet?: number;
    users?: TenantOwner[];
}

interface PaginatedTenants {
    data: TenantItem[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from?: number | null;
    to?: number | null;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
}

interface Props extends PageProps {
    tenants: PaginatedTenants;
    metrics: {
        total_tenants: number;
        total_users: number;
        total_jamaah: number;
        total_omzet: number;
    };
    filters: {
        search: string;
        per_page: number;
    };
    activeTenantId: number;
}

export default function Index({ tenants, metrics, filters, activeTenantId }: Props) {
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    
    // Modal states
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    
    const [selectedTenant, setSelectedTenant] = useState<TenantItem | null>(null);

    // Create Form state
    const [createForm, setCreateForm] = useState({
        nama_travel: '',
        domain_atau_subdomain: '',
        owner_name: '',
        owner_email: '',
        owner_password: '',
    });
    const [createErrors, setCreateErrors] = useState<Record<string, string>>({});
    const [isSubmittingCreate, setIsSubmittingCreate] = useState(false);

    // Edit Form state
    const [editForm, setEditForm] = useState({
        nama_travel: '',
        domain_atau_subdomain: '',
    });
    const [editErrors, setEditErrors] = useState<Record<string, string>>({});
    const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

    const [isSubmittingDelete, setIsSubmittingDelete] = useState(false);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            route('tenants.index'),
            { search: searchQuery, per_page: filters.per_page },
            { preserveState: true }
        );
    };

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmittingCreate(true);
        setCreateErrors({});

        router.post(route('tenants.store'), createForm, {
            preserveScroll: true,
            onSuccess: () => {
                setIsCreateOpen(false);
                setCreateForm({
                    nama_travel: '',
                    domain_atau_subdomain: '',
                    owner_name: '',
                    owner_email: '',
                    owner_password: '',
                });
                setIsSubmittingCreate(false);
            },
            onError: (errs) => {
                setCreateErrors(errs);
                setIsSubmittingCreate(false);
            },
        });
    };

    const openEditModal = (tenant: TenantItem) => {
        setSelectedTenant(tenant);
        setEditForm({
            nama_travel: tenant.nama_travel,
            domain_atau_subdomain: tenant.domain_atau_subdomain,
        });
        setEditErrors({});
        setIsEditOpen(true);
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTenant) return;

        setIsSubmittingEdit(true);
        setEditErrors({});

        router.put(route('tenants.update', selectedTenant.id), editForm, {
            preserveScroll: true,
            onSuccess: () => {
                setIsEditOpen(false);
                setSelectedTenant(null);
                setIsSubmittingEdit(false);
            },
            onError: (errs) => {
                setEditErrors(errs);
                setIsSubmittingEdit(false);
            },
        });
    };

    const openDeleteModal = (tenant: TenantItem) => {
        setSelectedTenant(tenant);
        setIsDeleteOpen(true);
    };

    const handleDeleteSubmit = () => {
        if (!selectedTenant) return;
        setIsSubmittingDelete(true);
        router.delete(route('tenants.destroy', selectedTenant.id), {
            preserveScroll: true,
            onSuccess: () => {
                setIsDeleteOpen(false);
                setSelectedTenant(null);
                setIsSubmittingDelete(false);
            },
            onError: () => {
                setIsSubmittingDelete(false);
            },
        });
    };

    const handleEnterTenant = (tenant: TenantItem) => {
        router.post(route('tenants.enter', tenant.id));
    };

    return (
        <PageLayout
            title="Tenants Management"
            breadcrumbParent="Platform Master"
            breadcrumbPage="Tenants Management"
            contentClass="p-6 md:p-8 flex flex-col gap-6 w-full max-w-none"
        >
            {/* Page Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card/60 backdrop-blur-md p-6 rounded-2xl border border-border/80 shadow-xs">
                <div>
                    <div className="flex items-center gap-2.5">
                        <div className="h-8 w-1.5 rounded-full bg-primary" />
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                            Tenants &amp; Travel Agency Management
                        </h1>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 ml-4">
                        Pusat kontrol pendaftaran travel baru, alokasi domain, pemantauan staff, dan monitoring jamaah lintas multi-tenant SaaS.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => setIsCreateOpen(true)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs shadow-xs hover:bg-primary/90 transition cursor-pointer shrink-0"
                >
                    <Plus className="w-4 h-4" />
                    <span>Onboard Travel Baru</span>
                </button>
            </div>

            {/* Platform Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-card/70 border border-border/80 rounded-2xl p-5 shadow-xs flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <Building2 className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-xs font-semibold text-muted-foreground">Total Travel (Tenants)</div>
                        <div className="text-2xl font-extrabold text-foreground mt-0.5">
                            {metrics?.total_tenants || 0} <span className="text-xs font-normal text-muted-foreground">Agensi</span>
                        </div>
                    </div>
                </div>

                <div className="bg-card/70 border border-border/80 rounded-2xl p-5 shadow-xs flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                        <Users className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-xs font-semibold text-muted-foreground">Total Staff / Mitra Global</div>
                        <div className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 mt-0.5">
                            {metrics?.total_users || 0} <span className="text-xs font-normal text-muted-foreground">Pengguna</span>
                        </div>
                    </div>
                </div>

                <div className="bg-card/70 border border-border/80 rounded-2xl p-5 shadow-xs flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                        <Layers className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-xs font-semibold text-muted-foreground">Total Jamaah Terdaftar</div>
                        <div className="text-2xl font-extrabold text-purple-600 dark:text-purple-400 mt-0.5">
                            {metrics?.total_jamaah || 0} <span className="text-xs font-normal text-muted-foreground">Orang</span>
                        </div>
                    </div>
                </div>

                <div className="bg-card/70 border border-border/80 rounded-2xl p-5 shadow-xs flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                        <Coins className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-xs font-semibold text-muted-foreground">Total Omzet Transaksi</div>
                        <div className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
                            Rp {(metrics?.total_omzet || 0).toLocaleString('id-ID')}
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter Toolbar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card/60 p-4 rounded-2xl border border-border/80">
                <form onSubmit={handleSearch} className="relative w-full sm:w-80">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Cari nama travel atau subdomain..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 text-xs bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground placeholder:text-muted-foreground"
                    />
                </form>

                <PerPageSelector value={tenants.per_page} />
            </div>

            {/* Tenant Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(tenants.data || []).map((t) => {
                    const isActive = activeTenantId === t.id;
                    const owner = t.users && t.users.length > 0 ? t.users[0] : null;

                    return (
                        <div
                            key={t.id}
                            className={`rounded-2xl border bg-card/80 backdrop-blur-md p-6 shadow-xs flex flex-col justify-between gap-5 transition-all hover:shadow-md ${
                                isActive ? 'border-primary ring-2 ring-primary/20' : 'border-border/80'
                            }`}
                        >
                            {/* Card Top */}
                            <div className="flex flex-col gap-4">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-lg border border-primary/20 shrink-0">
                                            {t.nama_travel.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-base text-foreground leading-tight">
                                                {t.nama_travel}
                                            </h3>
                                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                                                <Globe className="w-3.5 h-3.5 text-primary" />
                                                <span className="font-medium text-foreground font-mono">{t.domain_atau_subdomain}.hajjflow.com</span>
                                            </div>
                                        </div>
                                    </div>
                                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                                        isActive
                                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                                            : 'bg-muted text-muted-foreground border-border'
                                    }`}>
                                        {isActive ? 'Aktif di Sesi' : 'Tenant Active'}
                                    </span>
                                </div>

                                {/* Owner Profile Info */}
                                <div className="bg-muted/40 rounded-xl p-3 border border-border/60 flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                                            <Crown className="w-4 h-4" />
                                        </div>
                                        <div className="min-w-0">
                                            <div className="text-[11px] font-bold text-foreground truncate">
                                                {owner ? owner.name : 'Owner Belum Terdaftar'}
                                            </div>
                                            <div className="text-[10px] text-muted-foreground truncate">
                                                {owner ? owner.email : '-'}
                                            </div>
                                        </div>
                                    </div>
                                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-background border border-border text-muted-foreground shrink-0">
                                        Owner
                                    </span>
                                </div>

                                {/* Tenant Metrics Pills */}
                                <div className="grid grid-cols-3 gap-2 text-center">
                                    <div className="bg-background/80 rounded-xl p-2 border border-border/70">
                                        <div className="text-xs font-extrabold text-foreground">{t.users_count || 0}</div>
                                        <div className="text-[10px] text-muted-foreground font-medium">Staff &amp; Agen</div>
                                    </div>
                                    <div className="bg-background/80 rounded-xl p-2 border border-border/70">
                                        <div className="text-xs font-extrabold text-foreground">{t.jamaah_count || 0}</div>
                                        <div className="text-[10px] text-muted-foreground font-medium">Jamaah</div>
                                    </div>
                                    <div className="bg-background/80 rounded-xl p-2 border border-border/70">
                                        <div className="text-xs font-extrabold text-foreground">{t.paket_count || 0}</div>
                                        <div className="text-[10px] text-muted-foreground font-medium">Paket Umroh</div>
                                    </div>
                                </div>

                                {/* Total Omzet Travel Pill */}
                                <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl px-3 py-2 flex items-center justify-between">
                                    <span className="text-[11px] font-semibold text-muted-foreground">Akumulasi Omzet:</span>
                                    <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                                        Rp {(t.total_omzet || 0).toLocaleString('id-ID')}
                                    </span>
                                </div>
                            </div>

                            {/* Card Actions */}
                            <div className="flex items-center gap-2 pt-3 border-t border-border/60">
                                <button
                                    type="button"
                                    onClick={() => handleEnterTenant(t)}
                                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-xs hover:bg-primary/90 transition cursor-pointer"
                                >
                                    <span>Masuk ke Travel</span>
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </button>

                                <button
                                    type="button"
                                    onClick={() => openEditModal(t)}
                                    className="p-2 rounded-xl border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition cursor-pointer shadow-2xs"
                                    title="Edit Informasi Tenant"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>

                                <button
                                    type="button"
                                    onClick={() => openDeleteModal(t)}
                                    className="p-2 rounded-xl border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 text-rose-600 dark:text-rose-400 transition cursor-pointer"
                                    title="Hapus Tenant"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Pagination Controls */}
            <div className="mt-2">
                <DataTablePagination
                    links={tenants.links}
                    currentPage={tenants.current_page}
                    lastPage={tenants.last_page}
                    total={tenants.total}
                    from={tenants.from}
                    to={tenants.to}
                />
            </div>

            {/* MODAL 1: ONBOARD TRAVEL BARU */}
            {isCreateOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-black/50 backdrop-blur-sm overflow-y-auto">
                    <div className="w-full max-w-3xl bg-card border border-border rounded-3xl shadow-2xl overflow-hidden animate-in fade-in-0 zoom-in-95 my-8">
                        <div className="p-6 md:p-8 border-b border-border/80 flex justify-between items-start bg-muted/20">
                            <div>
                                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                                    <Building2 className="w-5 h-5 text-primary" />
                                    <span>Onboard Tenant Travel Baru</span>
                                </h2>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Daftarkan travel agensi baru ke dalam ekosistem SaaS HajjFlow dengan konfigurasi instan.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsCreateOpen(false)}
                                className="text-muted-foreground hover:text-foreground p-1.5 rounded-xl hover:bg-muted transition text-sm cursor-pointer"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleCreateSubmit} className="p-6 md:p-8 flex flex-col gap-6">
                            {/* Alert Scaffold Info */}
                            <div className="flex items-start gap-3 p-4 rounded-2xl bg-primary/10 border border-primary/20 text-xs text-foreground">
                                <Sparkles className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                                <div className="leading-relaxed">
                                    <strong className="text-primary font-bold">Auto-Scaffold Sistem Otomatis:</strong> Saat travel dibuat, sistem akan langsung men-generate struktur jabatan hierarki (*Owner, Supervisor, Staff*), 5 tahapan CRM Leads, dan akun Owner pertama yang langsung dapat digunakan untuk login.
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-foreground mb-1.5">
                                        Nama Travel Agensi <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Contoh: PT Barokah Madinah Wisata"
                                        value={createForm.nama_travel}
                                        onChange={(e) => setCreateForm({ ...createForm, nama_travel: e.target.value })}
                                        className="w-full px-4 py-2.5 text-xs bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground shadow-2xs"
                                    />
                                    {createErrors.nama_travel && (
                                        <p className="text-[11px] text-rose-500 mt-1 font-medium">{createErrors.nama_travel}</p>
                                    )}
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-foreground mb-1.5">
                                        Subdomain / Slug Travel <span className="text-rose-500">*</span>
                                    </label>
                                    <div className="flex items-center shadow-2xs rounded-xl overflow-hidden border border-border">
                                        <input
                                            type="text"
                                            required
                                            placeholder="barokah"
                                            value={createForm.domain_atau_subdomain}
                                            onChange={(e) => setCreateForm({ ...createForm, domain_atau_subdomain: e.target.value })}
                                            className="w-full px-4 py-2.5 text-xs bg-background border-none focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground font-mono"
                                        />
                                        <span className="bg-muted px-4 py-2.5 text-xs text-muted-foreground font-mono font-bold border-l border-border shrink-0">
                                            .hajjflow.com
                                        </span>
                                    </div>
                                    {createErrors.domain_atau_subdomain && (
                                        <p className="text-[11px] text-rose-500 mt-1 font-medium">{createErrors.domain_atau_subdomain}</p>
                                    )}
                                </div>

                                <div className="md:col-span-2 pt-3 border-t border-border/70">
                                    <div className="text-xs font-bold text-foreground mb-1 flex items-center gap-1.5">
                                        <Crown className="w-4 h-4 text-amber-500" />
                                        <span>Informasi Kredensial Akun Owner Pertama</span>
                                    </div>
                                    <p className="text-[11px] text-muted-foreground mb-3">Akun pimpinan utama untuk login dan mengelola operasional travel ini.</p>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-foreground mb-1.5">
                                        Nama Lengkap Owner <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="H. Fulan Abdullah"
                                        value={createForm.owner_name}
                                        onChange={(e) => setCreateForm({ ...createForm, owner_name: e.target.value })}
                                        className="w-full px-4 py-2.5 text-xs bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground shadow-2xs"
                                    />
                                    {createErrors.owner_name && (
                                        <p className="text-[11px] text-rose-500 mt-1 font-medium">{createErrors.owner_name}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-foreground mb-1.5">
                                        Email Login Owner <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        placeholder="owner@barokah.com"
                                        value={createForm.owner_email}
                                        onChange={(e) => setCreateForm({ ...createForm, owner_email: e.target.value })}
                                        className="w-full px-4 py-2.5 text-xs bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground shadow-2xs"
                                    />
                                    {createErrors.owner_email && (
                                        <p className="text-[11px] text-rose-500 mt-1 font-medium">{createErrors.owner_email}</p>
                                    )}
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-foreground mb-1.5">
                                        Password Default Owner <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="password"
                                        required
                                        placeholder="Minimal 6 karakter"
                                        value={createForm.owner_password}
                                        onChange={(e) => setCreateForm({ ...createForm, owner_password: e.target.value })}
                                        className="w-full px-4 py-2.5 text-xs bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground shadow-2xs"
                                    />
                                    {createErrors.owner_password && (
                                        <p className="text-[11px] text-rose-500 mt-1 font-medium">{createErrors.owner_password}</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-5 border-t border-border/80">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateOpen(false)}
                                    className="px-5 py-2.5 rounded-xl border border-border bg-card hover:bg-muted text-xs font-semibold text-foreground transition cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmittingCreate}
                                    className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-xs hover:bg-primary/90 disabled:opacity-50 transition cursor-pointer"
                                >
                                    {isSubmittingCreate ? 'Menyimpan...' : 'Onboard & Buat Tenant'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 2: EDIT TENANT */}
            {isEditOpen && selectedTenant && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-black/50 backdrop-blur-sm overflow-y-auto">
                    <div className="w-full max-w-xl bg-card border border-border rounded-3xl shadow-2xl overflow-hidden animate-in fade-in-0 zoom-in-95 my-8">
                        <div className="p-6 md:p-7 border-b border-border/80 flex justify-between items-start bg-muted/20">
                            <div>
                                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                                    <Edit2 className="w-5 h-5 text-primary" />
                                    <span>Edit Informasi Tenant</span>
                                </h2>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Perbarui nama agensi atau subdomain travel.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsEditOpen(false)}
                                className="text-muted-foreground hover:text-foreground p-1.5 rounded-xl hover:bg-muted transition text-sm cursor-pointer"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleEditSubmit} className="p-6 md:p-7 flex flex-col gap-5">
                            <div>
                                <label className="block text-xs font-bold text-foreground mb-1.5">
                                    Nama Travel Agensi <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={editForm.nama_travel}
                                    onChange={(e) => setEditForm({ ...editForm, nama_travel: e.target.value })}
                                    className="w-full px-4 py-2.5 text-xs bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground shadow-2xs"
                                />
                                {editErrors.nama_travel && (
                                    <p className="text-[11px] text-rose-500 mt-1 font-medium">{editErrors.nama_travel}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-foreground mb-1.5">
                                    Subdomain / Slug <span className="text-rose-500">*</span>
                                </label>
                                <div className="flex items-center shadow-2xs rounded-xl overflow-hidden border border-border">
                                    <input
                                        type="text"
                                        required
                                        value={editForm.domain_atau_subdomain}
                                        onChange={(e) => setEditForm({ ...editForm, domain_atau_subdomain: e.target.value })}
                                        className="w-full px-4 py-2.5 text-xs bg-background border-none focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground font-mono"
                                    />
                                    <span className="bg-muted px-4 py-2.5 text-xs text-muted-foreground font-mono font-bold border-l border-border shrink-0">
                                        .hajjflow.com
                                    </span>
                                </div>
                                {editErrors.domain_atau_subdomain && (
                                    <p className="text-[11px] text-rose-500 mt-1 font-medium">{editErrors.domain_atau_subdomain}</p>
                                )}
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-5 border-t border-border/80">
                                <button
                                    type="button"
                                    onClick={() => setIsEditOpen(false)}
                                    className="px-5 py-2.5 rounded-xl border border-border bg-card hover:bg-muted text-xs font-semibold text-foreground transition cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmittingEdit}
                                    className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-xs hover:bg-primary/90 disabled:opacity-50 transition cursor-pointer"
                                >
                                    {isSubmittingEdit ? 'Menyimpan...' : 'Simpan Perubahan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 3: DELETE CONFIRMATION */}
            {isDeleteOpen && selectedTenant && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-black/50 backdrop-blur-sm overflow-y-auto">
                    <div className="w-full max-w-lg bg-card border border-border rounded-3xl shadow-2xl overflow-hidden animate-in fade-in-0 zoom-in-95 my-8">
                        <div className="p-6 md:p-7 flex flex-col items-center text-center gap-4">
                            <div className="h-14 w-14 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-500/20">
                                <AlertCircle className="w-7 h-7" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-foreground">Hapus Tenant Travel?</h3>
                                <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                                    Apakah Anda yakin ingin menghapus <strong className="text-foreground">{selectedTenant.nama_travel}</strong>? Seluruh data operasional, inventaris, dan akun jamaah travel ini akan dibersihkan dari sistem.
                                </p>
                            </div>
                        </div>

                        <div className="p-5 bg-muted/30 border-t border-border/80 flex items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setIsDeleteOpen(false)}
                                className="px-5 py-2.5 rounded-xl border border-border bg-card hover:bg-muted text-xs font-semibold text-foreground transition cursor-pointer"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                disabled={isSubmittingDelete}
                                onClick={handleDeleteSubmit}
                                className="px-5 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-bold shadow-xs hover:bg-rose-700 disabled:opacity-50 transition cursor-pointer"
                            >
                                {isSubmittingDelete ? 'Menghapus...' : 'Ya, Hapus Tenant'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </PageLayout>
    );
}
