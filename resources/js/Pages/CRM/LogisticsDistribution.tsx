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
    Printer,
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
import ShippingPackageLabelModal, { PackageItemRow } from './Components/ShippingPackageLabelModal';

interface ItemDistributionRecord {
    id: number;
    inventaris_id: number;
    qty: number;
    status: 'Pending' | 'Shipped' | 'Delivered' | 'Handed_Over';
    delivered_at: string | null;
    shipped_at?: string | null;
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
    alamat_ktp?: string | null;
    alamat_domisili?: string | null;
    kota_asal?: string | null;
    created_at?: string;
    tanggal_keberangkatan?: string | null;
    status_logistik: 'Pending' | 'Ready_to_Pickup' | 'Shipped' | 'Handed_Over';
    ekspedisi_logistik?: string | null;
    no_resi_logistik?: string | null;
    tanggal_kirim_logistik?: string | null;
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

    const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards');
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
    const [shippingLabelCustomer, setShippingLabelCustomer] = useState<LogisticsCustomer | null>(null);
    const [receiverName, setReceiverName] = useState('');
    const [handoverNotes, setHandoverNotes] = useState('');
    const [confirmingDeliveryId, setConfirmingDeliveryId] = useState<number | null>(null);

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

    const handleConfirmDelivery = (jamaahId: number) => {
        const nowStr = new Date().toISOString();
        if (selectedCustomer && selectedCustomer.id === jamaahId) {
            // Only mark Shipped items as Delivered (Pending items stay Pending)
            const updatedDists = (selectedCustomer.item_distributions || []).map((d) =>
                d.status === 'Shipped'
                    ? { ...d, status: 'Delivered' as const, delivered_at: nowStr, receiver_name: receiverName || selectedCustomer.nama_lengkap }
                    : d
            );

            const hasPending = updatedDists.some((d) => d.status === 'Pending');
            const hasShipped = updatedDists.some((d) => d.status === 'Shipped');
            const allDone = !hasPending && !hasShipped && updatedDists.length > 0;

            setSelectedCustomer({
                ...selectedCustomer,
                item_distributions: updatedDists,
                status_logistik: allDone ? 'Handed_Over' : (hasShipped ? 'Shipped' : 'Ready_to_Pickup'),
                tanggal_serah_terima_logistik: allDone ? nowStr : selectedCustomer.tanggal_serah_terima_logistik,
            });
        }

        const postUrl = typeof route === 'function' && route().has?.('crm.logistics.confirm-delivery')
            ? route('crm.logistics.confirm-delivery', jamaahId)
            : `/crm/logistics/${jamaahId}/confirm-delivery`;

        router.post(
            postUrl,
            {
                receiver_name: receiverName || selectedCustomer?.nama_lengkap,
                notes: handoverNotes || 'Paket telah diterima dengan baik oleh jamaah.',
            },
            {
                preserveScroll: true,
                preserveState: true,
            }
        );
    };

    const items = logisticsList.data || [];
    const totalHandedOver = items.filter((i) => i.status_logistik === 'Handed_Over').length;
    const totalShipped = items.filter((i) => i.status_logistik === 'Shipped').length;
    const totalReady = items.filter((i) => i.status_logistik === 'Ready_to_Pickup' || i.status_logistik === 'Pending').length;

