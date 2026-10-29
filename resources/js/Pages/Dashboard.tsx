import React, { useState } from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { PageProps } from '@/Types';
import PageLayout from '@/Components/Layouts/PageLayout';
import {
    Users,
    CheckCircle2,
    PackageCheck,
    Coins,
    ArrowUpRight,
    Truck,
    Receipt,
    Sparkles,
    BarChart3,
    PieChart as PieChartIcon,
    TrendingUp,
    Crown,
    Building2,
    ArrowRight,
    Award,
    Target,
    Layers,
    Calendar,
    Plane,
    Wallet,
    Filter,
    Printer,
    RotateCcw,
    CalendarDays,
} from 'lucide-react';
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    AreaChart,
    Area,
    PieChart,
    Pie,
    Cell,
} from 'recharts';

interface DashboardStats {
    total_leads: number;
    closing_count: number;
    total_omzet: number;
    logistics_ready_count: number;
    total_commission: number;
    paid_commission: number;
    ready_commission: number;
}

interface MonthlyTrendItem {
    month: string;
    omzet: number;
    closing: number;
    leads: number;
}

interface OmzetPackageItem {
    name: string;
    omzet: number;
    jamaah_count: number;
    harga: number;
}

interface OmzetKloterItem {
    kloter: string;
    omzet: number;
    jamaah_count: number;
}

interface PackageDistItem {
    name: string;
    value: number;
    harga: number;
}

interface CrmFunnelItem {
    stage: string;
    count: number;
    urutan: number;
}

interface TopAgentItem {
    id: number;
    name: string;
    email: string;
    closing_count: number;
    total_komisi: number;
}

interface DashboardAnalytics {
    monthly_trend: MonthlyTrendItem[];
    omzet_by_package: OmzetPackageItem[];
    omzet_by_kloter: OmzetKloterItem[];
    package_distribution: PackageDistItem[];
    crm_funnel: CrmFunnelItem[];
    top_agents: TopAgentItem[];
}

interface LogisticsItem {
    id: number;
    nama_lengkap: string;
    no_hp: string;
    paket: {
        nama_paket: string;
        harga: number;
    };
    agen: {
        name: string;
    } | null;
    inventaris_transaksi: Array<{
        id: number;
        qty: number;
        inventaris: {
            nama_barang: string;
        };
    }>;
}

interface PendingPayment {
    id: number;
    nominal: number;
    tipe_pembayaran: string;
    bukti_transfer: string;
    created_at: string;
    jamaah: {
        nama_lengkap: string;
        paket: {
            nama_paket: string;
        };
        agen: {
            name: string;
        } | null;
    };
    rekening_tenant: {
        nama_bank: string;
        nomor_rekening: string;
    };
}

interface FilterState {
    period: string;
    start_date?: string | null;
    end_date?: string | null;
    kloter_ym?: string | null;
}

interface AvailableKloter {
    value: string;
    label: string;
}

