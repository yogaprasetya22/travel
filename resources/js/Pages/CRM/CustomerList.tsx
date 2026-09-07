import React, { useState, useRef, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { PageProps } from '@/Types';
import PageLayout from '@/Components/Layouts/PageLayout';
import { toRupiah } from '@/Components/CurrencyInput';
import {
    Search,
    Edit3,
    Plane,
    Eye,
    Filter,
    RotateCcw,
    Calendar,
    Package,
    CheckCircle2,
    Clock,
    FileCheck,
    Receipt,
} from 'lucide-react';

import DataTablePagination, { PaginatedData } from '@/Components/DataTablePagination';
import PerPageSelector from '@/Components/PerPageSelector';
import { useDebounce } from '@/hooks/use-debounce';
import { useMounted } from '@/hooks/use-mounted';

import CustomerMetricsCards, { CustomerMetrics } from './Components/CustomerMetricsCards';
import CustomerDrawer, { Customer, BankAccount } from './Components/CustomerDrawer';
import CustomerEditDrawer from './Components/CustomerEditDrawer';
import { DatePickerWithRange } from '@/Components/DatePickerWithRange';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';

interface PackageOption {
    id: number;
    nama_paket: string;
    harga: number;
}

interface CustomerListProps extends PageProps {
    customers: PaginatedData<Customer>;
    banks: BankAccount[];
    pakets?: PackageOption[];
    metrics: CustomerMetrics;
    filters: {
        search: string;
        status: string;
        doc: string;
        paket_id?: string | number;
        schedule?: string;
        date_type?: string;
        start_date?: string;
        end_date?: string;
        per_page: number;
    };
}

export default function CustomerList({ customers, banks = [], pakets = [], metrics, filters }: CustomerListProps) {
    const isMounted = useMounted();
    const [searchQuery, setSearchQuery] = useState(filters?.search || '');
    const [statusFilter, setStatusFilter] = useState(filters?.status || 'ALL');
    const [docFilter, setDocFilter] = useState(filters?.doc || 'ALL');
    const [paketFilter, setPaketFilter] = useState(filters?.paket_id ? String(filters.paket_id) : 'ALL');
    const [scheduleFilter, setScheduleFilter] = useState(filters?.schedule || 'ALL');
    const [dateType, setDateType] = useState(filters?.date_type || 'created_at');
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

    // Drawer states (Separated View Drawer and Edit Drawer)
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [drawerInitialTab, setDrawerInitialTab] = useState<'view' | 'financial' | 'documents' | 'riwayat'>('view');
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

    const debouncedSearchQuery = useDebounce(searchQuery, 350);
    const isInitialMount = useRef(true);

    const handleDateRangeChange = (range: DateRange | undefined) => {
        setDateRange(range);
        const startStr = range?.from ? format(range.from, 'yyyy-MM-dd') : '';
        const endStr = range?.to ? format(range.to, 'yyyy-MM-dd') : (range?.from ? format(range.from, 'yyyy-MM-dd') : '');
        setStartDate(startStr);
        setEndDate(endStr);
    };

    // Deep-link auto-open from URL (?customer_id=123&tab=financial)
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const autoCustomerId = urlParams.get('customer_id');
        const autoTab = urlParams.get('tab') as any;

        if (autoCustomerId && customers.data) {
            const found = customers.data.find((c) => c.id.toString() === autoCustomerId);
            if (found) {
                if (autoTab === 'edit' || autoTab === 'biodata') {
                    setEditingCustomer(found);
                } else {
                    setSelectedCustomer(found);
                    if (autoTab) {
                        setDrawerInitialTab(autoTab);
                    }
                }
            }
        }
    }, []);

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        router.get(
            route('crm.customers.index'),
            {
                search: debouncedSearchQuery || undefined,
                status: statusFilter !== 'ALL' ? statusFilter : undefined,
                doc: docFilter !== 'ALL' ? docFilter : undefined,
                paket_id: paketFilter !== 'ALL' ? paketFilter : undefined,
                schedule: scheduleFilter !== 'ALL' ? scheduleFilter : undefined,
                date_type: dateType,
                start_date: startDate || undefined,
                end_date: endDate || undefined,
                per_page: customers.per_page,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            }
        );
    }, [debouncedSearchQuery, statusFilter, docFilter, paketFilter, scheduleFilter, dateType, startDate, endDate]);

    const handleResetFilters = () => {
        setSearchQuery('');
        setStatusFilter('ALL');
        setDocFilter('ALL');
        setPaketFilter('ALL');
        setScheduleFilter('ALL');
        setDateType('created_at');
        setStartDate('');
        setEndDate('');
        setDateRange(undefined);
    };

    const hasActiveFilters = searchQuery !== '' || statusFilter !== 'ALL' || docFilter !== 'ALL' || paketFilter !== 'ALL' || scheduleFilter !== 'ALL' || startDate !== '' || endDate !== '';

    const handleOpenDrawer = (c: Customer, tab: 'view' | 'financial' | 'documents' | 'riwayat' = 'view') => {
        setSelectedCustomer(c);
        setDrawerInitialTab(tab);
        const url = new URL(window.location.href);
        url.searchParams.set('customer_id', c.id.toString());
        url.searchParams.set('tab', tab);
        window.history.replaceState({}, '', url.toString());
    };

    const handleOpenEdit = (c: Customer) => {
        setSelectedCustomer(null);
        setEditingCustomer(c);
        const url = new URL(window.location.href);
        url.searchParams.set('customer_id', c.id.toString());
        url.searchParams.set('tab', 'edit');
        window.history.replaceState({}, '', url.toString());
    };

    const handleCloseDrawer = () => {
        setSelectedCustomer(null);
        const url = new URL(window.location.href);
        url.searchParams.delete('customer_id');
        url.searchParams.delete('tab');
        window.history.replaceState({}, '', url.toString());
    };

    const handleCloseEditDrawer = () => {
        setEditingCustomer(null);
        const url = new URL(window.location.href);
        url.searchParams.delete('customer_id');
        url.searchParams.delete('tab');
        window.history.replaceState({}, '', url.toString());
    };

    if (!isMounted) {
        return null;
    }

    const customerList = customers.data || [];

    return (
        <PageLayout
            title="Progres Pelunasan Jamaah"
            breadcrumbParent="Keuangan"
            breadcrumbPage="Progres Pelunasan Jamaah"
            contentClass="p-6 md:p-8 flex flex-col gap-6 w-full max-w-none"
        >
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-card/60 backdrop-blur-md p-6 rounded-2xl border border-border/80 shadow-xs">
                <div>
                    <div className="flex items-center gap-2.5">
                        <div className="h-8 w-1.5 rounded-full bg-primary" />
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                            Progres Pelunasan Jamaah &amp; Mutasi Keuangan
                        </h1>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 ml-4">
                        Kelola pelunasan cicilan, pencatatan mutasi bank, sisa piutang, dan pencairan komisi agen dalam satu menu terpadu.
                    </p>
                </div>
            </div>

            {/* 4 Financial Summary KPI Cards Component */}
            <CustomerMetricsCards metrics={metrics} />

            {/* Comprehensive Multi-Criteria Filter Toolbar */}
            <div className="flex flex-col gap-3.5 bg-card/60 p-4 rounded-2xl border border-border/80 shadow-xs">
                {/* Row 1: Search & Secondary Controls */}
                <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Cari nama, NIK, HP, paspor, agen..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 text-xs bg-background border border-border rounded-xl focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground placeholder:text-muted-foreground"
                        />
                    </div>

                    <div className="flex items-center gap-2.5 self-end md:self-auto">
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
                        <PerPageSelector value={customers.per_page} />
                    </div>
                </div>

                {/* Row 2: Filter Categories (Pelunasan, Paspor, Paket, Jadwal) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-border/60 text-xs">
                    {/* Filter 1: Status Pelunasan & Progress */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                            <span>Progres Pembayaran</span>
                        </label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full py-2 px-3 text-xs bg-background border border-border rounded-xl focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground cursor-pointer"
                        >
                            <option value="ALL">Semua Progres</option>
                            <option value="LUNAS">Sudah Lunas (100%)</option>
                            <option value="CICILAN">Cicilan Berjalan</option>
                            <option value="DP">Sudah DP (Belum Cicil)</option>
                            <option value="UNPAID">Belum Bayar (0%)</option>
                            <option value="BELUM_LUNAS">Belum Lunas (Semua)</option>
                            <option value="DP_PENDING">DP Menunggu Verifikasi</option>
                        </select>
                    </div>

                    {/* Filter 2: Status Paspor */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                            <FileCheck className="w-3.5 h-3.5 text-primary" />
                            <span>Status Paspor</span>
                        </label>
                        <select
                            value={docFilter}
                            onChange={(e) => setDocFilter(e.target.value)}
                            className="w-full py-2 px-3 text-xs bg-background border border-border rounded-xl focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground cursor-pointer"
                        >
                            <option value="ALL">Semua Status Paspor</option>
                            <option value="PASSPORT_READY">Paspor Lengkap</option>
                            <option value="PASSPORT_PENDING">Belum Ada Paspor</option>
                        </select>
                    </div>

                    {/* Filter 3: Pilihan Paket */}
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
                            <option value="ALL">Semua Paket Umroh/Haji</option>
                            {pakets.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.nama_paket} ({toRupiah(p.harga)})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Filter 4: Status Jadwal Keberangkatan */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                            <Plane className="w-3.5 h-3.5 text-primary" />
                            <span>Jadwal Keberangkatan</span>
                        </label>
                        <select
                            value={scheduleFilter}
                            onChange={(e) => setScheduleFilter(e.target.value)}
                            className="w-full py-2 px-3 text-xs bg-background border border-border rounded-xl focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground cursor-pointer"
                        >
                            <option value="ALL">Semua Jadwal</option>
                            <option value="SCHEDULED">Sudah Terjadwal</option>
                            <option value="UNSCHEDULED">Belum Terjadwal</option>
                        </select>
                    </div>
                </div>

                {/* Row 3: Date Range Filter (Tanggal Pendaftaran vs Keberangkatan) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-border/60 text-xs items-end">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-primary" />
                            <span>Kategori Tanggal</span>
                        </label>
                        <select
                            value={dateType}
                            onChange={(e) => setDateType(e.target.value)}
                            className="w-full py-2 px-3 text-xs bg-background border border-border rounded-xl focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground cursor-pointer"
                        >
                            <option value="created_at">Tanggal Pendaftaran (Registrasi)</option>
                            <option value="keberangkatan">Tanggal Keberangkatan</option>
                        </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                            Rentang Tanggal
                        </label>
                        <DatePickerWithRange
                            dateRange={dateRange}
                            onChange={handleDateRangeChange}
                            placeholder="Pilih rentang tanggal (dari - sampai)..."
                        />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-2xl border border-border/80 bg-card/70 backdrop-blur-md shadow-xs">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-border/80 bg-muted/50 text-xs font-bold text-foreground uppercase tracking-wider">
                                <th className="px-6 py-4">Nama Jamaah &amp; Kontak</th>
                                <th className="px-6 py-4">Paket Dipilih</th>
                                <th className="px-6 py-4">Progres Pelunasan</th>
                                <th className="px-6 py-4">Hak Komisi Agen</th>
                                <th className="px-6 py-4">Jadwal Keberangkatan</th>
                                <th className="px-6 py-4 text-center">Aksi Operasional</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60 text-xs">
                            {customerList.map((c) => {
                                const packagePrice = Number(c.paket?.harga || 0);
                                const verifiedPayments = (c.pembayaran || []).filter((p) => p.status_verifikasi === 'Verified');
                                const pendingPayments = (c.pembayaran || []).filter((p) => p.status_verifikasi === 'Pending');
                                const totalPaid = verifiedPayments.reduce((sum, p) => sum + Number(p.nominal), 0);
                                const remainingBalance = Math.max(0, packagePrice - totalPaid);
                                const isLunas = totalPaid >= packagePrice && packagePrice > 0;
                                const progressPercent = packagePrice > 0 ? Math.min(100, Math.round((totalPaid / packagePrice) * 100)) : 0;
                                const totalCommission = (c.komisi_agen || []).reduce((sum, k) => sum + Number(k.nominal_komisi), 0);
                                const commissionStatus = c.komisi_agen?.[0]?.status_pencairan || 'Pending';

                                return (
                                    <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-sm text-foreground">{c.nama_lengkap}</div>
                                            <div className="text-[11px] text-muted-foreground mt-0.5 flex flex-wrap items-center gap-1.5">
                                                <span>NIK: {c.nik || '-'}</span>
                                                <span>•</span>
                                                <span>HP: {c.no_hp}</span>
                                                <span>•</span>
                                                {c.nomor_paspor ? (
                                                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                                                        Paspor: {c.nomor_paspor}
                                                    </span>
                                                ) : (
                                                    <span className="text-amber-600 dark:text-amber-400">
                                                        Paspor: Belum Ada
                                                    </span>
                                                )}
                                            </div>
                                            {c.agen && (
                                                <div className="mt-1 text-[11px] text-primary font-semibold">
                                                    PIC Agen: {c.agen.name}
                                                </div>
                                            )}
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="font-bold text-foreground">{c.paket?.nama_paket}</div>
                                            <div className="text-[11px] text-muted-foreground mt-0.5">
                                                Harga: <strong className="text-foreground">{toRupiah(packagePrice)}</strong>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 min-w-[200px]">
                                            <div className="flex items-center justify-between gap-2">
                                                <div className="font-extrabold text-foreground">
                                                    {toRupiah(totalPaid)}
                                                </div>
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                                    isLunas
                                                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                                                        : pendingPayments.length > 0 && totalPaid === 0
                                                        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                                                        : totalPaid > 0
                                                        ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
                                                        : 'bg-muted text-muted-foreground border-border'
                                                }`}>
                                                    {isLunas
                                                        ? 'LUNAS (100%)'
                                                        : pendingPayments.length > 0 && totalPaid === 0
                                                        ? 'DP Menunggu Verifikasi'
                                                        : totalPaid > 0
                                                        ? `Cicilan (Sisa: ${toRupiah(remainingBalance)})`
                                                        : `Belum Bayar (Sisa: ${toRupiah(remainingBalance)})`}
                                                </span>
                                            </div>

                                            {/* Progress Bar */}
                                            <div className="w-full bg-muted rounded-full h-1.5 mt-2 overflow-hidden">
                                                <div
                                                    className={`h-1.5 rounded-full transition-all ${isLunas ? 'bg-emerald-500' : 'bg-primary'}`}
                                                    style={{ width: `${progressPercent}%` }}
                                                />
                                            </div>

                                            {/* Payment Breakdown Badge */}
                                            <div className="text-[10px] text-muted-foreground mt-1.5 flex items-center gap-1.5">
                                                <span>{verifiedPayments.length}x Terverifikasi</span>
                                                {pendingPayments.length > 0 && (
                                                    <span className="text-amber-600 dark:text-amber-400 font-semibold">• {pendingPayments.length} Menunggu Verifikasi</span>
                                                )}
                                            </div>
                                        </td>

                                        <td className="px-6 py-4">
                                            {c.agen ? (
                                                <>
                                                    <div className="font-bold text-purple-600 dark:text-purple-400 text-sm">
                                                        {toRupiah(totalCommission)}
                                                    </div>
                                                    <span className={`inline-block mt-0.5 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                                                        commissionStatus === 'Paid'
                                                            ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                                                            : commissionStatus === 'Ready_to_Pay'
                                                            ? 'bg-sky-500/10 text-sky-600 border-sky-500/20'
                                                            : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                                                    }`}>
                                                        {commissionStatus === 'Paid' ? 'Sudah Ditransfer' : commissionStatus === 'Ready_to_Pay' ? 'Siap Dicairkan' : 'Pending'}
                                                    </span>
                                                </>
                                            ) : (
                                                <div className="flex flex-col items-start gap-0.5">
                                                    <span className="text-xs font-semibold text-muted-foreground">Rp 0</span>
                                                    <span className="text-[10px] font-medium text-muted-foreground/80 px-2 py-0.5 rounded-full bg-muted/60 border border-border/60">
                                                        Direct (Non-Agen)
                                                    </span>
                                                </div>
                                            )}
                                        </td>

                                        <td className="px-6 py-4">
                                            {c.tanggal_keberangkatan ? (
                                                <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                                                    <Plane className="w-3.5 h-3.5 text-primary shrink-0" />
                                                    <span>
                                                        {new Date(c.tanggal_keberangkatan).toLocaleDateString('id-ID', {
                                                            day: 'numeric',
                                                            month: 'short',
                                                            year: 'numeric',
                                                        })}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-muted-foreground italic">Belum dijadwalkan</span>
                                            )}
                                        </td>

                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center gap-1.5">
                                                <button
                                                    onClick={() => handleOpenDrawer(c, 'view')}
                                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500 text-sky-600 hover:text-white dark:text-sky-400 dark:hover:text-white border border-sky-500/20 text-[10px] font-semibold transition cursor-pointer"
                                                    title="Lihat Data Lengkap & Berkas"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                    <span>Lihat</span>
                                                </button>
                                                <button
                                                    onClick={() => handleOpenEdit(c)}
                                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border bg-card hover:bg-muted text-[10px] font-semibold transition cursor-pointer"
                                                    title="Edit Biodata & Keterangan Lengkap"
                                                >
                                                    <Edit3 className="w-3.5 h-3.5" />
                                                    <span>Edit</span>
                                                </button>
                                                <button
                                                    onClick={() => handleOpenDrawer(c, 'financial')}
                                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-600 text-emerald-600 hover:text-white dark:text-emerald-400 dark:hover:text-white border border-emerald-500/20 text-[10px] font-semibold transition cursor-pointer"
                                                    title="Lihat Rincian Transaksi & Catat Pelunasan"
                                                >
                                                    <Receipt className="w-3.5 h-3.5" />
                                                    <span>Bayar</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}

                            {customerList.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-sm text-muted-foreground italic">
                                        Tidak ada data jamaah resmi yang sesuai kriteria pencarian.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Shared Pagination Controls */}
                <div className="border-t border-border/80 px-4 bg-muted/20">
                    <DataTablePagination
                        links={customers.links}
                        from={customers.from}
                        to={customers.to}
                        total={customers.total}
                        currentPage={customers.current_page}
                        lastPage={customers.last_page}
                    />
                </div>
            </div>

            {/* View Detail Modular Drawer Component */}
            <CustomerDrawer
                customer={selectedCustomer}
                initialTab={drawerInitialTab}
                banks={banks}
                onClose={handleCloseDrawer}
                onEdit={(cust) => handleOpenEdit(cust)}
            />

            {/* Dedicated Edit Customer Drawer Component */}
            <CustomerEditDrawer
                customer={editingCustomer}
                isOpen={!!editingCustomer}
                onClose={handleCloseEditDrawer}
            />
        </PageLayout>
    );
}
