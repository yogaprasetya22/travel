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
} from 'lucide-react';
import { Badge } from '@/Components/ui/badge';
import DataTablePagination, { PaginatedData } from '@/Components/DataTablePagination';
import PerPageSelector from '@/Components/PerPageSelector';
import { getAgentBioUrl } from '@/lib/utils';
import { Agent } from './types';

interface AgentTableProps {
    agents: PaginatedData<Agent>;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    onSearchSubmit: (e: React.FormEvent) => void;
    onOpenCreate: () => void;
    onOpenEdit: (agent: Agent) => void;
    onOpenJamaah: (agent: Agent) => void;
    onDeleteAgent: (agent: Agent) => void;
}

export function AgentTable({
    agents,
    searchQuery,
    setSearchQuery,
    onSearchSubmit,
    onOpenCreate,
    onOpenEdit,
    onOpenJamaah,
    onDeleteAgent,
}: AgentTableProps) {
    const [copiedAgentId, setCopiedAgentId] = React.useState<number | null>(null);

    const handleCopyBioLink = (agent: Agent) => {
        const url = getAgentBioUrl(agent.referral_code, agent.tenant?.domain_atau_subdomain);
        if (!url) return;
        navigator.clipboard.writeText(url);
        setCopiedAgentId(agent.id);
        setTimeout(() => setCopiedAgentId(null), 2500);
    };

    const agentList = agents.data || [];

    return (
        <div className="flex flex-col gap-4">
            {/* Filter Toolbar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card/60 p-4 rounded-2xl border border-border/80 shadow-xs">
                <form onSubmit={onSearchSubmit} className="relative w-full sm:w-80">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Cari nama agen, email, kota, atau referral..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 text-xs bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground placeholder:text-muted-foreground"
                    />
                </form>

                <div className="flex items-center gap-2">
                    <PerPageSelector value={agents.per_page} />
                    <button
                        type="button"
                        onClick={onOpenCreate}
                        className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground font-bold text-xs rounded-xl shadow-xs hover:opacity-90 transition cursor-pointer"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Tambah Agen</span>
                    </button>
                </div>
            </div>

            {/* Comprehensive Table Card */}
            <div className="overflow-hidden rounded-2xl border border-border/80 bg-card/70 backdrop-blur-md shadow-xs">
                <div className="overflow-x-auto">
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
                                const bioUrl = getAgentBioUrl(agent.referral_code, agent.tenant?.domain_atau_subdomain);
                                const isCopied = copiedAgentId === agent.id;

                                return (
                                    <tr key={agent.id} className="hover:bg-muted/40 transition-colors">
                                        {/* 1. Nama & Level Hierarki */}
                                        <td className="px-6 py-4 font-bold text-foreground">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xs border border-primary/20 shrink-0">
                                                    {agent.avatar_url || agent.avatar ? (
                                                        <img src={agent.avatar_url || `/storage/${agent.avatar}`} alt={agent.name} className="h-full w-full object-cover rounded-xl" />
                                                    ) : (
                                                        agent.name.substring(0, 2).toUpperCase()
                                                    )}
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <div className="text-foreground font-bold flex items-center gap-1.5 flex-wrap">
                                                        <span>{agent.name}</span>
                                                        {agent.referral_code && (
                                                            <span className="px-1.5 py-0.5 rounded-md bg-primary/10 text-[9px] font-extrabold tracking-wider text-primary">
                                                                {agent.referral_code}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <Badge variant="secondary" className="text-[10px] font-semibold bg-muted text-muted-foreground border-border/60 px-1.5 py-0">
                                                            {agent.hierarchy_level?.nama_level || agent.jabatan || 'Mitra Agen'}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* 2. Kontak & Domisili */}
                                        <td className="px-6 py-4 text-muted-foreground">
                                            <div className="flex flex-col gap-1">
                                                {agent.no_hp ? (
                                                    <a
                                                        href={`https://wa.me/${agent.no_hp.replace(/^0/, '62')}`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
                                                    >
                                                        <Phone className="w-3 h-3" />
                                                        <span>{agent.no_hp}</span>
                                                    </a>
                                                ) : (
                                                    <span className="text-[11px] text-muted-foreground italic">No. WA belum diisi</span>
                                                )}

                                                <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                                                    <Mail className="w-3 h-3" />
                                                    <span>{agent.email}</span>
                                                </div>

                                                {agent.kota && (
                                                    <div className="flex items-center gap-1 text-[10px] text-foreground/80 font-medium">
                                                        <MapPin className="w-3 h-3 text-primary" />
                                                        <span>{agent.kota}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </td>

                                        {/* 3. Atasan / Tim */}
                                        <td className="px-6 py-4 text-foreground">
                                            {agent.creator ? (
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-xs">{agent.creator.name}</span>
                                                    <span className="text-[10px] text-muted-foreground">
                                                        {agent.creator.jabatan || agent.creator.role}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-[11px] text-muted-foreground italic">Langsung Travel</span>
                                            )}
                                        </td>

                                        {/* 4. Bio Link Publik */}
                                        <td className="px-6 py-4">
                                            {bioUrl ? (
                                                <div className="flex items-center gap-1.5">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleCopyBioLink(agent)}
                                                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer shadow-xs ${
                                                            isCopied
                                                                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                                                                : 'bg-background hover:bg-muted text-foreground border-border'
                                                        }`}
                                                        title="Salin Link Bio Link Agen"
                                                    >
                                                        {isCopied ? (
                                                            <>
                                                                <Check className="w-3 h-3 text-emerald-500" />
                                                                <span className="text-[11px] font-bold">Tersalin!</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Share2 className="w-3 h-3 text-primary" />
                                                                <span className="text-[11px]">Share Link</span>
                                                            </>
                                                        )}
                                                    </button>
                                                    <a
                                                        href={bioUrl}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                                                        title="Buka Halaman Bio Link"
                                                    >
                                                        <ExternalLink className="w-3.5 h-3.5" />
                                                    </a>
                                                </div>
                                            ) : (
                                                <span className="text-[11px] text-muted-foreground italic">-</span>
                                            )}
                                        </td>

                                        {/* 5. Closing Jamaah */}
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                type="button"
                                                onClick={() => onOpenJamaah(agent)}
                                                className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-extrabold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition cursor-pointer"
                                                title="Klik untuk melihat nasabah jamaah agen ini"
                                            >
                                                <span>{agent.jamaah_count ?? 0} Jamaah</span>
                                                <ArrowUpRight className="w-3 h-3" />
                                            </button>
                                        </td>

                                        {/* 6. Akumulasi Komisi */}
                                        <td className="px-6 py-4 text-right font-extrabold text-primary">
                                            Rp {Number(agent.total_komisi || 0).toLocaleString('id-ID')}
                                        </td>

                                        {/* 7. Aksi */}
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center gap-1.5">
                                                <button
                                                    type="button"
                                                    onClick={() => onOpenEdit(agent)}
                                                    className="p-1.5 rounded-lg border border-border bg-background hover:bg-muted text-foreground transition-colors cursor-pointer"
                                                    title="Edit Data Agen"
                                                >
                                                    <Edit2 className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => onOpenJamaah(agent)}
                                                    className="p-1.5 rounded-lg border border-primary/20 bg-primary/10 hover:bg-primary/20 text-primary transition-colors cursor-pointer"
                                                    title="Lihat Rincian Nasabah"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => onDeleteAgent(agent)}
                                                    className="p-1.5 rounded-lg border border-destructive/20 bg-destructive/10 hover:bg-destructive/20 text-destructive transition-colors cursor-pointer"
                                                    title="Hapus Agen"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {agentList.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="py-12 text-center text-muted-foreground italic">
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
        </div>
    );
}
