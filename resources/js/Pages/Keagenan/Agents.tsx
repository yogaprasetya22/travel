import * as React from 'react';
import { useForm, router, Link } from '@inertiajs/react';
import PageLayout from '@/Components/Layouts/PageLayout';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import DataTablePagination, { PaginatedData } from '@/Components/DataTablePagination';
import PerPageSelector from '@/Components/PerPageSelector';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from '@/Components/ui/sheet';
import {
    Users,
    UserCheck,
    Search,
    Plus,
    Calendar,
    Mail,
    CheckCircle2,
    Eye,
    Phone,
    ArrowUpRight,
    Loader2,
    Wallet,
    Package,
    X,
} from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';

interface Agent {
    id: number;
    name: string;
    email: string;
    created_at: string;
    jamaah_count?: number;
    total_komisi?: number;
}

interface AgentJamaahItem {
    id: number;
    nama_lengkap: string;
    no_hp: string;
    email?: string | null;
    nik?: string | null;
    nama_paket: string;
    harga_paket: number;
    total_paid: number;
    sisa_tagihan: number;
    status_bayar: 'Lunas' | 'DP Terbayar' | 'Belum Bayar';
    stage: string;
    tanggal_keberangkatan?: string | null;
    created_at: string;
}

interface Props {
    agents: PaginatedData<Agent>;
    metrics?: {
        total_agents: number;
        active_producers: number;
    };
    filters?: {
        search: string;
        per_page: number;
    };
}

