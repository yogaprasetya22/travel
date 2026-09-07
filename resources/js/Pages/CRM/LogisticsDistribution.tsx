import React, { useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import { PageProps } from '@/Types';
import PageLayout from '@/Components/Layouts/PageLayout';
import {
    Truck,
    PackageCheck,
    Search,
    CheckCircle2,
    Clock,
    UserCheck,
    ArrowRight,
    Package,
    Calendar,
    Phone,
    Mail,
    User,
    Check,
    ExternalLink,
    ShieldCheck,
    Layers,
    Receipt,
    CheckSquare,
    Square,
    RotateCcw,
    Filter,
    LayoutList,
    LayoutGrid,
} from 'lucide-react';
import DataTablePagination, { PaginatedData } from '@/Components/DataTablePagination';
import PerPageSelector from '@/Components/PerPageSelector';
import { useDebounce } from '@/hooks/use-debounce';
import { DatePickerWithRange } from '@/Components/DatePickerWithRange';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter,
} from '@/Components/ui/sheet';

interface ItemDistributionRecord {
    id: number;
    inventaris_id: number;
    qty: number;
    status: 'Pending' | 'Delivered';
    delivered_at: string | null;
    receiver_name: string | null;
    notes: string | null;
    inventaris: {
        id: number;
        nama_barang: string;
        sku?: string;
        satuan?: string;
    };
}

interface LogisticsCustomer {
    id: number;
    nama_lengkap: string;
    nik?: string | null;
    no_hp: string;
    email?: string | null;
    nomor_paspor?: string | null;
    kota_asal?: string | null;
    created_at?: string;
    tanggal_keberangkatan?: string | null;
    status_logistik: 'Pending' | 'Ready_to_Pickup' | 'Handed_Over';
    tanggal_serah_terima_logistik: string | null;
    paket: {
        id: number;
        nama_paket: string;
        harga?: number;
        inventaris?: Array<{
            id: number;
            nama_barang: string;
            pivot: {
                qty: number;
            };
        }>;
    };
    crm_stage?: {
        nama_tahap: string;
    } | null;
    agen: {
        id?: number;
        name: string;
        email?: string;
    } | null;
    item_distributions?: ItemDistributionRecord[];
    inventaris_transaksi: Array<{
        id: number;
        qty: number;
        created_at: string;
        inventaris: {
            id: number;
            nama_barang: string;
            kode_sku?: string;
            kategori?: string;
            stok?: number;
        };
    }>;
    pembayaran?: Array<{
        id: number;
        nominal: number;
        tipe_pembayaran: string;
        status_verifikasi: string;
    }>;
}

interface LogisticsProps extends PageProps {
    logisticsList: PaginatedData<LogisticsCustomer>;
    inventarisList?: Array<{
        id: number;
        nama_barang: string;
        sku: string;
        satuan: string;
        stok_tersedia: number;
    }>;
    pakets?: Array<{
        id: number;
        nama_paket: string;
        harga?: number;
    }>;
    agents?: Array<{
        id: number;
        name: string;
        email?: string;
    }>;
    filters?: {
        search?: string;
        status?: string;
        paket_id?: string | number;
        agen_id?: string | number;
        fulfillment?: string;
        payment_status?: string;
        start_date?: string;
        end_date?: string;
        per_page?: number;
    };
}

