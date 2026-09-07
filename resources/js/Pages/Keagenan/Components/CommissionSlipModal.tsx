import * as React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/Components/ui/dialog';
import { Printer, Receipt, Building2, CheckCircle2, CreditCard } from 'lucide-react';
import CuteQrCode from '@/Components/CuteQrCode';

interface Commission {
    id: number;
    nominal_komisi: number;
    status_pencairan: 'Pending' | 'Ready_to_Pay' | 'Paid';
    nomor_referensi?: string | null;
    metode_pembayaran?: string | null;
    catatan_pencairan?: string | null;
    tanggal_pencairan?: string | null;
    created_at: string;
    agen: {
        name: string;
        email: string;
        nama_bank?: string | null;
        nomor_rekening?: string | null;
        atas_nama_rekening?: string | null;
    };
    jamaah: {
        nama_lengkap: string;
        paket?: { nama_paket: string; harga: number };
    };
}

interface CommissionSlipModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    commission: Commission | null;
    tenantName?: string;
}

function terbilang(n: number): string {
    const angka = ["", "Satu", "Dua", "Tiga", "Empat", "Lima", "Enam", "Tujuh", "Delapan", "Sembilan", "Sepuluh", "Sebelas"];
    n = Math.floor(n);
    if (n < 12) return angka[n];
    if (n < 20) return terbilang(n - 10) + " Belas";
    if (n < 100) return terbilang(Math.floor(n / 10)) + " Puluh " + terbilang(n % 10);
    if (n < 200) return "Seratus " + terbilang(n - 100);
    if (n < 1000) return terbilang(Math.floor(n / 100)) + " Ratus " + terbilang(n % 100);
    if (n < 2000) return "Seribu " + terbilang(n - 1000);
    if (n < 1000000) return terbilang(Math.floor(n / 1000)) + " Ribu " + terbilang(n % 1000);
    if (n < 1000000000) return terbilang(Math.floor(n / 1000000)) + " Juta " + terbilang(n % 1000000);
    if (n < 1000000000000) return terbilang(Math.floor(n / 1000000000)) + " Miliar " + terbilang(n % 1000000000);
    return "";
}