export default function Agents({ agents, metrics, filters }: Props) {
    const [isCreateOpen, setIsCreateOpen] = React.useState(false);
    const [isJamaahDrawerOpen, setIsJamaahDrawerOpen] = React.useState(false);

    const [selectedAgent, setSelectedAgent] = React.useState<Agent | null>(null);
    const [searchQuery, setSearchQuery] = React.useState(filters?.search || '');

    // State for Infinite Scroll in Jamaah Drawer
    const [jamaahList, setJamaahList] = React.useState<AgentJamaahItem[]>([]);
    const [drawerSearch, setDrawerSearch] = React.useState('');
    const debouncedDrawerSearch = useDebounce(drawerSearch, 350);

    const [currentPage, setCurrentPage] = React.useState(1);
    const [hasMore, setHasMore] = React.useState(false);
    const [totalJamaahCount, setTotalJamaahCount] = React.useState(0);
    const [isLoadingInitial, setIsLoadingInitial] = React.useState(false);
    const [isLoadingMore, setIsLoadingMore] = React.useState(false);

    const [drawerAgentStats, setDrawerAgentStats] = React.useState<{
        total_jamaah: number;
        total_omzet: number;
    } | null>(null);

    const scrollContainerRef = React.useRef<HTMLDivElement>(null);
    const sentinelRef = React.useRef<HTMLDivElement>(null);

    const agentList = agents.data || [];

    // Create Form
    const createForm = useForm({ name: '', email: '', password: '' });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            route('keagenan.agents.index'),
            { search: searchQuery || undefined },
            { preserveState: true, replace: true }
        );
    };

    // Fetch initial page 1 for the drawer
    const fetchDrawerJamaahPage1 = async (agentId: number, search: string = '') => {
        setIsLoadingInitial(true);
        setCurrentPage(1);

        try {
            const url = new URL(route('keagenan.agents.jamaah', agentId), window.location.origin);
            url.searchParams.set('page', '1');
            url.searchParams.set('per_page', '15');
            if (search) url.searchParams.set('search', search);

            const response = await fetch(url.toString());
            const json = await response.json();

            setJamaahList(json.jamaah || []);
            setHasMore(Boolean(json.has_more));
            setTotalJamaahCount(json.total || 0);
            setDrawerAgentStats({
                total_jamaah: json.agent?.total_jamaah || 0,
                total_omzet: json.agent?.total_omzet || 0,
            });
        } catch (error) {
            console.error('Failed to fetch agent customers:', error);
        } finally {
            setIsLoadingInitial(false);
        }
    };

    // Fetch next page for infinite scroll
    const fetchNextPage = async () => {
        if (!selectedAgent || !hasMore || isLoadingMore || isLoadingInitial) return;

        setIsLoadingMore(true);
        const nextPage = currentPage + 1;

        try {
            const url = new URL(route('keagenan.agents.jamaah', selectedAgent.id), window.location.origin);
            url.searchParams.set('page', nextPage.toString());
            url.searchParams.set('per_page', '15');
            if (debouncedDrawerSearch) url.searchParams.set('search', debouncedDrawerSearch);

            const response = await fetch(url.toString());
            const json = await response.json();

            setJamaahList((prev) => [...prev, ...(json.jamaah || [])]);
            setCurrentPage(nextPage);
            setHasMore(Boolean(json.has_more));
        } catch (error) {
            console.error('Failed to load more customers:', error);
        } finally {
            setIsLoadingMore(false);
        }
    };

    // Open Jamaah Quick-View Drawer
    const openJamaahDrawer = (agent: Agent) => {
        setSelectedAgent(agent);
        setDrawerSearch('');
        setJamaahList([]);
        setIsJamaahDrawerOpen(true);
        fetchDrawerJamaahPage1(agent.id, '');
    };

    // Watch drawer search input with debounce
    React.useEffect(() => {
        if (!isJamaahDrawerOpen || !selectedAgent) return;
        fetchDrawerJamaahPage1(selectedAgent.id, debouncedDrawerSearch);
    }, [debouncedDrawerSearch]);

    // Infinite Scroll onScroll trigger
    const handleDrawerScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        if (scrollHeight - scrollTop - clientHeight < 120) {
            fetchNextPage();
        }
    };

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post(route('keagenan.agents.store'), {
            onSuccess: () => {
                createForm.reset();
                setIsCreateOpen(false);
            },
        });
    };

    return (
        <PageLayout
            title="Daftar Mitra Agen"
            breadcrumbParent="Keagenan & Komisi"
            breadcrumbPage="Daftar Mitra Agen"
            contentClass="p-6 md:p-8 flex flex-col gap-6 w-full max-w-none"
        >
            {/* Header Greeting & Action */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card/60 backdrop-blur-md p-6 rounded-2xl border border-border/80 shadow-xs">
                <div>
                    <div className="flex items-center gap-2.5">
                        <div className="h-8 w-1.5 rounded-full bg-primary" />
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">Daftar Mitra Agen</h1>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 ml-4">
                        Daftar seluruh mitra agen penjualan travel, monitor perolehan jamaah closing, dan lihat rincian nasabah per agen.
                    </p>
                </div>
                <button
                    onClick={() => {
                        createForm.reset();
                        createForm.clearErrors();
                        setIsCreateOpen(true);
                    }}
                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground shadow-xs hover:opacity-90 transition cursor-pointer shrink-0"
                >
                    <Plus className="w-4 h-4" />
                    <span>Tambah Agen Baru</span>
                </button>
            </div>

            {/* Metrics Statistics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                <div className="bg-card/70 border border-border/80 rounded-2xl p-5 shadow-xs flex justify-between items-start">
                    <div>
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Total Mitra Agen
                        </span>
                        <h3 className="text-2xl font-extrabold text-foreground mt-1.5">
                            {metrics?.total_agents || agents.total || 0} Orang
                        </h3>
                    </div>
                    <div className="p-3 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
                        <Users className="w-6 h-6" />
                    </div>
                </div>

                <div className="bg-card/70 border border-border/80 rounded-2xl p-5 shadow-xs flex justify-between items-start">
                    <div>
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Agen Produktif (Pernah Closing)
                        </span>
                        <h3 className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1.5">
                            {metrics?.active_producers || 0} Agen
                        </h3>
                    </div>
                    <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        <UserCheck className="w-6 h-6" />
                    </div>
                </div>

                <div className="bg-card/70 border border-border/80 rounded-2xl p-5 shadow-xs flex justify-between items-start">
                    <div>
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Status Akun
                        </span>
                        <h3 className="text-2xl font-extrabold text-primary mt-1.5">
                            100% Aktif
                        </h3>
                    </div>
                    <div className="p-3 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                        <CheckCircle2 className="w-6 h-6" />
                    </div>
                </div>
            </div>

            {/* Filter Toolbar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card/60 p-4 rounded-2xl border border-border/80">
                <form onSubmit={handleSearch} className="relative w-full sm:w-80">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Cari nama agen atau email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 text-xs bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground placeholder:text-muted-foreground"
                    />
                </form>

                <PerPageSelector value={agents.per_page} />
            </div>

            {/* Table Card */}
            <div className="overflow-hidden rounded-2xl border border-border/80 bg-card/70 backdrop-blur-md shadow-xs">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-border/80 bg-muted/50 text-xs font-bold text-foreground">
                                <th className="px-6 py-4">Nama Agen</th>
                                <th className="px-6 py-4">Kontak Email</th>
                                <th className="px-6 py-4 text-center">Closing Jamaah</th>
                                <th className="px-6 py-4 text-right">Akumulasi Komisi</th>
                                <th className="px-6 py-4">Terdaftar</th>
                                <th className="px-6 py-4 text-center">Rincian Nasabah</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60 text-xs">
                            {agentList.map((agent) => (
                                <tr key={agent.id} className="hover:bg-muted/40 transition-colors">
                                    <td className="px-6 py-4 font-bold text-foreground">
                                        <div className="flex items-center gap-3">
                                            <div className="h-9 w-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs border border-emerald-500/20">
                                                {agent.name.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="text-foreground font-bold">{agent.name}</div>
                                                <div className="text-[10px] text-muted-foreground font-medium">Mitra Agen</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-muted-foreground">
                                        <div className="flex items-center gap-1.5">
                                            <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                                            <span>{agent.email}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button
                                            type="button"
                                            onClick={() => openJamaahDrawer(agent)}
                                            className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-extrabold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition cursor-pointer"
                                            title="Klik untuk melihat nasabah jamaah agen ini"
                                        >
                                            <span>{agent.jamaah_count ?? 0} Jamaah</span>
                                            <ArrowUpRight className="w-3 h-3" />
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 text-right font-extrabold text-primary">
                                        Rp {Number(agent.total_komisi || 0).toLocaleString('id-ID')}
                                    </td>
                                    <td className="px-6 py-4 text-muted-foreground">
                                        <div className="flex items-center gap-1.5">
                                            <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                                            <span>
                                                {new Date(agent.created_at).toLocaleDateString('id-ID', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric',
                                                })}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button
                                            type="button"
                                            onClick={() => openJamaahDrawer(agent)}
                                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary font-bold transition cursor-pointer border border-primary/20 text-xs shadow-xs"
                                            title="Lihat Daftar Nasabah Agen"
                                        >
                                            <Eye className="w-3.5 h-3.5" />
                                            <span>Lihat Nasabah</span>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {agentList.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="py-12 text-center text-muted-foreground italic">
                                        Belum ada mitra agen yang terdaftar.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Shared Pagination */}
                <div className="border-t border-border/80 px-4 bg-muted/20">
                    <DataTablePagination
                        links={agents.links}
                        from={agents.from}
                        to={agents.to}
                        total={agents.total}
                        currentPage={agents.current_page}
                        lastPage={agents.last_page}
                    />
                </div>
            </div>

            {/* DRAWER: RINCIAN NASABAH JAMAAH PER AGENT (INFINITE SCROLL) */}
            <Sheet open={isJamaahDrawerOpen} onOpenChange={(open) => { setIsJamaahDrawerOpen(open); if (!open) setSelectedAgent(null); }}>
                <SheetContent side="right" className="w-full sm:max-w-2xl flex flex-col p-0 gap-0">
                    {/* Drawer Header */}
                    <div className="p-6 border-b border-border bg-muted/30 flex flex-col gap-3">
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-lg border border-emerald-500/20 shrink-0">
                                    {selectedAgent?.name.substring(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <SheetTitle className="text-lg font-bold text-foreground">
                                        {selectedAgent?.name}
                                    </SheetTitle>
                                    <SheetDescription className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                                        <Mail className="w-3.5 h-3.5" />
                                        <span>{selectedAgent?.email}</span>
                                    </SheetDescription>
                                </div>
                            </div>
                            <Link
                                href={route('crm.index')}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs hover:opacity-90 transition shrink-0"
                            >
                                <span>Buka di CRM</span>
                                <ArrowUpRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>

                        {/* Agent Stats Summary Pills */}
                        <div className="grid grid-cols-2 gap-3 pt-1">
                            <div className="bg-background/80 rounded-xl p-3 border border-border flex items-center justify-between">
                                <div className="flex flex-col">
                                    <span className="text-[11px] font-semibold text-muted-foreground">Total Nasabah Terdaftar</span>
                                    <span className="text-base font-extrabold text-foreground mt-0.5">
                                        {drawerAgentStats?.total_jamaah ?? 0} Orang
                                    </span>
                                </div>
                                <div className="p-2 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400">
                                    <Users className="w-4 h-4" />
                                </div>
                            </div>

                            <div className="bg-background/80 rounded-xl p-3 border border-border flex items-center justify-between">
                                <div className="flex flex-col">
                                    <span className="text-[11px] font-semibold text-muted-foreground">Omzet Terverifikasi</span>
                                    <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
                                        Rp {Number(drawerAgentStats?.total_omzet || 0).toLocaleString('id-ID')}
                                    </span>
                                </div>
                                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                    <Wallet className="w-4 h-4" />
                                </div>
                            </div>
                        </div>

                        {/* Search in Drawer */}
                        <div className="relative mt-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Cari nama jamaah, no HP, atau paket..."
                                value={drawerSearch}
                                onChange={(e) => setDrawerSearch(e.target.value)}
                                className="w-full pl-9 pr-8 py-2 text-xs bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                            />
                            {drawerSearch && (
                                <button
                                    type="button"
                                    onClick={() => setDrawerSearch('')}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Drawer Body: Infinite Scroll Container (Hidden Scrollbar) */}
                    <div
                        ref={scrollContainerRef}
                        onScroll={handleDrawerScroll}
                        className="flex-1 overflow-y-auto no-scrollbar p-6 flex flex-col gap-3"
                    >
                        {isLoadingInitial && (
                            <div className="py-20 flex flex-col items-center justify-center gap-3 text-muted-foreground">
                                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                <span className="text-xs font-semibold">Memuat data nasabah agen...</span>
                            </div>
                        )}

                        {!isLoadingInitial && jamaahList.map((j) => (
                            <div
                                key={j.id}
                                className="bg-card border border-border/80 rounded-2xl p-4 shadow-xs flex flex-col gap-3 hover:border-primary/40 transition-all"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-bold text-sm text-foreground">{j.nama_lengkap}</h4>
                                            {j.nik && (
                                                <span className="text-[10px] text-muted-foreground font-mono">NIK: {j.nik}</span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                                            <a
                                                href={`https://wa.me/${j.no_hp.replace(/^0/, '62')}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
                                            >
                                                <Phone className="w-3 h-3" />
                                                <span>{j.no_hp}</span>
                                            </a>
                                            <span>•</span>
                                            <span>Terdaftar: {j.created_at}</span>
                                        </div>
                                    </div>

                                    {/* CRM Stage Badge */}
                                    <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 shrink-0">
                                        {j.stage}
                                    </span>
                                </div>

                                {/* Package & Payment Summary */}
                                <div className="bg-muted/40 rounded-xl p-3 border border-border/60 flex flex-col gap-2 text-xs">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1.5 text-foreground font-semibold">
                                            <Package className="w-3.5 h-3.5 text-primary" />
                                            <span>{j.nama_paket}</span>
                                        </div>
                                        <span className="font-bold text-foreground">
                                            Rp {Number(j.harga_paket).toLocaleString('id-ID')}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between pt-2 border-t border-border/40 text-[11px]">
                                        <div className="flex items-center gap-2">
                                            <span className={`px-2 py-0.5 rounded-md font-bold ${
                                                j.status_bayar === 'Lunas'
                                                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                                    : j.status_bayar === 'DP Terbayar'
                                                    ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400'
                                                    : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                            }`}>
                                                {j.status_bayar}
                                            </span>
                                            <span className="text-muted-foreground">
                                                Dibayar: <strong className="text-emerald-600 dark:text-emerald-400">Rp {Number(j.total_paid).toLocaleString('id-ID')}</strong>
                                            </span>
                                        </div>
                                        {j.sisa_tagihan > 0 && (
                                            <span className="text-muted-foreground font-medium">
                                                Sisa: <strong className="text-destructive font-bold">Rp {Number(j.sisa_tagihan).toLocaleString('id-ID')}</strong>
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Infinite Scroll Loading Spinner */}
                        {isLoadingMore && (
                            <div className="py-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                                <span>Memuat lebih banyak nasabah...</span>
                            </div>
                        )}

                        {!isLoadingInitial && !hasMore && jamaahList.length > 0 && (
                            <div className="py-4 text-center text-[11px] text-muted-foreground">
                                Menampilkan semua {jamaahList.length} nasabah jamaah binaan.
                            </div>
                        )}

                        {!isLoadingInitial && jamaahList.length === 0 && (
                            <div className="py-16 text-center text-xs text-muted-foreground flex flex-col items-center gap-2">
                                <Users className="w-8 h-8 opacity-40" />
                                <span>{drawerSearch ? 'Tidak ada nasabah yang sesuai dengan pencarian.' : 'Belum ada nasabah jamaah yang terdaftar melalui agen ini.'}</span>
                            </div>
                        )}

                        <div ref={sentinelRef} className="h-2" />
                    </div>

                    {/* Drawer Footer */}
                    <div className="p-4 border-t border-border bg-muted/20 flex justify-between items-center text-xs text-muted-foreground">
                        <span>
                            Memuat {jamaahList.length} dari {totalJamaahCount} data
                        </span>
                        <button
                            type="button"
                            onClick={() => setIsJamaahDrawerOpen(false)}
                            className="px-4 py-2 border border-border text-foreground hover:bg-muted/40 rounded-xl text-xs font-semibold transition"
                        >
                            Tutup
                        </button>
                    </div>
                </SheetContent>
            </Sheet>

            {/* DRAWER: TAMBAH AGEN BARU */}
            <Sheet open={isCreateOpen} onOpenChange={(open) => { setIsCreateOpen(open); if (!open) createForm.reset(); }}>
                <SheetContent side="right" className="w-full sm:max-w-md">
                    <SheetHeader>
                        <SheetTitle>Tambah Mitra Agen Baru</SheetTitle>
                        <SheetDescription>Daftarkan akun mitra agen baru untuk travel aktif.</SheetDescription>
                    </SheetHeader>
                    <form onSubmit={handleCreateSubmit} className="flex flex-col gap-4 p-4 overflow-y-auto flex-1">
                        <div>
                            <InputLabel htmlFor="create-name" value="Nama Lengkap Agen" />
                            <TextInput
                                id="create-name"
                                type="text"
                                value={createForm.data.name}
                                className="mt-1 block w-full"
                                onChange={(e) => createForm.setData('name', e.target.value)}
                                placeholder="Contoh: Ahmad Subagja"
                                required
                            />
                            <InputError message={createForm.errors.name} className="mt-1" />
                        </div>
                        <div>
                            <InputLabel htmlFor="create-email" value="Alamat Email" />
                            <TextInput
                                id="create-email"
                                type="email"
                                value={createForm.data.email}
                                className="mt-1 block w-full"
                                onChange={(e) => createForm.setData('email', e.target.value)}
                                placeholder="agen@travel.com"
                                required
                            />
                            <InputError message={createForm.errors.email} className="mt-1" />
                        </div>
                        <div>
                            <InputLabel htmlFor="create-password" value="Password Akun" />
                            <TextInput
                                id="create-password"
                                type="password"
                                value={createForm.data.password}
                                className="mt-1 block w-full"
                                onChange={(e) => createForm.setData('password', e.target.value)}
                                placeholder="Minimal 8 karakter"
                                required
                            />
                            <InputError message={createForm.errors.password} className="mt-1" />
                        </div>
                        <div className="mt-4 flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => { setIsCreateOpen(false); createForm.reset(); }}
                                className="px-4 py-2 border border-border text-foreground hover:bg-muted/40 rounded-xl text-xs font-semibold transition"
                            >
                                Batal
                            </button>
                            <PrimaryButton disabled={createForm.processing}>
                                {createForm.processing ? 'Menyimpan...' : 'Simpan Agen'}
                            </PrimaryButton>
                        </div>
                    </form>
                </SheetContent>
            </Sheet>
        </PageLayout>
    );
}
