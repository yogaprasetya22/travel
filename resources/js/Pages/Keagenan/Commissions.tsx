import * as React from "react"
import { router } from "@inertiajs/react"
import PageLayout from "@/Components/Layouts/PageLayout"
import DataTablePagination, { PaginatedData } from "@/Components/DataTablePagination"
import PerPageSelector from "@/Components/PerPageSelector"
import { Search, X, Filter } from "lucide-react"
import { useDebounce } from "@/hooks/use-debounce"
import { useMounted } from "@/hooks/use-mounted"

interface Commission {
    id: number
    nominal_komisi: number
    status_pencairan: "Pending" | "Ready_to_Pay" | "Paid"
    created_at: string
    agen: { name: string; email: string }
    jamaah: {
        nama_lengkap: string
        paket?: { nama_paket: string; harga: number }
    }
}

interface Props {
    commissions: PaginatedData<Commission>
    stats: {
        total_paid: number
        total_ready: number
        total_pending: number
    }
    filters?: {
        search?: string
        status?: string
        per_page?: number
    }
}

export default function Commissions({ commissions, stats, filters }: Props) {
    const commissionList = commissions.data || []
    const isMounted = useMounted()
    const [searchQuery, setSearchQuery] = React.useState(filters?.search || "")
    const [statusFilter, setStatusFilter] = React.useState(filters?.status || "ALL")
    const debouncedSearch = useDebounce(searchQuery, 350)
    const isInitialMount = React.useRef(true)

    React.useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false
            return
        }
        if (!isMounted) return

        router.get(
            route("keagenan.commissions.index"),
            {
                search: debouncedSearch || undefined,
                status: statusFilter === "ALL" ? undefined : statusFilter,
                per_page: commissions.per_page,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            }
        )
    }, [debouncedSearch, statusFilter])

    const handleMarkAsPaid = (commissionId: number) => {
        router.put(
            route("keagenan.commissions.update", commissionId),
            { status_pencairan: "Paid" },
            { preserveScroll: true }
        )
    }

    const fmt = (amount: number) =>
        new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount)

    return (
        <PageLayout
            title="Pembagian Komisi Agen"
            breadcrumbParent="Keagenan & Komisi"
            breadcrumbPage="Pembagian Komisi"
            contentClass="p-6 md:p-8 flex flex-col gap-6 w-full max-w-none"
        >
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card/60 backdrop-blur-md p-6 rounded-2xl border border-border/80 shadow-xs">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">Pembagian Komisi Agen</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Kelola pencairan komisi mitra agen dan catat bukti pembayaran secara manual di bawah ini.
                    </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                    <PerPageSelector value={commissions.per_page} />
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="rounded-2xl border border-border/80 bg-card/70 backdrop-blur-md p-6 shadow-xs">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Komisi Dibayar</span>
                    <div className="text-2xl font-bold mt-2 text-foreground">{fmt(stats.total_paid)}</div>
                </div>
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6 shadow-xs">
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Siap Dicairkan (Ready)</span>
                    <div className="text-2xl font-bold mt-2 text-emerald-600 dark:text-emerald-400">{fmt(stats.total_ready)}</div>
                </div>
                <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6 shadow-xs">
                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Pending Pelunasan</span>
                    <div className="text-2xl font-bold mt-2 text-amber-600 dark:text-amber-400">{fmt(stats.total_pending)}</div>
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
                        placeholder="Cari nama agen, email, jamaah, atau paket..."
                        className="w-full pl-10 pr-9 py-2.5 bg-background text-foreground text-xs rounded-xl border border-border/80 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
                    />
                    {searchQuery && (
                        <button
                            type="button"
                            onClick={() => setSearchQuery("")}
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
                            onClick={() => setStatusFilter("ALL")}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                                statusFilter === "ALL"
                                    ? "bg-card text-foreground shadow-xs"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            Semua Status
                        </button>
                        <button
                            type="button"
                            onClick={() => setStatusFilter("Ready_to_Pay")}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                                statusFilter === "Ready_to_Pay"
                                    ? "bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 shadow-xs"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            Ready to Pay
                        </button>
                        <button
                            type="button"
                            onClick={() => setStatusFilter("Pending")}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                                statusFilter === "Pending"
                                    ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shadow-xs"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            Pending
                        </button>
                        <button
                            type="button"
                            onClick={() => setStatusFilter("Paid")}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                                statusFilter === "Paid"
                                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-xs"
                                    : "text-muted-foreground hover:text-foreground"
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
                                <th className="px-6 py-4">Jamaah & Paket</th>
                                <th className="px-6 py-4">Nominal Komisi</th>
                                <th className="px-6 py-4">Status Pencairan</th>
                                <th className="px-6 py-4">Tanggal Pendaftaran</th>
                                <th className="px-6 py-4 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60 text-xs">
                            {commissionList.map((comm) => (
                                <tr key={comm.id} className="hover:bg-muted/40 transition-colors">
                                    <td className="px-6 py-4 font-bold text-foreground">
                                        <div>{comm.agen?.name || "-"}</div>
                                        <div className="text-[11px] text-muted-foreground">{comm.agen?.email || "-"}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-semibold text-foreground">{comm.jamaah?.nama_lengkap || "-"}</div>
                                        <div className="text-[11px] text-muted-foreground">{comm.jamaah?.paket?.nama_paket || "-"}</div>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-primary">
                                        {fmt(comm.nominal_komisi)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold border ${
                                            comm.status_pencairan === "Paid"
                                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                                                : comm.status_pencairan === "Ready_to_Pay"
                                                ? "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20"
                                                : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                                        }`}>
                                            {comm.status_pencairan.replace(/_/g, " ")}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-muted-foreground">
                                        {new Date(comm.created_at).toLocaleDateString("id-ID", {
                                            day: "numeric",
                                            month: "short",
                                            year: "numeric",
                                        })}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {comm.status_pencairan === "Ready_to_Pay" ? (
                                            <button
                                                onClick={() => handleMarkAsPaid(comm.id)}
                                                className="inline-flex items-center rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 transition cursor-pointer"
                                            >
                                                Cairkan Komisi
                                            </button>
                                        ) : comm.status_pencairan === "Paid" ? (
                                            <span className="text-xs text-muted-foreground italic">Sudah Ditransfer</span>
                                        ) : (
                                            <span className="text-xs text-muted-foreground italic">Menunggu Verifikasi</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {commissionList.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="py-12 text-center text-muted-foreground italic">
                                        Belum ada data komisi agen.
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
        </PageLayout>
    )
}
