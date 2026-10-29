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
    verified_by?: { name: string } | any;
    verified_by_user?: { name: string } | null;
    verifiedBy?: { name: string } | null;
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        Verifikasi Pembayaran
                    </h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        Validasi bukti transfer jamaah, rekonsiliasi kas masuk, dan penerbitan kuitansi invoice resmi.
                    </p>
                </div>
            </div>

            {/* 2. Financial Summary KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Card 1: Total Dana Terverifikasi */}
                <div className="bg-card border border-border rounded-lg p-5 flex items-start justify-between">
                    <div>
                        <span className="text-xs font-medium text-muted-foreground">
                            Total Dana Masuk Sah
                        </span>
                        <div className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 mt-1">
                            {toRupiah(stats.total_verified_nominal)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {stats.verified_count} transaksi terverifikasi
                        </p>
                    </div>
                    <div className="p-2.5 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 rounded-lg shrink-0">
                        <CheckCircle2 className="w-5 h-5" />
                    </div>
                </div>

                {/* Card 2: Dana Menunggu Verifikasi */}
                <div className="bg-card border border-border rounded-lg p-5 flex items-start justify-between">
                    <div>
                        <span className="text-xs font-medium text-muted-foreground">
                            Dana Menunggu Verifikasi
                        </span>
                        <div className="text-2xl font-bold tracking-tight text-amber-600 dark:text-amber-400 mt-1">
                            {toRupiah(stats.total_pending_nominal)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {stats.pending_count} pembayaran menunggu approval
                        </p>
                    </div>
                    <div className="p-2.5 bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 rounded-lg shrink-0">
                        <Clock className="w-5 h-5" />
                    </div>
                </div>

                {/* Card 3: Total Transaksi */}
                <div className="bg-card border border-border rounded-lg p-5 flex items-start justify-between sm:col-span-2 lg:col-span-1">
                    <div>
                        <span className="text-xs font-medium text-muted-foreground">
                            Total Mutasi Transaksi
                        </span>
                        <div className="text-2xl font-bold tracking-tight text-foreground mt-1">
                            {stats.total_count} Transaksi
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {stats.rejected_count} transaksi ditolak
                        </p>
                    </div>
                    <div className="p-2.5 bg-muted text-muted-foreground rounded-lg shrink-0">
                        <Receipt className="w-5 h-5" />
                    </div>
                </div>
            </div>

            {/* 3. Comprehensive Multi-Criteria Filter Toolbar */}
            <div className="flex flex-col gap-3 bg-card p-4 rounded-lg border border-border">
                {/* Row 1: Search & Quick Status Tabs & Reset */}
                <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Cari jamaah, NIK, HP, nomor invoice..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-3 py-1.5 text-xs bg-background border border-input rounded-md focus:outline-hidden focus:ring-1 focus:ring-primary focus:border-primary text-foreground placeholder:text-muted-foreground"
                        />
                    </div>

                    <div className="flex items-center gap-2 self-end md:self-auto flex-wrap">
                        {hasActiveFilters && (
                            <button
                                type="button"
                                onClick={handleResetFilters}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10 border border-destructive/20 rounded-md transition cursor-pointer"
                            >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span>Reset Filter</span>
                            </button>
                        )}
                        <PerPageSelector value={payments.per_page} />
                    </div>
                </div>

                {/* Row 2: Filter Categories (Status, Rekening Kas, Tipe Pembayaran, Pilihan Paket) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-border text-xs">
                    {/* Filter 1: Status Verifikasi */}
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-muted-foreground">
                            Status Verifikasi
                        </label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full py-1.5 px-2.5 text-xs bg-background border border-input rounded-md focus:outline-hidden focus:ring-1 focus:ring-primary focus:border-primary text-foreground cursor-pointer"
                        >
                            <option value="all">Semua Status ({stats.total_count})</option>
                            <option value="Pending">Menunggu Verifikasi ({stats.pending_count})</option>
                            <option value="Verified">Terverifikasi ({stats.verified_count})</option>
                            <option value="Rejected">Ditolak ({stats.rejected_count})</option>
                        </select>
                    </div>

                    {/* Filter 2: Rekening Kas Tujuan */}
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-muted-foreground">
                            Rekening Kas Tujuan
                        </label>
                        <select
                            value={rekeningFilter}
                            onChange={(e) => setRekeningFilter(e.target.value)}
                            className="w-full py-1.5 px-2.5 text-xs bg-background border border-input rounded-md focus:outline-hidden focus:ring-1 focus:ring-primary focus:border-primary text-foreground cursor-pointer"
                        >
                            <option value="all">Semua Rekening Kas</option>
                            {banks.map((b) => (
                                <option key={b.id} value={b.id}>
                                    {b.nama_bank} - {b.nomor_rekening} ({b.atas_nama})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Filter 3: Tipe Pembayaran */}
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-muted-foreground">
                            Tipe Pembayaran
                        </label>
                        <select
                            value={tipeFilter}
                            onChange={(e) => setTipeFilter(e.target.value)}
                            className="w-full py-1.5 px-2.5 text-xs bg-background border border-input rounded-md focus:outline-hidden focus:ring-1 focus:ring-primary focus:border-primary text-foreground cursor-pointer"
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
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-muted-foreground">
                            Pilihan Paket
                        </label>
                        <select
                            value={paketFilter}
                            onChange={(e) => setPaketFilter(e.target.value)}
                            className="w-full py-1.5 px-2.5 text-xs bg-background border border-input rounded-md focus:outline-hidden focus:ring-1 focus:ring-primary focus:border-primary text-foreground cursor-pointer"
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
                <div className="pt-3 border-t border-border text-xs">
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-muted-foreground">
                            Rentang Tanggal Transaksi
                        </label>
                        <DatePickerWithRange
                            dateRange={dateRange}
                            onChange={handleDateRangeChange}
                            placeholder="Pilih rentang tanggal transaksi..."
                        />
                    </div>
                </div>
            </div>

            {/* 4. Data Table */}
            <div className="overflow-hidden rounded-lg border border-border bg-card">
                <div className="overflow-x-auto low-scrollbar">
                    <table className="w-full text-left border-collapse text-sm">
                        <thead>
                            <tr className="bg-muted/40 text-muted-foreground text-xs font-medium border-b border-border">
                                <th className="px-4 py-3 w-16">Invoice</th>
                                <th className="px-4 py-3">Jamaah &amp; Paket</th>
                                <th className="px-4 py-3 text-right">Nominal</th>
                                <th className="px-4 py-3">Tipe &amp; Tanggal</th>
                                <th className="px-4 py-3">Rekening Tujuan</th>
                                <th className="px-4 py-3 text-center">Bukti</th>
                                <th className="px-4 py-3 text-center">Status</th>
                                <th className="px-4 py-3 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {paymentList.map((payment) => {
                                const isVerified = payment.status_verifikasi === 'Verified';
                                const isPending = payment.status_verifikasi === 'Pending';
                                const isRejected = payment.status_verifikasi === 'Rejected';

                                return (
                                    <tr key={payment.id} className="hover:bg-muted/30 transition-colors">
                                        <td className="px-4 py-3 font-mono text-xs font-medium text-foreground">
                                            {payment.nomor_invoice || `#${payment.id}`}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="font-medium text-foreground">
                                                {payment.jamaah?.nama_lengkap || 'Jamaah'}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {payment.jamaah?.paket?.nama_paket || 'Belum Pilih Paket'}
                                            </div>
                                            {payment.jamaah?.no_hp && (
                                                <div className="text-[11px] text-muted-foreground font-mono mt-0.5">
                                                    {payment.jamaah.no_hp}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="font-semibold tabular-nums text-foreground">
                                                {toRupiah(payment.nominal)}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-secondary text-secondary-foreground">
                                                {payment.tipe_pembayaran}
                                            </div>
                                            <div className="text-[11px] text-muted-foreground mt-0.5">
                                                {new Date(payment.created_at || Date.now()).toLocaleDateString('id-ID', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="font-medium text-foreground text-xs">
                                                {payment.rekening_tenant?.nama_bank || 'Bank Travel'}
                                            </div>
                                            <div className="text-xs font-mono text-muted-foreground">
                                                {payment.rekening_tenant?.nomor_rekening || '-'}
                                            </div>
                                            <div className="text-[11px] text-muted-foreground">
                                                a.n {payment.rekening_tenant?.atas_nama || '-'}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-center">
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
                                                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium cursor-pointer"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                    <span>Lihat Bukti</span>
                                                </button>
                                            ) : (
                                                <span className="text-xs text-muted-foreground italic">Tidak ada</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span
                                                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    isVerified
                                                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400'
                                                        : isRejected
                                                        ? 'bg-destructive/10 text-destructive'
                                                        : 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400'
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
                                        <td className="px-4 py-3 text-right">
                                            {isPending ? (
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleVerify(payment.id, 'Verified')}
                                                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-medium transition cursor-pointer"
                                                    >
                                                        Setujui
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleVerify(payment.id, 'Rejected')}
                                                        className="px-2.5 py-1 bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-md text-xs font-medium transition cursor-pointer"
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
                                                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-secondary hover:bg-secondary/80 text-secondary-foreground border border-border rounded-md text-xs font-medium transition cursor-pointer"
                                                            title="Lihat Kuitansi & Cetak Invoice Resmi"
                                                        >
                                                            <Receipt className="w-3.5 h-3.5" />
                                                            <span>Invoice</span>
                                                        </button>
                                                    )}
                                                    <span className="text-[11px] text-muted-foreground">
                                                        Oleh: {(typeof payment.verified_by === 'object' && payment.verified_by?.name) || payment.verified_by_user?.name || (payment as any).verifiedBy?.name || 'Petugas'}
                                                    </span>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}

                            {paymentList.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="p-12 text-center text-muted-foreground space-y-2">
                                        <Receipt className="w-8 h-8 mx-auto text-muted-foreground/40 mb-2" />
                                        <p className="font-semibold text-foreground text-sm">Tidak ada data pembayaran ditemukan</p>
                                        <p className="text-xs text-muted-foreground">
                                            Coba sesuaikan kriteria filter pencarian atau tanggal transaksi.
                                        </p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                <div className="border-t border-border px-4 py-2 bg-muted/20">
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
                <SheetContent side="right" className="w-full sm:max-w-5xl md:w-1/2 flex flex-col justify-between">
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
