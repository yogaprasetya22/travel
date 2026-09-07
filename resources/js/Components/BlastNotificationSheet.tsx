import React, { useState } from 'react';
import { usePage } from '@inertiajs/react';
import { PageProps, Tenant } from '@/Types';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from '@/Components/ui/sheet';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import {
    Megaphone,
    Send,
    AlertCircle,
    Info,
    Sparkles,
    ShieldAlert,
    Building2,
    Users,
    CheckCircle2,
    Eye,
} from 'lucide-react';

interface BlastNotificationSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export function BlastNotificationSheet({
    open,
    onOpenChange,
    onSuccess,
}: BlastNotificationSheetProps) {
    const { auth } = usePage<PageProps & { auth: { tenants?: Tenant[] } }>().props;
    const user = auth?.user;
    const isSuperAdmin = user?.role === 'super_admin_master';
    const tenantsList = auth?.tenants || [];

    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [category, setCategory] = useState<'info' | 'urgent' | 'promo' | 'system'>('info');
    const [targetScope, setTargetScope] = useState<'all_tenants' | 'specific_tenant' | 'current_tenant'>(
        isSuperAdmin ? 'all_tenants' : 'current_tenant'
    );
    const [targetTenantId, setTargetTenantId] = useState<string>(
        tenantsList[0]?.id?.toString() || ''
    );
    const [targetRole, setTargetRole] = useState<'all' | 'staff_admin' | 'agents'>('all');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    const categories = [
        { id: 'info', label: 'Info Umum', icon: Info, color: 'text-blue-500 bg-blue-500/10 border-blue-500/20' },
        { id: 'urgent', label: 'Penting / Urgent', icon: ShieldAlert, color: 'text-rose-500 bg-rose-500/10 border-rose-500/20' },
        { id: 'promo', label: 'Promo & Event', icon: Sparkles, color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' },
        { id: 'system', label: 'Update Sistem', icon: AlertCircle, color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' },
    ] as const;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg(null);
        setSuccessMsg(null);

        if (!title.trim() || !message.trim()) {
            setErrorMsg('Judul dan isi pesan pengumuman wajib diisi.');
            return;
        }

        try {
            setIsSubmitting(true);
            const res = await fetch(route('notifications.blast'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                    Accept: 'application/json',
                },
                body: JSON.stringify({
                    title,
                    message,
                    category,
                    target_scope: isSuperAdmin ? targetScope : 'current_tenant',
                    target_tenant_id: isSuperAdmin && targetScope === 'specific_tenant' ? Number(targetTenantId) : null,
                    target_role: targetRole,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setErrorMsg(data.message || 'Gagal mengirim pengumuman broadcast.');
                return;
            }

            setSuccessMsg(data.message || 'Pengumuman broadcast berhasil dikirim ke seluruh penerima.');
            setTimeout(() => {
                setTitle('');
                setMessage('');
                setSuccessMsg(null);
                onOpenChange(false);
                if (onSuccess) onSuccess();
            }, 1800);
        } catch (error: any) {
            setErrorMsg(error.message || 'Terjadi kesalahan jaringan.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="right"
                className="w-full sm:max-w-lg md:max-w-xl bg-card border-l border-border p-0 flex flex-col h-full shadow-2xl overflow-hidden"
            >
                <SheetHeader className="p-5 border-b border-border bg-muted/20">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                            <Megaphone className="w-5 h-5" />
                        </div>
                        <div>
                            <SheetTitle className="text-base font-bold text-foreground">
                                Kirim Pengumuman & Broadcast
                            </SheetTitle>
                            <SheetDescription className="text-xs text-muted-foreground mt-0.5">
                                {isSuperAdmin
                                    ? 'Kirim notifikasi serentak ke seluruh tenant atau travel tertentu'
                                    : `Kirim notifikasi serentak ke seluruh anggota ${user?.tenant?.nama_travel || 'travel'}`}
                            </SheetDescription>
                        </div>
                    </div>
                </SheetHeader>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-5 low-scrollbar">
                    {errorMsg && (
                        <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <span>{errorMsg}</span>
                        </div>
                    )}

                    {successMsg && (
                        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 shrink-0" />
                            <span>{successMsg}</span>
                        </div>
                    )}

                    {/* Target Scope (Super Admin Master only) */}
                    {isSuperAdmin && (
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                                <Building2 className="w-3.5 h-3.5 text-primary" />
                                Target Travel / Tenant
                            </Label>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    type="button"
                                    onClick={() => setTargetScope('all_tenants')}
                                    className={`p-3 rounded-xl border text-xs font-bold text-left transition cursor-pointer ${
                                        targetScope === 'all_tenants'
                                            ? 'bg-primary/10 border-primary text-primary shadow-xs'
                                            : 'bg-card border-border text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    Seluruh Tenant (Global)
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setTargetScope('specific_tenant')}
                                    className={`p-3 rounded-xl border text-xs font-bold text-left transition cursor-pointer ${
                                        targetScope === 'specific_tenant'
                                            ? 'bg-primary/10 border-primary text-primary shadow-xs'
                                            : 'bg-card border-border text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    Pilih Tenant Tertentu
                                </button>
                            </div>

                            {targetScope === 'specific_tenant' && tenantsList.length > 0 && (
                                <div className="pt-2">
                                    <select
                                        value={targetTenantId}
                                        onChange={(e) => setTargetTenantId(e.target.value)}
                                        className="w-full bg-background border border-border rounded-xl px-3.5 py-2 text-xs text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/20"
                                    >
                                        {tenantsList.map((t) => (
                                            <option key={t.id} value={t.id}>
                                                {t.nama_travel} ({t.domain_atau_subdomain || 'Tenant'})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Target Role Selector */}
                    <div className="space-y-2">
                        <Label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-primary" />
                            Target Penerima
                        </Label>
                        <div className="grid grid-cols-3 gap-2">
                            {[
                                { id: 'all', label: 'Semua Anggota' },
                                { id: 'staff_admin', label: 'Staf & Admin' },
                                { id: 'agents', label: 'Mitra Agen' },
                            ].map((r) => (
                                <button
                                    key={r.id}
                                    type="button"
                                    onClick={() => setTargetRole(r.id as any)}
                                    className={`p-2.5 rounded-xl border text-center text-xs font-bold transition cursor-pointer ${
                                        targetRole === r.id
                                            ? 'bg-primary/10 border-primary text-primary shadow-xs'
                                            : 'bg-card border-border text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    {r.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Category Selector */}
                    <div className="space-y-2">
                        <Label className="text-xs font-bold text-foreground">Kategori Pengumuman</Label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {categories.map((c) => {
                                const Icon = c.icon;
                                const isSelected = category === c.id;
                                return (
                                    <button
                                        key={c.id}
                                        type="button"
                                        onClick={() => setCategory(c.id)}
                                        className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 text-center transition cursor-pointer ${
                                            isSelected
                                                ? `${c.color} border-current font-bold shadow-xs`
                                                : 'bg-card border-border text-muted-foreground hover:text-foreground'
                                        }`}
                                    >
                                        <Icon className="w-4 h-4 shrink-0" />
                                        <span className="text-[11px]">{c.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Title */}
                    <div className="space-y-2">
                        <Label htmlFor="blast-title" className="text-xs font-bold text-foreground">
                            Judul Pengumuman
                        </Label>
                        <Input
                            id="blast-title"
                            placeholder="Contoh: Pembaruan Jadwal Manasik & Keberangkatan Musim 1448 H"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            maxLength={150}
                            required
                            className="rounded-xl text-xs h-10"
                        />
                    </div>

                    {/* Message Body */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="blast-message" className="text-xs font-bold text-foreground">
                                Isi Pesan Notifikasi
                            </Label>
                            <span className="text-[10px] text-muted-foreground">{message.length}/1000</span>
                        </div>
                        <textarea
                            id="blast-message"
                            rows={4}
                            placeholder="Tuliskan rincian pengumuman atau instruksi penting di sini..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            maxLength={1000}
                            required
                            className="w-full rounded-xl border border-input bg-background p-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/20 transition-all font-normal"
                        />
                    </div>

                    {/* Live Preview Card */}
                    <div className="p-4 rounded-2xl bg-muted/40 border border-border/80 space-y-2.5">
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                            <Eye className="w-3.5 h-3.5" />
                            Pratinjau Tampilan di Penerima
                        </div>
                        <div className="p-3.5 rounded-xl bg-card border border-border shadow-xs flex items-start gap-3">
                            <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0 mt-0.5">
                                <Megaphone className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-1">
                                    <h6 className="text-xs font-bold text-foreground truncate">
                                        {title || 'Judul Pengumuman Anda'}
                                    </h6>
                                    <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-md bg-primary/15 text-primary capitalize">
                                        {category}
                                    </span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1 leading-relaxed line-clamp-2">
                                    {message || 'Isi pengumuman yang dikirimkan akan muncul secara real-time di floating alert dan drawer notifikasi seluruh pengguna.'}
                                </p>
                                <span className="text-[10px] text-muted-foreground/70 mt-1.5 block">
                                    Dari: {user?.name || 'Administrator'} • Baru saja
                                </span>
                            </div>
                        </div>
                    </div>
                </form>

                {/* Footer Actions */}
                <div className="p-4 border-t border-border bg-muted/20 flex items-center justify-end gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isSubmitting}
                        className="rounded-xl text-xs font-bold"
                    >
                        Batal
                    </Button>
                    <Button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isSubmitting || !title.trim() || !message.trim()}
                        className="rounded-xl text-xs font-bold gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md"
                    >
                        <Send className="w-3.5 h-3.5" />
                        <span>{isSubmitting ? 'Mengirim Broadcast...' : 'Kirim Broadcast Sekarang'}</span>
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
}

export default BlastNotificationSheet;
