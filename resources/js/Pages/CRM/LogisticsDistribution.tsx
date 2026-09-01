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
} from 'lucide-react';
import DataTablePagination, { PaginatedData } from '@/Components/DataTablePagination';
import PerPageSelector from '@/Components/PerPageSelector';
import { useDebounce } from '@/hooks/use-debounce';

interface LogisticsCustomer {
    id: number;
    nama_lengkap: string;
    no_hp: string;
    status_logistik: 'Pending' | 'Ready_to_Pickup' | 'Handed_Over';
    tanggal_serah_terima_logistik: string | null;
    paket: {
        nama_paket: string;
    };
    agen: {
        name: string;
    } | null;
    inventaris_transaksi: Array<{
        id: number;
        qty: number;
        inventaris: {
            nama_barang: string;
        };
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

    const handleHandover = (id: number) => {
        if (confirm('Apakah Anda yakin barang perlengkapan ini sudah diserahkan kepada jamaah/agen?')) {
            router.post(route('crm.logistics.handover', id));
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
                            placeholder="Cari jamaah atau agen (debounced)..."
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
                            className="bg-card/70 border border-border/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between gap-4"
                        >
                            <div className="flex flex-col gap-3">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-bold text-base text-foreground">{item.nama_lengkap}</h3>
                                        <p className="text-xs text-muted-foreground mt-0.5">HP: {item.no_hp}</p>
                                    </div>
                                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                                        isHandedOver
                                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                                            : 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20'
                                    }`}>
                                        {isHandedOver ? 'Sudah Diterima' : 'Siap di Gudang'}
                                    </span>
                                </div>

                                <div className="bg-muted/40 p-3 rounded-xl border border-border/40 text-xs flex flex-col gap-1.5">
                                    <div className="text-muted-foreground">Paket: <strong className="text-foreground">{item.paket.nama_paket}</strong></div>
                                    {item.agen && (
                                        <div className="text-muted-foreground">Mitra Agen: <strong className="text-foreground">{item.agen.name}</strong></div>
                                    )}
                                </div>

                                <div>
                                    <span className="text-xs font-semibold text-muted-foreground block mb-2">Daftar Barang Hak Jamaah:</span>
                                    <div className="flex flex-wrap gap-1.5">
                                        {item.inventaris_transaksi.map((tx) => (
                                            <span key={tx.id} className="text-xs font-medium px-2.5 py-1 rounded-lg bg-card border border-border text-foreground flex items-center gap-1.5">
                                                <PackageCheck className="w-3.5 h-3.5 text-purple-500" />
                                                <span>{tx.qty}x {tx.inventaris.nama_barang}</span>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="pt-3 border-t border-border/40 flex justify-between items-center text-xs">
                                <span className="text-muted-foreground">
                                    {isHandedOver && item.tanggal_serah_terima_logistik ? `Diserahkan: ${item.tanggal_serah_terima_logistik}` : 'Belum diserahkan'}
                                </span>
                                {!isHandedOver && (
                                    <button
                                        onClick={() => handleHandover(item.id)}
                                        className="px-3.5 py-1.5 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition cursor-pointer flex items-center gap-1"
                                    >
                                        <span>Serah Terima</span>
                                        <ArrowRight className="w-3.5 h-3.5" />
                                    </button>
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
        </PageLayout>
    );
}
