import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { PageProps } from '@/Types';
import PageLayout from '@/Components/Layouts/PageLayout';
import {
    Globe,
    LayoutTemplate,
    Sparkles,
    Eye,
    Save,
    Check,
    AlertCircle,
    Building2,
    Plane,
    ShieldCheck,
    MessageSquare,
    Coins,
    FileCheck2,
    Calendar,
    Award,
    Plus,
    X,
    ExternalLink,
} from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/Components/ui/tabs';

export interface LandingConfig {
    hero?: {
        badge_text?: string;
        title?: string;
        subtitle?: string;
        cta_package_text?: string;
        cta_calc_text?: string;
    };
    stats?: {
        jamaah_count?: string;
        satisfaction_rate?: string;
        on_time_rate?: string;
        experience_years?: string;
    };
    visibility?: {
        hero?: boolean;
        search_bar?: boolean;
        stats?: boolean;
        partners?: boolean;
        katalog?: boolean;
        kalkulator?: boolean;
        legalitas?: boolean;
        testimoni?: boolean;
        tracking?: boolean;
    };
    legalitas?: {
        nomor_ppiu?: string;
        akreditasi?: string;
        title?: string;
        subtitle?: string;
    };
    partners?: {
        airlines?: string[];
        hotels?: string[];
    };
}

export const DEFAULT_LANDING_CONFIG: LandingConfig = {
    hero: {
        badge_text: 'Travel Booking Engine Resmi & Terpercaya',
        title: 'Wujudkan Ibadah ke Baitullah dengan Kepastian Jadwal & Layanan Prima',
        subtitle: 'Transparan, akomodasi dekat pelataran masjid, bimbingan manasik intensif, dan kepastian tiket penerbangan.',
        cta_package_text: 'Jelajahi Paket Umroh & Haji',
        cta_calc_text: 'Simulasi Tabungan',
    },
    stats: {
        jamaah_count: '5.000+',
        satisfaction_rate: '99.8%',
        on_time_rate: '100%',
        experience_years: '10+ Thn',
    },
    visibility: {
        hero: true,
        search_bar: true,
        stats: true,
        partners: true,
        katalog: true,
        kalkulator: true,
        legalitas: true,
        testimoni: true,
        tracking: true,
    },
    legalitas: {
        nomor_ppiu: 'Izin PPIU No. 912/2021',
        akreditasi: 'Akreditasi A Kemenag',
        title: 'Komitmen Standar Gerakan 5 Pasti Umrah',
        subtitle: 'Kami menjunjung tinggi perlindungan dan kepastian hukum ibadah bagi seluruh jamaah.',
    },
    partners: {
        airlines: ['Saudia Airlines', 'Garuda Indonesia', 'Qatar Airways'],
        hotels: ['Makkah Clock Royal Tower', 'Pullman Zamzam Makkah', 'The Oberoi Madinah'],
    },
};

interface LandingCmsProps extends PageProps {
    tenant: {
        id: number;
        nama_travel: string;
        domain_atau_subdomain: string;
        logo?: string | null;
        no_telepon?: string | null;
        landing_config?: LandingConfig | null;
    } | null;
    landingConfig?: LandingConfig | null;
    status?: string;
}

