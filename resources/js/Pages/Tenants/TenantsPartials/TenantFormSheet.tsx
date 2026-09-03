import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from '@/Components/ui/sheet';
import {
    Sparkles,
    Crown,
    Check,
    Edit2,
    Building2,
    AlertCircle,
} from 'lucide-react';

interface TenantOwner {
    id: number;
    name: string;
    email: string;
}

export interface TenantItem {
    id: number;
    nama_travel: string;
    domain_atau_subdomain: string;
    logo?: string | null;
    theme_name?: string | null;
    created_at?: string;
    users_count: number;
    jamaah_count: number;
    paket_count: number;
    total_omzet?: number;
    users?: TenantOwner[];
}

interface ThemeItem {
    name: string;
    type: string;
    variables: Record<string, string>;
}

interface CreateTenantSheetProps {
    isOpen: boolean;
    onClose: () => void;
    domainSuffix?: string;
    themeList: ThemeItem[];
}

export function CreateTenantSheet({
    isOpen,
    onClose,
    domainSuffix = '.hajjflow.com',
    themeList,
}: CreateTenantSheetProps) {
    const [createForm, setCreateForm] = useState({
        nama_travel: '',
        domain_atau_subdomain: '',
        owner_name: '',
        owner_email: '',
        owner_password: '',
        theme_name: 'coffee',
    });
    const [createErrors, setCreateErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setCreateForm({
                nama_travel: '',
                domain_atau_subdomain: '',
                owner_name: '',
                owner_email: '',
                owner_password: '',
                theme_name: 'coffee',
            });
            setCreateErrors({});
        }
    }, [isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setCreateErrors({});

        router.post(route('tenants.store'), createForm, {
            onSuccess: () => {
                onClose();
            },
            onError: (errs) => {
                setCreateErrors(errs);
            },
            onFinish: () => {
                setIsSubmitting(false);
            },
        });
    };

    return (
        <Sheet open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
            <SheetContent side="right" className="w-full sm:max-w-xl flex flex-col p-0 gap-0">
                <SheetHeader className="p-6 border-b border-border bg-muted/30">
                    <SheetTitle className="flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-primary" />
                        <span>Onboard Tenant Travel Baru</span>
                    </SheetTitle>
                    <SheetDescription>
                        Daftarkan agensi travel umroh &amp; haji baru beserta akun Super Owner pertamanya.
                    </SheetDescription>
                </SheetHeader>

                <form onSubmit={handleSubmit} className="flex flex-col gap-6 p-6 overflow-y-auto flex-1">
                    {/* Alert Scaffold Info */}
                    <div className="flex items-start gap-3 p-4 rounded-2xl bg-primary/10 border border-primary/20 text-xs text-foreground">
                        <Sparkles className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <div className="leading-relaxed">
                            <strong className="text-primary font-bold">Auto-Scaffold Sistem Otomatis:</strong> Saat travel dibuat, sistem akan langsung men-generate struktur jabatan hierarki (<em>Owner, Supervisor, Staff</em>), tahapan CRM Leads, dan akun Owner pertama yang langsung dapat digunakan untuk login.
                        </div>
                    </div>

                    <div className="flex flex-col gap-4">
                        <div>
                            <label className="block text-xs font-bold text-foreground mb-1.5">
                                Nama Travel Agensi <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                placeholder="Contoh: PT Barokah Madinah Wisata"
                                value={createForm.nama_travel}
                                onChange={(e) => setCreateForm({ ...createForm, nama_travel: e.target.value })}
                                className="w-full px-4 py-2.5 text-xs bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground shadow-2xs"
                            />
                            {createErrors.nama_travel && (
                                <p className="text-[11px] text-rose-500 mt-1 font-medium">{createErrors.nama_travel}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-foreground mb-1.5">
                                Subdomain / Slug Travel <span className="text-rose-500">*</span>
                            </label>
                            <div className="flex items-center shadow-2xs rounded-xl overflow-hidden border border-border">
                                <input
                                    type="text"
                                    required
                                    placeholder="barokah"
                                    value={createForm.domain_atau_subdomain}
                                    onChange={(e) => setCreateForm({ ...createForm, domain_atau_subdomain: e.target.value })}
                                    className="w-full px-4 py-2.5 text-xs bg-background border-none focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground font-mono"
                                />
                                <span className="bg-muted px-4 py-2.5 text-xs text-muted-foreground font-mono font-bold border-l border-border shrink-0">
                                    {domainSuffix}
                                </span>
                            </div>
                            {createErrors.domain_atau_subdomain && (
                                <p className="text-[11px] text-rose-500 mt-1 font-medium">{createErrors.domain_atau_subdomain}</p>
                            )}
                        </div>

                        {/* Owner Credentials */}
                        <div className="pt-3 border-t border-border/70 flex flex-col gap-3">
                            <div className="flex flex-col">
                                <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                                    <Crown className="w-4 h-4 text-amber-500" />
                                    <span>Informasi Kredensial Akun Owner Pertama</span>
                                </div>
                                <p className="text-[11px] text-muted-foreground mt-0.5">Akun pimpinan utama untuk login dan mengelola operasional travel ini.</p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-foreground mb-1.5">
                                        Nama Lengkap Owner <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="H. Fulan Abdullah"
                                        value={createForm.owner_name}
                                        onChange={(e) => setCreateForm({ ...createForm, owner_name: e.target.value })}
                                        className="w-full px-4 py-2.5 text-xs bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground shadow-2xs"
                                    />
                                    {createErrors.owner_name && (
                                        <p className="text-[11px] text-rose-500 mt-1 font-medium">{createErrors.owner_name}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-foreground mb-1.5">
                                        Email Login Owner <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        placeholder="owner@barokah.com"
                                        value={createForm.owner_email}
                                        onChange={(e) => setCreateForm({ ...createForm, owner_email: e.target.value })}
                                        className="w-full px-4 py-2.5 text-xs bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground shadow-2xs"
                                    />
                                    {createErrors.owner_email && (
                                        <p className="text-[11px] text-rose-500 mt-1 font-medium">{createErrors.owner_email}</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-foreground mb-1.5">
                                    Password Default Owner <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="password"
                                    required
                                    placeholder="Minimal 6 karakter"
                                    value={createForm.owner_password}
                                    onChange={(e) => setCreateForm({ ...createForm, owner_password: e.target.value })}
                                    className="w-full px-4 py-2.5 text-xs bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground shadow-2xs"
                                />
                                {createErrors.owner_password && (
                                    <p className="text-[11px] text-rose-500 mt-1 font-medium">{createErrors.owner_password}</p>
                                )}
                            </div>
                        </div>

                        {/* Theme Configuration */}
                        <div className="pt-3 border-t border-border/70 flex flex-col gap-2">
                            <div className="flex flex-col">
                                <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                                    <Sparkles className="w-4 h-4 text-purple-500" />
                                    <span>Konfigurasi Tema Publik</span>
                                </div>
                                <p className="text-[11px] text-muted-foreground mt-0.5">Warna tema publik untuk halaman registrasi dan landing page agen.</p>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[40rem] h-[20rem] overflow-y-auto p-2 border border-border rounded-xl bg-muted/20">
                                {themeList.map((t) => {
                                    const bgStyle = t.variables['--background'] ? `hsl(${t.variables['--background']})` : (t.type === 'dark' ? '#0f172a' : '#ffffff');
                                    const fgStyle = t.variables['--foreground'] ? `hsl(${t.variables['--foreground']})` : (t.type === 'dark' ? '#ffffff' : '#0f172a');
                                    const isSelected = createForm.theme_name === t.name;
                                    return (
                                        <button
                                            key={t.name}
                                            type="button"
                                            onClick={() => setCreateForm({ ...createForm, theme_name: t.name })}
                                            className={`p-2.5 rounded-xl border text-left text-xs font-bold capitalize transition-all flex items-center justify-between gap-1 cursor-pointer ${
                                                isSelected ? 'border-primary ring-2 ring-primary/30 shadow-xs' : 'border-border hover:border-foreground/30'
                                            }`}
                                            style={{ backgroundColor: bgStyle, color: fgStyle }}
                                        >
                                            <span>{t.name}</span>
                                            {isSelected && <Check className="w-3.5 h-3.5" />}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-5 border-t border-border/80">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-border text-foreground hover:bg-muted/40 rounded-xl text-xs font-semibold transition cursor-pointer"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-xs hover:bg-primary/90 disabled:opacity-50 transition cursor-pointer"
                        >
                            {isSubmitting ? 'Menyimpan...' : 'Onboard & Buat Tenant'}
                        </button>
                    </div>
                </form>
            </SheetContent>
        </Sheet>
    );
}

interface EditTenantSheetProps {
    selectedTenant: TenantItem | null;
    onClose: () => void;
    domainSuffix?: string;
    themeList: ThemeItem[];
}

export function EditTenantSheet({
    selectedTenant,
    onClose,
    domainSuffix = '.hajjflow.com',
    themeList,
}: EditTenantSheetProps) {
    const [editForm, setEditForm] = useState({
        nama_travel: '',
        domain_atau_subdomain: '',
        theme_name: '',
    });
    const [editErrors, setEditErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (selectedTenant) {
            setEditForm({
                nama_travel: selectedTenant.nama_travel,
                domain_atau_subdomain: selectedTenant.domain_atau_subdomain,
                theme_name: selectedTenant.theme_name || 'coffee',
            });
            setEditErrors({});
        }
    }, [selectedTenant]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTenant) return;
        setIsSubmitting(true);
        setEditErrors({});

        router.put(route('tenants.update', selectedTenant.id), editForm, {
            onSuccess: () => {
                onClose();
            },
            onError: (errs) => {
                setEditErrors(errs);
            },
            onFinish: () => {
                setIsSubmitting(false);
            },
        });
    };

    return (
        <Sheet open={!!selectedTenant} onOpenChange={(open) => { if (!open) onClose(); }}>
            <SheetContent side="right" className="w-full sm:max-w-xl flex flex-col p-0 gap-0">
                <SheetHeader className="p-6 border-b border-border bg-muted/30">
                    <SheetTitle className="flex items-center gap-2">
                        <Edit2 className="w-5 h-5 text-primary" />
                        <span>Edit Informasi Tenant</span>
                    </SheetTitle>
                    <SheetDescription>
                        Perbarui nama agensi travel, subdomain slug, atau konfigurasi tema publik.
                    </SheetDescription>
                </SheetHeader>

                <form onSubmit={handleSubmit} className="flex flex-col gap-6 p-6 overflow-y-auto flex-1">
                    <div>
                        <label className="block text-xs font-bold text-foreground mb-1.5">
                            Nama Travel Agensi <span className="text-rose-500">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            value={editForm.nama_travel}
                            onChange={(e) => setEditForm({ ...editForm, nama_travel: e.target.value })}
                            className="w-full px-4 py-2.5 text-xs bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground shadow-2xs"
                        />
                        {editErrors.nama_travel && (
                            <p className="text-[11px] text-rose-500 mt-1 font-medium">{editErrors.nama_travel}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-foreground mb-1.5">
                            Subdomain / Slug <span className="text-rose-500">*</span>
                        </label>
                        <div className="flex items-center shadow-2xs rounded-xl overflow-hidden border border-border">
                            <input
                                type="text"
                                required
                                value={editForm.domain_atau_subdomain}
                                onChange={(e) => setEditForm({ ...editForm, domain_atau_subdomain: e.target.value })}
                                className="w-full px-4 py-2.5 text-xs bg-background border-none focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground font-mono"
                            />
                            <span className="bg-muted px-4 py-2.5 text-xs text-muted-foreground font-mono font-bold border-l border-border shrink-0">
                                {domainSuffix}
                            </span>
                        </div>
                        {editErrors.domain_atau_subdomain && (
                            <p className="text-[11px] text-rose-500 mt-1 font-medium">{editErrors.domain_atau_subdomain}</p>
                        )}
                    </div>

                    {/* Theme selector */}
                    <div className="pt-3 border-t border-border/70 flex flex-col gap-2">
                        <div className="flex flex-col">
                            <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                                <Sparkles className="w-4 h-4 text-purple-500" />
                                <span>Konfigurasi Tema Publik</span>
                            </div>
                            <p className="text-[11px] text-muted-foreground mt-0.5">Pilih skema warna tema tampilan publik travel.</p>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[40rem] h-[30rem] overflow-y-auto no-scrollbar p-2 border border-border rounded-xl bg-muted/20">
                            {themeList.map((t) => {
                                const bgStyle = t.variables['--background'] ? `hsl(${t.variables['--background']})` : (t.type === 'dark' ? '#0f172a' : '#ffffff');
                                const fgStyle = t.variables['--foreground'] ? `hsl(${t.variables['--foreground']})` : (t.type === 'dark' ? '#ffffff' : '#0f172a');
                                const isSelected = editForm.theme_name === t.name;
                                return (
                                    <button
                                        key={t.name}
                                        type="button"
                                        onClick={() => setEditForm({ ...editForm, theme_name: t.name })}
                                        className={`p-2.5 rounded-xl border text-left text-xs font-bold capitalize transition-all flex items-center justify-between gap-1 cursor-pointer ${
                                            isSelected ? 'border-primary ring-2 ring-primary/30 shadow-xs' : 'border-border hover:border-foreground/30'
                                        }`}
                                        style={{ backgroundColor: bgStyle, color: fgStyle }}
                                    >
                                        <span>{t.name}</span>
                                        {isSelected && <Check className="w-3.5 h-3.5" />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-5 border-t border-border/80">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-border text-foreground hover:bg-muted/40 rounded-xl text-xs font-semibold transition cursor-pointer"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-xs hover:bg-primary/90 disabled:opacity-50 transition cursor-pointer"
                        >
                            {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </button>
                    </div>
                </form>
            </SheetContent>
        </Sheet>
    );
}

interface DeleteTenantModalProps {
    selectedTenant: TenantItem | null;
    onClose: () => void;
}

export function DeleteTenantModal({ selectedTenant, onClose }: DeleteTenantModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleDelete = () => {
        if (!selectedTenant) return;
        setIsSubmitting(true);
        router.delete(route('tenants.destroy', selectedTenant.id), {
            onSuccess: () => {
                onClose();
            },
            onFinish: () => {
                setIsSubmitting(false);
            },
        });
    };

    return (
        <Sheet open={!!selectedTenant} onOpenChange={(open) => { if (!open) onClose(); }}>
            <SheetContent side="right" className="w-full sm:max-w-md flex flex-col p-0 gap-0">
                <SheetHeader className="p-6 border-b border-border bg-rose-500/10">
                    <SheetTitle className="text-rose-600 dark:text-rose-400 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5" />
                        <span>Hapus Tenant Travel</span>
                    </SheetTitle>
                    <SheetDescription>
                        Konfirmasi pembersihan seluruh data operasional tenant dari sistem.
                    </SheetDescription>
                </SheetHeader>

                <div className="p-6 flex flex-col gap-4 flex-1 overflow-y-auto text-xs leading-relaxed text-muted-foreground">
                    <p>
                        Apakah Anda yakin ingin menghapus <strong className="text-foreground">{selectedTenant?.nama_travel}</strong>?
                    </p>
                    <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300">
                        <strong>Perhatian:</strong> Seluruh akun pengguna, data prospek jamaah, transaksi pembayaran, paket, dan inventaris logistik yang bernaung di bawah tenant ini akan dihapus secara permanen.
                    </div>
                </div>

                <div className="p-4 border-t border-border bg-muted/20 flex items-center justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 border border-border text-foreground hover:bg-muted/40 rounded-xl text-xs font-semibold transition cursor-pointer"
                    >
                        Batal
                    </button>
                    <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={handleDelete}
                        className="px-5 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-bold shadow-xs hover:bg-rose-700 disabled:opacity-50 transition cursor-pointer"
                    >
                        {isSubmitting ? 'Menghapus...' : 'Ya, Hapus Tenant'}
                    </button>
                </div>
            </SheetContent>
        </Sheet>
    );
}