    return (
        <PageLayout
            title="Distribusi Logistik & Koper"
            breadcrumbParent="Operasional"
            breadcrumbPage="Distribusi Logistik & Koper"
            contentClass="p-6 md:p-8 flex flex-col gap-6 w-full max-w-none"
        >
            {/* Header Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        Distribusi Logistik &amp; Perlengkapan
                    </h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        Manajemen serah terima koper, pencetakan label pengiriman ekspedisi, dan checklist barang jamaah.
                    </p>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 bg-card rounded-lg border border-border flex items-start justify-between">
                    <div>
                        <div className="text-xs font-medium text-muted-foreground">Total Jamaah Terfilter</div>
                        <div className="text-2xl font-bold tracking-tight text-foreground mt-1">{logisticsList.total} Jamaah</div>
                    </div>
                    <div className="p-2.5 bg-muted text-muted-foreground rounded-lg shrink-0">
                        <Package className="w-5 h-5" />
                    </div>
                </div>
                <div className="p-5 bg-card rounded-lg border border-border flex items-start justify-between">
                    <div>
                        <div className="text-xs font-medium text-muted-foreground">Menunggu / Siap Diambil</div>
                        <div className="text-2xl font-bold tracking-tight text-amber-600 dark:text-amber-400 mt-1">{totalReady} Jamaah</div>
                    </div>
                    <div className="p-2.5 bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 rounded-lg shrink-0">
                        <Clock className="w-5 h-5" />
                    </div>
                </div>
                <div className="p-5 bg-card rounded-lg border border-border flex items-start justify-between">
                    <div>
                        <div className="text-xs font-medium text-muted-foreground">Sedang Dikirim</div>
                        <div className="text-2xl font-bold tracking-tight text-blue-600 dark:text-blue-400 mt-1">{totalShipped} Jamaah</div>
                    </div>
                    <div className="p-2.5 bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 rounded-lg shrink-0">
                        <Truck className="w-5 h-5" />
                    </div>
                </div>
                <div className="p-5 bg-card rounded-lg border border-border flex items-start justify-between">
                    <div>
                        <div className="text-xs font-medium text-muted-foreground">Telah Diterima (Selesai)</div>
                        <div className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 mt-1">{totalHandedOver} Jamaah</div>
                    </div>
                    <div className="p-2.5 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 rounded-lg shrink-0">
                        <CheckCircle2 className="w-5 h-5" />
                    </div>
                </div>
            </div>

            {/* Filter Control Center */}
            <div className="flex flex-col gap-3 bg-card p-4 rounded-lg border border-border">
                {/* Top Row: Search, Status Tabs & View Switcher */}
                <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Cari nama jamaah, NIK, No. HP, nama agen..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-3 py-1.5 text-xs bg-background border border-input rounded-md focus:outline-hidden focus:ring-1 focus:ring-primary focus:border-primary text-foreground placeholder:text-muted-foreground"
                        />
                    </div>

                    <div className="flex items-center gap-2 flex-wrap justify-between sm:justify-end">
                        {/* Status Penyerahan Tabs */}
                        <div className="flex items-center gap-1 p-1 bg-muted rounded-md border border-border flex-wrap">
                            {[
                                { id: 'ALL', label: 'Semua Status' },
                                { id: 'Ready_to_Pickup', label: 'Siap / Menunggu' },
                                { id: 'Shipped', label: 'Sedang Dikirim' },
                                { id: 'Handed_Over', label: 'Telah Diterima' },
                            ].map((st) => (
                                <button
                                    key={st.id}
                                    type="button"
                                    onClick={() => handleFilterChange(st.id)}
                                    className={`px-2.5 py-1 rounded text-xs font-medium transition cursor-pointer whitespace-nowrap ${
                                        filterStatus === st.id
                                            ? 'bg-background text-foreground shadow-2xs'
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    {st.label}
                                </button>
                            ))}
                        </div>

                        {/* View Switcher: Table ↔ Cards */}
                        <div className="flex items-center gap-1 p-1 bg-muted rounded-md border border-border">
                            <button
                                type="button"
                                onClick={() => setViewMode('table')}
                                className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition cursor-pointer ${
                                    viewMode === 'table'
                                        ? 'bg-background text-foreground shadow-2xs'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                                title="Tampilan Tabel"
                            >
                                <LayoutList className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline text-xs">Tabel</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setViewMode('cards')}
                                className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition cursor-pointer ${
                                    viewMode === 'cards'
                                        ? 'bg-background text-foreground shadow-2xs'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                                title="Tampilan Kartu Grid"
                            >
                                <LayoutGrid className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline text-xs">Kartu</span>
                            </button>
                        </div>

                        {activeFiltersCount > 0 && (
                            <button
                                type="button"
                                onClick={handleResetFilters}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-destructive/20 text-destructive hover:bg-destructive/10 text-xs font-medium transition cursor-pointer"
                                title="Reset Semua Filter"
                            >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span>Reset ({activeFiltersCount})</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Bottom Row: Detailed Operational Filters */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-3 border-t border-border text-xs">
                    {/* 1. Filter Paket Umroh */}
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-muted-foreground">
                            Paket Umroh
                        </label>
                        <select
                            value={paketFilter}
                            onChange={(e) => handlePaketChange(e.target.value)}
                            className="w-full text-xs bg-background border border-input rounded-md px-2.5 py-1.5 focus:outline-hidden focus:ring-1 focus:ring-primary focus:border-primary text-foreground cursor-pointer"
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
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-muted-foreground">
                            Agen Pembimbing
                        </label>
                        <select
                            value={agentFilter}
                            onChange={(e) => handleAgentChange(e.target.value)}
                            className="w-full text-xs bg-background border border-input rounded-md px-2.5 py-1.5 focus:outline-hidden focus:ring-1 focus:ring-primary focus:border-primary text-foreground cursor-pointer"
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
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-muted-foreground">
                            Kelengkapan Item
                        </label>
                        <select
                            value={fulfillmentFilter}
                            onChange={(e) => handleFulfillmentChange(e.target.value)}
                            className="w-full text-xs bg-background border border-input rounded-md px-2.5 py-1.5 focus:outline-hidden focus:ring-1 focus:ring-primary focus:border-primary text-foreground cursor-pointer"
                        >
                            <option value="ALL">Semua Kelengkapan</option>
                            <option value="full">Lengkap (100% Diserahkan)</option>
                            <option value="partial">Sebagian Diserahkan</option>
                            <option value="none">Belum Diambil (0%)</option>
                        </select>
                    </div>

                    {/* 4. Filter Status Pembayaran */}
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-muted-foreground">
                            Status Tagihan
                        </label>
                        <select
                            value={paymentFilter}
                            onChange={(e) => handlePaymentChange(e.target.value)}
                            className="w-full text-xs bg-background border border-input rounded-md px-2.5 py-1.5 focus:outline-hidden focus:ring-1 focus:ring-primary focus:border-primary text-foreground cursor-pointer"
                        >
                            <option value="ALL">Semua Status Bayar</option>
                            <option value="lunas">Lunas (100%)</option>
                            <option value="dp">Baru Uang Muka (DP)</option>
                            <option value="unpaid">Belum Ada Pembayaran</option>
                        </select>
                    </div>

                    {/* 5. Filter Rentang Jadwal Keberangkatan */}
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-muted-foreground">
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
                <div className="overflow-hidden rounded-lg border border-border bg-card">
                    <div className="overflow-x-auto low-scrollbar">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-border bg-muted/40 text-xs font-medium text-muted-foreground">
                                    <th className="px-4 py-3">Data Jamaah</th>
                                    <th className="px-4 py-3">Paket &amp; Jadwal</th>
                                    <th className="px-4 py-3">Agen</th>
                                    <th className="px-4 py-3">Status Logistik</th>
                                    <th className="px-4 py-3">Progres Barang</th>
                                    <th className="px-4 py-3 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border text-xs text-foreground">
                                {items.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                                            <div className="flex flex-col items-center justify-center gap-1.5">
                                                <Package className="w-8 h-8 opacity-40 text-muted-foreground mb-1" />
                                                <span className="font-semibold text-foreground text-sm">Tidak ada data distribusi logistik</span>
                                                <span className="text-xs text-muted-foreground">
                                                    Coba sesuaikan kata kunci pencarian atau kriteria filter di atas.
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

                                        const isFullyDelivered = customer.status_logistik === 'Handed_Over';
                                        const isShipped = customer.status_logistik === 'Shipped';
                                        const totalItemsCount = allPackageItems.length;
                                        const deliveredCount = isFullyDelivered
                                            ? totalItemsCount
                                            : customer.item_distributions?.filter((d) => d.status === 'Shipped' || d.status === 'Delivered' || d.status === 'Handed_Over').length || 0;

                                        return (
                                            <tr key={customer.id} className="hover:bg-muted/30 transition-colors">
                                                {/* Data Jamaah & Kontak */}
                                                <td className="px-4 py-3">
                                                    <div className="font-medium text-foreground">
                                                        {customer.nama_lengkap}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-muted-foreground text-[11px] mt-0.5">
                                                        <span className="font-mono">
                                                            {customer.no_hp || '-'}
                                                        </span>
                                                        {customer.nomor_paspor && (
                                                            <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-[10px]">
                                                                Paspor: {customer.nomor_paspor}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Paket & Jadwal Terbang */}
                                                <td className="px-4 py-3">
                                                    <div className="font-medium text-foreground">
                                                        {customer.paket?.nama_paket || 'Belum Pilih Paket'}
                                                    </div>
                                                    <div className="text-muted-foreground text-[11px] mt-0.5">
                                                        {customer.tanggal_keberangkatan
                                                            ? new Date(customer.tanggal_keberangkatan).toLocaleDateString('id-ID', {
                                                                  day: 'numeric',
                                                                  month: 'short',
                                                                  year: 'numeric',
                                                              })
                                                            : 'Belum Ada Jadwal'}
                                                    </div>
                                                </td>

                                                {/* Agen Pembimbing */}
                                                <td className="px-4 py-3">
                                                    <div className="text-foreground">
                                                        {customer.agen ? customer.agen.name : 'Kantor Pusat / Mandiri'}
                                                    </div>
                                                </td>

                                                {/* Status & Pengiriman */}
                                                <td className="px-4 py-3">
                                                    <div className="flex flex-col gap-1 items-start">
                                                        {isFullyDelivered ? (
                                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">
                                                                <Check className="w-3 h-3" />
                                                                Telah Diterima
                                                            </span>
                                                        ) : isShipped ? (
                                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400">
                                                                <Truck className="w-3 h-3" />
                                                                Sedang Dikirim
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400">
                                                                <Clock className="w-3 h-3" />
                                                                Siap Diambil
                                                            </span>
                                                        )}
                                                        {customer.no_resi_logistik && (
                                                            <span className="text-[10px] font-mono text-muted-foreground">
                                                                Resi: {customer.no_resi_logistik} ({customer.ekspedisi_logistik || 'Ekspedisi'})
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Progres Checklist Barang */}
                                                <td className="px-4 py-3">
                                                    <div className="flex flex-col gap-1 min-w-[130px]">
                                                        <div className="flex items-center justify-between text-[11px]">
                                                            <span className="text-muted-foreground">Item Diterima:</span>
                                                            <span className="font-semibold tabular-nums text-foreground">
                                                                {deliveredCount}/{totalItemsCount}
                                                            </span>
                                                        </div>
                                                        <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                                                            <div
                                                                className={`h-full rounded-full transition-all duration-300 ${
                                                                    isFullyDelivered
                                                                        ? 'bg-emerald-500'
                                                                        : isShipped
                                                                        ? 'bg-blue-500'
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
                                                <td className="px-4 py-3 text-right">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        <button
                                                            type="button"
                                                            onClick={() => setShippingLabelCustomer(customer)}
                                                            className="p-1.5 border border-border bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-md transition cursor-pointer"
                                                            title="Cetak Label Pengiriman / Packing Koper"
                                                        >
                                                            <Printer className="w-3.5 h-3.5" />
                                                        </button>

                                                        {isShipped && (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleConfirmDelivery(customer.id)}
                                                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium transition cursor-pointer"
                                                                title="Konfirmasi Paket Diterima (POD)"
                                                            >
                                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                                                <span>Diterima</span>
                                                            </button>
                                                        )}

                                                        <button
                                                            type="button"
                                                            onClick={() => setSelectedCustomer(customer)}
                                                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-border bg-background hover:bg-muted text-xs font-medium text-foreground transition cursor-pointer"
                                                        >
                                                            <CheckSquare className="w-3.5 h-3.5 text-primary" />
                                                            <span>Checklist</span>
                                                        </button>
                                                    </div>
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
                        <div className="col-span-full p-12 text-center bg-card rounded-lg border border-border text-muted-foreground">
                            <Package className="w-8 h-8 opacity-40 mx-auto mb-2" />
                            <span className="font-semibold text-sm block text-foreground">Tidak ada data distribusi logistik</span>
                            <span className="text-xs text-muted-foreground">
                                Coba sesuaikan kata kunci pencarian atau kriteria filter di atas.
                            </span>
                        </div>
                    ) : (
                        items.map((customer) => {
                            const allPackageItems =
                                customer.paket?.inventaris && customer.paket.inventaris.length > 0
                                    ? customer.paket.inventaris
                                    : inventarisList;

                            const isFullyDelivered = customer.status_logistik === 'Handed_Over';
                            const isShipped = customer.status_logistik === 'Shipped';
                            const totalItemsCount = allPackageItems.length;
                            const deliveredCount = isFullyDelivered
                                ? totalItemsCount
                                : customer.item_distributions?.filter((d) => d.status === 'Shipped' || d.status === 'Delivered' || d.status === 'Handed_Over').length || 0;

                            return (
                                <div
                                    key={customer.id}
                                    className="bg-card rounded-lg border border-border p-4 hover:border-primary/40 transition-colors flex flex-col justify-between gap-3.5"
                                >
                                    {/* Top Card Header */}
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="space-y-0.5">
                                            <h3 className="font-semibold text-sm text-foreground leading-tight">
                                                {customer.nama_lengkap}
                                            </h3>
                                            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                                <span className="font-mono">
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
                                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium shrink-0 ${
                                                isFullyDelivered
                                                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400'
                                                    : isShipped
                                                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400'
                                                    : 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400'
                                            }`}
                                        >
                                            <span
                                                className={`w-1.5 h-1.5 rounded-full ${
                                                    isFullyDelivered
                                                        ? 'bg-emerald-500'
                                                        : isShipped
                                                        ? 'bg-blue-500'
                                                        : 'bg-amber-500'
                                                }`}
                                            />
                                            {isFullyDelivered ? 'Telah Diterima' : isShipped ? 'Sedang Dikirim' : 'Siap Diambil'}
                                        </span>
                                    </div>

                                    {/* Middle Info Details */}
                                    <div className="p-3 bg-muted/30 rounded-md space-y-1.5 text-xs border border-border">
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="text-muted-foreground">Paket:</span>
                                            <span className="font-medium text-foreground truncate text-right">
                                                {customer.paket?.nama_paket || 'Belum Pilih Paket'}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="text-muted-foreground">Keberangkatan:</span>
                                            <span className="font-medium text-foreground">
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
                                            <span className="text-muted-foreground">Agen:</span>
                                            <span className="text-foreground truncate">
                                                {customer.agen ? customer.agen.name : 'Kantor Pusat / Mandiri'}
                                            </span>
                                        </div>
                                        {customer.no_resi_logistik && (
                                            <div className="flex items-center justify-between gap-2 pt-1 border-t border-border text-[11px]">
                                                <span className="text-muted-foreground">
                                                    {customer.ekspedisi_logistik || 'Ekspedisi'}:
                                                </span>
                                                <span className="font-mono font-medium text-foreground">
                                                    {customer.no_resi_logistik}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Progress Bar & Mini Checklist Summary */}
                                    <div className="space-y-1.5">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-muted-foreground text-[11px]">
                                                Kelengkapan:
                                            </span>
                                            <span className="font-semibold text-foreground tabular-nums">
                                                {deliveredCount}/{totalItemsCount} ({totalItemsCount > 0 ? Math.round((deliveredCount / totalItemsCount) * 100) : 0}%)
                                            </span>
                                        </div>
                                        <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-300 ${
                                                    isFullyDelivered
                                                        ? 'bg-emerald-500'
                                                        : isShipped
                                                        ? 'bg-blue-500'
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
                                                const dist = customer.item_distributions?.find(
                                                    (d) => d.inventaris_id === item.id
                                                );
                                                const isDel = dist?.status === 'Delivered' || dist?.status === 'Handed_Over' || isFullyDelivered;
                                                const isShip = !isDel && dist?.status === 'Shipped';
                                                return (
                                                    <span
                                                        key={item.id}
                                                        className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded font-medium border ${
                                                            isDel
                                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/50'
                                                                : isShip
                                                                ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900/50'
                                                                : 'bg-muted text-muted-foreground border-border'
                                                        }`}
                                                    >
                                                        <span
                                                            className={`w-1 h-1 rounded-full ${
                                                                isDel ? 'bg-emerald-500' : isShip ? 'bg-blue-500' : 'bg-muted-foreground/60'
                                                            }`}
                                                        />
                                                        <span>{item.nama_barang}</span>
                                                    </span>
                                                );
                                            })}
                                            {allPackageItems.length > 3 && (
                                                <span className="text-[10px] px-1.5 py-0.5 rounded text-muted-foreground bg-muted font-medium">
                                                    +{allPackageItems.length - 3} item
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action Button */}
                                    <div className="flex items-center gap-1.5 pt-1">
                                        <button
                                            type="button"
                                            onClick={() => setShippingLabelCustomer(customer)}
                                            className="p-1.5 rounded-md border border-border bg-secondary hover:bg-secondary/80 text-secondary-foreground transition flex items-center justify-center shrink-0 cursor-pointer"
                                            title="Cetak Label Pengiriman / Packing Koper"
                                        >
                                            <Printer className="w-3.5 h-3.5" />
                                        </button>

                                        {isShipped && (
                                            <button
                                                type="button"
                                                onClick={() => handleConfirmDelivery(customer.id)}
                                                className="py-1 px-2.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium transition flex items-center justify-center gap-1 cursor-pointer shrink-0"
                                                title="Konfirmasi Paket Telah Sampai & Diterima"
                                            >
                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                                <span>Diterima</span>
                                            </button>
                                        )}

                                        <button
                                            type="button"
                                            onClick={() => setSelectedCustomer(customer)}
                                            className="flex-1 py-1.5 px-3 rounded-md border border-border bg-background hover:bg-muted text-xs font-medium text-foreground transition flex items-center justify-center gap-1.5 cursor-pointer"
                                        >
                                            <CheckSquare className="w-3.5 h-3.5 text-primary" />
                                            <span>Checklist</span>
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            )}

            {/* Pagination */}
            <div className="p-4 rounded-lg border border-border flex flex-col sm:flex-row items-center justify-between gap-4 bg-card">
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
                    <div className="p-5 border-b border-border bg-muted/20">
                        <SheetHeader className="text-left space-y-1">
                            <div className="flex items-center justify-between">
                                <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-secondary text-secondary-foreground">
                                    Checklist Serah Terima Perlengkapan
                                </span>
                            </div>
                            <SheetTitle className="text-xl font-bold tracking-tight text-foreground mt-2">
                                {selectedCustomer?.nama_lengkap}
                            </SheetTitle>
                            <SheetDescription className="text-xs text-muted-foreground">
                                Paket: {selectedCustomer?.paket?.nama_paket || '-'} &bull; No. HP: {selectedCustomer?.no_hp || '-'}
                            </SheetDescription>
                        </SheetHeader>
                    </div>

                    <div className="flex-1 overflow-y-auto p-5 space-y-5 low-scrollbar">
                        {/* Summary Box */}
                        <div className="p-4 rounded-lg bg-card border border-border flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <span className="text-xs text-muted-foreground block">Status Serah Terima</span>
                                <span className="text-sm font-semibold text-foreground flex items-center gap-1.5 mt-0.5">
                                    {selectedCustomer?.status_logistik === 'Handed_Over' ? (
                                        <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                            <CheckCircle2 className="w-4 h-4" /> Telah Diterima Lengkap
                                        </span>
                                    ) : selectedCustomer?.status_logistik === 'Shipped' ? (
                                        <span className="text-blue-600 dark:text-blue-400 flex items-center gap-1">
                                            <Truck className="w-4 h-4" /> Sedang Dikirim ({selectedCustomer.ekspedisi_logistik || 'Ekspedisi'})
                                        </span>
                                    ) : (
                                        <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                                            <Clock className="w-4 h-4" /> Sebagian / Menunggu Diambil
                                        </span>
                                    )}
                                </span>
                                {selectedCustomer?.no_resi_logistik && (
                                    <span className="text-xs font-mono text-muted-foreground block mt-1">
                                        No. Resi: <strong>{selectedCustomer.no_resi_logistik}</strong>
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <button
                                    type="button"
                                    onClick={() => setShippingLabelCustomer(selectedCustomer)}
                                    className="px-2.5 py-1.5 rounded-md text-xs font-medium border border-border bg-secondary hover:bg-secondary/80 text-secondary-foreground transition cursor-pointer flex items-center gap-1.5"
                                >
                                    <Printer className="w-3.5 h-3.5" />
                                    <span>Cetak Label</span>
                                </button>
                                {selectedCustomer?.status_logistik === 'Shipped' ? (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (!selectedCustomer) return;
                                            if (confirmingDeliveryId === selectedCustomer.id) {
                                                setConfirmingDeliveryId(null);
                                                handleConfirmDelivery(selectedCustomer.id);
                                            } else {
                                                setConfirmingDeliveryId(selectedCustomer.id);
                                            }
                                        }}
                                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition cursor-pointer flex items-center gap-1 ${
                                            confirmingDeliveryId === selectedCustomer?.id
                                                ? 'bg-amber-500 hover:bg-amber-600 text-white'
                                                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                        }`}
                                    >
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                        <span>{confirmingDeliveryId === selectedCustomer?.id ? 'Yakin Diterima?' : 'Konfirmasi Diterima'}</span>
                                    </button>
                                ) : selectedCustomer?.status_logistik === 'Handed_Over' ? (
                                    <div className="px-2.5 py-1.5 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 flex items-center gap-1">
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                        <span>Selesai</span>
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => selectedCustomer && handleAllHandover(selectedCustomer.id)}
                                        className="px-3 py-1.5 rounded-md text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition cursor-pointer"
                                    >
                                        Tandai Semua Selesai
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Receiver Form */}
                        <div className="p-4 rounded-lg bg-muted/40 border border-border space-y-3">
                            <h4 className="text-xs font-medium text-foreground">
                                Data Penerima &amp; Catatan
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs font-medium text-muted-foreground">
                                        Nama Pengambil / Penerima
                                    </label>
                                    <input
                                        type="text"
                                        placeholder={selectedCustomer?.nama_lengkap || 'Nama Pengambil'}
                                        value={receiverName}
                                        onChange={(e) => setReceiverName(e.target.value)}
                                        className="w-full text-xs bg-background border border-input rounded-md px-2.5 py-1.5 focus:outline-hidden focus:ring-1 focus:ring-primary focus:border-primary text-foreground"
                                    />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs font-medium text-muted-foreground">
                                        Catatan Penyerahan
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Contoh: Koper & kain ihram diserahkan via kurir"
                                        value={handoverNotes}
                                        onChange={(e) => setHandoverNotes(e.target.value)}
                                        className="w-full text-xs bg-background border border-input rounded-md px-2.5 py-1.5 focus:outline-hidden focus:ring-1 focus:ring-primary focus:border-primary text-foreground"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Items Checklist Cards */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <h4 className="text-xs font-medium text-foreground">
                                    Rincian Barang Paket
                                </h4>
                                <span className="text-[11px] text-muted-foreground">
                                    Klik baris barang untuk ubah status penyerahan
                                </span>
                            </div>

                            {(() => {
                                const packageItems =
                                    selectedCustomer?.paket?.inventaris && selectedCustomer.paket.inventaris.length > 0
                                        ? selectedCustomer.paket.inventaris
                                        : inventarisList;

                                if (!packageItems || packageItems.length === 0) {
                                    return (
                                        <div className="p-8 text-center text-xs text-muted-foreground border border-dashed border-border rounded-lg">
                                            Belum ada item barang yang dialokasikan pada paket ini.
                                        </div>
                                    );
                                }

                                const isOverallHandedOver = selectedCustomer?.status_logistik === 'Handed_Over';

                                return (
                                    <div className="space-y-2">
                                        {packageItems.map((inv) => {
                                            const dist = selectedCustomer?.item_distributions?.find(
                                                (d) => d.inventaris_id === inv.id
                                            );
                                            const isDelivered = dist?.status === 'Delivered' || dist?.status === 'Handed_Over' || (isOverallHandedOver && !dist);
                                            const isShippedItem = !isDelivered && dist?.status === 'Shipped';
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
                                                            isDelivered ? 'Delivered' : isShippedItem ? 'Shipped' : 'Pending'
                                                        )
                                                    }
                                                    className={`p-3 rounded-lg border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                                                        isDelivered
                                                            ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40'
                                                            : isShippedItem
                                                            ? 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/40'
                                                            : 'bg-card hover:bg-muted/40 border-border'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div
                                                            className={`p-1.5 rounded-md ${
                                                                isDelivered
                                                                    ? 'bg-emerald-600 text-white'
                                                                    : isShippedItem
                                                                    ? 'bg-blue-600 text-white'
                                                                    : 'bg-muted text-muted-foreground'
                                                            }`}
                                                        >
                                                            {isDelivered ? (
                                                                <CheckSquare className="w-4 h-4" />
                                                            ) : isShippedItem ? (
                                                                <Truck className="w-4 h-4" />
                                                            ) : (
                                                                <Square className="w-4 h-4" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="font-medium text-xs text-foreground flex items-center gap-2">
                                                                <span>{inv.nama_barang}</span>
                                                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-muted text-muted-foreground">
                                                                    Qty: {itemQty} {itemSatuan}
                                                                </span>
                                                            </div>
                                                            <p className="text-[10px] text-muted-foreground mt-0.5">
                                                                {isDelivered && dist?.delivered_at
                                                                    ? `Diserahkan: ${new Date(dist.delivered_at).toLocaleDateString('id-ID')} (Penerima: ${dist.receiver_name || selectedCustomer?.nama_lengkap})`
                                                                    : isDelivered
                                                                    ? `Diserahkan Lengkap (Penerima: ${selectedCustomer?.nama_lengkap})`
                                                                    : isShippedItem && dist?.shipped_at
                                                                    ? `Sedang Dikirim: ${new Date(dist.shipped_at).toLocaleDateString('id-ID')}`
                                                                    : isShippedItem
                                                                    ? `Sedang Dikirim via ${selectedCustomer?.ekspedisi_logistik || 'Ekspedisi'}`
                                                                    : 'Belum diserahkan ke jamaah'}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <span
                                                            className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                                                                isDelivered
                                                                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400'
                                                                    : isShippedItem
                                                                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400'
                                                                    : 'bg-muted text-muted-foreground'
                                                            }`}
                                                        >
                                                            {isDelivered ? 'Diterima' : isShippedItem ? 'Mengirim' : 'Belum'}
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
                            className="w-full py-2 rounded-md text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition cursor-pointer"
                        >
                            Tutup Checklist
                        </button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>

            {/* Modal: Cetak Label Pengiriman / Packing Koper */}
            <ShippingPackageLabelModal
                open={!!shippingLabelCustomer}
                onOpenChange={(open) => !open && setShippingLabelCustomer(null)}
                customer={shippingLabelCustomer}
                tenantName="Travel Umroh & Haji"
                selectedItems={(() => {
                    if (!shippingLabelCustomer) return [];
                    const packageItems =
                        shippingLabelCustomer.paket?.inventaris && shippingLabelCustomer.paket.inventaris.length > 0
                            ? shippingLabelCustomer.paket.inventaris
                            : inventarisList;

                    return packageItems.map((inv) => {
                        const dist = shippingLabelCustomer.item_distributions?.find(
                            (d) => d.inventaris_id === inv.id
                        );
                        const isDelivered = dist?.status === 'Delivered' || dist?.status === 'Handed_Over' || shippingLabelCustomer.status_logistik === 'Handed_Over';
                        const qty = 'pivot' in inv && inv.pivot ? inv.pivot.qty : 1;
                        const satuan = 'satuan' in inv && inv.satuan ? inv.satuan : 'Pcs';
                        return {
                            id: inv.id,
                            nama_barang: inv.nama_barang,
                            sku: 'sku' in inv ? inv.sku : undefined,
                            satuan,
                            qty,
                            is_delivered: isDelivered,
                            status: isDelivered ? 'Delivered' : dist?.status || 'Pending',
                        };
                    });
                })()}
            />
        </PageLayout>
    );
}
