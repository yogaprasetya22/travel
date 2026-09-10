import React, { useState, useRef, useEffect } from 'react';
import { router, usePage } from '@inertiajs/react';
import { PageProps } from '@/Types';
import PageLayout from '@/Components/Layouts/PageLayout';
import { toRupiah } from '@/Components/CurrencyInput';
import {
    Calendar,
    Plane,
    Users,
    Search,
    Clock,
    LayoutGrid,
    Table as TableIcon,
    CheckCircle2,
    AlertCircle,
    FileCheck,
    UserCheck,
    Download,
    ChevronDown,
    ChevronUp,
    Edit3,
    ArrowRight,
    Package,
    Receipt,
    Phone,
    Mail,
    User,
    Check,
    Filter,
    RotateCcw,
} from 'lucide-react';

import DataTablePagination, { PaginatedData } from '@/Components/DataTablePagination';
import PerPageSelector from '@/Components/PerPageSelector';
import { useDebounce } from '@/hooks/use-debounce';
import { useMounted } from '@/hooks/use-mounted';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter,
} from '@/Components/ui/sheet';

interface JamaahSchedule {
    id: number;
    nama_lengkap: string;
    no_hp: string;
    email?: string | null;
    nomor_paspor: string | null;
    tanggal_keberangkatan: string | null;
    created_at?: string;
    paket: {
        id: number;
        nama_paket: string;
        harga: number;
    };
    agen: {
        id: number;
        name: string;
        email?: string;
    } | null;
    crmStage?: {
        id: number;
        nama_tahap: string;
    } | null;
    pembayaran?: Array<{
        id: number;
        nominal: number;
        tipe_pembayaran: string;
        status_verifikasi: string;
        tanggal_bayar?: string;
    }>;
    inventaris_transaksi?: Array<{
        id: number;
        qty: number;
        inventaris: {
            nama_barang: string;
            kode_sku?: string;
        };
    }>;
}

interface Metrics {
    total_closing: number;
    total_scheduled: number;
    total_unscheduled: number;
    total_passport_ready: number;
}

interface PackageOption {
    id: number;
    nama_paket: string;
    harga: number;
}

interface DepartureScheduleProps extends PageProps {
    schedules: Record<string, JamaahSchedule[]>;
    paginatedJamaah: PaginatedData<JamaahSchedule>;
    availablePeriods?: Array<{ key: string; label: string }>;
    pakets?: PackageOption[];
    metrics: Metrics;
    filters: {
        search: string;
        status: string;
        period?: string;
        doc?: string;
        paket_id?: string | number;
        payment_status?: string;
        per_page: number;
    };
}

