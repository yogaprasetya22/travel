import React, { useState, useMemo, useEffect, useRef } from 'react';
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
    ChevronRight,
    ArrowUpRight,
    Eye,
    CheckCircle2,
    Clock,
    X,
    Phone,
    Plane,
    Calendar,
    Loader2,
    SlidersHorizontal,
    Sparkles,
} from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';

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
    override_komisi: number;
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
        status: string;
    }>;
}

interface Props extends PageProps {
    teamMembers: TeamMember[];
    summary: {
        total_members: number;
        total_jamaah: number;
        total_omzet: number;
        total_komisi: number;
        total_paid: number;
        total_pending: number;
    };
    hierarchyLevels: HierarchyLevelItem[];
    currentUser: {
        id: number;
        name: string;
        level: number;
        level_label: string;
    };
}

export default function Monitoring({
    teamMembers = [],
    summary,
    hierarchyLevels = [],
    currentUser,
}: Props) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedLevelFilter, setSelectedLevelFilter] = useState<string>('all');

    // Customer Drawer State
    const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
    const [drawerJamaahList, setDrawerJamaahList] = useState<JamaahDetailItem[]>([]);
    const [drawerSearch, setDrawerSearch] = useState('');
    const debouncedDrawerSearch = useDebounce(drawerSearch, 300);
    const [drawerPage, setDrawerPage] = useState(1);
    const [drawerHasMore, setDrawerHasMore] = useState(false);
    const [isLoadingInitial, setIsLoadingInitial] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [totalJamaahInDrawer, setTotalJamaahInDrawer] = useState(0);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Filtered Team Members
    const filteredMembers = useMemo(() => {
        return teamMembers.filter((m) => {
            const matchesSearch =
                m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                m.jabatan.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (m.creator?.name && m.creator.name.toLowerCase().includes(searchQuery.toLowerCase()));

            const matchesLevel =
                selectedLevelFilter === 'all' || m.level.toString() === selectedLevelFilter;

            return matchesSearch && matchesLevel;
        });
    }, [teamMembers, searchQuery, selectedLevelFilter]);

    // Drawer Data Fetching
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

    const handleOpenDrawer = (member: TeamMember) => {
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
                        <span className="text-xs font-semibold text-muted-foreground">Anggota Tim Downline</span>
                        <span className="text-2xl font-extrabold text-foreground mt-1">
                            {summary?.total_members || 0}
                        </span>
                        <span className="text-[11px] text-muted-foreground mt-0.5">Bawahan di jalur Anda</span>
                    </div>
                    <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                        <Users className="w-6 h-6" />
                    </div>
                </Card>

                {/* 2. Total Jamaah Tim */}
                <Card className="bg-card/70 backdrop-blur-md border border-border/80 rounded-2xl p-5 shadow-xs flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-xs font-semibold text-muted-foreground">Total Jamaah Terdaftar</span>
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
                        <span className="text-xs font-semibold text-muted-foreground">Total Komisi &amp; Override</span>
                        <span className="text-xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">
                            Rp {(summary?.total_komisi || 0).toLocaleString('id-ID')}
                        </span>
                        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mt-0.5">
                            <span className="text-emerald-600 font-bold">Dicairkan: Rp {(summary?.total_paid || 0).toLocaleString('id-ID')}</span>
                        </div>
                    </div>
                    <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                        <Coins className="w-6 h-6" />
                    </div>
                </Card>
            </div>

            {/* Filter & Search Bar */}
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
                        <span className="text-xs font-semibold text-muted-foreground">Filter Tingkat:</span>
                    </div>

                    <select
                        value={selectedLevelFilter}
                        onChange={(e) => setSelectedLevelFilter(e.target.value)}
                        className="text-xs bg-background border border-border rounded-xl px-3 py-1.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 font-medium"
                    >
                        <option value="all">Semua Tingkatan ({teamMembers.length})</option>
                        {hierarchyLevels.map((lvl) => (
                            <option key={lvl.id} value={lvl.urutan.toString()}>
                                Level {lvl.urutan} - {lvl.nama_level} (
                                {teamMembers.filter((m) => m.level === lvl.urutan).length})
                            </option>
                        ))}
                    </select>
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
                                    Komisi &amp; Override
                                </th>
                                <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-foreground">
                                    Aksi
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60">
                            {filteredMembers.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground text-xs font-medium">
                                        Tidak ada anggota tim bawahan yang sesuai dengan filter pencarian.
                                    </td>
                                </tr>
                            ) : (
                                filteredMembers.map((member) => (
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
                                    <div className="py-3 text-center text-[11px] text-muted-foreground font-semibold">
                                        ✓ Semua {totalJamaahInDrawer} nasabah telah dimuat
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
