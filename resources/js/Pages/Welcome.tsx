import React, { useState, useMemo } from 'react';
import themeData from '@/lib/theme-colors.json';

import { Head, Link, router } from '@inertiajs/react';
import { PageProps } from '@/Types';
import {
    Compass,
    ShieldCheck,
    Star,
    Award,
    CheckCircle2,
    Calendar,
    Users,
    Plane,
    Building2,
    Sparkles,
    ArrowRight,
    PhoneCall,
    CreditCard,
    MessageCircle,
    ChevronRight,
    MapPin,
    Clock,
    Lock,
    LogIn,
    Landmark,
    BookOpen,
    Eye,
    Tag,
    X,
    Search,
    Coins,
    Calculator,
    FileCheck2,
    Filter,
    Flame,
    Check,
    HelpCircle,
    ArrowUpRight,
} from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import ApplicationLogo from '@/Components/ApplicationLogo';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import { LandingConfig, DEFAULT_LANDING_CONFIG } from '@/Pages/Settings/LandingCms';

interface ItineraryRundown {
    time: string;
    activity: string;
    notes?: string;
}

interface ItineraryItem {
    day: number;
    title: string;
    description: string;
    location?: string;
    rundowns?: ItineraryRundown[];
    is_rest_day?: boolean;
}

interface PaketItem {
    id: number;
    nama_paket: string;
    harga: number;
    durasi_hari?: number;
    hotel_makkah?: string | null;
    hotel_madinah?: string | null;
    bintang_makkah?: number | null;
    bintang_madinah?: number | null;
    maskapai?: string | null;
    kuota?: number;
    available_seats?: number;
    jamaah_count?: number;
    deskripsi?: string | null;
    brosur_url?: string | null;
    periode_mulai?: string | null;
    periode_selesai?: string | null;
    itinerary?: ItineraryItem[] | null;
    fasilitas?: string[] | null;
    inventaris?: Array<{
        id: number;
        nama_barang: string;
    }>;
}

interface BankItem {
    id: number;
    nama_bank: string;
    nomor_rekening: string;
    atas_nama: string;
}

interface TenantItem {
    id: number;
    nama_travel: string;
    domain_atau_subdomain?: string;
    no_telepon?: string | null;
    theme_name?: string | null;
    logo?: string | null;
    is_docs_enabled?: boolean;
    landing_config?: LandingConfig | null;
}

interface Props extends PageProps {
    tenant?: TenantItem | null;
    packages: PaketItem[];
    banks: BankItem[];
    canLogin?: boolean;
}