export default function DepartureSchedule({
    schedules = {},
    paginatedJamaah,
    availablePeriods = [],
    pakets = [],
    metrics,
    filters,
}: DepartureScheduleProps) {
    const isMounted = useMounted();
    const [viewMode, setViewMode] = useState<'group' | 'table'>('group');
    const [searchQuery, setSearchQuery] = useState(filters?.search || '');
    const [statusFilter, setStatusFilter] = useState(filters?.status || 'ALL');
    const [periodFilter, setPeriodFilter] = useState(filters?.period || 'ALL');
    const [docFilter, setDocFilter] = useState(filters?.doc || 'ALL');
    const [paketFilter, setPaketFilter] = useState(filters?.paket_id ? String(filters.paket_id) : 'ALL');
    const [paymentStatusFilter, setPaymentStatusFilter] = useState(filters?.payment_status || 'ALL');

    // Selected Jamaah for Detailing Drawer
    const [selectedJamaah, setSelectedJamaah] = useState<JamaahSchedule | null>(null);

    // Accordion expand/collapse state per dateKey
    const [collapsedKloters, setCollapsedKloters] = useState<Record<string, boolean>>({});

    // Per-kloter pagination state (dateKey -> page)
    const [kloterPages, setKloterPages] = useState<Record<string, number>>({});
    const kloterPageSize = 12;

    // Reschedule form state inside drawer
    const [rescheduleDate, setRescheduleDate] = useState<string>('');
    const [isSubmittingSchedule, setIsSubmittingSchedule] = useState(false);

    const debouncedSearchQuery = useDebounce(searchQuery, 350);
    const isInitialMount = useRef(true);

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        router.get(
            route('crm.schedules.index'),
            {
                search: debouncedSearchQuery || undefined,
                status: statusFilter !== 'ALL' ? statusFilter : undefined,
                period: periodFilter !== 'ALL' ? periodFilter : undefined,
                doc: docFilter !== 'ALL' ? docFilter : undefined,
                paket_id: paketFilter !== 'ALL' ? paketFilter : undefined,
                payment_status: paymentStatusFilter !== 'ALL' ? paymentStatusFilter : undefined,
                per_page: paginatedJamaah.per_page,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            }
        );
    }, [debouncedSearchQuery, statusFilter, periodFilter, docFilter, paketFilter, paymentStatusFilter]);

    const handleResetFilters = () => {
        setSearchQuery('');
        setStatusFilter('ALL');
        setPeriodFilter('ALL');
        setDocFilter('ALL');
        setPaketFilter('ALL');
        setPaymentStatusFilter('ALL');
    };

    const hasActiveFilters =
        searchQuery !== '' ||
        statusFilter !== 'ALL' ||
        periodFilter !== 'ALL' ||
        docFilter !== 'ALL' ||
        paketFilter !== 'ALL' ||
        paymentStatusFilter !== 'ALL';

    useEffect(() => {
        if (selectedJamaah) {
            setRescheduleDate(selectedJamaah.tanggal_keberangkatan || '');
        }
    }, [selectedJamaah]);

    if (!isMounted) {
        return null;
    }

    const scheduleKeys = Object.keys(schedules);
    const jamaahTableData = paginatedJamaah.data || [];

    const toggleKloterCollapse = (key: string) => {
        setCollapsedKloters((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    const handleUpdateDeparture = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedJamaah) return;

        setIsSubmittingSchedule(true);
        router.post(
            route('crm.schedules.update-departure', selectedJamaah.id),
            {
                tanggal_keberangkatan: rescheduleDate || null,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setSelectedJamaah((prev) =>
                        prev ? { ...prev, tanggal_keberangkatan: rescheduleDate || null } : null
                    );
                    setIsSubmittingSchedule(false);
                },
                onError: () => {
                    setIsSubmittingSchedule(false);
                },
            }
        );
    };

    const handleExportManifest = (dateKey: string, members: JamaahSchedule[]) => {
        const title = dateKey === 'Belum Ditentukan' ? 'Manifest_Antrean_Belum_Terjadwal' : `Manifest_Kloter_${dateKey}`;
        const headers = ['No', 'Nama Jamaah', 'No HP', 'No Paspor', 'Paket Umroh/Haji', 'Mitra Agen', 'Tanggal Keberangkatan'];

        const rows = members.map((m, idx) => [
            idx + 1,
            `"${m.nama_lengkap.replace(/"/g, '""')}"`,
            `"${m.no_hp}"`,
            `"${m.nomor_paspor || '-'}"`,
            `"${m.paket?.nama_paket || '-'}"`,
            `"${m.agen?.name || 'Direct / Pusat'}"`,
            `"${m.tanggal_keberangkatan || 'Belum Terjadwal'}"`,
        ]);

        const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `${title}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <PageLayout
            title="Jadwal Keberangkatan & Manasik"
            breadcrumbParent="CRM & Jamaah"
            breadcrumbPage="Jadwal Keberangkatan"
            contentClass="p-6 md:p-8 flex flex-col gap-6 w-full max-w-none"
        >
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-card/60 backdrop-blur-md p-6 rounded-2xl border border-border/80 shadow-xs">
                <div>
                    <div className="flex items-center gap-2.5">
                        <div className="h-8 w-1.5 rounded-full bg-primary" />
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                            Manifest &amp; Jadwal Penerbangan Jamaah
                        </h1>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 ml-4">
                        Pengelompokan kloter jamaah resmi berdasarkan tanggal keberangkatan umroh, manasik, dan verifikasi paspor.
                    </p>
                </div>

                {/* View Switcher Button */}
                <div className="flex items-center bg-muted/60 p-1 rounded-xl border border-border/70 shrink-0">
                    <button
                        type="button"
                        onClick={() => setViewMode('group')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${viewMode === 'group'
                                ? 'bg-card text-foreground shadow-xs'
                                : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        <LayoutGrid className="w-3.5 h-3.5" />
                        <span>Kloter Grup</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setViewMode('table')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${viewMode === 'table'
                                ? 'bg-card text-foreground shadow-xs'
                                : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        <TableIcon className="w-3.5 h-3.5" />
                        <span>Tabel Manifest</span>
                    </button>
                </div>
            </div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-card/70 border border-border/80 rounded-2xl p-5 shadow-xs flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <Users className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-xs font-semibold text-muted-foreground">Total Jamaah Closing</div>
                        <div className="text-2xl font-extrabold text-foreground mt-0.5">
                            {metrics?.total_closing || 0} <span className="text-xs font-normal text-muted-foreground">Orang</span>
                        </div>
                    </div>
                </div>

                <div className="bg-card/70 border border-border/80 rounded-2xl p-5 shadow-xs flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                        <Plane className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-xs font-semibold text-muted-foreground">Sudah Ada Jadwal Terbang</div>
                        <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
                            {metrics?.total_scheduled || 0} <span className="text-xs font-normal text-muted-foreground">Orang</span>
                        </div>
                    </div>
                </div>

                <div className="bg-card/70 border border-border/80 rounded-2xl p-5 shadow-xs flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                        <Clock className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-xs font-semibold text-muted-foreground">Antrean Belum Dijadwalkan</div>
                        <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-0.5">
                            {metrics?.total_unscheduled || 0} <span className="text-xs font-normal text-muted-foreground">Orang</span>
                        </div>
                    </div>
                </div>

                <div className="bg-card/70 border border-border/80 rounded-2xl p-5 shadow-xs flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                        <FileCheck className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-xs font-semibold text-muted-foreground">Paspor Terverifikasi</div>
                        <div className="text-2xl font-extrabold text-purple-600 dark:text-purple-400 mt-0.5">
                            {metrics?.total_passport_ready || 0} <span className="text-xs font-normal text-muted-foreground">Orang</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Comprehensive Multi-Criteria Filter Toolbar */}
            <div className="flex flex-col gap-3.5 bg-card/60 p-4 rounded-2xl border border-border/80 shadow-xs">
                {/* Row 1: Search & Secondary Controls */}
                <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Cari nama, HP, paspor, paket, agen..."
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
                        {viewMode === 'table' && <PerPageSelector value={paginatedJamaah.per_page} />}
                    </div>
                </div>

                {/* Row 2: 5 Filter Dropdowns (Jadwal, Periode Bulan, Paspor, Paket, Pelunasan) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-3 border-t border-border/60 text-xs">
                    {/* Filter 1: Status Jadwal Keberangkatan */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                            <Plane className="w-3.5 h-3.5 text-primary" />
                            <span>Status Jadwal</span>
                        </label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full py-2 px-3 text-xs bg-background border border-border rounded-xl focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground cursor-pointer"
                        >
                            <option value="ALL">Semua Status Jadwal</option>
                            <option value="SCHEDULED">Sudah Terjadwal</option>
                            <option value="UNSCHEDULED">Belum Terjadwal (Antrean)</option>
                        </select>
                    </div>

                    {/* Filter 2: Periode Bulan Terbang */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-primary" />
                            <span>Periode Terbang</span>
                        </label>
                        <select
                            value={periodFilter}
                            onChange={(e) => setPeriodFilter(e.target.value)}
                            className="w-full py-2 px-3 text-xs bg-background border border-border rounded-xl focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground cursor-pointer"
                        >
                            <option value="ALL">Semua Periode Terbang</option>
                            {availablePeriods.map((p) => (
                                <option key={p.key} value={p.key}>
                                    {p.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Filter 3: Status Paspor / Visa */}
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
                            <option value="PASSPORT_READY">Paspor Lengkap / Siap</option>
                            <option value="PASSPORT_PENDING">Belum Ada Paspor</option>
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
                            <option value="ALL">Semua Paket</option>
                            {pakets.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.nama_paket}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Filter 5: Status Pelunasan */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                            <span>Status Pembayaran</span>
                        </label>
                        <select
                            value={paymentStatusFilter}
                            onChange={(e) => setPaymentStatusFilter(e.target.value)}
                            className="w-full py-2 px-3 text-xs bg-background border border-border rounded-xl focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground cursor-pointer"
                        >
                            <option value="ALL">Semua Pembayaran</option>
                            <option value="LUNAS">Sudah Lunas (100%)</option>
                            <option value="BELUM_LUNAS">Belum Lunas / Cicilan</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* MODE 1: KLOTER GROUPS */}
            {viewMode === 'group' && (
                <div className="flex flex-col gap-6">
                    {scheduleKeys.map((dateKey) => {
                        const group = schedules[dateKey];
                        const isUnassigned = dateKey === 'Belum Ditentukan';
                        const isCollapsed = !!collapsedKloters[dateKey];

                        const currentPage = kloterPages[dateKey] || 1;
                        const totalPages = Math.ceil(group.length / kloterPageSize);
                        const displayedGroup = group.slice((currentPage - 1) * kloterPageSize, currentPage * kloterPageSize);

                        return (
                            <div
                                key={dateKey}
                                className="bg-card/70 border border-border/80 rounded-2xl p-6 shadow-xs flex flex-col gap-4 transition-all"
                            >
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 pb-3 border-b border-border/60">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2.5 rounded-xl ${isUnassigned ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' : 'bg-primary/10 text-primary'}`}>
                                            {isUnassigned ? <Clock className="w-5 h-5" /> : <Plane className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-base text-foreground">
                                                {isUnassigned ? 'Antrean Belum Plot Tanggal Terbang' : `Kloter Penerbangan: ${new Date(dateKey).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`}
                                            </h3>
                                            <p className="text-xs text-muted-foreground">
                                                Total: {group.length} Jamaah Terdaftar dalam Kloter Ini {totalPages > 1 && `(Halaman ${currentPage} dari ${totalPages})`}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 self-end sm:self-center">
                                        <button
                                            type="button"
                                            onClick={() => handleExportManifest(dateKey, group)}
                                            className="px-3 py-1.5 rounded-xl border border-border bg-card hover:bg-muted text-xs font-semibold text-foreground flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
                                            title="Export Manifest CSV"
                                        >
                                            <Download className="w-3.5 h-3.5 text-primary" />
                                            <span>Export Manifest</span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => toggleKloterCollapse(dateKey)}
                                            className="px-3 py-1.5 rounded-xl border border-border bg-muted/40 hover:bg-muted text-xs font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition cursor-pointer"
                                        >
                                            <span>{isCollapsed ? 'Tampilkan' : 'Sembunyikan'} ({group.length})</span>
                                            {isCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
                                        </button>
                                    </div>
                                </div>

                                {!isCollapsed && (
                                    <>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {displayedGroup.map((jm) => (
                                                <div
                                                    key={jm.id}
                                                    onClick={() => setSelectedJamaah(jm)}
                                                    className="p-4 rounded-xl border border-border/60 bg-muted/20 hover:bg-card hover:border-primary/50 transition-all flex flex-col gap-2 cursor-pointer group shadow-2xs"
                                                >
                                                    <div className="flex justify-between items-start">
                                                        <div className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                                                            {jm.nama_lengkap}
                                                        </div>
                                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${jm.nomor_paspor
                                                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                                                                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                                                            }`}>
                                                            {jm.nomor_paspor ? `Paspor: ${jm.nomor_paspor}` : 'Paspor Pending'}
                                                        </span>
                                                    </div>
                                                    <div className="text-xs text-primary font-medium">{jm.paket?.nama_paket}</div>
                                                    <div className="text-xs text-muted-foreground flex justify-between items-center pt-2 border-t border-border/40">
                                                        <span>HP: {jm.no_hp}</span>
                                                        <span>{jm.agen ? `Agen: ${jm.agen.name}` : 'Direct'}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Per-Kloter Pagination Controls */}
                                        {totalPages > 1 && (
                                            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-3 border-t border-border/50 text-xs">
                                                <span className="text-muted-foreground font-medium">
                                                    Menampilkan {(currentPage - 1) * kloterPageSize + 1} - {Math.min(currentPage * kloterPageSize, group.length)} dari {group.length} jamaah
                                                </span>
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        type="button"
                                                        disabled={currentPage === 1}
                                                        onClick={() => setKloterPages((prev) => ({ ...prev, [dateKey]: Math.max(1, currentPage - 1) }))}
                                                        className="px-2.5 py-1 rounded-lg border border-border bg-card hover:bg-muted text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                                                    >
                                                        Sebelumnya
                                                    </button>
                                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => {
                                                        if (pg === 1 || pg === totalPages || (pg >= currentPage - 1 && pg <= currentPage + 1)) {
                                                            return (
                                                                <button
                                                                    key={pg}
                                                                    type="button"
                                                                    onClick={() => setKloterPages((prev) => ({ ...prev, [dateKey]: pg }))}
                                                                    className={`w-7 h-7 rounded-lg text-xs font-bold transition cursor-pointer ${currentPage === pg
                                                                            ? 'bg-primary text-primary-foreground shadow-xs'
                                                                            : 'border border-border bg-card hover:bg-muted text-foreground'
                                                                        }`}
                                                                >
                                                                    {pg}
                                                                </button>
                                                            );
                                                        }
                                                        if (pg === 2 && currentPage > 3) {
                                                            return <span key="ellipsis-start" className="px-1 text-muted-foreground">...</span>;
                                                        }
                                                        if (pg === totalPages - 1 && currentPage < totalPages - 2) {
                                                            return <span key="ellipsis-end" className="px-1 text-muted-foreground">...</span>;
                                                        }
                                                        return null;
                                                    })}
                                                    <button
                                                        type="button"
                                                        disabled={currentPage === totalPages}
                                                        onClick={() => setKloterPages((prev) => ({ ...prev, [dateKey]: Math.min(totalPages, currentPage + 1) }))}
                                                        className="px-2.5 py-1 rounded-lg border border-border bg-card hover:bg-muted text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                                                    >
                                                        Selanjutnya
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        );
                    })}

                    {scheduleKeys.length === 0 && (
                        <div className="py-16 text-center text-sm text-muted-foreground bg-card/20 rounded-2xl border border-dashed border-border">
                            Tidak ada kloter jadwal yang cocok dengan kriteria pencarian.
                        </div>
                    )}
                </div>
            )}

            {/* MODE 2: TABEL MANIFEST LENGKAP */}
            {viewMode === 'table' && (
                <div className="flex flex-col gap-4">
                    <div className="overflow-hidden rounded-2xl border border-border/80 bg-card/70 backdrop-blur-md shadow-xs">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                    <tr className="border-b border-border/80 bg-muted/50 text-muted-foreground">
                                        <th className="px-5 py-3.5 font-bold">Nama Jamaah &amp; Kontak</th>
                                        <th className="px-5 py-3.5 font-bold">No. Paspor</th>
                                        <th className="px-5 py-3.5 font-bold">Paket Umroh / Haji</th>
                                        <th className="px-5 py-3.5 font-bold">Mitra Agen</th>
                                        <th className="px-5 py-3.5 font-bold">Jadwal Keberangkatan</th>
                                        <th className="px-5 py-3.5 font-bold text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/60">
                                    {jamaahTableData.map((jm) => (
                                        <tr
                                            key={jm.id}
                                            onClick={() => setSelectedJamaah(jm)}
                                            className="hover:bg-muted/30 transition-colors cursor-pointer"
                                        >
                                            <td className="px-5 py-3.5">
                                                <div className="font-bold text-sm text-foreground">{jm.nama_lengkap}</div>
                                                <div className="text-muted-foreground mt-0.5">HP: {jm.no_hp}</div>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                {jm.nomor_paspor ? (
                                                    <span className="font-mono font-bold text-foreground bg-muted/60 px-2 py-0.5 rounded border border-border/40">
                                                        {jm.nomor_paspor}
                                                    </span>
                                                ) : (
                                                    <span className="text-amber-600 dark:text-amber-400 italic">Belum Diisi</span>
                                                )}
                                            </td>
                                            <td className="px-5 py-3.5 font-semibold text-foreground">
                                                {jm.paket?.nama_paket || '-'}
                                            </td>
                                            <td className="px-5 py-3.5 text-muted-foreground">
                                                {jm.agen ? jm.agen.name : <span className="italic">Direct / Pusat</span>}
                                            </td>
                                            <td className="px-5 py-3.5">
                                                {jm.tanggal_keberangkatan ? (
                                                    <span className="font-bold text-primary flex items-center gap-1.5">
                                                        <Plane className="w-3.5 h-3.5" />
                                                        <span>
                                                            {new Date(jm.tanggal_keberangkatan).toLocaleDateString('id-ID', {
                                                                day: 'numeric',
                                                                month: 'short',
                                                                year: 'numeric',
                                                            })}
                                                        </span>
                                                    </span>
                                                ) : (
                                                    <span className="text-amber-600 dark:text-amber-400 font-medium">
                                                        Antrean (Belum Ada Tanggal)
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-5 py-3.5 text-center">
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedJamaah(jm);
                                                    }}
                                                    className="px-3 py-1 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground font-semibold rounded-lg transition cursor-pointer"
                                                >
                                                    Detail &amp; Plot
                                                </button>
                                            </td>
                                        </tr>
                                    ))}

                                    {jamaahTableData.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="py-12 text-center text-muted-foreground">
                                                Tidak ada data jamaah manifest.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <DataTablePagination
                        links={paginatedJamaah.links}
                        from={paginatedJamaah.from}
                        to={paginatedJamaah.to}
                        total={paginatedJamaah.total}
                        currentPage={paginatedJamaah.current_page}
                        lastPage={paginatedJamaah.last_page}
                    />
                </div>
            )}

            {/* DETAILING & RESCHEDULE DRAWER (SLIDE-OUT SHEET) */}
            <Sheet open={!!selectedJamaah} onOpenChange={(open) => { if (!open) setSelectedJamaah(null); }}>
                <SheetContent side="right" className="w-full sm:max-w-5xl md:w-1/2 flex flex-col justify-between">
                    <div className="flex flex-col gap-6 p-4 flex-1 overflow-y-auto">
                        <SheetHeader className="pb-4 border-b border-border/60">
                            <div className="flex justify-between items-start gap-4">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-primary uppercase tracking-wider">
                                            Rincian Manifest Jamaah &amp; Jadwal
                                        </span>
                                    </div>
                                    <SheetTitle className="text-2xl font-bold text-foreground mt-1">
                                        {selectedJamaah?.nama_lengkap}
                                    </SheetTitle>
                                    <SheetDescription className="text-xs text-muted-foreground mt-0.5">
                                        ID Jamaah: #{selectedJamaah?.id} • Paket: {selectedJamaah?.paket?.nama_paket}
                                    </SheetDescription>
                                </div>
                                <span
                                    className={`text-xs font-bold px-3 py-1.5 rounded-full border shrink-0 ${selectedJamaah?.tanggal_keberangkatan
                                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                                        }`}
                                >
                                    {selectedJamaah?.tanggal_keberangkatan ? 'Terjadwal' : 'Belum Terjadwal'}
                                </span>
                            </div>
                        </SheetHeader>

                        {/* Quick Reschedule / Assign Kloter Form */}
                        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 shadow-xs flex flex-col gap-3">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                                <Plane className="w-4 h-4" />
                                <span>Plot / Ubah Tanggal Keberangkatan (Kloter)</span>
                            </h4>
                            <form onSubmit={handleUpdateDeparture} className="flex flex-col sm:flex-row gap-3 items-end">
                                <div className="flex-1 w-full">
                                    <label className="block text-xs font-semibold text-muted-foreground mb-1">
                                        Tanggal Terbang / Kloter:
                                    </label>
                                    <input
                                        type="date"
                                        value={rescheduleDate}
                                        onChange={(e) => setRescheduleDate(e.target.value)}
                                        className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={isSubmittingSchedule}
                                    className="w-full sm:w-auto px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-xl hover:opacity-90 transition cursor-pointer flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-50"
                                >
                                    <Check className="w-3.5 h-3.5" />
                                    <span>{isSubmittingSchedule ? 'Menyimpan...' : 'Simpan Jadwal'}</span>
                                </button>
                            </form>
                        </div>

                        {/* Customer Info Card */}
                        <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-xs flex flex-col gap-3">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                Data Identitas, Paspor &amp; Pembina
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                <div className="flex items-center gap-2.5 text-muted-foreground">
                                    <Phone className="w-4 h-4 text-primary shrink-0" />
                                    <span>No. HP: <strong className="text-foreground">{selectedJamaah?.no_hp || '-'}</strong></span>
                                </div>
                                <div className="flex items-center gap-2.5 text-muted-foreground">
                                    <Mail className="w-4 h-4 text-primary shrink-0" />
                                    <span>Email: <strong className="text-foreground">{selectedJamaah?.email || '-'}</strong></span>
                                </div>
                                <div className="flex items-center gap-2.5 text-muted-foreground">
                                    <FileCheck className="w-4 h-4 text-primary shrink-0" />
                                    <span>No. Paspor: <strong className="text-foreground font-mono">{selectedJamaah?.nomor_paspor || 'Belum diisi'}</strong></span>
                                </div>
                                <div className="flex items-center gap-2.5 text-muted-foreground">
                                    <User className="w-4 h-4 text-primary shrink-0" />
                                    <span>Mitra Agen: <strong className="text-foreground">{selectedJamaah?.agen?.name || 'Pusat / Direct'}</strong></span>
                                </div>
                            </div>
                        </div>

                        {/* Verified Payment History */}
                        <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-xs flex flex-col gap-3">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                <Receipt className="w-4 h-4 text-primary" />
                                <span>Riwayat Pembayaran &amp; DP</span>
                            </h4>
                            <div className="flex flex-col gap-2">
                                {selectedJamaah?.pembayaran && selectedJamaah.pembayaran.length > 0 ? (
                                    selectedJamaah.pembayaran.map((p) => (
                                        <div key={p.id} className="p-3 bg-muted/30 rounded-xl border border-border/50 flex justify-between items-center text-xs">
                                            <div>
                                                <div className="font-bold text-foreground capitalize">{p.tipe_pembayaran}</div>
                                                <div className="text-[11px] text-muted-foreground">Status: {p.status_verifikasi}</div>
                                            </div>
                                            <div className="font-bold text-emerald-600 dark:text-emerald-400">
                                                {toRupiah(p.nominal)}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-xs text-muted-foreground italic">Belum ada riwayat pembayaran tercatat.</div>
                                )}
                            </div>
                        </div>

                        {/* Allocated Logistics Overview */}
                        {selectedJamaah?.inventaris_transaksi && selectedJamaah.inventaris_transaksi.length > 0 && (
                            <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-xs flex flex-col gap-3">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                    <Package className="w-4 h-4 text-primary" />
                                    <span>Alokasi Barang &amp; Perlengkapan</span>
                                </h4>
                                <div className="flex flex-wrap gap-1.5">
                                    {selectedJamaah.inventaris_transaksi.map((tx) => (
                                        <span key={tx.id} className="text-xs font-medium px-2.5 py-1 rounded-lg bg-muted/40 border border-border text-foreground flex items-center gap-1.5">
                                            <span>{tx.qty}x {tx.inventaris.nama_barang}</span>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Drawer Footer Actions */}
                    <SheetFooter className="p-4 border-t border-border/60 flex sm:justify-between items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setSelectedJamaah(null)}
                            className="px-4 py-2.5 border border-border rounded-xl text-xs font-semibold hover:bg-muted transition cursor-pointer"
                        >
                            Tutup Detail
                        </button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </PageLayout>
    );
}
