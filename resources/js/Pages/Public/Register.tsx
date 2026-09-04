import React, { useState } from 'react';
import themeData from '@/lib/theme-colors.json';
import ApplicationLogo from '@/Components/ApplicationLogo';

import { Head, Link, useForm } from '@inertiajs/react';
import { PageProps } from '@/Types';
import {
    Sparkles,
    User,
    Phone,
    Mail,
    CreditCard,
    CheckCircle2,
    ArrowLeft,
    Shield,
    Plane,
    Lock,
    Building2,
    Calendar,
    HelpCircle,
    BadgeCheck,
} from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Card } from '@/Components/ui/card';
import { Label } from '@/Components/ui/label';
import { Badge } from '@/Components/ui/badge';
import InputError from '@/Components/InputError';

interface PaketItem {
    id: number;
    nama_paket: string;
    harga: number;
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
    
}

interface ReferralAgent {
    id: number;
    name: string;
    email: string;
    jabatan: string;
}

interface Props extends PageProps {
    tenant?: TenantItem | null;
    packages: PaketItem[];
    banks: BankItem[];
    selectedPackageId?: number | null;
    referralAgent?: ReferralAgent | null;
}

export default function Register({
    tenant,
    packages = [],
    banks = [],
    selectedPackageId,
    referralAgent,
}: Props) {
    const travelName = tenant?.nama_travel || 'HajjFlow Umroh & Haji';

    const { data, setData, post, processing, errors } = useForm({
        nama_lengkap: '',
        no_hp: '',
        email: '',
        nik: '',
        nomor_paspor: '',
        paket_id: selectedPackageId ? selectedPackageId.toString() : (packages[0]?.id ? packages[0].id.toString() : ''),
        agen_id: referralAgent?.id ? referralAgent.id.toString() : '',
        rekening_tenant_id: banks[0]?.id ? banks[0].id.toString() : '',
        nominal_dp: '',
        catatan: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('public.register.submit'));
    };

    const inputClasses =
        'w-full rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground text-xs h-10 px-3.5 py-2 shadow-2xs focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20 transition-all font-medium';

    return (
        <div 
            className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground py-10 px-4 sm:px-6 lg:px-8 font-sans"
            style={(themeData.themes[(tenant?.theme_name as keyof typeof themeData.themes) || 'luxury']?.variables || themeData.themes['luxury'].variables) as React.CSSProperties}
        >
            <Head title={`Formulir Pendaftaran Calon Jamaah - ${travelName}`} />

            <div className="max-w-3xl mx-auto flex flex-col gap-8">
                {/* Back to Home & Logo Header */}
                <div className="flex items-center justify-between border-b border-border/70 pb-6">
                    <Link
                        href={route('home')}
                        className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Kembali ke Beranda</span>
                    </Link>

                    <div className="flex items-center gap-2.5">
                        <ApplicationLogo className="w-8 h-8 shrink-0" />
                        <span className="font-bold text-sm text-foreground">{travelName}</span>
                    </div>
                </div>

                {/* Agent Referral Card (If user visits via agent link ?ref=...) */}
                {referralAgent && (
                    <div className="p-4 sm:p-5 rounded-2xl bg-card/80 backdrop-blur-sm border border-border/90 shadow-xs flex flex-col sm:flex-row items-center sm:items-center gap-3.5 sm:gap-4 text-center sm:text-left animate-in fade-in">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black text-base shrink-0 mx-auto sm:mx-0">
                            {referralAgent.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="flex flex-col items-center sm:items-start">
                            <div className="flex items-center gap-1.5 justify-center sm:justify-start">
                                <BadgeCheck className="w-4 h-4 text-primary" />
                                <span className="text-[10px] sm:text-[11px] font-bold text-primary uppercase tracking-wider">
                                    Mitra Agen Resmi Pembimbing Anda
                                </span>
                            </div>
                            <span className="font-bold text-sm sm:text-base text-foreground mt-0.5">{referralAgent.name}</span>
                            <span className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">
                                {referralAgent.jabatan} &bull; Pendaftaran Anda akan dipandu langsung oleh beliau.
                            </span>
                        </div>
                    </div>
                )}

                {/* Form Header */}
                <div className="flex flex-col gap-2 text-left">
                    <Badge variant="secondary" className="w-fit bg-primary/10 text-primary border-primary/20 font-bold text-xs tracking-wide">
                        PENDAFTARAN ONLINE MANDIRI
                    </Badge>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                        Formulir Registrasi Calon Jamaah
                    </h1>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                        Isi data diri Anda di bawah ini dengan benar sesuai KTP/Paspor untuk mengamankan kuota seat keberangkatan.
                    </p>
                </div>

                {/* Registration Form Card */}
                <Card className="rounded-3xl border border-border bg-card shadow-xl shadow-black/5 dark:shadow-black/20 overflow-hidden">
                    <form onSubmit={handleSubmit} className="p-6 sm:p-8 flex flex-col gap-8">
                        {/* 1. Package Selection */}
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-2 border-b border-border/70 pb-3">
                                <Plane className="w-4 h-4 text-primary" />
                                <h3 className="font-bold text-sm text-foreground">1. Pilih Program Paket Umroh</h3>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {packages.map((pkg) => {
                                    const isSelected = data.paket_id === pkg.id.toString();
                                    return (
                                        <div
                                            key={pkg.id}
                                            onClick={() => setData('paket_id', pkg.id.toString())}
                                            className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between gap-2.5 ${
                                                isSelected
                                                    ? 'border-primary bg-primary/10 ring-2 ring-primary/25 shadow-xs'
                                                    : 'border-border/80 hover:border-primary/40 bg-background/50 hover:bg-background'
                                            }`}
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <span className="font-bold text-xs text-foreground leading-snug">{pkg.nama_paket}</span>
                                                {isSelected && <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />}
                                            </div>
                                            <div className="text-base font-extrabold text-primary">
                                                Rp {pkg.harga.toLocaleString('id-ID')}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <InputError message={errors.paket_id} />
                        </div>

                        {/* 2. Personal Data */}
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-2 border-b border-border/70 pb-3">
                                <User className="w-4 h-4 text-primary" />
                                <h3 className="font-bold text-sm text-foreground">2. Data Diri Calon Jamaah</h3>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="sm:col-span-2 flex flex-col gap-1.5">
                                    <Label htmlFor="nama_lengkap" className="text-xs font-bold text-foreground">
                                        Nama Lengkap (Sesuai KTP / Paspor) <span className="text-rose-500">*</span>
                                    </Label>
                                    <input
                                        id="nama_lengkap"
                                        type="text"
                                        placeholder="Contoh: H. Ahmad Subardjo"
                                        value={data.nama_lengkap}
                                        onChange={(e) => setData('nama_lengkap', e.target.value)}
                                        className={inputClasses}
                                        required
                                    />
                                    <InputError message={errors.nama_lengkap} />
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <Label htmlFor="no_hp" className="text-xs font-bold text-foreground">
                                        Nomor WhatsApp Aktif <span className="text-rose-500">*</span>
                                    </Label>
                                    <input
                                        id="no_hp"
                                        type="text"
                                        placeholder="081234567890"
                                        value={data.no_hp}
                                        onChange={(e) => setData('no_hp', e.target.value)}
                                        className={inputClasses}
                                        required
                                    />
                                    <InputError message={errors.no_hp} />
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <Label htmlFor="email" className="text-xs font-bold text-foreground">
                                        Alamat Email
                                    </Label>
                                    <input
                                        id="email"
                                        type="email"
                                        placeholder="nama@email.com"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        className={inputClasses}
                                    />
                                    <InputError message={errors.email} />
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <Label htmlFor="nik" className="text-xs font-bold text-foreground">
                                        Nomor NIK KTP (Opsional)
                                    </Label>
                                    <input
                                        id="nik"
                                        type="text"
                                        placeholder="16 digit nomor KTP"
                                        value={data.nik}
                                        onChange={(e) => setData('nik', e.target.value)}
                                        className={inputClasses}
                                    />
                                    <InputError message={errors.nik} />
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <Label htmlFor="nomor_paspor" className="text-xs font-bold text-foreground">
                                        Nomor Paspor (Jika Sudah Ada)
                                    </Label>
                                    <input
                                        id="nomor_paspor"
                                        type="text"
                                        placeholder="Contoh: A12345678"
                                        value={data.nomor_paspor}
                                        onChange={(e) => setData('nomor_paspor', e.target.value)}
                                        className={inputClasses}
                                    />
                                    <InputError message={errors.nomor_paspor} />
                                </div>
                            </div>
                        </div>

                        {/* 3. DP Payment / Official Bank Selection (Optional) */}
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-2 border-b border-border/70 pb-3">
                                <CreditCard className="w-4 h-4 text-primary" />
                                <h3 className="font-bold text-sm text-foreground">3. Rekening Resmi Pembayaran DP</h3>
                            </div>

                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Anda dapat langsung mencantumkan rencana DP tanda jadi (minimal Rp 5.000.000) atau menyelesaikannya setelah konfirmasi CS.
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <Label htmlFor="nominal_dp" className="text-xs font-bold text-foreground">
                                        Nominal Rencana DP (Rp)
                                    </Label>
                                    <input
                                        id="nominal_dp"
                                        type="number"
                                        placeholder="Contoh: 5000000"
                                        value={data.nominal_dp}
                                        onChange={(e) => setData('nominal_dp', e.target.value)}
                                        className={inputClasses}
                                    />
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <Label htmlFor="rekening_tenant_id" className="text-xs font-bold text-foreground">
                                        Tujuan Rekening Bank Travel
                                    </Label>
                                    <select
                                        id="rekening_tenant_id"
                                        value={data.rekening_tenant_id}
                                        onChange={(e) => setData('rekening_tenant_id', e.target.value)}
                                        className={inputClasses}
                                    >
                                        {banks.map((b) => (
                                            <option key={b.id} value={b.id.toString()}>
                                                {b.nama_bank} - {b.nomor_rekening} (a.n {b.atas_nama})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="sm:col-span-2 flex flex-col gap-1.5">
                                    <Label htmlFor="catatan" className="text-xs font-bold text-foreground">
                                        Catatan / Permintaan Khusus
                                    </Label>
                                    <textarea
                                        id="catatan"
                                        rows={2}
                                        placeholder="Tuliskan permintaan khusus (misal: gabung kamar bersama keluarga, kursi roda, dll)"
                                        value={data.catatan}
                                        onChange={(e) => setData('catatan', e.target.value)}
                                        className="w-full rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground text-xs p-3.5 focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20 shadow-2xs font-medium"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Submit CTA */}
                        <div className="pt-4 border-t border-border/70 flex flex-col gap-3">
                            <Button
                                type="submit"
                                disabled={processing}
                                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl py-4 sm:py-6 font-bold text-xs sm:text-sm gap-2 shadow-lg shadow-primary/20 transition-all hover:scale-[1.005] whitespace-normal h-auto leading-relaxed cursor-pointer"
                            >
                                {processing ? 'Memproses Pendaftaran...' : 'Kirim Pendaftaran & Dapatkan Nomor Registrasi'}
                            </Button>

                            <div className="flex items-center justify-center gap-2 text-[11px] text-muted-foreground">
                                <Lock className="w-3.5 h-3.5 text-primary" />
                                <span>Data Anda dienkripsi aman dan hanya digunakan untuk proses ibadah resmi.</span>
                            </div>
                        </div>
                    </form>
                </Card>
            </div>
        </div>
    );
}
