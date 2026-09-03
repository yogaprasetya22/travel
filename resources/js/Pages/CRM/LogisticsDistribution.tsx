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
} from 'lucide-react';
import DataTablePagination, { PaginatedData } from '@/Components/DataTablePagination';
import PerPageSelector from '@/Components/PerPageSelector';
import { useDebounce } from '@/hooks/use-debounce';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter,
} from '@/Components/ui/sheet';

interface LogisticsCustomer {
    id: number;
    nama_lengkap: string;
    no_hp: string;
    email?: string | null;
    nomor_paspor?: string | null;
    kota_asal?: string | null;
    created_at?: string;
    status_logistik: 'Pending' | 'Ready_to_Pickup' | 'Handed_Over';
    tanggal_serah_terima_logistik: string | null;
    paket: {
        nama_paket: string;
        harga?: number;
    };
    crm_stage?: {
        nama_stage: string;
    } | null;
    agen: {
        name: string;
        email?: string;
    } | null;
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
        jumlah: number;
        tipe_pembayaran: string;
        status_verifikasi: string;
    }>;
}

interface LogisticsProps extends PageProps {
    logisticsList: PaginatedData<LogisticsCustomer>;
    filters?: {
        search?: string;
        status?: string;
        per_page?: number;
    };
}

export default function LogisticsDistribution({ logisticsList, filters = {} }: LogisticsProps) {
    const { auth } = usePage<PageProps>().props;
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const debouncedSearchQuery = useDebounce(searchQuery, 300);
    const [filterStatus, setFilterStatus] = useState<string>(filters.status || 'ALL');
    const [selectedCustomer, setSelectedCustomer] = useState<LogisticsCustomer | null>(null);

    // Sync debounced search with backend Inertia query
    React.useEffect(() => {
        if (debouncedSearchQuery !== (filters.search || '')) {
            router.get(
                route('crm.logistics.index'),
                {
                    search: debouncedSearchQuery || undefined,
                    status: filterStatus !== 'ALL' ? filterStatus : undefined,
                    per_page: logisticsList.per_page,
                    page: 1,
                },
                {
                    preserveState: true,
                    replace: true,
                    preserveScroll: true,
                }
            );
        }
    }, [debouncedSearchQuery]);

    const handleStatusFilter = (newStatus: string) => {
        setFilterStatus(newStatus);
        router.get(
            route('crm.logistics.index'),
            {
                search: debouncedSearchQuery || undefined,
                status: newStatus !== 'ALL' ? newStatus : undefined,
                per_page: logisticsList.per_page,
                page: 1,
            },
            {
                preserveState: true,
                replace: true,
                preserveScroll: true,
            }
        );
    };

    const handleHandover = (id: number, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        if (confirm('Apakah Anda yakin barang perlengkapan ini sudah diserahkan kepada jamaah/agen?')) {
            router.post(
                route('crm.logistics.handover', id),
                {},
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        if (selectedCustomer?.id === id) {
                            setSelectedCustomer((prev) =>
                                prev
                                    ? {
                                          ...prev,
                                          status_logistik: 'Handed_Over',
                                          tanggal_serah_terima_logistik: new Date().toISOString().split('T')[0],
                                      }
                                    : null
                            );
                        }
                    },
                }
            );
        }
    };

    const items = logisticsList.data || [];

    return (
        <PageLayout
            title="Distribusi Logistik Jamaah"
            breadcrumbParent="CRM & Jamaah"
            breadcrumbPage="Distribusi Logistik"
            contentClass="p-6 md:p-8 flex flex-col gap-6 w-full max-w-none"
        >
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-card/60 backdrop-blur-md p-6 rounded-2xl border border-border/80 shadow-xs">
                <div>
                    <div className="flex items-center gap-2.5">
                        <div className="h-8 w-1.5 rounded-full bg-primary" />
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                            Manajemen Serah Terima Logistik & Perlengkapan
                        </h1>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 ml-4">
                        Pantau status koper, kain ihram, seragam, dan buku panduan yang telah dipotong otomatis dari stok gudang saat pembayaran DP diverifikasi.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                    <PerPageSelector value={logisticsList.per_page} />
                    <div className="relative flex-1 lg:w-72">
                        <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Cari jamaah atau agen..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground"
                        />
                    </div>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2">
                {[
                    { id: 'ALL', label: 'Semua Distribusi' },
                    { id: 'Ready_to_Pickup', label: 'Siap Diambil di Gudang' },
                    { id: 'Handed_Over', label: 'Sudah Diserahterimakan' },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => handleStatusFilter(tab.id)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                            filterStatus === tab.id
                                ? 'bg-primary text-primary-foreground shadow-xs'
                                : 'bg-card border border-border text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {items.map((item) => {
                    const isHandedOver = item.status_logistik === 'Handed_Over';
                    return (
                        <div
                            key={item.id}
                            onClick={() => setSelectedCustomer(item)}
                            className="bg-card/70 border border-border/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between gap-4 transition-all hover:border-primary/50 hover:shadow-md cursor-pointer group"
                        >
                            <div className="flex flex-col gap-3">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="flex items-center gap-1.5">
                                            <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors">
                                                {item.nama_lengkap}
                                            </h3>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-0.5">HP: {item.no_hp}</p>
                                    </div>
                                    <span
                                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                                            isHandedOver
                                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                                                : 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20'
                                        }`}
                                    >
                                        {isHandedOver ? 'Sudah Diterima' : 'Siap di Gudang'}
                                    </span>
                                </div>

                                <div className="bg-muted/40 p-3 rounded-xl border border-border/40 text-xs flex flex-col gap-1.5">
                                    <div className="text-muted-foreground">
                                        Paket: <strong className="text-foreground">{item.paket?.nama_paket || '-'}</strong>
                                    </div>
                                    {item.agen && (
                                        <div className="text-muted-foreground">
                                            Mitra Agen: <strong className="text-foreground">{item.agen.name}</strong>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <span className="text-xs font-semibold text-muted-foreground block mb-2">
                                        Daftar Barang Hak Jamaah:
                                    </span>
                                    <div className="flex flex-wrap gap-1.5">
                                        {item.inventaris_transaksi?.map((tx) => (
                                            <span
                                                key={tx.id}
                                                className="text-xs font-medium px-2.5 py-1 rounded-lg bg-card border border-border text-foreground flex items-center gap-1.5"
                                            >
                                                <PackageCheck className="w-3.5 h-3.5 text-purple-500" />
                                                <span>
                                                    {tx.qty}x {tx.inventaris?.nama_barang}
                                                </span>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="pt-3 border-t border-border/40 flex justify-between items-center text-xs">
                                <span className="text-muted-foreground">
                                    {isHandedOver && item.tanggal_serah_terima_logistik
                                        ? `Diserahkan: ${new Date(item.tanggal_serah_terima_logistik).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}`
                                        : 'Belum diserahkan'}
                                </span>
                                {!isHandedOver ? (
                                    <button
                                        onClick={(e) => handleHandover(item.id, e)}
                                        className="px-3.5 py-1.5 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition cursor-pointer flex items-center gap-1 shadow-xs"
                                    >
                                        <span>Serah Terima</span>
                                        <ArrowRight className="w-3.5 h-3.5" />
                                    </button>
                                ) : (
                                    <span className="text-[11px] font-semibold text-primary flex items-center gap-1 group-hover:underline">
                                        <span>Lihat Detail</span>
                                        <ArrowRight className="w-3.5 h-3.5" />
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}

                {items.length === 0 && (
                    <div className="col-span-full py-16 text-center text-sm text-muted-foreground bg-card/20 rounded-2xl border border-dashed border-border">
                        Tidak ada data distribusi logistik yang cocok.
                    </div>
                )}
            </div>

            {/* Pagination Footer */}
            <DataTablePagination
                links={logisticsList.links}
                from={logisticsList.from}
                to={logisticsList.to}
                total={logisticsList.total}
                currentPage={logisticsList.current_page}
                lastPage={logisticsList.last_page}
            />

            {/* DETAIL SLIDE-OUT DRAWER / SHEET */}
            <Sheet open={!!selectedCustomer} onOpenChange={(open) => { if (!open) setSelectedCustomer(null); }}>
                <SheetContent side="right" className="w-full sm:max-w-xl md:w-1/2 flex flex-col justify-between">
                    <div className="flex flex-col gap-6 p-4 flex-1 overflow-y-auto">
                        <SheetHeader className="pb-4 border-b border-border/60">
                            <div className="flex justify-between items-start gap-4">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-primary uppercase tracking-wider">
                                            Rincian Logistik & Serah Terima
                                        </span>
                                    </div>
                                    <SheetTitle className="text-2xl font-bold text-foreground mt-1">
                                        {selectedCustomer?.nama_lengkap}
                                    </SheetTitle>
                                    <SheetDescription className="text-xs text-muted-foreground mt-0.5">
                                        ID Jamaah: #{selectedCustomer?.id} • Paket: {selectedCustomer?.paket?.nama_paket}
                                    </SheetDescription>
                                </div>
                                <span
                                    className={`text-xs font-bold px-3 py-1.5 rounded-full border shrink-0 ${
                                        selectedCustomer?.status_logistik === 'Handed_Over'
                                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                                            : 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20'
                                    }`}
                                >
                                    {selectedCustomer?.status_logistik === 'Handed_Over' ? 'Sudah Diserahterimakan' : 'Siap Diambil di Gudang'}
                                </span>
                            </div>
                        </SheetHeader>

                        {/* Customer Info Card */}
                        <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-xs flex flex-col gap-3">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                Data Pribadi & Kontak Jamaah
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                <div className="flex items-center gap-2.5 text-muted-foreground">
                                    <Phone className="w-4 h-4 text-primary shrink-0" />
                                    <span>No. HP: <strong className="text-foreground">{selectedCustomer?.no_hp || '-'}</strong></span>
                                </div>
                                <div className="flex items-center gap-2.5 text-muted-foreground">
                                    <Mail className="w-4 h-4 text-primary shrink-0" />
                                    <span>Email: <strong className="text-foreground">{selectedCustomer?.email || '-'}</strong></span>
                                </div>
                                <div className="flex items-center gap-2.5 text-muted-foreground">
                                    <UserCheck className="w-4 h-4 text-primary shrink-0" />
                                    <span>No. Paspor: <strong className="text-foreground">{selectedCustomer?.nomor_paspor || 'Belum diisi'}</strong></span>
                                </div>
                                <div className="flex items-center gap-2.5 text-muted-foreground">
                                    <User className="w-4 h-4 text-primary shrink-0" />
                                    <span>Mitra Agen: <strong className="text-foreground">{selectedCustomer?.agen?.name || 'Pusat / Direct'}</strong></span>
                                </div>
                            </div>
                        </div>

                        {/* Items Checklist Table Card */}
                        <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-xs flex flex-col gap-3">
                            <div className="flex justify-between items-center">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                    <Package className="w-4 h-4 text-primary" />
                                    <span>Rincian Barang & Perlengkapan Hak Jamaah</span>
                                </h4>
                                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
                                    {selectedCustomer?.inventaris_transaksi?.length || 0} Jenis Barang
                                </span>
                            </div>

                            <div className="overflow-hidden rounded-xl border border-border/60">
                                <table className="w-full text-left text-xs">
                                    <thead>
                                        <tr className="bg-muted/50 text-muted-foreground border-b border-border/60">
                                            <th className="px-4 py-2.5">Nama Perlengkapan</th>
                                            <th className="px-4 py-2.5 text-center">Qty Hak</th>
                                            <th className="px-4 py-2.5 text-center">Status Barang</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/40">
                                        {selectedCustomer?.inventaris_transaksi?.map((tx) => (
                                            <tr key={tx.id} className="hover:bg-muted/20">
                                                <td className="px-4 py-3">
                                                    <div className="font-bold text-foreground">
                                                        {tx.inventaris?.nama_barang}
                                                    </div>
                                                    {tx.inventaris?.kode_sku && (
                                                        <div className="text-[10px] text-muted-foreground font-mono mt-0.5">
                                                            SKU: {tx.inventaris.kode_sku}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-center font-bold text-foreground">
                                                    {tx.qty} Pcs
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                                        <Check className="w-3 h-3" />
                                                        <span>Teralokasi dari Stok</span>
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Handover Status & Timeline */}
                        <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-xs flex flex-col gap-3">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                <Calendar className="w-4 h-4 text-primary" />
                                <span>Status & Tanggal Serah Terima</span>
                            </h4>
                            {selectedCustomer?.status_logistik === 'Handed_Over' ? (
                                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-800 dark:text-emerald-300 flex items-start gap-2.5">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                    <div>
                                        <strong className="block font-semibold">Perlengkapan Telah Diterima oleh Jamaah / Agen</strong>
                                        <span className="text-[11px] opacity-80">
                                            Tanggal Serah Terima: {selectedCustomer.tanggal_serah_terima_logistik ? new Date(selectedCustomer.tanggal_serah_terima_logistik).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2.5">
                                    <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                                    <div>
                                        <strong className="block font-semibold">Barang Masih Berada di Gudang Logistik</strong>
                                        <span className="text-[11px] opacity-80">
                                            Stok perlengkapan sudah dipotong dari inventaris dan siap diserahkan kepada jamaah atau agen pembina.
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Drawer Footer Actions */}
                    <SheetFooter className="p-4 border-t border-border/60 flex sm:justify-between items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setSelectedCustomer(null)}
                            className="px-4 py-2.5 border border-border rounded-xl text-xs font-semibold hover:bg-muted transition cursor-pointer"
                        >
                            Tutup Detail
                        </button>
                        {selectedCustomer?.status_logistik !== 'Handed_Over' && (
                            <button
                                type="button"
                                onClick={() => selectedCustomer && handleHandover(selectedCustomer.id)}
                                className="px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-xs font-bold hover:opacity-90 transition cursor-pointer flex items-center gap-1.5 shadow-sm"
                            >
                                <CheckCircle2 className="w-4 h-4" />
                                <span>Konfirmasi Serah Terima Sekarang</span>
                            </button>
                        )}
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </PageLayout>
    );
}

