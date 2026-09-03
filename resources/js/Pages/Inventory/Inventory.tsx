import * as React from "react"
import { useForm, router } from "@inertiajs/react"
import PageLayout from "@/Components/Layouts/PageLayout"
import TextInput from "@/Components/TextInput"
import InputLabel from "@/Components/InputLabel"
import InputError from "@/Components/InputError"
import PrimaryButton from "@/Components/PrimaryButton"
import CurrencyInput, { toRupiah, unformatRupiah } from "@/Components/CurrencyInput"
import { inventarisSchema, zodErrors } from "@/lib/schemas"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter,
} from "@/Components/ui/sheet"
import DataTablePagination, { PaginatedData } from "@/Components/DataTablePagination"
import PerPageSelector from "@/Components/PerPageSelector"
import { useDebounce } from "@/hooks/use-debounce"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/Components/ui/tabs"
import {
    Boxes,
    PackageCheck,
    AlertTriangle,
    BadgePercent,
    Plus,
    Search,
    RefreshCw,
    SlidersHorizontal,
    ArrowDownLeft,
    ArrowUpRight,
    Tag,
    MapPin,
    DollarSign,
    Layers,
} from "lucide-react"

interface InventoryItem {
    id: number
    sku?: string | null
    nama_barang: string
    kategori: string
    satuan: string
    harga_pokok: number
    stok_tersedia: number
    stok_minimum: number
    lokasi_rak?: string | null
    created_at: string
}

interface TransactionLog {
    id: number
    qty: number
    tipe: "IN" | "OUT"
    alasan?: string | null
    created_at: string
    inventaris?: { nama_barang: string; sku?: string }
    jamaah?: { nama_lengkap: string }
    creator?: { name: string }
}

interface Metrics {
    total_sku: number
    total_units: number
    total_asset_value: number
    critical_count: number
}

interface Props {
    items: PaginatedData<InventoryItem>
    logs: PaginatedData<TransactionLog>
    metrics: Metrics
    filters: {
        search: string
        status: string
        items_per_page: number
        logs_per_page: number
        log_search: string
    }
}

