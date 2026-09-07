import { router } from '@inertiajs/react';
import React, { useState, useRef, useEffect } from 'react';
import { Pembayaran, PageProps } from '@/Types';
import PageLayout from '@/Components/Layouts/PageLayout';
import DataTablePagination, { PaginatedData } from '@/Components/DataTablePagination';
import PerPageSelector from '@/Components/PerPageSelector';
import { PaymentInvoiceModal, InvoicePaymentData } from '@/Components/PaymentInvoiceModal';
import { DatePickerWithRange } from '@/Components/DatePickerWithRange';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { toRupiah } from '@/Components/CurrencyInput';
import { useDebounce } from '@/hooks/use-debounce';
import { useMounted } from '@/hooks/use-mounted';
import {
    Receipt,
    Eye,
    CheckCircle2,
    XCircle,
    Search,
    Filter,
    Calendar,
    Wallet,
    Clock,
    AlertCircle,
    Building2,
    RotateCcw,
    Layers,
    CreditCard,
    Package,
} from 'lucide-react';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from '@/Components/ui/sheet';

type PaymentItem = Pembayaran & {
    jamaah: {
        nama_lengkap: string;
        nik?: string | null;
        no_hp?: string;
        email?: string | null;
        alamat_ktp?: string | null;
        paket: { nama_paket: string; harga: number };
    };
    rekening_tenant: {
        nama_bank: string;
        nomor_rekening: string;
        atas_nama: string;
    };
    verified_by_user?: { name: string } | null;
};

interface VerifyPaymentProps extends PageProps {
    payments: PaginatedData<PaymentItem>;
    banks?: Array<{
        id: number;
        nama_bank: string;
        nomor_rekening: string;
        atas_nama: string;
    }>;
    packages?: Array<{
        id: number;
        nama_paket: string;
        harga: number;
    }>;
    stats?: {
        total_verified_nominal: number;
        total_pending_nominal: number;
        pending_count: number;
        verified_count: number;
        rejected_count: number;
        total_count: number;
    };
    filters?: {
        search: string;
        status: string;
        rekening_id: string;
        tipe_pembayaran: string;
        paket_id: string;
        start_date: string;
        end_date: string;
        per_page: number;
    };
}