export default function Welcome({
    auth,
    tenant,
    packages = [],
    banks = [],
    canLogin = true,
}: Props) {
    const travelName = tenant?.nama_travel || 'HajjFlow Umroh & Haji';
    const rawPhone = tenant?.no_telepon || '6281234567890';
    const cleanPhone = rawPhone.replace(/[^0-9]/g, '').replace(/^0/, '62');
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Assalamu'alaikum CS ${travelName}, saya ingin konsultasi seputar informasi paket Umroh & Haji.`)}`;

    // Merged Landing Page Dynamic Configuration
    const cfg = useMemo(() => {
        const raw = tenant?.landing_config;
        return {
            hero: { ...DEFAULT_LANDING_CONFIG.hero, ...(raw?.hero || {}) },
            stats: { ...DEFAULT_LANDING_CONFIG.stats, ...(raw?.stats || {}) },
            visibility: { ...DEFAULT_LANDING_CONFIG.visibility, ...(raw?.visibility || {}) },
            legalitas: { ...DEFAULT_LANDING_CONFIG.legalitas, ...(raw?.legalitas || {}) },
            partners: {
                airlines: raw?.partners?.airlines?.length ? raw.partners.airlines : DEFAULT_LANDING_CONFIG.partners!.airlines!,
                hotels: raw?.partners?.hotels?.length ? raw.partners.hotels : DEFAULT_LANDING_CONFIG.partners!.hotels!,
            },
        };
    }, [tenant?.landing_config]);

    const [selectedPackage, setSelectedPackage] = useState<PaketItem | null>(null);

    // --- 1. SEARCH & FILTER ENGINE STATE ---
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [selectedMonth, setSelectedMonth] = useState<string>('all');
    const [maxPrice, setMaxPrice] = useState<number>(0);

    // Dynamic month extractor from packages
    const availableMonths = useMemo(() => {
        const months = new Set<string>();
        packages.forEach((pkg) => {
            if (pkg.periode_mulai) {
                const d = new Date(pkg.periode_mulai);
                if (!isNaN(d.getTime())) {
                    const monthStr = d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
                    months.add(monthStr);
                }
            }
        });
        return Array.from(months);
    }, [packages]);

    // Filtered Packages
    const filteredPackages = useMemo(() => {
        return packages.filter((pkg) => {
            // Keyword Search
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase();
                const matchName = pkg.nama_paket.toLowerCase().includes(q);
                const matchDesc = pkg.deskripsi?.toLowerCase().includes(q) ?? false;
                if (!matchName && !matchDesc) return false;
            }

            // Category Filter
            if (selectedCategory !== 'all') {
                const name = pkg.nama_paket.toLowerCase();
                if (selectedCategory === 'reguler' && !name.includes('reguler') && (name.includes('plus') || name.includes('haji') || name.includes('vip'))) {
                    return false;
                }
                if (selectedCategory === 'plus' && !name.includes('plus') && !name.includes('turki') && !name.includes('dubai') && !name.includes('mesir')) {
                    return false;
                }
                if (selectedCategory === 'haji' && !name.includes('haji') && !name.includes('furoda')) {
                    return false;
                }
            }

            // Month Filter
            if (selectedMonth !== 'all' && pkg.periode_mulai) {
                const d = new Date(pkg.periode_mulai);
                if (!isNaN(d.getTime())) {
                    const monthStr = d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
                    if (monthStr !== selectedMonth) return false;
                }
            }

            // Max Price
            if (maxPrice > 0 && pkg.harga > maxPrice) {
                return false;
            }

            return true;
        });
    }, [packages, searchQuery, selectedCategory, selectedMonth, maxPrice]);

    // --- 2. SELF-SERVICE TRACKING WIDGET STATE ---
    const [trackingCode, setTrackingCode] = useState('');
    const [trackingError, setTrackingError] = useState('');

    const handleTrackingSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setTrackingError('');
        const code = trackingCode.trim().toUpperCase();
        if (!code) {
            setTrackingError('Silakan masukkan Kode Pendaftaran atau Nomor Invoice.');
            return;
        }

        if (code.startsWith('INV-')) {
            router.visit(route('public.verify-invoice', code));
        } else if (code.startsWith('REG-') || code.length >= 6) {
            router.visit(route('public.register.success', { booking_ref: code }));
        } else {
            setTrackingError('Format tidak valid. Contoh format: REG-20260900001-XXXXXX atau INV-20260900001-XXXXXX');
        }
    };

    // --- 3. SAVINGS CALCULATOR STATE ---
    const defaultPackage = packages[0] || null;
    const [calcPackageId, setCalcPackageId] = useState<number>(defaultPackage?.id || 0);
    const [calcDp, setCalcDp] = useState<number>(5000000);
    const [calcTenor, setCalcTenor] = useState<number>(12); // months

    const selectedCalcPackage = packages.find((p) => p.id === calcPackageId) || defaultPackage;
    const packagePrice = selectedCalcPackage?.harga || 30000000;
    const remainingToSave = Math.max(0, packagePrice - calcDp);
    const monthlySaving = Math.ceil(remainingToSave / (calcTenor || 1));

    const calcWaUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
        `Assalamu'alaikum CS ${travelName},\nSaya ingin konsultasi Program Tabungan/Angsuran Umroh:\n- Paket: ${selectedCalcPackage?.nama_paket || 'Paket Umroh'}\n- Estimasi Harga: Rp ${packagePrice.toLocaleString('id-ID')}\n- Rencana DP: Rp ${calcDp.toLocaleString('id-ID')}\n- Target Tenor: ${calcTenor} Bulan\n- Estimasi Tabungan/Bulan: Rp ${monthlySaving.toLocaleString('id-ID')}\n\nMohon info panduan pendaftaran dan persyaratannya.`
    )}`;

    return (
        <div 
            className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-white font-sans"
            style={(themeData.themes[(tenant?.theme_name as keyof typeof themeData.themes) || 'coffee']?.variables || themeData.themes['coffee'].variables) as React.CSSProperties}
        >
            <Head title={`Travel Booking Engine - ${travelName}`} />

            {/* Top Announcement Bar */}
            <div className="bg-primary text-primary-foreground text-[10px] sm:text-xs py-2 px-4 text-center font-medium flex flex-wrap items-center justify-center gap-1 sm:gap-2">
                <Sparkles className="w-3.5 h-3.5 text-primary-foreground animate-pulse hidden sm:block" />
                <span>Pendaftaran Musim Umroh &amp; Haji 1448 H Telah Dibuka</span>
                <span className="hidden sm:inline"> | Resmi Berizin Kemenag RI</span>
                <Link
                    href={route('public.register')}
                    className="underline font-bold hover:opacity-80 transition-opacity ml-1 whitespace-nowrap"
                >
                    Daftar Online Sekarang &rarr;
                </Link>
            </div>

            {/* Navbar */}
            <nav className="sticky top-0 z-40 bg-card/80 backdrop-blur-md border-b border-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16 sm:h-20">
                        {/* Brand Logo & Name */}
                        <div className="flex items-center gap-3">
                            {tenant?.logo ? (
                                <img src={tenant.logo} alt={travelName} className="h-10 w-auto rounded-xl shadow-xs" />
                            ) : (
                                <div className="p-2 rounded-xl bg-primary text-primary-foreground">
                                    <ApplicationLogo className="w-6 h-6 fill-current" />
                                </div>
                            )}
                            <div className="flex flex-col">
                                <span className="font-black text-base sm:text-lg tracking-tight text-foreground">{travelName}</span>
                                <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">PPIU Resmi Kemenag</span>
                            </div>
                        </div>

                        {/* Navigation Links (Desktop) */}
                        <div className="hidden md:flex items-center gap-7 text-xs font-bold text-foreground">
                            {cfg.visibility.katalog !== false && <a href="#paket" className="hover:text-primary transition-colors">Cari Paket</a>}
                            {cfg.visibility.kalkulator !== false && <a href="#kalkulator" className="hover:text-primary transition-colors">Simulasi Tabungan</a>}
                            {cfg.visibility.legalitas !== false && <a href="#legalitas" className="hover:text-primary transition-colors">Garansi &amp; Legalitas</a>}
                            {cfg.visibility.testimoni !== false && <a href="#testimoni" className="hover:text-primary transition-colors">Testimoni</a>}
                            {cfg.visibility.tracking !== false && <a href="#tracking" className="hover:text-primary transition-colors">Cek Pendaftaran</a>}
                            {tenant?.is_docs_enabled && (
                                <Link href={route('docs.index')} className="hover:text-primary transition-colors flex items-center gap-1">
                                    <BookOpen className="w-3.5 h-3.5" /> Panduan
                                </Link>
                            )}
                        </div>

                        {/* Right Action Buttons */}
                        <div className="flex items-center gap-3">
                            <a
                                href={waUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border border-border bg-card hover:bg-muted transition text-foreground"
                            >
                                <MessageCircle className="w-4 h-4 text-emerald-500" />
                                <span>Konsultasi WA</span>
                            </a>

                            {auth?.user ? (
                                <Link href={route('dashboard')}>
                                    <Button className="rounded-xl text-xs font-bold px-4 py-2 bg-primary text-primary-foreground shadow-xs">
                                        Dashboard
                                    </Button>
                                </Link>
                            ) : (
                                canLogin && (
                                    <Link href={route('login')}>
                                        <Button variant="outline" className="rounded-xl text-xs font-bold px-4 py-2 border-border">
                                            <LogIn className="w-3.5 h-3.5 mr-1.5" /> Masuk Staf
                                        </Button>
                                    </Link>
                                )
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* 1. HERO SECTION */}
            {cfg.visibility.hero !== false && (
                <section className="relative overflow-hidden pt-10 pb-16 sm:pt-16 sm:pb-28 bg-gradient-to-b from-primary/10 via-background to-background">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col items-center text-center gap-4 sm:gap-6 max-w-4xl mx-auto">
                            <Badge className="w-fit bg-primary/15 text-primary border-primary/30 font-bold text-[11px] sm:text-xs px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full shadow-xs">
                                {cfg.hero.badge_text || '🕋 Travel Booking Engine Resmi & Terpercaya'}
                            </Badge>
                            <h1 className="text-2xl sm:text-4xl lg:text-6xl font-black text-foreground tracking-tight leading-snug sm:leading-tight">
                                {cfg.hero.title || 'Wujudkan Ibadah ke Baitullah dengan Kepastian Jadwal & Layanan Prima'}
                            </h1>
                            <p className="text-xs sm:text-base text-muted-foreground leading-relaxed max-w-2xl px-2">
                                {cfg.hero.subtitle ? (
                                    cfg.hero.subtitle
                                ) : (
                                    <>
                                        Pilih jadwal keberangkatan terbaik bersama <strong>{travelName}</strong>. Transparan, akomodasi dekat pelataran masjid, bimbingan manasik intensif, dan kepastian tiket penerbangan.
                                    </>
                                )}
                            </p>

                            <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 pt-2">
                                {cfg.visibility.katalog !== false && (
                                    <a href="#paket" className="w-full sm:w-auto">
                                        <Button size="lg" className="w-full sm:w-auto rounded-xl sm:rounded-2xl text-xs sm:text-sm font-black px-5 py-5 sm:px-6 sm:py-6 bg-primary text-primary-foreground shadow-lg hover:shadow-primary/20 transition-all gap-2">
                                            <span>{cfg.hero.cta_package_text || 'Jelajahi Paket Umroh & Haji'}</span>
                                            <ArrowRight className="w-4 h-4" />
                                        </Button>
                                    </a>
                                )}
                                {cfg.visibility.kalkulator !== false && (
                                    <a href="#kalkulator" className="w-full sm:w-auto">
                                        <Button size="lg" variant="outline" className="w-full sm:w-auto rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold px-5 py-5 sm:px-6 sm:py-6 border-border hover:bg-muted gap-2">
                                            <Coins className="w-4 h-4 text-primary" />
                                            <span>{cfg.hero.cta_calc_text || 'Simulasi Tabungan'}</span>
                                        </Button>
                                    </a>
                                )}
                            </div>
                        </div>

                        {/* LIVE TRAVEL SEARCH & FILTER ENGINE BAR */}
                        {cfg.visibility.search_bar !== false && (
                            <div className="mt-8 sm:mt-12 max-w-5xl mx-auto bg-card border border-border/90 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl backdrop-blur-md">
                                <div className="flex items-center gap-2 pb-3 sm:pb-4 border-b border-border text-xs sm:text-sm font-bold text-foreground">
                                    <Filter className="w-4 h-4 text-primary" />
                                    <span>Filter Cepat Mesin Pencarian Paket</span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 sm:pt-4">
                                    {/* 1. Keyword Search */}
                                    <div className="relative">
                                        <label className="block text-[11px] sm:text-xs font-bold text-muted-foreground mb-1">Cari Nama Paket</label>
                                        <div className="relative flex items-center">
                                            <Search className="w-4 h-4 absolute left-3 text-muted-foreground pointer-events-none" />
                                            <input
                                                type="text"
                                                placeholder="Reguler, Plus Turki, dll..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="w-full pl-9 pr-3 py-2 sm:py-2.5 text-xs sm:text-sm rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground"
                                            />
                                            {searchQuery && (
                                                <button
                                                    type="button"
                                                    onClick={() => setSearchQuery('')}
                                                    className="absolute right-2.5 text-muted-foreground hover:text-foreground"
                                                >
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* 2. Kategori Paket */}
                                    <div>
                                        <label className="block text-[11px] sm:text-xs font-bold text-muted-foreground mb-1">Kategori Program</label>
                                        <select
                                            value={selectedCategory}
                                            onChange={(e) => setSelectedCategory(e.target.value)}
                                            className="w-full px-3 py-2 sm:py-2.5 text-xs sm:text-sm rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground cursor-pointer"
                                        >
                                            <option value="all">Semua Kategori</option>
                                            <option value="reguler">Umroh Reguler</option>
                                            <option value="plus">Umroh Plus (Turki/Dubai/Mesir)</option>
                                            <option value="haji">Haji Khusus / Furoda</option>
                                        </select>
                                    </div>

                                    {/* 3. Bulan Keberangkatan */}
                                    <div>
                                        <label className="block text-[11px] sm:text-xs font-bold text-muted-foreground mb-1">Bulan Keberangkatan</label>
                                        <select
                                            value={selectedMonth}
                                            onChange={(e) => setSelectedMonth(e.target.value)}
                                            className="w-full px-3 py-2 sm:py-2.5 text-xs sm:text-sm rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground cursor-pointer"
                                        >
                                            <option value="all">Semua Bulan</option>
                                            {availableMonths.map((m, idx) => (
                                                <option key={idx} value={m}>{m}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* 4. Filter Button / Reset */}
                                    <div className="flex flex-col justify-end">
                                        <label className="block text-[11px] sm:text-xs font-bold text-muted-foreground mb-1 invisible hidden sm:block">Aksi</label>
                                        <div className="flex items-center gap-2">
                                            <a href="#paket" className="flex-1">
                                                <Button className="w-full rounded-xl text-xs sm:text-sm font-bold py-2 sm:py-2.5 bg-primary text-primary-foreground shadow-xs">
                                                    Terapkan Filter
                                                </Button>
                                            </a>
                                            {(searchQuery || selectedCategory !== 'all' || selectedMonth !== 'all' || maxPrice > 0) && (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => {
                                                        setSearchQuery('');
                                                        setSelectedCategory('all');
                                                        setSelectedMonth('all');
                                                        setMaxPrice(0);
                                                    }}
                                                    className="rounded-xl text-xs px-2.5 py-2 sm:py-2.5 border-border text-muted-foreground hover:text-foreground"
                                                    title="Reset Filter"
                                                >
                                                    Reset
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Search Feedback Badge */}
                                <div className="mt-3 pt-3 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-1 text-[11px] sm:text-xs text-muted-foreground">
                                    <span>
                                        Menampilkan <strong className="text-foreground">{filteredPackages.length}</strong> dari {packages.length} paket tersedia
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                                        <span className="text-[11px] sm:text-xs font-semibold text-emerald-600 dark:text-emerald-400">Kuota Live Realtime</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            )}

            {/* 2. SOCIAL PROOF & METRICS COUNTER */}
            {cfg.visibility.stats !== false && (
                <section className="py-10 sm:py-12 bg-primary text-primary-foreground border-y border-primary/20 relative overflow-hidden">
                    <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-white/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-center divide-y sm:divide-y-0 sm:divide-x divide-white/20">
                            <div className="flex flex-col items-center gap-0.5 sm:gap-1 p-2 sm:p-3">
                                <div className="text-2xl sm:text-4xl font-black font-mono tracking-tight">{cfg.stats.jamaah_count || '5.000+'}</div>
                                <div className="text-[11px] sm:text-xs font-semibold opacity-90">Jamaah Diberangkatkan</div>
                            </div>
                            <div className="flex flex-col items-center gap-0.5 sm:gap-1 p-2 sm:p-3">
                                <div className="text-2xl sm:text-4xl font-black font-mono tracking-tight">{cfg.stats.satisfaction_rate || '99.8%'}</div>
                                <div className="text-[11px] sm:text-xs font-semibold opacity-90">Indeks Kepuasan Jamaah</div>
                            </div>
                            <div className="flex flex-col items-center gap-0.5 sm:gap-1 p-2 sm:p-3 pt-4 sm:pt-3">
                                <div className="text-2xl sm:text-4xl font-black font-mono tracking-tight">{cfg.stats.on_time_rate || '100%'}</div>
                                <div className="text-[11px] sm:text-xs font-semibold opacity-90">Kepastian Tiket &amp; Jadwal</div>
                            </div>
                            <div className="flex flex-col items-center gap-0.5 sm:gap-1 p-2 sm:p-3 pt-4 sm:pt-3">
                                <div className="text-2xl sm:text-4xl font-black font-mono tracking-tight">{cfg.stats.experience_years || '10+ Thn'}</div>
                                <div className="text-[11px] sm:text-xs font-semibold opacity-90">Dedikasi Melayani Tamu Allah</div>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* 3. MASKAPAI & MITRA HOTEL BINTANG 5 */}
            {cfg.visibility.partners !== false && (
                <section className="py-8 sm:py-10 bg-muted/20 border-b border-border">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <div className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3 sm:mb-4">
                            Partner Maskapai Resmi &amp; Jaringan Hotel Ring-1 Makkah - Madinah
                        </div>
                        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 opacity-85">
                            {(cfg.partners.airlines || []).map((airline, idx) => (
                                <span key={`airline-${idx}`} className="px-3 py-1.5 sm:px-3.5 sm:py-1.5 rounded-xl bg-card border border-border text-[11px] sm:text-xs font-extrabold text-foreground shadow-2xs">
                                    ✈️ {airline}
                                </span>
                            ))}
                            {(cfg.partners.hotels || []).map((hotel, idx) => (
                                <span key={`hotel-${idx}`} className="px-3 py-1.5 sm:px-3.5 sm:py-1.5 rounded-xl bg-card border border-border text-[11px] sm:text-xs font-extrabold text-foreground shadow-2xs">
                                    🏨 {hotel}
                                </span>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* 4. PACKAGES CATALOG SECTION (#paket) */}
            {cfg.visibility.katalog !== false && (
                <section id="paket" className="py-14 sm:py-20 bg-background border-b border-border">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12 flex flex-col gap-2.5 sm:gap-3">
                            <Badge variant="secondary" className="w-fit mx-auto bg-primary/10 text-primary border-primary/20 font-bold text-[11px] sm:text-xs">
                                PILIHAN PROGRAM TERBAIK
                            </Badge>
                            <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                                Katalog Brosur &amp; Jadwal Keberangkatan
                            </h2>
                            <p className="text-xs sm:text-sm text-muted-foreground px-2">
                                Klik pada paket untuk membuka itinerary hari per hari, rincian hotel bintang, dan ketersediaan kuota kursi terkini.
                            </p>
                        </div>

                        {filteredPackages.length === 0 ? (
                            <div className="text-center py-12 sm:py-16 px-4 bg-muted/20 border border-dashed border-border rounded-3xl max-w-2xl mx-auto flex flex-col items-center gap-3">
                                <Compass className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground/50 animate-bounce" />
                                <div className="font-bold text-xs sm:text-sm text-foreground">Tidak Ada Paket yang Sesuai Filter</div>
                                <p className="text-xs text-muted-foreground max-w-md">
                                    Silakan ubah kata kunci pencarian atau reset filter untuk melihat seluruh paket yang tersedia.
                                </p>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setSearchQuery('');
                                        setSelectedCategory('all');
                                        setSelectedMonth('all');
                                        setMaxPrice(0);
                                    }}
                                    className="rounded-xl text-xs font-bold"
                                >
                                    Reset Semua Filter
                                </Button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                                {filteredPackages.map((pkg) => {
                                    const totalKuota = pkg.kuota || 45;
                                    const filledSeats = pkg.jamaah_count ?? 0;
                                    const availableSeats = pkg.available_seats !== undefined ? pkg.available_seats : Math.max(0, totalKuota - filledSeats);
                                    const isUrgent = availableSeats > 0 && availableSeats <= 5;
                                    const isSoldOut = availableSeats === 0;

                                    return (
                                        <div
                                            key={pkg.id}
                                            onClick={() => setSelectedPackage(pkg)}
                                            className="group bg-card rounded-2xl sm:rounded-3xl border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-2xl overflow-hidden cursor-pointer flex flex-col justify-between"
                                        >
                                            {/* Brochure Visual Poster Banner */}
                                            <div className="relative aspect-[4/3] w-full bg-muted/60 overflow-hidden flex items-center justify-center">
                                                {pkg.brosur_url ? (
                                                    <img
                                                        src={pkg.brosur_url}
                                                        alt={pkg.nama_paket}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                    />
                                                ) : (
                                                    <div className="flex flex-col items-center justify-center p-6 text-center gap-2 text-muted-foreground">
                                                        <Compass className="w-10 h-10 sm:w-12 sm:h-12 text-primary/60" />
                                                        <span className="font-bold text-xs sm:text-sm text-foreground">{pkg.nama_paket}</span>
                                                        <span className="text-[11px] sm:text-xs">Brosur Resmi Keberangkatan</span>
                                                    </div>
                                                )}

                                                {/* Top Urgency & Seat Badge */}
                                                <div className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 z-10 flex flex-col items-end gap-1.5">
                                                    <Badge className={`font-bold text-[10px] sm:text-xs shadow-md border flex items-center gap-1 ${
                                                        isSoldOut
                                                            ? 'bg-rose-600 text-white border-rose-500'
                                                            : isUrgent
                                                            ? 'bg-amber-600 text-white border-amber-500 animate-pulse'
                                                            : 'bg-emerald-600 text-white border-emerald-500'
                                                    }`}>
                                                        {isUrgent && <Flame className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-amber-200" />}
                                                        <span>{isSoldOut ? 'KUOTA PENUH' : `Sisa ${availableSeats} Seat`}</span>
                                                    </Badge>
                                                    {pkg.periode_mulai && (
                                                        <Badge className="bg-black/75 text-white backdrop-blur-md border-black/40 text-[9px] sm:text-[10px] font-semibold">
                                                            {new Date(pkg.periode_mulai).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}
                                                        </Badge>
                                                    )}
                                                </div>

                                                {/* Price Overlay */}
                                                <div className="absolute bottom-2.5 left-2.5 sm:bottom-3 sm:left-3 z-10 bg-black/75 backdrop-blur-md px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-xl text-white">
                                                    <div className="text-[9px] sm:text-[10px] uppercase font-semibold text-white/80">Biaya All-In Mulai</div>
                                                    <div className="text-sm sm:text-base font-black text-amber-400">
                                                        Rp {pkg.harga.toLocaleString('id-ID')}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Card Info Details */}
                                            <div className="p-4 sm:p-5 flex flex-col gap-3 sm:gap-4">
                                                <div>
                                                    <h3 className="font-black text-base sm:text-lg text-foreground group-hover:text-primary transition-colors">
                                                        {pkg.nama_paket}
                                                    </h3>
                                                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                                        {pkg.deskripsi || 'Program ibadah umroh berkualitas dengan akomodasi hotel bintang dan pembimbing bersertifikat.'}
                                                    </p>
                                                </div>

                                                {/* Seat Progress Bar */}
                                                <div className="space-y-1">
                                                    <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-bold">
                                                        <span className="text-muted-foreground">Keterisian Kuota</span>
                                                        <span className="text-foreground">{totalKuota - availableSeats} / {totalKuota} Kursi</span>
                                                    </div>
                                                    <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                                                        <div 
                                                            className={`h-full rounded-full transition-all duration-500 ${
                                                                isSoldOut ? 'bg-rose-500' : isUrgent ? 'bg-amber-500' : 'bg-primary'
                                                            }`}
                                                            style={{ width: `${Math.min(100, Math.round(((totalKuota - availableSeats) / totalKuota) * 100))}%` }}
                                                        />
                                                    </div>
                                                </div>

                                                {/* Quick Specs Grid */}
                                                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/80 text-[11px] sm:text-xs">
                                                    <div className="flex items-center gap-1.5 text-muted-foreground">
                                                        <Plane className="w-3.5 h-3.5 text-primary shrink-0" />
                                                        <span className="truncate">{pkg.maskapai || 'Maskapai Bintang 5'}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-muted-foreground">
                                                        <Building2 className="w-3.5 h-3.5 text-primary shrink-0" />
                                                        <span className="truncate">Hotel ⭐{pkg.bintang_makkah || 5}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-muted-foreground">
                                                        <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
                                                        <span>{pkg.durasi_hari || 9} Hari Program</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                                                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                                                        <span>Langsung Madinah</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="p-4 sm:p-5 pt-0 flex items-center gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="flex-1 rounded-xl text-xs font-bold border-border group-hover:border-primary/40 group-hover:bg-primary/5 transition-colors gap-1.5"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedPackage(pkg);
                                                    }}
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                    <span>Lihat Detail</span>
                                                </Button>
                                                <Link
                                                    href={route('public.register', { paket: pkg.id })}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="flex-1"
                                                >
                                                    <Button
                                                        size="sm"
                                                        className="w-full rounded-xl text-xs font-bold bg-primary text-primary-foreground shadow-xs gap-1"
                                                    >
                                                        <span>Daftar</span>
                                                        <ArrowUpRight className="w-3.5 h-3.5" />
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </section>
            )}

            {/* 5. SAVINGS CALCULATOR SECTION (#kalkulator) */}
            {cfg.visibility.kalkulator !== false && (
                <section id="kalkulator" className="py-14 sm:py-20 bg-muted/20 border-b border-border">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14 flex flex-col gap-2.5 sm:gap-3">
                            <Badge variant="secondary" className="w-fit mx-auto bg-primary/10 text-primary border-primary/20 font-bold text-[11px] sm:text-xs">
                                SIMULASI FLEKSIBEL
                            </Badge>
                            <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                                Kalkulator Tabungan &amp; Angsuran Umroh
                            </h2>
                            <p className="text-xs sm:text-sm text-muted-foreground px-2">
                                Rencanakan keberangkatan ibadah Anda dan keluarga dengan simulasi tabungan bertahap yang ringan dan terjangkau.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
                            {/* Control Form */}
                            <div className="lg:col-span-6 bg-card border border-border rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-md flex flex-col gap-4 sm:gap-5">
                                <div>
                                    <label className="block text-xs sm:text-sm font-bold text-foreground mb-1.5">
                                        Pilih Paket Umroh Target
                                    </label>
                                    <select
                                        value={calcPackageId}
                                        onChange={(e) => setCalcPackageId(Number(e.target.value))}
                                        className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground cursor-pointer font-medium"
                                    >
                                        {packages.map((p) => (
                                            <option key={p.id} value={p.id}>
                                                {p.nama_paket} — Rp {p.harga.toLocaleString('id-ID')}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <label className="text-xs sm:text-sm font-bold text-foreground">
                                            Rencana Uang Muka (DP)
                                        </label>
                                        <span className="text-xs sm:text-sm font-black text-primary font-mono">
                                            Rp {calcDp.toLocaleString('id-ID')}
                                        </span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max={Math.min(packagePrice, 20000000)}
                                        step="1000000"
                                        value={calcDp}
                                        onChange={(e) => setCalcDp(Number(e.target.value))}
                                        className="w-full accent-primary cursor-pointer"
                                    />
                                    <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                                        <span>Rp 0</span>
                                        <span>Rp 10 Juta</span>
                                        <span>Rp 20 Juta</span>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs sm:text-sm font-bold text-foreground mb-2">
                                        Target Durasi Menabung (Tenor)
                                    </label>
                                    <div className="grid grid-cols-4 gap-2">
                                        {[3, 6, 12, 24].map((tenor) => (
                                            <button
                                                key={tenor}
                                                type="button"
                                                onClick={() => setCalcTenor(tenor)}
                                                className={`py-2 sm:py-2.5 rounded-xl border text-xs sm:text-xs font-bold transition-all cursor-pointer ${
                                                    calcTenor === tenor
                                                        ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                                                        : 'bg-background border-border text-foreground hover:border-primary/40'
                                                }`}
                                            >
                                                {tenor} Bln
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Result Output Card */}
                            <div className="lg:col-span-6 bg-gradient-to-br from-primary/15 via-card to-card border border-primary/30 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-xl flex flex-col justify-between gap-5 sm:gap-6">
                                <div>
                                    <div className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-primary mb-1">
                                        Hasil Estimasi Tabungan Bulanan
                                    </div>
                                    <div className="text-2xl sm:text-4xl font-black text-foreground font-mono">
                                        Rp {monthlySaving.toLocaleString('id-ID')}
                                        <span className="text-xs text-muted-foreground font-sans font-normal ml-1.5">/ bulan</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1.5 sm:mt-2">
                                        Simulasi berdasarkan sisa biaya Rp {remainingToSave.toLocaleString('id-ID')} dicicil selama {calcTenor} bulan.
                                    </p>
                                </div>

                                <div className="space-y-2 sm:space-y-3 pt-3 sm:pt-4 border-t border-border/80 text-xs sm:text-xs">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Paket Pilihan:</span>
                                        <strong className="text-foreground">{selectedCalcPackage?.nama_paket}</strong>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Total Biaya Paket:</span>
                                        <strong className="text-foreground">Rp {packagePrice.toLocaleString('id-ID')}</strong>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Rencana Setoran Awal (DP):</span>
                                        <strong className="text-foreground">Rp {calcDp.toLocaleString('id-ID')}</strong>
                                    </div>
                                </div>

                                <a
                                    href={calcWaUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full"
                                >
                                    <Button className="w-full rounded-xl sm:rounded-2xl py-4 sm:py-6 text-xs sm:text-sm font-bold bg-primary text-primary-foreground shadow-lg hover:shadow-primary/20 gap-2">
                                        <MessageCircle className="w-4 h-4" />
                                        <span>Konsultasikan Rencana Ini via WhatsApp &rarr;</span>
                                    </Button>
                                </a>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* 6. STANDAR 5 PASTI UMRAH KEMENAG RI (#legalitas) */}
            {cfg.visibility.legalitas !== false && (
                <section id="legalitas" className="py-12 sm:py-16 bg-background border-b border-border">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="bg-card border border-border rounded-2xl sm:rounded-3xl p-5 sm:p-10 shadow-md flex flex-col gap-6 sm:gap-8">
                            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 sm:gap-4 pb-4 sm:pb-6 border-b border-border">
                                <div>
                                    <Badge className="w-fit bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-bold text-[11px] sm:text-xs mb-1.5 sm:mb-2">
                                        GARANSI RESMI KEMENAG RI
                                    </Badge>
                                    <h3 className="text-xl sm:text-2xl font-black text-foreground">{cfg.legalitas.title || 'Komitmen Standar Gerakan 5 Pasti Umrah'}</h3>
                                    <p className="text-xs text-muted-foreground mt-1">{cfg.legalitas.subtitle || 'Kami menjunjung tinggi perlindungan dan kepastian hukum ibadah bagi seluruh jamaah.'}</p>
                                </div>
                                <div className="p-2.5 sm:p-3 bg-primary/10 text-primary rounded-xl sm:rounded-2xl flex items-center gap-2 text-xs font-bold shrink-0">
                                    <Award className="w-4 h-4 sm:w-5 sm:h-5" />
                                    <span>{cfg.legalitas.akreditasi || 'Akreditasi A Kemenag'}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
                                <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-muted/30 border border-border/70 flex flex-col gap-1.5 sm:gap-2">
                                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-primary text-primary-foreground font-black text-xs flex items-center justify-center">1</div>
                                    <h4 className="font-extrabold text-xs sm:text-sm text-foreground">Pasti Izinnya</h4>
                                    <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed">Berizin resmi PPIU Kemenag RI dengan legalitas hukum terverifikasi.</p>
                                </div>
                                <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-muted/30 border border-border/70 flex flex-col gap-1.5 sm:gap-2">
                                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-primary text-primary-foreground font-black text-xs flex items-center justify-center">2</div>
                                    <h4 className="font-extrabold text-xs sm:text-sm text-foreground">Pasti Jadwalnya</h4>
                                    <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed">Jadwal tanggal dan jam penerbangan telah di-booking pasti sejak awal.</p>
                                </div>
                                <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-muted/30 border border-border/70 flex flex-col gap-1.5 sm:gap-2">
                                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-primary text-primary-foreground font-black text-xs flex items-center justify-center">3</div>
                                    <h4 className="font-extrabold text-xs sm:text-sm text-foreground">Pasti Terbangnya</h4>
                                    <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed">Kerjasama resmi maskapai bintang (Garuda Indonesia / Saudia Airlines).</p>
                                </div>
                                <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-muted/30 border border-border/70 flex flex-col gap-1.5 sm:gap-2">
                                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-primary text-primary-foreground font-black text-xs flex items-center justify-center">4</div>
                                    <h4 className="font-extrabold text-xs sm:text-sm text-foreground">Pasti Hotelnya</h4>
                                    <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed">Nama hotel dan jarak ring-1 dekat pelataran masjid terkonfirmasi jelas.</p>
                                </div>
                                <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-muted/30 border border-border/70 flex flex-col gap-1.5 sm:gap-2">
                                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-primary text-primary-foreground font-black text-xs flex items-center justify-center">5</div>
                                    <h4 className="font-extrabold text-xs sm:text-sm text-foreground">Pasti Visanya</h4>
                                    <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed">Penerbitan visa umrah resmi dari Kementerian Haji &amp; Umrah Arab Saudi.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* 7. TESTIMONI & PENGALAMAN NYATA JAMAAH (#testimoni) */}
            {cfg.visibility.testimoni !== false && (
                <section id="testimoni" className="py-14 sm:py-20 bg-muted/30 border-b border-border">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14 flex flex-col gap-2.5 sm:gap-3">
                            <Badge variant="secondary" className="w-fit mx-auto bg-primary/10 text-primary border-primary/20 font-bold text-[11px] sm:text-xs">
                                BUKTI KEPUASAN JAMAAH
                            </Badge>
                            <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                                Cerita &amp; Pengalaman Jamaah Kami
                            </h2>
                            <p className="text-xs sm:text-sm text-muted-foreground px-2">
                                Kisah nyata dari para jamaah yang telah menunaikan ibadah umroh dan haji bersama {travelName}.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
                            <Card className="rounded-2xl sm:rounded-3xl border border-border bg-card p-5 sm:p-6 shadow-sm flex flex-col justify-between gap-4 sm:gap-5 hover:shadow-lg transition-shadow">
                                <div className="space-y-2.5 sm:space-y-3">
                                    <div className="flex items-center gap-1 text-amber-400">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-amber-400" />
                                        ))}
                                    </div>
                                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed italic">
                                        &ldquo;Alhamdulillah, pengalaman pertama ke Tanah Suci bersama {travelName} sangat berkesan. Hotelnya benar-benar dekat dengan Masjidil Haram, makanan cocok di lidah, dan Muthawifnya sangat sabar membimbing keluarga kami.&rdquo;
                                    </p>
                                </div>
                                <div className="flex items-center gap-3 pt-3.5 sm:pt-4 border-t border-border/80">
                                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center text-xs">
                                        HA
                                    </div>
                                    <div>
                                        <div className="text-xs sm:text-sm font-bold text-foreground">H. Ahmad Fauzi &amp; Keluarga</div>
                                        <div className="text-[10px] sm:text-xs text-muted-foreground">Jamaah Umroh Syawal 1447 H (Jakarta)</div>
                                    </div>
                                </div>
                            </Card>

                            <Card className="rounded-2xl sm:rounded-3xl border border-border bg-card p-5 sm:p-6 shadow-sm flex flex-col justify-between gap-4 sm:gap-5 hover:shadow-lg transition-shadow">
                                <div className="space-y-2.5 sm:space-y-3">
                                    <div className="flex items-center gap-1 text-amber-400">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-amber-400" />
                                        ))}
                                    </div>
                                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed italic">
                                        &ldquo;Penerbangan direct Garuda tanpa transit membuat orang tua saya tidak kelelahan. Proses manasik di tanah air hingga handling koper di bandara Jeddah sangat rapi dan profesional. Terima kasih bimbingannya!&rdquo;
                                    </p>
                                </div>
                                <div className="flex items-center gap-3 pt-3.5 sm:pt-4 border-t border-border/80">
                                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center text-xs">
                                        SR
                                    </div>
                                    <div>
                                        <div className="text-xs sm:text-sm font-bold text-foreground">Hj. Siti Rahmawati</div>
                                        <div className="text-[10px] sm:text-xs text-muted-foreground">Jamaah Umroh VIP Plus Turki (Surabaya)</div>
                                    </div>
                                </div>
                            </Card>

                            <Card className="rounded-2xl sm:rounded-3xl border border-border bg-card p-5 sm:p-6 shadow-sm flex flex-col justify-between gap-4 sm:gap-5 hover:shadow-lg transition-shadow">
                                <div className="space-y-2.5 sm:space-y-3">
                                    <div className="flex items-center gap-1 text-amber-400">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-amber-400" />
                                        ))}
                                    </div>
                                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed italic">
                                        &ldquo;Sistem pendaftaran dan tracking kwitansinya transparan sekali. Bisa cek langsung status paspor dan pelunasan secara online. Bikin hati tenang dan percaya 100%.&rdquo;
                                    </p>
                                </div>
                                <div className="flex items-center gap-3 pt-3.5 sm:pt-4 border-t border-border/80">
                                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center text-xs">
                                        DW
                                    </div>
                                    <div>
                                        <div className="text-xs sm:text-sm font-bold text-foreground">dr. Dedi Wijaya, Sp.PD</div>
                                        <div className="text-[10px] sm:text-xs text-muted-foreground">Jamaah Umroh Akhir Tahun (Bandung)</div>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>
                </section>
            )}

            {/* 8. SELF-SERVICE TRACKING PORTAL (#tracking) */}
            {cfg.visibility.tracking !== false && (
                <section id="tracking" className="py-14 sm:py-20 bg-background border-b border-border">
                    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="bg-card border border-border/90 rounded-2xl sm:rounded-3xl p-5 sm:p-10 shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
                            
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center relative z-10">
                                <div className="lg:col-span-7 flex flex-col gap-3 sm:gap-4">
                                    <Badge className="w-fit bg-primary/10 text-primary border-primary/20 font-bold text-[11px] sm:text-xs">
                                        PORTAL TRACKING MANDIRI
                                    </Badge>
                                    <h2 className="text-xl sm:text-3xl font-black text-foreground tracking-tight">
                                        Cek Status Pendaftaran &amp; Bukti Pembayaran
                                    </h2>
                                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                                        Sudah melakukan pendaftaran online? Masukkan <strong>Kode Registrasi (REG-XXXXXX)</strong> atau <strong>Nomor Invoice (INV-XXXXXX)</strong> Anda untuk memantau status verifikasi berkas, paspor, dan penerbitan kwitansi resmi secara transparan.
                                    </p>

                                    <form onSubmit={handleTrackingSubmit} className="flex flex-col gap-2.5 pt-1 sm:pt-2">
                                        <div className="flex flex-col sm:flex-row gap-2">
                                            <div className="relative flex-1">
                                                <FileCheck2 className="w-4 h-4 absolute left-3.5 top-3.5 text-muted-foreground pointer-events-none" />
                                                <input
                                                    type="text"
                                                    placeholder="Contoh: REG-20260900001-XXXXXX"
                                                    value={trackingCode}
                                                    onChange={(e) => setTrackingCode(e.target.value)}
                                                    className="w-full pl-10 pr-4 py-2.5 sm:py-3 text-xs sm:text-sm rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground font-mono uppercase shadow-2xs"
                                                />
                                            </div>
                                            <Button type="submit" className="rounded-xl px-5 py-2.5 sm:px-6 sm:py-3 text-xs sm:text-sm font-bold bg-primary text-primary-foreground shadow-xs shrink-0">
                                                Lacak Status &rarr;
                                            </Button>
                                        </div>
                                        {trackingError && (
                                            <p className="text-xs text-rose-500 font-medium">{trackingError}</p>
                                        )}
                                    </form>
                                </div>

                                <div className="lg:col-span-5 flex flex-col gap-2.5 sm:gap-3 p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-muted/40 border border-border text-xs">
                                    <div className="font-bold text-xs sm:text-sm text-foreground flex items-center gap-1.5">
                                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                                        <span>Fitur Keamanan &amp; Transparansi</span>
                                    </div>
                                    <ul className="space-y-1.5 sm:space-y-2 text-muted-foreground text-[11px] sm:text-xs">
                                        <li className="flex items-start gap-2">
                                            <Check className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                                            <span>Status verifikasi dokumen paspor, KTP, dan buku vaksin</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <Check className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                                            <span>Validasi pembayaran DP &amp; Kwitansi resmi ber-QR Code</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <Check className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                                            <span>Kontak langsung mitra agen pendamping yang bertugas</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* 5. LUXURY 4-COLUMN FOOTER */}
            <footer className="bg-card border-t border-border pt-12 sm:pt-16 pb-8 text-xs">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 sm:gap-10 pb-10 sm:pb-12 border-b border-border/80">
                        {/* Column 1: Brand & Bio */}
                        <div className="lg:col-span-4 flex flex-col gap-3.5 sm:gap-4">
                            <div className="flex items-center gap-3">
                                {tenant?.logo ? (
                                    <img src={tenant.logo} alt={travelName} className="h-9 sm:h-10 w-auto rounded-xl shadow-xs" />
                                ) : (
                                    <div className="p-2 rounded-xl bg-primary text-primary-foreground">
                                        <ApplicationLogo className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
                                    </div>
                                )}
                                <div className="flex flex-col">
                                    <span className="font-black text-sm sm:text-base tracking-tight text-foreground">{travelName}</span>
                                    <span className="text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Penyelenggara Perjalanan Ibadah Umrah</span>
                                </div>
                            </div>
                            <p className="text-muted-foreground leading-relaxed text-xs">
                                Melayani keberangkatan ibadah Umroh dan Haji khusus dengan komitmen legalitas resmi, transparansi biaya, dan bimbingan ibadah sesuai tuntunan sunnah Rasulullah ﷺ.
                            </p>
                            <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-muted/50 border border-border flex items-center gap-2.5">
                                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                                <div className="text-[10px] sm:text-[11px] text-foreground">
                                    <strong>{cfg.legalitas.nomor_ppiu || 'Izin PPIU No. 912/2021'}</strong> — Terdaftar Resmi di SISKOPATUH Kemenag RI.
                                </div>
                            </div>
                        </div>

                        {/* Column 2: Navigation Links */}
                        <div className="lg:col-span-3 flex flex-col gap-2.5 sm:gap-3">
                            <div className="font-bold text-foreground uppercase tracking-wider text-xs">Menu &amp; Fitur Layanan</div>
                            <ul className="space-y-2 text-muted-foreground text-xs">
                                <li>
                                    <a href="#paket" className="hover:text-primary transition-colors flex items-center gap-1.5">
                                        <ChevronRight className="w-3 h-3 text-primary" /> Brosur &amp; Katalog Paket
                                    </a>
                                </li>
                                <li>
                                    <a href="#kalkulator" className="hover:text-primary transition-colors flex items-center gap-1.5">
                                        <ChevronRight className="w-3 h-3 text-primary" /> Kalkulator Simulasi Tabungan
                                    </a>
                                </li>
                                <li>
                                    <a href="#legalitas" className="hover:text-primary transition-colors flex items-center gap-1.5">
                                        <ChevronRight className="w-3 h-3 text-primary" /> Garansi 5 Pasti Umrah
                                    </a>
                                </li>
                                <li>
                                    <a href="#testimoni" className="hover:text-primary transition-colors flex items-center gap-1.5">
                                        <ChevronRight className="w-3 h-3 text-primary" /> Testimoni Nyata Jamaah
                                    </a>
                                </li>
                                <li>
                                    <a href="#tracking" className="hover:text-primary transition-colors flex items-center gap-1.5">
                                        <ChevronRight className="w-3 h-3 text-primary" /> Cek Status Pendaftaran
                                    </a>
                                </li>
                                <li>
                                    <Link href={route('public.register')} className="hover:text-primary transition-colors flex items-center gap-1.5 font-semibold text-primary">
                                        <ChevronRight className="w-3 h-3 text-primary" /> Formulir Pendaftaran Online
                                    </Link>
                                </li>
                                {tenant?.is_docs_enabled && (
                                    <li>
                                        <Link href={route('docs.index')} className="hover:text-primary transition-colors flex items-center gap-1.5">
                                            <ChevronRight className="w-3 h-3 text-primary" /> Buku Panduan Sistem (/docs)
                                        </Link>
                                    </li>
                                )}
                            </ul>
                        </div>

                        {/* Column 3: Contact Info */}
                        <div className="lg:col-span-3 flex flex-col gap-2.5 sm:gap-3">
                            <div className="font-bold text-foreground uppercase tracking-wider text-xs">Pusat Informasi &amp; CS</div>
                            <div className="space-y-2.5 sm:space-y-3 text-muted-foreground text-xs leading-relaxed">
                                <div className="flex items-start gap-2.5">
                                    <PhoneCall className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                                    <div>
                                        <div className="font-semibold text-foreground">WhatsApp Bisnis:</div>
                                        <a href={waUrl} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors text-primary font-bold">
                                            +{cleanPhone}
                                        </a>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2.5">
                                    <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                                    <div>
                                        <div className="font-semibold text-foreground">Kantor Operasional:</div>
                                        <span>Layanan konsultasi tatap muka Senin – Sabtu (08.30 – 17.00 WIB)</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Column 4: Security & Staff Access */}
                        <div className="lg:col-span-2 flex flex-col gap-2.5 sm:gap-3">
                            <div className="font-bold text-foreground uppercase tracking-wider text-xs">Akses Sistem</div>
                            <p className="text-[11px] text-muted-foreground">
                                Portal terenkripsi SSL 256-bit untuk manajemen data jamaah dan mitra keagenan.
                            </p>
                            {auth?.user ? (
                                <Link href={route('dashboard')}>
                                    <Button className="w-full rounded-xl text-xs font-bold py-2 bg-primary text-primary-foreground shadow-xs">
                                        Ke Dashboard
                                    </Button>
                                </Link>
                            ) : (
                                canLogin && (
                                    <Link href={route('login')}>
                                        <Button variant="outline" className="w-full rounded-xl text-xs font-bold py-2 border-border hover:bg-muted">
                                            <LogIn className="w-3.5 h-3.5 mr-1.5" /> Login Staf Travel
                                        </Button>
                                    </Link>
                                )
                            )}
                        </div>
                    </div>

                    {/* Bottom Bar */}
                    <div className="pt-6 sm:pt-8 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 text-[10px] sm:text-[11px] text-muted-foreground text-center sm:text-left">
                        <div>
                            &copy; {new Date().getFullYear()} <strong>{travelName}</strong>. Seluruh hak cipta dilindungi undang-undang.
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                                <Lock className="w-3 h-3" /> SSL Secured System
                            </span>
                            <span>Powered by HajjFlow Multi-Tenant</span>
                        </div>
                    </div>
                </div>
            </footer>

            {/* DETAIL PAKET & ITINERARY MODAL */}
            <Dialog open={!!selectedPackage} onOpenChange={(open) => { if (!open) setSelectedPackage(null); }}>
                <DialogContent className="max-w-3xl w-full max-h-[85vh] flex flex-col p-0 overflow-hidden">
                    <DialogHeader className="p-6 pb-3 border-b border-border flex flex-row items-center justify-between">
                        <div>
                            <DialogTitle className="text-xl font-bold">{selectedPackage?.nama_paket}</DialogTitle>
                            <div className="text-xs text-muted-foreground mt-0.5">
                                Detail Brosur, Itinerary Jadwal Harian &amp; Sisa Kursi
                            </div>
                        </div>
                    </DialogHeader>

                    {selectedPackage && (
                        <div className="p-6 flex-1 overflow-y-auto flex flex-col gap-6">
                            {/* Poster / Brosur Preview */}
                            {selectedPackage.brosur_url && (
                                <div className="rounded-2xl overflow-hidden border border-border shadow-sm max-h-80 flex items-center justify-center bg-black/5">
                                    <img
                                        src={selectedPackage.brosur_url}
                                        alt={selectedPackage.nama_paket}
                                        className="w-full h-auto max-h-80 object-contain"
                                    />
                                </div>
                            )}

                            {/* Summary Bar */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-muted/40 border border-border">
                                <div>
                                    <div className="text-[11px] text-muted-foreground uppercase font-bold">Biaya Paket</div>
                                    <div className="text-lg font-black text-primary">Rp {selectedPackage.harga.toLocaleString('id-ID')}</div>
                                </div>
                                <div>
                                    <div className="text-[11px] text-muted-foreground uppercase font-bold">Sisa Kursi Tersedia</div>
                                    <div className="text-lg font-bold text-foreground">
                                        {selectedPackage.available_seats !== undefined ? selectedPackage.available_seats : (selectedPackage.kuota || 45)} / {selectedPackage.kuota || 45} Seat
                                    </div>
                                </div>
                                <div className="flex items-center sm:justify-end">
                                    <Link href={route('public.register', { paket: selectedPackage.id })}>
                                        <Button className="rounded-xl text-xs font-bold px-4 py-2 bg-primary text-primary-foreground shadow-md">
                                            Daftar Paket Ini
                                        </Button>
                                    </Link>
                                </div>
                            </div>

                            {/* Deskripsi */}
                            {selectedPackage.deskripsi && (
                                <div className="flex flex-col gap-1.5">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">Deskripsi Paket</h4>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        {selectedPackage.deskripsi}
                                    </p>
                                </div>
                            )}

                            {/* Itinerary Section */}
                            <div className="flex flex-col gap-3">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                                    <Calendar className="w-4 h-4 text-primary" /> Jadwal Kegiatan Harian (Itinerary)
                                </h4>

                                {(!selectedPackage.itinerary || selectedPackage.itinerary.length === 0) ? (
                                    <div className="p-4 rounded-xl bg-muted/20 text-center text-xs text-muted-foreground border border-dashed border-border">
                                        Itinerary lengkap hari per hari akan dibagikan saat manasik resmi.
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {selectedPackage.itinerary.map((itin, idx) => (
                                            <div key={idx} className="p-4 rounded-2xl bg-card border border-border/80 flex items-start gap-3.5 text-xs shadow-2xs">
                                                <div className="w-8 h-8 rounded-xl bg-primary text-primary-foreground font-black flex items-center justify-center shrink-0 text-xs shadow-xs">
                                                    H{itin.day || (idx + 1)}
                                                </div>
                                                <div className="flex-1 space-y-2">
                                                    <div>
                                                        <div className="font-bold text-foreground text-sm">
                                                            {itin.title}
                                                        </div>
                                                        {itin.location && (
                                                            <div className="text-[11px] text-primary font-semibold flex items-center gap-1 mt-0.5">
                                                                <MapPin className="w-3 h-3" /> {itin.location}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {itin.description && (
                                                        <p className="text-xs text-muted-foreground leading-relaxed">
                                                            {itin.description}
                                                        </p>
                                                    )}

                                                    {/* Sub Rundown Timeline with Hours */}
                                                    {itin.rundowns && itin.rundowns.length > 0 && (
                                                        <div className="mt-2.5 pt-2.5 border-t border-border/60 space-y-1.5">
                                                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                                                                <Clock className="w-3 h-3 text-primary" /> Rincian Agenda &amp; Waktu:
                                                            </span>
                                                            <div className="space-y-1.5 pl-1">
                                                                {itin.rundowns.map((rd, rIdx) => (
                                                                    <div key={rIdx} className="flex items-start gap-2 text-xs bg-muted/40 p-2 rounded-xl border border-border/60">
                                                                        <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary font-mono font-bold text-[10px] shrink-0">
                                                                            {rd.time}
                                                                        </span>
                                                                        <div className="flex-1">
                                                                            <span className="font-semibold text-foreground">{rd.activity}</span>
                                                                            {rd.notes && (
                                                                                <span className="block text-[10px] text-muted-foreground mt-0.5 italic">
                                                                                    {rd.notes}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}

