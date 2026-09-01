import React, { useState } from 'react';
import themeData from '@/lib/theme-colors.json';

import { Head, Link } from '@inertiajs/react';
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
} from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';

interface PaketItem {
    id: number;
    nama_paket: string;
    harga: number;
    komisi_flat?: number;
    komisi_persentase?: number;
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
    theme_name?: string | null;
    
    logo?: string | null;
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

    return (
        <div 
            className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-white font-sans"
            style={(themeData.themes[(tenant?.theme_name as keyof typeof themeData.themes) || 'coffee']?.variables || themeData.themes['coffee'].variables) as React.CSSProperties}
        >
            <Head title={`Beranda Resmi - ${travelName}`} />

            {/* Top Announcement Bar */}
            <div className="bg-primary text-foreground-foreground text-[10px] sm:text-xs py-2 px-4 text-center font-medium flex flex-wrap items-center justify-center gap-1 sm:gap-2">
                <Sparkles className="w-3.5 h-3.5 text-foreground animate-pulse hidden sm:block" />
                <span>Pendaftaran Musim Umroh 1448 H Telah Dibuka</span>
                <span className="hidden sm:inline"> Resmi Berizin Kemenag RI</span>
                <Link
                    href={route('public.register')}
                    className="underline font-bold text-foreground hover:text-white transition-colors ml-1 whitespace-nowrap"
                >
                    Daftar Sekarang &rarr;
                </Link>
            </div>

            {/* Navbar */}
            <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b border-primary">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
                    {/* Brand Logo */}
                    <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary to-primary text-white flex items-center justify-center shadow-md shadow-primary/20 font-black text-sm sm:text-xl">
                            <Landmark className="w-4 h-4 sm:w-6 sm:h-6" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-extrabold text-sm sm:text-lg tracking-tight text-foreground leading-tight">
                                {travelName}
                            </span>
                            <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-widest text-foreground hidden sm:block">
                                Penyelenggara Resmi Ibadah Umroh
                            </span>
                        </div>
                    </div>

                    {/* Nav Links */}
                    <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-foreground">
                        <a href="#paket" className="hover:text-foreground transition-colors">
                            Paket Umroh
                        </a>
                        <a href="#keunggulan" className="hover:text-foreground transition-colors">
                            Keunggulan
                        </a>
                        <a href="#kontak" className="hover:text-foreground transition-colors">
                            Kontak CS
                        </a>
                    </nav>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 sm:gap-3">
                        {auth?.user ? (
                            <Link href={route('dashboard')}>
                                <Button className="bg-primary hover:bg-primary text-white rounded-lg sm:rounded-xl text-xs font-bold gap-1 sm:gap-2 shadow-sm px-3 sm:px-4 h-8 sm:h-10">
                                    <span className="hidden sm:inline">Buka Portal</span>
                                    <span className="sm:hidden">Portal</span>
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </Button>
                            </Link>
                        ) : (
                            <>
                                {canLogin && (
                                    <Link href={route('login')} className="hidden sm:block">
                                        <Button
                                            variant="outline"
                                            className="border-primary hover:bg-background text-foreground rounded-xl text-xs font-bold gap-1.5"
                                        >
                                            <LogIn className="w-3.5 h-3.5" />
                                            <span>Login</span>
                                        </Button>
                                    </Link>
                                )}
                                <Link href={route('public.register')}>
                                    <Button className="bg-gradient-to-r from-primary to-primary hover:from-primary hover:to-primary text-white rounded-lg sm:rounded-xl text-xs font-bold gap-1 sm:gap-1.5 shadow-md shadow-primary/25 px-3 sm:px-4 h-8 sm:h-10">
                                        <span className="hidden sm:inline">Daftar Online</span>
                                        <span className="sm:hidden">Daftar</span>
                                        <ChevronRight className="w-3.5 h-3.5" />
                                    </Button>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </header>

            {/* Hero Section with Coffee Themed Accents */}
            <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-32 bg-gradient-to-b from-background via-background to-background">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                        {/* Hero Text */}
                        <div className="lg:col-span-7 flex flex-col gap-6 text-left">
                            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-background border border-primary text-foreground w-fit shadow-xs">
                                <Award className="w-4 h-4 text-foreground" />
                                <span className="text-xs font-bold tracking-tight">
                                    Izin Resmi Kemenag RI &bull; Pasti Berangkat
                                </span>
                            </div>

                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-foreground tracking-tight leading-tight">
                                Wujudkan Ibadah Suci{' '}
                                <span className="bg-gradient-to-r from-primary to-primary bg-clip-text text-transparent">
                                    Penuh Berkah &amp; Ketenangan
                                </span>
                            </h1>

                            <p className="text-sm sm:text-base text-foreground leading-relaxed max-w-2xl font-medium">
                                Nikmati pengalaman ibadah Umroh dan Haji Khusus dengan bimbingan sesuai Sunnah, akomodasi hotel bintang terbaik dekat Masjidil Haram, maskapai direct tanpa transit, serta pendampingan mutawwif berpengalaman.
                            </p>

                            {/* Hero CTAs */}
                            <div className="flex flex-wrap items-center gap-4 pt-2">
                                <Link href={route('public.register')}>
                                    <Button
                                        size="lg"
                                        className="bg-primary hover:bg-primary text-white rounded-2xl px-6 py-6 font-extrabold text-sm gap-2 shadow-xl shadow-primary/25 transition-all hover:scale-[1.02]"
                                    >
                                        <span>Daftar Calon Jamaah Sekarang</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </Button>
                                </Link>

                                <a href="#paket">
                                    <Button
                                        size="lg"
                                        variant="outline"
                                        className="border-primary/40 hover:bg-background text-foreground rounded-2xl px-6 py-6 font-bold text-sm gap-2 shadow-xs"
                                    >
                                        <span>Lihat Pilihan Paket</span>
                                    </Button>
                                </a>
                            </div>

                            {/* Trust Badges */}
                            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-primary">
                                <div>
                                    <div className="text-xl sm:text-2xl font-black text-foreground">100%</div>
                                    <div className="text-xs text-foreground font-medium">Pasti Berangkat</div>
                                </div>
                                <div>
                                    <div className="text-xl sm:text-2xl font-black text-foreground">5.000+</div>
                                    <div className="text-xs text-foreground font-medium">Jamaah Terlayani</div>
                                </div>
                                <div>
                                    <div className="text-xl sm:text-2xl font-black text-foreground">Bintang 5</div>
                                    <div className="text-xs text-foreground font-medium">Hotel Dekat Haram</div>
                                </div>
                            </div>
                        </div>

                        {/* Hero Visual Card */}
                        <div className="lg:col-span-5 relative">
                            <div className="relative mx-auto rounded-3xl bg-card p-8 text-foreground shadow-2xl shadow-primary/10 border border-border overflow-hidden flex flex-col gap-6">
                                {/* Decorative Glow */}
                                <div className="absolute -right-12 -top-12 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
                                <div className="absolute -left-12 -bottom-12 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

                                <div className="relative z-10 flex items-center justify-between border-b border-border pb-4">
                                    <div className="flex items-center gap-2.5">
                                        <div className="p-2 rounded-xl bg-primary/10 text-primary backdrop-blur-xs">
                                            <Compass className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <div className="font-extrabold text-sm text-foreground">Musim Umroh 1448 H</div>
                                            <div className="text-[11px] text-foreground/70">Pemberangkatan Reguler &amp; VIP</div>
                                        </div>
                                    </div>
                                    <Badge className="bg-primary text-primary-foreground font-extrabold text-[10px] shadow-sm">
                                        TERSEDIA
                                    </Badge>
                                </div>

                                <div className="relative z-10 flex flex-col gap-3">
                                    <div className="text-xs text-foreground/80 uppercase font-semibold tracking-wider">
                                        Fasilitas Utama Jamaah:
                                    </div>
                                    <div className="grid grid-cols-1 gap-2.5 text-xs text-foreground/90 font-medium">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                                            <span>Tiket Pesawat Saudi / Garuda PP Direct</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                                            <span>Hotel Madinah &amp; Makkah &le; 100m Pelataran</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                                            <span>Full Board Makanan Menu Nusantara 3x Sehari</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                                            <span>Handling, Visa Umroh &amp; Asuransi Lengkap</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="relative z-10 pt-4 border-t border-border flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-foreground/70">Mulai dari</span>
                                        <span className="text-lg font-black text-foreground">
                                            Rp {packages[0]?.harga ? packages[0].harga.toLocaleString('id-ID') : '28.500.000'}
                                        </span>
                                    </div>
                                    <Link href={route('public.register')}>
                                        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-xs font-black shadow-md">
                                            Booking Sekarang
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Packages Section (#paket) */}
            <section id="paket" className="py-20 bg-background border-t border-primary">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-14 flex flex-col gap-3">
                        <Badge variant="secondary" className="w-fit mx-auto bg-background text-foreground border-primary font-bold text-xs">
                            PILIHAN TERBAIK
                        </Badge>
                        <h2 className="text-3xl font-black text-foreground tracking-tight">
                            Katalog Paket Umroh &amp; Haji Pilihan
                        </h2>
                        <p className="text-xs sm:text-sm text-foreground">
                            Pilih program paket keberangkatan yang sesuai dengan kebutuhan ibadah Anda dan keluarga.
                        </p>
                    </div>

                    {packages.length === 0 ? (
                        <div className="text-center py-12 text-sm text-foreground">
                            Belum ada paket yang dipublikasikan saat ini. Hubungi kami via WhatsApp untuk reservasi khusus.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {packages.map((pkg, idx) => (
                                <Card
                                    key={pkg.id}
                                    className={`rounded-3xl border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden flex flex-col justify-between ${
                                        idx === 0
                                            ? 'border-primary bg-card ring-2 ring-primary/10'
                                            : 'border-primary bg-card'
                                    }`}
                                >
                                    <div className="p-6 sm:p-7 flex flex-col gap-5">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className="text-lg font-black text-foreground">
                                                    {pkg.nama_paket}
                                                </h3>
                                                <p className="text-xs text-foreground mt-0.5">Program 9-12 Hari Ibadah</p>
                                            </div>
                                            {idx === 0 && (
                                                <Badge className="bg-primary text-white font-extrabold text-[10px]">
                                                    POPULER
                                                </Badge>
                                            )}
                                        </div>

                                        <div className="py-3 px-4 rounded-2xl bg-background border border-primary">
                                            <span className="text-[11px] text-foreground font-medium block">Biaya Paket All-In</span>
                                            <span className="text-2xl font-black text-foreground">
                                                Rp {pkg.harga.toLocaleString('id-ID')}
                                            </span>
                                            <span className="text-[10px] text-foreground block mt-0.5">/ orang (Quad Room)</span>
                                        </div>

                                        <div className="flex flex-col gap-2.5 text-xs text-foreground">
                                            <div className="flex items-center gap-2">
                                                <CheckCircle2 className="w-4 h-4 text-foreground shrink-0" />
                                                <span>Hotel Madinah &amp; Makkah Berbintang</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <CheckCircle2 className="w-4 h-4 text-foreground shrink-0" />
                                                <span>Konsumsi Menu Indonesia 3x Sehari</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <CheckCircle2 className="w-4 h-4 text-foreground shrink-0" />
                                                <span>Bimbingan Manasik Sebelum Berangkat</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <CheckCircle2 className="w-4 h-4 text-foreground shrink-0" />
                                                <span>Air Zamzam 5 Liter (Sesuai Regulasi)</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-6 sm:p-7 pt-0 border-t border-border">
                                        <Link href={route('public.register', { paket: pkg.id })}>
                                            <Button className="w-full bg-primary hover:bg-primary text-white rounded-xl text-xs font-bold py-5 gap-2 shadow-md shadow-primary/20">
                                                <span>Pilih &amp; Daftar Paket Ini</span>
                                                <ArrowRight className="w-3.5 h-3.5" />
                                            </Button>
                                        </Link>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Why Choose Us (#keunggulan) */}
            <section id="keunggulan" className="py-20 bg-background border-t border-primary">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-14 flex flex-col gap-3">
                        <Badge variant="secondary" className="w-fit mx-auto bg-background text-foreground border-primary font-bold text-xs">
                            KEPERCAYAAN &amp; AMANAH
                        </Badge>
                        <h2 className="text-3xl font-black text-foreground tracking-tight">
                            Kenapa Memilih {travelName}?
                        </h2>
                        <p className="text-xs sm:text-sm text-foreground">
                            Standar pelayanan prima yang kami dedikasikan penuh untuk kenyamanan ibadah para tamu Allah.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Card className="rounded-2xl border border-primary bg-card p-6 shadow-xs flex flex-col gap-3">
                            <div className="p-3 rounded-2xl bg-background text-foreground w-fit">
                                <ShieldCheck className="w-6 h-6" />
                            </div>
                            <h3 className="font-extrabold text-base text-foreground">Legalitas Resmi Kemenag</h3>
                            <p className="text-xs text-foreground leading-relaxed font-medium">
                                Terdaftar dan berizin resmi sebagai PPIU Kemenag RI, menjamin transparansi dan keamanan dana jamaah.
                            </p>
                        </Card>

                        <Card className="rounded-2xl border border-primary bg-card p-6 shadow-xs flex flex-col gap-3">
                            <div className="p-3 rounded-2xl bg-background text-foreground w-fit">
                                <Building2 className="w-6 h-6" />
                            </div>
                            <h3 className="font-extrabold text-base text-foreground">Hotel Bintang Dekat Masjid</h3>
                            <p className="text-xs text-foreground leading-relaxed font-medium">
                                Akomodasi strategis hanya beberapa langkah dari pelataran Masjidil Haram &amp; Masjid Nabawi.
                            </p>
                        </Card>

                        <Card className="rounded-2xl border border-primary bg-card p-6 shadow-xs flex flex-col gap-3">
                            <div className="p-3 rounded-2xl bg-background text-foreground w-fit">
                                <Plane className="w-6 h-6" />
                            </div>
                            <h3 className="font-extrabold text-base text-foreground">Penerbangan Direct</h3>
                            <p className="text-xs text-foreground leading-relaxed font-medium">
                                Menggunakan maskapai terkemuka dengan penerbangan langsung tanpa transit yang melelahkan.
                            </p>
                        </Card>

                        <Card className="rounded-2xl border border-primary bg-card p-6 shadow-xs flex flex-col gap-3">
                            <div className="p-3 rounded-2xl bg-background text-foreground w-fit">
                                <Star className="w-6 h-6" />
                            </div>
                            <h3 className="font-extrabold text-base text-foreground">Mutawwif Bersertifikat</h3>
                            <p className="text-xs text-foreground leading-relaxed font-medium">
                                Dibimbing langsung oleh ustadz dan mutawwif yang berkompeten, ramah, dan berpengalaman.
                            </p>
                        </Card>
                    </div>
                </div>
            </section>

            {/* CTA Final Section */}
            <section className="py-16 bg-card border-t border-border text-foreground font-black">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center gap-6">
                    <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight text-foreground">
                        Siap Melangkahkan Kaki Menuju Baitullah?
                    </h2>
                    <p className="text-xs sm:text-sm text-foreground/80 max-w-2xl font-normal">
                        Daftarkan diri Anda dan keluarga secara online sekarang. Tim konsultan ibadah kami siap membantu seluruh proses persiapan dari awal hingga kepulangan.
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                        <Link href={route('public.register')}>
                            <Button
                                size="lg"
                                className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl px-8 py-6 font-extrabold text-sm shadow-xl"
                            >
                                Daftar Sekarang Secara Online
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer (#kontak) */}
            <footer id="kontak" className="bg-card text-foreground py-12 border-t border-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold">
                            <Landmark className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-sm text-foreground">{travelName}</span>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-foreground/70">
                        <a href="#paket" className="hover:text-primary transition-colors">Paket Umroh</a>
                        <a href="#keunggulan" className="hover:text-primary transition-colors">Keunggulan</a>
                        <Link href={route('login')} className="hover:text-primary transition-colors">Login Staf / Agen</Link>
                    </div>

                    <div className="text-xs text-foreground/60 text-center sm:text-right">
                        &copy; {new Date().getFullYear()} {travelName}. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
}