export default function VerifyPayment({
    payments,
    banks = [],
    packages = [],
    stats = {
        total_verified_nominal: 0,
        total_pending_nominal: 0,
        pending_count: 0,
        verified_count: 0,
        rejected_count: 0,
        total_count: 0,
    },
    filters = {
        search: '',
        status: 'all',
        rekening_id: 'all',
        tipe_pembayaran: 'all',
        paket_id: 'all',
        start_date: '',
        end_date: '',
        per_page: 15,
    },
}: VerifyPaymentProps) {
    const isMounted = useMounted();
    const [selectedSlip, setSelectedSlip] = useState<string | null>(null);
    const [selectedInvoice, setSelectedInvoice] = useState<PaymentItem | null>(null);

    // Filter states
    const [searchQuery, setSearchQuery] = useState(filters?.search || '');
    const [statusFilter, setStatusFilter] = useState(filters?.status || 'all');
    const [rekeningFilter, setRekeningFilter] = useState(filters?.rekening_id || 'all');
    const [tipeFilter, setTipeFilter] = useState(filters?.tipe_pembayaran || 'all');
    const [paketFilter, setPaketFilter] = useState(filters?.paket_id || 'all');
    const [startDate, setStartDate] = useState(filters?.start_date || '');
    const [endDate, setEndDate] = useState(filters?.end_date || '');

    const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
        if (filters?.start_date) {
            return {
                from: new Date(filters.start_date),
                to: filters.end_date ? new Date(filters.end_date) : undefined,
            };
        }
        return undefined;
    });

    const debouncedSearchQuery = useDebounce(searchQuery, 350);
    const isInitialMount = useRef(true);

    const handleDateRangeChange = (range: DateRange | undefined) => {
        setDateRange(range);
        const startStr = range?.from ? format(range.from, 'yyyy-MM-dd') : '';
        const endStr = range?.to
            ? format(range.to, 'yyyy-MM-dd')
            : range?.from
            ? format(range.from, 'yyyy-MM-dd')
            : '';
        setStartDate(startStr);
        setEndDate(endStr);
    };

    const handleResetFilters = () => {
        setSearchQuery('');
        setStatusFilter('all');
        setRekeningFilter('all');
        setTipeFilter('all');
        setPaketFilter('all');
        setStartDate('');
        setEndDate('');
        setDateRange(undefined);
        router.get(
            route('payment.index'),
            {},
            { preserveState: true, preserveScroll: true, replace: true }
        );
    };

    // Trigger router update when filter states change
    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        const params: Record<string, any> = {};
        if (debouncedSearchQuery) params.search = debouncedSearchQuery;
        if (statusFilter && statusFilter !== 'all') params.status = statusFilter;
        if (rekeningFilter && rekeningFilter !== 'all') params.rekening_id = rekeningFilter;
        if (tipeFilter && tipeFilter !== 'all') params.tipe_pembayaran = tipeFilter;
        if (paketFilter && paketFilter !== 'all') params.paket_id = paketFilter;
        if (startDate) params.start_date = startDate;
        if (endDate) params.end_date = endDate;
        if (payments.per_page) params.per_page = payments.per_page;

        router.get(route('payment.index'), params, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    }, [
        debouncedSearchQuery,
        statusFilter,
        rekeningFilter,
        tipeFilter,
        paketFilter,
        startDate,
        endDate,
    ]);

    const handleVerify = (paymentId: number, verifyStatus: 'Verified' | 'Rejected') => {
        router.post(route('payment.verify', { pembayaran: paymentId }), { status: verifyStatus });
    };

    const hasActiveFilters =
        Boolean(searchQuery) ||
        statusFilter !== 'all' ||
        rekeningFilter !== 'all' ||
        tipeFilter !== 'all' ||
        paketFilter !== 'all' ||
        Boolean(startDate) ||
        Boolean(endDate);

    const paymentList = payments.data || [];

    if (!isMounted) return null;

    return (
        <PageLayout
            title="Verifikasi Pembayaran"
            breadcrumbParent="Keuangan"
            breadcrumbPage="Verifikasi Pembayaran"
            contentClass="p-6 md:p-8 flex flex-col gap-6 w-full max-w-none"
        >
            {/* 1. Header Section */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-card/60 backdrop-blur-md p-6 rounded-2xl border border-border/80 shadow-xs">
                <div>
                    <div className="flex items-center gap-2.5">
                        <div className="h-8 w-1.5 rounded-full bg-primary" />
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                            Verifikasi Pembayaran &amp; Rekonsiliasi Kas
                        </h1>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 ml-4">
                        Validasi bukti transfer jamaah, pantau dana masuk terverifikasi, dan terbitkan kuitansi resmi digital.
                    </p>
                </div>
            </div>

            {/* 2. Financial Summary KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Card 1: Total Dana Terverifikasi */}
                <div className="bg-card/70 backdrop-blur-md border border-border/80 rounded-2xl p-5 shadow-xs flex items-center justify-between">
                    <div className="space-y-1">
                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                            <Wallet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            Total Dana Masuk Sah
                        </span>
                        <div className="text-xl sm:text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                            {toRupiah(stats.total_verified_nominal)}
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                            {stats.verified_count} transaksi terverifikasi
                        </p>
                    </div>
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-2xl shrink-0">
                        <CheckCircle2 className="w-6 h-6" />
                    </div>
                </div>

                {/* Card 2: Dana Menunggu Verifikasi */}
                <div className="bg-card/70 backdrop-blur-md border border-border/80 rounded-2xl p-5 shadow-xs flex items-center justify-between">
                    <div className="space-y-1">
                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                            Dana Menunggu Verifikasi
                        </span>
                        <div className="text-xl sm:text-2xl font-black font-mono text-amber-600 dark:text-amber-400">
                            {toRupiah(stats.total_pending_nominal)}
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                            {stats.pending_count} pembayaran menunggu approval
                        </p>
                    </div>
                    <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 rounded-2xl shrink-0">
                        <AlertCircle className="w-6 h-6" />
                    </div>
                </div>

                {/* Card 3: Total Transaksi */}
                <div className="bg-card/70 backdrop-blur-md border border-border/80 rounded-2xl p-5 shadow-xs flex items-center justify-between sm:col-span-2 lg:col-span-1">
                    <div className="space-y-1">
                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                            <Receipt className="w-4 h-4 text-primary" />
                            Total Mutasi Transaksi
                        </span>
                        <div className="text-xl sm:text-2xl font-black font-mono text-foreground">
                            {stats.total_count} Transaksi
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                            {stats.rejected_count} transaksi ditolak
                        </p>
                    </div>
                    <div className="p-3 bg-primary/10 border border-primary/20 text-primary rounded-2xl shrink-0">
                        <Receipt className="w-6 h-6" />
                    </div>
                </div>
            </div>

            {/* 3. Comprehensive Multi-Criteria Filter Toolbar */}
            <div className="flex flex-col gap-3.5 bg-card/70 backdrop-blur-md p-4 rounded-2xl border border-border/80 shadow-xs">
                {/* Row 1: Search & Quick Status Tabs & Reset */}
                <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Cari jamaah, NIK, HP, ID transaksi..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 text-xs bg-background border border-border rounded-xl focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground placeholder:text-muted-foreground"
                        />
                    </div>

                    <div className="flex items-center gap-2.5 self-end md:self-auto flex-wrap">
                        {hasActiveFilters && (
                            <button
                                type="button"
                                onClick={handleResetFilters}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl hover:bg-rose-500/20 transition cursor-pointer"
                            >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span>Reset Filter</span>
                            </button>
                        )}
                        <PerPageSelector value={payments.per_page} />
                    </div>
                </div>

                {/* Row 2: Filter Categories (Status, Rekening Kas, Tipe Pembayaran, Pilihan Paket) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-border/60 text-xs">
                    {/* Filter 1: Status Verifikasi */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                            <span>Status Verifikasi</span>
                        </label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full py-2 px-3 text-xs bg-background border border-border rounded-xl focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground cursor-pointer"
                        >
                            <option value="all">Semua Status ({stats.total_count})</option>
                            <option value="Pending">Menunggu Verifikasi ({stats.pending_count})</option>
                            <option value="Verified">Terverifikasi ({stats.verified_count})</option>
                            <option value="Rejected">Ditolak ({stats.rejected_count})</option>
                        </select>
                    </div>

                    {/* Filter 2: Rekening Kas Tujuan */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                            <CreditCard className="w-3.5 h-3.5 text-primary" />
                            <span>Rekening Kas Tujuan</span>
                        </label>
                        <select
                            value={rekeningFilter}
                            onChange={(e) => setRekeningFilter(e.target.value)}
                            className="w-full py-2 px-3 text-xs bg-background border border-border rounded-xl focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground cursor-pointer"
                        >
                            <option value="all">Semua Rekening Kas</option>
                            {banks.map((b) => (
                                <option key={b.id} value={b.id}>
                                    {b.nama_bank} - {b.nomor_rekening} (a.n {b.atas_nama})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Filter 3: Tipe Pembayaran */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                            <Wallet className="w-3.5 h-3.5 text-primary" />
                            <span>Tipe Pembayaran</span>
                        </label>
                        <select
                            value={tipeFilter}
                            onChange={(e) => setTipeFilter(e.target.value)}
                            className="w-full py-2 px-3 text-xs bg-background border border-border rounded-xl focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground cursor-pointer"
                        >
                            <option value="all">Semua Tipe Pembayaran</option>
                            <option value="DP">Uang Muka (DP)</option>
                            <option value="Cicilan">Cicilan</option>
                            <option value="Pelunasan">Pelunasan</option>
                            <option value="Tambahan">Biaya Tambahan</option>
                            <option value="Lunas">Bayar Lunas</option>
                        </select>
                    </div>

                    {/* Filter 4: Pilihan Paket */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                            <Package className="w-3.5 h-3.5 text-primary" />
                            <span>Pilihan Paket</span>
                        </label>
                        <select
                            value={paketFilter}
                            onChange={(e) => setPaketFilter(e.target.value)}
                            className="w-full py-2 px-3 text-xs bg-background border border-border rounded-xl focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground cursor-pointer"
                        >
                            <option value="all">Semua Paket Umroh / Haji</option>
                            {packages.map((pkg) => (
                                <option key={pkg.id} value={pkg.id}>
                                    {pkg.nama_paket} ({toRupiah(pkg.harga)})
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Row 3: DateRangePicker Component */}
                <div className="pt-3 border-t border-border/60 text-xs">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-primary" />
                            <span>Rentang Tanggal Transaksi</span>
                        </label>
                        <DatePickerWithRange
                            dateRange={dateRange}
                            onChange={handleDateRangeChange}
                            placeholder="Pilih rentang tanggal transaksi (dari - sampai)..."
                        />
                    </div>
                </div>
            </div>

            {/* 4. Data Table */}
            <div className="overflow-hidden rounded-2xl border border-border/80 bg-card/70 backdrop-blur-md shadow-xs">
                <div className="overflow-x-auto low-scrollbar">
                    <table className="w-full text-left border-collapse text-sm">
                        <thead>
                            <tr className="bg-muted/40 text-muted-foreground font-semibold text-xs border-b border-border/80 uppercase tracking-wider">
                                <th className="p-4 pl-6 w-14 text-center">ID</th>
                                <th className="p-4">Jamaah &amp; Paket</th>
                                <th className="p-4">Rincian Pembayaran</th>
                                <th className="p-4">Rekening Kas Tujuan</th>
                                <th className="p-4 text-center">Bukti Transfer</th>
                                <th className="p-4 text-center">Status</th>
                                <th className="p-4 pr-6 text-right">Aksi &amp; Kuitansi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60">
                            {paymentList.map((payment) => {
                                const isVerified = payment.status_verifikasi === 'Verified';
                                const isPending = payment.status_verifikasi === 'Pending';
                                const isRejected = payment.status_verifikasi === 'Rejected';

                                return (
                                    <tr key={payment.id} className="hover:bg-muted/20 transition-colors">
                                        <td className="p-4 pl-6 text-center font-mono text-xs text-muted-foreground">
                                            #{payment.id}
                                        </td>
                                        <td className="p-4">
                                            <div className="font-semibold text-foreground">
                                                {payment.jamaah?.nama_lengkap || 'Jamaah'}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {payment.jamaah?.paket?.nama_paket || 'Belum Pilih Paket'}
                                            </div>
                                            {payment.jamaah?.no_hp && (
                                                <div className="text-[11px] text-muted-foreground/80 font-mono mt-0.5">
                                                    {payment.jamaah.no_hp}
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <div className="font-bold font-mono text-foreground">
                                                {toRupiah(payment.nominal)}
                                            </div>
                                            <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                                <span>Tipe:</span>
                                                <span className="px-1.5 py-0.2 rounded text-[10px] font-bold uppercase bg-primary/10 text-primary border border-primary/20">
                                                    {payment.tipe_pembayaran}
                                                </span>
                                            </div>
                                            <div className="text-[11px] text-muted-foreground/70 mt-0.5">
                                                {new Date(payment.created_at || Date.now()).toLocaleDateString('id-ID', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="font-medium text-foreground">
                                                {payment.rekening_tenant?.nama_bank || 'Bank Travel'}
                                            </div>
                                            <div className="text-xs font-mono text-primary font-semibold">
                                                {payment.rekening_tenant?.nomor_rekening || '-'}
                                            </div>
                                            <div className="text-[11px] text-muted-foreground">
                                                a.n {payment.rekening_tenant?.atas_nama || '-'}
                                            </div>
                                        </td>
                                        <td className="p-4 text-center">
                                            {payment.bukti_transfer ? (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setSelectedSlip(
                                                            payment.bukti_transfer?.startsWith('http')
                                                                ? payment.bukti_transfer
                                                                : `/storage/${payment.bukti_transfer}`
                                                        )
                                                    }
                                                    className="inline-flex items-center gap-1 text-xs text-primary underline font-medium hover:opacity-80 cursor-pointer"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                    <span>Lihat Bukti</span>
                                                </button>
                                            ) : (
                                                <span className="text-xs text-muted-foreground italic">Tidak ada slip</span>
                                            )}
                                        </td>
                                        <td className="p-4 text-center">
                                            <span
                                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
                                                    isVerified
                                                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                                                        : isRejected
                                                        ? 'bg-destructive/10 text-destructive border-destructive/20'
                                                        : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                                                }`}
                                            >
                                                <span
                                                    className={`w-1.5 h-1.5 rounded-full ${
                                                        isVerified
                                                            ? 'bg-emerald-500'
                                                            : isRejected
                                                            ? 'bg-destructive'
                                                            : 'bg-amber-500'
                                                    }`}
                                                />
                                                {payment.status_verifikasi}
                                            </span>
                                        </td>
                                        <td className="p-4 pr-6 text-right">
                                            {isPending ? (
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleVerify(payment.id, 'Verified')}
                                                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer"
                                                    >
                                                        Setujui
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleVerify(payment.id, 'Rejected')}
                                                        className="px-3 py-1.5 bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer"
                                                    >
                                                        Tolak
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-end gap-2">
                                                    {isVerified && (
                                                        <button
                                                            type="button"
                                                            onClick={() => setSelectedInvoice(payment)}
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground border border-primary/20 rounded-xl text-xs font-semibold transition cursor-pointer shadow-2xs"
                                                            title="Lihat Kuitansi & Cetak Invoice Resmi"
                                                        >
                                                            <Receipt className="w-3.5 h-3.5" />
                                                            <span>Invoice</span>
                                                        </button>
                                                    )}
                                                    <span className="text-[11px] text-muted-foreground">
                                                        Oleh: {payment.verified_by_user?.name || 'Sistem'}
                                                    </span>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}

                            {paymentList.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="p-12 text-center text-muted-foreground space-y-2">
                                        <Receipt className="w-10 h-10 mx-auto text-muted-foreground/40 mb-2" />
                                        <p className="font-semibold text-foreground">Tidak ada data pembayaran ditemukan</p>
                                        <p className="text-xs text-muted-foreground">
                                            Coba ubah kriteria filter pencarian atau tanggal transaksi.
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
                        links={payments.links}
                        from={payments.from}
                        to={payments.to}
                        total={payments.total}
                        currentPage={payments.current_page}
                        lastPage={payments.last_page}
                    />
                </div>
            </div>

            {/* Modal: Official Printable Invoice */}
            <PaymentInvoiceModal
                payment={selectedInvoice}
                isOpen={!!selectedInvoice}
                onClose={() => setSelectedInvoice(null)}
            />

            {/* Drawer: Bukti Transfer Preview */}
            <Sheet open={!!selectedSlip} onOpenChange={(open) => { if (!open) setSelectedSlip(null); }}>
                <SheetContent side="right" className="w-full sm:max-w-xl md:w-1/2 flex flex-col justify-between">
                    <SheetHeader>
                        <SheetTitle>Pratinjau Bukti Transfer</SheetTitle>
                    </SheetHeader>
                    <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
                        {selectedSlip?.toLowerCase().endsWith('.pdf') ? (
                            <iframe src={selectedSlip} className="w-full h-full rounded-lg border border-border" />
                        ) : (
                            <img
                                src={selectedSlip || ''}
                                alt="Bukti Transfer"
                                className="max-h-[70vh] object-contain rounded-lg border border-border shadow-md"
                            />
                        )}
                    </div>
                </SheetContent>
            </Sheet>
        </PageLayout>
    );
}
