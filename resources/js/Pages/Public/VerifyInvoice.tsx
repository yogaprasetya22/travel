import React from 'react';
import { Head, Link } from '@inertiajs/react';
import {
    CheckCircle2,
    ShieldCheck,
    Building2,
    User,
    Calendar,
    Receipt,
    CreditCard,
    ArrowLeft,
    Clock,
    XCircle,
} from 'lucide-react';
import { toRupiah } from '@/Components/CurrencyInput';

interface Props {
    tenant: {
        id: number;
        nama_travel: string;
        domain_atau_subdomain?: string;
        alamat?: string;
        logo_url?: string;
        telepon?: string;
    } | null;
    payment: {
        id: number;
        nomor_invoice?: string;
        nominal: number;
        tipe_pembayaran: string;
        status_verifikasi: string;
        created_at: string;
        updated_at?: string;
        jamaah?: {
            nama_lengkap: string;
            nik?: string | null;
            no_hp?: string;
            paket?: {
                nama_paket: string;
                harga: number;
            };
        };
        rekening_tenant?: {
            nama_bank: string;
            nomor_rekening: string;
            atas_nama: string;
        };
        verified_by?: {
            name: string;
        } | null;
    };
}

export default function VerifyInvoice({ tenant, payment }: Props) {
    const isVerified =
        payment.status_verifikasi === 'Verified' || payment.status_verifikasi === 'verified';
    const isRejected =
        payment.status_verifikasi === 'Rejected' || payment.status_verifikasi === 'rejected';

    const paymentDate = new Date(payment.created_at);
    const invoiceNumber =
        payment.nomor_invoice ||
        `INV-${paymentDate.getFullYear()}${String(paymentDate.getMonth() + 1).padStart(2, '0')}-${String(payment.id).padStart(5, '0')}`;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 selection:bg-emerald-500 selection:text-white font-sans antialiased">
            <Head title={`Verifikasi Kuitansi ${invoiceNumber} - ${tenant?.nama_travel || 'HajjFlow'}`} />

            <div className="w-full max-w-lg flex flex-col gap-5">
                {/* Header Branding */}
                <div className="text-center space-y-1">
                    <div className="inline-flex items-center justify-center p-2.5 rounded-2xl bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 mb-1 border border-emerald-500/20">
                        <ShieldCheck className="w-8 h-8" />
                    </div>
                    <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
                        Sistem Verifikasi Transaksi Resmi
                    </h1>
                    <p className="text-xs text-muted-foreground">
                        {tenant?.nama_travel || 'PT. HAJJ & UMROH SERVICE INDONESIA'}
                    </p>
                </div>

                {/* Main Certificate Card */}
                <div className="bg-card border border-border/80 rounded-3xl shadow-xl overflow-hidden">
                    {/* Status Banner */}
                    <div
                        className={`p-6 text-center text-white flex flex-col items-center justify-center gap-2 ${
                            isVerified
                                ? 'bg-gradient-to-r from-emerald-600 to-teal-700'
                                : isRejected
                                ? 'bg-gradient-to-r from-rose-600 to-red-700'
                                : 'bg-gradient-to-r from-amber-500 to-orange-600'
                        }`}
                    >
                        {isVerified ? (
                            <CheckCircle2 className="w-12 h-12 text-emerald-100 animate-pulse" />
                        ) : isRejected ? (
                            <XCircle className="w-12 h-12 text-rose-100" />
                        ) : (
                            <Clock className="w-12 h-12 text-amber-100" />
                        )}
                        <div>
                            <span className="text-xs uppercase tracking-widest font-black opacity-90">
                                Status Transaksi
                            </span>
                            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                                {isVerified
                                    ? 'VALID & DIVERIFIKASI RESMI'
                                    : isRejected
                                    ? 'TRANSAKSI DITOLAK'
                                    : 'MENUNGGU VERIFIKASI'}
                            </h2>
                        </div>
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/20 text-[11px] font-mono backdrop-blur-xs">
                            <span>No. Invoice:</span>
                            <span className="font-bold">{invoiceNumber}</span>
                        </div>
                    </div>

                    {/* Transaction Details Body */}
                    <div className="p-6 sm:p-7 space-y-5 text-xs">
                        {/* Nominal Highlight */}
                        <div className="p-4 bg-muted/40 rounded-2xl border border-border flex flex-col items-center justify-center gap-1 text-center">
                            <span className="text-[11px] text-muted-foreground uppercase font-semibold">
                                Nominal Pembayaran
                            </span>
                            <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                                {toRupiah(payment.nominal || 0)}
                            </span>
                            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                                Tipe: {payment.tipe_pembayaran}
                            </span>
                        </div>

                        {/* Jamaah & Paket Info */}
                        <div className="space-y-3 divide-y divide-border/60">
                            <div className="pt-2 flex justify-between items-center">
                                <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
                                    <User className="w-3.5 h-3.5 text-primary" /> Nama Jamaah:
                                </span>
                                <span className="font-bold text-foreground text-sm">
                                    {payment.jamaah?.nama_lengkap || '-'}
                                </span>
                            </div>

                            {payment.jamaah?.nik && (
                                <div className="pt-2 flex justify-between items-center">
                                    <span className="text-muted-foreground">NIK Identitas:</span>
                                    <span className="font-mono font-semibold text-foreground">
                                        {payment.jamaah.nik}
                                    </span>
                                </div>
                            )}

                            <div className="pt-2 flex justify-between items-center">
                                <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
                                    <Receipt className="w-3.5 h-3.5 text-primary" /> Paket Umroh / Haji:
                                </span>
                                <span className="font-bold text-foreground">
                                    {payment.jamaah?.paket?.nama_paket || 'Paket Standar'}
                                </span>
                            </div>

                            <div className="pt-2 flex justify-between items-center">
                                <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
                                    <Calendar className="w-3.5 h-3.5 text-primary" /> Tanggal Transaksi:
                                </span>
                                <span className="font-medium text-foreground">
                                    {paymentDate.toLocaleDateString('id-ID', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })} WIB
                                </span>
                            </div>

                            {payment.rekening_tenant && (
                                <div className="pt-2 flex justify-between items-center">
                                    <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
                                        <CreditCard className="w-3.5 h-3.5 text-primary" /> Rekening Tujuan:
                                    </span>
                                    <span className="font-semibold text-foreground text-right">
                                        {payment.rekening_tenant.nama_bank} ({payment.rekening_tenant.nomor_rekening})
                                        <br />
                                        <span className="text-[10px] text-muted-foreground">
                                            a.n {payment.rekening_tenant.atas_nama}
                                        </span>
                                    </span>
                                </div>
                            )}

                            {/* Approval Info */}
                            <div className="pt-2 flex justify-between items-center">
                                <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
                                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Petugas Approval:
                                </span>
                                <span className="font-bold text-emerald-700 dark:text-emerald-400">
                                    {payment.verified_by?.name || 'Bagian Keuangan (Finance)'}
                                </span>
                            </div>
                        </div>

                        {/* Security Disclaimer */}
                        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 rounded-xl text-[10px] text-emerald-800 dark:text-emerald-300 leading-relaxed">
                            <p className="font-semibold mb-0.5">Jaminan Keabsahan Dokumen:</p>
                            Dokumen kuitansi ini diterbitkan secara elektronik oleh sistem manajemen travel resmi dan memiliki integritas data yang terdaftar di basis data kami.
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-4 bg-muted/30 border-t border-border flex items-center justify-between text-xs">
                        <button
                            type="button"
                            onClick={() => {
                                if (window.history.length > 1) {
                                    window.history.back();
                                } else {
                                    window.location.href = route('home');
                                }
                            }}
                            className="inline-flex items-center gap-1.5 font-bold text-primary hover:underline cursor-pointer"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Kembali</span>
                        </button>
                        <span className="text-[10px] text-muted-foreground font-mono">
                            Ref #{payment.id}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
