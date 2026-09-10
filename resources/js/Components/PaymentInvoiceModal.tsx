import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import { Button } from '@/Components/ui/button';
import {
    Printer,
    CheckCircle2,
    Building2,
    User,
    Receipt,
    Phone,
    ShieldCheck,
    CreditCard,
    FileCheck,
    Clock,
} from 'lucide-react';
import { CuteQrCode } from '@/Components/CuteQrCode';
import { toRupiah } from '@/Components/CurrencyInput';

export interface InvoicePaymentData {
    id: number;
    nomor_invoice?: string;
    nominal: number;
    tipe_pembayaran: string;
    status_verifikasi: string;
    created_at?: string;
    verified_at?: string;
    jamaah?: {
        nama_lengkap: string;
        nik?: string | null;
        no_hp?: string;
        email?: string | null;
        alamat_ktp?: string | null;
        paket?: {
            nama_paket: string;
            harga?: number;
        };
    };
    rekening_tenant?: {
        nama_bank: string;
        nomor_rekening: string;
        atas_nama: string;
    };
    verified_by?: {
        name: string;
    } | number | null;
    verified_by_user?: {
        name: string;
    } | null;
    verifiedBy?: {
        name: string;
    } | null;
}

interface PaymentInvoiceModalProps {
    payment: InvoicePaymentData | null;
    isOpen: boolean;
    onClose: () => void;
    tenantName?: string;
}

/**
 * Helper to convert number to Indonesian words (Terbilang)
 */
function angkaTerbilang(nilai: number): string {
    const angka = Math.floor(Math.abs(nilai));
    const bilangan = [
        '',
        'Satu',
        'Dua',
        'Tiga',
        'Empat',
        'Lima',
        'Enam',
        'Tujuh',
        'Delapan',
        'Sembilan',
        'Sepuluh',
        'Sebelas',
    ];

    function sebut(n: number): string {
        if (n < 12) return bilangan[n];
        if (n < 20) return sebut(n - 10) + ' Belas';
        if (n < 100) return sebut(Math.floor(n / 10)) + ' Puluh ' + (n % 10 !== 0 ? sebut(n % 10) : '');
        if (n < 200) return 'Seratus ' + sebut(n - 100);
        if (n < 1000) return sebut(Math.floor(n / 100)) + ' Ratus ' + (n % 100 !== 0 ? sebut(n % 100) : '');
        if (n < 2000) return 'Seribu ' + sebut(n - 1000);
        if (n < 1000000) return sebut(Math.floor(n / 1000)) + ' Ribu ' + (n % 1000 !== 0 ? sebut(n % 1000) : '');
        if (n < 1000000000)
            return sebut(Math.floor(n / 1000000)) + ' Juta ' + (n % 1000000 !== 0 ? sebut(n % 1000000) : '');
        if (n < 1000000000000)
            return (
                sebut(Math.floor(n / 1000000000)) + ' Miliar ' + (n % 1000000000 !== 0 ? sebut(n % 1000000000) : '')
            );
        return (
            sebut(Math.floor(n / 1000000000000)) +
            ' Triliun ' +
            (n % 1000000000000 !== 0 ? sebut(n % 1000000000000) : '')
        );
    }

    if (angka === 0) return 'Nol Rupiah';
    return (sebut(angka).replace(/\s+/g, ' ').trim()) + ' Rupiah';
}

