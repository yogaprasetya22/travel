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
            <div className="bg-card/70 border border-border/80 rounded-2xl p-5 shadow-xs flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Users className="w-6 h-6" />
                </div>
                <div>
                    <div className="text-xs font-semibold text-muted-foreground">Total Jamaah Closing</div>
                    <div className="text-2xl font-extrabold text-foreground mt-0.5">
                        {metrics?.total_customers || 0} <span className="text-xs font-normal text-muted-foreground">Orang</span>
                    </div>
                </div>
            </div>

            <div className="bg-card/70 border border-border/80 rounded-2xl p-5 shadow-xs flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                    <div className="text-xs font-semibold text-muted-foreground">Total Pembayaran Masuk (Cash)</div>
                    <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
                        {toRupiah(metrics?.total_paid_received || 0)}
                    </div>
                </div>
            </div>

            <div className="bg-card/70 border border-border/80 rounded-2xl p-5 shadow-xs flex items-center gap-4">
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${
                    (metrics?.total_pending_receivables || 0) > 0 ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" : "bg-muted text-muted-foreground"
                }`}>
                    <Wallet className="w-6 h-6" />
                </div>
                <div>
                    <div className="text-xs font-semibold text-muted-foreground">Sisa Piutang / Belum Lunas</div>
                    <div className={`text-xl font-extrabold mt-0.5 ${(metrics?.total_pending_receivables || 0) > 0 ? "text-amber-600 dark:text-amber-400" : "text-foreground"}`}>
                        {toRupiah(metrics?.total_pending_receivables || 0)}
                    </div>
                </div>
            </div>

            <div className="bg-card/70 border border-border/80 rounded-2xl p-5 shadow-xs flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                    <Coins className="w-6 h-6" />
                </div>
                <div>
                    <div className="text-xs font-semibold text-muted-foreground">Total Hak Komisi Agen</div>
                    <div className="text-xl font-extrabold text-purple-600 dark:text-purple-400 mt-0.5">
                        {toRupiah(metrics?.total_commission_payable || 0)}
                    </div>
                </div>
            </div>
        </div>
    );
}
