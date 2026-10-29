import React, { useState } from 'react';
import { Customer, BankAccount } from './types';
import { useForm } from '@inertiajs/react';
import {
    PlusCircle,
    Receipt,
    Wallet,
    DollarSign,
    CheckCircle2,
    Calendar,
    FileText,
    RefreshCw,
    Paperclip,
    ArrowUpRight,
    Clock,
    CreditCard,
} from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import CurrencyInput from '@/Components/CurrencyInput';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import { PaymentInvoiceModal, InvoicePaymentData } from '@/Components/PaymentInvoiceModal';

interface CustomerFinancialTabProps {
    customer: Customer;
    banks: BankAccount[];
    onViewSlip: (url: string) => void;
}

export const CustomerFinancialTab: React.FC<CustomerFinancialTabProps> = ({
    customer,
    banks = [],
    onViewSlip,
}) => {
    const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState<InvoicePaymentData | null>(null);

    const paymentForm = useForm<{
        nominal: string;
        tipe_pembayaran: string;
        rekening_tenant_id: string;
        bukti_transfer: File | null;
    }>({
        nominal: '',
        tipe_pembayaran: 'Cicilan',
        rekening_tenant_id: banks[0]?.id ? String(banks[0].id) : '',
        bukti_transfer: null,
    });

    const handlePaymentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        paymentForm.post(`/crm/customers/${customer.id}/payment`, {
            preserveScroll: true,
            onSuccess: () => {
                paymentForm.reset('nominal', 'bukti_transfer');
                setIsAddPaymentOpen(false);
            },
        });
    };

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('id-ID', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(val || 0);
    };

    const formatDateTime = (dateStr?: string | null) => {
        if (!dateStr) return '-';
        try {
            const d = new Date(dateStr);
            if (isNaN(d.getTime())) return dateStr;
            return (
                d.toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                }) + ' WIB'
            );
        } catch {
            return dateStr;
        }
    };

    const packagePrice = customer.paket?.harga || 0;
    const payments = customer.pembayaran || [];
    const totalPaid = payments
        .filter((p) => p.status_verifikasi === 'Verified' || p.status_verifikasi === 'verified')
        .reduce((sum, p) => sum + Number(p.nominal || 0), 0);
    const pendingPaid = payments
        .filter((p) => p.status_verifikasi === 'Pending' || p.status_verifikasi === 'pending')
        .reduce((sum, p) => sum + Number(p.nominal || 0), 0);
    const outstanding = Math.max(0, packagePrice - totalPaid);
    const isPaidOff = outstanding <= 0 && packagePrice > 0;

    return (
        <div className="space-y-6">
            {/* Top Financial Status Cards - Responsive Grid with Clean Large Number Handling */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {/* 1. Total Tagihan Paket */}
                <div className="relative overflow-hidden rounded-2xl border border-slate-200/90 dark:border-slate-800/80 bg-linear-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-900/90 dark:via-slate-900/60 dark:to-blue-950/20 p-4 shadow-xs transition-all flex flex-col justify-between min-h-[110px]">
                    <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5 truncate">
                            <Receipt className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                            Total Tagihan Paket
                        </span>
                    </div>
                    <div className="mt-2.5">
                        <div className="flex items-baseline gap-1 text-slate-900 dark:text-white font-mono">
                            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">Rp</span>
                            <span className="text-lg sm:text-xl font-black tracking-tight truncate leading-none">
                                {formatCurrency(packagePrice)}
                            </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 truncate">
                            {customer.paket?.nama_paket || 'Paket Belum Dipilih'}
                        </p>
                    </div>
                </div>

                {/* 2. Sudah Diverifikasi / Terbayar */}
                <div className="relative overflow-hidden rounded-2xl border border-emerald-200/80 dark:border-emerald-800/50 bg-linear-to-br from-emerald-50/60 via-white to-teal-50/30 dark:from-emerald-950/30 dark:via-slate-900/60 dark:to-teal-950/20 p-4 shadow-xs transition-all flex flex-col justify-between min-h-[110px]">
                    <div className="flex flex-col items-start justify-between gap-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 truncate">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            Sudah Diverifikasi
                        </span>
                        {pendingPaid > 0 && (
                            <span className="px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300/40 shrink-0">
                                +Rp {formatCurrency(pendingPaid)} pending
                            </span>
                        )}
                    </div>
                    <div className="mt-2.5">
                        <div className="flex items-baseline gap-1 text-emerald-700 dark:text-emerald-300 font-mono">
                            <span className="text-xs font-semibold text-emerald-500/70 dark:text-emerald-400/60">Rp</span>
                            <span className="text-lg sm:text-xl font-black tracking-tight truncate leading-none">
                                {formatCurrency(totalPaid)}
                            </span>
                        </div>
                        <p className="text-[11px] text-emerald-600/90 dark:text-emerald-400/80 mt-1.5 truncate">
                            {payments.length} transaksi tercatat
                        </p>
                    </div>
                </div>

                {/* 3. Sisa Tagihan (Outstanding) / Lunas */}
                <div className={`relative overflow-hidden rounded-2xl border p-4 shadow-xs transition-all flex flex-col justify-between min-h-[110px] sm:col-span-2 lg:col-span-1 ${
                    isPaidOff
                        ? 'border-blue-200/80 dark:border-blue-800/50 bg-linear-to-br from-blue-50/60 via-white to-indigo-50/30 dark:from-blue-950/30 dark:via-slate-900/60 dark:to-indigo-950/20'
                        : 'border-amber-200/80 dark:border-amber-800/50 bg-linear-to-br from-amber-50/60 via-white to-orange-50/30 dark:from-amber-950/30 dark:via-slate-900/60 dark:to-orange-950/20'
                }`}>
                    <div className="flex items-center justify-between gap-2">
                        <span className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 truncate ${
                            isPaidOff ? 'text-blue-700 dark:text-blue-400' : 'text-amber-700 dark:text-amber-400'
                        }`}>
                            <Wallet className="w-3.5 h-3.5 shrink-0" />
                            {isPaidOff ? 'Status Pembayaran' : 'Sisa Tagihan'}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider ${
                            isPaidOff
                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300'
                                : 'bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300'
                        }`}>
                            {isPaidOff ? 'Lunas' : 'Belum Lunas'}
                        </span>
                    </div>
                    <div className="mt-2.5">
                        <div className={`flex items-baseline gap-1 font-mono ${
                            isPaidOff ? 'text-blue-700 dark:text-blue-300' : 'text-amber-700 dark:text-amber-300'
                        }`}>
                            {!isPaidOff && <span className="text-xs font-semibold text-amber-500/70 dark:text-amber-400/60">Rp</span>}
                            <span className="text-lg sm:text-xl font-black tracking-tight truncate leading-none">
                                {isPaidOff ? 'LUNAS (100%)' : formatCurrency(outstanding)}
                            </span>
                        </div>
                        <p className={`text-[11px] mt-1.5 truncate ${
                            isPaidOff ? 'text-blue-600/90 dark:text-blue-400/80' : 'text-amber-600/90 dark:text-amber-400/80'
                        }`}>
                            {isPaidOff ? 'Semua tagihan telah diselesaikan' : 'Perlu pelunasan sebelum batas tempo'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Action Bar Header */}
            <div className="flex items-center justify-between pt-1 gap-2">
                <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                        <FileText className="w-4 h-4 text-indigo-500" />
                        Riwayat Mutasi Pembayaran
                    </h4>
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {payments.length}
                    </span>
                </div>
                <Button 
                    size="sm" 
                    onClick={() => setIsAddPaymentOpen(!isAddPaymentOpen)}
                    variant={isAddPaymentOpen ? "secondary" : "default"}
                    className={`h-9 px-3.5 gap-1.5 text-xs font-bold rounded-xl shadow-xs transition-all ${
                        !isAddPaymentOpen 
                            ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 dark:bg-amber-400 dark:hover:bg-amber-500 font-bold'
                            : ''
                    }`}
                >
                    <PlusCircle className="w-4 h-4" />
                    {isAddPaymentOpen ? 'Batal Form' : 'Catat Pembayaran Baru'}
                </Button>
            </div>

            {/* Add Payment Expandable Card */}
            {isAddPaymentOpen && (
                <div className="bg-slate-50 dark:bg-slate-900/90 border border-indigo-200 dark:border-indigo-900/60 rounded-2xl p-5 shadow-sm space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                            <DollarSign className="w-4 h-4" />
                            Formulir Pencatatan Kas Masuk / Pelunasan
                        </div>
                    </div>
                    <form onSubmit={handlePaymentSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <div className="flex items-center justify-between flex-wrap gap-1">
                                    <InputLabel htmlFor="add_payment_nominal" value="Nominal Pembayaran (Rp) *" className="text-xs font-semibold" />
                                    {outstanding > 0 && (
                                        <div className="text-[11px] text-right">
                                            <span className="text-muted-foreground">Sisa: </span>
                                            {Number(paymentForm.data.nominal) > 0 ? (
                                                <>
                                                    <span className="line-through text-muted-foreground mr-1">
                                                        Rp {formatCurrency(outstanding)}
                                                    </span>
                                                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                                        → Rp {formatCurrency(Math.max(0, outstanding - (Number(paymentForm.data.nominal) || 0)))}
                                                        {Math.max(0, outstanding - (Number(paymentForm.data.nominal) || 0)) === 0 && ' (Lunas)'}
                                                    </span>
                                                </>
                                            ) : (
                                                <strong className="font-mono text-foreground">
                                                    Rp {formatCurrency(outstanding)}
                                                </strong>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <CurrencyInput 
                                    id="add_payment_nominal"
                                    value={paymentForm.data.nominal}
                                    onChange={(val) => paymentForm.setData('nominal', val)}
                                    placeholder="Contoh: 10.000.000"
                                    required
                                    className="mt-1 block w-full text-xs font-mono"
                                />
                                <InputError message={paymentForm.errors.nominal} className="mt-1" />
                            </div>

                            <div>
                                <InputLabel htmlFor="add_payment_tipe" value="Tipe Pembayaran *" className="text-xs font-semibold" />
                                <div className="mt-1">
                                    <Select 
                                        value={paymentForm.data.tipe_pembayaran}
                                        onValueChange={val => paymentForm.setData('tipe_pembayaran', val || 'Cicilan')}
                                    >
                                        <SelectTrigger id="add_payment_tipe" className="w-full text-xs sm:text-sm">
                                            <span className="truncate">
                                                {paymentForm.data.tipe_pembayaran === 'DP' ? 'Uang Muka (DP)' :
                                                 paymentForm.data.tipe_pembayaran === 'Cicilan' ? 'Cicilan' :
                                                 paymentForm.data.tipe_pembayaran === 'Pelunasan' ? 'Pelunasan' :
                                                 paymentForm.data.tipe_pembayaran === 'Tambahan' ? 'Biaya Tambahan' :
                                                 paymentForm.data.tipe_pembayaran === 'Lunas' ? 'Bayar Lunas' :
                                                 (paymentForm.data.tipe_pembayaran || 'Pilih Tipe')}
                                            </span>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="DP">Uang Muka (DP)</SelectItem>
                                            <SelectItem value="Cicilan">Cicilan</SelectItem>
                                            <SelectItem value="Pelunasan">Pelunasan</SelectItem>
                                            <SelectItem value="Tambahan">Biaya Tambahan</SelectItem>
                                            <SelectItem value="Lunas">Bayar Lunas</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <InputError message={paymentForm.errors.tipe_pembayaran} className="mt-1" />
                            </div>

                            <div>
                                <InputLabel htmlFor="add_payment_rekening" value="Rekening Tujuan / Kas *" className="text-xs font-semibold" />
                                <div className="mt-1">
                                    <Select 
                                        value={paymentForm.data.rekening_tenant_id}
                                        onValueChange={val => paymentForm.setData('rekening_tenant_id', val || '')}
                                    >
                                        <SelectTrigger id="add_payment_rekening" className="w-full text-xs sm:text-sm">
                                            <span className="truncate">
                                                {(() => {
                                                    const found = banks.find(b => String(b.id) === String(paymentForm.data.rekening_tenant_id));
                                                    return found 
                                                        ? `${found.nama_bank} - ${found.nomor_rekening} (${found.atas_nama})`
                                                        : 'Pilih Rekening Tujuan / Kas';
                                                })()}
                                            </span>
                                        </SelectTrigger>
                                        <SelectContent>
                                            {banks.map(ba => (
                                                <SelectItem key={ba.id} value={String(ba.id)}>
                                                    {ba.nama_bank} - {ba.nomor_rekening} (a.n {ba.atas_nama})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <InputError message={paymentForm.errors.rekening_tenant_id} className="mt-1" />
                            </div>

                            <div>
                                <InputLabel htmlFor="add_payment_bukti" value="Unggah Bukti Transfer / Slip" className="text-xs font-semibold" />
                                <Input 
                                    id="add_payment_bukti"
                                    type="file"
                                    accept="image/*,application/pdf"
                                    onChange={e => paymentForm.setData('bukti_transfer', e.target.files?.[0] || null)}
                                    className="mt-1 file:text-xs text-xs"
                                />
                                <InputError message={paymentForm.errors.bukti_transfer} className="mt-1" />
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <Button 
                                type="button" 
                                variant="outline" 
                                size="sm" 
                                onClick={() => setIsAddPaymentOpen(false)}
                            >
                                Batal
                            </Button>
                            <Button 
                                type="submit" 
                                size="sm" 
                                disabled={paymentForm.processing}
                                className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
                            >
                                {paymentForm.processing && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                                Simpan Transaksi Pembayaran
                            </Button>
                        </div>
                    </form>
                </div>
            )}

            {/* Payments List / Table */}
            {payments.length > 0 ? (
                <div className="space-y-2.5">
                    {payments.map((p) => {
                        const proofUrl = p.bukti_transfer ? `/storage/${p.bukti_transfer}` : null;
                        const isVerified = p.status_verifikasi === 'Verified' || p.status_verifikasi === 'verified';
                        const isRejected = p.status_verifikasi === 'Rejected' || p.status_verifikasi === 'rejected';

                        return (
                            <div 
                                key={p.id} 
                                className="p-4 bg-white dark:bg-slate-900/70 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-2xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                            >
                                <div className="space-y-1.5 min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <div className="flex items-baseline gap-1 font-mono text-slate-900 dark:text-white">
                                            <span className="text-xs font-bold text-slate-400">Rp</span>
                                            <span className="text-base sm:text-lg font-black tracking-tight">
                                                {formatCurrency(p.nominal)}
                                            </span>
                                        </div>

                                        {/* Status Badge with Dot */}
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                                            isVerified 
                                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/50'
                                                : isRejected
                                                ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800/50'
                                                : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800/50'
                                        }`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${
                                                isVerified ? 'bg-emerald-500' : isRejected ? 'bg-rose-500' : 'bg-amber-500'
                                            }`} />
                                            {p.status_verifikasi}
                                        </span>

                                        <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60 uppercase">
                                            {p.tipe_pembayaran}
                                        </span>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                                            {formatDateTime(p.created_at)}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                                    {isVerified && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                setSelectedInvoice({
                                                    id: p.id,
                                                    nomor_invoice: p.nomor_invoice,
                                                    nominal: Number(p.nominal || 0),
                                                    tipe_pembayaran: p.tipe_pembayaran || 'Pembayaran',
                                                    status_verifikasi: p.status_verifikasi,
                                                    created_at: p.created_at,
                                                    verified_at: p.updated_at,
                                                    jamaah: {
                                                        nama_lengkap: customer.nama_lengkap,
                                                        nik: customer.nik,
                                                        no_hp: customer.no_hp,
                                                        alamat_ktp: customer.alamat_ktp,
                                                        paket: customer.paket ? {
                                                            nama_paket: customer.paket.nama_paket,
                                                            harga: customer.paket.harga,
                                                        } : undefined,
                                                    },
                                                    rekening_tenant: banks.find(b => b.id === p.rekening_tenant_id),
                                                    verified_by: (p as any).verified_by || (p as any).verifiedBy || (p as any).verified_by_user,
                                                });
                                            }}
                                            className="h-8 px-3 gap-1.5 text-xs font-semibold border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/50 hover:bg-indigo-600 text-indigo-700 hover:text-white dark:text-indigo-400 dark:hover:text-white rounded-xl transition cursor-pointer"
                                            title="Cetak Kuitansi / Invoice Resmi"
                                        >
                                            <Receipt className="w-3.5 h-3.5" />
                                            <span>Invoice</span>
                                        </Button>
                                    )}

                                    {proofUrl && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => onViewSlip(proofUrl)}
                                            className="h-8 px-3 gap-1.5 text-xs font-semibold border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
                                        >
                                            <Paperclip className="w-3.5 h-3.5" />
                                            <span>Bukti</span>
                                        </Button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-10 bg-slate-50/50 dark:bg-slate-900/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                    <Receipt className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Belum ada mutasi pembayaran</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-sm mx-auto">
                        Klik tombol "Catat Pembayaran Baru" untuk merekam cicilan atau uang muka jamaah.
                    </p>
                </div>
            )}

            {/* Modal Kuitansi / Invoice Resmi */}
            <PaymentInvoiceModal
                payment={selectedInvoice}
                isOpen={!!selectedInvoice}
                onClose={() => setSelectedInvoice(null)}
            />
        </div>
    );
};

export default CustomerFinancialTab;
