import React, { useState, useEffect } from 'react';
import { useForm, router } from '@inertiajs/react';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import CurrencyInput, { toRupiah, unformatRupiah } from '@/Components/CurrencyInput';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter,
} from '@/Components/ui/sheet';
import {
    Receipt,
    User,
    CheckCircle2,
    Coins,
    PlusCircle,
    History,
    Clock,
    ArrowRight,
    FileText,
} from 'lucide-react';

export interface Customer {
    id: number;
    nama_lengkap: string;
    nik: string | null;
    nomor_paspor: string | null;
    no_hp: string;
    email: string | null;
    catatan_admin: string | null;
    tanggal_keberangkatan: string | null;
    paket: {
        id: number;
        nama_paket: string;
        harga: number;
    };
    agen: {
        id: number;
        name: string;
        email?: string;
    } | null;
    pembayaran: Array<{
        id: number;
        nominal: number;
        tipe_pembayaran: string;
        status_verifikasi: string;
        created_at: string;
    }>;
    komisi_agen: Array<{
        id: number;
        nominal_komisi: number;
        status_pencairan: string;
    }>;
    inventaris_transaksi: Array<{
        id: number;
        qty: number;
        inventaris: {
            nama_barang: string;
        };
    }>;
    stage_logs?: Array<{
        id: number;
        user?: {
            id: number;
            name: string;
        } | null;
        from_stage?: {
            id: number;
            nama_tahap: string;
        } | null;
        to_stage: {
            id: number;
            nama_tahap: string;
        };
        catatan: string | null;
        created_at: string;
    }>;
}

export interface BankAccount {
    id: number;
    nama_bank: string;
    nomor_rekening: string;
    atas_nama: string;
}

interface Props {
    customer: Customer | null;
    initialTab?: 'biodata' | 'financial' | 'riwayat';
    banks: BankAccount[];
    onClose: () => void;
}

