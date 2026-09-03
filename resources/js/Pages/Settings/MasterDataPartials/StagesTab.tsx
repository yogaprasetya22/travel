import React from 'react';
import { Plus, Calendar } from 'lucide-react';
import { Stage } from './types';

interface StagesTabProps {
    stages: Stage[];
    onOpenAddStage: () => void;
}

export function StagesTab({ stages, onOpenAddStage }: StagesTabProps) {
    return (
        <div className="flex flex-col gap-5 bg-card/70 border border-border/80 rounded-2xl p-6 shadow-xs">
            <div className="flex justify-between items-center pb-3 border-b border-border/60">
                <div>
                    <h3 className="font-bold text-base text-foreground">Daftar Tahapan Pipeline CRM</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Urutan alur konversi leads dari pendaftaran awal hingga closing.</p>
                </div>
                <button
                    type="button"
                    onClick={onOpenAddStage}
                    className="inline-flex items-center gap-2 px-3.5 py-2 bg-primary text-primary-foreground font-semibold rounded-xl text-xs hover:opacity-90 transition cursor-pointer shadow-xs"
                >
                    <Plus className="w-4 h-4" />
                    <span>Tambah Tahap</span>
                </button>
            </div>

            <div className="divide-y divide-border/60">
                {stages.map((stg) => {
                    const hasPeriod = stg.periode_mulai || stg.periode_selesai;
                    const isActive = stg.is_active !== false;

                    return (
                        <div key={stg.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <span className="h-8 w-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                                    {stg.urutan}
                                </span>
                                <div>
                                    <div className="font-bold text-sm text-foreground">{stg.nama_tahap}</div>
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                                        <Calendar className="w-3.5 h-3.5 text-primary" />
                                        <span>
                                            {hasPeriod
                                                ? `${stg.periode_mulai ? new Date(stg.periode_mulai).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Awal'} s/d ${stg.periode_selesai ? new Date(stg.periode_selesai).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Seterusnya'}`
                                                : 'Periode Aktif: Berlaku Selamanya'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 self-end sm:self-auto">
                                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                                    isActive
                                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                                        : 'bg-muted text-muted-foreground border-border'
                                }`}>
                                    {isActive ? 'Tahap Aktif' : 'Non-Aktif'}
                                </span>
                            </div>
                        </div>
                    );
                })}
                {stages.length === 0 && (
                    <div className="py-12 text-center text-xs text-muted-foreground italic">
                        Belum ada tahapan CRM yang dikonfigurasi.
                    </div>
                )}
            </div>
        </div>
    );
}
