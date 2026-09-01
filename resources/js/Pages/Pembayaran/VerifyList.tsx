import { router } from '@inertiajs/react';
import React, { useState } from 'react';
import { Pembayaran } from '@/Types';
import PageLayout from '@/Components/Layouts/PageLayout';
import DataTablePagination, { PaginatedData } from '@/Components/DataTablePagination';
import PerPageSelector from '@/Components/PerPageSelector';

declare global {
    interface Window {
        searchTimeout: any;
    }
}

import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/Components/ui/sheet"

type PaymentItem = Pembayaran & {
    jamaah: {
        nama_lengkap: string;
        paket: { nama_paket: string; harga: number };
    };
    rekening_tenant: {
        nama_bank: string;
        nomor_rekening: string;
        atas_nama: string;
    };
    verified_by_user?: { name: string } | null;
};

interface VerifyPaymentProps {
    payments: PaginatedData<PaymentItem>;
}

export default function VerifyPayment({ payments }: VerifyPaymentProps) {
    const [selectedSlip, setSelectedSlip] = useState<string | null>(null);

    const paymentList = payments.data || [];

    const handleVerify = (paymentId: number, status: 'Verified' | 'Rejected') => {
        router.post(route('payment.verify', { pembayaran: paymentId }), { status });
    };

    return (
        <PageLayout
            title="Verifikasi Pembayaran"
            breadcrumbParent="Keuangan"
            breadcrumbPage="Verifikasi Pembayaran"
            contentClass="p-6 md:p-8 flex flex-col gap-6 w-full max-w-none"
        >
            {/* Payments Table Card */}
            <div className="bg-card border border-border/80 rounded-2xl overflow-hidden shadow-xs">
                <div className="px-6 py-4 border-b border-border/60 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-muted/30">
                    <h3 className="font-bold text-foreground flex-none">Incoming Transfers ({payments.total || paymentList.length})</h3>
                    <div className="flex w-full sm:w-auto items-center gap-2">
                        <input
                            type="text"
                            placeholder="Cari jamaah..."
                            className="bg-background text-sm rounded-lg border border-border px-3 py-1.5 w-full sm:w-64 focus:ring-1 focus:ring-primary outline-none"
                            onChange={(e) => {
                                const val = e.target.value;
                                clearTimeout(window.searchTimeout);
                                window.searchTimeout = setTimeout(() => {
                                    router.get(route('payment.index'), { search: val }, { preserveState: true, preserveScroll: true, replace: true });
                                }, 300);
                            }}
                        />
                        <PerPageSelector value={payments.per_page} />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-sm">
                        <thead>
                            <tr className="bg-muted/40 text-muted-foreground font-semibold text-xs border-b border-border/80 uppercase tracking-wider">
                                <th className="p-4 pl-6">Jamaah</th>
                                <th className="p-4">Rincian Pembayaran</th>
                                <th className="p-4">Rekening Tujuan</th>
                                <th className="p-4">Bukti Transfer</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 pr-6 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60">
                            {paymentList.map((payment) => (
                                <tr key={payment.id} className="hover:bg-muted/20 transition-colors">
                                    <td className="p-4 pl-6">
                                        <div className="font-semibold text-foreground">{payment.jamaah?.nama_lengkap}</div>
                                        <div className="text-xs text-muted-foreground">{payment.jamaah?.paket?.nama_paket}</div>
                                    </td>
                                    <td className="p-4">
                                        <div className="font-medium text-foreground">Rp {Number(payment.nominal).toLocaleString('id-ID')}</div>
                                        <div className="text-xs text-muted-foreground">
                                            Tipe: <span className="font-semibold text-primary">{payment.tipe_pembayaran}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="font-medium text-foreground">{payment.rekening_tenant?.nama_bank}</div>
                                        <div className="text-xs text-muted-foreground">{payment.rekening_tenant?.nomor_rekening} a.n {payment.rekening_tenant?.atas_nama}</div>
                                    </td>
                                    <td className="p-4">
                                        {payment.bukti_transfer ? (
                                            <button
                                                onClick={() => setSelectedSlip(payment.bukti_transfer?.startsWith('http') ? payment.bukti_transfer : `/storage/${payment.bukti_transfer}`)}
                                                className="text-xs text-primary underline font-medium hover:opacity-80"
                                            >
                                                Lihat Bukti
                                            </button>
                                        ) : (
                                            <span className="text-xs text-muted-foreground italic">Tidak ada bukti</span>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                                            payment.status_verifikasi === 'Verified'
                                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                                                : payment.status_verifikasi === 'Rejected'
                                                ? 'bg-destructive/10 text-destructive border-destructive/20'
                                                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                                        }`}>
                                            {payment.status_verifikasi}
                                        </span>
                                    </td>
                                    <td className="p-4 pr-6 text-right">
                                        {payment.status_verifikasi === 'Pending' ? (
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleVerify(payment.id, 'Verified')}
                                                    className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition"
                                                >
                                                    Setujui
                                                </button>
                                                <button
                                                    onClick={() => handleVerify(payment.id, 'Rejected')}
                                                    className="px-3 py-1.5 bg-destructive text-destructive-foreground rounded-lg text-xs font-semibold hover:opacity-90 transition"
                                                >
                                                    Tolak
                                                </button>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-muted-foreground">
                                                Oleh: {payment.verified_by_user?.name || 'Sistem'}
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}

                            {paymentList.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-muted-foreground italic">
                                        Belum ada pembayaran yang perlu diverifikasi.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                <div className="border-t border-border/80 px-4 bg-muted/20">
                    <DataTablePagination
                        links={payments.links}
                        from={payments.from}
                        to={payments.to}
                        total={payments.total}
                        currentPage={payments.current_page}
                        lastPage={payments.last_page}
                    />
                </div>
            </div>

            {/* Drawer: Bukti Transfer Preview */}
            <Sheet open={!!selectedSlip} onOpenChange={(open) => { if (!open) setSelectedSlip(null) }}>
                <SheetContent side="right" className="w-1/2 max-w-none">
                    <SheetHeader>
                        <SheetTitle>Pratinjau Bukti Transfer</SheetTitle>
                    </SheetHeader>
                    <div className="flex flex-col items-center justify-center flex-1 p-4">
                        {selectedSlip && (
                            <div className="w-full bg-muted rounded-xl overflow-hidden flex justify-center">
                                <img src={selectedSlip} alt="Bukti transfer" className="object-contain max-h-[70vh] w-full" />
                            </div>
                        )}
                    </div>
                    <div className="p-4 border-t border-border flex justify-end">
                        <button onClick={() => setSelectedSlip(null)}
                            className="px-4 py-2 text-sm font-semibold text-foreground border border-border rounded-lg hover:bg-muted/40 transition">
                            Tutup
                        </button>
                    </div>
                </SheetContent>
            </Sheet>
        </PageLayout>
    );
}