export default function LogisticsDistribution({
    logisticsList,
    inventarisList = [],
    pakets = [],
    agents = [],
    filters = {},
}: LogisticsProps) {
    const { auth } = usePage<PageProps>().props;

    const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const debouncedSearchQuery = useDebounce(searchQuery, 300);
    const [filterStatus, setFilterStatus] = useState<string>(filters.status || 'ALL');
    const [paketFilter, setPaketFilter] = useState<string>(String(filters.paket_id || 'ALL'));
    const [agentFilter, setAgentFilter] = useState<string>(String(filters.agen_id || 'ALL'));
    const [fulfillmentFilter, setFulfillmentFilter] = useState<string>(filters.fulfillment || 'ALL');
    const [paymentFilter, setPaymentFilter] = useState<string>(filters.payment_status || 'ALL');

    const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
        if (filters.start_date) {
            return {
                from: new Date(filters.start_date),
                to: filters.end_date ? new Date(filters.end_date) : undefined,
            };
        }
        return undefined;
    });

    const [selectedCustomer, setSelectedCustomer] = useState<LogisticsCustomer | null>(null);
    const [receiverName, setReceiverName] = useState('');
    const [handoverNotes, setHandoverNotes] = useState('');

    // Sync selectedCustomer whenever logisticsList prop refreshes
    React.useEffect(() => {
        if (selectedCustomer) {
            const updated = logisticsList.data.find((c) => c.id === selectedCustomer.id);
            if (updated) {
                setSelectedCustomer(updated);
            }
        }
    }, [logisticsList]);

    const executeFilterQuery = (newParams: Record<string, any>) => {
        const currentParams = {
            search: searchQuery || undefined,
            status: filterStatus !== 'ALL' ? filterStatus : undefined,
            paket_id: paketFilter !== 'ALL' ? paketFilter : undefined,
            agen_id: agentFilter !== 'ALL' ? agentFilter : undefined,
            fulfillment: fulfillmentFilter !== 'ALL' ? fulfillmentFilter : undefined,
            payment_status: paymentFilter !== 'ALL' ? paymentFilter : undefined,
            start_date: dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : undefined,
            end_date: dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : undefined,
            per_page: filters.per_page,
            ...newParams,
        };

        // Remove undefined / empty values
        Object.keys(currentParams).forEach((key) => {
            if (currentParams[key as keyof typeof currentParams] === undefined || currentParams[key as keyof typeof currentParams] === 'ALL') {
                delete currentParams[key as keyof typeof currentParams];
            }
        });

        router.get(route('crm.logistics.index'), currentParams, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    // Sync debounced search
    React.useEffect(() => {
        if (debouncedSearchQuery !== (filters.search || '')) {
            executeFilterQuery({ search: debouncedSearchQuery || undefined });
        }
    }, [debouncedSearchQuery]);

    const handleFilterChange = (status: string) => {
        setFilterStatus(status);
        executeFilterQuery({ status });
    };

    const handlePaketChange = (val: string) => {
        setPaketFilter(val);
        executeFilterQuery({ paket_id: val });
    };

    const handleAgentChange = (val: string) => {
        setAgentFilter(val);
        executeFilterQuery({ agen_id: val });
    };

    const handleFulfillmentChange = (val: string) => {
        setFulfillmentFilter(val);
        executeFilterQuery({ fulfillment: val });
    };

    const handlePaymentChange = (val: string) => {
        setPaymentFilter(val);
        executeFilterQuery({ payment_status: val });
    };

    const handleDateRangeChange = (range: DateRange | undefined) => {
        setDateRange(range);
        executeFilterQuery({
            start_date: range?.from ? format(range.from, 'yyyy-MM-dd') : undefined,
            end_date: range?.to ? format(range.to, 'yyyy-MM-dd') : undefined,
        });
    };

    const handleResetFilters = () => {
        setSearchQuery('');
        setFilterStatus('ALL');
        setPaketFilter('ALL');
        setAgentFilter('ALL');
        setFulfillmentFilter('ALL');
        setPaymentFilter('ALL');
        setDateRange(undefined);

        router.get(
            route('crm.logistics.index'),
            { per_page: filters.per_page },
            { preserveState: true, preserveScroll: true, replace: true }
        );
    };

    const countActiveFilters = () => {
        let count = 0;
        if (searchQuery) count++;
        if (filterStatus !== 'ALL') count++;
        if (paketFilter !== 'ALL') count++;
        if (agentFilter !== 'ALL') count++;
        if (fulfillmentFilter !== 'ALL') count++;
        if (paymentFilter !== 'ALL') count++;
        if (dateRange?.from) count++;
        return count;
    };

    const activeFiltersCount = countActiveFilters();

    const handleAllHandover = (jamaahId: number) => {
        if (!confirm('Serahkan seluruh paket perlengkapan kepada jamaah ini?')) return;

        const nowStr = new Date().toISOString();
        if (selectedCustomer && selectedCustomer.id === jamaahId) {
            const allItems =
                selectedCustomer.paket?.inventaris && selectedCustomer.paket.inventaris.length > 0
                    ? selectedCustomer.paket.inventaris
                    : inventarisList;

            const newDists: ItemDistributionRecord[] = allItems.map((inv) => ({
                id: Date.now() + inv.id,
                inventaris_id: inv.id,
                qty: 1,
                status: 'Delivered',
                delivered_at: nowStr,
                receiver_name: receiverName || selectedCustomer.nama_lengkap,
                notes: handoverNotes || 'Serah terima paket lengkap.',
                inventaris: {
                    id: inv.id,
                    nama_barang: inv.nama_barang,
                },
            }));

            setSelectedCustomer({
                ...selectedCustomer,
                item_distributions: newDists,
                status_logistik: 'Handed_Over',
                tanggal_serah_terima_logistik: nowStr,
            });
        }

        router.post(
            route('crm.logistics.handover', jamaahId),
            {
                receiver_name: receiverName || selectedCustomer?.nama_lengkap,
                notes: handoverNotes,
            },
            {
                preserveScroll: true,
                preserveState: true,
            }
        );
    };

    const handleToggleItem = (jamaahId: number, inventarisId: number, currentStatus: string) => {
        const nextStatus = currentStatus === 'Delivered' ? 'Pending' : 'Delivered';
        const nowStr = new Date().toISOString();

        if (selectedCustomer && selectedCustomer.id === jamaahId) {
            const existingDists = selectedCustomer.item_distributions ? [...selectedCustomer.item_distributions] : [];
            const existingIdx = existingDists.findIndex((d) => d.inventaris_id === inventarisId);

            if (existingIdx >= 0) {
                existingDists[existingIdx] = {
                    ...existingDists[existingIdx],
                    status: nextStatus,
                    delivered_at: nextStatus === 'Delivered' ? nowStr : null,
                    receiver_name: receiverName || selectedCustomer.nama_lengkap,
                };
            } else {
                const invItem = (selectedCustomer.paket?.inventaris || inventarisList).find((i) => i.id === inventarisId);
                existingDists.push({
                    id: Date.now(),
                    inventaris_id: inventarisId,
                    qty: 1,
                    status: nextStatus,
                    delivered_at: nextStatus === 'Delivered' ? nowStr : null,
                    receiver_name: receiverName || selectedCustomer.nama_lengkap,
                    notes: handoverNotes || null,
                    inventaris: {
                        id: inventarisId,
                        nama_barang: invItem?.nama_barang || 'Barang',
                    },
                });
            }

            const totalDist = existingDists.length;
            const pendingCount = existingDists.filter((d) => d.status === 'Pending').length;
            const newStatusLogistik =
                totalDist > 0 && pendingCount === 0
                    ? 'Handed_Over'
                    : pendingCount > 0
                    ? 'Ready_to_Pickup'
                    : selectedCustomer.status_logistik;

            setSelectedCustomer({
                ...selectedCustomer,
                item_distributions: existingDists,
                status_logistik: newStatusLogistik,
                tanggal_serah_terima_logistik:
                    newStatusLogistik === 'Handed_Over' ? nowStr : selectedCustomer.tanggal_serah_terima_logistik,
            });
        }

        router.post(
            route('crm.logistics.item-handover', jamaahId),
            {
                inventaris_id: inventarisId,
                status: nextStatus,
                receiver_name: receiverName || selectedCustomer?.nama_lengkap,
                notes: handoverNotes,
            },
            {
                preserveScroll: true,
                preserveState: true,
            }
        );
    };

    const items = logisticsList.data || [];
    const totalHandedOver = items.filter((i) => i.status_logistik === 'Handed_Over').length;
    const totalReady = items.filter((i) => i.status_logistik === 'Ready_to_Pickup' || i.status_logistik === 'Pending').length;

    return (
        <PageLayout
            title="Distribusi Logistik & Koper"
            breadcrumbParent="Operasional"
            breadcrumbPage="Distribusi Logistik & Koper"
            contentClass="p-6 md:p-8 flex flex-col gap-6 w-full max-w-none"
        >
            {/* Header Banner */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-card/60 backdrop-blur-md p-6 rounded-2xl border border-border/80 shadow-xs">
                <div>
                    <div className="flex items-center gap-2.5">
                        <div className="h-8 w-1.5 rounded-full bg-primary" />
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                            Distribusi Logistik, Koper &amp; Perlengkapan
                        </h1>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 ml-4">
                        Checklist serah terima koper, tas paspor, mukena/ihram per jamaah dengan filter jadwal terbang &amp; status pelunasan.
                    </p>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-card rounded-2xl border border-border shadow-xs flex items-center gap-3">
                    <div className="p-3 bg-primary/10 text-primary rounded-xl">
                        <Package className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="text-xs text-muted-foreground">Total Jamaah Terfilter</div>
                        <div className="text-xl font-bold text-foreground">{logisticsList.total} Jamaah</div>
                    </div>
                </div>
                <div className="p-4 bg-card rounded-2xl border border-border shadow-xs flex items-center gap-3">
                    <div className="p-3 bg-amber-500/10 text-amber-600 rounded-xl">
                        <Clock className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="text-xs text-muted-foreground">Menunggu Serah Terima</div>
                        <div className="text-xl font-bold text-amber-600">{totalReady} Jamaah</div>
                    </div>
                </div>
                <div className="p-4 bg-card rounded-2xl border border-border shadow-xs flex items-center gap-3">
                    <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-xl">
                        <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="text-xs text-muted-foreground">Telah Diserahterimakan</div>
                        <div className="text-xl font-bold text-emerald-600">{totalHandedOver} Jamaah</div>
                    </div>
                </div>
            </div>

            {/* Filter Control Center */}
            <div className="flex flex-col gap-4 bg-card/60 backdrop-blur-md p-5 rounded-2xl border border-border/80 shadow-xs">
                {/* Top Row: Search, Status Tabs & View Switcher */}
                <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Cari nama jamaah, NIK, No. HP, nama agen..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 text-xs bg-background border border-border rounded-xl focus:outline-hidden focus:ring-2 focus:ring-primary/20 text-foreground"
                        />
                    </div>

                    <div className="flex items-center gap-2 flex-wrap justify-between sm:justify-end">
                        {/* Status Penyerahan Tabs */}
                        <div className="flex items-center gap-1.5 p-1 bg-muted/60 rounded-xl border border-border">
                            {[
                                { id: 'ALL', label: 'Semua Status' },
                                { id: 'Ready_to_Pickup', label: 'Siap / Belum Selesai' },
                                { id: 'Handed_Over', label: 'Telah Diserahkan' },
                            ].map((st) => (
                                <button
                                    key={st.id}
                                    onClick={() => handleFilterChange(st.id)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                                        filterStatus === st.id
                                            ? 'bg-primary text-primary-foreground shadow-xs'
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    {st.label}
                                </button>
                            ))}
                        </div>

                        {/* View Switcher: Table ↔ Cards */}
                        <div className="flex items-center gap-1 p-1 bg-muted/60 rounded-xl border border-border">
                            <button
                                type="button"
                                onClick={() => setViewMode('table')}
                                className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                                    viewMode === 'table'
                                        ? 'bg-background text-foreground shadow-xs'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                                title="Tampilan Tabel"
                            >
                                <LayoutList className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline text-[11px]">Tabel</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setViewMode('cards')}
                                className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                                    viewMode === 'cards'
                                        ? 'bg-background text-foreground shadow-xs'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                                title="Tampilan Kartu Grid"
                            >
                                <LayoutGrid className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline text-[11px]">Kartu</span>
                            </button>
                        </div>

                        {activeFiltersCount > 0 && (
                            <button
                                type="button"
                                onClick={handleResetFilters}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-background hover:bg-muted text-xs font-semibold text-muted-foreground hover:text-foreground transition cursor-pointer"
                                title="Reset Semua Filter"
                            >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span>Reset ({activeFiltersCount})</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Bottom Row: Detailed Operational Filters */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-3 border-t border-border/60 text-xs">
                    {/* 1. Filter Paket Umroh */}
                    <div className="space-y-1">
                        <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                            <Package className="w-3.5 h-3.5 text-primary" />
                            Paket Umroh
                        </label>
                        <select
                            value={paketFilter}
                            onChange={(e) => handlePaketChange(e.target.value)}
                            className="w-full text-xs bg-background border border-border rounded-xl px-3 py-1.5 focus:outline-hidden focus:ring-1 focus:ring-primary text-foreground"
                        >
                            <option value="ALL">Semua Paket ({pakets.length})</option>
                            {pakets.map((p) => (
                                <option key={p.id} value={String(p.id)}>
                                    {p.nama_paket}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* 2. Filter Agen Pembimbing */}
                    <div className="space-y-1">
                        <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                            <UserCheck className="w-3.5 h-3.5 text-primary" />
                            Agen Pembimbing
                        </label>
                        <select
                            value={agentFilter}
                            onChange={(e) => handleAgentChange(e.target.value)}
                            className="w-full text-xs bg-background border border-border rounded-xl px-3 py-1.5 focus:outline-hidden focus:ring-1 focus:ring-primary text-foreground"
                        >
                            <option value="ALL">Semua Agen ({agents.length})</option>
                            {agents.map((a) => (
                                <option key={a.id} value={String(a.id)}>
                                    {a.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* 3. Filter Kelengkapan Checklist */}
                    <div className="space-y-1">
                        <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                            <CheckSquare className="w-3.5 h-3.5 text-primary" />
                            Kelengkapan Item
                        </label>
                        <select
                            value={fulfillmentFilter}
                            onChange={(e) => handleFulfillmentChange(e.target.value)}
                            className="w-full text-xs bg-background border border-border rounded-xl px-3 py-1.5 focus:outline-hidden focus:ring-1 focus:ring-primary text-foreground"
                        >
                            <option value="ALL">Semua Kelengkapan</option>
                            <option value="full">Lengkap (100% Diserahkan)</option>
                            <option value="partial">Sebagian Diserahkan</option>
                            <option value="none">Belum Diambil (0%)</option>
                        </select>
                    </div>

                    {/* 4. Filter Status Pembayaran */}
                    <div className="space-y-1">
                        <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                            <Receipt className="w-3.5 h-3.5 text-primary" />
                            Status Tagihan
                        </label>
                        <select
                            value={paymentFilter}
                            onChange={(e) => handlePaymentChange(e.target.value)}
                            className="w-full text-xs bg-background border border-border rounded-xl px-3 py-1.5 focus:outline-hidden focus:ring-1 focus:ring-primary text-foreground"
                        >
                            <option value="ALL">Semua Status Bayar</option>
                            <option value="lunas">Lunas (100%)</option>
                            <option value="dp">Baru Uang Muka (DP)</option>
                            <option value="unpaid">Belum Ada Pembayaran</option>
                        </select>
                    </div>

                    {/* 5. Filter Rentang Jadwal Keberangkatan */}
                    <div className="space-y-1">
                        <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-primary" />
                            Jadwal Keberangkatan
                        </label>
                        <DatePickerWithRange
                            dateRange={dateRange}
                            onChange={handleDateRangeChange}
                            placeholder="Pilih rentang tanggal..."
                        />
                    </div>
                </div>
            </div>

            {/* Content Display: Table OR Card Grid */}
            {viewMode === 'table' ? (
                /* Table View */
                <div className="overflow-hidden rounded-2xl border border-border/80 bg-card/70 backdrop-blur-md shadow-xs">
                    <div className="overflow-x-auto low-scrollbar">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-border/80 bg-muted/50 text-xs font-bold text-foreground uppercase tracking-wider">
                                    <th className="px-6 py-4">Data Jamaah &amp; Kontak</th>
                                    <th className="px-6 py-4">Paket &amp; Jadwal Terbang</th>
                                    <th className="px-6 py-4">Agen Pembimbing</th>
                                    <th className="px-6 py-4">Status &amp; Tanda Terima</th>
                                    <th className="px-6 py-4">Progres Checklist Barang</th>
                                    <th className="px-6 py-4 text-center">Aksi Serah Terima</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/60 text-xs text-foreground">
                                {items.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <Package className="w-8 h-8 opacity-40 text-muted-foreground" />
                                                <span className="font-semibold text-sm">Tidak ada data distribusi logistik</span>
                                                <span className="text-xs text-muted-foreground">
                                                    Coba sesuaikan kata kunci pencarian atau filter di atas.
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    items.map((customer) => {
                                        const allPackageItems =
                                            customer.paket?.inventaris && customer.paket.inventaris.length > 0
                                                ? customer.paket.inventaris
                                                : inventarisList;

                                        const deliveredCount =
                                            customer.item_distributions?.filter((d) => d.status === 'Delivered').length || 0;
                                        const totalItemsCount = allPackageItems.length;
                                        const isFullyDelivered =
                                            customer.status_logistik === 'Handed_Over' ||
                                            (totalItemsCount > 0 && deliveredCount === totalItemsCount);

                                        return (
                                            <tr key={customer.id} className="hover:bg-muted/40 transition-colors">
                                                {/* Data Jamaah & Kontak */}
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col gap-0.5">
                                                        <span className="font-bold text-sm text-foreground">
                                                            {customer.nama_lengkap}
                                                        </span>
                                                        <div className="flex items-center gap-2 text-muted-foreground text-[11px]">
                                                            <span className="flex items-center gap-1 font-mono">
                                                                <Phone className="w-3 h-3" />
                                                                {customer.no_hp || '-'}
                                                            </span>
                                                            {customer.nomor_paspor && (
                                                                <span className="font-mono bg-muted px-1.5 py-0.2 rounded text-[10px]">
                                                                    Paspor: {customer.nomor_paspor}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Paket & Jadwal Terbang */}
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col gap-0.5">
                                                        <span className="font-semibold text-foreground">
                                                            {customer.paket?.nama_paket || 'Belum Pilih Paket'}
                                                        </span>
                                                        <span className="text-muted-foreground text-[11px] flex items-center gap-1">
                                                            <Calendar className="w-3 h-3 text-primary" />
                                                            {customer.tanggal_keberangkatan
                                                                ? new Date(customer.tanggal_keberangkatan).toLocaleDateString('id-ID', {
                                                                      day: 'numeric',
                                                                      month: 'short',
                                                                      year: 'numeric',
                                                                  })
                                                                : 'Belum Ada Tanggal'}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Agen Pembimbing */}
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-1.5 text-muted-foreground">
                                                        <User className="w-3.5 h-3.5 text-primary" />
                                                        <span className="font-medium text-foreground">
                                                            {customer.agen ? customer.agen.name : 'Kantor Pusat / Mandiri'}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Status & Tanda Terima */}
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col gap-1 items-start">
                                                        {isFullyDelivered ? (
                                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                                                                <Check className="w-3.5 h-3.5" />
                                                                Telah Diserahkan
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                                                                <Clock className="w-3.5 h-3.5" />
                                                                Siap Diambil
                                                            </span>
                                                        )}
                                                        {customer.tanggal_serah_terima_logistik && (
                                                            <span className="text-[10px] text-muted-foreground">
                                                                Diserahkan:{' '}
                                                                {new Date(customer.tanggal_serah_terima_logistik).toLocaleDateString('id-ID')}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Progres Checklist Barang */}
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col gap-1.5 min-w-[140px]">
                                                        <div className="flex items-center justify-between text-[11px]">
                                                            <span className="font-semibold text-muted-foreground">Item Diterima:</span>
                                                            <span className="font-bold text-foreground">
                                                                {deliveredCount}/{totalItemsCount} Barang
                                                            </span>
                                                        </div>
                                                        <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                                                            <div
                                                                className={`h-full rounded-full transition-all duration-300 ${
                                                                    isFullyDelivered
                                                                        ? 'bg-emerald-500'
                                                                        : deliveredCount > 0
                                                                        ? 'bg-amber-500'
                                                                        : 'bg-muted-foreground/30'
                                                                }`}
                                                                style={{
                                                                    width: `${
                                                                        totalItemsCount > 0
                                                                            ? Math.round((deliveredCount / totalItemsCount) * 100)
                                                                            : 0
                                                                    }%`,
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Aksi Serah Terima */}
                                                <td className="px-6 py-4 text-center">
                                                    <button
                                                        onClick={() => setSelectedCustomer(customer)}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-card hover:bg-muted text-xs font-semibold text-foreground transition shadow-2xs cursor-pointer"
                                                    >
                                                        <CheckSquare className="w-3.5 h-3.5 text-primary" />
                                                        <span>Checklist Item</span>
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                /* Card Grid View */
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {items.length === 0 ? (
                        <div className="col-span-full p-12 text-center bg-card/60 rounded-2xl border border-border/80 text-muted-foreground">
                            <Package className="w-10 h-10 opacity-40 mx-auto mb-2" />
                            <span className="font-semibold text-sm block text-foreground">Tidak ada data distribusi logistik</span>
                            <span className="text-xs text-muted-foreground">
                                Coba sesuaikan kata kunci pencarian atau filter di atas.
                            </span>
                        </div>
                    ) : (
                        items.map((customer) => {
                            const allPackageItems =
                                customer.paket?.inventaris && customer.paket.inventaris.length > 0
                                    ? customer.paket.inventaris
                                    : inventarisList;

                            const deliveredCount =
                                customer.item_distributions?.filter((d) => d.status === 'Delivered').length || 0;
                            const totalItemsCount = allPackageItems.length;
                            const isFullyDelivered =
                                customer.status_logistik === 'Handed_Over' ||
                                (totalItemsCount > 0 && deliveredCount === totalItemsCount);

                            return (
                                <div
                                    key={customer.id}
                                    className="bg-card/70 backdrop-blur-md rounded-2xl border border-border/80 p-5 shadow-xs hover:border-primary/40 transition-all flex flex-col justify-between gap-4"
                                >
                                    {/* Top Card Header */}
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="space-y-1">
                                            <h3 className="font-bold text-base text-foreground leading-tight">
                                                {customer.nama_lengkap}
                                            </h3>
                                            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                                <span className="font-mono flex items-center gap-1">
                                                    <Phone className="w-3 h-3 text-slate-400" />
                                                    {customer.no_hp || '-'}
                                                </span>
                                                {customer.nomor_paspor && (
                                                    <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-[10px]">
                                                        {customer.nomor_paspor}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <span
                                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold shrink-0 border ${
                                                isFullyDelivered
                                                    ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                                                    : 'bg-amber-500/10 text-amber-600 border-amber-500/30'
                                            }`}
                                        >
                                            <span
                                                className={`w-1.5 h-1.5 rounded-full ${
                                                    isFullyDelivered ? 'bg-emerald-500' : 'bg-amber-500'
                                                }`}
                                            />
                                            {isFullyDelivered ? 'Selesai' : 'Siap Diambil'}
                                        </span>
                                    </div>

                                    {/* Middle Info Details */}
                                    <div className="p-3 bg-muted/30 rounded-xl space-y-2 text-xs border border-border/50">
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="text-muted-foreground text-[11px]">Paket:</span>
                                            <span className="font-semibold text-foreground truncate text-right">
                                                {customer.paket?.nama_paket || 'Belum Pilih Paket'}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="text-muted-foreground text-[11px]">Keberangkatan:</span>
                                            <span className="font-medium text-foreground flex items-center gap-1">
                                                <Calendar className="w-3 h-3 text-primary" />
                                                {customer.tanggal_keberangkatan
                                                    ? new Date(customer.tanggal_keberangkatan).toLocaleDateString('id-ID', {
                                                          day: 'numeric',
                                                          month: 'short',
                                                          year: 'numeric',
                                                      })
                                                    : 'Belum Ada Jadwal'}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="text-muted-foreground text-[11px]">Agen:</span>
                                            <span className="text-foreground font-medium truncate">
                                                {customer.agen ? customer.agen.name : 'Kantor Pusat / Mandiri'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Progress Bar & Mini Checklist Summary */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-muted-foreground text-[11px] font-medium">
                                                Kelengkapan Barang:
                                            </span>
                                            <span className="font-bold text-foreground font-mono">
                                                {deliveredCount}/{totalItemsCount} ({totalItemsCount > 0 ? Math.round((deliveredCount / totalItemsCount) * 100) : 0}%)
                                            </span>
                                        </div>
                                        <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-300 ${
                                                    isFullyDelivered
                                                        ? 'bg-emerald-500'
                                                        : deliveredCount > 0
                                                        ? 'bg-amber-500'
                                                        : 'bg-muted-foreground/30'
                                                }`}
                                                style={{
                                                    width: `${
                                                        totalItemsCount > 0
                                                            ? Math.round((deliveredCount / totalItemsCount) * 100)
                                                            : 0
                                                    }%`,
                                                }}
                                            />
                                        </div>

                                        {/* Mini Chips */}
                                        <div className="flex flex-wrap gap-1 pt-1">
                                            {allPackageItems.slice(0, 3).map((item) => {
                                                const isDel = customer.item_distributions?.some(
                                                    (d) => d.inventaris_id === item.id && d.status === 'Delivered'
                                                );
                                                return (
                                                    <span
                                                        key={item.id}
                                                        className={`text-[10px] px-2 py-0.5 rounded-md font-medium border ${
                                                            isDel
                                                                ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                                                                : 'bg-muted text-muted-foreground border-border'
                                                        }`}
                                                    >
                                                        {isDel ? '✓ ' : ''}
                                                        {item.nama_barang}
                                                    </span>
                                                );
                                            })}
                                            {allPackageItems.length > 3 && (
                                                <span className="text-[10px] px-1.5 py-0.5 rounded-md text-muted-foreground bg-muted font-medium">
                                                    +{allPackageItems.length - 3} item
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action Button */}
                                    <button
                                        type="button"
                                        onClick={() => setSelectedCustomer(customer)}
                                        className="w-full py-2 px-3 rounded-xl border border-border bg-card hover:bg-muted text-xs font-bold text-foreground transition flex items-center justify-center gap-2 shadow-2xs cursor-pointer"
                                    >
                                        <CheckSquare className="w-3.5 h-3.5 text-primary" />
                                        <span>Checklist Serah Terima</span>
                                    </button>
                                </div>
                            );
                        })
                    )}
                </div>
            )}

            {/* Pagination */}
            <div className="p-4 rounded-2xl border border-border/80 flex flex-col sm:flex-row items-center justify-between gap-4 bg-card/60 backdrop-blur-md shadow-xs">
                <PerPageSelector
                    value={filters.per_page || 15}
                    onChange={(val: number) => executeFilterQuery({ per_page: val })}
                />
                <DataTablePagination
                    links={logisticsList.links}
                    from={logisticsList.from}
                    to={logisticsList.to}
                    total={logisticsList.total}
                    currentPage={logisticsList.current_page}
                    lastPage={logisticsList.last_page}
                />
            </div>

            {/* Checklist Drawer Per Jamaah */}
            <Sheet open={!!selectedCustomer} onOpenChange={(open) => !open && setSelectedCustomer(null)}>
                <SheetContent side="right" className="w-full sm:max-w-2xl p-0 overflow-hidden flex flex-col bg-background border-l border-border z-50">
                    <div className="p-6 border-b border-border/80 bg-muted/20">
                        <SheetHeader className="text-left space-y-1">
                            <div className="flex items-center justify-between">
                                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                                    Checklist Serah Terima Perlengkapan
                                </span>
                            </div>
                            <SheetTitle className="text-xl font-bold text-foreground mt-2">
                                {selectedCustomer?.nama_lengkap}
                            </SheetTitle>
                            <SheetDescription className="text-xs text-muted-foreground">
                                Paket: {selectedCustomer?.paket?.nama_paket || '-'} &bull; No. HP: {selectedCustomer?.no_hp || '-'}
                            </SheetDescription>
                        </SheetHeader>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-6 low-scrollbar">
                        {/* Summary Box */}
                        <div className="p-4 rounded-2xl bg-card border border-border shadow-xs flex items-center justify-between">
                            <div>
                                <span className="text-xs text-muted-foreground block">Status Serah Terima Umum</span>
                                <span className="text-sm font-bold text-foreground">
                                    {selectedCustomer?.status_logistik === 'Handed_Over'
                                        ? 'Telah Lengkap Diserahkan'
                                        : 'Sebagian / Menunggu Diambil'}
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={() => selectedCustomer && handleAllHandover(selectedCustomer.id)}
                                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition shadow-xs cursor-pointer"
                            >
                                Tandai Semua Selesai
                            </button>
                        </div>

                        {/* Receiver Form */}
                        <div className="p-4 rounded-2xl bg-muted/40 border border-border/80 space-y-3">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-primary">
                                Data Penerima &amp; Catatan
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                <div>
                                    <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                                        Nama Pengambil / Penerima
                                    </label>
                                    <input
                                        type="text"
                                        placeholder={selectedCustomer?.nama_lengkap || 'Nama Pengambil'}
                                        value={receiverName}
                                        onChange={(e) => setReceiverName(e.target.value)}
                                        className="w-full text-xs bg-background border border-border rounded-xl px-3 py-1.5 focus:outline-hidden focus:ring-1 focus:ring-primary text-foreground"
                                    />
                                </div>
                                <div>
                                    <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                                        Catatan Penyerahan
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Contoh: Koper & kain ihram diserahkan via kurir"
                                        value={handoverNotes}
                                        onChange={(e) => setHandoverNotes(e.target.value)}
                                        className="w-full text-xs bg-background border border-border rounded-xl px-3 py-1.5 focus:outline-hidden focus:ring-1 focus:ring-primary text-foreground"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Items Checklist Cards */}
                        <div className="space-y-3">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center justify-between">
                                <span>Rincian Barang Paket</span>
                                <span className="text-[11px] text-muted-foreground font-normal">
                                    Klik tombol checklist untuk toggle status penyerahan
                                </span>
                            </h4>

                            {(() => {
                                const packageItems =
                                    selectedCustomer?.paket?.inventaris && selectedCustomer.paket.inventaris.length > 0
                                        ? selectedCustomer.paket.inventaris
                                        : inventarisList;

                                if (!packageItems || packageItems.length === 0) {
                                    return (
                                        <div className="p-8 text-center text-xs text-muted-foreground border border-dashed border-border rounded-2xl">
                                            Belum ada item barang yang dialokasikan pada paket ini.
                                        </div>
                                    );
                                }

                                return (
                                    <div className="space-y-2">
                                        {packageItems.map((inv) => {
                                            const dist = selectedCustomer?.item_distributions?.find(
                                                (d) => d.inventaris_id === inv.id
                                            );
                                            const isDelivered = dist?.status === 'Delivered';
                                            const itemQty = 'pivot' in inv && inv.pivot ? inv.pivot.qty : 1;
                                            const itemSatuan = 'satuan' in inv && inv.satuan ? inv.satuan : 'Pcs';

                                            return (
                                                <div
                                                    key={inv.id}
                                                    onClick={() =>
                                                        selectedCustomer &&
                                                        handleToggleItem(
                                                            selectedCustomer.id,
                                                            inv.id,
                                                            dist?.status || 'Pending'
                                                        )
                                                    }
                                                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                                                        isDelivered
                                                            ? 'bg-emerald-500/10 border-emerald-500/30'
                                                            : 'bg-card hover:bg-muted/50 border-border'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div
                                                            className={`p-2 rounded-xl ${
                                                                isDelivered
                                                                    ? 'bg-emerald-500 text-white'
                                                                    : 'bg-muted text-muted-foreground'
                                                            }`}
                                                        >
                                                            {isDelivered ? (
                                                                <CheckSquare className="w-4 h-4" />
                                                            ) : (
                                                                <Square className="w-4 h-4" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-xs text-foreground flex items-center gap-2">
                                                                <span>{inv.nama_barang}</span>
                                                                <span className="text-[10px] font-normal px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                                                                    Qty: {itemQty} {itemSatuan}
                                                                </span>
                                                            </div>
                                                            <p className="text-[10px] text-muted-foreground mt-0.5">
                                                                {isDelivered && dist?.delivered_at
                                                                    ? `Diserahkan: ${new Date(dist.delivered_at).toLocaleDateString('id-ID')} (Penerima: ${dist.receiver_name || selectedCustomer?.nama_lengkap})`
                                                                    : 'Belum diserahkan ke jamaah'}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <span
                                                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                                                isDelivered
                                                                    ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                                                                    : 'bg-muted text-muted-foreground'
                                                            }`}
                                                        >
                                                            {isDelivered ? 'Diterima' : 'Belum'}
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                );
                            })()}
                        </div>
                    </div>

                    <SheetFooter className="p-4 border-t border-border bg-muted/20">
                        <button
                            type="button"
                            onClick={() => setSelectedCustomer(null)}
                            className="w-full py-2.5 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition shadow-xs cursor-pointer"
                        >
                            Tutup Checklist
                        </button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </PageLayout>
    );
}
