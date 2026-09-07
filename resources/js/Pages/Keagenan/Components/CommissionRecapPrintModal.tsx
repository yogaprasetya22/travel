import * as React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/Components/ui/dialog';
import { Printer, FileSpreadsheet, Building2 } from 'lucide-react';
import CuteQrCode from '@/Components/CuteQrCode';

interface Commission {
    id: number;
    nominal_komisi: number;
    status_pencairan: 'Pending' | 'Ready_to_Pay' | 'Paid';
    nomor_referensi?: string | null;
    metode_pembayaran?: string | null;
    tanggal_pencairan?: string | null;
    created_at: string;
    agen: { name: string; email: string };
    jamaah: {
        nama_lengkap: string;
        paket?: { nama_paket: string; harga: number };
    };
}

interface CommissionRecapPrintModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    commissions: Commission[];
    stats: {
        total_paid: number;
        total_ready: number;
        total_pending: number;
    };
    tenantName?: string;
}

export default function CommissionRecapPrintModal({
    open,
    onOpenChange,
    commissions,
    stats,
    tenantName = "Travel Umroh & Haji",
}: CommissionRecapPrintModalProps) {
    const printRef = React.useRef<HTMLDivElement>(null);
    const currentDate = new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });

    const fmt = (amount: number) =>
        new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

    const handlePrint = () => {
        if (!printRef.current) return;

        const iframe = document.createElement("iframe");
        iframe.style.position = "fixed";
        iframe.style.right = "0";
        iframe.style.bottom = "0";
        iframe.style.width = "0";
        iframe.style.height = "0";
        iframe.style.border = "0";
        iframe.title = "Print Commission Recap";
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
                <title>Rekap_Komisi_Agen_${new Date().toISOString().slice(0, 10)}</title>
                ${styles}
                <style>
                    @page {
                        size: A4 landscape;
                        margin: 10mm 12mm;
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
                    .recap-print-container {
                        width: 100% !important;
                        box-sizing: border-box !important;
                    }
                    table {
                        border-collapse: collapse !important;
                        width: 100% !important;
                    }
                    th, td {
                        border: 1px solid #cbd5e1 !important;
                        padding: 6px 8px !important;
                        font-size: 11px !important;
                    }
                    th {
                        background-color: #f1f5f9 !important;
                        font-weight: 700 !important;
                        text-align: center !important;
                    }
                </style>
            </head>
            <body>
                <div class="recap-print-container">
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
            <DialogContent className="sm:max-w-6xl w-[95vw] max-h-[92vh] overflow-y-auto p-0 gap-0 border-border bg-card text-foreground low-scrollbar">
                <DialogHeader className="p-5 border-b border-border bg-muted/60  flex flex-row items-center justify-between">
                    <div>
                        <DialogTitle className="text-lg font-bold flex items-center gap-2">
                            <FileSpreadsheet className="w-5 h-5 text-primary" />
                            <span>Rekapitulasi Laporan Komisi Mitra Agen (A4 Landscape)</span>
                        </DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                            Cetak dokumen rekapitulasi data komisi agen untuk keperluan audit &amp; pembukuan keuangan bulanan.
                        </DialogDescription>
                    </div>
                    <div className="flex items-center gap-2 mr-10">
                        <button
                            onClick={handlePrint}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition cursor-pointer shadow-xs"
                        >
                            <Printer className="w-4 h-4" />
                            <span>Cetak Rekap A4</span>
                        </button>
                    </div>
                </DialogHeader>

                <div className="p-6 bg-muted/20 flex justify-center">
                    {/* Printable Sheet View */}
                    <div
                        ref={printRef}
                        className="w-full bg-white text-slate-900 p-8 rounded-xl shadow-md border border-slate-200 text-xs"
                    >
                        {/* Header Travel */}
                        <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4 mb-4">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black">
                                    <Building2 className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-black uppercase tracking-wider text-slate-900">
                                        {tenantName}
                                    </h2>
                                    <p className="text-[11px] text-slate-600 font-medium">
                                        Divisi Manajemen Kemitraan &amp; Pembagian Komisi Keagenan
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="inline-block px-2.5 py-1 bg-slate-100 text-slate-800 rounded font-bold text-[11px] border border-slate-300">
                                    LAPORAN KEUANGAN RESMI
                                </span>
                                <div className="text-[11px] text-slate-500 mt-1">Tanggal Cetak: {currentDate}</div>
                            </div>
                        </div>

                        {/* Judul Dokumen */}
                        <div className="text-center my-4">
                            <h1 className="text-base font-black uppercase tracking-wide text-slate-900">
                                REKAPITULASI PENYALURAN KOMISI MITRA AGEN
                            </h1>
                            <p className="text-[11px] text-slate-600 mt-0.5">
                                Total {commissions.length} Transaksi Pendaftaran Terdata
                            </p>
                        </div>

                        {/* Summary Metrics */}
                        <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 mb-5 text-xs">
                            <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                                <span className="text-[10px] text-slate-500 font-bold uppercase">Total Sudah Cair (Paid)</span>
                                <div className="text-base font-extrabold text-emerald-700 mt-0.5">{fmt(stats.total_paid)}</div>
                            </div>
                            <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                                <span className="text-[10px] text-slate-500 font-bold uppercase">Siap Dicairkan (Ready)</span>
                                <div className="text-base font-extrabold text-sky-700 mt-0.5">{fmt(stats.total_ready)}</div>
                            </div>
                            <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                                <span className="text-[10px] text-slate-500 font-bold uppercase">Pending DP Jamaah</span>
                                <div className="text-base font-extrabold text-amber-700 mt-0.5">{fmt(stats.total_pending)}</div>
                            </div>
                        </div>

                        {/* Table */}
                        <table className="w-full text-left border-collapse mb-6">
                            <thead>
                                <tr className="bg-slate-100 text-slate-800 font-bold">
                                    <th className="border border-slate-300 px-2 py-2 text-center w-8">No</th>
                                    <th className="border border-slate-300 px-2 py-2 text-left">Nama Mitra Agen</th>
                                    <th className="border border-slate-300 px-2 py-2 text-left">Nama Jamaah Closing</th>
                                    <th className="border border-slate-300 px-2 py-2 text-left">Paket Umroh / Haji</th>
                                    <th className="border border-slate-300 px-2 py-2 text-right w-28">Nominal Komisi</th>
                                    <th className="border border-slate-300 px-2 py-2 text-center w-24">Status</th>
                                    <th className="border border-slate-300 px-2 py-2 text-left w-32">No. Referensi</th>
                                    <th className="border border-slate-300 px-2 py-2 text-center w-24">Tanggal Cair</th>
                                </tr>
                            </thead>
                            <tbody>
                                {commissions.map((comm, idx) => (
                                    <tr key={comm.id} className="text-[11px] text-slate-800">
                                        <td className="border border-slate-300 px-2 py-2 text-center">{idx + 1}</td>
                                        <td className="border border-slate-300 px-2 py-2 font-semibold">
                                            {comm.agen?.name || "-"}
                                        </td>
                                        <td className="border border-slate-300 px-2 py-2">
                                            {comm.jamaah?.nama_lengkap || "-"}
                                        </td>
                                        <td className="border border-slate-300 px-2 py-2 text-slate-600">
                                            {comm.jamaah?.paket?.nama_paket || "-"}
                                        </td>
                                        <td className="border border-slate-300 px-2 py-2 text-right font-bold">
                                            {fmt(comm.nominal_komisi)}
                                        </td>
                                        <td className="border border-slate-300 px-2 py-2 text-center">
                                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${comm.status_pencairan === 'Paid'
                                                ? 'bg-emerald-100 text-emerald-800'
                                                : comm.status_pencairan === 'Ready_to_Pay'
                                                    ? 'bg-sky-100 text-sky-800'
                                                    : 'bg-amber-100 text-amber-800'
                                                }`}>
                                                {comm.status_pencairan === 'Paid' ? 'Paid' : comm.status_pencairan === 'Ready_to_Pay' ? 'Ready' : 'Pending'}
                                            </span>
                                        </td>
                                        <td className="border border-slate-300 px-2 py-2 font-mono text-[10px]">
                                            {comm.nomor_referensi || "-"}
                                        </td>
                                        <td className="border border-slate-300 px-2 py-2 text-center text-[10px] text-slate-600">
                                            {comm.tanggal_pencairan
                                                ? new Date(comm.tanggal_pencairan).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
                                                : "-"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Signatures & QR Code */}
                        <div className="grid grid-cols-3 gap-6 mt-8 pt-4 border-t border-slate-300 items-end">
                            <div className="text-center">
                                <div className="text-[10px] text-slate-500 uppercase font-semibold">Dibuat Oleh (Finance &amp; Pajak)</div>
                                <div className="h-16 flex items-center justify-center">
                                    <span className="text-[10px] text-slate-300 italic">(Tanda Tangan)</span>
                                </div>
                                <div className="border-t border-slate-400 pt-1 font-semibold text-slate-800">
                                    ( ..................................... )
                                </div>
                            </div>

                            <div className="text-center">
                                <div className="text-[10px] text-slate-500 uppercase font-semibold">Disetujui Oleh (Pimpinan Travel)</div>
                                <div className="h-16 flex items-center justify-center">
                                    <span className="text-[10px] text-slate-300 italic">(Tanda Tangan)</span>
                                </div>
                                <div className="border-t border-slate-400 pt-1 font-semibold text-slate-800">
                                    ( ..................................... )
                                </div>
                            </div>

                            <div className="flex flex-col items-center justify-center text-center">
                                <CuteQrCode
                                    value={`/commissions/recap?date=${new Date().toISOString().slice(0, 10)}`}
                                    size={64}
                                    color="#0f172a"
                                />
                                <span className="text-[9px] text-slate-400 font-mono mt-1">Verifikasi Rekapitulasi</span>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
