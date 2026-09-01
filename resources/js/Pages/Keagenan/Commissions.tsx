import * as React from "react"
import { router } from "@inertiajs/react"
import PageLayout from "@/Components/Layouts/PageLayout"
import DataTablePagination, { PaginatedData } from "@/Components/DataTablePagination"
import PerPageSelector from "@/Components/PerPageSelector"

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
}

export default function Commissions({ commissions, stats }: Props) {
    const commissionList = commissions.data || []

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
                <PerPageSelector value={commissions.per_page} />
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
