import React from 'react';
import { Plus } from 'lucide-react';
import { BankItem } from './types';

interface BanksTabProps {
    banks: BankItem[];
    onOpenAddBank: () => void;
}

export function BanksTab({ banks, onOpenAddBank }: BanksTabProps) {
    return (
        <div className="flex flex-col gap-5 bg-card/70 border border-border/80 rounded-2xl p-6 shadow-xs">
            <div className="flex justify-between items-center pb-3 border-b border-border/60">
                <div>
                    <h3 className="font-bold text-base text-foreground">Daftar Rekening Bank Resmi Travel</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Rekening tujuan transfer dana calon jamaah dan verifikasi finance.</p>
                </div>
                <button
                    type="button"
                    onClick={onOpenAddBank}
                    className="inline-flex items-center gap-2 px-3.5 py-2 bg-primary text-primary-foreground font-semibold rounded-xl text-xs hover:opacity-90 transition cursor-pointer shadow-xs"
                >
                    <Plus className="w-4 h-4" />
                    <span>Tambah Rekening</span>
                </button>
            </div>

            <div className="divide-y divide-border/60">
                {banks.map((bnk) => (
                    <div key={bnk.id} className="py-3.5 flex items-center justify-between">
                        <div>
                            <div className="font-bold text-sm text-foreground">{bnk.nama_bank} - {bnk.nomor_rekening}</div>
                            <div className="text-xs text-muted-foreground mt-0.5">Atas Nama: <strong className="text-foreground">{bnk.atas_nama}</strong></div>
                        </div>
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            Aktif Menerima Transfer
                        </span>
                    </div>
                ))}
                {banks.length === 0 && (
                    <div className="py-12 text-center text-xs text-muted-foreground italic">
                        Belum ada rekening bank yang didaftarkan.
                    </div>
                )}
            </div>
        </div>
    );
}