interface DashboardProps extends PageProps {
    tenant: {
        id: number;
        nama_travel: string;
        domain_atau_subdomain: string;
    };
    filters?: FilterState;
    availableKloters?: AvailableKloter[];
    stats: DashboardStats;
    analytics?: DashboardAnalytics;
    logisticsReadyList: LogisticsItem[];
    pendingPayments: PendingPayment[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

export default function Dashboard({
    tenant,
    filters = {
        period: 'this_year',
        start_date: null,
        end_date: null,
        kloter_ym: null,
    },
    availableKloters = [],
    stats,
    analytics = {
        monthly_trend: [],
        omzet_by_package: [],
        omzet_by_kloter: [],
        package_distribution: [],
        crm_funnel: [],
        top_agents: [],
    },
    logisticsReadyList = [],
    pendingPayments = [],
}: DashboardProps) {
    const { auth } = usePage<PageProps>().props;
    const isSuperAdmin = auth.user.role === 'super_admin_master';
    const isAgent = auth.user.role === 'agen';

    // Filter controls state
    const [period, setPeriod] = useState(filters.period || 'this_year');
    const [startDate, setStartDate] = useState(filters.start_date || '');
    const [endDate, setEndDate] = useState(filters.end_date || '');
    const [kloterYm, setKloterYm] = useState(filters.kloter_ym || '');

    // Omzet Dimension Tab: 'monthly' | 'package' | 'kloter'
    const [omzetDimension, setOmzetDimension] = useState<'monthly' | 'package' | 'kloter'>('monthly');

    const totalPackageJamaah = (analytics.package_distribution || []).reduce((acc, p) => acc + p.value, 0);

    const applyFilter = (newPeriod?: string, newKloter?: string) => {
        const p = newPeriod !== undefined ? newPeriod : period;
        const k = newKloter !== undefined ? newKloter : kloterYm;

        router.get(
            route('dashboard'),
            {
                period: p,
                start_date: p === 'custom' ? startDate : undefined,
                end_date: p === 'custom' ? endDate : undefined,
                kloter_ym: k || undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    const resetFilter = () => {
        setPeriod('this_year');
        setStartDate('');
        setEndDate('');
        setKloterYm('');
        router.get(route('dashboard'), { period: 'this_year' }, { preserveState: true, preserveScroll: true });
    };

    const handlePrint = () => {
        window.print();
    };

    const isFiltered =
        period !== 'this_year' ||
        Boolean(kloterYm) ||
        Boolean(startDate) ||
        Boolean(endDate);

    const getPeriodLabel = () => {
        if (period === 'this_year') return `Tahun ${new Date().getFullYear()}`;
        if (period === 'last_year') return `Tahun ${new Date().getFullYear() - 1}`;
        if (period === 'this_month') return 'Bulan Ini';
        if (period === 'all') return 'Semua Waktu (Historis)';
        if (period === 'custom') {
            return `${startDate || '...'} s.d. ${endDate || '...'}`;
        }
        return period;
    };

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-popover border border-border p-2.5 rounded-md shadow-md text-xs flex flex-col gap-1">
                    <p className="font-semibold text-foreground">{label}</p>
                    {payload.map((entry: any, index: number) => (
                        <p key={`item-${index}`} style={{ color: entry.color || entry.fill }} className="font-medium">
                            {entry.name}: {entry.name.toLowerCase().includes('omzet') || entry.dataKey === 'omzet'
                                ? `Rp ${Number(entry.value).toLocaleString('id-ID')}`
                                : `${Number(entry.value).toLocaleString('id-ID')} Orang`}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <PageLayout
            title="Dashboard Overview"
            breadcrumbParent="Overview"
            breadcrumbPage="Dashboard"
            contentClass="p-4 sm:p-6 flex flex-col gap-5 w-full max-w-none print:p-0 print:gap-4"
        >
            {/* Print Header (Only shows when printing/PDF export) */}
            <div className="hidden print:flex flex-col gap-1 pb-4 mb-2 border-b border-gray-300">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-bold text-black">{tenant?.nama_travel || 'Travel Aktif'}</h1>
                        <p className="text-xs text-gray-600">Laporan Eksekutif Kinerja Operasional & Keuangan</p>
                    </div>
                    <div className="text-right text-xs text-gray-500">
                        <p>Dicetak pada: {new Date().toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' })}</p>
                        <p className="font-semibold text-black">Periode: {getPeriodLabel()} {kloterYm && `| Kloter ${kloterYm}`}</p>
                    </div>
                </div>
            </div>

            {/* Header Section (Hidden on Print) */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card p-5 rounded-lg border border-border print:hidden">
                <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <h1 className="text-xl font-semibold tracking-tight text-foreground">
                            Ringkasan Operasional
                        </h1>
                        <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5" />
                            <span>{tenant?.nama_travel || 'Travel Aktif'}</span>
                        </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        {isSuperAdmin
                            ? `Pantau ringkasan operasional dan keuangan untuk tenant ${tenant?.nama_travel}.`
                            : isAgent
                            ? `Halo ${auth.user.name}, pantau perolehan prospek, status perlengkapan koper, dan komisi Anda.`
                            : `Halo ${auth.user.name}, ringkasan performa penjualan, pipeline CRM, verifikasi kas, dan ketersediaan logistik.`}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {isSuperAdmin && (
                        <Link
                            href={route('tenants.index')}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-secondary text-secondary-foreground font-medium rounded-md hover:bg-secondary/80 transition-colors text-xs border border-border"
                        >
                            <Building2 className="w-3.5 h-3.5" />
                            <span>Kelola Tenant</span>
                        </Link>
                    )}
                    <Link
                        href={route('crm.index')}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground font-medium rounded-md hover:bg-primary/90 transition-colors text-xs"
                    >
                        <Users className="w-3.5 h-3.5" />
                        <span>Papan CRM</span>
                    </Link>
                </div>
            </div>

            {/* Period & Kloter Filter Bar */}
            <div className="bg-card p-3 rounded-lg border border-border flex flex-wrap items-center justify-between gap-3 print:hidden">
                <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mr-1">
                        <Filter className="w-3.5 h-3.5" />
                        <span>Periode:</span>
                    </div>

                    {/* Period Preset Dropdown */}
                    <select
                        value={period}
                        onChange={(e) => {
                            const val = e.target.value;
                            setPeriod(val);
                            if (val !== 'custom') {
                                applyFilter(val, undefined);
                            }
                        }}
                        className="bg-background text-foreground text-xs font-medium px-2.5 py-1.5 rounded-md border border-input focus:ring-1 focus:ring-ring focus:outline-none transition cursor-pointer"
                    >
                        <option value="this_year">Tahun Ini ({new Date().getFullYear()})</option>
                        <option value="last_year">Tahun Lalu ({new Date().getFullYear() - 1})</option>
                        <option value="this_month">Bulan Ini</option>
                        <option value="all">Semua Waktu (Historis)</option>
                        <option value="custom">Rentang Tanggal Khusus...</option>
                    </select>

                    {/* Kloter Dropdown */}
                    <select
                        value={kloterYm}
                        onChange={(e) => {
                            const val = e.target.value;
                            setKloterYm(val);
                            applyFilter(undefined, val);
                        }}
                        className="bg-background text-foreground text-xs font-medium px-2.5 py-1.5 rounded-md border border-input focus:ring-1 focus:ring-ring focus:outline-none transition cursor-pointer"
                    >
                        <option value="">Semua Kloter Keberangkatan</option>
                        {availableKloters.map((k) => (
                            <option key={k.value} value={k.value}>
                                {k.label}
                            </option>
                        ))}
                    </select>

                    {/* Custom Date Range Inputs */}
                    {period === 'custom' && (
                        <div className="flex items-center gap-1.5 flex-wrap">
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="bg-background text-foreground text-xs px-2.5 py-1 rounded-md border border-input focus:outline-none"
                            />
                            <span className="text-xs text-muted-foreground">s.d.</span>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="bg-background text-foreground text-xs px-2.5 py-1 rounded-md border border-input focus:outline-none"
                            />
                            <button
                                onClick={() => applyFilter('custom', undefined)}
                                className="px-2.5 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-md hover:bg-primary/90 transition"
                            >
                                Terapkan
                            </button>
                        </div>
                    )}

                    {/* Reset Button if filtered */}
                    {isFiltered && (
                        <button
                            onClick={resetFilter}
                            title="Kembalikan ke filter default"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground text-xs font-medium rounded-md border border-border transition"
                        >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Reset</span>
                        </button>
                    )}
                </div>

                {/* Print Trigger */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={handlePrint}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-background hover:bg-muted text-foreground border border-input font-medium rounded-md transition text-xs"
                    >
                        <Printer className="w-3.5 h-3.5 text-muted-foreground" />
                        <span>Cetak Laporan</span>
                    </button>
                </div>
            </div>

            {/* Metrics Statistics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Total Omzet Kas Masuk */}
                <div className="bg-card border border-border rounded-lg p-4 flex flex-col justify-between gap-3">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground">
                            Total Omzet Masuk
                        </span>
                        <Wallet className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold tracking-tight text-foreground">
                            Rp {Number(stats.total_omzet || 0).toLocaleString('id-ID')}
                        </div>
                    </div>
                    <div className="pt-2 border-t border-border/50 text-[11px] text-muted-foreground flex items-center justify-between">
                        <span>Dana sah terverifikasi</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">Rekonsiliasi Kas</span>
                    </div>
                </div>

                {/* 2. Nasabah DP & Lunas */}
                <div className="bg-card border border-border rounded-lg p-4 flex flex-col justify-between gap-3">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground">
                            Jamaah DP &amp; Lunas
                        </span>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold tracking-tight text-foreground">
                            {stats.closing_count.toLocaleString('id-ID')} <span className="text-sm font-normal text-muted-foreground">Jamaah</span>
                        </div>
                    </div>
                    <div className="pt-2 border-t border-border/50 text-[11px] text-muted-foreground flex items-center justify-between">
                        <span>Closing pembayaran</span>
                        <span className="text-foreground font-medium">Siap Berangkat</span>
                    </div>
                </div>

                {/* 3. Total Prospek / Leads */}
                <div className="bg-card border border-border rounded-lg p-4 flex flex-col justify-between gap-3">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground">
                            Total Prospek CRM
                        </span>
                        <Users className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold tracking-tight text-foreground">
                            {stats.total_leads.toLocaleString('id-ID')} <span className="text-sm font-normal text-muted-foreground">Orang</span>
                        </div>
                    </div>
                    <div className="pt-2 border-t border-border/50 text-[11px] text-muted-foreground flex items-center justify-between">
                        <span>Pipeline aktif</span>
                        <Link href={route('crm.index')} className="text-primary hover:underline flex items-center gap-0.5 font-medium">
                            Lihat Pipeline <ArrowUpRight className="w-3 h-3" />
                        </Link>
                    </div>
                </div>

                {/* 4. Commission Summary */}
                <div className="bg-card border border-border rounded-lg p-4 flex flex-col justify-between gap-3">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground">
                            {isAgent ? 'Komisi Siap Cair' : 'Total Komisi Agen'}
                        </span>
                        <Coins className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold tracking-tight text-foreground">
                            Rp {Number(isAgent ? stats.ready_commission : stats.total_commission).toLocaleString('id-ID')}
                        </div>
                    </div>
                    <div className="pt-2 border-t border-border/50 text-[11px] text-muted-foreground flex items-center justify-between">
                        <span>Cair: Rp {Number(stats.paid_commission).toLocaleString('id-ID')}</span>
                        <Link href={route('keagenan.commissions.index')} className="text-primary hover:underline font-medium">
                            Rincian
                        </Link>
                    </div>
                </div>
            </div>

            {/* CHARTS ROW 1: OMZET ANALYTICS & PACKAGE DONUT */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Chart A: Multi-Dimensional Omzet Analysis */}
                <div className="lg:col-span-8 bg-card p-5 rounded-lg border border-border flex flex-col justify-between gap-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-border">
                        <div>
                            <div className="flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-primary" />
                                <h2 className="font-semibold text-sm text-foreground">
                                    Tren Omzet &amp; Pendapatan
                                </h2>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                {omzetDimension === 'monthly' && `Perkembangan omzet bulanan (${getPeriodLabel()}).`}
                                {omzetDimension === 'package' && 'Kontribusi omzet berdasarkan varian paket umroh.'}
                                {omzetDimension === 'kloter' && 'Distribusi omzet per jadwal keberangkatan kloter.'}
                            </p>
                        </div>

                        {/* Dimension Switcher Pills */}
                        <div className="flex items-center gap-1 bg-muted p-0.5 rounded-md border border-border text-xs shrink-0">
                            <button
                                type="button"
                                onClick={() => setOmzetDimension('monthly')}
                                className={`px-2.5 py-1 rounded font-medium transition cursor-pointer ${
                                    omzetDimension === 'monthly'
                                        ? 'bg-background text-foreground shadow-xs'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                Bulanan
                            </button>
                            <button
                                type="button"
                                onClick={() => setOmzetDimension('package')}
                                className={`px-2.5 py-1 rounded font-medium transition cursor-pointer ${
                                    omzetDimension === 'package'
                                        ? 'bg-background text-foreground shadow-xs'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                Per Paket
                            </button>
                            <button
                                type="button"
                                onClick={() => setOmzetDimension('kloter')}
                                className={`px-2.5 py-1 rounded font-medium transition cursor-pointer ${
                                    omzetDimension === 'kloter'
                                        ? 'bg-background text-foreground shadow-xs'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                Per Kloter
                            </button>
                        </div>
                    </div>

                    {/* Chart Canvas */}
                    <div className="h-72 w-full pt-2">
                        {omzetDimension === 'monthly' && (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={analytics.monthly_trend} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                                    <defs>
                                        <linearGradient id="colorOmzet" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
                                    <XAxis dataKey="month" stroke="currentColor" className="text-[11px] text-muted-foreground" tickLine={false} />
                                    <YAxis
                                        stroke="currentColor"
                                        className="text-[11px] text-muted-foreground"
                                        tickLine={false}
                                        tickFormatter={(val) =>
                                            val >= 1000000000
                                                ? `${(val / 1000000000).toFixed(1)} M`
                                                : val >= 1000000
                                                ? `${(val / 1000000).toFixed(0)} Jt`
                                                : val
                                        }
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area
                                        type="monotone"
                                        dataKey="omzet"
                                        name="Omzet Bulanan"
                                        stroke="#2563eb"
                                        strokeWidth={2}
                                        fillOpacity={1}
                                        fill="url(#colorOmzet)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}

                        {omzetDimension === 'package' && (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={analytics.omzet_by_package} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
                                    <XAxis
                                        dataKey="name"
                                        stroke="currentColor"
                                        className="text-[11px] text-muted-foreground"
                                        tickLine={false}
                                    />
                                    <YAxis
                                        stroke="currentColor"
                                        className="text-[11px] text-muted-foreground"
                                        tickLine={false}
                                        tickFormatter={(val) =>
                                            val >= 1000000000
                                                ? `${(val / 1000000000).toFixed(1)} M`
                                                : val >= 1000000
                                                ? `${(val / 1000000).toFixed(0)} Jt`
                                                : val
                                        }
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar
                                        dataKey="omzet"
                                        name="Total Omzet Paket"
                                        fill="#0ea5e9"
                                        radius={[4, 4, 0, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        )}

                        {omzetDimension === 'kloter' && (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={analytics.omzet_by_kloter} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
                                    <XAxis
                                        dataKey="kloter"
                                        stroke="currentColor"
                                        className="text-[11px] text-muted-foreground"
                                        tickLine={false}
                                    />
                                    <YAxis
                                        stroke="currentColor"
                                        className="text-[11px] text-muted-foreground"
                                        tickLine={false}
                                        tickFormatter={(val) =>
                                            val >= 1000000000
                                                ? `${(val / 1000000000).toFixed(1)} M`
                                                : val >= 1000000
                                                ? `${(val / 1000000).toFixed(0)} Jt`
                                                : val
                                        }
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar
                                        dataKey="omzet"
                                        name="Total Omzet Kloter"
                                        fill="#6366f1"
                                        radius={[4, 4, 0, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* Chart B: Proporsi Paket (Donut Chart) */}
                <div className="lg:col-span-4 bg-card p-5 rounded-lg border border-border flex flex-col justify-between gap-4">
                    <div className="pb-3 border-b border-border">
                        <div className="flex items-center gap-2">
                            <PieChartIcon className="w-4 h-4 text-primary" />
                            <h2 className="font-semibold text-sm text-foreground">Distribusi Paket</h2>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">Proporsi pilihan paket jamaah terdaftar.</p>
                    </div>

                    <div className="h-44 w-full flex items-center justify-center relative">
                        {analytics.package_distribution && analytics.package_distribution.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={analytics.package_distribution}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={48}
                                        outerRadius={70}
                                        paddingAngle={4}
                                        dataKey="value"
                                    >
                                        {analytics.package_distribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="text-xs text-muted-foreground text-center">Belum ada data paket.</div>
                        )}
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-[10px] text-muted-foreground uppercase font-medium">Total</span>
                            <span className="text-base font-bold text-foreground">{totalPackageJamaah.toLocaleString('id-ID')}</span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-1.5 pt-2 border-t border-border max-h-28 overflow-y-auto">
                        {(analytics.package_distribution || []).map((p, idx) => {
                            const percent = totalPackageJamaah > 0 ? ((p.value / totalPackageJamaah) * 100).toFixed(0) : '0';
                            return (
                                <div key={p.name} className="flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-2 truncate">
                                        <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                                        <span className="text-foreground truncate">{p.name}</span>
                                    </div>
                                    <span className="text-muted-foreground font-medium shrink-0 ml-2">{p.value.toLocaleString('id-ID')} ({percent}%)</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* CHARTS ROW 2: CRM FUNNEL & TOP AGENTS */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Left: CRM Pipeline Conversion Funnel */}
                <div className="lg:col-span-6 bg-card p-5 rounded-lg border border-border flex flex-col justify-between gap-4">
                    <div className="pb-3 border-b border-border">
                        <div className="flex items-center gap-2">
                            <Target className="w-4 h-4 text-primary" />
                            <h2 className="font-semibold text-sm text-foreground">Pipeline Prospek Jamaah</h2>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Tahapan perjalanan prospek dari registrasi hingga closing.
                        </p>
                    </div>

                    <div className="flex flex-col gap-2.5 py-1">
                        {(analytics.crm_funnel || []).map((stage, idx) => {
                            const maxCount = Math.max(...(analytics.crm_funnel.map((s) => s.count) || [1]), 1);
                            const percentage = Math.round((stage.count / maxCount) * 100);

                            return (
                                <div key={stage.stage} className="flex flex-col gap-1">
                                    <div className="flex justify-between items-center text-xs">
                                        <div className="flex items-center gap-2">
                                            <span className="h-4 w-4 rounded bg-muted flex items-center justify-center font-semibold text-[10px] text-muted-foreground">
                                                {stage.urutan}
                                            </span>
                                            <span className="font-medium text-foreground">{stage.stage}</span>
                                        </div>
                                        <span className="font-semibold text-foreground">{stage.count.toLocaleString('id-ID')} Jamaah</span>
                                    </div>
                                    <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all duration-300"
                                            style={{
                                                width: `${Math.max(percentage, 3)}%`,
                                                backgroundColor: COLORS[idx % COLORS.length],
                                            }}
                                        />
                                    </div>
                                </div>
                            );
                        })}

                        {(!analytics.crm_funnel || analytics.crm_funnel.length === 0) && (
                            <div className="py-8 text-center text-xs text-muted-foreground">Belum ada tahapan CRM.</div>
                        )}
                    </div>

                    <div className="pt-3 border-t border-border flex justify-between items-center text-xs text-muted-foreground">
                        <span>Total Closing: <strong className="text-foreground font-semibold">{stats.closing_count} Jamaah</strong></span>
                        <Link href={route('crm.index')} className="text-primary font-medium hover:underline flex items-center gap-1">
                            Buka Board <ArrowRight className="w-3 h-3" />
                        </Link>
                    </div>
                </div>

                {/* Right: Leaderboard Top 5 Agen Penjualan */}
                <div className="lg:col-span-6 bg-card p-5 rounded-lg border border-border flex flex-col justify-between gap-4">
                    <div className="pb-3 border-b border-border">
                        <div className="flex items-center gap-2">
                            <Award className="w-4 h-4 text-primary" />
                            <h2 className="font-semibold text-sm text-foreground">Mitra Agen Teratas</h2>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Peringkat agen berdasarkan kontribusi closing dan komisi.
                        </p>
                    </div>

                    <div className="flex flex-col divide-y divide-border/60">
                        {(analytics.top_agents || []).map((agent, index) => {
                            return (
                                <div key={agent.id} className="py-2 flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <span className="h-5 w-5 rounded bg-muted flex items-center justify-center font-semibold text-[11px] text-muted-foreground shrink-0">
                                            #{index + 1}
                                        </span>
                                        <div className="min-w-0">
                                            <div className="font-medium text-xs text-foreground truncate">{agent.name}</div>
                                            <div className="text-[10px] text-muted-foreground truncate">{agent.email}</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 text-right shrink-0">
                                        <div>
                                            <div className="text-xs font-semibold text-foreground">{agent.closing_count} Jamaah</div>
                                            <div className="text-[10px] text-muted-foreground">
                                                Rp {agent.total_komisi.toLocaleString('id-ID')}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {(!analytics.top_agents || analytics.top_agents.length === 0) && (
                            <div className="py-8 text-center text-xs text-muted-foreground">Belum ada data agen terdaftar.</div>
                        )}
                    </div>

                    <div className="pt-3 border-t border-border flex justify-between items-center text-xs text-muted-foreground">
                        <span>Perhitungan komisi otomatis</span>
                        <Link href={route('keagenan.commissions.index')} className="text-primary font-medium hover:underline">
                            Lihat Pembagian Komisi
                        </Link>
                    </div>
                </div>
            </div>

            {/* Workflow Sections Grid (Logistik & Pembayaran Menunggu Verifikasi) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                {/* Logistics Ready Table */}
                <div className={`flex flex-col gap-3.5 bg-card p-5 rounded-lg border border-border ${!isAgent && pendingPayments.length > 0 ? 'lg:col-span-7' : 'lg:col-span-12'}`}>
                    <div className="flex justify-between items-center pb-3 border-b border-border">
                        <div className="flex items-center gap-2">
                            <Truck className="w-4 h-4 text-primary" />
                            <div>
                                <h2 className="font-semibold text-sm text-foreground">Distribusi Perlengkapan &amp; Koper</h2>
                                <p className="text-xs text-muted-foreground">Jamaah dengan status DP lunas yang siap pengambilan barang.</p>
                            </div>
                        </div>
                        <span className="px-2 py-0.5 text-xs font-medium rounded-md bg-muted text-foreground border border-border">
                            {logisticsReadyList.length} Siap
                        </span>
                    </div>

                    <div className="divide-y divide-border/60">
                        {logisticsReadyList.map((item) => (
                            <div key={item.id} className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                                <div className="flex flex-col gap-0.5">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-xs text-foreground">{item.nama_lengkap}</span>
                                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                                            Siap
                                        </span>
                                    </div>
                                    <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 flex-wrap">
                                        <span>{item.paket.nama_paket}</span>
                                        <span>•</span>
                                        <span>{item.no_hp}</span>
                                        {item.agen && (
                                            <>
                                                <span>•</span>
                                                <span>Agen: {item.agen.name}</span>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-1">
                                    {item.inventaris_transaksi.map((tx) => (
                                        <span key={tx.id} className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-muted border border-border text-foreground">
                                            {tx.qty}x {tx.inventaris.nama_barang}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}

                        {logisticsReadyList.length === 0 && (
                            <div className="py-8 text-center text-xs text-muted-foreground">
                                Belum ada logistik yang siap diambil. Data akan muncul otomatis setelah pembayaran DP diverifikasi.
                            </div>
                        )}
                    </div>
                </div>

                {/* Pending Verification Table (For Admin / Owner) */}
                {!isAgent && (
                    <div className="lg:col-span-5 flex flex-col gap-3.5 bg-card p-5 rounded-lg border border-border">
                        <div className="flex justify-between items-center pb-3 border-b border-border">
                            <div className="flex items-center gap-2">
                                <Receipt className="w-4 h-4 text-primary" />
                                <div>
                                    <h2 className="font-semibold text-sm text-foreground">Pembayaran Menunggu Verifikasi</h2>
                                    <p className="text-xs text-muted-foreground">Bukti transfer masuk yang perlu konfirmasi.</p>
                                </div>
                            </div>
                            <Link href={route('payment.index')} className="text-xs font-medium text-primary hover:underline">
                                Semua ({pendingPayments.length})
                            </Link>
                        </div>

                        <div className="flex flex-col gap-2.5">
                            {pendingPayments.map((p) => (
                                <div key={p.id} className="p-3 bg-muted/30 border border-border rounded-md flex flex-col gap-2">
                                    <div className="flex justify-between items-start gap-2">
                                        <div className="min-w-0">
                                            <div className="font-medium text-xs text-foreground truncate">{p.jamaah.nama_lengkap}</div>
                                            <div className="text-[11px] text-muted-foreground truncate">{p.jamaah.paket.nama_paket}</div>
                                        </div>
                                        <span className="text-xs font-semibold text-foreground shrink-0">
                                            Rp {Number(p.nominal).toLocaleString('id-ID')}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center pt-2 border-t border-border/50 text-[11px] text-muted-foreground">
                                        <span>Bank: {p.rekening_tenant.nama_bank}</span>
                                        <Link
                                            href={route('payment.index')}
                                            className="px-2 py-0.5 bg-primary text-primary-foreground font-medium rounded text-[11px] hover:bg-primary/90 transition"
                                        >
                                            Verifikasi
                                        </Link>
                                    </div>
                                </div>
                            ))}

                            {pendingPayments.length === 0 && (
                                <div className="py-8 text-center text-xs text-muted-foreground">
                                    Semua transaksi pembayaran telah diverifikasi.
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </PageLayout>
    );
}
