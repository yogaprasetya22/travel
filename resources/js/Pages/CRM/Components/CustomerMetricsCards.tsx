import React from 'react';
import { Users, TrendingUp, Wallet, Coins } from 'lucide-react';
import { toRupiah } from '@/Components/CurrencyInput';

export interface CustomerMetrics {
    total_customers: number;
    total_paid_received: number;
    total_pending_receivables: number;
    total_commission_payable: number;
    lunas_count: number;
}

interface Props {
    metrics: CustomerMetrics;
}

export default function CustomerMetricsCards({ metrics }: Props) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-card border border-border rounded-lg p-4 flex flex-col justify-between gap-2">
                <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">Total Jamaah Closing</span>
                    <Users className="w-4 h-4 text-muted-foreground" />
                </div>
                <div>
                    <div className="text-2xl font-bold tracking-tight text-foreground">
                        {metrics?.total_customers || 0} <span className="text-xs font-normal text-muted-foreground">Orang</span>
                    </div>
                </div>
                <div className="text-[11px] text-muted-foreground">
                    Terdaftar di sistem
                </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-4 flex flex-col justify-between gap-2">
                <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">Kas Masuk Terverifikasi</span>
                    <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                    <div className="text-xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
                        {toRupiah(metrics?.total_paid_received || 0)}
                    </div>
                </div>
                <div className="text-[11px] text-muted-foreground">
                    Dana pembayaran sah
                </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-4 flex flex-col justify-between gap-2">
                <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">Sisa Piutang Jamaah</span>
                    <Wallet className="w-4 h-4 text-muted-foreground" />
                </div>
                <div>
                    <div className={`text-xl font-bold tracking-tight ${(metrics?.total_pending_receivables || 0) > 0 ? "text-amber-600 dark:text-amber-400" : "text-foreground"}`}>
                        {toRupiah(metrics?.total_pending_receivables || 0)}
                    </div>
                </div>
                <div className="text-[11px] text-muted-foreground">
                    Belum lunas
                </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-4 flex flex-col justify-between gap-2">
                <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">Total Komisi Agen</span>
                    <Coins className="w-4 h-4 text-muted-foreground" />
                </div>
                <div>
                    <div className="text-xl font-bold tracking-tight text-foreground">
                        {toRupiah(metrics?.total_commission_payable || 0)}
                    </div>
                </div>
                <div className="text-[11px] text-muted-foreground">
                    Hak mitra aktif
                </div>
            </div>
        </div>
    );
}
