import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { PageProps } from '@/Types';
import PageLayout from '@/Components/Layouts/PageLayout';
import {
    Users,
    CheckCircle2,
    PackageCheck,
    Coins,
    ArrowUpRight,
    Clock,
    ShieldCheck,
    Truck,
    Receipt,
    Sparkles,
} from 'lucide-react';

interface DashboardStats {
    total_leads: number;
    closing_count: number;
    logistics_ready_count: number;
    total_commission: number;
    paid_commission: number;
    ready_commission: number;
}

interface LogisticsItem {
    id: number;
    nama_lengkap: string;
    no_hp: string;
    paket: {
        nama_paket: string;
        harga: number;
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

interface PendingPayment {
    id: number;
    nominal: number;
    tipe_pembayaran: string;
    bukti_transfer: string;
    created_at: string;
    jamaah: {
        nama_lengkap: string;
        paket: {
            nama_paket: string;
        };
        agen: {
            name: string;
        } | null;
    };
    rekening_tenant: {
        nama_bank: string;
        nomor_rekening: string;
    };
}

interface DashboardProps extends PageProps {
    stats: DashboardStats;
    logisticsReadyList: LogisticsItem[];
    pendingPayments: PendingPayment[];
}

export default function Dashboard({
    stats,
    logisticsReadyList = [],
    pendingPayments = [],
}: DashboardProps) {
    const { auth } = usePage<PageProps>().props;
    const isAgent = auth.user.role === 'agen';

    return (
        <PageLayout
            title="Dashboard Overview"
            breadcrumbParent="Overview"
            breadcrumbPage="Dashboard"
            contentClass="p-6 md:p-8 flex flex-col gap-6 w-full max-w-none"
        >
            {/* Header Greeting */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card/60 backdrop-blur-md p-6 rounded-2xl border border-border/80 shadow-xs">
                <div>
                    <div className="flex items-center gap-2.5">
                        <div className="h-8 w-1.5 rounded-full bg-primary" />
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                            Selamat Datang, {auth.user.name}
                        </h1>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 ml-4">
                        {isAgent
                            ? 'Pantau perolehan prospek calon jamaah, status logistik koper, dan pencairan komisi Anda.'
                            : 'Ringkasan performa penjualan, pipeline CRM, verifikasi transaksi kas, dan ketersediaan logistik travel.'}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Link
                        href={route('crm.index')}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:opacity-90 transition-all text-sm shadow-xs"
                    >
                        <Users className="w-4 h-4" />
                        <span>Buka Papan CRM</span>
                    </Link>
                </div>
            </div>

            {/* Metrics Statistics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* 1. Total Leads */}
                <div className="bg-card/70 border border-border/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                        <div>
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Total Prospek / Leads
                            </span>
                            <h3 className="text-3xl font-extrabold text-foreground mt-2">
                                {stats.total_leads}
                            </h3>
                        </div>
                        <div className="p-3 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
                            <Users className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
                        <span>Fase 1: Akuisisi CRM</span>
                        <Link href={route('crm.index')} className="text-primary font-semibold hover:underline flex items-center gap-1">
                            Lihat Pipeline <ArrowUpRight className="w-3 h-3" />
                        </Link>
                    </div>
                </div>

                {/* 2. Closing / DP Paid */}
                <div className="bg-card/70 border border-border/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                        <div>
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Nasabah DP & Lunas
                            </span>
                            <h3 className="text-3xl font-extrabold text-foreground mt-2">
                                {stats.closing_count}
                            </h3>
                        </div>
                        <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
                        <span>Fase 2: Terverifikasi</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">100% Valid</span>
                    </div>
                </div>

                {/* 3. Logistics Ready */}
                <div className="bg-card/70 border border-border/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                        <div>
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Logistik Siap Diambil
                            </span>
                            <h3 className="text-3xl font-extrabold text-foreground mt-2">
                                {stats.logistics_ready_count}
                            </h3>
                        </div>
                        <div className="p-3 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                            <PackageCheck className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
                        <span>Fase 3: Auto-deduct Stok</span>
                        <span className="text-purple-600 dark:text-purple-400 font-semibold">Siap di Gudang</span>
                    </div>
                </div>

                {/* 4. Commission Summary */}
                <div className="bg-card/70 border border-border/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                        <div>
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                {isAgent ? 'Komisi Siap Cair' : 'Total Komisi Agen'}
                            </span>
                            <h3 className="text-2xl font-extrabold text-primary mt-2">
                                Rp {Number(isAgent ? stats.ready_commission : stats.total_commission).toLocaleString('id-ID')}
                            </h3>
                        </div>
                        <div className="p-3 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                            <Coins className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
                        <span>Sudah Cair: Rp {Number(stats.paid_commission).toLocaleString('id-ID')}</span>
                        <Link href={route('keagenan.commissions.index')} className="text-primary font-semibold hover:underline">
                            Rincian
                        </Link>
                    </div>
                </div>
            </div>

            {/* Workflow Sections Grid (Fase 2 & Fase 3) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Logistics Ready Table (Fase 3 View) */}
                <div className={`flex flex-col gap-4 bg-card/60 backdrop-blur-md p-6 rounded-2xl border border-border/80 shadow-xs ${!isAgent && pendingPayments.length > 0 ? 'lg:col-span-7' : 'lg:col-span-12'}`}>
                    <div className="flex justify-between items-center pb-3 border-b border-border/60">
                        <div className="flex items-center gap-2.5">
                            <Truck className="w-5 h-5 text-purple-500" />
                            <div>
                                <h3 className="font-bold text-base text-foreground">Status Distribusi Logistik (Fase 3)</h3>
                                <p className="text-xs text-muted-foreground">Daftar jamaah yang telah lunas DP dan barang perlengkapannya siap diambil di kantor travel.</p>
                            </div>
                        </div>
                        <span className="px-3 py-1 text-xs font-bold rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                            {logisticsReadyList.length} Jamaah Siap
                        </span>
                    </div>

                    <div className="divide-y divide-border/40">
                        {logisticsReadyList.map((item) => (
                            <div key={item.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-muted/30 px-2 rounded-xl transition-colors">
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-sm text-foreground">{item.nama_lengkap}</span>
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                            Logistik Siap
                                        </span>
                                    </div>
                                    <div className="text-xs text-muted-foreground flex items-center gap-2">
                                        <span>Paket: <strong className="text-foreground/90">{item.paket.nama_paket}</strong></span>
                                        <span>•</span>
                                        <span>HP: {item.no_hp}</span>
                                        {item.agen && (
                                            <>
                                                <span>•</span>
                                                <span>Agen: {item.agen.name}</span>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-1.5">
                                    {item.inventaris_transaksi.map((tx) => (
                                        <span key={tx.id} className="text-[11px] font-medium px-2 py-1 rounded-lg bg-muted border border-border/60 text-foreground/80">
                                            {tx.qty}x {tx.inventaris.nama_barang}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}

                        {logisticsReadyList.length === 0 && (
                            <div className="py-10 text-center text-sm text-muted-foreground">
                                Belum ada logistik yang siap diambil. Data akan otomatis muncul setelah verifikasi pembayaran DP.
                            </div>
                        )}
                    </div>
                </div>

                {/* Pending Verification Table (For Admin / Owner) */}
                {!isAgent && (
                    <div className="lg:col-span-5 flex flex-col gap-4 bg-card/60 backdrop-blur-md p-6 rounded-2xl border border-border/80 shadow-xs">
                        <div className="flex justify-between items-center pb-3 border-b border-border/60">
                            <div className="flex items-center gap-2">
                                <Receipt className="w-5 h-5 text-amber-500" />
                                <div>
                                    <h3 className="font-bold text-base text-foreground">Verifikasi Pembayaran (Fase 2)</h3>
                                    <p className="text-xs text-muted-foreground">Menunggu konfirmasi admin.</p>
                                </div>
                            </div>
                            <Link href={route('payment.index')} className="text-xs font-semibold text-primary hover:underline">
                                Semua ({pendingPayments.length})
                            </Link>
                        </div>

                        <div className="flex flex-col gap-3">
                            {pendingPayments.map((p) => (
                                <div key={p.id} className="p-3.5 bg-muted/40 border border-border/60 rounded-xl flex flex-col gap-2">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="font-bold text-sm text-foreground">{p.jamaah.nama_lengkap}</div>
                                            <div className="text-xs text-muted-foreground">{p.jamaah.paket.nama_paket}</div>
                                        </div>
                                        <span className="text-xs font-bold text-primary">
                                            Rp {Number(p.nominal).toLocaleString('id-ID')}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center pt-2 border-t border-border/40 text-[11px] text-muted-foreground">
                                        <span>Bank: {p.rekening_tenant.nama_bank}</span>
                                        <Link
                                            href={route('payment.index')}
                                            className="px-2.5 py-1 bg-primary text-primary-foreground font-semibold rounded-md text-[10px] hover:opacity-90 transition"
                                        >
                                            Verifikasi Sekarang
                                        </Link>
                                    </div>
                                </div>
                            ))}

                            {pendingPayments.length === 0 && (
                                <div className="py-8 text-center text-xs text-muted-foreground">
                                    Semua transaksi pembayaran telah diverifikasi.
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </PageLayout>
    );
}
