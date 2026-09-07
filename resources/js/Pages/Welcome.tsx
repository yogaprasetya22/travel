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
    BookOpen,
    Eye,
    Tag,
    X,
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

interface ItineraryItem {
    day: number;
    title: string;
    description: string;
    location?: string;
}

interface PaketItem {
    id: number;
    nama_paket: string;
    harga: number;
    kuota?: number;
    available_seats?: number;
    deskripsi?: string | null;
    brosur_url?: string | null;
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

    const [selectedPackage, setSelectedPackage] = useState<PaketItem | null>(null);

    return (
        <div 
            className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-white font-sans"
            style={(themeData.themes[(tenant?.theme_name as keyof typeof themeData.themes) || 'coffee']?.variables || themeData.themes['coffee'].variables) as React.CSSProperties}
        >
            <Head title={`Beranda Resmi - ${travelName}`} />

            {/* Top Announcement Bar */}
            <div className="bg-primary text-primary-foreground text-[10px] sm:text-xs py-2 px-4 text-center font-medium flex flex-wrap items-center justify-center gap-1 sm:gap-2">
                <Sparkles className="w-3.5 h-3.5 text-primary-foreground animate-pulse hidden sm:block" />
                <span>Pendaftaran Musim Umroh 1448 H Telah Dibuka</span>
                <span className="hidden sm:inline"> Resmi Berizin Kemenag RI</span>
                <Link
                    href={route('public.register')}
                    className="underline font-bold hover:opacity-80 transition-opacity ml-1 whitespace-nowrap"
                >
                    Daftar Sekarang &rarr;
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
                        <div className="hidden md:flex items-center gap-8 text-xs font-bold text-foreground">
                            <a href="#paket" className="hover:text-primary transition-colors">Brosur Paket</a>
                            <a href="#keunggulan" className="hover:text-primary transition-colors">Keunggulan</a>
                            <a href="#pembayaran" className="hover:text-primary transition-colors">Rekening Resmi</a>
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

            {/* Hero Section */}
            <section className="relative overflow-hidden py-16 sm:py-24 bg-gradient-to-b from-primary/5 via-background to-background">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                        <div className="lg:col-span-7 flex flex-col gap-6 text-left">
                            <Badge className="w-fit bg-primary/10 text-primary border-primary/20 font-bold text-xs px-3 py-1 rounded-full">
                                ✨ Perjalanan Ibadah Khusyuk &amp; Nyaman
                            </Badge>
                            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-foreground tracking-tight leading-tight">
                                Menuju Baitullah dengan Layanan Amanah &amp; Terpercaya
                            </h1>
                            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                                Bersama <strong>{travelName}</strong>, wujudkan impian ibadah Umroh dan Haji Anda dengan kepastian jadwal, akomodasi hotel dekat pelataran masjid, bimbingan manasik komprehensif, dan mutawwif bersertifikat.
                            </p>

                            <div className="flex flex-wrap items-center gap-4 pt-2">
                                <a href="#paket">
                                    <Button size="lg" className="rounded-2xl text-xs sm:text-sm font-black px-6 py-6 bg-primary text-primary-foreground shadow-lg hover:shadow-primary/20 transition-all gap-2">
                                        <span>Lihat Brosur Paket &amp; Itinerary</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </Button>
                                </a>
                                <Link href={route('public.register')}>
                                    <Button size="lg" variant="outline" className="rounded-2xl text-xs sm:text-sm font-bold px-6 py-6 border-border hover:bg-muted">
                                        Pendaftaran Online
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        <div className="lg:col-span-5 flex justify-center">
                            <div className="relative w-full max-w-md bg-card border border-border/80 rounded-3xl p-6 shadow-xl flex flex-col gap-5">
                                <div className="flex items-center justify-between pb-4 border-b border-border">
                                    <div>
                                        <div className="text-xs font-bold text-primary uppercase">Program Unggulan</div>
                                        <div className="text-base font-black text-foreground">Musim Umroh 1448 H</div>
                                    </div>
                                    <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-bold text-xs">
                                        TERSEDIA
                                    </Badge>
                                </div>
                                <div className="space-y-3 text-xs text-muted-foreground">
                                    <div className="flex items-center gap-2.5">
                                        <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                                        <span>Penerbangan Direct Tanpa Transit</span>
                                    </div>
                                    <div className="flex items-center gap-2.5">
                                        <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                                        <span>Hotel Makkah &amp; Madinah Dekat Masjid</span>
                                    </div>
                                    <div className="flex items-center gap-2.5">
                                        <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                                        <span>Menu Makanan Cita Rasa Nusantara 3x Sehari</span>
                                    </div>
                                    <div className="flex items-center gap-2.5">
                                        <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                                        <span>Handling &amp; Perlengkapan Lengkap Exclusive</span>
                                    </div>
                                </div>
                                <Link href={route('public.register')}>
                                    <Button className="w-full rounded-xl text-xs font-bold py-5 bg-primary text-primary-foreground shadow-md">
                                        Booking Kursi Sekarang
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Packages Section (#paket) - BROSUR ONLY + CLICK TO MODAL */}
            <section id="paket" className="py-20 bg-background border-t border-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-14 flex flex-col gap-3">
                        <Badge variant="secondary" className="w-fit mx-auto bg-primary/10 text-primary border-primary/20 font-bold text-xs">
                            BROSUR &amp; ITINERARY RESMI
                        </Badge>
                        <h2 className="text-3xl font-black text-foreground tracking-tight">
                            Katalog Brosur Paket Umroh &amp; Haji
                        </h2>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                            Klik pada brosur paket untuk melihat rincian jadwal hari per hari (itinerary), fasilitas hotel, dan sisa kursi tersedia.
                        </p>
                    </div>

                    {packages.length === 0 ? (
                        <div className="text-center py-12 text-sm text-muted-foreground">
                            Belum ada paket yang dipublikasikan saat ini. Hubungi kami via WhatsApp untuk reservasi khusus.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {packages.map((pkg) => {
                                const availableSeats = pkg.available_seats !== undefined ? pkg.available_seats : (pkg.kuota || 45);
                                const totalKuota = pkg.kuota || 45;

                                return (
                                    <div
                                        key={pkg.id}
                                        onClick={() => setSelectedPackage(pkg)}
                                        className="group bg-card rounded-3xl border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-2xl overflow-hidden cursor-pointer flex flex-col justify-between"
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
                                                    <Compass className="w-12 h-12 text-primary/60 animate-spin-slow" />
                                                    <span className="font-bold text-sm text-foreground">{pkg.nama_paket}</span>
                                                    <span className="text-xs">Brosur Resmi Keberangkatan</span>
                                                </div>
                                            )}

                                            {/* Available Seats Badge on Poster */}
                                            <div className="absolute top-3 right-3 z-10">
                                                <Badge className={`font-bold text-xs shadow-md border ${
                                                    availableSeats > 5
                                                        ? 'bg-emerald-600 text-white border-emerald-500'
                                                        : availableSeats > 0
                                                        ? 'bg-amber-600 text-white border-amber-500'
                                                        : 'bg-rose-600 text-white border-rose-500'
                                                }`}>
                                                    {availableSeats > 0 ? `Sisa ${availableSeats} Kursi` : 'Kuota Penuh'}
                                                </Badge>
                                            </div>

                                            {/* Price Overlay */}
                                            <div className="absolute bottom-3 left-3 z-10 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-xl text-white">
                                                <div className="text-[10px] uppercase font-semibold text-white/80">Biaya All-In Mulai</div>
                                                <div className="text-base font-black text-amber-400">
                                                    Rp {pkg.harga.toLocaleString('id-ID')}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Card Info Details */}
                                        <div className="p-5 flex flex-col gap-4">
                                            <div>
                                                <h3 className="font-black text-lg text-foreground group-hover:text-primary transition-colors">
                                                    {pkg.nama_paket}
                                                </h3>
                                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                                    {pkg.deskripsi || 'Program ibadah umroh berkualitas dengan akomodasi hotel bintang dan pembimbing bersertifikat.'}
                                                </p>
                                            </div>

                                            <div className="flex items-center justify-between pt-3 border-t border-border/80 text-xs">
                                                <span className="text-muted-foreground flex items-center gap-1 font-semibold">
                                                    <Eye className="w-4 h-4 text-primary" /> Klik untuk Itinerary
                                                </span>
                                                <span className="text-xs font-bold text-primary flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                                    Detail &amp; Jadwal <ChevronRight className="w-4 h-4" />
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>

            {/* Why Choose Us (#keunggulan) */}
            <section id="keunggulan" className="py-20 bg-muted/30 border-t border-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-14 flex flex-col gap-3">
                        <Badge variant="secondary" className="w-fit mx-auto bg-primary/10 text-primary border-primary/20 font-bold text-xs">
                            KEPERCAYAAN &amp; AMANAH
                        </Badge>
                        <h2 className="text-3xl font-black text-foreground tracking-tight">
                            Kenapa Memilih {travelName}?
                        </h2>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                            Standar pelayanan prima yang kami dedikasikan penuh untuk kenyamanan ibadah para tamu Allah.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Card className="rounded-2xl border border-border bg-card p-6 shadow-xs flex flex-col gap-3">
                            <div className="p-3 rounded-2xl bg-primary/10 text-primary w-fit">
                                <ShieldCheck className="w-6 h-6" />
                            </div>
                            <h3 className="font-extrabold text-base text-foreground">Legalitas PPIU Resmi</h3>
                            <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                                Terdaftar dan berizin resmi Kemenag RI, menjamin transparansi, kepastian keberangkatan, dan keamanan dana jamaah.
                            </p>
                        </Card>

                        <Card className="rounded-2xl border border-border bg-card p-6 shadow-xs flex flex-col gap-3">
                            <div className="p-3 rounded-2xl bg-primary/10 text-primary w-fit">
                                <Building2 className="w-6 h-6" />
                            </div>
                            <h3 className="font-extrabold text-base text-foreground">Hotel Dekat Masjid</h3>
                            <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                                Akomodasi strategis hanya beberapa langkah dari pelataran Masjidil Haram Makkah &amp; Masjid Nabawi Madinah.
                            </p>
                        </Card>

                        <Card className="rounded-2xl border border-border bg-card p-6 shadow-xs flex flex-col gap-3">
                            <div className="p-3 rounded-2xl bg-primary/10 text-primary w-fit">
                                <Plane className="w-6 h-6" />
                            </div>
                            <h3 className="font-extrabold text-base text-foreground">Penerbangan Nyaman</h3>
                            <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                                Menggunakan maskapai penerbangan terkemuka langsung ke Jeddah / Madinah tanpa transit yang melelahkan.
                            </p>
                        </Card>

                        <Card className="rounded-2xl border border-border bg-card p-6 shadow-xs flex flex-col gap-3">
                            <div className="p-3 rounded-2xl bg-primary/10 text-primary w-fit">
                                <Star className="w-6 h-6" />
                            </div>
                            <h3 className="font-extrabold text-base text-foreground">Pembimbing Ahli</h3>
                            <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                                Dibimbing langsung oleh ustadz dan mutawwif bersertifikat yang berkompeten, ramah, dan berpengalaman.
                            </p>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Bank Accounts Section (#pembayaran) */}
            <section id="pembayaran" className="py-20 bg-background border-t border-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-12 flex flex-col gap-3">
                        <Badge variant="secondary" className="w-fit mx-auto bg-primary/10 text-primary border-primary/20 font-bold text-xs">
                            TRANSAKSI AMAN
                        </Badge>
                        <h2 className="text-3xl font-black text-foreground tracking-tight">
                            Rekening Bank Resmi Travel
                        </h2>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                            Seluruh transaksi pembayaran DP dan pelunasan hanya ditransfer ke rekening resmi atas nama perusahaan travel.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
                        {banks.map((b) => (
                            <div key={b.id} className="p-5 rounded-2xl bg-card border border-border shadow-xs flex flex-col gap-2">
                                <div className="flex items-center gap-2 font-bold text-sm text-primary">
                                    <Landmark className="w-4 h-4" /> {b.nama_bank}
                                </div>
                                <div className="text-lg font-mono font-black text-foreground tracking-wider">{b.nomor_rekening}</div>
                                <div className="text-xs text-muted-foreground">a.n. <strong>{b.atas_nama}</strong></div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 bg-card border-t border-border text-center text-xs text-muted-foreground">
                <p>&copy; {new Date().getFullYear()} {travelName}. Seluruh hak cipta dilindungi.</p>
            </footer>

            {/* DETAIL PAKET & ITINERARY MODAL (POIN 12) */}
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
                                            <div key={idx} className="p-3.5 rounded-xl bg-card border border-border/80 flex items-start gap-3 text-xs shadow-2xs">
                                                <div className="w-7 h-7 rounded-lg bg-primary text-primary-foreground font-black flex items-center justify-center shrink-0 text-xs">
                                                    H{itin.day || (idx + 1)}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="font-bold text-foreground text-sm">
                                                        {itin.title}
                                                    </div>
                                                    {itin.location && (
                                                        <div className="text-[11px] text-primary font-medium flex items-center gap-1 mt-0.5">
                                                            <MapPin className="w-3 h-3" /> {itin.location}
                                                        </div>
                                                    )}
                                                    <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                                                        {itin.description}
                                                    </p>
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
