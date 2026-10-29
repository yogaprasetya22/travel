import React, { useState, useEffect, useRef } from 'react';
import PageLayout from '@/Components/Layouts/PageLayout';
import { PageProps } from '@/Types';
import { Card, CardContent } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import {
    Users,
    UserCheck,
    Wallet,
    Coins,
    Search,
    Shield,
    TrendingUp,
    Eye,
    X,
    Phone,
    Plane,
    Loader2,
    SlidersHorizontal,
    Award,
    PieChart as PieChartIcon,
    BarChart3,
    Sparkles,
} from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';
import { router } from '@inertiajs/react';
import DataTablePagination, { PaginatedData } from '@/Components/DataTablePagination';
import PerPageSelector from '@/Components/PerPageSelector';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
    Cell,
    PieChart,
    Pie,
    Legend,
} from 'recharts';

interface TeamMember {
    id: number;
    name: string;
    email: string;
    level: number;
    level_label: string;
    level_badge: string;
    jabatan: string;
    hierarchy_level_id: number | null;
    creator: {
        id: number;
        name: string;
        jabatan?: string;
    } | null;
    total_jamaah: number;
    total_omzet: number;
    total_komisi: number;
    komisi_paid: number;
    komisi_pending: number;
}

interface TopPerformerItem {
    id: number;
    name: string;
    email: string;
    level: number;
    level_label: string;
    jabatan: string;
    total_jamaah: number;
    total_omzet: number;
    total_komisi: number;
}

interface LevelDistributionItem {
    level: number;
    level_name: string;
    omzet: number;
    jamaah: number;
    members_count: number;
    color: string;
}

interface HierarchyLevelItem {
    id: number;
    nama_level: string;
    urutan: number;
    role_key: string;
}

interface JamaahDetailItem {
    id: number;
    nama_lengkap: string;
    nomor_hp: string;
    nomor_paspor: string | null;
    status_dokumen?: string;
    created_at: string;
    paket: {
        id: number;
        nama_paket: string;
        harga: number;
    } | null;
    crm_stage: {
        id: number;
        nama_tahap: string;
    } | null;
    pembayaran?: Array<{
        id: number;
        nominal: number;
        status_verifikasi: string;
    }>;
}

interface Props extends PageProps {
    teamMembers: PaginatedData<TeamMember>;
    summary: {
        total_members: number;
        total_jamaah: number;
        total_omzet: number;
        total_komisi: number;
        total_paid: number;
        total_pending: number;
    };
    topPerformers: TopPerformerItem[];
    levelDistribution: LevelDistributionItem[];
    hierarchyLevels: HierarchyLevelItem[];
    filters: {
        search?: string;
        level?: string;
        per_page?: number;
    };
    currentUser: {
        id: number;
        name: string;
        level: number;
        level_label: string;
    };
}

