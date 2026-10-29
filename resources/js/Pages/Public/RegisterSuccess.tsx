import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { PageProps } from '@/Types';
import {
    CheckCircle2,
    Calendar,
    User,
    Plane,
    CreditCard,
    MessageCircle,
    ArrowRight,
    Sparkles,
    ShieldCheck,
    Phone,
    Home,
} from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Card } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';

interface JamaahItem {
    id: number;
    kode_pendaftaran?: string;
    nama_lengkap: string;
    no_hp: string;
    email: string | null;
    nik: string | null;
    nomor_paspor: string | null;
    created_at: string;
    paket?: {
        id: number;
        nama_paket: string;
        harga: number;
    } | null;
    agen?: {
        id: number;
        name: string;
        email: string;
        jabatan?: string;
    } | null;
    pembayaran?: Array<{
        id: number;
        nominal: number;
        status_verifikasi: string;
        rekening_tenant?: {
            nama_bank: string;
            nomor_rekening: string;
            atas_nama: string;
        } | null;
    }>;
}

interface TenantItem {
    id: number;
    nama_travel: string;
    domain_atau_subdomain?: string;
    no_telepon?: string | null;
}

interface Props extends PageProps {
    tenant?: TenantItem | null;
    jamaah: JamaahItem;
}

export default function RegisterSuccess({ tenant, jamaah }: Props) {
    const travelName = tenant?.nama_travel || 'Travel Kolibrinektara';
    const regCode = jamaah?.kode_pendaftaran || `REG-${String(jamaah?.id || 1).padStart(5, '0')}`;
    const cleanPhone = (tenant?.no_telepon || '6281234567890').replace(/[^0-9]/g, '').replace(/^0/, '62');

    const waMessage = encodeURIComponent(
        `Assalamu'alaikum CS ${travelName}, saya telah mendaftar online dengan Kode Registrasi *${regCode}* atas nama *${jamaah?.nama_lengkap}* untuk paket *${jamaah?.paket?.nama_paket || 'Umroh'}*. Mohon informasi panduan selanjutnya.`
    );
    const waTargetUrl = `https://wa.me/${cleanPhone}?text=${waMessage}`;

    return (
        <div className="min-h-screen bg-[#FAF7F2] text-[#2C1A14] selection:bg-[#6F4E37] selection:text-white py-12 px-4 sm:px-6 lg:px-8 font-sans flex flex-col items-center justify-center">
            <Head title={`Pendaftaran Berhasil - ${travelName}`} />

            <div className="max-w-xl w-full flex flex-col gap-6">
                {/* Success Card */}
                <Card className="rounded-3xl border border-[#E8DFD8] bg-white shadow-2xl shadow-[#4A2E20]/10 overflow-hidden text-center p-8 sm:p-10 flex flex-col items-center gap-6">
                    {/* Animated Checkmark Badge */}
                    <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#4A2E20] to-[#6F4E37] text-white flex items-center justify-center shadow-lg shadow-[#4A2E20]/30 animate-in zoom-in-50 duration-500">
                        <CheckCircle2 className="w-10 h-10 text-[#FAF7F2]" />
                    </div>

                    <div className="flex flex-col gap-2">
                        <Badge variant="secondary" className="w-fit mx-auto bg-[#EFEBE9] text-[#5D4037] border-[#D7CCC8] font-bold text-xs">
                            REGISTRASI BERHASIL
                        </Badge>
                        <h1 className="text-2xl sm:text-3xl font-black text-[#2C1A14] tracking-tight">
                            Alhamdulillah, Data Anda Telah Diterima!
                        </h1>
                        <p className="text-xs sm:text-sm text-[#6D4C41]">
                            Terima kasih telah mempercayakan perjalanan ibadah Anda bersama <strong>{travelName}</strong>.
                        </p>
                    </div>

                    {/* Booking Reference Box */}
                    <div className="w-full bg-[#FAF7F2] border border-[#E8DFD8] rounded-2xl p-4 flex flex-col items-center justify-center gap-1">
                        <span className="text-[11px] font-bold text-[#8D6E63] uppercase tracking-wider">
                            Nomor Registrasi Anda
                        </span>
                        <span className="text-2xl font-mono font-black text-[#3E2723] tracking-widest">
                            {regCode}
                        </span>
                    </div>

                    {/* Summary Info */}
                    <div className="w-full flex flex-col gap-3 text-left border-t border-b border-[#E8DFD8] py-4 text-xs">
                        <div className="flex justify-between">
                            <span className="text-[#8D6E63]">Nama Jamaah:</span>
                            <span className="font-bold text-[#2C1A14]">{jamaah?.nama_lengkap}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-[#8D6E63]">WhatsApp:</span>
                            <span className="font-bold text-[#2C1A14]">{jamaah?.no_hp}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-[#8D6E63]">Paket Pilihan:</span>
                            <span className="font-bold text-[#3E2723]">
                                {jamaah?.paket?.nama_paket || 'Paket Umroh'}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-[#8D6E63]">Biaya Paket:</span>
                            <span className="font-bold text-emerald-700 font-mono">
                                Rp {Number(jamaah?.paket?.harga || 0).toLocaleString('id-ID')}
                            </span>
                        </div>
                        {jamaah?.agen && (
                            <div className="flex justify-between">
                                <span className="text-[#8D6E63]">Mitra Agen Pembimbing:</span>
                                <span className="font-bold text-[#6F4E37]">{jamaah.agen.name}</span>
                            </div>
                        )}
                    </div>

                    {/* Next Steps CTA */}
                    <div className="w-full flex flex-col gap-3">
                        <a
                            href={waTargetUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full"
                        >
                            <Button className="w-full bg-[#10b981] hover:bg-[#059669] text-white rounded-2xl py-6 font-extrabold text-sm gap-2 shadow-lg shadow-emerald-600/20">
                                <MessageCircle className="w-5 h-5" />
                                <span>Konfirmasi ke WhatsApp Admin Travel (+{cleanPhone})</span>
                            </Button>
                        </a>

                        <Link href={route('home')} className="w-full">
                            <Button
                                variant="outline"
                                className="w-full border-[#D7CCC8] hover:bg-[#EFEBE9] text-[#5D4037] rounded-2xl py-5 font-bold text-xs gap-2"
                            >
                                <Home className="w-4 h-4" />
                                <span>Kembali ke Halaman Utama</span>
                            </Button>
                        </Link>
                    </div>
                </Card>
            </div>
        </div>
    );
}