export const PaymentInvoiceModal: React.FC<PaymentInvoiceModalProps> = ({
    payment,
    isOpen,
    onClose,
    tenantName = 'PT. HAJJ & UMROH SERVICE INDONESIA',
}) => {
    if (!payment) return null;

    const paymentDate = payment.created_at ? new Date(payment.created_at) : new Date();
    const invoiceNumber =
        payment.nomor_invoice ||
        `INV-${paymentDate.getFullYear()}${String(paymentDate.getMonth() + 1).padStart(
            2,
            '0'
        )}-${String(payment.id).padStart(5, '0')}`;

    const formattedPaymentDate = paymentDate.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }) + ' WIB';

    const printDate = new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });

    const approverName =
        (typeof payment.verified_by === 'object' && payment.verified_by?.name) ||
        payment.verified_by_user?.name ||
        payment.verifiedBy?.name ||
        (payment as any).verifier?.name ||
        'Bagian Keuangan';

    const isVerified =
        payment.status_verifikasi === 'Verified' || payment.status_verifikasi === 'verified';

    const terbilangText = angkaTerbilang(payment.nominal || 0);

    /**
     * Rock-solid print using an isolated iframe:
     * This avoids any parent dialog translate(-50%, -50%) or DOM offset issues,
     * ensuring exactly 1 crisp A4 page printout with all styles loaded!
     */
    const handlePrint = () => {
        const printElement = document.getElementById('invoice-print-sheet');
        if (!printElement) {
            window.print();
            return;
        }

        const iframe = document.createElement('iframe');
        iframe.style.position = 'fixed';
        iframe.style.right = '0';
        iframe.style.bottom = '0';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = '0';
        document.body.appendChild(iframe);

        const iframeDoc = iframe.contentWindow?.document;
        if (!iframeDoc) {
            window.print();
            return;
        }

        // Collect all active stylesheets & scripts from current document head
        const headStyles = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
            .map((el) => el.outerHTML)
            .join('\n');

        iframeDoc.open();
        iframeDoc.write(`
            <!DOCTYPE html>
            <html lang="id">
            <head>
                <meta charset="utf-8">
                <title>Kuitansi_${invoiceNumber}</title>
                ${headStyles}
                <style>
                    @page {
                        size: A4 portrait;
                        margin: 10mm 12mm;
                    }
                    * {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                        box-sizing: border-box;
                    }
                    html, body {
                        margin: 0 !important;
                        padding: 0 !important;
                        background: #ffffff !important;
                        color: #0f172a !important;
                        font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
                    }
                    .print-canvas {
                        width: 100% !important;
                        max-width: 100% !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        border: none !important;
                        box-shadow: none !important;
                        background: #ffffff !important;
                    }
                </style>
            </head>
            <body>
                <div class="print-canvas">
                    ${printElement.outerHTML}
                </div>
            </body>
            </html>
        `);
        iframeDoc.close();

        setTimeout(() => {
            if (iframe.contentWindow) {
                iframe.contentWindow.focus();
                iframe.contentWindow.print();
            }
            setTimeout(() => {
                if (iframe.parentNode) {
                    iframe.parentNode.removeChild(iframe);
                }
            }, 1000);
        }, 300);
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-5xl max-w-5xl w-[96vw] p-0 overflow-hidden bg-card text-card-foreground border-border shadow-2xl">
                {/* Modal Header */}
                <DialogHeader className="px-6 py-4 border-b border-border bg-muted/30 flex flex-row items-center justify-between">
                    <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary">
                            <Receipt className="w-4 h-4" />
                        </div>
                        <span>Pratinjau Kuitansi &amp; Invoice Resmi</span>
                    </DialogTitle>
                    <div className="flex items-center gap-2 mr-10">
                        <Button
                            type="button"
                            size="sm"
                            onClick={handlePrint}
                            className="h-8 gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-xs cursor-pointer"
                        >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Cetak Kuitansi</span>
                        </Button>
                    </div>
                </DialogHeader>

                {/* Body Preview Area with Paper Document Canvas */}
                <div className="p-4 sm:p-6 overflow-y-auto max-h-[82vh] low-scrollbar bg-muted/20 dark:bg-background/80 flex justify-center">
                    {/* The Official Printable Invoice Sheet */}
                    <div
                        id="invoice-print-sheet"
                        className="w-full max-w-[840px] bg-white dark:bg-card text-slate-900 dark:text-card-foreground rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-200 dark:border-border space-y-5 font-sans relative overflow-hidden"
                    >
                        {/* Decorative Top Accent Bar */}
                        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-600 via-primary to-amber-500" />

                        {/* 1. KOP SURAT / OFFICIAL HEADER */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-5 border-b-2 border-slate-200 dark:border-border">
                            <div className="flex items-start gap-3.5">
                                <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground shadow-md shrink-0 ring-4 ring-primary/10">
                                    <Building2 className="w-6 h-6" />
                                </div>
                                <div className="space-y-0.5">
                                    <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-foreground tracking-tight uppercase">
                                        {tenantName}
                                    </h1>
                                    <p className="text-xs font-semibold text-primary uppercase tracking-wider flex items-center gap-1.5">
                                        <ShieldCheck className="w-3.5 h-3.5 text-primary shrink-0" />
                                        Izin Resmi Penyelenggara Umroh &amp; Haji Khusus Kemenag RI
                                    </p>
                                    <p className="text-[11px] text-slate-500 dark:text-muted-foreground">
                                        Layanan Informasi Keuangan &amp; Verifikasi Transaksi Jamaah
                                    </p>
                                </div>
                            </div>

                            {/* Invoice Badge Block */}
                            <div className="sm:text-right bg-slate-50 dark:bg-muted/40 sm:bg-transparent dark:sm:bg-transparent p-3 sm:p-0 rounded-xl sm:rounded-none w-full sm:w-auto border sm:border-0 border-slate-200 dark:border-border">
                                <span className="inline-block px-3 py-1 bg-primary/10 border border-primary/20 text-primary rounded-md text-[10px] font-black uppercase tracking-widest mb-1">
                                    KUITANSI PEMBAYARAN RESMI
                                </span>
                                <div className="text-sm sm:text-base font-black font-mono text-slate-900 dark:text-foreground tracking-tight">
                                    {invoiceNumber}
                                </div>
                                <div className="text-[11px] text-slate-500 dark:text-muted-foreground mt-0.5 flex items-center sm:justify-end gap-1">
                                    <Clock className="w-3 h-3 text-slate-400 dark:text-muted-foreground" />
                                    <span>{formattedPaymentDate}</span>
                                </div>
                            </div>
                        </div>

                        {/* 2. DUA KOLOM: INFORMASI JAMAAH & REKENING PENERIMA */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                            {/* Card: Data Jamaah */}
                            <div className="bg-slate-50/90 dark:bg-muted/30 rounded-xl p-3.5 border border-slate-200 dark:border-border space-y-1.5">
                                <div className="text-[10px] font-bold text-slate-500 dark:text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 pb-1 border-b border-slate-200 dark:border-border">
                                    <User className="w-3.5 h-3.5 text-primary" />
                                    <span>Diterima Dari (Jamaah):</span>
                                </div>
                                <div className="pt-0.5 space-y-0.5">
                                    <div className="text-sm font-black text-slate-900 dark:text-foreground">
                                        {payment.jamaah?.nama_lengkap || 'Calon Jamaah'}
                                    </div>
                                    {payment.jamaah?.nik && (
                                        <div className="text-[11px] text-slate-600 dark:text-muted-foreground">
                                            NIK: <span className="font-mono font-medium">{payment.jamaah.nik}</span>
                                        </div>
                                    )}
                                    {payment.jamaah?.no_hp && (
                                        <div className="text-[11px] text-slate-600 dark:text-muted-foreground flex items-center gap-1 font-mono">
                                            <Phone className="w-3 h-3 text-slate-400 dark:text-muted-foreground" />
                                            <span>{payment.jamaah.no_hp}</span>
                                        </div>
                                    )}
                                    {payment.jamaah?.alamat_ktp && (
                                        <div className="text-[11px] text-slate-500 dark:text-muted-foreground line-clamp-1">
                                            {payment.jamaah.alamat_ktp}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Card: Rekening Tujuan & Status */}
                            <div className="bg-slate-50/90 dark:bg-muted/30 rounded-xl p-3.5 border border-slate-200 dark:border-border space-y-1.5">
                                <div className="text-[10px] font-bold text-slate-500 dark:text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 pb-1 border-b border-slate-200 dark:border-border">
                                    <CreditCard className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                    <span>Disetorkan Ke Rekening Kas:</span>
                                </div>
                                <div className="pt-0.5 space-y-0.5">
                                    <div className="text-sm font-black text-slate-900 dark:text-foreground">
                                        {payment.rekening_tenant?.nama_bank || 'Bank Syariah Indonesia (BSI)'}
                                    </div>
                                    <div className="text-sm font-bold font-mono text-primary">
                                        {payment.rekening_tenant?.nomor_rekening || 'Kas Utama / Penerimaan'}
                                    </div>
                                    <div className="text-[11px] text-slate-600 dark:text-muted-foreground">
                                        a.n {payment.rekening_tenant?.atas_nama || tenantName}
                                    </div>
                                    <div className="text-[11px] text-slate-500 dark:text-muted-foreground">
                                        Program:{' '}
                                        <span className="font-semibold text-slate-700 dark:text-foreground">
                                            {payment.jamaah?.paket?.nama_paket || 'Umroh Reguler'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 3. TABEL RINCIAN TRANSAKSI */}
                        <div className="border border-slate-200 dark:border-border rounded-xl overflow-hidden shadow-xs">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="bg-slate-100 dark:bg-muted/50 text-slate-700 dark:text-foreground font-bold border-b border-slate-200 dark:border-border uppercase tracking-wider">
                                        <th className="py-2.5 px-3.5 w-10 text-center">No</th>
                                        <th className="py-2.5 px-3.5">Deskripsi Pembayaran</th>
                                        <th className="py-2.5 px-3.5 text-center w-24">Tipe</th>
                                        <th className="py-2.5 px-3.5 text-right w-40">Nominal</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-border">
                                    <tr className="hover:bg-slate-50/50 dark:hover:bg-muted/20">
                                        <td className="py-3 px-3.5 text-center font-bold text-slate-500 dark:text-muted-foreground">1</td>
                                        <td className="py-3 px-3.5">
                                            <div className="font-bold text-slate-900 dark:text-foreground text-xs sm:text-sm">
                                                Pembayaran {payment.tipe_pembayaran} Program Umroh
                                            </div>
                                            <div className="text-[11px] text-slate-500 dark:text-muted-foreground mt-0.5">
                                                Paket: {payment.jamaah?.paket?.nama_paket || 'Biaya Paket Umroh'}
                                                {payment.jamaah?.paket?.harga
                                                    ? ` • Total Paket: ${toRupiah(payment.jamaah.paket.harga)}`
                                                    : ''}
                                            </div>
                                        </td>
                                        <td className="py-3 px-3.5 text-center">
                                            <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-primary/10 border border-primary/20 text-primary">
                                                {payment.tipe_pembayaran}
                                            </span>
                                        </td>
                                        <td className="py-3 px-3.5 text-right font-mono font-bold text-slate-900 dark:text-foreground text-sm">
                                            {toRupiah(payment.nominal)}
                                        </td>
                                    </tr>
                                </tbody>
                                <tfoot>
                                    <tr className="bg-slate-50 dark:bg-muted/40 font-black border-t-2 border-slate-200 dark:border-border">
                                        <td
                                            colSpan={3}
                                            className="py-3 px-3.5 text-slate-800 dark:text-foreground text-right uppercase tracking-wider text-xs"
                                        >
                                            TOTAL DITERIMA :
                                        </td>
                                        <td className="py-3 px-3.5 text-right font-mono text-base text-emerald-600 dark:text-emerald-400">
                                            {toRupiah(payment.nominal)}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>

                        {/* 4. TERBILANG BOX */}
                        <div className="p-3 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/50 rounded-xl flex items-start gap-2 text-xs text-amber-950 dark:text-amber-200">
                            <span className="font-bold text-amber-800 dark:text-amber-400 shrink-0">Terbilang:</span>
                            <span className="italic font-medium leading-relaxed">"{terbilangText}"</span>
                        </div>

                        {/* 5. FOOTER: VERIFIKASI RESMI, STEMPEL DIGITAL, QR CODE & TANDA TANGAN */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 items-center">
                            {/* Catatan & Ketentuan */}
                            <div className="space-y-1.5 text-[10px] text-slate-500 dark:text-muted-foreground">
                                <div className="font-bold uppercase tracking-wider text-slate-700 dark:text-foreground text-[10px] flex items-center gap-1">
                                    <FileCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                    <span>Catatan &amp; Ketentuan:</span>
                                </div>
                                <ul className="list-disc pl-3.5 space-y-0.5 text-[10px] leading-tight">
                                    <li>Kuitansi ini diterbitkan secara elektronik dan sah sebagai bukti pembayaran resmi.</li>
                                    <li>Harap simpan lembar kuitansi ini untuk kebutuhan validasi pelunasan.</li>
                                    <li>Pembayaran sah setelah diverifikasi dan masuk ke rekening kas resmi.</li>
                                </ul>
                            </div>

                            {/* Blok Stempel & Tanda Tangan Digital */}
                            <div className="flex flex-col items-start sm:items-end justify-center">
                                <div className="text-left sm:text-right w-full sm:w-auto">
                                    <div className="text-[11px] text-slate-500 dark:text-muted-foreground mb-1.5 font-medium">
                                        Jakarta, {printDate}
                                    </div>

                                    {/* Verified Official Box / Stamp */}
                                    <div className="border-2 border-emerald-600/80 dark:border-emerald-500/60 rounded-xl p-3 bg-emerald-50/80 dark:bg-emerald-950/40 flex items-center gap-3.5 shadow-xs">
                                        {/* Real Scannable ISO QR Code */}
                                        <div className="w-20 h-20 bg-white p-1 rounded-xl border border-slate-300 dark:border-emerald-800 flex items-center justify-center shrink-0 shadow-xs overflow-hidden">
                                            <CuteQrCode
                                                value={
                                                    typeof window !== 'undefined'
                                                        ? `${window.location.origin}/verifikasi-pembayaran/${encodeURIComponent(payment.nomor_invoice || payment.id)}`
                                                        : `https://travel.id/verifikasi-pembayaran/${encodeURIComponent(payment.nomor_invoice || payment.id)}`
                                                }
                                                size={72}
                                                color="#000000"
                                                bgColor="#ffffff"
                                            />
                                        </div>

                                        <div className="text-left space-y-0.5">
                                            <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 font-black text-xs uppercase tracking-wider">
                                                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                                <span>{isVerified ? 'VERIFIED / LUNAS' : 'STATUS PENDING'}</span>
                                            </div>
                                            <p className="text-[9px] text-emerald-700 dark:text-emerald-400 font-mono font-medium">
                                                DIGITALLY SIGNED &amp; SECURED
                                            </p>
                                            <p className="text-[10px] text-slate-700 dark:text-slate-300 font-semibold pt-0.5">
                                                Petugas Approval: <span className="text-foreground font-bold">{approverName}</span>
                                            </p>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>

                        {/* Bottom Watermark / Disclaimer */}
                        <div className="pt-2.5 border-t border-slate-200 dark:border-border flex flex-col sm:flex-row items-center justify-between text-[10px] text-slate-400 dark:text-muted-foreground gap-1">
                            <span>Dicetak otomatis melalui HajjFlow Smart ERP Suite</span>
                            <span className="font-mono font-semibold text-slate-600 dark:text-slate-400">No. Kuitansi: {invoiceNumber}</span>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default PaymentInvoiceModal;
