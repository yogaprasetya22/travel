import React, { useState } from 'react';
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
import { Card, CardContent } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
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

    const selectedPaket = packages.find((p) => p.id.toString() === data.paket_id);

    return (
        <div className="min-h-screen bg-[#FAF7F2] text-[#2C1A14] selection:bg-[#6F4E37] selection:text-white py-10 px-4 sm:px-6 lg:px-8 font-sans">
            <Head title={`Formulir Pendaftaran Calon Jamaah - ${travelName}`} />

            <div className="max-w-3xl mx-auto flex flex-col gap-8">
                {/* Back to Home & Logo Header */}
                <div className="flex items-center justify-between border-b border-[#E8DFD8] pb-6">
                    <Link
                        href={route('home')}
                        className="inline-flex items-center gap-2 text-xs font-bold text-[#5D4037] hover:text-[#3E2723] transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Kembali ke Beranda</span>
                    </Link>

                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-[#4A2E20] text-white flex items-center justify-center font-black text-sm">
                            🕌
                        </div>
                        <span className="font-extrabold text-sm text-[#2C1A14]">{travelName}</span>
                    </div>
                </div>

                {/* Agent Referral Card (If user visits via agent link ?ref=...) */}
                {referralAgent && (
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-[#EFEBE9] via-[#FAF7F2] to-[#EFEBE9] border border-[#D7CCC8] shadow-xs flex items-center gap-4 animate-in fade-in">
                        <div className="w-12 h-12 rounded-2xl bg-[#6F4E37]/10 border border-[#6F4E37]/20 flex items-center justify-center text-[#6F4E37] font-black text-base shrink-0">
                            {referralAgent.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                            <div className="flex items-center gap-1.5">
                                <BadgeCheck className="w-4 h-4 text-[#6F4E37]" />
                                <span className="text-[11px] font-bold text-[#8D6E63] uppercase tracking-wider">
                                    Mitra Agen Resmi Pembimbing Anda
                                </span>
                            </div>
                            <span className="font-extrabold text-sm text-[#2C1A14]">{referralAgent.name}</span>
                            <span className="text-xs text-[#6D4C41]">
                                {referralAgent.jabatan} &bull; Pendaftaran Anda akan dipandu langsung oleh beliau.
                            </span>
                        </div>
                    </div>
                )}

                {/* Form Header */}
                <div className="flex flex-col gap-2 text-left">
                    <Badge variant="secondary" className="w-fit bg-[#EFEBE9] text-[#5D4037] border-[#D7CCC8] font-bold text-xs">
                        PENDAFTARAN ONLINE MANDIRI
                    </Badge>
                    <h1 className="text-2xl sm:text-3xl font-black text-[#2C1A14] tracking-tight">
                        Formulir Registrasi Calon Jamaah
                    </h1>
                    <p className="text-xs sm:text-sm text-[#6D4C41]">
                        Isi data diri Anda di bawah ini dengan benar sesuai KTP/Paspor untuk mengamankan kuota seat keberangkatan.
                    </p>
                </div>

                {/* Registration Form Card */}
                <Card className="rounded-3xl border border-[#E8DFD8] bg-white shadow-xl shadow-[#4A2E20]/5 overflow-hidden">
                    <form onSubmit={handleSubmit} className="p-6 sm:p-8 flex flex-col gap-8">
                        {/* 1. Package Selection */}
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-2 border-b border-[#E8DFD8] pb-3">
                                <Plane className="w-4 h-4 text-[#6F4E37]" />
                                <h3 className="font-extrabold text-sm text-[#2C1A14]">1. Pilih Program Paket Umroh</h3>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {packages.map((pkg) => {
                                    const isSelected = data.paket_id === pkg.id.toString();
                                    return (
                                        <div
                                            key={pkg.id}
                                            onClick={() => setData('paket_id', pkg.id.toString())}
                                            className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between gap-2 ${
                                                isSelected
                                                    ? 'border-[#6F4E37] bg-[#FAF7F2] ring-2 ring-[#6F4E37]/20 shadow-xs'
                                                    : 'border-[#E8DFD8] hover:border-[#D7CCC8] bg-white'
                                            }`}
                                        >
                                            <div className="flex items-start justify-between">
                                                <span className="font-bold text-xs text-[#2C1A14]">{pkg.nama_paket}</span>
                                                {isSelected && <CheckCircle2 className="w-4 h-4 text-[#6F4E37]" />}
                                            </div>
                                            <div className="text-base font-black text-[#3E2723]">
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
                            <div className="flex items-center gap-2 border-b border-[#E8DFD8] pb-3">
                                <User className="w-4 h-4 text-[#6F4E37]" />
                                <h3 className="font-extrabold text-sm text-[#2C1A14]">2. Data Diri Calon Jamaah</h3>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="sm:col-span-2 flex flex-col gap-1.5">
                                    <Label htmlFor="nama_lengkap" className="text-xs font-bold text-[#5D4037]">
                                        Nama Lengkap (Sesuai KTP / Paspor) <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="nama_lengkap"
                                        type="text"
                                        placeholder="Contoh: H. Ahmad Subardjo"
                                        value={data.nama_lengkap}
                                        onChange={(e) => setData('nama_lengkap', e.target.value)}
                                        className="rounded-xl border-[#D7CCC8] text-xs h-10 focus:border-[#6F4E37] focus:ring-[#6F4E37]/20"
                                        required
                                    />
                                    <InputError message={errors.nama_lengkap} />
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <Label htmlFor="no_hp" className="text-xs font-bold text-[#5D4037]">
                                        Nomor WhatsApp Aktif <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="no_hp"
                                        type="text"
                                        placeholder="081234567890"
                                        value={data.no_hp}
                                        onChange={(e) => setData('no_hp', e.target.value)}
                                        className="rounded-xl border-[#D7CCC8] text-xs h-10 focus:border-[#6F4E37] focus:ring-[#6F4E37]/20"
                                        required
                                    />
                                    <InputError message={errors.no_hp} />
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <Label htmlFor="email" className="text-xs font-bold text-[#5D4037]">
                                        Alamat Email
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="nama@email.com"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        className="rounded-xl border-[#D7CCC8] text-xs h-10 focus:border-[#6F4E37] focus:ring-[#6F4E37]/20"
                                    />
                                    <InputError message={errors.email} />
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <Label htmlFor="nik" className="text-xs font-bold text-[#5D4037]">
                                        Nomor NIK KTP (Opsional)
                                    </Label>
                                    <Input
                                        id="nik"
                                        type="text"
                                        placeholder="16 digit nomor KTP"
                                        value={data.nik}
                                        onChange={(e) => setData('nik', e.target.value)}
                                        className="rounded-xl border-[#D7CCC8] text-xs h-10 focus:border-[#6F4E37] focus:ring-[#6F4E37]/20"
                                    />
                                    <InputError message={errors.nik} />
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <Label htmlFor="nomor_paspor" className="text-xs font-bold text-[#5D4037]">
                                        Nomor Paspor (Jika Sudah Ada)
                                    </Label>
                                    <Input
                                        id="nomor_paspor"
                                        type="text"
                                        placeholder="Contoh: A12345678"
                                        value={data.nomor_paspor}
                                        onChange={(e) => setData('nomor_paspor', e.target.value)}
                                        className="rounded-xl border-[#D7CCC8] text-xs h-10 focus:border-[#6F4E37] focus:ring-[#6F4E37]/20"
                                    />
                                    <InputError message={errors.nomor_paspor} />
                                </div>
                            </div>
                        </div>

                        {/* 3. DP Payment / Official Bank Selection (Optional) */}
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-2 border-b border-[#E8DFD8] pb-3">
                                <CreditCard className="w-4 h-4 text-[#6F4E37]" />
                                <h3 className="font-extrabold text-sm text-[#2C1A14]">3. Rekening Resmi Pembayaran DP</h3>
                            </div>

                            <p className="text-xs text-[#8D6E63]">
                                Anda dapat langsung mencantumkan rencana DP tanda jadi (minimal Rp 5.000.000) atau menyelesaikannya setelah konfirmasi CS.
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <Label htmlFor="nominal_dp" className="text-xs font-bold text-[#5D4037]">
                                        Nominal Rencana DP (Rp)
                                    </Label>
                                    <Input
                                        id="nominal_dp"
                                        type="number"
                                        placeholder="Contoh: 5000000"
                                        value={data.nominal_dp}
                                        onChange={(e) => setData('nominal_dp', e.target.value)}
                                        className="rounded-xl border-[#D7CCC8] text-xs h-10 focus:border-[#6F4E37] focus:ring-[#6F4E37]/20"
                                    />
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <Label htmlFor="rekening_tenant_id" className="text-xs font-bold text-[#5D4037]">
                                        Tujuan Rekening Bank Travel
                                    </Label>
                                    <select
                                        id="rekening_tenant_id"
                                        value={data.rekening_tenant_id}
                                        onChange={(e) => setData('rekening_tenant_id', e.target.value)}
                                        className="rounded-xl border border-[#D7CCC8] bg-white text-xs h-10 px-3 text-[#2C1A14] font-medium focus:border-[#6F4E37] focus:outline-hidden focus:ring-2 focus:ring-[#6F4E37]/20"
                                    >
                                        {banks.map((b) => (
                                            <option key={b.id} value={b.id.toString()}>
                                                {b.nama_bank} - {b.nomor_rekening} (a.n {b.atas_nama})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="sm:col-span-2 flex flex-col gap-1.5">
                                    <Label htmlFor="catatan" className="text-xs font-bold text-[#5D4037]">
                                        Catatan / Permintaan Khusus
                                    </Label>
                                    <textarea
                                        id="catatan"
                                        rows={2}
                                        placeholder="Tuliskan permintaan khusus (misal: gabung kamar bersama keluarga, kursi roda, dll)"
                                        value={data.catatan}
                                        onChange={(e) => setData('catatan', e.target.value)}
                                        className="rounded-xl border border-[#D7CCC8] text-xs p-3 focus:border-[#6F4E37] focus:outline-hidden focus:ring-2 focus:ring-[#6F4E37]/20 font-medium"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Submit CTA */}
                        <div className="pt-4 border-t border-[#E8DFD8] flex flex-col gap-3">
                            <Button
                                type="submit"
                                disabled={processing}
                                className="w-full bg-[#4A2E20] hover:bg-[#361F17] text-white rounded-2xl py-6 font-extrabold text-sm gap-2 shadow-xl shadow-[#4A2E20]/20 transition-all hover:scale-[1.01]"
                            >
                                {processing ? 'Memproses Pendaftaran...' : 'Kirim Pendaftaran & Dapatkan Nomor Registrasi'}
                            </Button>

                            <div className="flex items-center justify-center gap-2 text-[11px] text-[#8D6E63]">
                                <Lock className="w-3.5 h-3.5" />
                                <span>Data Anda dienkripsi aman dan hanya digunakan untuk proses ibadah resmi.</span>
                            </div>
                        </div>
                    </form>
                </Card>
            </div>
        </div>
    );
}
