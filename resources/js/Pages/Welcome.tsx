import React, { useState } from 'react';
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
        <div className="min-h-screen bg-[#FAF7F2] text-[#2C1A14] selection:bg-[#6F4E37] selection:text-white font-sans">
            <Head title={`Beranda Resmi - ${travelName}`} />

            {/* Top Announcement Bar */}
            <div className="bg-[#3E2723] text-[#FAF7F2] text-xs py-2 px-4 text-center font-medium flex items-center justify-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[#C48B5E] animate-pulse" />
                <span>Pendaftaran Musim Umroh 1448 H Telah Dibuka Resmi Berizin Kemenag RI</span>
                <Link
                    href={route('public.register')}
                    className="underline font-bold text-[#C48B5E] hover:text-white transition-colors ml-1"
                >
                    Daftar Sekarang &rarr;
                </Link>
            </div>

            {/* Navbar */}
            <header className="sticky top-0 z-50 bg-[#FAF7F2]/90 backdrop-blur-md border-b border-[#E8DFD8]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                    {/* Brand Logo */}
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#4A2E20] to-[#6F4E37] text-white flex items-center justify-center shadow-md shadow-[#4A2E20]/20 font-black text-xl">
                            🕌
                        </div>
                        <div className="flex flex-col">
                            <span className="font-extrabold text-base sm:text-lg tracking-tight text-[#2C1A14]">
                                {travelName}
                            </span>
                            <span className="text-[10px] uppercase font-bold tracking-widest text-[#8D6E63]">
                                Penyelenggara Resmi Ibadah Umroh
                            </span>
                        </div>
                    </div>

                    {/* Nav Links */}
                    <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-[#5D4037]">
                        <a href="#paket" className="hover:text-[#3E2723] transition-colors">
                            Paket Umroh
                        </a>
                        <a href="#keunggulan" className="hover:text-[#3E2723] transition-colors">
                            Keunggulan
                        </a>
                        <a href="#rekening" className="hover:text-[#3E2723] transition-colors">
                            Rekening Resmi
                        </a>
                        <a href="#kontak" className="hover:text-[#3E2723] transition-colors">
                            Kontak CS
                        </a>
                    </nav>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3">
                        {auth?.user ? (
                            <Link href={route('dashboard')}>
                                <Button className="bg-[#4A2E20] hover:bg-[#361F17] text-white rounded-xl text-xs font-bold gap-2 shadow-sm">
                                    <span>Buka Portal</span>
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </Button>
                            </Link>
                        ) : (
                            <>
                                {canLogin && (
                                    <Link href={route('login')}>
                                        <Button
                                            variant="outline"
                                            className="border-[#D7CCC8] hover:bg-[#EFEBE9] text-[#4A2E20] rounded-xl text-xs font-bold gap-1.5"
                                        >
                                            <LogIn className="w-3.5 h-3.5" />
                                            <span>Login Pengelola</span>
                                        </Button>
                                    </Link>
                                )}
                                <Link href={route('public.register')}>
                                    <Button className="bg-gradient-to-r from-[#6F4E37] to-[#4A2E20] hover:from-[#5D4037] hover:to-[#361F17] text-white rounded-xl text-xs font-bold gap-1.5 shadow-md shadow-[#4A2E20]/25">
                                        <span>Daftar Online</span>
                                        <ChevronRight className="w-3.5 h-3.5" />
                                    </Button>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </header>

            {/* Hero Section with Coffee Themed Accents */}
            <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-32 bg-gradient-to-b from-[#FAF7F2] via-[#F4EDE4] to-[#FAF7F2]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                        {/* Hero Text */}
                        <div className="lg:col-span-7 flex flex-col gap-6 text-left">
                            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EFEBE9] border border-[#D7CCC8] text-[#5D4037] w-fit shadow-xs">
                                <Award className="w-4 h-4 text-[#C48B5E]" />
                                <span className="text-xs font-bold tracking-tight">
                                    Izin Resmi Kemenag RI &bull; Pasti Berangkat
                                </span>
                            </div>

                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#2C1A14] tracking-tight leading-tight">
                                Wujudkan Ibadah Suci{' '}
                                <span className="bg-gradient-to-r from-[#6F4E37] to-[#C48B5E] bg-clip-text text-transparent">
                                    Penuh Berkah &amp; Ketenangan
                                </span>
                            </h1>

                            <p className="text-sm sm:text-base text-[#6D4C41] leading-relaxed max-w-2xl font-medium">
                                Nikmati pengalaman ibadah Umroh dan Haji Khusus dengan bimbingan sesuai Sunnah, akomodasi hotel bintang terbaik dekat Masjidil Haram, maskapai direct tanpa transit, serta pendampingan mutawwif berpengalaman.
                            </p>

                            {/* Hero CTAs */}
                            <div className="flex flex-wrap items-center gap-4 pt-2">
                                <Link href={route('public.register')}>
                                    <Button
                                        size="lg"
                                        className="bg-[#4A2E20] hover:bg-[#361F17] text-white rounded-2xl px-6 py-6 font-extrabold text-sm gap-2 shadow-xl shadow-[#4A2E20]/25 transition-all hover:scale-[1.02]"
                                    >
                                        <span>Daftar Calon Jamaah Sekarang</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </Button>
                                </Link>

                                <a href="#paket">
                                    <Button
                                        size="lg"
                                        variant="outline"
                                        className="border-[#8D6E63]/40 hover:bg-[#EFEBE9] text-[#3E2723] rounded-2xl px-6 py-6 font-bold text-sm gap-2 shadow-xs"
                                    >
                                        <span>Lihat Pilihan Paket</span>
                                    </Button>
                                </a>
                            </div>

                            {/* Trust Badges */}
                            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-[#E8DFD8]">
                                <div>
                                    <div className="text-xl sm:text-2xl font-black text-[#3E2723]">100%</div>
                                    <div className="text-xs text-[#8D6E63] font-medium">Pasti Berangkat</div>
                                </div>
                                <div>
                                    <div className="text-xl sm:text-2xl font-black text-[#3E2723]">5.000+</div>
                                    <div className="text-xs text-[#8D6E63] font-medium">Jamaah Terlayani</div>
                                </div>
                                <div>
                                    <div className="text-xl sm:text-2xl font-black text-[#3E2723]">Bintang 5</div>
                                    <div className="text-xs text-[#8D6E63] font-medium">Hotel Dekat Haram</div>
                                </div>
                            </div>
                        </div>

                        {/* Hero Visual Card (Coffee Themed Banner) */}
                        <div className="lg:col-span-5 relative">
                            <div className="relative mx-auto rounded-3xl bg-gradient-to-br from-[#4A2E20] via-[#5D4037] to-[#3E2723] p-8 text-white shadow-2xl shadow-[#3E2723]/40 border border-[#8D6E63]/30 overflow-hidden flex flex-col gap-6">
                                {/* Decorative Glow */}
                                <div className="absolute -right-12 -top-12 w-48 h-48 bg-[#C48B5E]/30 rounded-full blur-3xl" />
                                <div className="absolute -left-12 -bottom-12 w-48 h-48 bg-[#8D6E63]/30 rounded-full blur-3xl" />

                                <div className="relative z-10 flex items-center justify-between border-b border-white/10 pb-4">
                                    <div className="flex items-center gap-2.5">
                                        <div className="p-2 rounded-xl bg-white/10 backdrop-blur-xs">
                                            <Compass className="w-5 h-5 text-[#C48B5E]" />
                                        </div>
                                        <div>
                                            <div className="font-extrabold text-sm text-white">Musim Umroh 1448 H</div>
                                            <div className="text-[11px] text-white/70">Pemberangkatan Reguler &amp; VIP</div>
                                        </div>
                                    </div>
                                    <Badge className="bg-[#C48B5E] text-[#2C1A14] font-extrabold text-[10px]">
                                        TERSEDIA
                                    </Badge>
                                </div>

                                <div className="relative z-10 flex flex-col gap-3">
                                    <div className="text-xs text-white/80 uppercase font-semibold tracking-wider">
                                        Fasilitas Utama Jamaah:
                                    </div>
                                    <div className="grid grid-cols-1 gap-2.5 text-xs text-white/90">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-[#C48B5E] shrink-0" />
                                            <span>Tiket Pesawat Saudi / Garuda PP Direct</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-[#C48B5E] shrink-0" />
                                            <span>Hotel Madinah &amp; Makkah &le; 100m Pelataran</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-[#C48B5E] shrink-0" />
                                            <span>Full Board Makanan Menu Nusantara 3x Sehari</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-[#C48B5E] shrink-0" />
                                            <span>Handling, Visa Umroh &amp; Asuransi Lengkap</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-white/70">Mulai dari</span>
                                        <span className="text-lg font-black text-[#FAF7F2]">
                                            Rp {packages[0]?.harga ? packages[0].harga.toLocaleString('id-ID') : '28.500.000'}
                                        </span>
                                    </div>
                                    <Link href={route('public.register')}>
                                        <Button className="bg-white hover:bg-[#FAF7F2] text-[#3E2723] rounded-xl text-xs font-black shadow-md">
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
            <section id="paket" className="py-20 bg-[#FAF7F2] border-t border-[#E8DFD8]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-14 flex flex-col gap-3">
                        <Badge variant="secondary" className="w-fit mx-auto bg-[#EFEBE9] text-[#5D4037] border-[#D7CCC8] font-bold text-xs">
                            PILIHAN TERBAIK
                        </Badge>
                        <h2 className="text-3xl font-black text-[#2C1A14] tracking-tight">
                            Katalog Paket Umroh &amp; Haji Pilihan
                        </h2>
                        <p className="text-xs sm:text-sm text-[#6D4C41]">
                            Pilih program paket keberangkatan yang sesuai dengan kebutuhan ibadah Anda dan keluarga.
                        </p>
                    </div>

                    {packages.length === 0 ? (
                        <div className="text-center py-12 text-sm text-[#8D6E63]">
                            Belum ada paket yang dipublikasikan saat ini. Hubungi kami via WhatsApp untuk reservasi khusus.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {packages.map((pkg, idx) => (
                                <Card
                                    key={pkg.id}
                                    className={`rounded-3xl border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden flex flex-col justify-between ${
                                        idx === 0
                                            ? 'border-[#6F4E37] bg-white ring-2 ring-[#6F4E37]/10'
                                            : 'border-[#E8DFD8] bg-white'
                                    }`}
                                >
                                    <div className="p-6 sm:p-7 flex flex-col gap-5">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className="text-lg font-black text-[#2C1A14]">
                                                    {pkg.nama_paket}
                                                </h3>
                                                <p className="text-xs text-[#8D6E63] mt-0.5">Program 9-12 Hari Ibadah</p>
                                            </div>
                                            {idx === 0 && (
                                                <Badge className="bg-[#6F4E37] text-white font-extrabold text-[10px]">
                                                    POPULER
                                                </Badge>
                                            )}
                                        </div>

                                        <div className="py-3 px-4 rounded-2xl bg-[#FAF7F2] border border-[#E8DFD8]">
                                            <span className="text-[11px] text-[#8D6E63] font-medium block">Biaya Paket All-In</span>
                                            <span className="text-2xl font-black text-[#3E2723]">
                                                Rp {pkg.harga.toLocaleString('id-ID')}
                                            </span>
                                            <span className="text-[10px] text-[#8D6E63] block mt-0.5">/ orang (Quad Room)</span>
                                        </div>

                                        <div className="flex flex-col gap-2.5 text-xs text-[#5D4037]">
                                            <div className="flex items-center gap-2">
                                                <CheckCircle2 className="w-4 h-4 text-[#C48B5E] shrink-0" />
                                                <span>Hotel Madinah &amp; Makkah Berbintang</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <CheckCircle2 className="w-4 h-4 text-[#C48B5E] shrink-0" />
                                                <span>Konsumsi Menu Indonesia 3x Sehari</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <CheckCircle2 className="w-4 h-4 text-[#C48B5E] shrink-0" />
                                                <span>Bimbingan Manasik Sebelum Berangkat</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <CheckCircle2 className="w-4 h-4 text-[#C48B5E] shrink-0" />
                                                <span>Air Zamzam 5 Liter (Sesuai Regulasi)</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-6 sm:p-7 pt-0 border-t border-[#FAF7F2]">
                                        <Link href={route('public.register', { paket: pkg.id })}>
                                            <Button className="w-full bg-[#4A2E20] hover:bg-[#361F17] text-white rounded-xl text-xs font-bold py-5 gap-2 shadow-md shadow-[#4A2E20]/20">
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
            <section id="keunggulan" className="py-20 bg-[#F4EDE4] border-t border-[#E8DFD8]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-14 flex flex-col gap-3">
                        <Badge variant="secondary" className="w-fit mx-auto bg-[#EFEBE9] text-[#5D4037] border-[#D7CCC8] font-bold text-xs">
                            KEPERCAYAAN &amp; AMANAH
                        </Badge>
                        <h2 className="text-3xl font-black text-[#2C1A14] tracking-tight">
                            Kenapa Memilih {travelName}?
                        </h2>
                        <p className="text-xs sm:text-sm text-[#6D4C41]">
                            Standar pelayanan prima yang kami dedikasikan penuh untuk kenyamanan ibadah para tamu Allah.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Card className="rounded-2xl border border-[#E8DFD8] bg-white p-6 shadow-xs flex flex-col gap-3">
                            <div className="p-3 rounded-2xl bg-[#EFEBE9] text-[#4A2E20] w-fit">
                                <ShieldCheck className="w-6 h-6" />
                            </div>
                            <h3 className="font-extrabold text-base text-[#2C1A14]">Legalitas Resmi Kemenag</h3>
                            <p className="text-xs text-[#6D4C41] leading-relaxed font-medium">
                                Terdaftar dan berizin resmi sebagai PPIU Kemenag RI, menjamin transparansi dan keamanan dana jamaah.
                            </p>
                        </Card>

                        <Card className="rounded-2xl border border-[#E8DFD8] bg-white p-6 shadow-xs flex flex-col gap-3">
                            <div className="p-3 rounded-2xl bg-[#EFEBE9] text-[#4A2E20] w-fit">
                                <Building2 className="w-6 h-6" />
                            </div>
                            <h3 className="font-extrabold text-base text-[#2C1A14]">Hotel Bintang Dekat Masjid</h3>
                            <p className="text-xs text-[#6D4C41] leading-relaxed font-medium">
                                Akomodasi strategis hanya beberapa langkah dari pelataran Masjidil Haram &amp; Masjid Nabawi.
                            </p>
                        </Card>

                        <Card className="rounded-2xl border border-[#E8DFD8] bg-white p-6 shadow-xs flex flex-col gap-3">
                            <div className="p-3 rounded-2xl bg-[#EFEBE9] text-[#4A2E20] w-fit">
                                <Plane className="w-6 h-6" />
                            </div>
                            <h3 className="font-extrabold text-base text-[#2C1A14]">Penerbangan Direct</h3>
                            <p className="text-xs text-[#6D4C41] leading-relaxed font-medium">
                                Menggunakan maskapai terkemuka dengan penerbangan langsung tanpa transit yang melelahkan.
                            </p>
                        </Card>

                        <Card className="rounded-2xl border border-[#E8DFD8] bg-white p-6 shadow-xs flex flex-col gap-3">
                            <div className="p-3 rounded-2xl bg-[#EFEBE9] text-[#4A2E20] w-fit">
                                <Star className="w-6 h-6" />
                            </div>
                            <h3 className="font-extrabold text-base text-[#2C1A14]">Mutawwif Bersertifikat</h3>
                            <p className="text-xs text-[#6D4C41] leading-relaxed font-medium">
                                Dibimbing langsung oleh ustadz dan mutawwif yang berkompeten, ramah, dan berpengalaman.
                            </p>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Official Banks Section (#rekening) */}
            <section id="rekening" className="py-20 bg-[#FAF7F2] border-t border-[#E8DFD8]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-14 flex flex-col gap-3">
                        <Badge variant="secondary" className="w-fit mx-auto bg-[#EFEBE9] text-[#5D4037] border-[#D7CCC8] font-bold text-xs">
                            KEAMANAN TRANSAKSI
                        </Badge>
                        <h2 className="text-3xl font-black text-[#2C1A14] tracking-tight">
                            Rekening Resmi Pembayaran Travel
                        </h2>
                        <p className="text-xs sm:text-sm text-[#6D4C41]">
                            Demi keamanan bersama, seluruh pembayaran DP dan pelunasan hanya ditransfer ke rekening resmi berbadan hukum atas nama travel kami.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
                        {banks.length === 0 ? (
                            <Card className="col-span-full p-8 text-center text-xs text-[#8D6E63]">
                                Rekening bank resmi akan diinformasikan saat proses konfirmasi pendaftaran.
                            </Card>
                        ) : (
                            banks.map((bank) => (
                                <Card key={bank.id} className="rounded-2xl border border-[#E8DFD8] bg-white p-6 shadow-xs flex flex-col gap-2">
                                    <div className="flex items-center justify-between">
                                        <span className="font-black text-sm text-[#2C1A14]">{bank.nama_bank}</span>
                                        <CreditCard className="w-4 h-4 text-[#8D6E63]" />
                                    </div>
                                    <div className="text-lg font-mono font-black text-[#3E2723] tracking-wider mt-1">
                                        {bank.nomor_rekening}
                                    </div>
                                    <div className="text-xs text-[#8D6E63] font-medium">
                                        a.n <strong className="text-[#2C1A14]">{bank.atas_nama}</strong>
                                    </div>
                                </Card>
                            ))
                        )}
                    </div>
                </div>
            </section>

            {/* CTA Final Section */}
            <section className="py-16 bg-gradient-to-r from-[#4A2E20] via-[#5D4037] to-[#3E2723] text-white">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center gap-6">
                    <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
                        Siap Melangkahkan Kaki Menuju Baitullah?
                    </h2>
                    <p className="text-xs sm:text-sm text-white/80 max-w-2xl">
                        Daftarkan diri Anda dan keluarga secara online sekarang. Tim konsultan ibadah kami siap membantu seluruh proses persiapan dari awal hingga kepulangan.
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                        <Link href={route('public.register')}>
                            <Button
                                size="lg"
                                className="bg-white hover:bg-[#FAF7F2] text-[#3E2723] rounded-2xl px-8 py-6 font-extrabold text-sm shadow-xl"
                            >
                                Daftar Sekarang Secara Online
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer (#kontak) */}
            <footer id="kontak" className="bg-[#2C1A14] text-[#D7CCC8] py-12 border-t border-white/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-[#4A2E20] text-white flex items-center justify-center font-bold">
                            🕌
                        </div>
                        <span className="font-bold text-sm text-white">{travelName}</span>
                    </div>

                    <div className="text-xs text-[#8D6E63] text-center sm:text-right">
                        &copy; {new Date().getFullYear()} {travelName}. Hak Cipta Dilindungi Undang-Undang.
                    </div>
                </div>
            </footer>
        </div>
    );
}
