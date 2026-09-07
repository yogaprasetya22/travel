import React from 'react';
import {
    Edit2,
    Trash2,
    Search,
    Mail,
    Phone,
    MapPin,
    ArrowUpRight,
    Share2,
    Check,
    ExternalLink,
    Eye,
    Plus,
    RotateCcw,
    Layers,
    CheckCircle2,
    Users,
    Calendar,
    Award,
} from 'lucide-react';
import { Badge } from '@/Components/ui/badge';
import DataTablePagination, { PaginatedData } from '@/Components/DataTablePagination';
import PerPageSelector from '@/Components/PerPageSelector';
import { DatePickerWithRange } from '@/Components/DatePickerWithRange';
import { DateRange } from 'react-day-picker';
import { getAgentBioUrl, copyToClipboard } from '@/lib/utils';
import { Agent, HierarchyLevelItem, LeaderItem } from './types';
import { toRupiah } from '@/Components/CurrencyInput';

interface AgentTableProps {
    agents: PaginatedData<Agent>;
    hierarchyLevels?: HierarchyLevelItem[];
    leaders?: LeaderItem[];
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    levelFilter: string;
    setLevelFilter: (level: string) => void;
    statusFilter: string;
    setStatusFilter: (status: string) => void;
    leaderFilter: string;
    setLeaderFilter: (leader: string) => void;
    dateRange: DateRange | undefined;
    onDateRangeChange: (range: DateRange | undefined) => void;
    onResetFilters: () => void;
    hasActiveFilters: boolean;
    onOpenCreate: () => void;
    onOpenEdit: (agent: Agent) => void;
    onOpenJamaah: (agent: Agent) => void;
    onDeleteAgent: (agent: Agent) => void;
}