export default function Monitoring({
    teamMembers,
    summary,
    topPerformers = [],
    levelDistribution = [],
    hierarchyLevels = [],
    filters,
    currentUser,
}: Props) {
    const [searchQuery, setSearchQuery] = useState(filters?.search || '');
    const debouncedSearch = useDebounce(searchQuery, 400);
    const [selectedLevelFilter, setSelectedLevelFilter] = useState(filters?.level || 'all');
    const isFirstRender = useRef(true);

    // Customer Drawer State (Infinite Scroll)
    const [selectedMember, setSelectedMember] = useState<TeamMember | TopPerformerItem | null>(null);
    const [drawerJamaahList, setDrawerJamaahList] = useState<JamaahDetailItem[]>([]);
    const [drawerSearch, setDrawerSearch] = useState('');
    const debouncedDrawerSearch = useDebounce(drawerSearch, 300);
    const [drawerPage, setDrawerPage] = useState(1);
    const [drawerHasMore, setDrawerHasMore] = useState(false);
    const [isLoadingInitial, setIsLoadingInitial] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [totalJamaahInDrawer, setTotalJamaahInDrawer] = useState(0);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Apply filters via Inertia router
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        router.get(
            route('keagenan.monitoring.index'),
            {
                search: debouncedSearch || undefined,
                level: selectedLevelFilter !== 'all' ? selectedLevelFilter : undefined,
                per_page: filters?.per_page || 10,
                page: 1,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            }
        );
    }, [debouncedSearch, selectedLevelFilter]);

    // Drawer Data Fetching (Infinite Scroll)
    const fetchMemberJamaah = async (memberId: number, pageToFetch: number, isNewSearch = false) => {
        if (pageToFetch === 1) {
            setIsLoadingInitial(true);
        } else {
            setIsLoadingMore(true);
        }

        try {
            const params = new URLSearchParams({
                page: pageToFetch.toString(),
                per_page: '10',
                search: debouncedDrawerSearch,
            });

            const res = await fetch(`/monitoring/${memberId}/jamaah?${params.toString()}`);
            if (!res.ok) throw new Error('Gagal memuat data');
            const data = await res.json();

            if (isNewSearch || pageToFetch === 1) {
                setDrawerJamaahList(data.data);
            } else {
                setDrawerJamaahList((prev) => [...prev, ...data.data]);
            }

            setDrawerHasMore(Boolean(data.has_more));
            setDrawerPage(data.current_page);
            setTotalJamaahInDrawer(data.total);
        } catch (error) {
            console.error('Error fetching member jamaah:', error);
        } finally {
            setIsLoadingInitial(false);
            setIsLoadingMore(false);
        }
    };

    const handleOpenDrawer = (member: TeamMember | TopPerformerItem) => {
        setSelectedMember(member);
        setDrawerSearch('');
        setDrawerPage(1);
        fetchMemberJamaah(member.id, 1, true);
    };

    const handleCloseDrawer = () => {
        setSelectedMember(null);
        setDrawerJamaahList([]);
    };

    // Refetch when drawer search changes
    useEffect(() => {
        if (selectedMember) {
            fetchMemberJamaah(selectedMember.id, 1, true);
        }
    }, [debouncedDrawerSearch]);

    // Drawer scroll listener for infinite scroll
    const handleDrawerScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        if (scrollHeight - scrollTop - clientHeight < 120 && drawerHasMore && !isLoadingMore && !isLoadingInitial) {
            if (selectedMember) {
                fetchMemberJamaah(selectedMember.id, drawerPage + 1, false);
            }
        }
    };

    const getLevelBadgeClasses = (level: number) => {
        switch (level) {
            case 1:
                return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
            case 2:
                return 'bg-sky-500/10 text-sky-600 border-sky-500/20';
            case 3:
                return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
            default:
                return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
        }
    };

    const membersList = teamMembers?.data || [];

    // Chart Formatting Helper
    const formatCurrencyShort = (num: number) => {
        if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(1)} M`;
        if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)} Jt`;
        if (num >= 1_000) return `${(num / 1_000).toFixed(0)} Rb`;
        return num.toString();
    };

    // Top Performer Chart Data formatted
    const barChartData = topPerformers.map((p) => ({
        ...p,
        shortName: p.name.length > 12 ? p.name.substring(0, 10) + '..' : p.name,
    }));

    return (
        <PageLayout
            title="Pemantauan Tim & Omzet"
            breadcrumbParent="Keagenan & Komisi"
            breadcrumbPage="Pemantauan Tim"
            contentClass="p-6 md:p-8 flex flex-col gap-6 w-full max-w-none"
        >
            {/* Header Banner with Current Viewer Scope & Protections */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-card/60 backdrop-blur-md p-6 rounded-2xl border border-border/80 shadow-xs">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-primary/10 text-primary">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                        <h1 className="text-xl font-bold tracking-tight text-foreground">
                            Pemantauan Kinerja Tim &amp; Komisi Downline
                        </h1>
                    </div>
                    <p className="text-xs text-muted-foreground ml-10 max-w-3xl leading-relaxed">
                        Pantau real-time performa penjualan, perolehan komisi, dan daftar jamaah yang dibawa oleh seluruh anggota tim bawahan di bawah jalur hierarki Anda. Data atasan terproteksi secara otomatis.
                    </p>
                </div>

                {/* Current Viewer Level Indicator */}
                <div className="flex items-center gap-2 bg-background/80 px-4 py-2 rounded-2xl border border-border self-stretch lg:self-auto">
                    <Shield className="w-4 h-4 text-primary" />
                    <div className="flex flex-col">
                        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Akses Pemantau</span>
                        <span className="text-xs font-bold text-foreground">
                            {currentUser.level_label || `Level ${currentUser.level}`}
                        </span>
                    </div>
                </div>
            </div>

            {/* Top 4 KPI Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Total Anggota Tim Downline */}
                <Card className="bg-card/70 backdrop-blur-md border border-border/80 rounded-2xl p-5 shadow-xs flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-xs font-semibold text-muted-foreground">Total Tim Downline</span>
                        <span className="text-2xl font-extrabold text-foreground mt-1">
                            {summary?.total_members || 0}
                        </span>
                        <span className="text-[11px] text-muted-foreground mt-0.5">Seluruh bawahan aktif</span>
                    </div>
                    <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                        <Users className="w-6 h-6" />
                    </div>
                </Card>

                {/* 2. Total Jamaah Tim */}
                <Card className="bg-card/70 backdrop-blur-md border border-border/80 rounded-2xl p-5 shadow-xs flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-xs font-semibold text-muted-foreground">Total Jamaah Tim</span>
                        <span className="text-2xl font-extrabold text-foreground mt-1">
                            {summary?.total_jamaah || 0}
                        </span>
                        <span className="text-[11px] text-muted-foreground mt-0.5">Dari seluruh agen tim</span>
                    </div>
                    <div className="p-3 rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
                        <UserCheck className="w-6 h-6" />
                    </div>
                </Card>

                {/* 3. Total Omzet Penjualan Tim */}
                <Card className="bg-card/70 backdrop-blur-md border border-border/80 rounded-2xl p-5 shadow-xs flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-xs font-semibold text-muted-foreground">Omzet Tim Terverifikasi</span>
                        <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                            Rp {(summary?.total_omzet || 0).toLocaleString('id-ID')}
                        </span>
                        <span className="text-[11px] text-emerald-600/80 font-medium mt-0.5">Pembayaran sah</span>
                    </div>
                    <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        <Wallet className="w-6 h-6" />
                    </div>
                </Card>

                {/* 4. Total Komisi & Override Tim */}
                <Card className="bg-card/70 backdrop-blur-md border border-border/80 rounded-2xl p-5 shadow-xs flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-xs font-semibold text-muted-foreground">Total Komisi Tim</span>
                        <span className="text-xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">
                            Rp {(summary?.total_komisi || 0).toLocaleString('id-ID')}
                        </span>
                        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mt-0.5">
                            <span className="text-emerald-600 font-bold">Lunas: Rp {(summary?.total_paid || 0).toLocaleString('id-ID')}</span>
                        </div>
                    </div>
                    <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                        <Coins className="w-6 h-6" />
                    </div>
                </Card>
            </div>

            {/* DUO ANALYTICS CHARTS SECTION */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* 1. Leaderboard Top 5 Agen (Interactive Bar Chart) */}
                <Card className="lg:col-span-7 bg-card/70 backdrop-blur-md border border-border/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
                                <Award className="w-4 h-4" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm text-foreground">Top Agen Penjualan (Leaderboard)</h3>
                                <p className="text-[11px] text-muted-foreground">Klik bar grafik agen untuk melihat nasabahnya</p>
                            </div>
                        </div>
                        <Badge variant="secondary" className="text-[10px] font-bold bg-primary/10 text-primary border-primary/20">
                            Top 5 Downline
                        </Badge>
                    </div>

                    <div className="h-64 w-full">
                        {barChartData.length === 0 ? (
                            <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                                Belum ada data transaksi omzet agen
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={barChartData}
                                    layout="vertical"
                                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.06)" />
                                    <XAxis
                                        type="number"
                                        tickFormatter={(val) => formatCurrencyShort(val)}
                                        tick={{ fontSize: 10, fill: 'currentColor' }}
                                        className="text-muted-foreground"
                                    />
                                    <YAxis
                                        type="category"
                                        dataKey="shortName"
                                        tick={{ fontSize: 11, fontWeight: 600, fill: 'currentColor' }}
                                        className="text-foreground"
                                    />
                                    <RechartsTooltip
                                        content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                                const data = payload[0].payload as TopPerformerItem;
                                                return (
                                                    <div className="bg-popover/95 backdrop-blur-md border border-border p-3 rounded-xl shadow-xl text-xs flex flex-col gap-1 z-50">
                                                        <div className="font-bold text-foreground flex items-center justify-between gap-3">
                                                            <span>{data.name}</span>
                                                            <Badge variant="secondary" className="text-[9px] px-1.5 py-0 font-extrabold">
                                                                Lv. {data.level}
                                                            </Badge>
                                                        </div>
                                                        <span className="text-[11px] text-muted-foreground">{data.jabatan}</span>
                                                        <div className="pt-1.5 border-t border-border mt-1 flex flex-col gap-1 text-[11px]">
                                                            <div className="flex justify-between gap-4">
                                                                <span className="text-muted-foreground">Omzet:</span>
                                                                <span className="font-bold text-emerald-600">
                                                                    Rp {data.total_omzet.toLocaleString('id-ID')}
                                                                </span>
                                                            </div>
                                                            <div className="flex justify-between gap-4">
                                                                <span className="text-muted-foreground">Jamaah:</span>
                                                                <span className="font-bold text-sky-600">{data.total_jamaah} Pax</span>
                                                            </div>
                                                            <div className="flex justify-between gap-4">
                                                                <span className="text-muted-foreground">Komisi:</span>
                                                                <span className="font-bold text-amber-600">
                                                                    Rp {data.total_komisi.toLocaleString('id-ID')}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <span className="text-[10px] text-muted-foreground mt-1">
                                                            Klik untuk melihat detail jamaah
                                                        </span>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                    <Bar
                                        dataKey="total_omzet"
                                        radius={[0, 8, 8, 0]}
                                        cursor="pointer"
                                        onClick={(data) => handleOpenDrawer(data as unknown as TopPerformerItem)}
                                    >
                                        {barChartData.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={index === 0 ? '#10b981' : index === 1 ? '#0ea5e9' : index === 2 ? '#f59e0b' : '#8b5cf6'}
                                            />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </Card>

                {/* 2. Distribusi Omzet per Tingkat Level (Donut Chart) */}
                <Card className="lg:col-span-5 bg-card/70 backdrop-blur-md border border-border/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-600">
                                <PieChartIcon className="w-4 h-4" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm text-foreground">Kontribusi per Tingkat Level</h3>
                                <p className="text-[11px] text-muted-foreground">Porsi omzet penjualan antar jabatan tim</p>
                            </div>
                        </div>
                    </div>

                    <div className="h-64 w-full flex items-center justify-center">
                        {levelDistribution.length === 0 || summary.total_omzet === 0 ? (
                            <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                                Belum ada distribusi omzet
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={levelDistribution}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={55}
                                        outerRadius={80}
                                        paddingAngle={4}
                                        dataKey="omzet"
                                        nameKey="level_name"
                                    >
                                        {levelDistribution.map((entry, index) => (
                                            <Cell key={`donut-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip
                                        content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                                const data = payload[0].payload as LevelDistributionItem;
                                                const percentage = summary.total_omzet > 0
                                                    ? ((data.omzet / summary.total_omzet) * 100).toFixed(1)
                                                    : '0';
                                                return (
                                                    <div className="bg-popover/95 backdrop-blur-md border border-border p-3 rounded-xl shadow-xl text-xs flex flex-col gap-1 z-50">
                                                        <span className="font-bold text-foreground">{data.level_name}</span>
                                                        <div className="flex justify-between gap-4 mt-1">
                                                            <span className="text-muted-foreground">Omzet:</span>
                                                            <span className="font-bold text-emerald-600">
                                                                Rp {data.omzet.toLocaleString('id-ID')} ({percentage}%)
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between gap-4">
                                                            <span className="text-muted-foreground">Jumlah Anggota:</span>
                                                            <span className="font-bold text-foreground">{data.members_count} Orang</span>
                                                        </div>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                    <Legend
                                        verticalAlign="bottom"
                                        height={36}
                                        iconType="circle"
                                        iconSize={8}
                                        formatter={(val, entry) => {
                                            const item = entry.payload as unknown as LevelDistributionItem;
                                            return (
                                                <span className="text-[11px] font-semibold text-foreground mr-2">
                                                    {val} ({item?.members_count || 0})
                                                </span>
                                            );
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </Card>
            </div>

            {/* Filter & Search Bar + PerPageSelector */}
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 bg-card/40 p-4 rounded-2xl border border-border/80">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder="Cari nama anggota, email, jabatan, atau atasan..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 text-xs rounded-xl h-9 bg-background"
                    />
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2">
                        <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
                        <span className="text-xs font-semibold text-muted-foreground">Tingkat:</span>
                    </div>

                    <select
                        value={selectedLevelFilter}
                        onChange={(e) => setSelectedLevelFilter(e.target.value)}
                        className="text-xs bg-background border border-border rounded-xl px-3 py-1.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 font-medium"
                    >
                        <option value="all">Semua Tingkatan</option>
                        {hierarchyLevels.map((lvl) => (
                            <option key={lvl.id} value={lvl.urutan.toString()}>
                                Level {lvl.urutan} - {lvl.nama_level}
                            </option>
                        ))}
                    </select>

                    <PerPageSelector
                        value={teamMembers.per_page}
                        options={[5, 10, 20, 50]}
                        onChange={(newPerPage) => {
                            router.get(
                                route('keagenan.monitoring.index'),
                                {
                                    search: debouncedSearch || undefined,
                                    level: selectedLevelFilter !== 'all' ? selectedLevelFilter : undefined,
                                    per_page: newPerPage,
                                    page: 1,
                                },
                                { preserveState: true, preserveScroll: true }
                            );
                        }}
                    />
                </div>
            </div>

            {/* Team Members Downline Table */}
            <div className="overflow-hidden rounded-2xl border border-border/80 bg-card/70 backdrop-blur-md shadow-xs">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-border/80 bg-muted/40">
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-foreground">
                                    Anggota Tim (Downline)
                                </th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-foreground">
                                    Tingkat &amp; Jabatan
                                </th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-foreground">
                                    Atasan Langsung
                                </th>
                                <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-foreground">
                                    Jamaah
                                </th>
                                <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-foreground">
                                    Omzet Terverifikasi
                                </th>
                                <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-foreground">
                                    Komisi
                                </th>
                                <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-foreground">
                                    Aksi
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60">
                            {membersList.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground text-xs font-medium">
                                        Tidak ada anggota tim bawahan yang sesuai dengan filter pencarian.
                                    </td>
                                </tr>
                            ) : (
                                membersList.map((member) => (
                                    <tr key={member.id} className="hover:bg-muted/30 transition-colors">
                                        {/* Anggota Info */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-extrabold text-xs shrink-0">
                                                    {member.name.substring(0, 2).toUpperCase()}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-xs text-foreground">
                                                        {member.name}
                                                    </span>
                                                    <span className="text-[11px] text-muted-foreground">
                                                        {member.email}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Tingkat & Jabatan */}
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap items-center gap-1.5">
                                                <Badge
                                                    variant="secondary"
                                                    className={`text-[10px] px-2 py-0.5 font-extrabold border ${getLevelBadgeClasses(
                                                        member.level
                                                    )}`}
                                                >
                                                    Level {member.level}
                                                </Badge>
                                                <span className="text-xs font-bold text-foreground">
                                                    {member.jabatan}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Atasan Langsung */}
                                        <td className="px-6 py-4">
                                            {member.creator ? (
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-semibold text-foreground">
                                                        {member.creator.name}
                                                    </span>
                                                    <span className="text-[10px] text-muted-foreground">
                                                        {member.creator.jabatan || 'Atasan'}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-muted-foreground italic">
                                                    Direct ke Owner
                                                </span>
                                            )}
                                        </td>

                                        {/* Total Jamaah */}
                                        <td className="px-6 py-4 text-center">
                                            <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 font-extrabold text-xs">
                                                {member.total_jamaah} Pax
                                            </span>
                                        </td>

                                        {/* Total Omzet */}
                                        <td className="px-6 py-4 text-right">
                                            <span className="font-bold text-xs text-emerald-600 dark:text-emerald-400">
                                                Rp {member.total_omzet.toLocaleString('id-ID')}
                                            </span>
                                        </td>

                                        {/* Total Komisi */}
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex flex-col items-end">
                                                <span className="font-extrabold text-xs text-foreground">
                                                    Rp {member.total_komisi.toLocaleString('id-ID')}
                                                </span>
                                                <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-0.5">
                                                    <span className="text-emerald-600 font-semibold">
                                                        Lunas: Rp {member.komisi_paid.toLocaleString('id-ID')}
                                                    </span>
                                                    {member.komisi_pending > 0 && (
                                                        <>
                                                            <span>•</span>
                                                            <span className="text-amber-600 font-semibold">
                                                                Pending: Rp {member.komisi_pending.toLocaleString('id-ID')}
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </td>

                                        {/* Action Button */}
                                        <td className="px-6 py-4 text-center">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleOpenDrawer(member)}
                                                className="gap-1.5 text-xs rounded-xl h-8 font-semibold shadow-2xs hover:border-primary/50"
                                            >
                                                <Eye className="w-3.5 h-3.5" />
                                                <span>Lihat Nasabah</span>
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Table Pagination Footer */}
                {teamMembers && (
                    <div className="p-4 border-t border-border/80">
                        <DataTablePagination
                            links={teamMembers.links}
                            from={teamMembers.from}
                            to={teamMembers.to}
                            total={teamMembers.total}
                            currentPage={teamMembers.current_page}
                            lastPage={teamMembers.last_page}
                            onPageChange={(page) => {
                                router.get(
                                    route('keagenan.monitoring.index'),
                                    {
                                        search: debouncedSearch || undefined,
                                        level: selectedLevelFilter !== 'all' ? selectedLevelFilter : undefined,
                                        per_page: teamMembers.per_page,
                                        page: page,
                                    },
                                    { preserveState: true, preserveScroll: true }
                                );
                            }}
                        />
                    </div>
                )}
            </div>

            {/* Quick-View Customer Drawer (Infinite Scroll) */}
            {selectedMember && (
                <div className="fixed inset-0 z-50 overflow-hidden">
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in"
                        onClick={handleCloseDrawer}
                    />

                    <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
                        <div className="w-screen max-w-md bg-card border-l border-border shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                            {/* Drawer Header */}
                            <div className="p-6 border-b border-border flex flex-col gap-4 bg-muted/20">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <Badge
                                                variant="secondary"
                                                className={`text-[10px] font-extrabold border ${getLevelBadgeClasses(
                                                    selectedMember.level
                                                )}`}
                                            >
                                                Level {selectedMember.level}
                                            </Badge>
                                            <span className="text-xs font-bold text-muted-foreground">
                                                {selectedMember.jabatan}
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-bold text-foreground mt-1">
                                            {selectedMember.name}
                                        </h3>
                                        <p className="text-xs text-muted-foreground">{selectedMember.email}</p>
                                    </div>
                                    <button
                                        onClick={handleCloseDrawer}
                                        className="p-1.5 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Drawer Summary Cards */}
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="bg-background/80 rounded-xl p-3 border border-border flex items-center justify-between">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-semibold text-muted-foreground">Total Nasabah</span>
                                            <span className="text-sm font-extrabold text-foreground mt-0.5">
                                                {totalJamaahInDrawer} Orang
                                            </span>
                                        </div>
                                        <Users className="w-4 h-4 text-sky-500" />
                                    </div>

                                    <div className="bg-background/80 rounded-xl p-3 border border-border flex items-center justify-between">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-semibold text-muted-foreground">Omzet Terverifikasi</span>
                                            <span className="text-sm font-extrabold text-emerald-600 mt-0.5">
                                                Rp {selectedMember.total_omzet.toLocaleString('id-ID')}
                                            </span>
                                        </div>
                                        <Wallet className="w-4 h-4 text-emerald-500" />
                                    </div>
                                </div>

                                {/* Drawer Search */}
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                                    <Input
                                        type="text"
                                        placeholder="Cari nasabah nama / HP / paspor..."
                                        value={drawerSearch}
                                        onChange={(e) => setDrawerSearch(e.target.value)}
                                        className="pl-9 text-xs rounded-xl h-8 bg-background"
                                    />
                                    {drawerSearch && (
                                        <button
                                            onClick={() => setDrawerSearch('')}
                                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Drawer Body: Infinite Scroll List (Hidden Scrollbar) */}
                            <div
                                ref={scrollContainerRef}
                                onScroll={handleDrawerScroll}
                                className="flex-1 overflow-y-auto no-scrollbar p-6 flex flex-col gap-3"
                            >
                                {isLoadingInitial && (
                                    <div className="py-20 flex flex-col items-center justify-center gap-3 text-muted-foreground">
                                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                        <span className="text-xs font-semibold">Memuat daftar nasabah...</span>
                                    </div>
                                )}

                                {!isLoadingInitial && drawerJamaahList.length === 0 && (
                                    <div className="py-16 text-center text-muted-foreground flex flex-col items-center gap-2">
                                        <UserCheck className="w-8 h-8 text-muted-foreground/50" />
                                        <span className="text-xs font-semibold">Belum ada nasabah terdaftar</span>
                                    </div>
                                )}

                                {!isLoadingInitial &&
                                    drawerJamaahList.map((item) => (
                                        <div
                                            key={item.id}
                                            className="p-3.5 rounded-xl border border-border/80 bg-background/60 flex flex-col gap-2 hover:border-primary/30 transition-all shadow-2xs"
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-xs text-foreground">
                                                        {item.nama_lengkap}
                                                    </span>
                                                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-0.5">
                                                        <Phone className="w-3 h-3 text-muted-foreground" />
                                                        <span>{item.nomor_hp || '-'}</span>
                                                    </div>
                                                </div>

                                                <Badge
                                                    variant="secondary"
                                                    className="text-[10px] font-bold px-2 py-0.5 bg-primary/10 text-primary border border-primary/20"
                                                >
                                                    {item.crm_stage?.nama_tahap || 'Prospek'}
                                                </Badge>
                                            </div>

                                            <div className="pt-2 border-t border-border/50 flex flex-col gap-1.5">
                                                <div className="flex items-center justify-between text-[11px]">
                                                    <div className="flex items-center gap-1 text-muted-foreground">
                                                        <Plane className="w-3 h-3 text-primary" />
                                                        <span className="truncate max-w-[180px]">
                                                            {item.paket?.nama_paket || 'Belum Pilih Paket'}
                                                        </span>
                                                    </div>
                                                    <span className="font-bold text-foreground">
                                                        Rp {Number(item.paket?.harga || 0).toLocaleString('id-ID')}
                                                    </span>
                                                </div>

                                                {item.nomor_paspor && (
                                                    <div className="text-[10px] text-muted-foreground">
                                                        Paspor: <span className="font-mono font-bold text-foreground">{item.nomor_paspor}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}

                                {isLoadingMore && (
                                    <div className="py-4 flex justify-center items-center gap-2 text-xs text-muted-foreground">
                                        <Loader2 className="w-4 h-4 animate-spin text-primary" />
                                        <span>Memuat data berikutnya...</span>
                                    </div>
                                )}

                                {!drawerHasMore && drawerJamaahList.length > 0 && (
                                    <div className="py-3 text-center text-[11px] text-muted-foreground">
                                        Semua {totalJamaahInDrawer} jamaah telah dimuat
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </PageLayout>
    );
}