export default function CommissionSlipModal({
    open,
    onOpenChange,
    commission,
    tenantName = "Travel Umroh & Haji",
}: CommissionSlipModalProps) {
    const printRef = React.useRef<HTMLDivElement>(null);

    if (!commission) return null;

    const fmt = (amount: number) =>
        new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

    const terbilangText = terbilang(commission.nominal_komisi).trim() + " Rupiah";
    const refNumber = commission.nomor_referensi || `COMM-SLIP-${commission.id}`;
    const qrPayload = `/commissions?ref=${encodeURIComponent(refNumber)}`;

    const handlePrint = () => {
        if (!printRef.current) return;

        const iframe = document.createElement("iframe");
        iframe.style.position = "fixed";
        iframe.style.right = "0";
        iframe.style.bottom = "0";
        iframe.style.width = "0";
        iframe.style.height = "0";
        iframe.style.border = "0";
        iframe.title = "Print Commission Slip";
        document.body.appendChild(iframe);

        const doc = iframe.contentWindow?.document;
        if (!doc) return;

        const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
            .map((el) => el.outerHTML)
            .join("\n");

        doc.open();
        doc.write(`
            <!DOCTYPE html>
            <html lang="id">
            <head>
                <meta charset="utf-8">
                <title>Slip_Komisi_${refNumber}</title>
                ${styles}
                <style>
                    @page {
                        size: A4 portrait;
                        margin: 15mm 20mm;
                    }
                    body {
                        margin: 0 !important;
                        padding: 0 !important;
                        background: #ffffff !important;
                        color: #0f172a !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                        font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
                    }
                    body, body * {
                        visibility: visible !important;
                    }
                    .slip-container {
                        width: 100% !important;
                        box-sizing: border-box !important;
                    }
                </style>
            </head>
            <body>
                <div class="slip-container">
                    ${printRef.current.innerHTML}
                </div>
            </body>
            </html>
        `);
        doc.close();

        setTimeout(() => {
            iframe.contentWindow?.focus();
            iframe.contentWindow?.print();
            setTimeout(() => {
                document.body.removeChild(iframe);
            }, 1000);
        }, 300);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-4xl w-[95vw] max-h-[92vh] overflow-y-auto p-0 gap-0 border-border bg-card text-foreground low-scrollbar">
                <DialogHeader className="p-5 border-b border-border bg-muted/60  flex flex-row items-center justify-between">
                    <div>
                        <DialogTitle className="text-lg font-bold flex items-center gap-2">
                            <Receipt className="w-5 h-5 text-primary" />
                            <span>Voucher Slip Bukti Pencairan Komisi</span>
                        </DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                            Slip resmi pencairan komisi kemitraan agen closing jamaah.
                        </DialogDescription>
                    </div>
                    <div className="flex items-center gap-2 mr-10">
                        <button
                            onClick={handlePrint}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition cursor-pointer shadow-xs"
                        >
                            <Printer className="w-4 h-4" />
                            <span>Cetak Voucher A4</span>
                        </button>
                    </div>
                </DialogHeader>

                <div className="p-6 bg-muted/20 flex justify-center">
                    {/* Printable Sheet View */}
                    <div
                        ref={printRef}
                        className="w-full max-w-2xl bg-white text-slate-900 p-8 rounded-2xl shadow-md border border-slate-200 text-xs flex flex-col gap-6"
                    >
                        {/* Kop Travel & Status */}
                        <div className="flex justify-between items-start border-b-2 border-slate-900 pb-5">
                            <div className="flex items-center gap-3">
                                <div className="h-11 w-11 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black">
                                    <Building2 className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-black uppercase tracking-wider text-slate-900">
                                        {tenantName}
                                    </h2>
                                    <p className="text-[11px] text-slate-600 font-medium">
                                        Divisi Manajemen Kemitraan Keagenan &amp; Finance
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold text-xs border border-emerald-300">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>LUNAS / DITRANSFER</span>
                                </span>
                                <div className="text-[11px] font-mono text-slate-500 mt-1 font-bold">
                                    {refNumber}
                                </div>
                            </div>
                        </div>

                        {/* Judul Voucher */}
                        <div className="text-center">
                            <h1 className="text-base font-black uppercase tracking-wide text-slate-900">
                                BUKTI PENCAIRAN KOMISI MITRA AGEN
                            </h1>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                                Tanggal Pencairan: {commission.tanggal_pencairan
                                    ? new Date(commission.tanggal_pencairan).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                                    : new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </p>
                        </div>

                        {/* Grid Penerima & Bank Info */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col gap-1 text-[11px]">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                    Data Mitra Agen Penerima
                                </span>
                                <div className="font-bold text-slate-900 text-sm mt-0.5">{commission.agen?.name}</div>
                                <div className="text-slate-600">{commission.agen?.email}</div>
                            </div>

                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col gap-1 text-[11px]">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                                    <CreditCard className="w-3.5 h-3.5" />
                                    <span>Rekening Tujuan Transfer</span>
                                </span>
                                <div className="font-bold text-slate-900 mt-0.5">
                                    {commission.agen?.nama_bank || commission.metode_pembayaran || "Bank Syariah Indonesia (BSI)"}
                                </div>
                                <div className="font-mono text-slate-700 font-semibold">
                                    {commission.agen?.nomor_rekening || "Rekening Terverifikasi"}
                                </div>
                                {commission.agen?.atas_nama_rekening && (
                                    <div className="text-slate-500 text-[10px]">
                                        a.n. {commission.agen.atas_nama_rekening}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Rincian Transaksi Closing */}
                        <div className="border border-slate-300 rounded-xl overflow-hidden">
                            <div className="bg-slate-100 px-4 py-2.5 font-bold text-slate-800 text-[11px] border-b border-slate-300">
                                Rincian Transaksi Closing Jamaah
                            </div>
                            <div className="p-4 flex flex-col gap-3">
                                <div className="flex justify-between items-center text-xs">
                                    <div>
                                        <div className="font-bold text-slate-900">{commission.jamaah?.nama_lengkap}</div>
                                        <div className="text-slate-500 text-[11px] mt-0.5">
                                            Paket: {commission.jamaah?.paket?.nama_paket || "Paket Umroh Reguler"}
                                        </div>
                                    </div>
                                    <span className="font-extrabold text-slate-900 text-sm">
                                        {fmt(commission.nominal_komisi)}
                                    </span>
                                </div>

                                <div className="border-t border-slate-200 pt-3 flex justify-between items-center bg-slate-50 p-3 rounded-lg">
                                    <div>
                                        <div className="font-black text-slate-900 text-xs uppercase">TOTAL KOMISI BERSIH</div>
                                        <div className="text-[10px] text-slate-500 italic mt-0.5">
                                            Terbilang: #{terbilangText}#
                                        </div>
                                    </div>
                                    <div className="text-lg font-black text-emerald-700">
                                        {fmt(commission.nominal_komisi)}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {commission.catatan_pencairan && (
                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600">
                                <strong className="text-slate-800">Catatan Transfer:</strong> {commission.catatan_pencairan}
                            </div>
                        )}

                        {/* Tanda Tangan & QR */}
                        <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200 items-end mt-4">
                            <div className="text-center">
                                <div className="text-[10px] text-slate-500 uppercase font-semibold">Penerima Komisi (Mitra Agen)</div>
                                <div className="h-16 flex items-center justify-center">
                                    <span className="text-[10px] text-slate-300 italic">(Tanda Tangan)</span>
                                </div>
                                <div className="border-t border-slate-400 pt-1 font-semibold text-slate-800">
                                    ( {commission.agen?.name} )
                                </div>
                            </div>

                            <div className="text-center">
                                <div className="text-[10px] text-slate-500 uppercase font-semibold">Bagian Keuangan / Finance</div>
                                <div className="h-16 flex items-center justify-center">
                                    <span className="text-[10px] text-slate-300 italic">(Tanda Tangan)</span>
                                </div>
                                <div className="border-t border-slate-400 pt-1 font-semibold text-slate-800">
                                    ( ..................................... )
                                </div>
                            </div>

                            <div className="flex flex-col items-center justify-center text-center">
                                <CuteQrCode value={qrPayload} size={70} color="#0f172a" />
                                <span className="text-[9px] text-slate-400 font-mono mt-1">Verifikasi Digital</span>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
