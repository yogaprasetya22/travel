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
                <div className="bg-popover border border-border p-3 rounded-xl shadow-xl text-xs flex flex-col gap-1.5 backdrop-blur-md">
                    <p className="font-bold text-foreground">{label}</p>
                    {payload.map((entry: any, index: number) => (
                        <p key={`item-${index}`} style={{ color: entry.color || entry.fill }} className="font-semibold">
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
            contentClass="p-6 md:p-8 flex flex-col gap-6 w-full max-w-none print:p-0 print:gap-4"
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

            {/* Header Greeting (Hidden on Print) */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card/60 backdrop-blur-md p-6 rounded-2xl border border-border/80 shadow-xs print:hidden">
                <div>
                    <div className="flex flex-wrap items-center gap-2.5">
                        <div className="h-8 w-1.5 rounded-full bg-primary" />
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                            Selamat Datang, {auth.user.name}
                        </h1>
                        <span className="text-xs font-bold px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5" />
                            <span>{tenant?.nama_travel || 'Travel Aktif'}</span>
                        </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 ml-4">
                        {isSuperAdmin
                            ? `Memantau ringkasan operasional dan analisis omzet untuk tenant aktif: ${tenant?.nama_travel}.`
                            : isAgent
                            ? 'Pantau perolehan prospek calon jamaah, status logistik koper, dan pencairan komisi Anda.'
                            : 'Ringkasan performa penjualan, pipeline CRM, verifikasi transaksi kas, dan ketersediaan logistik travel.'}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {isSuperAdmin && (
                        <Link
                            href={route('tenants.index')}
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-muted text-foreground font-semibold rounded-xl hover:bg-muted/80 transition-all text-xs border border-border shadow-xs"
                        >
                            <Building2 className="w-4 h-4 text-primary" />
                            <span>Buka Tenants Management</span>
                        </Link>
                    )}
                    <Link
                        href={route('crm.index')}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:opacity-90 transition-all text-xs shadow-xs"
                    >
                        <Users className="w-4 h-4" />
                        <span>Buka Papan CRM</span>
                    </Link>
                </div>
            </div>

            {/* Global Multi-Year & Kloter Period Filter Bar */}
            <div className="bg-card/70 backdrop-blur-md p-4 rounded-2xl border border-border/80 shadow-xs flex flex-wrap items-center justify-between gap-4 print:hidden">
                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground mr-1">
                        <Filter className="w-4 h-4 text-primary" />
                        <span>Filter Periode:</span>
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
                        className="bg-background text-foreground text-xs font-semibold px-3 py-2 rounded-xl border border-border focus:ring-2 focus:ring-primary/30 focus:outline-none transition cursor-pointer"
                    >
                        <option value="this_year">Tahun Ini ({new Date().getFullYear()})</option>
                        <option value="last_year">Tahun Lalu ({new Date().getFullYear() - 1})</option>
                        <option value="this_month">Bulan Ini</option>
                        <option value="all">Semua Waktu (Histori Lengkap)</option>
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
                        className="bg-background text-foreground text-xs font-semibold px-3 py-2 rounded-xl border border-border focus:ring-2 focus:ring-primary/30 focus:outline-none transition cursor-pointer"
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
                        <div className="flex items-center gap-2 flex-wrap">
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="bg-background text-foreground text-xs px-2.5 py-1.5 rounded-lg border border-border focus:outline-none"
                            />
                            <span className="text-xs text-muted-foreground">s.d.</span>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="bg-background text-foreground text-xs px-2.5 py-1.5 rounded-lg border border-border focus:outline-none"
                            />
                            <button
                                onClick={() => applyFilter('custom', undefined)}
                                className="px-3 py-1.5 bg-primary text-primary-foreground text-xs font-semibold rounded-lg hover:opacity-90 transition shadow-xs"
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
                            className="inline-flex items-center gap-1.5 px-3 py-2 bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground text-xs font-medium rounded-xl border border-border transition"
                        >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Reset</span>
                        </button>
                    )}
                </div>

                {/* Print / Report PDF Trigger */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={handlePrint}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-card hover:bg-muted text-foreground border border-border/80 font-semibold rounded-xl transition text-xs shadow-xs"
                    >
                        <Printer className="w-4 h-4 text-primary" />
                        <span>Cetak Ringkasan Laporan</span>
                    </button>
                </div>
            </div>

            {/* Metrics Statistics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* 1. Total Leads */}
                <div className="bg-card/70 border border-border/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                        <div>
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Total Prospek / Leads
                            </span>
                            <h3 className="text-3xl font-extrabold text-foreground mt-2">
                                {stats.total_leads.toLocaleString('id-ID')}
                            </h3>
                        </div>
                        <div className="p-3 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
                            <Users className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
                        <span>Fase 1: Akuisisi CRM</span>
                        <Link href={route('crm.index')} className="text-primary font-semibold hover:underline flex items-center gap-1">
                            Lihat Pipeline <ArrowUpRight className="w-3 h-3" />
                        </Link>
                    </div>
                </div>

                {/* 2. Closing / DP Paid */}
                <div className="bg-card/70 border border-border/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                        <div>
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Nasabah DP &amp; Lunas
                            </span>
                            <h3 className="text-3xl font-extrabold text-foreground mt-2">
                                {stats.closing_count.toLocaleString('id-ID')}
                            </h3>
                        </div>
                        <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
                        <span>Fase 2: Terverifikasi</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">100% Valid</span>
                    </div>
                </div>

                {/* 3. Total Omzet Kas Masuk */}
                <div className="bg-card/70 border border-border/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                        <div>
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Total Omzet Kas Masuk
                            </span>
                            <h3 className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2">
                                Rp {Number(stats.total_omzet || 0).toLocaleString('id-ID')}
                            </h3>
                        </div>
                        <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                            <Wallet className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
                        <span>{tenant?.nama_travel}</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Verified Kas</span>
                    </div>
                </div>

                {/* 4. Commission Summary */}
                <div className="bg-card/70 border border-border/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                        <div>
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                {isAgent ? 'Komisi Siap Cair' : 'Total Komisi Agen'}
                            </span>
                            <h3 className="text-2xl font-extrabold text-primary mt-2">
                                Rp {Number(isAgent ? stats.ready_commission : stats.total_commission).toLocaleString('id-ID')}
                            </h3>
                        </div>
                        <div className="p-3 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                            <Coins className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
                        <span>Sudah Cair: Rp {Number(stats.paid_commission).toLocaleString('id-ID')}</span>
                        <Link href={route('keagenan.commissions.index')} className="text-primary font-semibold hover:underline">
                            Rincian
                        </Link>
                    </div>
                </div>
            </div>

            {/* CHARTS ROW 1: MULTI-DIMENSION OMZET ANALYTICS & PACKAGE DONUT */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Chart A: Multi-Dimensional Omzet Analysis (Monthly / Package / Kloter) */}
                <div className="lg:col-span-8 bg-card/70 backdrop-blur-md p-6 rounded-2xl border border-border/80 shadow-xs flex flex-col justify-between gap-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-border/60">
                        <div>
                            <div className="flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-primary" />
                                <h3 className="font-bold text-base text-foreground">
                                    Analisis Omzet &amp; Pendapatan Kas ({tenant?.nama_travel})
                                </h3>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                {omzetDimension === 'monthly' && `Grafik tren omzet bulanan dan pendaftaran prospek (${getPeriodLabel()}).`}
                                {omzetDimension === 'package' && 'Perbandingan total omzet dan kontribusi penjualan per varian paket umroh.'}
                                {omzetDimension === 'kloter' && 'Distribusi omzet pembayaran berdasarkan jadwal bulan keberangkatan kloter.'}
                            </p>
                        </div>

                        {/* Dimension Switcher Pills */}
                        <div className="flex items-center gap-1 bg-muted p-1 rounded-xl border border-border text-xs shrink-0">
                            <button
                                type="button"
                                onClick={() => setOmzetDimension('monthly')}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                                    omzetDimension === 'monthly'
                                        ? 'bg-background text-foreground shadow-xs'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                <Calendar className="w-3.5 h-3.5 text-primary" />
                                <span>Tren Bulanan</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setOmzetDimension('package')}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                                    omzetDimension === 'package'
                                        ? 'bg-background text-foreground shadow-xs'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                <Layers className="w-3.5 h-3.5 text-emerald-500" />
                                <span>Per Paket</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setOmzetDimension('kloter')}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                                    omzetDimension === 'kloter'
                                        ? 'bg-background text-foreground shadow-xs'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                <Plane className="w-3.5 h-3.5 text-purple-500" />
                                <span>Per Kloter</span>
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
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
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
                                        stroke="#3b82f6"
                                        strokeWidth={3}
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
                                        fill="#10b981"
                                        radius={[8, 8, 0, 0]}
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
                                        fill="#8b5cf6"
                                        radius={[8, 8, 0, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* Chart B: Proporsi Paket Umroh & Haji (Donut Chart) */}
                <div className="lg:col-span-4 bg-card/70 backdrop-blur-md p-6 rounded-2xl border border-border/80 shadow-xs flex flex-col justify-between gap-4">
                    <div className="pb-3 border-b border-border/60">
                        <div className="flex items-center gap-2">
                            <PieChartIcon className="w-5 h-5 text-emerald-500" />
                            <h3 className="font-bold text-base text-foreground">Proporsi Peminat Paket</h3>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">Sebaran pendaftaran jamaah per varian paket.</p>
                    </div>

                    <div className="h-48 w-full flex items-center justify-center relative">
                        {analytics.package_distribution && analytics.package_distribution.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={analytics.package_distribution}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={50}
                                        outerRadius={75}
                                        paddingAngle={5}
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
                            <span className="text-[11px] text-muted-foreground font-semibold">Total Jamaah</span>
                            <span className="text-lg font-extrabold text-foreground">{totalPackageJamaah.toLocaleString('id-ID')}</span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-1.5 pt-2 border-t border-border/60 max-h-28 overflow-y-auto">
                        {(analytics.package_distribution || []).map((p, idx) => {
                            const percent = totalPackageJamaah > 0 ? ((p.value / totalPackageJamaah) * 100).toFixed(0) : '0';
                            return (
                                <div key={p.name} className="flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-2 truncate">
                                        <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                                        <span className="text-foreground font-medium truncate">{p.name}</span>
                                    </div>
                                    <span className="text-muted-foreground font-bold shrink-0">{p.value.toLocaleString('id-ID')} ({percent}%)</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* CHARTS ROW 2: CRM FUNNEL & TOP 5 AGENT LEADERBOARD */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left: CRM Pipeline Conversion Funnel */}
                <div className="lg:col-span-6 bg-card/70 backdrop-blur-md p-6 rounded-2xl border border-border/80 shadow-xs flex flex-col justify-between gap-4">
                    <div className="pb-3 border-b border-border/60">
                        <div className="flex items-center gap-2">
                            <Target className="w-5 h-5 text-purple-500" />
                            <h3 className="font-bold text-base text-foreground">Konversi Pipeline CRM (Funnel)</h3>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Perjalanan prospek jamaah dari pendaftaran awal hingga keberangkatan.
                        </p>
                    </div>

                    <div className="flex flex-col gap-3 py-2">
                        {(analytics.crm_funnel || []).map((stage, idx) => {
                            const maxCount = Math.max(...(analytics.crm_funnel.map((s) => s.count) || [1]), 1);
                            const percentage = Math.round((stage.count / maxCount) * 100);

                            return (
                                <div key={stage.stage} className="flex flex-col gap-1">
                                    <div className="flex justify-between items-center text-xs">
                                        <div className="flex items-center gap-2">
                                            <span className="h-5 w-5 rounded-full bg-muted flex items-center justify-center font-bold text-[10px] text-muted-foreground">
                                                {stage.urutan}
                                            </span>
                                            <span className="font-bold text-foreground">{stage.stage}</span>
                                        </div>
                                        <span className="font-extrabold text-primary">{stage.count.toLocaleString('id-ID')} Jamaah</span>
                                    </div>
                                    <div className="w-full bg-muted/60 rounded-full h-3 overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all duration-500"
                                            style={{
                                                width: `${Math.max(percentage, 4)}%`,
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

                    <div className="pt-3 border-t border-border/60 flex justify-between items-center text-xs text-muted-foreground">
                        <span>Konversi Total: <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{stats.closing_count} Closing</strong></span>
                        <Link href={route('crm.index')} className="text-primary font-bold hover:underline flex items-center gap-1">
                            Buka Board <ArrowRight className="w-3 h-3" />
                        </Link>
                    </div>
                </div>

                {/* Right: Leaderboard Top 5 Agen Penjualan */}
                <div className="lg:col-span-6 bg-card/70 backdrop-blur-md p-6 rounded-2xl border border-border/80 shadow-xs flex flex-col justify-between gap-4">
                    <div className="pb-3 border-b border-border/60">
                        <div className="flex items-center gap-2">
                            <Award className="w-5 h-5 text-amber-500" />
                            <h3 className="font-bold text-base text-foreground">Top 5 Mitra Agen Terproduktif</h3>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Peringkat agen dengan kontribusi pendaftaran jamaah &amp; akumulasi komisi tertinggi.
                        </p>
                    </div>

                    <div className="flex flex-col divide-y divide-border/40">
                        {(analytics.top_agents || []).map((agent, index) => {
                            const badgeColor =
                                index === 0
                                    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                                    : index === 1
                                    ? 'bg-slate-400/10 text-slate-600 dark:text-slate-300 border-slate-400/20'
                                    : index === 2
                                    ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20'
                                    : 'bg-muted text-muted-foreground border-border';

                            return (
                                <div key={agent.id} className="py-2.5 flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className={`h-7 w-7 rounded-xl flex items-center justify-center font-bold text-xs border shrink-0 ${badgeColor}`}>
                                            #{index + 1}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="font-bold text-xs text-foreground truncate">{agent.name}</div>
                                            <div className="text-[10px] text-muted-foreground truncate">{agent.email}</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 text-right shrink-0">
                                        <div>
                                            <div className="text-xs font-extrabold text-foreground">{agent.closing_count} Jamaah</div>
                                            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
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

                    <div className="pt-3 border-t border-border/60 flex justify-between items-center text-xs text-muted-foreground">
                        <span>Penghitungan komisi terotomasi</span>
                        <Link href={route('keagenan.commissions.index')} className="text-primary font-bold hover:underline">
                            Lihat Pembagian Komisi
                        </Link>
                    </div>
                </div>
            </div>

            {/* Workflow Sections Grid (Fase 2 & Fase 3) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Logistics Ready Table (Fase 3 View) */}
                <div className={`flex flex-col gap-4 bg-card/60 backdrop-blur-md p-6 rounded-2xl border border-border/80 shadow-xs ${!isAgent && pendingPayments.length > 0 ? 'lg:col-span-7' : 'lg:col-span-12'}`}>
                    <div className="flex justify-between items-center pb-3 border-b border-border/60">
                        <div className="flex items-center gap-2.5">
                            <Truck className="w-5 h-5 text-purple-500" />
                            <div>
                                <h3 className="font-bold text-base text-foreground">Status Distribusi Logistik (Fase 3)</h3>
                                <p className="text-xs text-muted-foreground">Daftar jamaah yang telah lunas DP dan barang perlengkapannya siap diambil di kantor travel.</p>
                            </div>
                        </div>
                        <span className="px-3 py-1 text-xs font-bold rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                            {logisticsReadyList.length} Jamaah Siap
                        </span>
                    </div>

                    <div className="divide-y divide-border/40">
                        {logisticsReadyList.map((item) => (
                            <div key={item.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-muted/30 px-2 rounded-xl transition-colors">
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-sm text-foreground">{item.nama_lengkap}</span>
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                            Logistik Siap
                                        </span>
                                    </div>
                                    <div className="text-xs text-muted-foreground flex items-center gap-2">
                                        <span>Paket: <strong className="text-foreground/90">{item.paket.nama_paket}</strong></span>
                                        <span>•</span>
                                        <span>HP: {item.no_hp}</span>
                                        {item.agen && (
                                            <>
                                                <span>•</span>
                                                <span>Agen: {item.agen.name}</span>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-1.5">
                                    {item.inventaris_transaksi.map((tx) => (
                                        <span key={tx.id} className="text-[11px] font-medium px-2 py-1 rounded-lg bg-muted border border-border/60 text-foreground/80">
                                            {tx.qty}x {tx.inventaris.nama_barang}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}

                        {logisticsReadyList.length === 0 && (
                            <div className="py-10 text-center text-sm text-muted-foreground">
                                Belum ada logistik yang siap diambil. Data akan otomatis muncul setelah verifikasi pembayaran DP.
                            </div>
                        )}
                    </div>
                </div>

                {/* Pending Verification Table (For Admin / Owner) */}
                {!isAgent && (
                    <div className="lg:col-span-5 flex flex-col gap-4 bg-card/60 backdrop-blur-md p-6 rounded-2xl border border-border/80 shadow-xs">
                        <div className="flex justify-between items-center pb-3 border-b border-border/60">
                            <div className="flex items-center gap-2">
                                <Receipt className="w-5 h-5 text-amber-500" />
                                <div>
                                    <h3 className="font-bold text-base text-foreground">Verifikasi Pembayaran (Fase 2)</h3>
                                    <p className="text-xs text-muted-foreground">Menunggu konfirmasi admin.</p>
                                </div>
                            </div>
                            <Link href={route('payment.index')} className="text-xs font-semibold text-primary hover:underline">
                                Semua ({pendingPayments.length})
                            </Link>
                        </div>

                        <div className="flex flex-col gap-3">
                            {pendingPayments.map((p) => (
                                <div key={p.id} className="p-3.5 bg-muted/40 border border-border/60 rounded-xl flex flex-col gap-2">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="font-bold text-sm text-foreground">{p.jamaah.nama_lengkap}</div>
                                            <div className="text-xs text-muted-foreground">{p.jamaah.paket.nama_paket}</div>
                                        </div>
                                        <span className="text-xs font-bold text-primary">
                                            Rp {Number(p.nominal).toLocaleString('id-ID')}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center pt-2 border-t border-border/40 text-[11px] text-muted-foreground">
                                        <span>Bank: {p.rekening_tenant.nama_bank}</span>
                                        <Link
                                            href={route('payment.index')}
                                            className="px-2.5 py-1 bg-primary text-primary-foreground font-semibold rounded-md text-[10px] hover:opacity-90 transition"
                                        >
                                            Verifikasi Sekarang
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
