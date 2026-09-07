import * as React from 'react';
import { router, useForm } from '@inertiajs/react';
import PageLayout from '@/Components/Layouts/PageLayout';
import DataTablePagination, { PaginatedData } from '@/Components/DataTablePagination';
import PerPageSelector from '@/Components/PerPageSelector';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/Components/ui/dialog';
import {
    Search,
    X,
    Coins,
    CheckCircle2,
    Clock,
    Printer,
    SendHorizontal,
    Receipt,
    FileSpreadsheet,
    Building2,
    Calendar,
    CheckSquare,
    Square,
    Filter,
} from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';
import { useMounted } from '@/hooks/use-mounted';
import { DatePickerWithRange } from '@/Components/DatePickerWithRange';
import { DateRange } from 'react-day-picker';
import { format, parseISO } from 'date-fns';
import CommissionSlipModal from './Components/CommissionSlipModal';
import CommissionRecapPrintModal from './Components/CommissionRecapPrintModal';

interface Commission {
    id: number;
    nominal_komisi: number;
    status_pencairan: 'Pending' | 'Ready_to_Pay' | 'Paid';
    nomor_referensi?: string | null;
    metode_pembayaran?: string | null;
    catatan_pencairan?: string | null;
    tanggal_pencairan?: string | null;
    created_at: string;
    agen: {
        id: number;
        name: string;
        email: string;
        nama_bank?: string | null;
        nomor_rekening?: string | null;
        atas_nama_rekening?: string | null;
    };
    jamaah: {
        nama_lengkap: string;
        paket?: { nama_paket: string; harga: number };
    };
}

interface ReadyAgent {
    id: number;
    name: string;
    email: string;
    nama_bank?: string | null;
    nomor_rekening?: string | null;
    atas_nama_rekening?: string | null;
    ready_nominal: number;
    ready_count: number;
}

interface AgentOption {
    id: number;
    name: string;
    email: string;
    nama_bank?: string | null;
    nomor_rekening?: string | null;
}

interface PackageOption {
    id: number;
    nama_paket: string;
}

interface Props {
    commissions: PaginatedData<Commission>;
    allCommissions?: Commission[];
    stats: {
        total_paid: number;
        total_ready: number;
        total_pending: number;
    };
    readyAgents?: ReadyAgent[];
    agentList?: AgentOption[];
    packageList?: PackageOption[];
    tenantName?: string;
    filters?: {
        search?: string;
        status?: string;
        agen_id?: string | number;
        paket_id?: string | number;
        start_date?: string;
        end_date?: string;
        date_field?: string;
        per_page?: number;
    };
    isAgent?: boolean;
}

