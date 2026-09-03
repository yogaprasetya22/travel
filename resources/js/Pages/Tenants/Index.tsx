import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import PageLayout from '@/Components/Layouts/PageLayout';
import { PageProps } from '@/Types';
import { useTheme } from '@/Components/ThemeProvider';
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
    Coins,
    Globe,
    Layers,
} from 'lucide-react';
import PerPageSelector from '@/Components/PerPageSelector';
import DataTablePagination from '@/Components/DataTablePagination';
import {
    TenantItem,
    CreateTenantSheet,
    EditTenantSheet,
    DeleteTenantModal,
} from './TenantsPartials/TenantFormSheet';

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
    domainSuffix?: string;
}

export default function Index({ tenants, metrics, filters, activeTenantId, domainSuffix = '.hajjflow.com' }: Props) {
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const { themes } = useTheme();
    const themeList = Object.values(themes || {});

    // Drawer states
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [selectedEditTenant, setSelectedEditTenant] = useState<TenantItem | null>(null);
    const [selectedDeleteTenant, setSelectedDeleteTenant] = useState<TenantItem | null>(null);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            route('tenants.index'),
            { search: searchQuery, per_page: filters.per_page },
            { preserveState: true }
        );
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
                    <p className="text-xs text-muted-foreground mt-1 ml-4">
                        Kelola seluruh entitas bisnis travel agensi, isolasi multi-tenant database, dan akun Super Owner.
                    </p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <button
                        type="button"
                        onClick={() => setIsCreateOpen(true)}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-sm hover:bg-primary/90 transition-all cursor-pointer w-full md:w-auto"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Onboard Tenant Baru</span>
                    </button>
                </div>
            </div>

            {/* Platform Metrics Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-card border border-border/80 rounded-2xl p-5 flex items-center gap-4 shadow-2xs">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <Building2 className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Total Travel Agensi</p>
                        <h3 className="text-2xl font-extrabold text-foreground mt-0.5">{metrics.total_tenants}</h3>
                        <p className="text-[10px] text-muted-foreground">Terdaftar di ekosistem</p>
                    </div>
                </div>

                <div className="bg-card border border-border/80 rounded-2xl p-5 flex items-center gap-4 shadow-2xs">
                    <div className="h-12 w-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                        <Users className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Staff &amp; Mitra Agen</p>
                        <h3 className="text-2xl font-extrabold text-foreground mt-0.5">{metrics.total_users.toLocaleString('id-ID')}</h3>
                        <p className="text-[10px] text-muted-foreground">Di seluruh travel agensi</p>
                    </div>
                </div>

                <div className="bg-card border border-border/80 rounded-2xl p-5 flex items-center gap-4 shadow-2xs">
                    <div className="h-12 w-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                        <Package className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Total Database Jamaah</p>
                        <h3 className="text-2xl font-extrabold text-foreground mt-0.5">{metrics.total_jamaah.toLocaleString('id-ID')}</h3>
                        <p className="text-[10px] text-muted-foreground">Prospek &amp; Jamaah Closing</p>
                    </div>
                </div>

                <div className="bg-card border border-border/80 rounded-2xl p-5 flex items-center gap-4 shadow-2xs">
                    <div className="h-12 w-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                        <Coins className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Akumulasi Omzet Platform</p>
                        <h3 className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
                            Rp {(metrics.total_omzet || 0).toLocaleString('id-ID')}
                        </h3>
                        <p className="text-[10px] text-muted-foreground">Total transaksi terverifikasi</p>
                    </div>
                </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 bg-card/40 p-3 rounded-2xl border border-border/60">
                <form onSubmit={handleSearch} className="relative flex-1 max-w-md">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Cari nama travel atau subdomain..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 text-xs bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground shadow-2xs"
                    />
                </form>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                    <PerPageSelector
                        value={filters.per_page}
                        options={[6, 12, 24, 48]}
                    />
                </div>
            </div>

            {/* Tenants Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {tenants.data.map((t) => {
                    const isCurrentActive = t.id === activeTenantId;
                    const owner = t.users && t.users.length > 0 ? t.users[0] : null;

                    return (
                        <div
                            key={t.id}
                            className={`bg-card rounded-2xl border p-5 flex flex-col justify-between gap-5 transition-all relative overflow-hidden group ${
                                isCurrentActive
                                    ? 'border-primary ring-2 ring-primary/20 shadow-md'
                                    : 'border-border/80 hover:border-border hover:shadow-xs'
                            }`}
                        >
                            {/* Card Top */}
                            <div className="flex flex-col gap-4">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className="h-12 w-12 rounded-xl bg-muted/60 border border-border flex items-center justify-center text-foreground font-black text-lg shadow-2xs shrink-0">
                                            {t.nama_travel.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-sm text-foreground group-hover:text-primary transition line-clamp-1">
                                                {t.nama_travel}
                                            </h3>
                                            <div className="flex items-center gap-1.5 mt-0.5 text-xs text-muted-foreground font-mono">
                                                <Globe className="w-3.5 h-3.5 text-primary" />
                                                <span>{t.domain_atau_subdomain}{domainSuffix}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end gap-1 shrink-0">
                                        {isCurrentActive ? (
                                            <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-2xs">
                                                Aktif di Sesi
                                            </span>
                                        ) : (
                                            <span className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-muted text-muted-foreground border border-border">
                                                Tenant Active
                                            </span>
                                        )}
                                        {t.theme_name && (
                                            <span className="px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                                                Tema: {t.theme_name}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Owner Information Box */}
                                <div className="bg-muted/30 border border-border/70 rounded-xl p-3 flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <div className="h-7 w-7 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                                            <Crown className="w-4 h-4" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs font-bold text-foreground truncate">
                                                {owner ? owner.name : 'Owner Belum Ditentukan'}
                                            </p>
                                            <p className="text-[10px] text-muted-foreground truncate">
                                                {owner ? owner.email : '-'}
                                            </p>
                                        </div>
                                    </div>
                                    <span className="text-[10px] text-muted-foreground font-semibold shrink-0 bg-background px-2 py-1 rounded-md border border-border">
                                        Owner
                                    </span>
                                </div>

                                {/* Metrics Summary Pill Grid */}
                                <div className="grid grid-cols-3 gap-2 text-center">
                                    <div className="bg-muted/20 border border-border/50 rounded-xl p-2.5">
                                        <span className="text-xs font-extrabold text-foreground block">{t.users_count || 0}</span>
                                        <span className="text-[10px] text-muted-foreground block mt-0.5">Staff &amp; Agen</span>
                                    </div>
                                    <div className="bg-muted/20 border border-border/50 rounded-xl p-2.5">
                                        <span className="text-xs font-extrabold text-foreground block">{(t.jamaah_count || 0).toLocaleString('id-ID')}</span>
                                        <span className="text-[10px] text-muted-foreground block mt-0.5">Jamaah</span>
                                    </div>
                                    <div className="bg-muted/20 border border-border/50 rounded-xl p-2.5">
                                        <span className="text-xs font-extrabold text-foreground block">{t.paket_count || 0}</span>
                                        <span className="text-[10px] text-muted-foreground block mt-0.5">Paket Umroh</span>
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
                                    onClick={() => setSelectedEditTenant(t)}
                                    className="p-2 rounded-xl border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition cursor-pointer shadow-2xs"
                                    title="Edit Informasi Tenant"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setSelectedDeleteTenant(t)}
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

            {/* DRAWER 1: ONBOARD TRAVEL BARU */}
            <CreateTenantSheet
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                domainSuffix={domainSuffix}
                themeList={themeList}
            />

            {/* DRAWER 2: EDIT TENANT */}
            <EditTenantSheet
                selectedTenant={selectedEditTenant}
                onClose={() => setSelectedEditTenant(null)}
                domainSuffix={domainSuffix}
                themeList={themeList}
            />

            {/* DRAWER 3: DELETE CONFIRMATION */}
            <DeleteTenantModal
                selectedTenant={selectedDeleteTenant}
                onClose={() => setSelectedDeleteTenant(null)}
            />
        </PageLayout>
    );
}
