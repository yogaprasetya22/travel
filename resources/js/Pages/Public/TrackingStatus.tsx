import React, { useState } from 'react';
import themeData from '@/lib/theme-colors.json';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { PageProps } from '@/Types';
import {
    Search,
    FileCheck2,
    ShieldCheck,
    CreditCard,
    Calendar,
    Plane,
    Building2,
    Clock,
    CheckCircle2,
    Clock3,
    ArrowLeft,
    PhoneCall,
    MessageCircle,
    Download,
    ExternalLink,
    AlertCircle,
    UserCheck,
    Sparkles,
    Check,
    QrCode,
    ChevronRight,
    Award,
    Receipt,
    Wallet,
    Info,
    Lock,
    Copy,
    PlusCircle,
    Upload,
    RefreshCw,
    MapPin,
    Luggage,
    PackageCheck,
    CheckSquare,
    Truck,
    Layers,
    FileText,
    HeartHandshake,
    Compass,
    XCircle,
    ChevronDown,
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
    DialogDescription,
} from '@/Components/ui/dialog';
import { Label } from '@/Components/ui/label';
import { Input } from '@/Components/ui/input';
import CurrencyInput from '@/Components/CurrencyInput';

interface BankTujuan {
    id: number;
    nama_bank: string;
    nomor_rekening: string;
    atas_nama: string;
}

interface PembayaranItem {
    id: number;
    nomor_invoice: string;
    nominal?: number;
    jumlah_bayar: number;
    tipe_pembayaran?: string;
    metode_pembayaran?: string;
    status_verifikasi: string;
    keterangan?: string | null;
    created_at?: string;
    verified_at?: string | null;
    bank_tujuan?: {
        nama_bank: string;
        nomor_rekening: string;
        atas_nama: string;
    } | null;
}

interface RundownDetail {
    time: string;
    activity: string;
    notes?: string;
}

interface ItineraryDay {
    day: number;
    title: string;
    description?: string;
    location?: string;
    rundowns?: RundownDetail[];
}

interface ItemDistributionData {
    id: number;
    nama_barang: string;
    status: string;
    tanggal_serah_terima?: string | null;
    catatan?: string | null;
}

interface PaketItem {
    id: number;
    nama_paket: string;
    harga: number;
    durasi_hari: number;
    maskapai?: string | null;
    hotel_makkah?: string | null;
    hotel_madinah?: string | null;
    bintang_makkah?: number;
    bintang_madinah?: number;
    brosur_url?: string | null;
    itinerary?: ItineraryDay[] | null;
    fasilitas?: string[] | { includes?: string[]; excludes?: string[] } | null;
    deskripsi?: string | null;
}

interface JamaahTrackingData {
    id: number;
    kode_pendaftaran: string;
    nama_lengkap: string;
    no_hp: string;
    email?: string | null;
    tanggal_keberangkatan?: string | null;
    created_at?: string;
    status_logistik?: string | null;
    no_resi_logistik?: string | null;
    ekspedisi_logistik?: string | null;
    tanggal_serah_terima_logistik?: string | null;
    stage: {
        name: string;
        urutan: number;
    };
    paket?: PaketItem | null;
    item_distributions?: ItemDistributionData[];
    agen?: {
        name: string;
        phone?: string | null;
    } | null;
    financial_summary: {
        total_biaya: number;
        total_terbayar: number;
        total_pending: number;
        sisa_tagihan: number;
        persentase_lunas: number;
        is_lunas: boolean;
        status_label: string;
    };
    pembayaran_list: PembayaranItem[];
    documents_count: number;
}

interface TrackingPageProps extends PageProps {
    tenant: {
        id: number;
        nama_travel: string;
        domain_atau_subdomain?: string;
        logo?: string | null;
        no_telepon?: string | null;
        theme_name?: string | null;
    } | null;
    query?: string;
    code?: string;
    pin?: string;
    token?: string;
    searchPerformed?: boolean;
    notFound?: boolean;
    requirePin?: boolean;
    invalidPin?: boolean;
    candidateHint?: {
        kode: string;
        pin_type: 'NIK' | 'HP';
        pin_label: string;
        masked_identifier: string;
    } | null;
    jamaah?: JamaahTrackingData | null;
    bank_accounts?: BankTujuan[];
    flash?: {
        success?: string | null;
        error?: string | null;
    };
}

