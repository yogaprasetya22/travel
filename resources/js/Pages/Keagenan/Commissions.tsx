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
    Building2,
    Calendar,
    ArrowUpRight,
    User,
} from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';
import { useMounted } from '@/hooks/use-mounted';

interface Commission {
    id: number;
    nominal_komisi: number;
    status_pencairan: 'Pending' | 'Ready_to_Pay' | 'Paid';
    nomor_referensi?: string | null;
    metode_pembayaran?: string | null;
    catatan_pencairan?: string | null;
    tanggal_pencairan?: string | null;
    created_at: string;
    agen: { name: string; email: string };
    jamaah: {
        nama_lengkap: string;
        paket?: { nama_paket: string; harga: number };
    };
}

interface ReadyAgent {
    id: number;
    name: string;
    email: string;
    ready_nominal: number;
    ready_count: number;
}

interface Props {
    commissions: PaginatedData<Commission>;
    stats: {
        total_paid: number;
        total_ready: number;
        total_pending: number;
    };
    readyAgents?: ReadyAgent[];
    filters?: {
        search?: string;
        status?: string;
        per_page?: number;
    };
    isAgent?: boolean;
}

export default function Commissions({
    commissions,
    stats,
    readyAgents = [],
    filters,
    isAgent = false,
}: Props) {
    const commissionList = commissions.data || [];
    const isMounted = useMounted();
    const [searchQuery, setSearchQuery] = React.useState(filters?.search || '');
    const [statusFilter, setStatusFilter] = React.useState(filters?.status || 'ALL');
    const debouncedSearch = useDebounce(searchQuery, 350);
    const isInitialMount = React.useRef(true);

    // Modals state
    const [isSinglePayoutOpen, setIsSinglePayoutOpen] = React.useState(false);
    const [isBatchPayoutOpen, setIsBatchPayoutOpen] = React.useState(false);
    const [isSlipOpen, setIsSlipOpen] = React.useState(false);
    const [selectedCommission, setSelectedCommission] = React.useState<Commission | null>(null);

    // Single Payout Form
    const singlePayoutForm = useForm({
        status_pencairan: 'Paid',
        nomor_referensi: '',
        metode_pembayaran: 'Transfer Bank (BSI)',
        catatan_pencairan: '',
    });

    // Batch Payout Form
    const batchPayoutForm = useForm({
        agen_id: readyAgents.length > 0 ? readyAgents[0].id : '',
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
                per_page: commissions.per_page,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            }
        );
    }, [debouncedSearch, statusFilter]);

    const openSinglePayoutModal = (comm: Commission) => {
        setSelectedCommission(comm);
        singlePayoutForm.setData({
            status_pencairan: 'Paid',
            nomor_referensi: `TRX-${Date.now().toString().slice(-6)}`,
            metode_pembayaran: 'Transfer Bank (BSI)',
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

    const handleBatchPayoutSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        batchPayoutForm.post(route('keagenan.commissions.batch'), {
            onSuccess: () => {
                setIsBatchPayoutOpen(false);
                batchPayoutForm.reset();
            },
        });
    };

    const openPrintSlip = (comm: Commission) => {
        setSelectedCommission(comm);
        setIsSlipOpen(true);
    };

    const handlePrintWindow = () => {
        window.print();
    };

    const fmt = (amount: number) =>
        new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

    const selectedBatchAgent = readyAgents.find((a) => a.id.toString() === batchPayoutForm.data.agen_id.toString());

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
                <div className="flex items-center gap-3 shrink-0">
                    {!isAgent && readyAgents.length > 0 && (
                        <button
                            type="button"
                            onClick={() => {
                                batchPayoutForm.setData({
                                    agen_id: readyAgents[0].id,
                                    nomor_referensi: `BATCH-${Date.now().toString().slice(-6)}`,
                                    metode_pembayaran: 'Transfer Bank (BSI)',
                                    catatan_pencairan: `Pencairan massal komisi agen ${readyAgents[0].name}`,
                                });
                                setIsBatchPayoutOpen(true);
                            }}
                            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition cursor-pointer"
                        >
                            <SendHorizontal className="w-4 h-4" />
                            <span>Cairkan Massal ({readyAgents.length} Agen Ready)</span>
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

            {/* Search & Filter Toolbar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card/70 backdrop-blur-md p-4 rounded-2xl border border-border/80 shadow-xs">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Cari nama agen, email, jamaah, atau no referensi..."
                        className="w-full pl-10 pr-9 py-2 text-xs bg-background text-foreground rounded-xl border border-border/80 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
                    />
                    {searchQuery && (
                        <button
                            type="button"
                            onClick={() => setSearchQuery('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 p-1 bg-muted/60 rounded-xl border border-border/60">
                        <button
                            type="button"
                            onClick={() => setStatusFilter('ALL')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                                statusFilter === 'ALL'
                                    ? 'bg-card text-foreground shadow-xs'
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            Semua Status
                        </button>
                        <button
                            type="button"
                            onClick={() => setStatusFilter('Ready_to_Pay')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                                statusFilter === 'Ready_to_Pay'
                                    ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 shadow-xs'
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            Ready to Pay
                        </button>
                        <button
                            type="button"
                            onClick={() => setStatusFilter('Pending')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                                statusFilter === 'Pending'
                                    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shadow-xs'
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            Pending
                        </button>
                        <button
                            type="button"
                            onClick={() => setStatusFilter('Paid')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                                statusFilter === 'Paid'
                                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-xs'
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            Paid
                        </button>
                    </div>
                </div>
            </div>

            {/* Commissions Table */}
            <div className="overflow-hidden rounded-2xl border border-border/80 bg-card/70 backdrop-blur-md shadow-xs">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-border/80 bg-muted/50 text-xs font-bold text-foreground">
                                <th className="px-6 py-4">Nama Agen</th>
                                <th className="px-6 py-4">Jamaah &amp; Paket</th>
                                <th className="px-6 py-4 text-right">Nominal Komisi</th>
                                <th className="px-6 py-4 text-center">Status</th>
                                <th className="px-6 py-4">No. Referensi / Tanggal</th>
                                <th className="px-6 py-4 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60 text-xs">
                            {commissionList.map((comm) => (
                                <tr key={comm.id} className="hover:bg-muted/40 transition-colors">
                                    <td className="px-6 py-4 font-bold text-foreground">
                                        <div className="flex items-center gap-2.5">
                                            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs">
                                                {comm.agen?.name?.substring(0, 2).toUpperCase() || 'AG'}
                                            </div>
                                            <div>
                                                <div>{comm.agen?.name || '-'}</div>
                                                <div className="text-[10px] text-muted-foreground font-normal">{comm.agen?.email || '-'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-foreground">{comm.jamaah?.nama_lengkap || '-'}</div>
                                        <div className="text-[11px] text-muted-foreground">{comm.jamaah?.paket?.nama_paket || '-'}</div>
                                    </td>
                                    <td className="px-6 py-4 text-right font-extrabold text-primary text-sm">
                                        {fmt(comm.nominal_komisi)}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold border ${
                                            comm.status_pencairan === 'Paid'
                                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                                                : comm.status_pencairan === 'Ready_to_Pay'
                                                ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20'
                                                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                                        }`}>
                                            {comm.status_pencairan === 'Paid'
                                                ? 'Sudah Cair'
                                                : comm.status_pencairan === 'Ready_to_Pay'
                                                ? 'Siap Dicairkan'
                                                : 'Menunggu DP'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-muted-foreground">
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
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex items-center justify-center gap-1.5">
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
                                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-muted text-foreground font-semibold text-[11px] hover:bg-muted/80 transition cursor-pointer border border-border"
                                                    title="Lihat & Cetak Slip Komisi"
                                                >
                                                    <Printer className="w-3.5 h-3.5 text-primary" />
                                                    <span>Slip</span>
                                                </button>
                                            )}
                                            {comm.status_pencairan === 'Pending' && (
                                                <span className="text-[11px] text-muted-foreground italic">Menunggu DP</span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {commissionList.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="py-12 text-center text-muted-foreground italic">
                                        Belum ada data komisi agen yang sesuai.
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
                                className="mt-1 block w-full"
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
                                className="mt-1 block w-full"
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
                                className="mt-1 block w-full"
                            />
                        </div>

                        <DialogFooter className="mt-4 flex gap-2 justify-end">
                            <button
                                type="button"
                                onClick={() => setIsSinglePayoutOpen(false)}
                                className="px-4 py-2 border border-border rounded-xl text-xs font-semibold hover:bg-muted transition"
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

            {/* MODAL: BATCH / PENCAIRAN MASSAL PER AGEN */}
            <Dialog open={isBatchPayoutOpen} onOpenChange={setIsBatchPayoutOpen}>
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

                    <form onSubmit={handleBatchPayoutSubmit} className="flex flex-col gap-4 mt-2">
                        <div>
                            <InputLabel htmlFor="batch-agent" value="Pilih Mitra Agen Penerima" />
                            <select
                                id="batch-agent"
                                value={batchPayoutForm.data.agen_id}
                                onChange={(e) => {
                                    const agId = e.target.value;
                                    batchPayoutForm.setData('agen_id', agId);
                                    const targetAg = readyAgents.find((a) => a.id.toString() === agId);
                                    if (targetAg) {
                                        batchPayoutForm.setData((prev) => ({
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
                                value={batchPayoutForm.data.nomor_referensi}
                                onChange={(e) => batchPayoutForm.setData('nomor_referensi', e.target.value)}
                                placeholder="Contoh: BATCH-BSI-88991"
                                className="mt-1 block w-full"
                                required
                            />
                        </div>

                        <div>
                            <InputLabel htmlFor="batch-note" value="Catatan Pencairan" />
                            <TextInput
                                id="batch-note"
                                type="text"
                                value={batchPayoutForm.data.catatan_pencairan}
                                onChange={(e) => batchPayoutForm.setData('catatan_pencairan', e.target.value)}
                                className="mt-1 block w-full"
                            />
                        </div>

                        <DialogFooter className="mt-4 flex gap-2 justify-end">
                            <button
                                type="button"
                                onClick={() => setIsBatchPayoutOpen(false)}
                                className="px-4 py-2 border border-border rounded-xl text-xs font-semibold hover:bg-muted transition"
                            >
                                Batal
                            </button>
                            <PrimaryButton disabled={batchPayoutForm.processing}>
                                {batchPayoutForm.processing ? 'Memproses Transfer...' : 'Cairkan Seluruhnya Sekarang'}
                            </PrimaryButton>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* MODAL: CETAK SLIP RESMI REKAP KOMISI (PRINT FRIENDLY) */}
            <Dialog open={isSlipOpen} onOpenChange={setIsSlipOpen}>
                <DialogContent className="sm:max-w-xl md:max-w-2xl p-0 overflow-hidden rounded-2xl shadow-2xl">
                    <div id="printable-slip" className="p-7 flex flex-col gap-5 bg-card text-foreground">
                        {/* Kop Slip */}
                        <div className="flex items-center justify-between pb-4 border-b border-border">
                            <div className="flex items-center gap-2.5">
                                <div className="p-2 rounded-xl bg-primary/10 text-primary font-bold">
                                    <Receipt className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-extrabold text-sm text-foreground">SLIP BUKTI PENCAIRAN KOMISI</h3>
                                    <p className="text-[10px] text-muted-foreground font-mono">
                                        No. Ref: {selectedCommission?.nomor_referensi || `TRX-${selectedCommission?.id}`}
                                    </p>
                                </div>
                            </div>
                            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                LUNAS / PAID
                            </span>
                        </div>

                        {/* Rincian Penerima */}
                        <div className="grid grid-cols-2 gap-3 text-xs">
                            <div className="bg-muted/40 p-3 rounded-xl border border-border/60">
                                <span className="text-[10px] text-muted-foreground uppercase font-bold">Penerima Komisi</span>
                                <div className="font-bold text-foreground mt-1">{selectedCommission?.agen?.name}</div>
                                <div className="text-[10px] text-muted-foreground">{selectedCommission?.agen?.email}</div>
                            </div>

                            <div className="bg-muted/40 p-3 rounded-xl border border-border/60">
                                <span className="text-[10px] text-muted-foreground uppercase font-bold">Metode Pembayaran</span>
                                <div className="font-bold text-foreground mt-1">{selectedCommission?.metode_pembayaran || 'Transfer Bank'}</div>
                                <div className="text-[10px] text-muted-foreground">
                                    {selectedCommission?.tanggal_pencairan
                                        ? new Date(selectedCommission.tanggal_pencairan).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
                                        : '-'}
                                </div>
                            </div>
                        </div>

                        {/* Rincian Transaksi Jamaah */}
                        <div className="border border-border/80 rounded-xl overflow-hidden text-xs">
                            <div className="bg-muted/60 p-2.5 font-bold border-b border-border/60">
                                Rincian Transaksi Pendaftaran
                            </div>
                            <div className="p-3 flex justify-between items-center border-b border-border/40">
                                <div>
                                    <div className="font-semibold text-foreground">{selectedCommission?.jamaah?.nama_lengkap}</div>
                                    <div className="text-[10px] text-muted-foreground">{selectedCommission?.jamaah?.paket?.nama_paket}</div>
                                </div>
                                <span className="font-extrabold text-foreground">
                                    {fmt(selectedCommission?.nominal_komisi || 0)}
                                </span>
                            </div>
                            <div className="p-3 bg-muted/20 flex justify-between items-center font-bold">
                                <span>TOTAL KOMISI DITRANSFER</span>
                                <span className="text-emerald-600 dark:text-emerald-400 text-sm font-extrabold">
                                    {fmt(selectedCommission?.nominal_komisi || 0)}
                                </span>
                            </div>
                        </div>

                        {selectedCommission?.catatan_pencairan && (
                            <div className="text-[11px] text-muted-foreground italic bg-muted/20 p-2.5 rounded-lg border border-border/40">
                                Catatan: {selectedCommission.catatan_pencairan}
                            </div>
                        )}
                    </div>

                    <DialogFooter className="p-4 bg-muted/40 border-t border-border flex justify-between items-center">
                        <button
                            type="button"
                            onClick={() => setIsSlipOpen(false)}
                            className="px-4 py-2 border border-border rounded-xl text-xs font-semibold hover:bg-background transition"
                        >
                            Tutup
                        </button>
                        <button
                            type="button"
                            onClick={handlePrintWindow}
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground font-bold rounded-xl text-xs hover:opacity-90 transition cursor-pointer"
                        >
                            <Printer className="w-4 h-4" />
                            <span>Cetak Slip Sekarang</span>
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </PageLayout>
    );
}