export default function Commissions({
    commissions,
    allCommissions = [],
    stats,
    readyAgents = [],
    agentList = [],
    packageList = [],
    tenantName = "Travel Umroh & Haji",
    filters,
    isAgent = false,
}: Props) {
    const commissionList = commissions.data || [];
    const isMounted = useMounted();

    // Filters state
    const [searchQuery, setSearchQuery] = React.useState(filters?.search || '');
    const [statusFilter, setStatusFilter] = React.useState(filters?.status || 'ALL');
    const [agenFilter, setAgenFilter] = React.useState(String(filters?.agen_id || 'ALL'));
    const [paketFilter, setPaketFilter] = React.useState(String(filters?.paket_id || 'ALL'));
    const [dateRange, setDateRange] = React.useState<DateRange | undefined>(() => {
        if (filters?.start_date && filters?.end_date) {
            try {
                return {
                    from: parseISO(filters.start_date),
                    to: parseISO(filters.end_date),
                };
            } catch {
                return undefined;
            }
        }
        return undefined;
    });

    const debouncedSearch = useDebounce(searchQuery, 350);
    const isInitialMount = React.useRef(true);

    // Multi-select checkbox state
    const [selectedIds, setSelectedIds] = React.useState<number[]>([]);

    // Modals state
    const [isSinglePayoutOpen, setIsSinglePayoutOpen] = React.useState(false);
    const [isBatchAgentOpen, setIsBatchAgentOpen] = React.useState(false);
    const [isBatchSelectedOpen, setIsBatchSelectedOpen] = React.useState(false);
    const [isSlipOpen, setIsSlipOpen] = React.useState(false);
    const [isRecapOpen, setIsRecapOpen] = React.useState(false);
    const [selectedCommission, setSelectedCommission] = React.useState<Commission | null>(null);

    // Single Payout Form
    const singlePayoutForm = useForm({
        status_pencairan: 'Paid',
        nomor_referensi: '',
        metode_pembayaran: 'Transfer Bank (BSI)',
        catatan_pencairan: '',
    });

    // Batch Payout Form (Per Agent)
    const batchAgentForm = useForm({
        agen_id: readyAgents.length > 0 ? readyAgents[0].id : '',
        nomor_referensi: '',
        metode_pembayaran: 'Transfer Bank (BSI)',
        catatan_pencairan: '',
    });

    // Batch Payout Form (Selected IDs)
    const batchSelectedForm = useForm({
        commission_ids: [] as number[],
        nomor_referensi: '',
        metode_pembayaran: 'Transfer Bank (BSI)',
        catatan_pencairan: '',
    });

    React.useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }
        if (!isMounted) return;

        router.get(
            route('keagenan.commissions.index'),
            {
                search: debouncedSearch || undefined,
                status: statusFilter === 'ALL' ? undefined : statusFilter,
                agen_id: agenFilter === 'ALL' ? undefined : agenFilter,
                paket_id: paketFilter === 'ALL' ? undefined : paketFilter,
                start_date: dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : undefined,
                end_date: dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : undefined,
                per_page: commissions.per_page,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            }
        );
    }, [debouncedSearch, statusFilter, agenFilter, paketFilter, dateRange]);

    const handleResetFilter = () => {
        setSearchQuery('');
        setStatusFilter('ALL');
        setAgenFilter('ALL');
        setPaketFilter('ALL');
        setDateRange(undefined);
    };

    const isFiltered =
        searchQuery ||
        statusFilter !== 'ALL' ||
        agenFilter !== 'ALL' ||
        paketFilter !== 'ALL' ||
        dateRange !== undefined;

    // Checkbox helper functions
    const readyOnCurrentPage = commissionList.filter((c) => c.status_pencairan === 'Ready_to_Pay');
    const isAllCurrentReadySelected =
        readyOnCurrentPage.length > 0 &&
        readyOnCurrentPage.every((c) => selectedIds.includes(c.id));

    const toggleSelectAll = () => {
        if (isAllCurrentReadySelected) {
            setSelectedIds((prev) => prev.filter((id) => !readyOnCurrentPage.some((c) => c.id === id)));
        } else {
            const newIds = Array.from(new Set([...selectedIds, ...readyOnCurrentPage.map((c) => c.id)]));
            setSelectedIds(newIds);
        }
    };

    const toggleSelectOne = (id: number) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    };

    const selectedCommissionsList = commissionList.filter((c) => selectedIds.includes(c.id));
    const totalSelectedNominal = selectedCommissionsList.reduce((acc, curr) => acc + curr.nominal_komisi, 0);

    const openSinglePayoutModal = (comm: Commission) => {
        setSelectedCommission(comm);
        singlePayoutForm.setData({
            status_pencairan: 'Paid',
            nomor_referensi: `TRX-${Date.now().toString().slice(-6)}`,
            metode_pembayaran: comm.agen?.nama_bank ? `Transfer ${comm.agen.nama_bank}` : 'Transfer Bank (BSI)',
            catatan_pencairan: `Pencairan komisi closing jamaah: ${comm.jamaah?.nama_lengkap}`,
        });
        setIsSinglePayoutOpen(true);
    };

    const handleSinglePayoutSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCommission) return;

        singlePayoutForm.put(route('keagenan.commissions.update', selectedCommission.id), {
            onSuccess: () => {
                setIsSinglePayoutOpen(false);
                setSelectedCommission(null);
            },
        });
    };

    const handleBatchAgentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        batchAgentForm.post(route('keagenan.commissions.batch'), {
            onSuccess: () => {
                setIsBatchAgentOpen(false);
                batchAgentForm.reset();
            },
        });
    };

    const openBatchSelectedModal = () => {
        batchSelectedForm.setData({
            commission_ids: selectedIds,
            nomor_referensi: `BATCH-${Date.now().toString().slice(-6)}`,
            metode_pembayaran: 'Transfer Bank (BSI)',
            catatan_pencairan: `Pencairan massal untuk ${selectedIds.length} item komisi mitra agen`,
        });
        setIsBatchSelectedOpen(true);
    };

    const handleBatchSelectedSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        batchSelectedForm.post(route('keagenan.commissions.batch'), {
            onSuccess: () => {
                setIsBatchSelectedOpen(false);
                setSelectedIds([]);
                batchSelectedForm.reset();
            },
        });
    };

    const openPrintSlip = (comm: Commission) => {
        setSelectedCommission(comm);
        setIsSlipOpen(true);
    };

    const fmt = (amount: number) =>
        new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

    const selectedBatchAgent = readyAgents.find((a) => a.id.toString() === batchAgentForm.data.agen_id.toString());

    return (
        <PageLayout
            title="Komisi & Rekap Agen"
            breadcrumbParent="Keagenan & Komisi"
            breadcrumbPage="Komisi & Rekap Agen"
            contentClass="p-6 md:p-8 flex flex-col gap-6 w-full max-w-none"
        >
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card/60 backdrop-blur-md p-6 rounded-2xl border border-border/80 shadow-xs">
                <div>
                    <div className="flex items-center gap-2.5">
                        <div className="h-8 w-1.5 rounded-full bg-primary" />
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">Komisi &amp; Rekap Agen</h1>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 ml-4">
                        {isAgent
                            ? 'Pantau perolehan komisi penjualan jamaah Anda dan status pencairan dana ke rekening Anda.'
                            : 'Kelola pencairan komisi mitra agen, catat nomor referensi transfer bank, dan cetak slip pembayaran.'}
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                    <button
                        type="button"
                        onClick={() => setIsRecapOpen(true)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-foreground hover:bg-muted/60 transition cursor-pointer shadow-xs"
                    >
                        <FileSpreadsheet className="w-4 h-4 text-primary" />
                        <span>Cetak Rekapitulasi (A4)</span>
                    </button>

                    {!isAgent && readyAgents.length > 0 && (
                        <button
                            type="button"
                            onClick={() => {
                                batchAgentForm.setData({
                                    agen_id: readyAgents[0].id,
                                    nomor_referensi: `BATCH-${Date.now().toString().slice(-6)}`,
                                    metode_pembayaran: 'Transfer Bank (BSI)',
                                    catatan_pencairan: `Pencairan massal komisi agen ${readyAgents[0].name}`,
                                });
                                setIsBatchAgentOpen(true);
                            }}
                            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-xs hover:bg-emerald-700 transition cursor-pointer"
                        >
                            <SendHorizontal className="w-4 h-4" />
                            <span>Cairkan Massal Agen ({readyAgents.length})</span>
                        </button>
                    )}
                    <PerPageSelector value={commissions.per_page} />
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="rounded-2xl border border-border/80 bg-card/70 backdrop-blur-md p-5 shadow-xs flex justify-between items-start">
                    <div>
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                            Total Komisi Cair (Paid)
                        </span>
                        <div className="text-2xl font-extrabold mt-1.5 text-foreground">{fmt(stats.total_paid)}</div>
                    </div>
                    <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-6 h-6" />
                    </div>
                </div>

                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 shadow-xs flex justify-between items-start">
                    <div>
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                            Siap Dicairkan (Ready to Pay)
                        </span>
                        <div className="text-2xl font-extrabold mt-1.5 text-emerald-600 dark:text-emerald-400">
                            {fmt(stats.total_ready)}
                        </div>
                    </div>
                    <div className="p-3 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
                        <Coins className="w-6 h-6" />
                    </div>
                </div>

                <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5 shadow-xs flex justify-between items-start">
                    <div>
                        <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                            Pending DP Jamaah
                        </span>
                        <div className="text-2xl font-extrabold mt-1.5 text-amber-600 dark:text-amber-400">
                            {fmt(stats.total_pending)}
                        </div>
                    </div>
                    <div className="p-3 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                        <Clock className="w-6 h-6" />
                    </div>
                </div>
            </div>

            {/* Comprehensive Filter Toolbar */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-card/70 backdrop-blur-md p-4 rounded-2xl border border-border/80 shadow-xs">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1 flex-wrap">
                    {/* Search Input */}
                    <div className="relative w-full sm:w-64 shrink-0">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <TextInput
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Cari agen, email, jamaah, no ref..."
                            className="pl-9 pr-8 text-xs h-9 w-full"
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={() => setSearchQuery('')}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>

                    {/* DatePicker Range */}
                    <DatePickerWithRange
                        dateRange={dateRange}
                        onChange={(range) => setDateRange(range)}
                        placeholder="Filter rentang tanggal..."
                        className="w-full sm:w-auto"
                    />

                    {/* Filter Mitra Agen */}
                    {!isAgent && agentList.length > 0 && (
                        <select
                            value={agenFilter}
                            onChange={(e) => setAgenFilter(e.target.value)}
                            className="h-9 px-3 text-xs rounded-xl border border-border bg-background text-foreground hover:bg-muted/40 transition cursor-pointer shadow-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                        >
                            <option value="ALL">Semua Mitra Agen</option>
                            {agentList.map((a) => (
                                <option key={a.id} value={a.id}>
                                    {a.name}
                                </option>
                            ))}
                        </select>
                    )}

                    {/* Filter Paket */}
                    {packageList.length > 0 && (
                        <select
                            value={paketFilter}
                            onChange={(e) => setPaketFilter(e.target.value)}
                            className="h-9 px-3 text-xs rounded-xl border border-border bg-background text-foreground hover:bg-muted/40 transition cursor-pointer shadow-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                        >
                            <option value="ALL">Semua Paket Umroh/Haji</option>
                            {packageList.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.nama_paket}
                                </option>
                            ))}
                        </select>
                    )}

                    {/* Reset Button */}
                    {isFiltered && (
                        <button
                            type="button"
                            onClick={handleResetFilter}
                            className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition cursor-pointer shrink-0"
                        >
                            <X className="w-3.5 h-3.5" />
                            <span>Reset Filter</span>
                        </button>
                    )}
                </div>

                {/* Status Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto low-scrollbar pt-2 lg:pt-0">
                    <span className="text-xs text-muted-foreground font-semibold shrink-0 mr-1">Status:</span>
                    {[
                        { id: 'ALL', label: 'Semua' },
                        { id: 'Ready_to_Pay', label: 'Ready to Pay' },
                        { id: 'Pending', label: 'Pending' },
                        { id: 'Paid', label: 'Paid' },
                    ].map((st) => (
                        <button
                            key={st.id}
                            type="button"
                            onClick={() => setStatusFilter(st.id)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer shrink-0 ${statusFilter === st.id
                                    ? 'bg-primary text-primary-foreground shadow-xs'
                                    : 'bg-muted/70 hover:bg-muted text-foreground'
                                }`}
                        >
                            {st.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Floating Selection Banner for Multi-Select Payout */}
            {selectedIds.length > 0 && (
                <div className="bg-emerald-600 text-white p-3.5 rounded-2xl shadow-lg flex items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-xl">
                            <CheckSquare className="w-5 h-5" />
                        </div>
                        <div>
                            <strong className="text-sm">{selectedIds.length} Komisi Terpilih</strong>
                            <div className="text-xs text-emerald-100">
                                Total nominal yang akan dicairkan: <strong>{fmt(totalSelectedNominal)}</strong>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 mr-10">
                        <button
                            type="button"
                            onClick={() => setSelectedIds([])}
                            className="px-3 py-1.5 text-xs text-emerald-100 hover:text-white rounded-lg hover:bg-white/10 transition cursor-pointer"
                        >
                            Batalkan Pilihan
                        </button>
                        <button
                            type="button"
                            onClick={openBatchSelectedModal}
                            className="px-4 py-2 bg-white text-emerald-800 font-bold rounded-xl text-xs hover:bg-emerald-50 transition cursor-pointer shadow-xs flex items-center gap-1.5"
                        >
                            <SendHorizontal className="w-4 h-4 text-emerald-700" />
                            <span>Cairkan ({selectedIds.length}) Sekarang</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Commissions Table */}
            <div className="overflow-hidden rounded-2xl border border-border/80 bg-card/70 backdrop-blur-md shadow-xs">
                <div className="overflow-x-auto low-scrollbar">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-border/80 bg-muted/50 text-xs font-bold text-foreground">
                                {!isAgent && (
                                    <th className="px-4 py-3.5 w-10 text-center">
                                        <button
                                            type="button"
                                            onClick={toggleSelectAll}
                                            className="text-muted-foreground hover:text-foreground cursor-pointer"
                                            title="Pilih semua Ready to Pay di halaman ini"
                                        >
                                            {isAllCurrentReadySelected ? (
                                                <CheckSquare className="w-4 h-4 text-primary" />
                                            ) : (
                                                <Square className="w-4 h-4" />
                                            )}
                                        </button>
                                    </th>
                                )}
                                <th className="px-5 py-3.5">Nama Mitra Agen</th>
                                <th className="px-5 py-3.5">Jamaah &amp; Paket</th>
                                <th className="px-5 py-3.5 text-right">Nominal Komisi</th>
                                <th className="px-5 py-3.5 text-center">Status</th>
                                <th className="px-5 py-3.5">No. Referensi / Tanggal</th>
                                <th className="px-5 py-3.5 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60 text-xs">
                            {commissionList.map((comm) => {
                                const isReady = comm.status_pencairan === 'Ready_to_Pay';
                                const isSelected = selectedIds.includes(comm.id);

                                return (
                                    <tr
                                        key={comm.id}
                                        className={`hover:bg-muted/40 transition-colors ${isSelected ? 'bg-emerald-500/10' : ''
                                            }`}
                                    >
                                        {!isAgent && (
                                            <td className="px-4 py-3.5 text-center">
                                                {isReady ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleSelectOne(comm.id)}
                                                        className="cursor-pointer text-muted-foreground hover:text-foreground"
                                                    >
                                                        {isSelected ? (
                                                            <CheckSquare className="w-4 h-4 text-emerald-600" />
                                                        ) : (
                                                            <Square className="w-4 h-4" />
                                                        )}
                                                    </button>
                                                ) : (
                                                    <span className="text-muted-foreground/30 text-xs">-</span>
                                                )}
                                            </td>
                                        )}
                                        <td className="px-5 py-3.5 font-bold text-foreground">
                                            <div className="flex items-center gap-2.5">
                                                <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
                                                    {comm.agen?.name?.substring(0, 2).toUpperCase() || 'AG'}
                                                </div>
                                                <div>
                                                    <div>{comm.agen?.name || '-'}</div>
                                                    <div className="text-[10px] text-muted-foreground font-normal">
                                                        {comm.agen?.nama_bank ? `${comm.agen.nama_bank} • ` : ''}
                                                        {comm.agen?.nomor_rekening || comm.agen?.email || '-'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <div className="font-bold text-foreground">{comm.jamaah?.nama_lengkap || '-'}</div>
                                            <div className="text-[11px] text-muted-foreground">{comm.jamaah?.paket?.nama_paket || '-'}</div>
                                        </td>
                                        <td className="px-5 py-3.5 text-right font-extrabold text-primary text-sm">
                                            {fmt(comm.nominal_komisi)}
                                        </td>
                                        <td className="px-5 py-3.5 text-center">
                                            <span
                                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold border ${comm.status_pencairan === 'Paid'
                                                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                                                        : comm.status_pencairan === 'Ready_to_Pay'
                                                            ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20'
                                                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                                                    }`}
                                            >
                                                {comm.status_pencairan === 'Paid'
                                                    ? 'Sudah Cair'
                                                    : comm.status_pencairan === 'Ready_to_Pay'
                                                        ? 'Siap Dicairkan'
                                                        : 'Menunggu DP'}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5 text-muted-foreground">
                                            {comm.nomor_referensi ? (
                                                <div className="font-mono font-bold text-foreground text-[11px]">
                                                    {comm.nomor_referensi}
                                                </div>
                                            ) : null}
                                            <div className="text-[10px]">
                                                {comm.tanggal_pencairan
                                                    ? `Cair: ${new Date(comm.tanggal_pencairan).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}`
                                                    : `Daftar: ${new Date(comm.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}`}
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5 text-center">
                                            <div className="flex items-center justify-center gap-1.5 flex-wrap">
                                                {comm.status_pencairan === 'Ready_to_Pay' && !isAgent && (
                                                    <button
                                                        type="button"
                                                        onClick={() => openSinglePayoutModal(comm)}
                                                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-[11px] hover:bg-emerald-700 transition cursor-pointer shadow-xs"
                                                    >
                                                        <SendHorizontal className="w-3.5 h-3.5" />
                                                        <span>Cairkan</span>
                                                    </button>
                                                )}
                                                {comm.status_pencairan === 'Paid' && (
                                                    <button
                                                        type="button"
                                                        onClick={() => openPrintSlip(comm)}
                                                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-card text-foreground font-semibold text-[11px] hover:bg-muted transition cursor-pointer border border-border shadow-xs"
                                                        title="Lihat & Cetak Voucher Slip Resmi"
                                                    >
                                                        <Receipt className="w-3.5 h-3.5 text-primary" />
                                                        <span>Slip Voucher</span>
                                                    </button>
                                                )}
                                                {comm.status_pencairan === 'Pending' && (
                                                    <span className="text-[11px] text-muted-foreground italic">Menunggu DP</span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {commissionList.length === 0 && (
                                <tr>
                                    <td colSpan={isAgent ? 6 : 7} className="py-12 text-center text-muted-foreground italic">
                                        Belum ada data komisi agen yang sesuai kriteria pencarian / filter.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="border-t border-border/80 px-4 bg-muted/20">
                    <DataTablePagination
                        links={commissions.links}
                        from={commissions.from}
                        to={commissions.to}
                        total={commissions.total}
                        currentPage={commissions.current_page}
                        lastPage={commissions.last_page}
                    />
                </div>
            </div>

            {/* MODAL: CAIRKAN KOMISI TUNGGAL */}
            <Dialog open={isSinglePayoutOpen} onOpenChange={(open) => { setIsSinglePayoutOpen(open); if (!open) setSelectedCommission(null); }}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-foreground font-bold">
                            <Coins className="w-5 h-5 text-emerald-500" />
                            <span>Konfirmasi Pencairan Komisi</span>
                        </DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground mt-1">
                            Catat detail referensi transfer bank untuk komisi agen berikut:
                        </DialogDescription>
                    </DialogHeader>

                    {selectedCommission && (
                        <div className="bg-muted/40 rounded-xl p-3 border border-border/60 text-xs flex flex-col gap-1.5 my-1">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Mitra Agen:</span>
                                <strong className="text-foreground">{selectedCommission.agen?.name}</strong>
                            </div>
                            {selectedCommission.agen?.nomor_rekening && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Rekening:</span>
                                    <span className="text-foreground font-mono">
                                        {selectedCommission.agen?.nama_bank} {selectedCommission.agen?.nomor_rekening}
                                    </span>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Jamaah Closing:</span>
                                <span className="text-foreground">{selectedCommission.jamaah?.nama_lengkap}</span>
                            </div>
                            <div className="flex justify-between pt-1 border-t border-border/40">
                                <span className="text-muted-foreground font-bold">Nominal Cair:</span>
                                <span className="text-emerald-600 dark:text-emerald-400 font-extrabold text-sm">
                                    {fmt(selectedCommission.nominal_komisi)}
                                </span>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSinglePayoutSubmit} className="flex flex-col gap-3.5 mt-2">
                        <div>
                            <InputLabel htmlFor="single-ref" value="Nomor Referensi Bank / Mutasi" />
                            <TextInput
                                id="single-ref"
                                type="text"
                                value={singlePayoutForm.data.nomor_referensi}
                                onChange={(e) => singlePayoutForm.setData('nomor_referensi', e.target.value)}
                                placeholder="Contoh: BSI-TRX-998812"
                                className="mt-1 block w-full text-xs"
                                required
                            />
                            <InputError message={singlePayoutForm.errors.nomor_referensi} className="mt-1" />
                        </div>

                        <div>
                            <InputLabel htmlFor="single-method" value="Metode Pembayaran" />
                            <TextInput
                                id="single-method"
                                type="text"
                                value={singlePayoutForm.data.metode_pembayaran}
                                onChange={(e) => singlePayoutForm.setData('metode_pembayaran', e.target.value)}
                                className="mt-1 block w-full text-xs"
                                required
                            />
                            <InputError message={singlePayoutForm.errors.metode_pembayaran} className="mt-1" />
                        </div>

                        <div>
                            <InputLabel htmlFor="single-note" value="Catatan Transfer (Opsional)" />
                            <TextInput
                                id="single-note"
                                type="text"
                                value={singlePayoutForm.data.catatan_pencairan}
                                onChange={(e) => singlePayoutForm.setData('catatan_pencairan', e.target.value)}
                                className="mt-1 block w-full text-xs"
                            />
                        </div>

                        <DialogFooter className="mt-4 flex gap-2 justify-end">
                            <button
                                type="button"
                                onClick={() => setIsSinglePayoutOpen(false)}
                                className="px-4 py-2 border border-border rounded-xl text-xs font-semibold hover:bg-muted transition cursor-pointer"
                            >
                                Batal
                            </button>
                            <PrimaryButton disabled={singlePayoutForm.processing}>
                                {singlePayoutForm.processing ? 'Memproses...' : 'Konfirmasi Cairkan'}
                            </PrimaryButton>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* MODAL: BATCH PENCAIRAN VIA CHECKBOX TERPILIH */}
            <Dialog open={isBatchSelectedOpen} onOpenChange={setIsBatchSelectedOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-foreground font-bold">
                            <SendHorizontal className="w-5 h-5 text-emerald-500" />
                            <span>Pencairan Komisi Terpilih ({selectedIds.length} Item)</span>
                        </DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground mt-1">
                            Mencairkan seluruh komisi yang Anda centang sekaligus dalam 1 kali pencatatan mutasi.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3.5 flex items-center justify-between my-2">
                        <div>
                            <div className="text-xs text-emerald-700 dark:text-emerald-300 font-bold">
                                Total Akumulasi Pencairan:
                            </div>
                            <div className="text-[11px] text-muted-foreground mt-0.5">
                                Dari {selectedIds.length} transaksi jamaah closing
                            </div>
                        </div>
                        <div className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
                            {fmt(totalSelectedNominal)}
                        </div>
                    </div>

                    <form onSubmit={handleBatchSelectedSubmit} className="flex flex-col gap-3.5">
                        <div>
                            <InputLabel htmlFor="batch-sel-ref" value="Nomor Referensi Bank / Mutasi" />
                            <TextInput
                                id="batch-sel-ref"
                                type="text"
                                value={batchSelectedForm.data.nomor_referensi}
                                onChange={(e) => batchSelectedForm.setData('nomor_referensi', e.target.value)}
                                placeholder="Contoh: BATCH-BSI-99881"
                                className="mt-1 block w-full text-xs"
                                required
                            />
                        </div>

                        <div>
                            <InputLabel htmlFor="batch-sel-method" value="Metode Pembayaran" />
                            <TextInput
                                id="batch-sel-method"
                                type="text"
                                value={batchSelectedForm.data.metode_pembayaran}
                                onChange={(e) => batchSelectedForm.setData('metode_pembayaran', e.target.value)}
                                className="mt-1 block w-full text-xs"
                                required
                            />
                        </div>

                        <div>
                            <InputLabel htmlFor="batch-sel-note" value="Catatan Pencairan" />
                            <TextInput
                                id="batch-sel-note"
                                type="text"
                                value={batchSelectedForm.data.catatan_pencairan}
                                onChange={(e) => batchSelectedForm.setData('catatan_pencairan', e.target.value)}
                                className="mt-1 block w-full text-xs"
                            />
                        </div>

                        <DialogFooter className="mt-4 flex gap-2 justify-end">
                            <button
                                type="button"
                                onClick={() => setIsBatchSelectedOpen(false)}
                                className="px-4 py-2 border border-border rounded-xl text-xs font-semibold hover:bg-muted transition cursor-pointer"
                            >
                                Batal
                            </button>
                            <PrimaryButton disabled={batchSelectedForm.processing}>
                                {batchSelectedForm.processing ? 'Memproses...' : 'Cairkan Semua Sekarang'}
                            </PrimaryButton>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* MODAL: BATCH / PENCAIRAN MASSAL PER AGEN */}
            <Dialog open={isBatchAgentOpen} onOpenChange={setIsBatchAgentOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-foreground font-bold">
                            <SendHorizontal className="w-5 h-5 text-emerald-500" />
                            <span>Pencairan Komisi Massal per Agen</span>
                        </DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground mt-1">
                            Mencairkan seluruh komisi status <em>Ready to Pay</em> milik agen dalam 1 kali transfer.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleBatchAgentSubmit} className="flex flex-col gap-4 mt-2">
                        <div>
                            <InputLabel htmlFor="batch-agent" value="Pilih Mitra Agen Penerima" />
                            <select
                                id="batch-agent"
                                value={batchAgentForm.data.agen_id}
                                onChange={(e) => {
                                    const agId = e.target.value;
                                    batchAgentForm.setData('agen_id', agId);
                                    const targetAg = readyAgents.find((a) => a.id.toString() === agId);
                                    if (targetAg) {
                                        batchAgentForm.setData((prev) => ({
                                            ...prev,
                                            agen_id: agId,
                                            catatan_pencairan: `Pencairan massal komisi agen ${targetAg.name} (${targetAg.ready_count} jamaah)`,
                                        }));
                                    }
                                }}
                                className="w-full mt-1 bg-background border border-border rounded-xl px-3 py-2 text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                            >
                                {readyAgents.map((a) => (
                                    <option key={a.id} value={a.id}>
                                        {a.name} — {a.ready_count} Closing Ready ({fmt(a.ready_nominal)})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {selectedBatchAgent && (
                            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3.5 flex items-center justify-between">
                                <div>
                                    <div className="text-xs text-emerald-700 dark:text-emerald-300 font-bold">
                                        Total Akumulasi Siap Cair:
                                    </div>
                                    <div className="text-[11px] text-muted-foreground mt-0.5">
                                        Dari {selectedBatchAgent.ready_count} item pendaftaran jamaah closing
                                    </div>
                                    {selectedBatchAgent.nomor_rekening && (
                                        <div className="text-[11px] font-mono text-emerald-800 dark:text-emerald-300 mt-1">
                                            {selectedBatchAgent.nama_bank} • {selectedBatchAgent.nomor_rekening}
                                        </div>
                                    )}
                                </div>
                                <div className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
                                    {fmt(selectedBatchAgent.ready_nominal)}
                                </div>
                            </div>
                        )}

                        <div>
                            <InputLabel htmlFor="batch-ref" value="Nomor Referensi Bank / Mutasi Transfer" />
                            <TextInput
                                id="batch-ref"
                                type="text"
                                value={batchAgentForm.data.nomor_referensi}
                                onChange={(e) => batchAgentForm.setData('nomor_referensi', e.target.value)}
                                placeholder="Contoh: BATCH-BSI-88991"
                                className="mt-1 block w-full text-xs"
                                required
                            />
                        </div>

                        <div>
                            <InputLabel htmlFor="batch-note" value="Catatan Pencairan" />
                            <TextInput
                                id="batch-note"
                                type="text"
                                value={batchAgentForm.data.catatan_pencairan}
                                onChange={(e) => batchAgentForm.setData('catatan_pencairan', e.target.value)}
                                className="mt-1 block w-full text-xs"
                            />
                        </div>

                        <DialogFooter className="mt-4 flex gap-2 justify-end">
                            <button
                                type="button"
                                onClick={() => setIsBatchAgentOpen(false)}
                                className="px-4 py-2 border border-border rounded-xl text-xs font-semibold hover:bg-muted transition cursor-pointer"
                            >
                                Batal
                            </button>
                            <PrimaryButton disabled={batchAgentForm.processing}>
                                {batchAgentForm.processing ? 'Memproses Transfer...' : 'Cairkan Seluruhnya Sekarang'}
                            </PrimaryButton>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* MODAL: CETAK SLIP RESMI VOUCHER PENCAIRAN KOMISI */}
            <CommissionSlipModal
                open={isSlipOpen}
                onOpenChange={setIsSlipOpen}
                commission={selectedCommission}
                tenantName={tenantName}
            />

            {/* MODAL: CETAK REKAPITULASI LAPORAN KOMISI MITRA AGEN A4 */}
            <CommissionRecapPrintModal
                open={isRecapOpen}
                onOpenChange={setIsRecapOpen}
                commissions={allCommissions.length > 0 ? allCommissions : commissionList}
                stats={stats}
                tenantName={tenantName}
            />
        </PageLayout>
    );
}