export default function LandingCms({
    tenant,
    landingConfig,
    status,
}: LandingCmsProps) {
    const initialConfig: LandingConfig = {
        hero: {
            badge_text: landingConfig?.hero?.badge_text ?? DEFAULT_LANDING_CONFIG.hero?.badge_text,
            title: landingConfig?.hero?.title ?? DEFAULT_LANDING_CONFIG.hero?.title,
            subtitle: landingConfig?.hero?.subtitle ?? DEFAULT_LANDING_CONFIG.hero?.subtitle,
            cta_package_text: landingConfig?.hero?.cta_package_text ?? DEFAULT_LANDING_CONFIG.hero?.cta_package_text,
            cta_calc_text: landingConfig?.hero?.cta_calc_text ?? DEFAULT_LANDING_CONFIG.hero?.cta_calc_text,
        },
        stats: {
            jamaah_count: landingConfig?.stats?.jamaah_count ?? DEFAULT_LANDING_CONFIG.stats?.jamaah_count,
            satisfaction_rate: landingConfig?.stats?.satisfaction_rate ?? DEFAULT_LANDING_CONFIG.stats?.satisfaction_rate,
            on_time_rate: landingConfig?.stats?.on_time_rate ?? DEFAULT_LANDING_CONFIG.stats?.on_time_rate,
            experience_years: landingConfig?.stats?.experience_years ?? DEFAULT_LANDING_CONFIG.stats?.experience_years,
        },
        visibility: {
            hero: landingConfig?.visibility?.hero ?? DEFAULT_LANDING_CONFIG.visibility?.hero ?? true,
            search_bar: landingConfig?.visibility?.search_bar ?? DEFAULT_LANDING_CONFIG.visibility?.search_bar ?? true,
            stats: landingConfig?.visibility?.stats ?? DEFAULT_LANDING_CONFIG.visibility?.stats ?? true,
            partners: landingConfig?.visibility?.partners ?? DEFAULT_LANDING_CONFIG.visibility?.partners ?? true,
            katalog: landingConfig?.visibility?.katalog ?? DEFAULT_LANDING_CONFIG.visibility?.katalog ?? true,
            kalkulator: landingConfig?.visibility?.kalkulator ?? DEFAULT_LANDING_CONFIG.visibility?.kalkulator ?? true,
            legalitas: landingConfig?.visibility?.legalitas ?? DEFAULT_LANDING_CONFIG.visibility?.legalitas ?? true,
            testimoni: landingConfig?.visibility?.testimoni ?? DEFAULT_LANDING_CONFIG.visibility?.testimoni ?? true,
            tracking: landingConfig?.visibility?.tracking ?? DEFAULT_LANDING_CONFIG.visibility?.tracking ?? true,
        },
        legalitas: {
            nomor_ppiu: landingConfig?.legalitas?.nomor_ppiu ?? DEFAULT_LANDING_CONFIG.legalitas?.nomor_ppiu,
            akreditasi: landingConfig?.legalitas?.akreditasi ?? DEFAULT_LANDING_CONFIG.legalitas?.akreditasi,
            title: landingConfig?.legalitas?.title ?? DEFAULT_LANDING_CONFIG.legalitas?.title,
            subtitle: landingConfig?.legalitas?.subtitle ?? DEFAULT_LANDING_CONFIG.legalitas?.subtitle,
        },
        partners: {
            airlines: landingConfig?.partners?.airlines ?? DEFAULT_LANDING_CONFIG.partners?.airlines ?? [],
            hotels: landingConfig?.partners?.hotels ?? DEFAULT_LANDING_CONFIG.partners?.hotels ?? [],
        },
    };

    const [form, setForm] = useState<LandingConfig>(initialConfig);
    const [isSaving, setIsSaving] = useState(false);
    const [newAirline, setNewAirline] = useState('');
    const [newHotel, setNewHotel] = useState('');

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        router.put((route as any)('settings.landing.update'), {
            landing_config: form,
        } as any, {
            preserveScroll: true,
            onFinish: () => setIsSaving(false),
        });
    };

    const addAirline = () => {
        if (!newAirline.trim()) return;
        const current = form.partners?.airlines ?? [];
        if (!current.includes(newAirline.trim())) {
            setForm({
                ...form,
                partners: {
                    ...form.partners,
                    airlines: [...current, newAirline.trim()],
                },
            });
        }
        setNewAirline('');
    };

    const removeAirline = (index: number) => {
        const current = [...(form.partners?.airlines ?? [])];
        current.splice(index, 1);
        setForm({
            ...form,
            partners: {
                ...form.partners,
                airlines: current,
            },
        });
    };

    const addHotel = () => {
        if (!newHotel.trim()) return;
        const current = form.partners?.hotels ?? [];
        if (!current.includes(newHotel.trim())) {
            setForm({
                ...form,
                partners: {
                    ...form.partners,
                    hotels: [...current, newHotel.trim()],
                },
            });
        }
        setNewHotel('');
    };

    const removeHotel = (index: number) => {
        const current = [...(form.partners?.hotels ?? [])];
        current.splice(index, 1);
        setForm({
            ...form,
            partners: {
                ...form.partners,
                hotels: current,
            },
        });
    };

    return (
        <PageLayout
            title="CMS Landing Page — Pengaturan Konten"
            breadcrumbParent="Pengaturan Travel"
            breadcrumbPage="CMS Landing Page"
        >
            <Head title="CMS Landing Page — Pengaturan Konten" />

            <div className="space-y-6 max-w-6xl mx-auto pb-16">
                {/* Header Banner */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card border border-border/80 p-6 rounded-3xl shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3.5 rounded-2xl bg-primary/10 text-primary border border-primary/20">
                            <LayoutTemplate className="w-7 h-7" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2.5">
                                <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
                                    CMS Landing Page
                                </h1>
                                <Badge className="bg-primary/10 text-primary border-primary/20 font-bold text-xs">
                                    {tenant?.nama_travel || 'Travel'}
                                </Badge>
                            </div>
                            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                                Kustomisasi isi teks, angka statistik, partner maskapai, dan visibilitas section di landing page utama.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                        <a
                            href="/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border border-border bg-card hover:bg-muted transition text-foreground"
                        >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Lihat Landing Page</span>
                        </a>

                        <Button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="rounded-xl px-5 py-2 text-xs font-bold bg-primary text-primary-foreground shadow-xs gap-1.5"
                        >
                            <Save className="w-4 h-4" />
                            <span>{isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
                        </Button>
                    </div>
                </div>

                {status && (
                    <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2">
                        <Check className="w-4 h-4" />
                        <span>{status}</span>
                    </div>
                )}

                <form onSubmit={handleSave}>
                    <Tabs defaultValue="hero" className="w-full">
                        <TabsList className="grid grid-cols-2 sm:grid-cols-5 h-auto p-1 bg-muted/40 rounded-2xl border border-border/80 mb-6 gap-1">
                            <TabsTrigger value="hero" className="rounded-xl text-xs font-bold py-2.5">
                                <Sparkles className="w-3.5 h-3.5 mr-1.5" /> Hero &amp; Tagline
                            </TabsTrigger>
                            <TabsTrigger value="stats" className="rounded-xl text-xs font-bold py-2.5">
                                <Coins className="w-3.5 h-3.5 mr-1.5" /> Data Metrik
                            </TabsTrigger>
                            <TabsTrigger value="visibility" className="rounded-xl text-xs font-bold py-2.5">
                                <Eye className="w-3.5 h-3.5 mr-1.5" /> Visibilitas Section
                            </TabsTrigger>
                            <TabsTrigger value="legalitas" className="rounded-xl text-xs font-bold py-2.5">
                                <ShieldCheck className="w-3.5 h-3.5 mr-1.5" /> Legalitas &amp; PPIU
                            </TabsTrigger>
                            <TabsTrigger value="partners" className="rounded-xl text-xs font-bold py-2.5">
                                <Plane className="w-3.5 h-3.5 mr-1.5" /> Partner &amp; Hotel
                            </TabsTrigger>
                        </TabsList>

                        {/* TAB 1: HERO & TAGLINE */}
                        <TabsContent value="hero" className="space-y-6">
                            <Card className="rounded-3xl border border-border shadow-xs">
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-base font-bold">Pengaturan Hero Banner &amp; Tagline</CardTitle>
                                    <CardDescription className="text-xs">
                                        Atur teks pembuka, headline utama, dan kalimat penjelas pada bagian teratas landing page.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-foreground mb-1.5">
                                            Badge Text (Label di atas judul)
                                        </label>
                                        <input
                                            type="text"
                                            value={form.hero?.badge_text || ''}
                                            onChange={(e) => setForm({
                                                ...form,
                                                hero: { ...form.hero, badge_text: e.target.value },
                                            })}
                                            placeholder="Contoh: Travel Booking Engine Resmi & Terpercaya"
                                            className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-foreground mb-1.5">
                                            Headline Utama (Judul H1)
                                        </label>
                                        <textarea
                                            rows={2}
                                            value={form.hero?.title || ''}
                                            onChange={(e) => setForm({
                                                ...form,
                                                hero: { ...form.hero, title: e.target.value },
                                            })}
                                            placeholder="Wujudkan Ibadah ke Baitullah dengan Kepastian Jadwal & Layanan Prima"
                                            className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-foreground mb-1.5">
                                            Deskripsi Sub-Headline
                                        </label>
                                        <textarea
                                            rows={3}
                                            value={form.hero?.subtitle || ''}
                                            onChange={(e) => setForm({
                                                ...form,
                                                hero: { ...form.hero, subtitle: e.target.value },
                                            })}
                                            placeholder="Pilih jadwal keberangkatan terbaik bersama..."
                                            className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                                        <div>
                                            <label className="block text-xs font-bold text-foreground mb-1.5">
                                                Label Tombol CTA 1 (Katalog)
                                            </label>
                                            <input
                                                type="text"
                                                value={form.hero?.cta_package_text || ''}
                                                onChange={(e) => setForm({
                                                    ...form,
                                                    hero: { ...form.hero, cta_package_text: e.target.value },
                                                })}
                                                placeholder="Jelajahi Paket Umroh & Haji"
                                                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-foreground mb-1.5">
                                                Label Tombol CTA 2 (Simulasi)
                                            </label>
                                            <input
                                                type="text"
                                                value={form.hero?.cta_calc_text || ''}
                                                onChange={(e) => setForm({
                                                    ...form,
                                                    hero: { ...form.hero, cta_calc_text: e.target.value },
                                                })}
                                                placeholder="Simulasi Tabungan"
                                                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground"
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* TAB 2: DATA METRIK / STATS */}
                        <TabsContent value="stats" className="space-y-6">
                            <Card className="rounded-3xl border border-border shadow-xs">
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-base font-bold">Data Metrik &amp; Social Proof</CardTitle>
                                    <CardDescription className="text-xs">
                                        Angka-angka pencapaian yang ditampilkan pada bar statistik di bawah Hero untuk membangun kepercayaan jamaah.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-foreground mb-1.5">
                                            Jumlah Jamaah Diberangkatkan
                                        </label>
                                        <input
                                            type="text"
                                            value={form.stats?.jamaah_count || ''}
                                            onChange={(e) => setForm({
                                                ...form,
                                                stats: { ...form.stats, jamaah_count: e.target.value },
                                            })}
                                            placeholder="5.000+"
                                            className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground font-mono"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-foreground mb-1.5">
                                            Indeks Kepuasan Jamaah
                                        </label>
                                        <input
                                            type="text"
                                            value={form.stats?.satisfaction_rate || ''}
                                            onChange={(e) => setForm({
                                                ...form,
                                                stats: { ...form.stats, satisfaction_rate: e.target.value },
                                            })}
                                            placeholder="99.8%"
                                            className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground font-mono"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-foreground mb-1.5">
                                            Tingkat Kepastian Tiket &amp; Jadwal
                                        </label>
                                        <input
                                            type="text"
                                            value={form.stats?.on_time_rate || ''}
                                            onChange={(e) => setForm({
                                                ...form,
                                                stats: { ...form.stats, on_time_rate: e.target.value },
                                            })}
                                            placeholder="100%"
                                            className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground font-mono"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-foreground mb-1.5">
                                            Lama Pengalaman / Dedikasi
                                        </label>
                                        <input
                                            type="text"
                                            value={form.stats?.experience_years || ''}
                                            onChange={(e) => setForm({
                                                ...form,
                                                stats: { ...form.stats, experience_years: e.target.value },
                                            })}
                                            placeholder="10+ Thn"
                                            className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground font-mono"
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* TAB 3: VISIBILITAS SECTION */}
                        <TabsContent value="visibility" className="space-y-6">
                            <Card className="rounded-3xl border border-border shadow-xs">
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-base font-bold">Toggle On / Off Visibilitas Section</CardTitle>
                                    <CardDescription className="text-xs">
                                        Pilih section mana saja yang ingin ditampilkan atau disembunyikan di landing page publik Anda.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {[
                                        { key: 'hero', label: '1. Hero Banner', desc: 'Menampilkan headline judul, deskripsi, dan tombol CTA utama.' },
                                        { key: 'search_bar', label: '2. Live Search & Filter Bar', desc: 'Menampilkan mesin pencarian dan filter cepat brosur paket.' },
                                        { key: 'stats', label: '3. Bar Metrik Social Proof', desc: 'Menampilkan angka statistik kepuasan dan jumlah jamaah.' },
                                        { key: 'partners', label: '4. Partner Maskapai & Hotel', desc: 'Menampilkan badge maskapai resmi dan jaringan hotel bintang 5.' },
                                        { key: 'katalog', label: '5. Katalog Paket Umroh & Haji', desc: 'Menampilkan grid kartu brosur paket dan kuota kursi.' },
                                        { key: 'kalkulator', label: '6. Kalkulator Simulasi Tabungan', desc: 'Menampilkan widget estimasi tabungan dan angsuran bulanan.' },
                                        { key: 'legalitas', label: '7. Standar 5 Pasti Umrah Kemenag', desc: 'Menampilkan komitmen legalitas PPIU dan akreditasi resmi.' },
                                        { key: 'testimoni', label: '8. Kisah & Testimoni Jamaah', desc: 'Menampilkan ulasan dan pengalaman nyata dari para jamaah.' },
                                        { key: 'tracking', label: '9. Portal Tracking Mandiri', desc: 'Menampilkan formulir pengecekan kode registrasi dan invoice.' },
                                    ].map((sec) => {
                                        const isChecked = form.visibility?.[sec.key as keyof typeof form.visibility] ?? true;
                                        return (
                                            <div
                                                key={sec.key}
                                                onClick={() => setForm({
                                                    ...form,
                                                    visibility: {
                                                        ...form.visibility,
                                                        [sec.key]: !isChecked,
                                                    },
                                                })}
                                                className={`p-4 rounded-2xl border flex items-center justify-between gap-4 cursor-pointer transition-all ${
                                                    isChecked
                                                        ? 'bg-primary/5 border-primary/30'
                                                        : 'bg-muted/20 border-border opacity-60'
                                                }`}
                                            >
                                                <div className="space-y-0.5">
                                                    <div className="font-bold text-xs sm:text-sm text-foreground flex items-center gap-2">
                                                        <span>{sec.label}</span>
                                                        {isChecked ? (
                                                            <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] font-bold">
                                                                Aktif / Tampil
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="outline" className="text-muted-foreground text-[10px]">
                                                                Disembunyikan
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-muted-foreground">{sec.desc}</p>
                                                </div>

                                                <div className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all ${
                                                    isChecked
                                                        ? 'bg-primary border-primary text-primary-foreground'
                                                        : 'bg-background border-border text-transparent'
                                                }`}>
                                                    <Check className="w-3.5 h-3.5" />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* TAB 4: LEGALITAS & PPIU */}
                        <TabsContent value="legalitas" className="space-y-6">
                            <Card className="rounded-3xl border border-border shadow-xs">
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-base font-bold">Informasi Legalitas &amp; PPIU</CardTitle>
                                    <CardDescription className="text-xs">
                                        Data izin kementerian agama dan akreditasi resmi yang ditampilkan pada section 5 Pasti Umrah dan footer.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-foreground mb-1.5">
                                                Nomor Izin PPIU Kemenag
                                            </label>
                                            <input
                                                type="text"
                                                value={form.legalitas?.nomor_ppiu || ''}
                                                onChange={(e) => setForm({
                                                    ...form,
                                                    legalitas: { ...form.legalitas, nomor_ppiu: e.target.value },
                                                })}
                                                placeholder="Contoh: Izin PPIU No. 912/2021"
                                                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-foreground mb-1.5">
                                                Status Akreditasi
                                            </label>
                                            <input
                                                type="text"
                                                value={form.legalitas?.akreditasi || ''}
                                                onChange={(e) => setForm({
                                                    ...form,
                                                    legalitas: { ...form.legalitas, akreditasi: e.target.value },
                                                })}
                                                placeholder="Contoh: Akreditasi A Kemenag"
                                                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-foreground mb-1.5">
                                            Judul Section Legalitas
                                        </label>
                                        <input
                                            type="text"
                                            value={form.legalitas?.title || ''}
                                            onChange={(e) => setForm({
                                                ...form,
                                                legalitas: { ...form.legalitas, title: e.target.value },
                                            })}
                                            placeholder="Komitmen Standar Gerakan 5 Pasti Umrah"
                                            className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-foreground mb-1.5">
                                            Deskripsi / Keterangan Legalitas
                                        </label>
                                        <textarea
                                            rows={2}
                                            value={form.legalitas?.subtitle || ''}
                                            onChange={(e) => setForm({
                                                ...form,
                                                legalitas: { ...form.legalitas, subtitle: e.target.value },
                                            })}
                                            placeholder="Kami menjunjung tinggi perlindungan dan kepastian hukum ibadah bagi seluruh jamaah."
                                            className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground"
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* TAB 5: PARTNER MASKAPAI & HOTEL */}
                        <TabsContent value="partners" className="space-y-6">
                            <Card className="rounded-3xl border border-border shadow-xs">
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-base font-bold">Partner Maskapai &amp; Jaringan Hotel</CardTitle>
                                    <CardDescription className="text-xs">
                                        Daftar maskapai dan hotel ring-1 yang muncul di banner mitra landing page.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {/* Maskapai */}
                                    <div className="space-y-3">
                                        <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                                            <Plane className="w-3.5 h-3.5 text-primary" />
                                            <span>Daftar Maskapai Penerbangan</span>
                                        </label>
                                        <div className="flex flex-wrap gap-2">
                                            {(form.partners?.airlines ?? []).map((airline, idx) => (
                                                <Badge
                                                    key={idx}
                                                    variant="secondary"
                                                    className="px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 bg-muted/60 text-foreground"
                                                >
                                                    <Plane className="w-3 h-3 text-muted-foreground" />
                                                    <span>{airline}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeAirline(idx)}
                                                        className="text-muted-foreground hover:text-rose-500"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </Badge>
                                            ))}
                                        </div>
                                        <div className="flex items-center gap-2 pt-1 max-w-md">
                                            <input
                                                type="text"
                                                value={newAirline}
                                                onChange={(e) => setNewAirline(e.target.value)}
                                                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addAirline(); } }}
                                                placeholder="Nama Maskapai (misal: Saudia Airlines)"
                                                className="w-full px-3.5 py-2 text-xs rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground"
                                            />
                                            <Button
                                                type="button"
                                                onClick={addAirline}
                                                variant="outline"
                                                className="rounded-xl text-xs font-bold px-3 py-2 shrink-0"
                                            >
                                                <Plus className="w-3.5 h-3.5 mr-1" /> Tambah
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Hotel */}
                                    <div className="space-y-3 pt-4 border-t border-border/80">
                                        <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                                            <Building2 className="w-3.5 h-3.5 text-primary" />
                                            <span>Jaringan Hotel Bintang 5 Ring-1</span>
                                        </label>
                                        <div className="flex flex-wrap gap-2">
                                            {(form.partners?.hotels ?? []).map((hotel, idx) => (
                                                <Badge
                                                    key={idx}
                                                    variant="secondary"
                                                    className="px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 bg-muted/60 text-foreground"
                                                >
                                                    <Building2 className="w-3 h-3 text-muted-foreground" />
                                                    <span>{hotel}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeHotel(idx)}
                                                        className="text-muted-foreground hover:text-rose-500"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </Badge>
                                            ))}
                                        </div>
                                        <div className="flex items-center gap-2 pt-1 max-w-md">
                                            <input
                                                type="text"
                                                value={newHotel}
                                                onChange={(e) => setNewHotel(e.target.value)}
                                                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addHotel(); } }}
                                                placeholder="Nama Hotel (misal: Pullman Zamzam Makkah)"
                                                className="w-full px-3.5 py-2 text-xs rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground"
                                            />
                                            <Button
                                                type="button"
                                                onClick={addHotel}
                                                variant="outline"
                                                className="rounded-xl text-xs font-bold px-3 py-2 shrink-0"
                                            >
                                                <Plus className="w-3.5 h-3.5 mr-1" /> Tambah
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>

                    <div className="mt-6 flex justify-end">
                        <Button
                            type="submit"
                            disabled={isSaving}
                            className="rounded-xl px-6 py-2.5 text-xs font-bold bg-primary text-primary-foreground shadow-sm gap-2"
                        >
                            <Save className="w-4 h-4" />
                            <span>{isSaving ? 'Menyimpan Konfigurasi...' : 'Simpan Seluruh Pengaturan CMS'}</span>
                        </Button>
                    </div>
                </form>
            </div>
        </PageLayout>
    );
}
