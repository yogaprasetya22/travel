import React, { useState, useEffect, useRef } from 'react';
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
    BookOpen,
    Upload,
    ImageIcon,
    Trash2,
    Globe,
    LayoutTemplate,
    Coins,
    ShieldCheck,
    Plane,
    Plus,
    X,
} from 'lucide-react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import { LandingConfig, DEFAULT_LANDING_CONFIG } from '@/Pages/Settings/LandingCms';

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
    no_telepon?: string | null;
    theme_name?: string | null;
    is_docs_enabled?: boolean;
    landing_config?: LandingConfig | null;
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
        no_telepon: '6281234567890',
        owner_name: '',
        owner_email: '',
        owner_password: '',
        theme_name: 'luxury',
        is_docs_enabled: true,
    });
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [createErrors, setCreateErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        if (isOpen) {
            setCreateForm({
                nama_travel: '',
                domain_atau_subdomain: '',
                no_telepon: '6281234567890',
                owner_name: '',
                owner_email: '',
                owner_password: '',
                theme_name: 'luxury',
                is_docs_enabled: true,
            });
            setLogoFile(null);
            setLogoPreview(null);
            setCreateErrors({});
        }
    }, [isOpen]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setLogoFile(file);
            const reader = new FileReader();
            reader.onload = (event) => {
                setLogoPreview(event.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveLogo = () => {
        setLogoFile(null);
        setLogoPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setCreateErrors({});

        const payload: Record<string, any> = {
            ...createForm,
        };
        if (logoFile) {
            payload.logo = logoFile;
        }

        router.post(route('tenants.store'), payload, {
            forceFormData: !!logoFile,
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
            <SheetContent side="right" className="w-full sm:max-w-5xl flex flex-col p-0 gap-0">
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

                        {/* Logo Travel */}
                        <div>
                            <label className="block text-xs font-bold text-foreground mb-1.5">
                                Logo Travel (Opsional)
                            </label>
                            <div className="flex items-center gap-4 p-4 rounded-2xl border border-border bg-muted/20">
                                <div className="w-14 h-14 rounded-2xl border border-border/80 bg-background/80 p-2 flex items-center justify-center shrink-0 overflow-hidden shadow-xs">
                                    {logoPreview ? (
                                        <img
                                            src={logoPreview}
                                            alt="Preview Logo"
                                            className="w-full h-full object-contain"
                                        />
                                    ) : (
                                        <ApplicationLogo className="w-9 h-9" />
                                    )}
                                </div>
                                <div className="flex-1 flex flex-col gap-1.5">
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/webp"
                                        onChange={handleFileChange}
                                        className="hidden"
                                        id="create-tenant-logo-file"
                                    />
                                    <div className="flex items-center gap-2">
                                        <label
                                            htmlFor="create-tenant-logo-file"
                                            className="px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-primary/20"
                                        >
                                            <Upload className="w-3.5 h-3.5" />
                                            <span>{logoFile ? 'Ganti File Logo' : 'Upload Logo'}</span>
                                        </label>
                                        {logoPreview && (
                                            <button
                                                type="button"
                                                onClick={handleRemoveLogo}
                                                className="px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 text-xs font-medium transition flex items-center gap-1 cursor-pointer border border-rose-500/20"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                                <span>Batal</span>
                                            </button>
                                        )}
                                    </div>
                                    <p className="text-[11px] text-muted-foreground">
                                        Format PNG, SVG, JPG, atau WebP (Maks. 2MB). Jika dikosongkan, logo default aplikasi akan digunakan.
                                    </p>
                                </div>
                            </div>
                            {createErrors.logo && (
                                <p className="text-[11px] text-rose-500 mt-1 font-medium">{createErrors.logo}</p>
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

                        <div>
                            <label className="block text-xs font-bold text-foreground mb-1.5">
                                WhatsApp Business
                            </label>
                            <input
                                type="text"
                                placeholder="6281234567890"
                                value={createForm.no_telepon}
                                onChange={(e) => setCreateForm({ ...createForm, no_telepon: e.target.value })}
                                className="w-full px-4 py-2.5 text-xs bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground shadow-2xs"
                            />
                            <p className="text-[10px] text-muted-foreground mt-1">Digunakan untuk whatsapp bisnis travel </p>
                            {createErrors.no_telepon && (
                                <p className="text-[11px] text-rose-500 mt-1 font-medium">{createErrors.no_telepon}</p>
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

                        {/* Feature Modules Configuration */}
                        <div className="pt-3 border-t border-border/70 flex flex-col gap-2">
                            <div className="flex flex-col">
                                <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                                    <BookOpen className="w-4 h-4 text-emerald-500" />
                                    <span>Fitur Dokumentasi &amp; Buku Panduan (/docs)</span>
                                </div>
                                <p className="text-[11px] text-muted-foreground mt-0.5">Kontrol ketersediaan halaman dokumentasi panduan sistem untuk tenant ini.</p>
                            </div>

                            <label className="flex items-center justify-between p-3 rounded-xl border border-border bg-muted/20 hover:bg-muted/30 transition cursor-pointer">
                                <div className="flex items-center gap-2.5">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${createForm.is_docs_enabled ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-muted text-muted-foreground'}`}>
                                        <BookOpen className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-foreground">Aktifkan Buku Panduan (/docs)</div>
                                        <div className="text-[10px] text-muted-foreground">Tampilkan menu di landing page &amp; izinkan akses halaman panduan</div>
                                    </div>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={createForm.is_docs_enabled}
                                    onChange={(e) => setCreateForm({ ...createForm, is_docs_enabled: e.target.checked })}
                                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
                                />
                            </label>
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

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-2 border border-border rounded-xl bg-muted/20">
                                {themeList.map((t) => {
                                    const bgStyle = t.variables['--background'] ? `hsl(${t.variables['--background']})` : (t.type === 'dark' ? '#0f172a' : '#ffffff');
                                    const fgStyle = t.variables['--foreground'] ? `hsl(${t.variables['--foreground']})` : (t.type === 'dark' ? '#ffffff' : '#0f172a');
                                    const isSelected = createForm.theme_name === t.name;
                                    return (
                                        <button
                                            key={t.name}
                                            type="button"
                                            onClick={() => setCreateForm({ ...createForm, theme_name: t.name })}
                                            className={`p-2.5 rounded-xl border text-left text-xs font-bold capitalize transition-all flex items-center justify-between gap-1 cursor-pointer ${isSelected ? 'border-primary ring-2 ring-primary/30 shadow-xs' : 'border-border hover:border-foreground/30'
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

                    <div className="sticky bottom-0 bg-background/95 backdrop-blur-sm px-6 py-4 border-t border-border flex items-center justify-end gap-3 z-10">
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
    const [activeTab, setActiveTab] = useState<'general' | 'theme' | 'cms'>('general');
    const [editForm, setEditForm] = useState({
        nama_travel: '',
        domain_atau_subdomain: '',
        no_telepon: '',
        theme_name: 'luxury',
        is_docs_enabled: true,
    });
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [removeLogo, setRemoveLogo] = useState(false);
    const [editErrors, setEditErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [landingConfig, setLandingConfig] = useState<LandingConfig>(DEFAULT_LANDING_CONFIG);
    const [newAirline, setNewAirline] = useState('');
    const [newHotel, setNewHotel] = useState('');

    useEffect(() => {
        if (selectedTenant) {
            setEditForm({
                nama_travel: selectedTenant.nama_travel,
                domain_atau_subdomain: selectedTenant.domain_atau_subdomain,
                no_telepon: selectedTenant.no_telepon || '6281234567890',
                theme_name: selectedTenant.theme_name || 'luxury',
                is_docs_enabled: selectedTenant.is_docs_enabled ?? true,
            });
            setLandingConfig({
                hero: {
                    badge_text: selectedTenant.landing_config?.hero?.badge_text ?? DEFAULT_LANDING_CONFIG.hero?.badge_text,
                    title: selectedTenant.landing_config?.hero?.title ?? DEFAULT_LANDING_CONFIG.hero?.title,
                    subtitle: selectedTenant.landing_config?.hero?.subtitle ?? DEFAULT_LANDING_CONFIG.hero?.subtitle,
                    cta_package_text: selectedTenant.landing_config?.hero?.cta_package_text ?? DEFAULT_LANDING_CONFIG.hero?.cta_package_text,
                    cta_calc_text: selectedTenant.landing_config?.hero?.cta_calc_text ?? DEFAULT_LANDING_CONFIG.hero?.cta_calc_text,
                },
                stats: {
                    jamaah_count: selectedTenant.landing_config?.stats?.jamaah_count ?? DEFAULT_LANDING_CONFIG.stats?.jamaah_count,
                    satisfaction_rate: selectedTenant.landing_config?.stats?.satisfaction_rate ?? DEFAULT_LANDING_CONFIG.stats?.satisfaction_rate,
                    on_time_rate: selectedTenant.landing_config?.stats?.on_time_rate ?? DEFAULT_LANDING_CONFIG.stats?.on_time_rate,
                    experience_years: selectedTenant.landing_config?.stats?.experience_years ?? DEFAULT_LANDING_CONFIG.stats?.experience_years,
                },
                visibility: {
                    hero: selectedTenant.landing_config?.visibility?.hero ?? DEFAULT_LANDING_CONFIG.visibility?.hero ?? true,
                    search_bar: selectedTenant.landing_config?.visibility?.search_bar ?? DEFAULT_LANDING_CONFIG.visibility?.search_bar ?? true,
                    stats: selectedTenant.landing_config?.visibility?.stats ?? DEFAULT_LANDING_CONFIG.visibility?.stats ?? true,
                    partners: selectedTenant.landing_config?.visibility?.partners ?? DEFAULT_LANDING_CONFIG.visibility?.partners ?? true,
                    katalog: selectedTenant.landing_config?.visibility?.katalog ?? DEFAULT_LANDING_CONFIG.visibility?.katalog ?? true,
                    kalkulator: selectedTenant.landing_config?.visibility?.kalkulator ?? DEFAULT_LANDING_CONFIG.visibility?.kalkulator ?? true,
                    legalitas: selectedTenant.landing_config?.visibility?.legalitas ?? DEFAULT_LANDING_CONFIG.visibility?.legalitas ?? true,
                    testimoni: selectedTenant.landing_config?.visibility?.testimoni ?? DEFAULT_LANDING_CONFIG.visibility?.testimoni ?? true,
                    tracking: selectedTenant.landing_config?.visibility?.tracking ?? DEFAULT_LANDING_CONFIG.visibility?.tracking ?? true,
                },
                legalitas: {
                    nomor_ppiu: selectedTenant.landing_config?.legalitas?.nomor_ppiu ?? DEFAULT_LANDING_CONFIG.legalitas?.nomor_ppiu,
                    akreditasi: selectedTenant.landing_config?.legalitas?.akreditasi ?? DEFAULT_LANDING_CONFIG.legalitas?.akreditasi,
                    title: selectedTenant.landing_config?.legalitas?.title ?? DEFAULT_LANDING_CONFIG.legalitas?.title,
                    subtitle: selectedTenant.landing_config?.legalitas?.subtitle ?? DEFAULT_LANDING_CONFIG.legalitas?.subtitle,
                },
                partners: {
                    airlines: selectedTenant.landing_config?.partners?.airlines ?? DEFAULT_LANDING_CONFIG.partners?.airlines ?? [],
                    hotels: selectedTenant.landing_config?.partners?.hotels ?? DEFAULT_LANDING_CONFIG.partners?.hotels ?? [],
                },
            });
            setLogoFile(null);
            setLogoPreview(selectedTenant.logo || null);
            setRemoveLogo(false);
            setEditErrors({});
            setActiveTab('general');
        }
    }, [selectedTenant]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setLogoFile(file);
            setRemoveLogo(false);
            const reader = new FileReader();
            reader.onload = (event) => {
                setLogoPreview(event.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveLogo = () => {
        setLogoFile(null);
        setLogoPreview(null);
        setRemoveLogo(true);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTenant) return;
        setIsSubmitting(true);
        setEditErrors({});

        const payload: Record<string, any> = {
            _method: 'PUT',
            ...editForm,
            landing_config: landingConfig,
        };
        if (logoFile) {
            payload.logo = logoFile;
        }
        if (removeLogo) {
            payload.logo_remove = 1;
        }

        router.post(route('tenants.update', selectedTenant.id), payload, {
            forceFormData: true,
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
            <SheetContent side="right" className="w-full sm:max-w-5xl flex flex-col p-0 gap-0">
                <SheetHeader className="p-6 border-b border-border bg-muted/30">
                    <div className="flex items-center justify-between">
                        <SheetTitle className="flex items-center gap-2">
                            <Edit2 className="w-5 h-5 text-primary" />
                            <span>Edit Informasi Tenant</span>
                        </SheetTitle>
                    </div>
                    <SheetDescription>
                        Perbarui informasi umum, logo travel, modul sistem, dan konfigurasi CMS landing page tenant ini.
                    </SheetDescription>
                </SheetHeader>

                {/* Sub Navigation Tabs inside Drawer */}
                <div className="px-6 pt-4 border-b border-border bg-background">
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setActiveTab('general')}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                                activeTab === 'general'
                                    ? 'bg-primary text-primary-foreground shadow-xs'
                                    : 'bg-muted/40 text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            <Building2 className="w-3.5 h-3.5" />
                            <span>Profil &amp; Logo</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('theme')}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                                activeTab === 'theme'
                                    ? 'bg-primary text-primary-foreground shadow-xs'
                                    : 'bg-muted/40 text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Tema &amp; Modul</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('cms')}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                                activeTab === 'cms'
                                    ? 'bg-primary text-primary-foreground shadow-xs'
                                    : 'bg-muted/40 text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            <LayoutTemplate className="w-3.5 h-3.5" />
                            <span>CMS Landing Page</span>
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-6 p-6 overflow-y-auto flex-1">
                    {activeTab === 'general' && (
                        <div className="space-y-5">
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

                            {/* Logo Travel */}
                            <div>
                                <label className="block text-xs font-bold text-foreground mb-1.5">
                                    Logo Travel
                                </label>
                                <div className="flex items-center gap-4 p-4 rounded-2xl border border-border bg-muted/20">
                                    <div className="w-14 h-14 rounded-2xl border border-border/80 bg-background/80 p-2 flex items-center justify-center shrink-0 overflow-hidden shadow-xs">
                                        {!removeLogo && (logoPreview || selectedTenant?.logo) ? (
                                            <img
                                                src={logoPreview || selectedTenant?.logo || ''}
                                                alt="Logo Travel"
                                                className="w-full h-full object-contain"
                                            />
                                        ) : (
                                            <ApplicationLogo className="w-9 h-9" />
                                        )}
                                    </div>
                                    <div className="flex-1 flex flex-col gap-1.5">
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/webp"
                                            onChange={handleFileChange}
                                            className="hidden"
                                            id="edit-tenant-logo-file"
                                        />
                                        <div className="flex items-center gap-2">
                                            <label
                                                htmlFor="edit-tenant-logo-file"
                                                className="px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-primary/20"
                                            >
                                                <Upload className="w-3.5 h-3.5" />
                                                <span>{logoFile || selectedTenant?.logo ? 'Ganti File Logo' : 'Upload Logo'}</span>
                                            </label>
                                            {(!removeLogo && (logoPreview || selectedTenant?.logo)) && (
                                                <button
                                                    type="button"
                                                    onClick={handleRemoveLogo}
                                                    className="px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 text-xs font-medium transition flex items-center gap-1 cursor-pointer border border-rose-500/20"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                    <span>Reset ke Default</span>
                                                </button>
                                            )}
                                        </div>
                                        <p className="text-[11px] text-muted-foreground">
                                            Format PNG, SVG, JPG, atau WebP (Maks. 2MB). Logo ini akan tampil di Login, Landing Page, dan seluruh halaman publik tenant.
                                        </p>
                                    </div>
                                </div>
                                {editErrors.logo && (
                                    <p className="text-[11px] text-rose-500 mt-1 font-medium">{editErrors.logo}</p>
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

                            <div>
                                <label className="block text-xs font-bold text-foreground mb-1.5">
                                    WhatsApp Business
                                </label>
                                <input
                                    type="text"
                                    placeholder="6281234567890"
                                    value={editForm.no_telepon}
                                    onChange={(e) => setEditForm({ ...editForm, no_telepon: e.target.value })}
                                    className="w-full px-4 py-2.5 text-xs bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground shadow-2xs"
                                />
                                <p className="text-[10px] text-muted-foreground mt-1">Digunakan untuk whatsapp bisnis travel </p>
                                {editErrors.no_telepon && (
                                    <p className="text-[11px] text-rose-500 mt-1 font-medium">{editErrors.no_telepon}</p>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'theme' && (
                        <div className="space-y-5">
                            {/* Feature Modules Configuration */}
                            <div className="flex flex-col gap-2">
                                <div className="flex flex-col">
                                    <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                                        <BookOpen className="w-4 h-4 text-emerald-500" />
                                        <span>Fitur Dokumentasi &amp; Buku Panduan (/docs)</span>
                                    </div>
                                    <p className="text-[11px] text-muted-foreground mt-0.5">Kontrol ketersediaan halaman dokumentasi panduan sistem untuk tenant ini.</p>
                                </div>

                                <label className="flex items-center justify-between p-3 rounded-xl border border-border bg-muted/20 hover:bg-muted/30 transition cursor-pointer">
                                    <div className="flex items-center gap-2.5">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${editForm.is_docs_enabled ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-muted text-muted-foreground'}`}>
                                            <BookOpen className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold text-foreground">Aktifkan Buku Panduan (/docs)</div>
                                            <div className="text-[10px] text-muted-foreground">Tampilkan menu di landing page &amp; izinkan akses halaman panduan</div>
                                        </div>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={editForm.is_docs_enabled}
                                        onChange={(e) => setEditForm({ ...editForm, is_docs_enabled: e.target.checked })}
                                        className="w-4 h-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
                                    />
                                </label>
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

                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto low-scrollbar p-2 border border-border rounded-xl bg-muted/20">
                                    {themeList.map((t) => {
                                        const bgStyle = t.variables['--background'] ? `hsl(${t.variables['--background']})` : (t.type === 'dark' ? '#0f172a' : '#ffffff');
                                        const fgStyle = t.variables['--foreground'] ? `hsl(${t.variables['--foreground']})` : (t.type === 'dark' ? '#ffffff' : '#0f172a');
                                        const isSelected = editForm.theme_name === t.name;
                                        return (
                                            <button
                                                key={t.name}
                                                type="button"
                                                onClick={() => setEditForm({ ...editForm, theme_name: t.name })}
                                                className={`p-2.5 rounded-xl border text-left text-xs font-bold capitalize transition-all flex items-center justify-between gap-1 cursor-pointer ${isSelected ? 'border-primary ring-2 ring-primary/30 shadow-xs' : 'border-border hover:border-foreground/30'
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
                    )}

                    {activeTab === 'cms' && (
                        <div className="space-y-6">
                            {/* 1. Hero CMS */}
                            <div className="p-4 rounded-2xl border border-border bg-card space-y-3">
                                <div className="font-bold text-xs text-foreground flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-primary" />
                                    <span>Hero Banner &amp; Tagline</span>
                                </div>
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-[11px] font-semibold text-muted-foreground mb-1">Badge Teks</label>
                                        <input
                                            type="text"
                                            value={landingConfig.hero?.badge_text || ''}
                                            onChange={(e) => setLandingConfig({
                                                ...landingConfig,
                                                hero: { ...landingConfig.hero, badge_text: e.target.value },
                                            })}
                                            className="w-full px-3 py-2 text-xs rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-semibold text-muted-foreground mb-1">Headline Utama (H1)</label>
                                        <textarea
                                            rows={2}
                                            value={landingConfig.hero?.title || ''}
                                            onChange={(e) => setLandingConfig({
                                                ...landingConfig,
                                                hero: { ...landingConfig.hero, title: e.target.value },
                                            })}
                                            className="w-full px-3 py-2 text-xs rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-semibold text-muted-foreground mb-1">Deskripsi Hero</label>
                                        <textarea
                                            rows={2}
                                            value={landingConfig.hero?.subtitle || ''}
                                            onChange={(e) => setLandingConfig({
                                                ...landingConfig,
                                                hero: { ...landingConfig.hero, subtitle: e.target.value },
                                            })}
                                            className="w-full px-3 py-2 text-xs rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* 2. Stats CMS */}
                            <div className="p-4 rounded-2xl border border-border bg-card space-y-3">
                                <div className="font-bold text-xs text-foreground flex items-center gap-2">
                                    <Coins className="w-4 h-4 text-primary" />
                                    <span>Data Metrik / Social Proof</span>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[11px] font-semibold text-muted-foreground mb-1">Jamaah Diberangkatkan</label>
                                        <input
                                            type="text"
                                            value={landingConfig.stats?.jamaah_count || ''}
                                            onChange={(e) => setLandingConfig({
                                                ...landingConfig,
                                                stats: { ...landingConfig.stats, jamaah_count: e.target.value },
                                            })}
                                            className="w-full px-3 py-2 text-xs rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground font-mono"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-semibold text-muted-foreground mb-1">Indeks Kepuasan</label>
                                        <input
                                            type="text"
                                            value={landingConfig.stats?.satisfaction_rate || ''}
                                            onChange={(e) => setLandingConfig({
                                                ...landingConfig,
                                                stats: { ...landingConfig.stats, satisfaction_rate: e.target.value },
                                            })}
                                            className="w-full px-3 py-2 text-xs rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground font-mono"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-semibold text-muted-foreground mb-1">Kepastian Tiket</label>
                                        <input
                                            type="text"
                                            value={landingConfig.stats?.on_time_rate || ''}
                                            onChange={(e) => setLandingConfig({
                                                ...landingConfig,
                                                stats: { ...landingConfig.stats, on_time_rate: e.target.value },
                                            })}
                                            className="w-full px-3 py-2 text-xs rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground font-mono"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-semibold text-muted-foreground mb-1">Lama Dedikasi</label>
                                        <input
                                            type="text"
                                            value={landingConfig.stats?.experience_years || ''}
                                            onChange={(e) => setLandingConfig({
                                                ...landingConfig,
                                                stats: { ...landingConfig.stats, experience_years: e.target.value },
                                            })}
                                            className="w-full px-3 py-2 text-xs rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground font-mono"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* 3. Section Visibility */}
                            <div className="p-4 rounded-2xl border border-border bg-card space-y-3">
                                <div className="font-bold text-xs text-foreground flex items-center gap-2">
                                    <Globe className="w-4 h-4 text-primary" />
                                    <span>Visibilitas Section Landing Page</span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {[
                                        { key: 'hero', label: 'Hero Banner' },
                                        { key: 'search_bar', label: 'Search & Filter Bar' },
                                        { key: 'stats', label: 'Bar Metrik Stats' },
                                        { key: 'partners', label: 'Partner Maskapai/Hotel' },
                                        { key: 'katalog', label: 'Katalog Brosur Paket' },
                                        { key: 'kalkulator', label: 'Kalkulator Tabungan' },
                                        { key: 'legalitas', label: 'Standar 5 Pasti Umrah' },
                                        { key: 'testimoni', label: 'Testimoni Jamaah' },
                                        { key: 'tracking', label: 'Portal Tracking Mandiri' },
                                    ].map((sec) => {
                                        const isChecked = landingConfig.visibility?.[sec.key as keyof typeof landingConfig.visibility] ?? true;
                                        return (
                                            <label
                                                key={sec.key}
                                                className={`p-2.5 rounded-xl border flex items-center justify-between text-xs cursor-pointer transition ${
                                                    isChecked ? 'bg-primary/5 border-primary/30 font-bold' : 'bg-muted/20 border-border opacity-60'
                                                }`}
                                            >
                                                <span>{sec.label}</span>
                                                <input
                                                    type="checkbox"
                                                    checked={isChecked}
                                                    onChange={(e) => setLandingConfig({
                                                        ...landingConfig,
                                                        visibility: {
                                                            ...landingConfig.visibility,
                                                            [sec.key]: e.target.checked,
                                                        },
                                                    })}
                                                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
                                                />
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* 4. Legalitas */}
                            <div className="p-4 rounded-2xl border border-border bg-card space-y-3">
                                <div className="font-bold text-xs text-foreground flex items-center gap-2">
                                    <ShieldCheck className="w-4 h-4 text-primary" />
                                    <span>Legalitas &amp; PPIU</span>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[11px] font-semibold text-muted-foreground mb-1">Nomor Izin PPIU</label>
                                        <input
                                            type="text"
                                            value={landingConfig.legalitas?.nomor_ppiu || ''}
                                            onChange={(e) => setLandingConfig({
                                                ...landingConfig,
                                                legalitas: { ...landingConfig.legalitas, nomor_ppiu: e.target.value },
                                            })}
                                            className="w-full px-3 py-2 text-xs rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-semibold text-muted-foreground mb-1">Akreditasi</label>
                                        <input
                                            type="text"
                                            value={landingConfig.legalitas?.akreditasi || ''}
                                            onChange={(e) => setLandingConfig({
                                                ...landingConfig,
                                                legalitas: { ...landingConfig.legalitas, akreditasi: e.target.value },
                                            })}
                                            className="w-full px-3 py-2 text-xs rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="sticky bottom-0 bg-background/95 backdrop-blur-sm px-6 py-4 border-t border-border flex items-center justify-end gap-3 z-10 -mx-6 -mb-6">
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
