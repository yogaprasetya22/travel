import React from 'react';
import { Link } from '@inertiajs/react';
import {
    Sheet,
    SheetContent,
    SheetTitle,
    SheetDescription,
} from '@/Components/ui/sheet';
import {
    Users,
    Search,
    Mail,
    Phone,
    ArrowUpRight,
    Loader2,
    Wallet,
    Package,
    X,
    Share2,
    Check,
} from 'lucide-react';
import { getAgentBioUrl } from '@/lib/utils';
import { Agent, AgentJamaahItem } from './types';

interface AgentJamaahDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    selectedAgent: Agent | null;
    jamaahList: AgentJamaahItem[];
    totalJamaahCount: number;
    drawerAgentStats: { total_jamaah: number; total_omzet: number } | null;
    drawerSearch: string;
    setDrawerSearch: (search: string) => void;
    isLoadingInitial: boolean;
    isLoadingMore: boolean;
    hasMore: boolean;
    onScroll: (e: React.UIEvent<HTMLDivElement>) => void;
    scrollContainerRef: React.RefObject<HTMLDivElement | null>;
}

export function AgentJamaahDrawer({
    isOpen,
    onClose,
    selectedAgent,
    jamaahList,
    totalJamaahCount,
    drawerAgentStats,
    drawerSearch,
    setDrawerSearch,
    isLoadingInitial,
    isLoadingMore,
    hasMore,
    onScroll,
    scrollContainerRef,
}: AgentJamaahDrawerProps) {
    const [isCopied, setIsCopied] = React.useState(false);

    const handleCopyBioLink = (agent: Agent) => {
        const url = getAgentBioUrl(agent.referral_code, agent.tenant?.domain_atau_subdomain);
        if (!url) return;
        navigator.clipboard.writeText(url);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2500);
    };

    return (
        <Sheet open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
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
                        <div className="flex items-center gap-2 shrink-0">
                            {selectedAgent?.referral_code && (
                                <button
                                    type="button"
                                    onClick={() => selectedAgent && handleCopyBioLink(selectedAgent)}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-card hover:bg-muted text-foreground border border-border font-semibold text-xs transition cursor-pointer shadow-xs"
                                    title="Salin Link Bio Link Agen"
                                >
                                    {isCopied ? (
                                        <>
                                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                                            <span className="text-emerald-600 dark:text-emerald-400 font-bold">Link Tersalin!</span>
                                        </>
                                    ) : (
                                        <>
                                            <Share2 className="w-3.5 h-3.5 text-primary" />
                                            <span>Share Bio Link</span>
                                        </>
                                    )}
                                </button>
                            )}
                            <Link
                                href={route('crm.index')}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs hover:opacity-90 transition shrink-0"
                            >
                                <span>Buka CRM</span>
                                <ArrowUpRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>
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

                {/* Drawer Body: Infinite Scroll Container */}
                <div
                    ref={scrollContainerRef as any}
                    onScroll={onScroll}
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
                </div>

                {/* Drawer Footer */}
                <div className="p-4 border-t border-border bg-muted/20 flex justify-between items-center text-xs text-muted-foreground">
                    <span>
                        Memuat {jamaahList.length} dari {totalJamaahCount} data
                    </span>
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 border border-border text-foreground hover:bg-muted/40 rounded-xl text-xs font-semibold transition cursor-pointer"
                    >
                        Tutup
                    </button>
                </div>
            </SheetContent>
        </Sheet>
    );
}
