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
} from 'lucide-react';

import DataTablePagination, { PaginatedData } from '@/Components/DataTablePagination';
import PerPageSelector from '@/Components/PerPageSelector';
import { useDebounce } from '@/hooks/use-debounce';
import { useMounted } from '@/hooks/use-mounted';

import CustomerMetricsCards, { CustomerMetrics } from './Components/CustomerMetricsCards';
import CustomerDrawer, { Customer, BankAccount } from './Components/CustomerDrawer';

interface CustomerListProps extends PageProps {
    customers: PaginatedData<Customer>;
    banks: BankAccount[];
    metrics: CustomerMetrics;
    filters: {
        search: string;
        status: string;
        doc: string;
        per_page: number;
    };
}

export default function CustomerList({ customers, banks = [], metrics, filters }: CustomerListProps) {
    const isMounted = useMounted();
    const [searchQuery, setSearchQuery] = useState(filters?.search || '');
    const [statusFilter, setStatusFilter] = useState(filters?.status || 'ALL');
    const [docFilter, setDocFilter] = useState(filters?.doc || 'ALL');

    // Drawer state
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [drawerInitialTab, setDrawerInitialTab] = useState<'biodata' | 'financial'>('biodata');

    const debouncedSearchQuery = useDebounce(searchQuery, 350);
    const isInitialMount = useRef(true);

    // Deep-link auto-open from URL (?customer_id=123&tab=financial)
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const customerIdParam = params.get('customer_id');
        const tabParam = params.get('tab') as 'biodata' | 'financial' | null;

        if (customerIdParam && customers.data) {
            const found = customers.data.find((c) => c.id === Number(customerIdParam));
            if (found) {
                setSelectedCustomer(found);
                if (tabParam === 'financial' || tabParam === 'biodata') {
                    setDrawerInitialTab(tabParam);
                }
            }
        }
    }, [customers.data]);

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        router.get(
            route('crm.customers.index'),
            {
                search: debouncedSearchQuery,
                status: statusFilter,
                doc: docFilter,
                per_page: customers.per_page,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            }
        );
    }, [debouncedSearchQuery, statusFilter, docFilter]);

    const handleOpenDrawer = (c: Customer, tab: 'biodata' | 'financial') => {
        setSelectedCustomer(c);
        setDrawerInitialTab(tab);
        const url = new URL(window.location.href);
        url.searchParams.set('customer_id', c.id.toString());
        url.searchParams.set('tab', tab);
        window.history.replaceState({}, '', url.toString());
    };

    const handleCloseDrawer = () => {
        setSelectedCustomer(null);
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

            {/* Filter Toolbar */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-card/60 p-3.5 rounded-2xl border border-border/80">
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Cari nama, NIK, HP, paspor, agen..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 text-xs bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground placeholder:text-muted-foreground"
                    />
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground font-medium shrink-0">Status Paspor:</span>
                        <div className="flex bg-muted/60 p-1 rounded-xl border border-border/70">
                            {[
                                { id: 'ALL', label: 'Semua' },
                                { id: 'PASSPORT_READY', label: 'Ada Paspor' },
                                { id: 'PASSPORT_PENDING', label: 'Belum Ada' },
                            ].map((st) => (
                                <button
                                    key={st.id}
                                    type="button"
                                    onClick={() => setDocFilter(st.id)}
                                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                                        docFilter === st.id
                                            ? 'bg-card text-foreground shadow-xs'
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    {st.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <PerPageSelector value={customers.per_page} />
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
                                const totalPaid = (c.pembayaran || [])
                                    .filter((p) => p.status_verifikasi === 'Verified')
                                    .reduce((sum, p) => sum + Number(p.nominal), 0);
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
                                                        : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                                                }`}>
                                                    {isLunas ? 'LUNAS (100%)' : `Sisa: ${toRupiah(remainingBalance)}`}
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
                                            <div className="text-[10px] text-muted-foreground mt-1.5">
                                                {c.pembayaran?.length || 0}x Pembayaran Terverifikasi
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
                                                    onClick={() => handleOpenDrawer(c, 'biodata')}
                                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border bg-card hover:bg-muted text-xs font-semibold transition cursor-pointer"
                                                    title="Edit Biodata & Keterangan Lengkap"
                                                >
                                                    <Edit3 className="w-3.5 h-3.5" />
                                                    <span>Edit Data</span>
                                                </button>
                                                <button
                                                    onClick={() => handleOpenDrawer(c, 'financial')}
                                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground text-xs font-semibold transition cursor-pointer"
                                                    title="Lihat Rincian Transaksi & Pelunasan"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                    <span>Rincian &amp; Bayar</span>
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

            {/* Clean Modular Drawer Component */}
            <CustomerDrawer
                customer={selectedCustomer}
                initialTab={drawerInitialTab}
                banks={banks}
                onClose={handleCloseDrawer}
            />
        </PageLayout>
    );
}