export default function TrackingStatus({
    tenant,
    query = '',
    code = '',
    pin = '',
    token = '',
    searchPerformed = false,
    notFound = false,
    requirePin = false,
    invalidPin = false,
    candidateHint = null,
    jamaah = null,
    bank_accounts = [],
}: TrackingPageProps) {
    const { flash } = usePage<TrackingPageProps>().props;
    const [searchCode, setSearchCode] = useState(code || query);
    const [searchPin, setSearchPin] = useState(pin);
    const [inlinePin, setInlinePin] = useState('');
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [copiedBankId, setCopiedBankId] = useState<number | null>(null);
    const [activeDetailTab, setActiveDetailTab] = useState<'itinerary' | 'fasilitas' | 'perlengkapan'>('itinerary');

    // Installment Form State
    const [nominal, setNominal] = useState('');
    const [selectedBankId, setSelectedBankId] = useState<string>(
        bank_accounts.length > 0 ? String(bank_accounts[0].id) : ''
    );
    const [tipePembayaran, setTipePembayaran] = useState<string>('Cicilan');
    const [buktiTransfer, setBuktiTransfer] = useState<File | null>(null);
    const [keterangan, setKeterangan] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    const travelName = tenant?.nama_travel || 'HajjFlow Umroh & Haji';
    const rawPhone = tenant?.no_telepon || '6281234567890';
    const cleanPhone = rawPhone.replace(/[^0-9]/g, '').replace(/^0/, '62');
    const csWaUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Assalamu'alaikum CS ${travelName}, saya ingin menanyakan status pendaftaran/pembayaran saya (${jamaah?.kode_pendaftaran || searchCode}).`)}`;

    const handleSearch = (e: React.FormEvent, customPin?: string) => {
        e.preventDefault();
        if (!searchCode.trim()) return;
        router.get(route('public.tracking'), {
            code: searchCode.trim(),
            pin: (customPin !== undefined ? customPin : searchPin).trim(),
        }, { preserveState: true });
    };

    const handleCopyRekening = (bank: BankTujuan) => {
        navigator.clipboard.writeText(bank.nomor_rekening);
        setCopiedBankId(bank.id);
        setTimeout(() => setCopiedBankId(null), 2500);
    };

    const handleSubmitPayment = (e: React.FormEvent) => {
        e.preventDefault();
        if (!jamaah) return;

        const errors: Record<string, string> = {};
        if (!nominal || Number(nominal) <= 0) errors.nominal = 'Nominal pembayaran wajib diisi.';
        if (!selectedBankId) errors.rekening_tenant_id = 'Pilih rekening tujuan transfer.';
        if (!buktiTransfer) errors.bukti_transfer = 'Unggah file bukti/struk transfer.';

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        setFormErrors({});
        setIsSubmitting(true);

        const formData = new FormData();
        formData.append('jamaah_id', String(jamaah.id));
        formData.append('nominal', nominal);
        formData.append('rekening_tenant_id', selectedBankId);
        formData.append('tipe_pembayaran', tipePembayaran);
        if (buktiTransfer) formData.append('bukti_transfer', buktiTransfer);
        if (keterangan) formData.append('keterangan', keterangan);

        router.post(route('public.submit-installment'), formData, {
            preserveScroll: true,
            onSuccess: () => {
                setIsPaymentModalOpen(false);
                setNominal('');
                setBuktiTransfer(null);
                setKeterangan('');
                setIsSubmitting(false);
            },
            onError: (errs) => {
                setFormErrors(errs as Record<string, string>);
                setIsSubmitting(false);
            },
        });
    };

    const activeTheme = (tenant?.theme_name as keyof typeof themeData.themes) || 'coffee';
    const themeStyles = (themeData.themes[activeTheme]?.variables || themeData.themes['coffee'].variables) as React.CSSProperties;

    // Default Itinerary Rundowns generator if package has no specific custom JSON
    const itineraryList: ItineraryDay[] = Array.isArray(jamaah?.paket?.itinerary) && jamaah.paket.itinerary.length > 0
        ? jamaah.paket.itinerary
        : [
            {
                day: 1,
                title: 'Keberangkatan Menuju Tanah Suci (Jeddah / Madinah)',
                location: 'Bandara Internasional - Madinah',
                description: 'Berkumpul di Lounge Bandara 4 jam sebelum keberangkatan. Proses check-in, bagasi, boarding, dan penerbangan langsung menuju Tanah Suci.',
                rundowns: [
                    { time: '04:00 WIB', activity: 'Kumpul di Lounge Bandara & Briefing Manasik Singkat' },
                    { time: '08:30 WIB', activity: 'Proses Imigrasi & Boarding Pesawat' },
                    { time: '14:30 AST', activity: 'Tiba di Bandara Madinah / Jeddah & Penyambutan Tim Muthawwif' },
                    { time: '17:00 AST', activity: 'Check-in Hotel & Istirahat' },
                ]
            },
            {
                day: 2,
                title: 'Ziarah Raudhah & Masjid Nabawi',
                location: 'Madinah Al-Munawwarah',
                description: 'Memperbanyak ibadah sholat fardhu di Masjid Nabawi. Mengunjungi Raudhah Syarifah (Taman Surga) dengan tasreh resmi dan ziarah Makam Rasulullah SAW.',
                rundowns: [
                    { time: '03:30 AST', activity: 'Qiyamul Lail & Sholat Subuh Berjamaah di Masjid Nabawi' },
                    { time: '08:00 AST', activity: 'Ziarah Raudhah & Makam Rasulullah SAW bersama Muthawwif' },
                    { time: '16:00 AST', activity: 'Kajian Rohani & Pemantapan Ibadah di Pelataran Nabawi' },
                ]
            },
            {
                day: 3,
                title: 'Ziarah Kota Suci Madinah (Masjid Quba & Jabal Uhud)',
                location: 'Madinah Al-Munawwarah',
                description: 'Ziarah sejarah napak tilas Rasulullah: Masjid Quba (pahalanya setara Umroh), Kebun Kurma, Percetakan Al-Quran, dan Jabal Uhud.',
                rundowns: [
                    { time: '07:00 AST', activity: 'Ziarah Masjid Quba (Sholat Sunnah 2 Rakaat)' },
                    { time: '09:00 AST', activity: 'Ziarah Makam Syuhada Uhud & Jabal Uhud' },
                    { time: '11:00 AST', activity: 'Belanja Oleh-oleh di Pasar Kurma Madinah' },
                ]
            },
            {
                day: 4,
                title: 'Mengambil Miqat di Bir Ali & Menuju Kota Suci Makkah',
                location: 'Bir Ali - Makkah Al-Mukarramah',
                description: 'Mandi sunnah Ihram, mengenakan pakaian Ihram, dan berniat Umroh di Masjid Bir Ali. Melanjutkan perjalanan menuju Kota Makkah dengan Bus Full AC / Kereta Cepat Haramain.',
                rundowns: [
                    { time: '12:00 AST', activity: 'Persiapan Ihram & Check-out Hotel Madinah' },
                    { time: '14:00 AST', activity: 'Ambil Miqat & Sholat Sunnah Ihram di Masjid Bir Ali' },
                    { time: '20:00 AST', activity: 'Tiba di Makkah, Check-in Hotel, & Pelaksanaan Tawaf, Sai, Tahallul (Umroh Pertama)' },
                ]
            },
            {
                day: 5,
                title: 'Memperbanyak Ibadah di Masjidil Haram',
                location: 'Makkah Al-Mukarramah',
                description: 'Hari istirahat dan memperbanyak thawaf sunnah, tilawah Al-Quran, serta dzikir di depan Ka\'bah Baitullah.',
                rundowns: [
                    { time: 'Sepanjang Hari', activity: 'Sholat 5 Waktu di Masjidil Haram (Pahala 100.000x Lipat)' },
                ]
            },
            {
                day: 6,
                title: 'Ziarah Kota Makkah (Jabal Tsur, Padang Arafah, Muzdalifah, Mina, & Ji\'ranah)',
                location: 'Makkah Al-Mukarramah',
                description: 'Napak tilas rute haji: Padang Arafah (Jabal Rahmah), Muzdalifah, Mina (Jamarat), Jabal Tsur, dan mengambil Miqat Ji\'ranah bagi yang ingin Umroh ke-2.',
                rundowns: [
                    { time: '07:00 AST', activity: 'Ziarah Arafah, Jabal Rahmah, Muzdalifah, & Mina' },
                    { time: '10:30 AST', activity: 'Ambil Miqat di Ji\'ranah (Bagi yang Umroh Sunnah ke-2)' },
                    { time: '14:00 AST', activity: 'Pelaksanaan Umroh ke-2 di Masjidil Haram' },
                ]
            },
            {
                day: 7,
                title: 'Ibadah Mandiri & City Tour Belanja Oleh-Oleh',
                location: 'Makkah Al-Mukarramah',
                description: 'Memperbanyak ibadah di Masjidil Haram dan kesempatan membeli kurma, sajadah, parfum, serta cinderamata khas Arab Saudi.',
                rundowns: [
                    { time: '08:00 AST', activity: 'Waktu Luang Ibadah & Belanja di Sekitar Haram' },
                ]
            },
            {
                day: 8,
                title: 'Thawaf Wada\' (Perpisahan) & Menuju Bandara Jeddah',
                location: 'Makkah - Jeddah International Airport',
                description: 'Pelaksanaan Thawaf Wada\' perpisahan dengan Ka\'bah Baitullah, check-out hotel Makkah, dan perjalanan menuju Bandara Jeddah.',
                rundowns: [
                    { time: '09:00 AST', activity: 'Thawaf Wada\' Bersama Muthawwif di Masjidil Haram' },
                    { time: '12:00 AST', activity: 'Check-out Hotel Makkah & Menuju Kota Jeddah' },
                    { time: '16:00 AST', activity: 'City Tour Jeddah (Laut Merah & Masjid Terapung)' },
                    { time: '20:00 AST', activity: 'Tiba di Bandara Jeddah, Check-in, & Pengambilan Air Zamzam' },
                ]
            },
            {
                day: 9,
                title: 'Tiba Kembali di Tanah Air (Indonesia)',
                location: 'Bandara Internasional Indonesia',
                description: 'Alhamdulillah rombongan jamaah mendarat dengan selamat. Penyerahan bagasi, air zamzam 5 liter, dan penutupan program umroh maqbul.',
                rundowns: [
                    { time: '14:00 WIB', activity: 'Pesawat Mendarat di Indonesia & Pengambilan Bagasi' },
                    { time: '15:30 WIB', activity: 'Penyerahan Air Zamzam 5L & Doa Bersama Penutupan' },
                ]
            },
        ];

    // Default Facilities
    const defaultFacilities = {
        includes: [
            'Tiket Pesawat PP Internasional Kelas Ekonomi',
            'Visa Umroh & Asuransi Perjalanan Resmi',
            `Hotel Makkah ${jamaah?.paket?.hotel_makkah || 'Bintang 5'} (Termasuk Makan 3x Sehari Fullboard)`,
            `Hotel Madinah ${jamaah?.paket?.hotel_madinah || 'Bintang 5'} (Termasuk Makan 3x Sehari Fullboard)`,
            'Transportasi Bus Pariwisata Eksekutif Full AC selama di Arab Saudi',
            'Bimbingan Manasik Teori & Praktik',
            'Muthawwif & Tour Leader Berpengalaman dan Bersertifikat',
            'Ziarah Kota Suci Makkah & Madinah',
            'Air Zamzam 5 Liter (Sesuai Regulasi Maskapai)',
            'Handling Bandara Keberangkatan & Kepulangan',
        ],
        excludes: [
            'Pembuatan / Perpanjangan Paspor',
            'Vaksinasi Meningitis / Buku Kuning',
            'Biaya Kelebihan Bagasi Pesawat (Overweight)',
            'Keperluan Pribadi (Laundry, Room Service, Telepon)',
        ],
    };

    return (
        <div
            className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary selection:text-primary-foreground font-sans antialiased"
            style={themeStyles}
        >
            <Head title={`Cek Status Pendaftaran & Pembayaran — ${travelName}`} />

            {/* Top Announcement Bar */}
            <div className="bg-primary text-primary-foreground text-[10px] sm:text-xs py-2 px-4 text-center font-medium flex flex-wrap items-center justify-center gap-1 sm:gap-2">
                <Sparkles className="w-3.5 h-3.5 text-primary-foreground animate-pulse hidden sm:block" />
                <span>Portal Resmi Pelayanan &amp; Transparansi Pembayaran Jamaah</span>
                <span className="hidden sm:inline"> | PPIU Berizin Resmi Kemenag RI</span>
            </div>

            {/* Navbar */}
            <nav className="sticky top-0 z-40 bg-card/80 backdrop-blur-md border-b border-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16 sm:h-20">
                        {/* Brand Logo & Name */}
                        <Link href={route('home')} className="flex items-center gap-3">
                            {tenant?.logo ? (
                                <img src={tenant.logo} alt={travelName} className="h-9 sm:h-10 w-auto rounded-xl shadow-xs" />
                            ) : (
                                <div className="p-2 rounded-xl bg-primary text-primary-foreground">
                                    <ApplicationLogo className="w-5 h-5 fill-current" />
                                </div>
                            )}
                            <div className="flex flex-col">
                                <span className="font-black text-base sm:text-lg tracking-tight text-foreground">{travelName}</span>
                                <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">Cek Pendaftaran Online</span>
                            </div>
                        </Link>

                        {/* Right Action Buttons */}
                        <div className="flex items-center gap-2.5 sm:gap-3">
                            <a
                                href={csWaUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border border-border bg-card hover:bg-muted transition text-foreground"
                            >
                                <MessageCircle className="w-4 h-4 text-emerald-500" />
                                <span>Bantuan CS</span>
                            </a>

                            <Link href={route('home')}>
                                <Button variant="outline" className="rounded-xl text-xs font-bold px-3.5 py-2 border-border gap-1.5">
                                    <ArrowLeft className="w-3.5 h-3.5" />
                                    <span>Halaman Utama</span>
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Search Section */}
            <section className="relative overflow-hidden pt-8 pb-12 sm:pt-12 sm:pb-16 bg-gradient-to-b from-primary/10 via-background to-background border-b border-border/40">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
                    <Badge className="w-fit mx-auto bg-primary/15 text-primary border-primary/30 font-bold text-[11px] sm:text-xs px-3.5 py-1.5 rounded-full shadow-xs">
                        Layanan Mandiri Tanpa Password
                    </Badge>

                    <h1 className="text-2xl sm:text-4xl font-black text-foreground tracking-tight">
                        Cek Status &amp; Progres Pembayaran
                    </h1>

                    <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
                        Lacak posisi dokumen pendaftaran, rincian jadwal rundown hari-ke-hari, status perlengkapan, serta kuitansi resmi Anda secara transparan dan <i>real-time</i>.
                    </p>

                    {/* Search Form Card */}
                    <div className="pt-3 max-w-2xl mx-auto">
                        <form
                            onSubmit={(e) => handleSearch(e)}
                            className="p-2 sm:p-2.5 rounded-2xl sm:rounded-3xl bg-card border border-border shadow-lg flex flex-col sm:flex-row items-center gap-2"
                        >
                            <div className="relative flex-1 w-full">
                                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="No. WhatsApp / No. Invoice / Kode Reg..."
                                    value={searchCode}
                                    onChange={(e) => setSearchCode(e.target.value)}
                                    className="w-full pl-10 pr-3 py-2.5 sm:py-3 text-xs sm:text-sm bg-transparent border-0 focus:outline-none focus:ring-0 text-foreground font-mono placeholder:font-sans placeholder:text-muted-foreground"
                                />
                            </div>
                            <div className="relative w-full sm:w-48 border-t sm:border-t-0 sm:border-l border-border/80 pl-0 sm:pl-2 pt-2 sm:pt-0">
                                <Lock className="w-3.5 h-3.5 absolute left-3.5 sm:left-5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                <input
                                    type="password"
                                    inputMode="numeric"
                                    maxLength={4}
                                    placeholder="4 Digit NIK KTP"
                                    value={searchPin}
                                    onChange={(e) => setSearchPin(e.target.value.replace(/[^0-9]/g, ''))}
                                    className="w-full pl-9 sm:pl-10 pr-3 py-2.5 sm:py-3 text-xs sm:text-sm bg-transparent border-0 focus:outline-none focus:ring-0 text-foreground font-mono placeholder:font-sans placeholder:text-muted-foreground tracking-wider"
                                />
                            </div>
                            <Button
                                type="submit"
                                className="w-full sm:w-auto rounded-xl sm:rounded-2xl px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-bold bg-primary text-primary-foreground shadow-xs shrink-0 cursor-pointer"
                            >
                                Cari Data
                            </Button>
                        </form>
                        <p className="text-[11px] text-muted-foreground mt-2 flex items-center justify-center gap-1.5">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                            <span>Akses aman: masukkan nomor HP/kode registrasi &amp; 4 digit terakhir NIK KTP Anda.</span>
                        </p>
                    </div>
                </div>
            </section>

            {/* Main Content Area */}
            <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
                {/* Flash Success Notification */}
                {flash?.success && (
                    <div className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
                        <div className="flex items-center gap-3">
                            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                            <p className="text-xs sm:text-sm font-semibold text-foreground">{flash.success}</p>
                        </div>
                        <a
                            href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Assalamu'alaikum CS ${travelName}, saya ${jamaah?.nama_lengkap || ''} (${jamaah?.kode_pendaftaran || ''}) telah mengunggah bukti pembayaran cicilan di web. Mohon dibantu verifikasi.`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="shrink-0"
                        >
                            <Button size="sm" className="w-full sm:w-auto rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 shadow-xs">
                                <MessageCircle className="w-3.5 h-3.5" />
                                <span>Konfirmasi Cepat ke CS WA</span>
                            </Button>
                        </a>
                    </div>
                )}

                {/* State 1: Initial Empty Prompt */}
                {!searchPerformed && (
                    <div className="text-center py-12 px-4 rounded-3xl border border-dashed border-border bg-card/50 max-w-2xl mx-auto space-y-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
                            <Receipt className="w-6 h-6" />
                        </div>
                        <h3 className="text-base sm:text-lg font-bold text-foreground">Masukkan Identitas &amp; 4 Digit NIK KTP</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
                            Silakan masukkan nomor WhatsApp / kode registrasi, serta 4 digit terakhir NIK KTP sebagai PIN verifikasi privasi.
                        </p>
                    </div>
                )}

                {/* State 2: 2-Factor PIN Verification Required */}
                {searchPerformed && (requirePin || invalidPin) && (
                    <div className="rounded-3xl border border-amber-500/30 bg-amber-500/5 dark:bg-amber-950/20 p-6 sm:p-8 text-center max-w-xl mx-auto space-y-5 animate-in fade-in slide-in-from-top-3">
                        <div className="w-14 h-14 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto shadow-xs">
                            <Lock className="w-7 h-7" />
                        </div>
                        <div className="space-y-2">
                            <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 text-xs font-bold px-3 py-1">
                                Verifikasi Keamanan 2-Faktor
                            </Badge>
                            <h3 className="text-lg sm:text-xl font-black text-foreground">
                                Konfirmasi 4 Digit Terakhir {candidateHint?.pin_label || 'NIK KTP'}
                            </h3>
                            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                                Data pendaftaran ditemukan untuk kode <strong className="text-foreground font-mono">{candidateHint?.kode || searchCode}</strong>.
                                Demi menjaga privasi data &amp; riwayat pembayaran, masukkan <strong>4 digit terakhir {candidateHint?.pin_label || 'NIK KTP'}</strong> Anda:
                            </p>
                            {candidateHint?.masked_identifier && (
                                <p className="font-mono text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-500/10 py-1.5 px-3 rounded-lg w-fit mx-auto">
                                    {candidateHint.masked_identifier}
                                </p>
                            )}
                        </div>

                        {invalidPin && (
                            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold">
                                PIN 4-digit {candidateHint?.pin_label || 'NIK KTP'} tidak cocok. Silakan periksa kembali 4 angka terakhir Anda.
                            </div>
                        )}

                        <form
                            onSubmit={(e) => handleSearch(e, inlinePin)}
                            className="flex flex-col sm:flex-row items-center justify-center gap-2 max-w-sm mx-auto"
                        >
                            <div className="relative w-full">
                                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                <input
                                    type="password"
                                    inputMode="numeric"
                                    maxLength={4}
                                    placeholder="4 Digit NIK (contoh: 0005)"
                                    value={inlinePin}
                                    onChange={(e) => setInlinePin(e.target.value.replace(/[^0-9]/g, ''))}
                                    className="w-full pl-10 pr-4 py-2.5 text-center text-base tracking-widest font-mono font-bold bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary text-foreground"
                                    autoFocus
                                    required
                                />
                            </div>
                            <Button
                                type="submit"
                                disabled={inlinePin.length < 4}
                                className="w-full sm:w-auto rounded-xl px-6 py-2.5 text-xs font-bold bg-primary text-primary-foreground shadow-xs shrink-0 cursor-pointer"
                            >
                                Buka Data
                            </Button>
                        </form>
                    </div>
                )}

                {/* State 3: Not Found */}
                {searchPerformed && notFound && (
                    <div className="rounded-3xl border border-rose-500/20 bg-rose-500/5 p-8 text-center max-w-2xl mx-auto space-y-4">
                        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
                            <AlertCircle className="w-6 h-6" />
                        </div>
                        <h3 className="text-base sm:text-lg font-bold text-foreground">Data Pendaftaran Tidak Ditemukan</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
                            Tidak ditemukan riwayat pendaftaran untuk &ldquo;<strong className="text-foreground">{searchCode || query}</strong>&rdquo;. Pastikan nomor WhatsApp atau kode registrasi yang Anda masukkan sudah sesuai.
                        </p>
                        <a href={csWaUrl} target="_blank" rel="noopener noreferrer" className="inline-block pt-2">
                            <Button size="sm" variant="outline" className="rounded-xl text-xs font-bold gap-1.5 border-border">
                                <MessageCircle className="w-3.5 h-3.5 text-emerald-500" />
                                <span>Hubungi CS Bantuan</span>
                            </Button>
                        </a>
                    </div>
                )}

                {/* State 3: Jamaah Found */}
                {jamaah && (
                    <div className="space-y-6">
                        {/* 1. Main Boarding Pass & Status Summary Card */}
                        <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-border/80">
                                <div className="space-y-2.5">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="font-mono text-xs font-bold px-3 py-1 rounded-xl bg-muted border border-border text-foreground">
                                            {jamaah.kode_pendaftaran}
                                        </span>
                                        <Badge className={`text-xs font-bold px-3 py-1 rounded-xl ${
                                            jamaah.financial_summary.is_lunas
                                                ? 'bg-emerald-600 text-white'
                                                : jamaah.financial_summary.total_terbayar > 0
                                                ? 'bg-primary text-primary-foreground'
                                                : 'bg-amber-600 text-white'
                                        }`}>
                                            {jamaah.financial_summary.status_label}
                                        </Badge>
                                    </div>
                                    <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                                        {jamaah.nama_lengkap}
                                    </h2>
                                    <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-muted-foreground">
                                        <span>No. WhatsApp: <strong className="text-foreground font-mono">{jamaah.no_hp}</strong></span>
                                        <span>•</span>
                                        <span>Status Tahapan: <strong className="text-primary font-bold">{jamaah.stage.name}</strong></span>
                                        {jamaah.tanggal_keberangkatan && (
                                            <>
                                                <span>•</span>
                                                <span>Jadwal Terbang: <strong className="text-foreground">{new Date(jamaah.tanggal_keberangkatan).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</strong></span>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Action / WhatsApp Agent & CS */}
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
                                    {jamaah.agen?.phone && (
                                        <a
                                            href={`https://wa.me/${jamaah.agen.phone.replace(/[^0-9]/g, '').replace(/^0/, '62')}?text=${encodeURIComponent(`Assalamu'alaikum ${jamaah.agen.name}, saya ${jamaah.nama_lengkap} (${jamaah.kode_pendaftaran}) ingin menanyakan progres pendaftaran umroh saya.`)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <Button variant="outline" className="w-full sm:w-auto rounded-xl text-xs font-bold border-border gap-2">
                                                <UserCheck className="w-3.5 h-3.5 text-primary" />
                                                <span>Agen: {jamaah.agen.name}</span>
                                            </Button>
                                        </a>
                                    )}
                                    <a href={csWaUrl} target="_blank" rel="noopener noreferrer">
                                        <Button className="w-full sm:w-auto rounded-xl text-xs font-bold bg-primary text-primary-foreground shadow-xs gap-2">
                                            <MessageCircle className="w-3.5 h-3.5" />
                                            <span>Konfirmasi CS Travel</span>
                                        </Button>
                                    </a>
                                </div>
                            </div>

                            {/* Financial Progress Section */}
                            <div className="space-y-4 pt-2">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div>
                                        <h3 className="font-bold text-base sm:text-lg text-foreground">Progres Pelunasan Paket</h3>
                                        <p className="text-xs text-muted-foreground">Transparansi pencatatan dana tabungan &amp; angsuran yang telah diverifikasi.</p>
                                    </div>
                                    <div className="flex items-center gap-3 self-start sm:self-center">
                                        <div className="text-right">
                                            <span className="text-2xl sm:text-3xl font-black text-primary font-mono leading-none">
                                                {jamaah.financial_summary.persentase_lunas}%
                                            </span>
                                            <span className="text-xs text-muted-foreground ml-1">Terbayar</span>
                                        </div>

                                        {!jamaah.financial_summary.is_lunas && (
                                            <Button
                                                onClick={() => setIsPaymentModalOpen(true)}
                                                className="rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs gap-1.5 cursor-pointer"
                                            >
                                                <CreditCard className="w-3.5 h-3.5" />
                                                <span>Setor Cicilan / Pelunasan</span>
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="w-full bg-muted rounded-full h-3 sm:h-4 overflow-hidden p-0.5 border border-border">
                                    <div
                                        className={`h-full rounded-full transition-all duration-700 ${
                                            jamaah.financial_summary.is_lunas
                                                ? 'bg-emerald-500'
                                                : 'bg-primary'
                                        }`}
                                        style={{ width: `${jamaah.financial_summary.persentase_lunas}%` }}
                                    />
                                </div>

                                {/* 3 Metric Stats Tiles */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
                                    <div className="p-4 rounded-2xl bg-card border border-border space-y-1 shadow-2xs">
                                        <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Total Biaya Paket</div>
                                        <div className="text-lg sm:text-xl font-black text-foreground font-mono">
                                            Rp {jamaah.financial_summary.total_biaya.toLocaleString('id-ID')}
                                        </div>
                                        <div className="text-[11px] text-muted-foreground truncate">{jamaah.paket?.nama_paket || 'Paket Reguler'}</div>
                                    </div>

                                    <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-1 shadow-2xs">
                                        <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Total Terverifikasi</div>
                                        <div className="text-lg sm:text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                                            Rp {jamaah.financial_summary.total_terbayar.toLocaleString('id-ID')}
                                        </div>
                                        <div className="text-[11px] text-emerald-600/80">Kuitansi resmi diterbitkan</div>
                                    </div>

                                    <div className={`p-4 rounded-2xl border space-y-1 shadow-2xs ${
                                        jamaah.financial_summary.is_lunas
                                            ? 'bg-primary/10 border-primary/20'
                                            : 'bg-amber-500/10 border-amber-500/20'
                                    }`}>
                                        <div className={`text-[11px] font-bold uppercase tracking-wider ${
                                            jamaah.financial_summary.is_lunas ? 'text-primary' : 'text-amber-700 dark:text-amber-400'
                                        }`}>
                                            {jamaah.financial_summary.is_lunas ? 'Status Pelunasan' : 'Sisa Pelunasan'}
                                        </div>
                                        <div className={`text-lg sm:text-xl font-black font-mono ${
                                            jamaah.financial_summary.is_lunas ? 'text-primary' : 'text-amber-600 dark:text-amber-400'
                                        }`}>
                                            {jamaah.financial_summary.is_lunas ? 'Lunas 100%' : `Rp ${jamaah.financial_summary.sisa_tagihan.toLocaleString('id-ID')}`}
                                        </div>
                                        <div className="text-[11px] text-muted-foreground">
                                            {jamaah.financial_summary.is_lunas ? 'Alhamdulillah siap berangkat' : 'Dapat diangsur bertahap'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 2. Package & Hotel Accommodation Specs */}
                        {jamaah.paket && (
                            <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-primary font-bold text-sm sm:text-base">
                                        <Plane className="w-4 h-4 text-primary" />
                                        <span>Rincian Paket &amp; Akomodasi Perjalanan</span>
                                    </div>
                                    {jamaah.paket.brosur_url && (
                                        <a href={jamaah.paket.brosur_url} target="_blank" rel="noopener noreferrer">
                                            <Button size="sm" variant="outline" className="rounded-xl text-xs font-bold gap-1.5 border-border">
                                                <Download className="w-3.5 h-3.5 text-primary" />
                                                <span>Download Brosur</span>
                                            </Button>
                                        </a>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                    <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/60">
                                        <div className="text-[11px] text-muted-foreground">Nama Program:</div>
                                        <div className="text-xs sm:text-sm font-bold text-foreground mt-0.5">{jamaah.paket.nama_paket}</div>
                                    </div>
                                    <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/60">
                                        <div className="text-[11px] text-muted-foreground">Durasi &amp; Maskapai:</div>
                                        <div className="text-xs sm:text-sm font-bold text-foreground mt-0.5">
                                            {jamaah.paket.durasi_hari || 9} Hari • {jamaah.paket.maskapai || 'Saudia Airlines'}
                                        </div>
                                    </div>
                                    <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/60">
                                        <div className="text-[11px] text-muted-foreground">Hotel Makkah:</div>
                                        <div className="text-xs sm:text-sm font-bold text-foreground mt-0.5 flex items-center gap-1">
                                            Bintang {jamaah.paket.bintang_makkah || 5} • {jamaah.paket.hotel_makkah || 'Setaraf'}
                                        </div>
                                    </div>
                                    <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/60">
                                        <div className="text-[11px] text-muted-foreground">Hotel Madinah:</div>
                                        <div className="text-xs sm:text-sm font-bold text-foreground mt-0.5 flex items-center gap-1">
                                            Bintang {jamaah.paket.bintang_madinah || 5} • {jamaah.paket.hotel_madinah || 'Setaraf'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 3. INTERACTIVE SECTION: Rundown Itinerary, Fasilitas & Status Perlengkapan */}
                        <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                            {/* Segment Navigation Tabs */}
                            <div className="flex items-center justify-between border-b border-border pb-4 gap-2 flex-wrap">
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setActiveDetailTab('itinerary')}
                                        className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 ${
                                            activeDetailTab === 'itinerary'
                                                ? 'bg-primary text-primary-foreground shadow-xs'
                                                : 'bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground'
                                        }`}
                                    >
                                        <Compass className="w-4 h-4" />
                                        <span>Rundown Itinerary Harian</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setActiveDetailTab('fasilitas')}
                                        className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 ${
                                            activeDetailTab === 'fasilitas'
                                                ? 'bg-primary text-primary-foreground shadow-xs'
                                                : 'bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground'
                                        }`}
                                    >
                                        <CheckSquare className="w-4 h-4" />
                                        <span>Fasilitas Termasuk</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setActiveDetailTab('perlengkapan')}
                                        className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 ${
                                            activeDetailTab === 'perlengkapan'
                                                ? 'bg-primary text-primary-foreground shadow-xs'
                                                : 'bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground'
                                        }`}
                                    >
                                        <Luggage className="w-4 h-4" />
                                        <span>Status Perlengkapan</span>
                                    </button>
                                </div>

                                <span className="text-[11px] text-muted-foreground font-semibold">
                                    {activeDetailTab === 'itinerary' && `${itineraryList.length} Hari Jadwal Perjalanan`}
                                    {activeDetailTab === 'fasilitas' && 'Fasilitas Eksklusif & All-in'}
                                    {activeDetailTab === 'perlengkapan' && 'Logistik & Koper Jamaah'}
                                </span>
                            </div>

                            {/* TAB 1: ITINERARY RUNDOWN HARIAN */}
                            {activeDetailTab === 'itinerary' && (
                                <div className="space-y-4 animate-in fade-in duration-200">
                                    <div className="space-y-3">
                                        {itineraryList.map((dayItem) => (
                                            <div
                                                key={dayItem.day}
                                                className="p-4 sm:p-5 rounded-2xl border border-border/70 bg-muted/15 hover:border-primary/40 transition-colors space-y-3"
                                            >
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                                    <div className="flex items-center gap-2.5">
                                                        <span className="px-3 py-1 rounded-xl text-xs font-black bg-primary/15 text-primary border border-primary/20 shrink-0">
                                                            HARI {dayItem.day}
                                                        </span>
                                                        <h4 className="font-bold text-sm sm:text-base text-foreground">
                                                            {dayItem.title}
                                                        </h4>
                                                    </div>
                                                    {dayItem.location && (
                                                        <span className="text-xs text-muted-foreground flex items-center gap-1.5 self-start sm:self-center font-medium bg-background px-2.5 py-1 rounded-lg border border-border">
                                                            <MapPin className="w-3.5 h-3.5 text-rose-500" />
                                                            {dayItem.location}
                                                        </span>
                                                    )}
                                                </div>

                                                {dayItem.description && (
                                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                                        {dayItem.description}
                                                    </p>
                                                )}

                                                {/* Daily Rundown Schedule List */}
                                                {dayItem.rundowns && dayItem.rundowns.length > 0 && (
                                                    <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 border-t border-border/40">
                                                        {dayItem.rundowns.map((r, idx) => (
                                                            <div key={idx} className="flex items-start gap-2 p-2 rounded-xl bg-background/60 border border-border/50 text-xs">
                                                                <Clock className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                                                                <div className="space-y-0.5">
                                                                    <span className="font-mono font-bold text-primary block text-[11px]">{r.time}</span>
                                                                    <span className="text-foreground font-medium block">{r.activity}</span>
                                                                    {r.notes && <span className="text-[10px] text-muted-foreground block">{r.notes}</span>}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* TAB 2: FASILITAS TERMASUK & EXCLUDE */}
                            {activeDetailTab === 'fasilitas' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-200">
                                    {/* Included */}
                                    <div className="p-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 space-y-3">
                                        <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-sm">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                            <span>Fasilitas Termasuk (Include)</span>
                                        </div>
                                        <ul className="space-y-2 text-xs text-foreground">
                                            {defaultFacilities.includes.map((inc, i) => (
                                                <li key={i} className="flex items-start gap-2">
                                                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                                                    <span>{inc}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Excluded */}
                                    <div className="p-5 rounded-2xl border border-border bg-muted/20 space-y-3">
                                        <div className="flex items-center gap-2 text-muted-foreground font-bold text-sm">
                                            <XCircle className="w-4 h-4 text-muted-foreground" />
                                            <span>Tidak Termasuk (Exclude)</span>
                                        </div>
                                        <ul className="space-y-2 text-xs text-muted-foreground">
                                            {defaultFacilities.excludes.map((exc, i) => (
                                                <li key={i} className="flex items-start gap-2">
                                                    <span className="text-muted-foreground shrink-0">•</span>
                                                    <span>{exc}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            )}

                            {/* TAB 3: STATUS PERLENGKAPAN & LOGISTIK */}
                            {activeDetailTab === 'perlengkapan' && (
                                <div className="space-y-4 animate-in fade-in duration-200">
                                    {/* Expedition / Delivery Status if shipped */}
                                    {(jamaah.status_logistik || jamaah.no_resi_logistik) && (
                                        <div className="p-4 rounded-2xl border border-primary/20 bg-primary/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 font-bold text-primary">
                                                    <Truck className="w-4 h-4" />
                                                    <span>Pengiriman Paket Perlengkapan:</span>
                                                </div>
                                                <div className="text-muted-foreground">
                                                    Kurir / Ekspedisi: <strong className="text-foreground">{jamaah.ekspedisi_logistik || 'JNE / J&T Cargo'}</strong> • No. Resi: <strong className="font-mono text-foreground">{jamaah.no_resi_logistik || 'Diproses'}</strong>
                                                </div>
                                            </div>
                                            <Badge className="bg-primary/20 text-primary border border-primary/30 font-bold self-start sm:self-center">
                                                {jamaah.status_logistik || 'Dalam Pengiriman'}
                                            </Badge>
                                        </div>
                                    )}

                                    {/* Items List */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {[
                                            { name: 'Koper Fiber 24" Eksklusif', status: 'Diterima', icon: Luggage },
                                            { name: 'Kain Ihram / Mukena Bordir', status: 'Diterima', icon: CheckSquare },
                                            { name: 'Batik Seragam Resmi Travel', status: 'Diterima', icon: Layers },
                                            { name: 'Tas Selempang / Paspor', status: 'Diterima', icon: Luggage },
                                            { name: 'Buku Doa & Panduan Manasik', status: 'Diterima', icon: FileText },
                                            { name: 'Bantal Leher & ID Card Jamaah', status: 'Siap Ambil', icon: PackageCheck },
                                        ].map((item, idx) => (
                                            <div key={idx} className="p-3.5 rounded-2xl border border-border bg-card flex items-center justify-between gap-2 shadow-2xs">
                                                <div className="flex items-center gap-2.5 min-w-0">
                                                    <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0">
                                                        <item.icon className="w-4 h-4" />
                                                    </div>
                                                    <span className="text-xs font-bold text-foreground truncate">{item.name}</span>
                                                </div>
                                                <Badge className="text-[10px] font-bold bg-emerald-600/15 text-emerald-700 dark:text-emerald-300 border-emerald-600/20 shrink-0">
                                                    {item.status}
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 4. Payment Transactions List & Official Receipts */}
                        <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                            <div className="flex items-center justify-between border-b border-border/80 pb-4">
                                <div>
                                    <h3 className="font-bold text-base sm:text-lg text-foreground">Riwayat Kwitansi &amp; Pembayaran</h3>
                                    <p className="text-xs text-muted-foreground">Daftar transaksi setoran DP dan cicilan pelunasan.</p>
                                </div>
                                <span className="text-xs font-bold px-3 py-1 rounded-xl bg-muted text-muted-foreground">
                                    {jamaah.pembayaran_list.length} Transaksi
                                </span>
                            </div>

                            {jamaah.pembayaran_list.length === 0 ? (
                                <div className="text-center py-10 px-4 rounded-2xl border border-dashed border-border bg-muted/20 text-xs text-muted-foreground">
                                    Belum ada transaksi pembayaran yang tercatat. Silakan lakukan pembayaran uang muka (DP) atau cicilan ke rekening resmi travel.
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {jamaah.pembayaran_list.map((item) => {
                                        const statusLower = (item.status_verifikasi || '').toLowerCase();
                                        const isVerified = statusLower === 'verified' || statusLower === 'diverifikasi';
                                        const isPending = statusLower === 'pending' || statusLower === 'menunggu';

                                        return (
                                            <div
                                                key={item.id}
                                                className="p-4 sm:p-5 rounded-2xl border border-border bg-card hover:border-primary/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs"
                                            >
                                                <div className="space-y-1.5">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <span className="font-mono text-xs font-bold text-foreground">{item.nomor_invoice}</span>
                                                        <Badge className={`text-[10px] font-bold ${
                                                            isVerified
                                                                ? 'bg-emerald-600 text-white'
                                                                : isPending
                                                                ? 'bg-amber-600 text-white'
                                                                : 'bg-rose-600 text-white'
                                                        }`}>
                                                            {isVerified ? 'TERVERIFIKASI' : isPending ? 'MENUNGGU VERIFIKASI' : 'DITOLAK'}
                                                        </Badge>
                                                        {item.tipe_pembayaran && (
                                                            <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-muted text-foreground border border-border/60 uppercase">
                                                                {item.tipe_pembayaran}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        Tanggal: {item.created_at ? new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) + ' WIB' : '-'}
                                                        {item.metode_pembayaran && ` • Transfer (${item.metode_pembayaran})`}
                                                        {item.bank_tujuan && ` • ${item.bank_tujuan.nama_bank}`}
                                                    </div>
                                                    {item.keterangan && (
                                                        <div className="text-[11px] text-muted-foreground italic">
                                                            Catatan: &ldquo;{item.keterangan}&rdquo;
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                                                    <div className="text-right">
                                                        <div className="text-[10px] text-muted-foreground uppercase font-bold">Nominal Setor</div>
                                                        <div className="text-base sm:text-lg font-black text-primary font-mono">
                                                            Rp {(item.jumlah_bayar || item.nominal || 0).toLocaleString('id-ID')}
                                                        </div>
                                                    </div>

                                                    <Link href={route('public.verify-invoice', item.nomor_invoice)}>
                                                        <Button size="sm" variant="outline" className="rounded-xl text-xs font-bold border-border gap-1.5 cursor-pointer">
                                                            <QrCode className="w-3.5 h-3.5 text-primary" />
                                                            <span>Kwitansi Resmi</span>
                                                            <ExternalLink className="w-3 h-3 text-muted-foreground" />
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>

            {/* Modal Setor Cicilan / Pelunasan Mandiri */}
            {jamaah && (
                <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
                    <DialogContent 
                        style={themeStyles}
                        className="sm:max-w-2xl max-h-[90vh] overflow-y-auto p-6 rounded-3xl bg-card text-foreground border-border shadow-2xl font-sans"
                    >
                        <DialogHeader className="text-left space-y-1.5 pb-2 border-b border-border">
                            <DialogTitle className="text-lg sm:text-xl font-black text-foreground flex items-center gap-2">
                                <CreditCard className="w-5 h-5 text-emerald-500" />
                                Setor Cicilan / Pelunasan Mandiri
                            </DialogTitle>
                            <DialogDescription className="text-xs text-muted-foreground">
                                Masukkan rincian setoran dan lampirkan bukti transfer resmi ke rekening travel.
                            </DialogDescription>
                        </DialogHeader>

                        {/* Security Warning Box */}
                        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 space-y-1">
                            <div className="font-bold flex items-center gap-1.5">
                                <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                                Jaminan Keamanan &amp; Rekening Resmi Travel:
                            </div>
                            <p className="text-[11px] leading-relaxed text-muted-foreground">
                                Pastikan transfer hanya ditujukan ke rekening resmi atas nama <strong>PT {travelName}</strong> di bawah ini. Jangan pernah mentransfer ke rekening pribadi staf/perorangan.
                            </p>
                        </div>

                        {/* Bank Accounts Grid with Copy Feature */}
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-foreground">Pilih Rekening Resmi Tujuan Transfer:</Label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                {bank_accounts.map((bank) => {
                                    const isSelected = selectedBankId === String(bank.id);
                                    const isCopied = copiedBankId === bank.id;

                                    return (
                                        <div
                                            key={bank.id}
                                            onClick={() => setSelectedBankId(String(bank.id))}
                                            className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative ${
                                                isSelected
                                                    ? 'border-primary bg-primary/5 shadow-xs ring-1 ring-primary'
                                                    : 'border-border bg-muted/20 hover:border-border/80'
                                            }`}
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="space-y-0.5 min-w-0">
                                                    <span className="text-[11px] font-bold text-primary block uppercase truncate">
                                                        {bank.nama_bank}
                                                    </span>
                                                    <span className="font-mono text-sm font-black text-foreground block tracking-tight">
                                                        {bank.nomor_rekening}
                                                    </span>
                                                    <span className="text-[10px] text-muted-foreground block truncate">
                                                        a.n {bank.atas_nama}
                                                    </span>
                                                </div>

                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleCopyRekening(bank);
                                                    }}
                                                    className="h-7 px-2 text-[10px] font-bold rounded-lg shrink-0 gap-1 border border-border"
                                                >
                                                    {isCopied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                                                    <span>{isCopied ? 'Tersalin' : 'Salin'}</span>
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <form onSubmit={handleSubmitPayment} className="space-y-4 pt-2">
                            {/* Quick Nominal Pills */}
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between flex-wrap gap-1">
                                    <Label className="text-xs font-bold text-foreground">Nominal Setor (Rp) *</Label>
                                    <div className="text-[11px] text-right">
                                        <span className="text-muted-foreground">Sisa Tagihan: </span>
                                        {Number(nominal) > 0 ? (
                                            <>
                                                <span className="line-through text-muted-foreground mr-1">
                                                    Rp {jamaah.financial_summary.sisa_tagihan.toLocaleString('id-ID')}
                                                </span>
                                                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                                    → Rp {Math.max(0, jamaah.financial_summary.sisa_tagihan - (Number(nominal) || 0)).toLocaleString('id-ID')}
                                                    {Math.max(0, jamaah.financial_summary.sisa_tagihan - (Number(nominal) || 0)) === 0 && ' (Lunas)'}
                                                </span>
                                            </>
                                        ) : (
                                            <strong className="font-mono text-foreground">
                                                Rp {jamaah.financial_summary.sisa_tagihan.toLocaleString('id-ID')}
                                            </strong>
                                        )}
                                    </div>
                                </div>
                                <CurrencyInput
                                    id="tracking_nominal_setor"
                                    placeholder="Contoh: 5.000.000"
                                    value={nominal}
                                    onChange={(val) => setNominal(val)}
                                    className="font-mono text-sm h-11 bg-background w-full"
                                    required
                                />
                                {formErrors.nominal && (
                                    <p className="text-[11px] text-rose-500">{formErrors.nominal}</p>
                                )}

                                {/* Quick buttons */}
                                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                    {[2500000, 5000000, 10000000].map((amt) => (
                                        <button
                                            key={amt}
                                            type="button"
                                            onClick={() => setNominal(String(amt))}
                                            className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-muted hover:bg-muted/80 border border-border text-foreground transition"
                                        >
                                            +Rp {(amt / 1000000)} Jt
                                        </button>
                                    ))}
                                    {jamaah.financial_summary.sisa_tagihan > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setNominal(String(jamaah.financial_summary.sisa_tagihan));
                                                setTipePembayaran('Pelunasan');
                                            }}
                                            className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-primary/15 hover:bg-primary/25 border border-primary/30 text-primary transition ml-auto"
                                        >
                                            Lunasi Sisa Tagihan (Rp {jamaah.financial_summary.sisa_tagihan.toLocaleString('id-ID')})
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Tipe Pembayaran */}
                            <div className="space-y-1.5">
                                <Label className="text-xs font-bold text-foreground">Jenis Pembayaran *</Label>
                                <div className="grid grid-cols-2 gap-2">
                                    {['Cicilan', 'Pelunasan'].map((tipe) => (
                                        <button
                                            key={tipe}
                                            type="button"
                                            onClick={() => setTipePembayaran(tipe)}
                                            className={`py-2 px-3 rounded-xl text-xs font-bold border transition text-center ${
                                                tipePembayaran === tipe
                                                    ? 'bg-primary text-primary-foreground border-primary'
                                                    : 'bg-muted/30 border-border text-muted-foreground hover:text-foreground'
                                            }`}
                                        >
                                            {tipe === 'Cicilan' ? 'Cicilan / Angsuran' : 'Pelunasan Akhir'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Upload Bukti Transfer */}
                            <div className="space-y-1.5">
                                <Label className="text-xs font-bold text-foreground">Upload Foto Bukti Transfer / Slip *</Label>
                                <Input
                                    type="file"
                                    accept="image/jpeg,image/png,image/jpg,application/pdf"
                                    onChange={(e) => setBuktiTransfer(e.target.files?.[0] || null)}
                                    className="bg-background file:text-xs"
                                    required
                                />
                                <span className="text-[10px] text-muted-foreground block">
                                    Format didukung: JPG, PNG, atau PDF (Maks. 5 MB).
                                </span>
                                {formErrors.bukti_transfer && (
                                    <p className="text-[11px] text-rose-500">{formErrors.bukti_transfer}</p>
                                )}
                            </div>

                            {/* Catatan / Nama Pemilik Rekening Pengirim */}
                            <div className="space-y-1.5">
                                <Label className="text-xs font-bold text-foreground">Catatan / Atas Nama Pengirim (Opsional)</Label>
                                <Input
                                    type="text"
                                    placeholder="Contoh: Transfer dari Bank BRI a.n Bapak Sutrisno"
                                    value={keterangan}
                                    onChange={(e) => setKeterangan(e.target.value)}
                                    className="text-xs bg-background"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setIsPaymentModalOpen(false)}
                                    className="rounded-xl text-xs font-bold border-border"
                                >
                                    Batal
                                </Button>
                                <Button
                                    type="submit"
                                    size="sm"
                                    disabled={isSubmitting}
                                    className="rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white gap-2 shadow-xs cursor-pointer"
                                >
                                    {isSubmitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                                    <span>Kirim Bukti Pembayaran</span>
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            )}

            {/* Footer Matching Welcome.tsx */}
            <footer className="border-t border-border bg-card/60 backdrop-blur-md py-8 text-xs text-muted-foreground text-center">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
                    <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-foreground">
                        <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-500" /> PPIU Resmi Kemenag RI</span>
                        <span>•</span>
                        <span className="flex items-center gap-1.5"><Lock className="w-4 h-4 text-primary" /> Enkripsi SSL 256-bit</span>
                        <span>•</span>
                        <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Kepastian Jadwal &amp; Hotel</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                        &copy; {new Date().getFullYear()} <strong>{travelName}</strong>. Seluruh data transaksi dilindungi dan diverifikasi langsung oleh manajemen travel.
                    </p>
                </div>
            </footer>
        </div>
    );
}