export default function CustomerDrawer({
    customer,
    initialTab = 'biodata',
    banks = [],
    onClose,
}: Props) {
    const [activeDrawerTab, setActiveDrawerTab] = useState<'biodata' | 'financial' | 'riwayat'>(initialTab);
    const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false);

    useEffect(() => {
        if (customer) {
            setActiveDrawerTab(initialTab);
            setIsAddPaymentOpen(false);
        }
    }, [customer, initialTab]);

    const editForm = useForm({
        nama_lengkap: customer?.nama_lengkap || '',
        nik: customer?.nik || '',
        no_hp: customer?.no_hp || '',
        email: customer?.email || '',
        nomor_paspor: customer?.nomor_paspor || '',
        tanggal_keberangkatan: customer?.tanggal_keberangkatan || '',
        catatan_admin: customer?.catatan_admin || '',
    });

    useEffect(() => {
        if (customer) {
            editForm.setData({
                nama_lengkap: customer.nama_lengkap || '',
                nik: customer.nik || '',
                no_hp: customer.no_hp || '',
                email: customer.email || '',
                nomor_paspor: customer.nomor_paspor || '',
                tanggal_keberangkatan: customer.tanggal_keberangkatan || '',
                catatan_admin: customer.catatan_admin || '',
            });
        }
    }, [customer]);

    const packagePrice = Number(customer?.paket?.harga || 0);
    const totalPaid = (customer?.pembayaran || [])
        .filter((p) => p.status_verifikasi === 'Verified')
        .reduce((sum, p) => sum + Number(p.nominal), 0);
    const remaining = Math.max(0, packagePrice - totalPaid);
    const commissionItem = customer?.komisi_agen?.[0];

    const paymentForm = useForm<{
        nominal: string;
        tipe_pembayaran: string;
        rekening_tenant_id: string;
        bukti_transfer: File | null;
    }>({
        nominal: remaining > 0 ? remaining.toString() : '',
        tipe_pembayaran: remaining > 0 ? 'Pelunasan' : 'Cicilan',
        rekening_tenant_id: banks[0]?.id?.toString() || '',
        bukti_transfer: null,
    });

    const handleUpdateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!customer) return;

        editForm.put(route('crm.customers.update', customer.id), {
            preserveScroll: true,
            onSuccess: () => {
                onClose();
            },
        });
    };

    const handlePaymentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!customer) return;

        const payload = {
            ...paymentForm.data,
            nominal: Number(unformatRupiah(paymentForm.data.nominal)) || 0,
        };

        router.post(route('crm.customers.payment', customer.id), payload, {
            preserveScroll: true,
            onSuccess: () => {
                setIsAddPaymentOpen(false);
                onClose();
            },
        });
    };

    const handleDisburseCommission = (commissionId: number) => {
        router.put(
            route('keagenan.commissions.update', commissionId),
            { status_pencairan: 'Paid' },
            {
                preserveScroll: true,
                onSuccess: () => {
                    onClose();
                },
            }
        );
    };

    return (
        <Sheet open={!!customer} onOpenChange={(open) => { if (!open) onClose(); }}>
            <SheetContent side="right" className="w-1/2 max-w-none">
                <SheetHeader>
                    <SheetTitle>Manajemen Nasabah &amp; Transaksi Pelunasan</SheetTitle>
                    <SheetDescription>
                        Edit data lengkap biodata jamaah, catat transaksi pelunasan/cicilan baru, atau cairkan komisi agen.
                    </SheetDescription>
                </SheetHeader>
                {customer && (
                    <div className="flex flex-col gap-4 p-4 flex-1 overflow-y-auto">
                        {/* Top Mini Summary Banner */}
                        <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-xs flex justify-between items-center">
                            <div>
                                <h3 className="font-bold text-base text-foreground">{customer.nama_lengkap}</h3>
                                <div className="text-xs text-muted-foreground mt-0.5">
                                    {customer.paket?.nama_paket} ({toRupiah(packagePrice)})
                                </div>
                            </div>
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                                remaining === 0
                                    ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                                    : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                            }`}>
                                {remaining === 0 ? 'LUNAS (100%)' : `Sisa: ${toRupiah(remaining)}`}
                            </span>
                        </div>

                        {/* 3 Tab Switcher */}
                        <div className="grid grid-cols-3 p-1 bg-muted/60 rounded-xl border border-border/80 gap-1">
                            <button
                                type="button"
                                onClick={() => { setActiveDrawerTab('biodata'); setIsAddPaymentOpen(false); }}
                                className={`py-2 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                                    activeDrawerTab === 'biodata'
                                        ? 'bg-card text-foreground shadow-xs'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                <User className="w-3.5 h-3.5" />
                                <span>1. Biodata</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => { setActiveDrawerTab('financial'); setIsAddPaymentOpen(false); }}
                                className={`py-2 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                                    activeDrawerTab === 'financial'
                                        ? 'bg-card text-foreground shadow-xs'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                <Receipt className="w-3.5 h-3.5" />
                                <span>2. Keuangan</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => { setActiveDrawerTab('riwayat'); setIsAddPaymentOpen(false); }}
                                className={`py-2 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                                    activeDrawerTab === 'riwayat'
                                        ? 'bg-card text-foreground shadow-xs'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                <History className="w-3.5 h-3.5" />
                                <span>3. Riwayat Log</span>
                            </button>
                        </div>

                        {/* TAB 1: BIODATA EDIT FORM */}
                        {activeDrawerTab === 'biodata' && (
                            <form onSubmit={handleUpdateSubmit} className="flex flex-col gap-4">
                                <div>
                                    <InputLabel htmlFor="nama_lengkap" value="Nama Lengkap Jamaah *" />
                                    <TextInput
                                        id="nama_lengkap"
                                        type="text"
                                        value={editForm.data.nama_lengkap}
                                        className="mt-1 block w-full text-xs"
                                        onChange={(e) => editForm.setData('nama_lengkap', e.target.value)}
                                        required
                                    />
                                    <InputError message={editForm.errors.nama_lengkap} className="mt-1" />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <InputLabel htmlFor="nik" value="NIK / Nomor KTP (16 Digit)" />
                                        <TextInput
                                            id="nik"
                                            type="text"
                                            value={editForm.data.nik}
                                            className="mt-1 block w-full text-xs font-mono"
                                            onChange={(e) => editForm.setData('nik', e.target.value)}
                                            placeholder="3201xxxxxxxxxxxx"
                                            maxLength={16}
                                        />
                                        <InputError message={editForm.errors.nik} className="mt-1" />
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="no_hp" value="Nomor Handphone / WA *" />
                                        <TextInput
                                            id="no_hp"
                                            type="text"
                                            value={editForm.data.no_hp}
                                            className="mt-1 block w-full text-xs"
                                            onChange={(e) => editForm.setData('no_hp', e.target.value)}
                                            required
                                            placeholder="0812xxxxxxxx"
                                        />
                                        <InputError message={editForm.errors.no_hp} className="mt-1" />
                                    </div>
                                </div>

                                <div>
                                    <InputLabel htmlFor="email" value="Alamat Email (Opsional)" />
                                    <TextInput
                                        id="email"
                                        type="email"
                                        value={editForm.data.email}
                                        className="mt-1 block w-full text-xs"
                                        onChange={(e) => editForm.setData('email', e.target.value)}
                                        placeholder="nama@email.com"
                                    />
                                    <InputError message={editForm.errors.email} className="mt-1" />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <InputLabel htmlFor="nomor_paspor" value="Nomor Paspor Riil" />
                                        <TextInput
                                            id="nomor_paspor"
                                            type="text"
                                            value={editForm.data.nomor_paspor}
                                            className="mt-1 block w-full text-xs font-mono uppercase"
                                            onChange={(e) => editForm.setData('nomor_paspor', e.target.value.toUpperCase())}
                                            placeholder="Contoh: A 1234567"
                                        />
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="tanggal_keberangkatan" value="Plotting Tanggal Keberangkatan" />
                                        <TextInput
                                            id="tanggal_keberangkatan"
                                            type="date"
                                            value={editForm.data.tanggal_keberangkatan}
                                            className="mt-1 block w-full text-xs"
                                            onChange={(e) => editForm.setData('tanggal_keberangkatan', e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <InputLabel htmlFor="catatan_admin" value="Keterangan / Catatan Khusus Operasional" />
                                    <textarea
                                        id="catatan_admin"
                                        rows={3}
                                        value={editForm.data.catatan_admin}
                                        onChange={(e) => editForm.setData('catatan_admin', e.target.value)}
                                        className="mt-1 block w-full text-xs rounded-xl border border-border bg-background p-2.5 text-foreground focus:ring-primary focus:border-primary"
                                        placeholder="Contoh: Permintaan sekamar dengan suami/istri, kursi roda di bandara, alergi makanan..."
                                    />
                                    <InputError message={editForm.errors.catatan_admin} className="mt-1" />
                                </div>

                                <SheetFooter className="mt-2">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="px-4 py-2 border border-border rounded-xl text-sm font-medium"
                                    >
                                        Batal
                                    </button>
                                    <PrimaryButton disabled={editForm.processing}>
                                        Simpan Biodata &amp; Keterangan
                                    </PrimaryButton>
                                </SheetFooter>
                            </form>
                        )}

                        {/* TAB 2: FINANCIAL & PAYMENT SETTLEMENT */}
                        {activeDrawerTab === 'financial' && (
                            <div className="flex flex-col gap-4">
                                <div className="p-4 rounded-2xl bg-muted/40 border border-border/80 flex flex-col gap-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                                            <Receipt className="w-4 h-4 text-primary" />
                                            Histori Pembayaran Masuk
                                        </span>
                                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                            Total: {toRupiah(totalPaid)} / {toRupiah(packagePrice)}
                                        </span>
                                    </div>

                                    <div className="divide-y divide-border/60 bg-card rounded-xl border border-border/70 overflow-hidden">
                                        {(customer.pembayaran || []).map((pay, idx) => (
                                            <div key={pay.id} className="p-3 flex justify-between items-center text-xs">
                                                <div>
                                                    <div className="font-bold text-foreground">
                                                        Pembayaran #{idx + 1} - {pay.tipe_pembayaran}
                                                    </div>
                                                    <div className="text-[11px] text-muted-foreground">
                                                        {new Date(pay.created_at).toLocaleString('id-ID', {
                                                            day: 'numeric',
                                                            month: 'short',
                                                            year: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                        })}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-extrabold text-foreground">{toRupiah(pay.nominal)}</div>
                                                    <span className="text-[10px] font-bold text-emerald-600">Terverifikasi</span>
                                                </div>
                                            </div>
                                        ))}
                                        {(customer.pembayaran || []).length === 0 && (
                                            <div className="p-4 text-center text-xs text-muted-foreground italic">
                                                Belum ada transaksi pembayaran terverifikasi.
                                            </div>
                                        )}
                                    </div>

                                    {remaining > 0 ? (
                                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs p-3 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                                            <div>
                                                <span className="text-muted-foreground">Sisa Tagihan Belum Lunas:</span>
                                                <div className="text-base font-extrabold text-amber-600 dark:text-amber-400">
                                                    {toRupiah(remaining)}
                                                </div>
                                            </div>
                                            {!isAddPaymentOpen && (
                                                <button
                                                    type="button"
                                                    onClick={() => setIsAddPaymentOpen(true)}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground font-semibold rounded-lg text-xs hover:opacity-90 transition cursor-pointer shadow-xs"
                                                >
                                                    <PlusCircle className="w-4 h-4" />
                                                    <span>Catat Pelunasan / Cicilan</span>
                                                </button>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-bold p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                                            <CheckCircle2 className="w-4 h-4" />
                                            <span>Paket ini telah LUNAS 100%.</span>
                                        </div>
                                    )}

                                    {isAddPaymentOpen && (
                                        <form onSubmit={handlePaymentSubmit} className="p-4 rounded-xl bg-card border border-primary/30 flex flex-col gap-3.5 shadow-sm mt-2">
                                            <div className="flex justify-between items-center pb-2 border-b border-border/60">
                                                <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                                                    <Receipt className="w-4 h-4 text-primary" />
                                                    Input Transaksi Pelunasan / Cicilan
                                                </h4>
                                                <button
                                                    type="button"
                                                    onClick={() => setIsAddPaymentOpen(false)}
                                                    className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                                                >
                                                    Tutup Form
                                                </button>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                <div>
                                                    <InputLabel htmlFor="nominal" value="Nominal Pembayaran (Rp) *" />
                                                    <CurrencyInput
                                                        id="nominal"
                                                        value={paymentForm.data.nominal}
                                                        onChange={(val) => paymentForm.setData('nominal', val)}
                                                        placeholder="Rp 0"
                                                        className="mt-1 block w-full text-xs font-bold"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <InputLabel htmlFor="tipe_pembayaran" value="Tipe Transaksi *" />
                                                    <select
                                                        id="tipe_pembayaran"
                                                        value={paymentForm.data.tipe_pembayaran}
                                                        onChange={(e) => paymentForm.setData('tipe_pembayaran', e.target.value)}
                                                        className="mt-1 block w-full text-xs rounded-xl border border-border bg-background p-2 text-foreground"
                                                    >
                                                        <option value="Pelunasan">Pelunasan</option>
                                                        <option value="Cicilan">Cicilan</option>
                                                        <option value="DP">Uang Muka (DP)</option>
                                                        <option value="Tambahan">Biaya Tambahan</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div>
                                                <InputLabel htmlFor="rekening_tenant_id" value="Rekening Bank Tujuan *" />
                                                <select
                                                    id="rekening_tenant_id"
                                                    value={paymentForm.data.rekening_tenant_id}
                                                    onChange={(e) => paymentForm.setData('rekening_tenant_id', e.target.value)}
                                                    className="mt-1 block w-full text-xs rounded-xl border border-border bg-background p-2 text-foreground"
                                                    required
                                                >
                                                    {banks.map((b) => (
                                                        <option key={b.id} value={b.id}>
                                                            {b.nama_bank} - {b.nomor_rekening} (a.n {b.atas_nama})
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div>
                                                <InputLabel htmlFor="bukti_transfer" value="Upload Bukti Transfer (Opsional)" />
                                                <input
                                                    id="bukti_transfer"
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => paymentForm.setData('bukti_transfer', e.target.files?.[0] || null)}
                                                    className="mt-1 block w-full text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
                                                />
                                            </div>

                                            <div className="flex justify-end gap-2 pt-2 border-t border-border/60">
                                                <button
                                                    type="button"
                                                    onClick={() => setIsAddPaymentOpen(false)}
                                                    className="px-3 py-1.5 border border-border rounded-lg text-xs font-semibold"
                                                >
                                                    Batal
                                                </button>
                                                <PrimaryButton disabled={paymentForm.processing}>
                                                    Simpan &amp; Verifikasi Pembayaran
                                                </PrimaryButton>
                                            </div>
                                        </form>
                                    )}
                                </div>

                                <div className="p-4 rounded-2xl bg-muted/40 border border-border/80 flex flex-col gap-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                                            <Coins className="w-4 h-4 text-purple-600" />
                                            Informasi &amp; Pencairan Komisi Agen
                                        </span>
                                    </div>

                                    <div className="p-3 bg-card rounded-xl border border-border/70 flex flex-col gap-2 text-xs">
                                        <div className="flex justify-between items-center">
                                            <span className="text-muted-foreground">Mitra Agen Terkait:</span>
                                            <strong className="text-foreground">{customer.agen?.name || 'Direct / Kantor'}</strong>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-muted-foreground">Nominal Hak Komisi:</span>
                                            <strong className="text-purple-600 text-sm font-extrabold">
                                                {toRupiah(commissionItem?.nominal_komisi || 0)}
                                            </strong>
                                        </div>
                                        <div className="flex justify-between items-center pt-2 border-t border-border/40">
                                            <span className="text-muted-foreground">Status Pencairan:</span>
                                            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                                                commissionItem?.status_pencairan === 'Paid'
                                                    ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                                                    : commissionItem?.status_pencairan === 'Ready_to_Pay'
                                                    ? 'bg-sky-500/10 text-sky-600 border-sky-500/20'
                                                    : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                                            }`}>
                                                {commissionItem?.status_pencairan === 'Paid'
                                                    ? 'Sudah Ditransfer'
                                                    : commissionItem?.status_pencairan === 'Ready_to_Pay'
                                                    ? 'Siap Dicairkan (DP Verified)'
                                                    : 'Menunggu'}
                                            </span>
                                        </div>

                                        {commissionItem && commissionItem.status_pencairan === 'Ready_to_Pay' && (
                                            <button
                                                type="button"
                                                onClick={() => handleDisburseCommission(commissionItem.id)}
                                                className="w-full mt-2 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition cursor-pointer shadow-xs"
                                            >
                                                Cairkan / Tandai Komisi Sudah Ditransfer
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <SheetFooter className="mt-2">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="px-4 py-2 border border-border rounded-xl text-sm font-medium w-full"
                                    >
                                        Tutup
                                    </button>
                                </SheetFooter>
                            </div>
                        )}

                        {/* TAB 3: STAGE TRANSITION & NOTES LOG TIMELINE */}
                        {activeDrawerTab === 'riwayat' && (
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <History className="w-4 h-4 text-primary" />
                                        <span className="font-bold text-xs text-foreground">
                                            Riwayat Aktivitas &amp; Log Perpindahan Tahap
                                        </span>
                                    </div>
                                    <span className="text-[11px] text-muted-foreground">
                                        {(customer.stage_logs || []).length} Riwayat
                                    </span>
                                </div>

                                {(customer.stage_logs || []).length === 0 ? (
                                    <div className="p-8 text-center rounded-2xl bg-muted/30 border border-dashed border-border/80 flex flex-col items-center gap-2 text-xs text-muted-foreground">
                                        <Clock className="w-8 h-8 text-muted-foreground/50" />
                                        <span>Belum ada riwayat perpindahan tahap untuk jamaah ini.</span>
                                        <span className="text-[11px]">
                                            Setiap kali tahap CRM dipindahkan, riwayat dan catatan otomatis tercatat di sini.
                                        </span>
                                    </div>
                                ) : (
                                    <div className="relative pl-6 flex flex-col gap-4 border-l-2 border-primary/20 my-2">
                                        {(customer.stage_logs || []).map((log) => (
                                            <div key={log.id} className="relative flex flex-col gap-1.5 bg-card/60 p-3.5 rounded-xl border border-border/80 shadow-xs">
                                                {/* Timeline Dot */}
                                                <div className="absolute -left-[31px] top-4 w-3.5 h-3.5 rounded-full bg-primary border-2 border-background ring-4 ring-primary/15" />

                                                {/* Header: Stages & Time */}
                                                <div className="flex flex-wrap items-center justify-between gap-2">
                                                    <div className="flex items-center gap-1.5 flex-wrap">
                                                        {log.from_stage ? (
                                                            <>
                                                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted font-bold text-muted-foreground border border-border/60">
                                                                    {log.from_stage.nama_tahap}
                                                                </span>
                                                                <ArrowRight className="w-3 h-3 text-muted-foreground shrink-0" />
                                                            </>
                                                        ) : (
                                                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted font-bold text-muted-foreground">
                                                                Registrasi Baru
                                                            </span>
                                                        )}
                                                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 font-bold text-primary border border-primary/20">
                                                            {log.to_stage.nama_tahap}
                                                        </span>
                                                    </div>

                                                    <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-mono">
                                                        <Clock className="w-3 h-3" />
                                                        {new Date(log.created_at).toLocaleString('id-ID', {
                                                            day: 'numeric',
                                                            month: 'short',
                                                            year: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                        })}
                                                    </span>
                                                </div>

                                                {/* User Actor */}
                                                <div className="text-[11px] text-muted-foreground">
                                                    Dipindahkan oleh: <strong className="text-foreground font-semibold">{log.user?.name || 'Sistem'}</strong>
                                                </div>

                                                {/* Note / Catatan */}
                                                {log.catatan ? (
                                                    <div className="p-2.5 rounded-lg bg-muted/50 border border-border/60 text-xs text-foreground mt-1 flex items-start gap-2">
                                                        <FileText className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                                                        <span className="leading-relaxed whitespace-pre-wrap">{log.catatan}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-[11px] text-muted-foreground/70 italic">
                                                        (Tidak ada catatan)
                                                    </span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <SheetFooter className="mt-2">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="px-4 py-2 border border-border rounded-xl text-sm font-medium w-full"
                                    >
                                        Tutup
                                    </button>
                                </SheetFooter>
                            </div>
                        )}
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
}