export default function Inventory({ items, logs, metrics, filters }: Props) {
    const [activeTab, setActiveTab] = React.useState<"items" | "logs">("items")
    const [isAddOpen, setIsAddOpen] = React.useState(false)
    const [editingItem, setEditingItem] = React.useState<InventoryItem | null>(null)
    const [adjustingItem, setAdjustingItem] = React.useState<InventoryItem | null>(null)

    // Filter states
    const [searchQuery, setSearchQuery] = React.useState(filters.search || "")
    const [statusFilter, setStatusFilter] = React.useState(filters.status || "ALL")
    const [logSearchQuery, setLogSearchQuery] = React.useState(filters.log_search || "")

    const debouncedSearch = useDebounce(searchQuery, 350)
    const debouncedLogSearch = useDebounce(logSearchQuery, 350)

    const isInitialMount = React.useRef(true)

    React.useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false
            return
        }

        if (activeTab === "items") {
            router.get(
                route("inventaris.index"),
                {
                    search: debouncedSearch,
                    status: statusFilter,
                    items_per_page: items.per_page,
                },
                {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                }
            )
        } else {
            router.get(
                route("inventaris.index"),
                {
                    log_search: debouncedLogSearch,
                    logs_per_page: logs.per_page,
                },
                {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                }
            )
        }
    }, [debouncedSearch, statusFilter, debouncedLogSearch])

    const itemList = items.data || []
    const logList = logs.data || []

    // Form Add
    const addForm = useForm({
        nama_barang: "",
        sku: "",
        kategori: "Perlengkapan",
        satuan: "Pcs",
        harga_pokok: 0,
        stok_tersedia: 0,
        stok_minimum: 5,
        lokasi_rak: "Gudang Utama - Rak A",
    })

    // Form Edit
    const editForm = useForm({
        nama_barang: "",
        sku: "",
        kategori: "Perlengkapan",
        satuan: "Pcs",
        harga_pokok: 0,
        stok_minimum: 5,
        lokasi_rak: "",
    })

    // Form Quick Restock / Stock Out Adjustment
    const adjustForm = useForm({
        tipe: "IN" as "IN" | "OUT",
        qty: 1,
        alasan: "Restock Pembelian Baru",
    })

    const handleAddSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        const clientErrors = zodErrors(inventarisSchema, addForm.data)
        if (Object.keys(clientErrors).length > 0) {
            addForm.setError(clientErrors as any)
            return
        }
        addForm.post(route("inventaris.store"), {
            onSuccess: () => {
                addForm.reset()
                setIsAddOpen(false)
            },
        })
    }

    const handleEditClick = (item: InventoryItem) => {
        setEditingItem(item)
        editForm.setData({
            nama_barang: item.nama_barang,
            sku: item.sku || "",
            kategori: item.kategori || "Perlengkapan",
            satuan: item.satuan || "Pcs",
            harga_pokok: item.harga_pokok || 0,
            stok_minimum: item.stok_minimum,
            lokasi_rak: item.lokasi_rak || "",
        })
    }

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!editingItem) return
        const clientErrors = zodErrors(inventarisSchema, editForm.data)
        if (Object.keys(clientErrors).length > 0) {
            editForm.setError(clientErrors as any)
            return
        }
        editForm.put(route("inventaris.update", editingItem.id), {
            onSuccess: () => {
                setEditingItem(null)
            },
        })
    }

    const handleAdjustSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!adjustingItem) return
        adjustForm.post(route("inventaris.adjust", adjustingItem.id), {
            onSuccess: () => {
                setAdjustingItem(null)
                adjustForm.reset()
            },
        })
    }

    return (
        <PageLayout
            title="Inventaris & Logistik"
            breadcrumbParent="Inventaris / Logistik"
            breadcrumbPage="Stok Perlengkapan"
            contentClass="p-6 md:p-8 flex flex-col gap-6 w-full max-w-none"
        >
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card/60 backdrop-blur-md p-6 rounded-2xl border border-border/80 shadow-xs">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">Inventaris &amp; Logistik Terintegrasi</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Sistem manajemen stok perlengkapan jamaah (koper, kain ihram, buku doa), pelacakan HPP, dan mutasi barang otomatis.
                    </p>
                </div>
                <button
                    onClick={() => setIsAddOpen(true)}
                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-xs hover:opacity-90 transition cursor-pointer shrink-0"
                >
                    <Plus className="w-4 h-4" />
                    <span>Daftarkan Barang Baru</span>
                </button>
            </div>

            {/* 4 Summary ERP KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-card/70 border border-border/80 rounded-2xl p-5 shadow-xs flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <Boxes className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-xs font-semibold text-muted-foreground">Total Master SKU</div>
                        <div className="text-2xl font-extrabold text-foreground mt-0.5">{metrics.total_sku} <span className="text-xs font-normal text-muted-foreground">Item</span></div>
                    </div>
                </div>

                <div className="bg-card/70 border border-border/80 rounded-2xl p-5 shadow-xs flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
                        <Layers className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-xs font-semibold text-muted-foreground">Total Kuantitas Fisik</div>
                        <div className="text-2xl font-extrabold text-foreground mt-0.5">{metrics.total_units.toLocaleString('id-ID')} <span className="text-xs font-normal text-muted-foreground">Unit</span></div>
                    </div>
                </div>

                <div className="bg-card/70 border border-border/80 rounded-2xl p-5 shadow-xs flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                        <DollarSign className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-xs font-semibold text-muted-foreground">Estimasi Nilai Aset Stok</div>
                        <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">{toRupiah(metrics.total_asset_value)}</div>
                    </div>
                </div>

                <div className="bg-card/70 border border-border/80 rounded-2xl p-5 shadow-xs flex items-center gap-4">
                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${
                        metrics.critical_count > 0 ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" : "bg-muted text-muted-foreground"
                    }`}>
                        <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-xs font-semibold text-muted-foreground">Perlu Restock Segera</div>
                        <div className={`text-2xl font-extrabold mt-0.5 ${metrics.critical_count > 0 ? "text-amber-600 dark:text-amber-400" : "text-foreground"}`}>
                            {metrics.critical_count} <span className="text-xs font-normal text-muted-foreground">SKU Kritis</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs & Search Controls */}
            <Tabs
                value={activeTab}
                onValueChange={(val) => {
                    if (val === "items" || val === "logs") {
                        setActiveTab(val);
                    }
                }}
                className="flex flex-col gap-4 w-full"
            >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <TabsList className="flex flex-row items-center justify-start p-1 bg-card/60 backdrop-blur-md rounded-2xl border border-border/80 shadow-xs gap-1 h-auto bg-transparent overflow-x-auto no-scrollbar w-full sm:w-auto">
                        <TabsTrigger
                            value="items"
                            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer data-active:bg-primary data-active:text-primary-foreground data-active:shadow-xs text-foreground/80 hover:bg-muted hover:text-foreground border-0 shadow-none after:hidden shrink-0"
                        >
                            <Boxes className="w-4 h-4 shrink-0" />
                            <span className="whitespace-nowrap">Daftar Inventaris ({items.total || itemList.length})</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="logs"
                            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer data-active:bg-primary data-active:text-primary-foreground data-active:shadow-xs text-foreground/80 hover:bg-muted hover:text-foreground border-0 shadow-none after:hidden shrink-0"
                        >
                            <RefreshCw className="w-4 h-4 shrink-0" />
                            <span className="whitespace-nowrap">Log Mutasi &amp; Riwayat ({logs.total || logList.length})</span>
                        </TabsTrigger>
                    </TabsList>

                    <div className="pb-2 sm:pb-0 flex items-center gap-3 self-end sm:self-auto">
                        {activeTab === "items" ? (
                            <PerPageSelector value={items.per_page} paramName="items_per_page" />
                        ) : (
                            <PerPageSelector value={logs.per_page} paramName="logs_per_page" />
                        )}
                    </div>
                </div>

                {/* Tab: Daftar Barang */}
                <TabsContent value="items" className="flex flex-col gap-4 m-0 outline-none">
                    {/* Items Filter Toolbar */}
                    <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-card/60 p-3 rounded-2xl border border-border/80">
                        <div className="relative w-full md:w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <TextInput
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Cari SKU, nama barang, rak..."
                                className="pl-9 text-xs h-9 w-full"
                            />
                        </div>

                        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
                            <span className="text-xs text-muted-foreground font-medium shrink-0">Status Stok:</span>
                            {[
                                { id: "ALL", label: "Semua" },
                                { id: "SAFE", label: "Stok Aman" },
                                { id: "LOW", label: "Menipis" },
                                { id: "OUT", label: "Habis (0)" },
                            ].map((st) => (
                                <button
                                    key={st.id}
                                    onClick={() => setStatusFilter(st.id)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer shrink-0 ${
                                        statusFilter === st.id
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-muted hover:bg-muted/80 text-foreground"
                                    }`}
                                >
                                    {st.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Items Table */}
                    <div className="overflow-hidden rounded-2xl border border-border/80 bg-card/70 backdrop-blur-md shadow-xs">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-border/80 bg-muted/50 text-xs font-bold text-foreground">
                                        <th className="px-6 py-4">SKU / Kode</th>
                                        <th className="px-6 py-4">Nama Barang &amp; Kategori</th>
                                        <th className="px-6 py-4">Harga Pokok (HPP)</th>
                                        <th className="px-6 py-4">Stok Tersedia</th>
                                        <th className="px-6 py-4">Lokasi Gudang</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-center">Aksi Cepat</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/60 text-xs">
                                    {itemList.map((item) => {
                                        const isOutOfStock = item.stok_tersedia <= 0
                                        const isLow = item.stok_tersedia <= item.stok_minimum && !isOutOfStock

                                        return (
                                            <tr key={item.id} className="hover:bg-muted/40 transition-colors">
                                                <td className="px-6 py-4 font-mono font-bold text-primary">
                                                    {item.sku || `INV-${item.id}`}
                                                </td>
                                                <td className="px-6 py-4 font-bold text-foreground">
                                                    <div>{item.nama_barang}</div>
                                                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-0.5 font-normal">
                                                        <Tag className="w-3 h-3 text-muted-foreground" />
                                                        <span>{item.kategori || "Perlengkapan"}</span>
                                                        <span>•</span>
                                                        <span>Satuan: {item.satuan || "Pcs"}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 font-medium text-foreground">
                                                    {toRupiah(item.harga_pokok || 0)}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="font-extrabold text-foreground text-sm">
                                                        {item.stok_tersedia} <span className="text-xs font-normal text-muted-foreground">{item.satuan || "Pcs"}</span>
                                                    </div>
                                                    <div className="text-[11px] text-muted-foreground">
                                                        Min. Safety: {item.stok_minimum} {item.satuan || "Pcs"}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-muted-foreground">
                                                    <div className="flex items-center gap-1">
                                                        <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                                                        <span>{item.lokasi_rak || "Gudang Utama"}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold border ${
                                                        isOutOfStock
                                                            ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                                                            : isLow
                                                            ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                                                            : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                                                    }`}>
                                                        {isOutOfStock ? "Habis (0)" : isLow ? "Stok Kritis" : "Aman"}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button
                                                            onClick={() => {
                                                                setAdjustingItem(item)
                                                                adjustForm.setData({ tipe: "IN", qty: 10, alasan: "Restock Barang Masuk" })
                                                            }}
                                                            className="px-2.5 py-1.5 bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1"
                                                        >
                                                            <RefreshCw className="w-3 h-3" />
                                                            <span>Restock</span>
                                                        </button>
                                                        <button
                                                            onClick={() => handleEditClick(item)}
                                                            className="px-2.5 py-1.5 border border-border bg-card hover:bg-muted text-foreground rounded-lg text-xs font-semibold transition cursor-pointer"
                                                        >
                                                            Edit
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                    {itemList.length === 0 && (
                                        <tr>
                                            <td colSpan={7} className="py-12 text-center text-muted-foreground italic">
                                                Tidak ada data barang inventaris yang sesuai pencarian.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="border-t border-border/80 px-4 bg-muted/20">
                            <DataTablePagination
                                links={items.links}
                                from={items.from}
                                to={items.to}
                                total={items.total}
                                currentPage={items.current_page}
                                lastPage={items.last_page}
                            />
                        </div>
                    </div>
                </TabsContent>

                {/* Tab: Log Transaksi */}
                <TabsContent value="logs" className="flex flex-col gap-4 m-0 outline-none">
                    {/* Logs Filter Toolbar */}
                    <div className="flex items-center justify-between gap-3 bg-card/60 p-3 rounded-2xl border border-border/80">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <TextInput
                                type="text"
                                value={logSearchQuery}
                                onChange={(e) => setLogSearchQuery(e.target.value)}
                                placeholder="Cari riwayat mutasi / nama jamaah..."
                                className="pl-9 text-xs h-9 w-full"
                            />
                        </div>
                    </div>
                    <div className="overflow-hidden rounded-2xl border border-border/80 bg-card/70 backdrop-blur-md shadow-xs">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-border/80 bg-muted/50 text-xs font-bold text-foreground">
                                        <th className="px-6 py-4">Waktu Transaksi</th>
                                        <th className="px-6 py-4">Barang</th>
                                        <th className="px-6 py-4">Jumlah Mutasi</th>
                                        <th className="px-6 py-4">Tipe Pergerakan</th>
                                        <th className="px-6 py-4">Alasan / Referensi</th>
                                        <th className="px-6 py-4">Petugas / PIC</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/60 text-xs">
                                    {logList.map((log) => (
                                        <tr key={log.id} className="hover:bg-muted/40 transition-colors">
                                            <td className="px-6 py-4 text-muted-foreground">
                                                {new Date(log.created_at).toLocaleString("id-ID", {
                                                    day: "numeric",
                                                    month: "short",
                                                    year: "numeric",
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </td>
                                            <td className="px-6 py-4 font-bold text-foreground">
                                                <div>{log.inventaris?.nama_barang || "Barang Terhapus"}</div>
                                                {log.inventaris?.sku && (
                                                    <div className="text-[11px] font-mono text-muted-foreground">{log.inventaris.sku}</div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 font-bold text-foreground">
                                                <span className={log.tipe === "IN" ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}>
                                                    {log.tipe === "IN" ? "+" : "-"}{log.qty} Unit
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold border ${
                                                    log.tipe === "IN"
                                                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                                                        : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                                                }`}>
                                                    {log.tipe === "IN" ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                                                    <span>{log.tipe === "IN" ? "Stock IN (Masuk)" : "Stock OUT (Keluar)"}</span>
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-muted-foreground">
                                                {log.jamaah ? (
                                                    <span className="font-medium text-foreground">
                                                        Distribusi Jamaah: {log.jamaah.nama_lengkap}
                                                    </span>
                                                ) : (
                                                    log.alasan || "Penyesuaian Manual"
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-muted-foreground">
                                                {log.creator?.name || "Sistem Otomatis"}
                                            </td>
                                        </tr>
                                    ))}
                                    {logList.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="py-12 text-center text-muted-foreground italic">
                                                Belum ada riwayat pergerakan stok.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="border-t border-border/80 px-4 bg-muted/20">
                            <DataTablePagination
                                links={logs.links}
                                from={logs.from}
                                to={logs.to}
                                total={logs.total}
                                currentPage={logs.current_page}
                                lastPage={logs.last_page}
                            />
                        </div>
                    </div>
                </TabsContent>
            </Tabs>

            {/* Drawer: Tambah Barang */}
            <Sheet open={isAddOpen} onOpenChange={setIsAddOpen}>
                <SheetContent side="right" className="w-full sm:max-w-xl md:w-1/2">
                    <SheetHeader>
                        <SheetTitle>Tambah Barang Inventaris Baru</SheetTitle>
                        <SheetDescription>Lengkapi data master barang, SKU, harga pokok beli, dan penempatan gudang.</SheetDescription>
                    </SheetHeader>
                    <form onSubmit={handleAddSubmit} className="flex flex-col gap-5 p-4 overflow-y-auto flex-1">
                        <div>
                            <InputLabel htmlFor="nama_barang" value="Nama Barang Perlengkapan *" />
                            <TextInput
                                id="nama_barang"
                                type="text"
                                value={addForm.data.nama_barang}
                                className="mt-1 block w-full text-xs"
                                onChange={(e) => addForm.setData("nama_barang", e.target.value)}
                                required
                                placeholder="Contoh: Koper Fiber Executive 24 Inch"
                            />
                            <InputError message={addForm.errors.nama_barang} className="mt-1" />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <InputLabel htmlFor="sku" value="SKU / Kode Barang (Opsional)" />
                                <TextInput
                                    id="sku"
                                    type="text"
                                    value={addForm.data.sku}
                                    className="mt-1 block w-full text-xs font-mono"
                                    onChange={(e) => addForm.setData("sku", e.target.value)}
                                    placeholder="Auto generate jika kosong"
                                />
                                <InputError message={addForm.errors.sku} className="mt-1" />
                            </div>
                            <div>
                                <InputLabel htmlFor="kategori" value="Kategori Perlengkapan" />
                                <TextInput
                                    id="kategori"
                                    type="text"
                                    value={addForm.data.kategori}
                                    className="mt-1 block w-full text-xs"
                                    onChange={(e) => addForm.setData("kategori", e.target.value)}
                                    placeholder="Perlengkapan / Dokumen / Seragam"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <InputLabel htmlFor="satuan" value="Satuan Hitung" />
                                <TextInput
                                    id="satuan"
                                    type="text"
                                    value={addForm.data.satuan}
                                    className="mt-1 block w-full text-xs"
                                    onChange={(e) => addForm.setData("satuan", e.target.value)}
                                    placeholder="Pcs / Set / Paket / Buku"
                                />
                            </div>
                            <div>
                                <InputLabel htmlFor="harga_pokok" value="Harga Pokok Beli / HPP" />
                                <CurrencyInput
                                    value={addForm.data.harga_pokok}
                                    onChange={(val) => addForm.setData("harga_pokok", Number(unformatRupiah(val)) || 0)}
                                    placeholder="0"
                                />
                                <InputError message={addForm.errors.harga_pokok} className="mt-1" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <InputLabel htmlFor="stok_tersedia" value="Stok Awal Fisik *" />
                                <TextInput
                                    id="stok_tersedia"
                                    type="number"
                                    value={addForm.data.stok_tersedia}
                                    className="mt-1 block w-full text-xs"
                                    onChange={(e) => addForm.setData("stok_tersedia", parseInt(e.target.value, 10) || 0)}
                                    required
                                    min={0}
                                />
                                <InputError message={addForm.errors.stok_tersedia} className="mt-1" />
                            </div>
                            <div>
                                <InputLabel htmlFor="stok_minimum" value="Batas Minimum (Re-order Alert) *" />
                                <TextInput
                                    id="stok_minimum"
                                    type="number"
                                    value={addForm.data.stok_minimum}
                                    className="mt-1 block w-full text-xs"
                                    onChange={(e) => addForm.setData("stok_minimum", parseInt(e.target.value, 10) || 0)}
                                    required
                                    min={0}
                                />
                                <InputError message={addForm.errors.stok_minimum} className="mt-1" />
                            </div>
                        </div>

                        <div>
                            <InputLabel htmlFor="lokasi_rak" value="Lokasi Rak / Penyimpanan Gudang" />
                            <TextInput
                                id="lokasi_rak"
                                type="text"
                                value={addForm.data.lokasi_rak}
                                className="mt-1 block w-full text-xs"
                                onChange={(e) => addForm.setData("lokasi_rak", e.target.value)}
                                placeholder="Contoh: Gudang B - Rak 03 / Lantai 2"
                            />
                        </div>

                        <SheetFooter>
                            <button
                                type="button"
                                onClick={() => setIsAddOpen(false)}
                                className="px-4 py-2 border border-border rounded-xl text-sm font-medium"
                            >
                                Batal
                            </button>
                            <PrimaryButton disabled={addForm.processing}>Simpan Barang</PrimaryButton>
                        </SheetFooter>
                    </form>
                </SheetContent>
            </Sheet>

            {/* Drawer: Edit Master Barang */}
            <Sheet open={!!editingItem} onOpenChange={(open) => { if (!open) setEditingItem(null) }}>
                <SheetContent side="right" className="w-full sm:max-w-xl md:w-1/2">
                    <SheetHeader>
                        <SheetTitle>Edit Master Barang</SheetTitle>
                        <SheetDescription>Perbarui informasi metadata, SKU, HPP, atau batas stok minimum.</SheetDescription>
                    </SheetHeader>
                    {editingItem && (
                        <form onSubmit={handleEditSubmit} className="flex flex-col gap-5 p-4 overflow-y-auto flex-1">
                            <div>
                                <InputLabel htmlFor="edit_nama_barang" value="Nama Barang Perlengkapan *" />
                                <TextInput
                                    id="edit_nama_barang"
                                    type="text"
                                    value={editForm.data.nama_barang}
                                    className="mt-1 block w-full text-xs"
                                    onChange={(e) => editForm.setData("nama_barang", e.target.value)}
                                    required
                                />
                                <InputError message={editForm.errors.nama_barang} className="mt-1" />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <InputLabel htmlFor="edit_sku" value="SKU / Kode Barang" />
                                    <TextInput
                                        id="edit_sku"
                                        type="text"
                                        value={editForm.data.sku}
                                        className="mt-1 block w-full text-xs font-mono"
                                        onChange={(e) => editForm.setData("sku", e.target.value)}
                                    />
                                </div>
                                <div>
                                    <InputLabel htmlFor="edit_kategori" value="Kategori Perlengkapan" />
                                    <TextInput
                                        id="edit_kategori"
                                        type="text"
                                        value={editForm.data.kategori}
                                        className="mt-1 block w-full text-xs"
                                        onChange={(e) => editForm.setData("kategori", e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <InputLabel htmlFor="edit_satuan" value="Satuan Hitung" />
                                    <TextInput
                                        id="edit_satuan"
                                        type="text"
                                        value={editForm.data.satuan}
                                        className="mt-1 block w-full text-xs"
                                        onChange={(e) => editForm.setData("satuan", e.target.value)}
                                    />
                                </div>
                                <div>
                                    <InputLabel htmlFor="edit_harga_pokok" value="Harga Pokok Beli / HPP" />
                                    <CurrencyInput
                                        value={editForm.data.harga_pokok}
                                        onChange={(val) => editForm.setData("harga_pokok", Number(unformatRupiah(val)) || 0)}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <InputLabel htmlFor="edit_stok_minimum" value="Batas Minimum Safety Alert *" />
                                    <TextInput
                                        id="edit_stok_minimum"
                                        type="number"
                                        value={editForm.data.stok_minimum}
                                        className="mt-1 block w-full text-xs"
                                        onChange={(e) => editForm.setData("stok_minimum", parseInt(e.target.value, 10) || 0)}
                                        required
                                        min={0}
                                    />
                                </div>
                                <div>
                                    <InputLabel htmlFor="edit_lokasi_rak" value="Lokasi Rak Gudang" />
                                    <TextInput
                                        id="edit_lokasi_rak"
                                        type="text"
                                        value={editForm.data.lokasi_rak}
                                        className="mt-1 block w-full text-xs"
                                        onChange={(e) => editForm.setData("lokasi_rak", e.target.value)}
                                    />
                                </div>
                            </div>

                            <SheetFooter>
                                <button
                                    type="button"
                                    onClick={() => setEditingItem(null)}
                                    className="px-4 py-2 border border-border rounded-xl text-sm font-medium"
                                >
                                    Batal
                                </button>
                                <PrimaryButton disabled={editForm.processing}>Simpan Perubahan</PrimaryButton>
                            </SheetFooter>
                        </form>
                    )}
                </SheetContent>
            </Sheet>

            {/* Drawer: Quick Restock / Stock Out Adjustment */}
            <Sheet open={!!adjustingItem} onOpenChange={(open) => { if (!open) setAdjustingItem(null) }}>
                <SheetContent side="right" className="w-full sm:max-w-xl md:w-1/2">
                    <SheetHeader>
                        <SheetTitle>Penyesuaian Stok Cepat (Restock / Out)</SheetTitle>
                        <SheetDescription>
                            Tambahkan penerimaan stok baru dari supplier atau catat pengurangan manual dengan alasan audit yang jelas.
                        </SheetDescription>
                    </SheetHeader>
                    {adjustingItem && (
                        <form onSubmit={handleAdjustSubmit} className="flex flex-col gap-5 p-4 overflow-y-auto flex-1">
                            <div className="p-4 rounded-xl bg-muted/40 border border-border/80 flex flex-col gap-1">
                                <span className="text-xs text-muted-foreground">Barang yang disesuaikan:</span>
                                <strong className="text-sm text-foreground">{adjustingItem.nama_barang}</strong>
                                <div className="text-xs text-primary font-mono mt-1">
                                    Stok saat ini: {adjustingItem.stok_tersedia} {adjustingItem.satuan || "Pcs"}
                                </div>
                            </div>

                            <div>
                                <InputLabel value="Jenis Penyesuaian *" />
                                <div className="grid grid-cols-2 gap-3 mt-1.5">
                                    <button
                                        type="button"
                                        onClick={() => adjustForm.setData("tipe", "IN")}
                                        className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                                            adjustForm.data.tipe === "IN"
                                                ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                                                : "bg-card hover:bg-muted text-foreground border-border"
                                        }`}
                                    >
                                        <ArrowDownLeft className="w-4 h-4" />
                                        <span>Stock IN (Masuk / Restock)</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => adjustForm.setData("tipe", "OUT")}
                                        className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                                            adjustForm.data.tipe === "OUT"
                                                ? "bg-rose-600 text-white border-rose-600 shadow-xs"
                                                : "bg-card hover:bg-muted text-foreground border-border"
                                        }`}
                                    >
                                        <ArrowUpRight className="w-4 h-4" />
                                        <span>Stock OUT (Keluar / Rusak)</span>
                                    </button>
                                </div>
                            </div>

                            <div>
                                <InputLabel htmlFor="adjust_qty" value="Jumlah Unit *" />
                                <TextInput
                                    id="adjust_qty"
                                    type="number"
                                    value={adjustForm.data.qty}
                                    className="mt-1 block w-full text-xs"
                                    onChange={(e) => adjustForm.setData("qty", parseInt(e.target.value, 10) || 1)}
                                    required
                                    min={1}
                                />
                                <InputError message={adjustForm.errors.qty} className="mt-1" />
                            </div>

                            <div>
                                <InputLabel htmlFor="adjust_alasan" value="Alasan / Catatan Penyesuaian *" />
                                <TextInput
                                    id="adjust_alasan"
                                    type="text"
                                    value={adjustForm.data.alasan}
                                    className="mt-1 block w-full text-xs"
                                    onChange={(e) => adjustForm.setData("alasan", e.target.value)}
                                    required
                                    placeholder="Contoh: Penerimaan PO Supplier PT Koper Jaya / Barang Rusak Saat Manasik"
                                />
                                <InputError message={adjustForm.errors.alasan} className="mt-1" />
                            </div>

                            <SheetFooter>
                                <button
                                    type="button"
                                    onClick={() => setAdjustingItem(null)}
                                    className="px-4 py-2 border border-border rounded-xl text-sm font-medium"
                                >
                                    Batal
                                </button>
                                <PrimaryButton disabled={adjustForm.processing}>Konfirmasi Penyesuaian</PrimaryButton>
                            </SheetFooter>
                        </form>
                    )}
                </SheetContent>
            </Sheet>
        </PageLayout>
    )
}