export function AgentTable({
    agents,
    hierarchyLevels = [],
    leaders = [],
    searchQuery,
    setSearchQuery,
    levelFilter,
    setLevelFilter,
    statusFilter,
    setStatusFilter,
    leaderFilter,
    setLeaderFilter,
    dateRange,
    onDateRangeChange,
    onResetFilters,
    hasActiveFilters,
    onOpenCreate,
    onOpenEdit,
    onOpenJamaah,
    onDeleteAgent,
}: AgentTableProps) {
    const [copiedAgentId, setCopiedAgentId] = React.useState<number | null>(null);

    const handleCopyBioLink = async (agent: Agent) => {
        const url = getAgentBioUrl(agent.referral_code, agent.tenant?.domain_atau_subdomain);
        if (!url) return;
        await copyToClipboard(url);
        setCopiedAgentId(agent.id);
        setTimeout(() => setCopiedAgentId(null), 2500);
    };

    const agentList = agents.data || [];

    return (
        <div className="flex flex-col gap-4">
            {/* Multi-Criteria Filter Toolbar */}
            <div className="flex flex-col gap-3.5 bg-card/70 backdrop-blur-md p-4 rounded-2xl border border-border/80 shadow-xs">
                {/* Row 1: Search, Reset, PerPage & Tambah Agen */}
                <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Cari nama agen, email, kota, referral..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 text-xs bg-background border border-border rounded-xl focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground placeholder:text-muted-foreground"
                        />
                    </div>

                    <div className="flex items-center gap-2.5 self-end md:self-auto flex-wrap">
                        {hasActiveFilters && (
                            <button
                                type="button"
                                onClick={onResetFilters}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl hover:bg-rose-500/20 transition cursor-pointer"
                            >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span>Reset Filter</span>
                            </button>
                        )}
                        <PerPageSelector value={agents.per_page} />
                        <button
                            type="button"
                            onClick={onOpenCreate}
                            className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground font-bold text-xs rounded-xl shadow-xs hover:opacity-90 transition cursor-pointer shrink-0"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Tambah Agen</span>
                        </button>
                    </div>
                </div>

                {/* Row 2: Filter Categories (Jenjang Level, Status Produksi, Atasan / Leader) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-border/60 text-xs">
                    {/* Filter 1: Jenjang Level Hierarki */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                            <Layers className="w-3.5 h-3.5 text-primary" />
                            <span>Jenjang / Level Hierarki</span>
                        </label>
                        <select
                            value={levelFilter}
                            onChange={(e) => setLevelFilter(e.target.value)}
                            className="w-full py-2 px-3 text-xs bg-background border border-border rounded-xl focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground cursor-pointer"
                        >
                            <option value="ALL">Semua Jenjang Kemitraan</option>
                            {hierarchyLevels.map((lvl) => (
                                <option key={lvl.id} value={lvl.id}>
                                    {lvl.nama_level} (Level {lvl.urutan})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Filter 2: Status Produksi Closing */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                            <span>Produktivitas Closing</span>
                        </label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full py-2 px-3 text-xs bg-background border border-border rounded-xl focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground cursor-pointer"
                        >
                            <option value="ALL">Semua Produktivitas</option>
                            <option value="PRODUCING">Aktif Closing (Punya Jamaah)</option>
                            <option value="NON_PRODUCING">Belum Closing (0 Jamaah)</option>
                            <option value="ACTIVE">Status Karyawan Aktif</option>
                        </select>
                    </div>

                    {/* Filter 3: Atasan / Leader Tim */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                            <Users className="w-3.5 h-3.5 text-primary" />
                            <span>Atasan / Leader Tim</span>
                        </label>
                        <select
                            value={leaderFilter}
                            onChange={(e) => setLeaderFilter(e.target.value)}
                            className="w-full py-2 px-3 text-xs bg-background border border-border rounded-xl focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground cursor-pointer"
                        >
                            <option value="ALL">Semua Leader / Tim</option>
                            {leaders.map((lead) => (
                                <option key={lead.id} value={lead.id}>
                                    {lead.name} ({lead.role})
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Row 3: DatePickerWithRange Component */}
                <div className="pt-3 border-t border-border/60 text-xs">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-primary" />
                            <span>Rentang Tanggal Bergabung / Registrasi</span>
                        </label>
                        <DatePickerWithRange
                            dateRange={dateRange}
                            onChange={onDateRangeChange}
                            placeholder="Pilih rentang tanggal bergabung (dari - sampai)..."
                        />
                    </div>
                </div>
            </div>

            {/* Comprehensive Table Card */}
            <div className="overflow-hidden rounded-2xl border border-border/80 bg-card/70 backdrop-blur-md shadow-xs">
                <div className="overflow-x-auto low-scrollbar">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-border/80 bg-muted/50 text-xs font-bold text-foreground">
                                <th className="px-6 py-4">Mitra Agen &amp; Level</th>
                                <th className="px-6 py-4">Kontak &amp; Domisili</th>
                                <th className="px-6 py-4">Atasan / Tim</th>
                                <th className="px-6 py-4">Bio Link Publik</th>
                                <th className="px-6 py-4 text-center">Closing Jamaah</th>
                                <th className="px-6 py-4 text-right">Akumulasi Komisi</th>
                                <th className="px-6 py-4 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60 text-xs">
                            {agentList.map((agent) => {
                                const bioUrl = getAgentBioUrl(
                                    agent.referral_code,
                                    agent.tenant?.domain_atau_subdomain
                                );
                                const isCopied = copiedAgentId === agent.id;

                                return (
                                    <tr key={agent.id} className="hover:bg-muted/40 transition-colors">
                                        {/* 1. Nama & Level Hierarki */}
                                        <td className="px-6 py-4 font-bold text-foreground">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xs border border-primary/20 shrink-0">
                                                    {agent.avatar_url || agent.avatar ? (
                                                        <img
                                                            src={agent.avatar_url || `/storage/${agent.avatar}`}
                                                            alt={agent.name}
                                                            className="h-full w-full object-cover rounded-xl"
                                                        />
                                                    ) : (
                                                        agent.name?.charAt(0)?.toUpperCase() || 'A'
                                                    )}
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="font-bold text-foreground text-sm flex items-center gap-1.5">
                                                        <span>{agent.name}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 flex-wrap">
                                                        <Badge
                                                            variant="outline"
                                                            className="text-[10px] font-bold bg-primary/5 text-primary border-primary/20"
                                                        >
                                                            {agent.hierarchy_level?.nama_level ||
                                                                agent.jabatan ||
                                                                'Mitra Agen'}
                                                        </Badge>
                                                        {agent.status_karyawan && (
                                                            <span className="text-[10px] text-muted-foreground uppercase font-mono">
                                                                • {agent.status_karyawan}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* 2. Kontak & Domisili */}
                                        <td className="px-6 py-4 text-muted-foreground">
                                            <div className="space-y-1">
                                                {agent.email && (
                                                    <div className="flex items-center gap-1.5 text-foreground font-medium">
                                                        <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                                                        <span>{agent.email}</span>
                                                    </div>
                                                )}
                                                {agent.no_hp && (
                                                    <div className="flex items-center gap-1.5 font-mono text-[11px]">
                                                        <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                                                        <span>{agent.no_hp}</span>
                                                    </div>
                                                )}
                                                {agent.kota && (
                                                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                                                        <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                                                        <span>{agent.kota}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </td>

                                        {/* 3. Atasan / Leader */}
                                        <td className="px-6 py-4 text-foreground">
                                            {agent.creator ? (
                                                <div className="space-y-0.5">
                                                    <div className="font-semibold text-xs text-foreground">
                                                        {agent.creator.name}
                                                    </div>
                                                    <div className="text-[11px] text-muted-foreground">
                                                        {agent.creator.jabatan || agent.creator.role}
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground text-xs italic">
                                                    Langsung ke Kantor Pusat
                                                </span>
                                            )}
                                        </td>

                                        {/* 4. Bio Link Publik */}
                                        <td className="px-6 py-4">
                                            {bioUrl ? (
                                                <div className="flex items-center gap-1.5">
                                                    <a
                                                        href={bioUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                                                    >
                                                        <span>Buka Landing</span>
                                                        <ExternalLink className="w-3 h-3" />
                                                    </a>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleCopyBioLink(agent)}
                                                        className="p-1 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition cursor-pointer"
                                                        title="Salin Link Bio"
                                                    >
                                                        {isCopied ? (
                                                            <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                                        ) : (
                                                            <Share2 className="w-3.5 h-3.5" />
                                                        )}
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground text-xs italic">
                                                    Belum aktif
                                                </span>
                                            )}
                                        </td>

                                        {/* 5. Closing Jamaah */}
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                type="button"
                                                onClick={() => onOpenJamaah(agent)}
                                                className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground font-bold rounded-xl text-xs transition cursor-pointer shadow-2xs"
                                                title="Lihat Daftar Jamaah Terdaftar"
                                            >
                                                <Eye className="w-3.5 h-3.5" />
                                                <span>{agent.jamaah_count || 0} Jamaah</span>
                                            </button>
                                        </td>

                                        {/* 6. Akumulasi Komisi */}
                                        <td className="px-6 py-4 text-right font-mono font-bold text-foreground">
                                            {toRupiah(agent.total_komisi || 0)}
                                        </td>

                                        {/* 7. Aksi */}
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center gap-1.5">
                                                <button
                                                    type="button"
                                                    onClick={() => onOpenEdit(agent)}
                                                    className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition cursor-pointer"
                                                    title="Edit Data Agen"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => onDeleteAgent(agent)}
                                                    className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition cursor-pointer"
                                                    title="Hapus Agen"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}

                            {agentList.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                                        <Users className="w-10 h-10 mx-auto text-muted-foreground/40 mb-2" />
                                        <p className="font-semibold text-foreground">Tidak ada mitra agen ditemukan</p>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            Coba ubah kriteria pencarian atau filter yang dipilih.
                                        </p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
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
        </div>
    );
}
