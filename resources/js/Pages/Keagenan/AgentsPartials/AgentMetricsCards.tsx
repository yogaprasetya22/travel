import React from 'react';
import { Users, CheckCircle2 } from 'lucide-react';

interface AgentMetricsCardsProps {
    totalAgents?: number;
    activeProducers?: number;
}

export function AgentMetricsCards({
    totalAgents = 0,
    activeProducers = 0,
}: AgentMetricsCardsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-card/60 backdrop-blur-md border border-border/80 shadow-xs flex items-center justify-between">
                <div>
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Total Mitra Agen Terdaftar
                    </span>
                    <div className="text-2xl font-black text-foreground mt-1">
                        {totalAgents} Agen
                    </div>
                </div>
                <div className="p-3 rounded-xl bg-primary/10 text-primary">
                    <Users className="w-6 h-6" />
                </div>
            </div>

            <div className="p-5 rounded-2xl bg-card/60 backdrop-blur-md border border-border/80 shadow-xs flex items-center justify-between">
                <div>
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Mitra Agen Aktif Closing
                    </span>
                    <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                        {activeProducers} Produser
                    </div>
                </div>
                <div className="p-3 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                    <CheckCircle2 className="w-6 h-6" />
                </div>
            </div>
        </div>
    );
}
