import React, { useState } from 'react';
import { Customer } from './types';
import { router } from '@inertiajs/react';
import {
    Clock,
    Send,
    RefreshCw,
    UserCircle,
    ArrowRight,
    MessageSquare,
} from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Textarea } from '@/Components/ui/textarea';

interface CustomerHistoryTabProps {
    customer: Customer;
}

export const CustomerHistoryTab: React.FC<CustomerHistoryTabProps> = ({ customer }) => {
    const [newFollowUpNote, setNewFollowUpNote] = useState('');
    const [isSubmittingNote, setIsSubmittingNote] = useState(false);

    const handleAddFollowUpNote = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newFollowUpNote.trim()) return;

        const stageId = customer.crm_stage_id || customer.stage_logs?.[customer.stage_logs.length - 1]?.to_stage?.id || 1;

        setIsSubmittingNote(true);
        router.patch(
            `/crm/jamaah/${customer.id}/stage`,
            {
                crm_stage_id: stageId,
                catatan: newFollowUpNote,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setNewFollowUpNote('');
                    setIsSubmittingNote(false);
                },
                onError: () => {
                    setIsSubmittingNote(false);
                },
            }
        );
    };

    const stageLogs = customer.stage_logs || [];

    return (
        <div className="space-y-6">
            {/* Add Follow-up Note Box */}
            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    <MessageSquare className="w-3.5 h-3.5 text-indigo-500" />
                    Tambah Catatan Follow Up Baru
                </div>
                <form onSubmit={handleAddFollowUpNote} className="space-y-3">
                    <Textarea 
                        placeholder="Tuliskan hasil interaksi, respon prospek, kendala, atau jadwal kontak berikutnya..."
                        rows={3}
                        value={newFollowUpNote}
                        onChange={e => setNewFollowUpNote(e.target.value)}
                        className="bg-white dark:bg-slate-800 text-sm resize-none"
                    />
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-400">
                            Catatan akan tersimpan otomatis dalam jejak kronologis CRM.
                        </span>
                        <Button 
                            type="submit" 
                            size="sm" 
                            disabled={isSubmittingNote || !newFollowUpNote.trim()}
                            className="gap-2 bg-indigo-600 hover:bg-indigo-700"
                        >
                            {isSubmittingNote ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                            Kirim Catatan
                        </Button>
                    </div>
                </form>
            </div>

            {/* Stage Logs & Timeline */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    <Clock className="w-3.5 h-3.5" />
                    Jejak Aktivitas & Perjalanan Pipeline Prospek
                </div>

                {stageLogs.length > 0 ? (
                    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                        {stageLogs.map((log) => {
                            const fromStageName = log.from_stage?.nama_tahap;
                            const toStageName = log.to_stage?.nama_tahap;
                            const isStageMovement = Boolean(fromStageName && toStageName && fromStageName !== toStageName);

                            return (
                                <div key={log.id} className="relative group">
                                    {/* Timeline Dot */}
                                    <div className={`absolute -left-6 top-1.5 w-5 h-5 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center shadow-sm ${
                                        isStageMovement 
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-emerald-500 text-white'
                                    }`}>
                                        {isStageMovement ? (
                                            <ArrowRight className="w-2.5 h-2.5" />
                                        ) : (
                                            <MessageSquare className="w-2.5 h-2.5" />
                                        )}
                                    </div>

                                    {/* Content Card */}
                                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-sm space-y-1.5 group-hover:border-slate-300 dark:group-hover:border-slate-700 transition-colors">
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <div className="flex items-center gap-2">
                                                {isStageMovement ? (
                                                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                                                        <span>{fromStageName || 'Awal'}</span>
                                                        <ArrowRight className="w-3 h-3 text-slate-400" />
                                                        <span className="text-indigo-600 dark:text-indigo-400">{toStageName || '-'}</span>
                                                    </span>
                                                ) : (
                                                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                                                        <MessageSquare className="w-3 h-3 text-emerald-500" />
                                                        {toStageName ? `Tahap: ${toStageName}` : 'Catatan Follow Up'}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 text-[11px] text-slate-400">
                                                <span>{log.created_at || '-'}</span>
                                                {log.user && (
                                                    <span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-300 font-medium">
                                                        <UserCircle className="w-3 h-3" />
                                                        {log.user.name}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {log.catatan && (
                                            <p className="text-xs text-slate-600 dark:text-slate-300 whitespace-pre-line pt-0.5 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                                                {log.catatan}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-8 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                        <Clock className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Belum ada riwayat aktivitas</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                            Setiap perpindahan pipeline status dan catatan follow-up akan terekam otomatis di sini.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CustomerHistoryTab;
