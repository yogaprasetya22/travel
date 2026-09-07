import * as React from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/Components/ui/dialog"
import { Printer, ClipboardCheck, Building2 } from "lucide-react"
import CuteQrCode from "@/Components/CuteQrCode"

interface InventoryItem {
    id: number
    sku?: string | null
    nama_barang: string
    kategori: string
    satuan: string
    stok_tersedia: number
    stok_minimum: number
    lokasi_rak?: string | null
}

interface StockOpnamePrintModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    items: InventoryItem[]
    tenantName?: string
}

export default function StockOpnamePrintModal({
    open,
    onOpenChange,
    items,
    tenantName = "Travel Umroh & Haji",
}: StockOpnamePrintModalProps) {
    const printRef = React.useRef<HTMLDivElement>(null)
    const currentDate = new Date().toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
    })

    const handlePrint = () => {
        if (!printRef.current) return

        const iframe = document.createElement("iframe")
        iframe.style.position = "fixed"
        iframe.style.right = "0"
        iframe.style.bottom = "0"
        iframe.style.width = "0"
        iframe.style.height = "0"
        iframe.style.border = "0"
        iframe.title = "Print Stock Opname"
        document.body.appendChild(iframe)

        const doc = iframe.contentWindow?.document
        if (!doc) return

        const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
            .map((el) => el.outerHTML)
            .join("\n")

        doc.open()
        doc.write(`
            <!DOCTYPE html>
            <html lang="id">
            <head>
                <meta charset="utf-8">
                <title>Lembar_Stok_Opname_${new Date().toISOString().slice(0, 10)}</title>
                ${styles}
                <style>
                    @page {
                        size: A4 portrait;
                        margin: 12mm 15mm;
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
                    .opname-print-container {
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
                <div class="opname-print-container">
                    ${printRef.current.innerHTML}
                </div>
            </body>
            </html>
        `)
        doc.close()

        setTimeout(() => {
            iframe.contentWindow?.focus()
            iframe.contentWindow?.print()
            setTimeout(() => {
                document.body.removeChild(iframe)
            }, 1000)
        }, 300)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-5xl w-[95vw] max-h-[92vh] overflow-y-auto p-0 gap-0 border-border bg-card text-foreground low-scrollbar">
                <DialogHeader className="p-5 border-b border-border bg-muted/60  flex flex-row items-center justify-between">
                    <div>
                        <DialogTitle className="text-lg font-bold flex items-center gap-2">
                            <ClipboardCheck className="w-5 h-5 text-primary" />
                            <span>Lembar Audit Fisik Stok Opname (A4)</span>
                        </DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                            Cetak dokumen formulir audit fisik inventaris &amp; pengecekan stok aktual gudang.
                        </DialogDescription>
                    </div>
                    <div className="flex items-center gap-2 mr-10">
                        <button
                            onClick={handlePrint}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition cursor-pointer shadow-xs"
                        >
                            <Printer className="w-4 h-4" />
                            <span>Cetak Formulir A4</span>
                        </button>
                    </div>
                </DialogHeader>

                <div className="p-6 bg-muted/20 flex justify-center">
                    {/* Printable Sheet View */}
                    <div
                        ref={printRef}
                        className="w-full bg-white text-slate-900 p-6 sm:p-8 rounded-xl shadow-md border border-slate-200 text-xs"
                        style={{ minHeight: "800px" }}
                    >
                        {/* Header Travel */}
                        <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4 mb-4">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-lg">
                                    <Building2 className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-black uppercase tracking-wider text-slate-900">
                                        {tenantName}
                                    </h2>
                                    <p className="text-[11px] text-slate-600 font-medium">
                                        Divisi Manajemen Logistik &amp; Perlengkapan Jamaah
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="inline-block px-2.5 py-1 bg-slate-100 text-slate-800 rounded font-bold text-[11px] border border-slate-300">
                                    DOKUMEN AUDIT RESMI
                                </span>
                                <div className="text-[11px] text-slate-500 mt-1">Tanggal: {currentDate}</div>
                            </div>
                        </div>

                        {/* Title Document */}
                        <div className="text-center my-4">
                            <h1 className="text-base font-black uppercase tracking-wide text-slate-900">
                                LEMBAR KERJA AUDIT FISIK STOK OPNAME GUDANG
                            </h1>
                            <p className="text-[11px] text-slate-600 mt-0.5">
                                Verifikasi Kesesuaian Saldo Sistem ERP dengan Kuantitas Fisik Aktual
                            </p>
                        </div>

                        {/* Metadata Box */}
                        <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 rounded border border-slate-200 mb-5 text-[11px]">
                            <div>
                                <span className="text-slate-500">Petugas Auditor / PIC:</span>
                                <div className="font-semibold text-slate-800 mt-0.5 border-b border-dotted border-slate-400 pb-0.5">
                                    ..................................................
                                </div>
                            </div>
                            <div>
                                <span className="text-slate-500">Lokasi / Area Gudang:</span>
                                <div className="font-semibold text-slate-800 mt-0.5 border-b border-dotted border-slate-400 pb-0.5">
                                    Semua Lokasi Rak
                                </div>
                            </div>
                            <div>
                                <span className="text-slate-500">Total Item Terdaftar:</span>
                                <div className="font-bold text-slate-900 mt-0.5">{items.length} Master SKU</div>
                            </div>
                        </div>

                        {/* Table */}
                        <table className="w-full text-left border-collapse mb-6">
                            <thead>
                                <tr className="bg-slate-100 text-slate-800 font-bold">
                                    <th className="border border-slate-300 px-2 py-2 text-center w-8">No</th>
                                    <th className="border border-slate-300 px-2 py-2 text-left">SKU / Kode</th>
                                    <th className="border border-slate-300 px-2 py-2 text-left">Nama Barang Perlengkapan</th>
                                    <th className="border border-slate-300 px-2 py-2 text-left">Lokasi Rak</th>
                                    <th className="border border-slate-300 px-2 py-2 text-center w-20">Stok Sistem</th>
                                    <th className="border border-slate-300 px-2 py-2 text-center w-24">Hitung Fisik</th>
                                    <th className="border border-slate-300 px-2 py-2 text-center w-16">Selisih</th>
                                    <th className="border border-slate-300 px-2 py-2 text-left w-28">Kondisi / Ket.</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item, idx) => (
                                    <tr key={item.id} className="text-[11px] text-slate-800">
                                        <td className="border border-slate-300 px-2 py-2 text-center">{idx + 1}</td>
                                        <td className="border border-slate-300 px-2 py-2 font-mono font-semibold">
                                            {item.sku || `INV-${item.id}`}
                                        </td>
                                        <td className="border border-slate-300 px-2 py-2 font-medium">
                                            <div>{item.nama_barang}</div>
                                            <div className="text-[10px] text-slate-500 font-normal">
                                                {item.kategori} ({item.satuan || "Pcs"})
                                            </div>
                                        </td>
                                        <td className="border border-slate-300 px-2 py-2 text-slate-600">
                                            {item.lokasi_rak || "Gudang Utama"}
                                        </td>
                                        <td className="border border-slate-300 px-2 py-2 text-center font-bold">
                                            {item.stok_tersedia} {item.satuan || "Pcs"}
                                        </td>
                                        {/* Blank column for manual physical count */}
                                        <td className="border border-slate-300 px-2 py-2 bg-slate-50/50 text-center font-bold text-slate-400">
                                            [ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ]
                                        </td>
                                        {/* Difference column */}
                                        <td className="border border-slate-300 px-2 py-2 bg-slate-50/50 text-center text-slate-400">
                                            &nbsp;
                                        </td>
                                        <td className="border border-slate-300 px-2 py-2 bg-slate-50/50 text-slate-400">
                                            &nbsp;
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Signatures & QR Code */}
                        <div className="grid grid-cols-4 gap-4 mt-8 pt-4 border-t border-slate-300 items-end">
                            <div className="text-center">
                                <div className="text-[10px] text-slate-500 uppercase font-semibold">Petugas Auditor Fisik</div>
                                <div className="h-16 flex items-center justify-center">
                                    <span className="text-[10px] text-slate-300 italic">(Tanda Tangan)</span>
                                </div>
                                <div className="border-t border-slate-400 pt-1 font-semibold text-slate-800">
                                    ( ..................................... )
                                </div>
                            </div>

                            <div className="text-center">
                                <div className="text-[10px] text-slate-500 uppercase font-semibold">Kepala Gudang / Logistik</div>
                                <div className="h-16 flex items-center justify-center">
                                    <span className="text-[10px] text-slate-300 italic">(Tanda Tangan)</span>
                                </div>
                                <div className="border-t border-slate-400 pt-1 font-semibold text-slate-800">
                                    ( ..................................... )
                                </div>
                            </div>

                            <div className="text-center">
                                <div className="text-[10px] text-slate-500 uppercase font-semibold">Pimpinan / Keuangan</div>
                                <div className="h-16 flex items-center justify-center">
                                    <span className="text-[10px] text-slate-300 italic">(Tanda Tangan)</span>
                                </div>
                                <div className="border-t border-slate-400 pt-1 font-semibold text-slate-800">
                                    ( ..................................... )
                                </div>
                            </div>

                            <div className="flex flex-col items-center justify-center text-center">
                                <CuteQrCode
                                    value={`/inventaris/opname?date=${new Date().toISOString().slice(0, 10)}`}
                                    size={64}
                                    color="#0f172a"
                                />
                                <span className="text-[9px] text-slate-400 font-mono mt-1">Verifikasi Audit</span>
                            </div>
                        </div>

                        {/* Notes */}
                        <div className="mt-6 p-2.5 bg-slate-50 rounded border border-slate-200 text-[10px] text-slate-600">
                            <strong>Instruksi Audit:</strong> Lakukan perhitungan fisik per dus/rak secara teliti. Jika ditemukan selisih (kurang/lebih), catat nomor kardus dan keterangan kondisi (rusak/cacat pabrik). Lembar hasil audit wajib diserahkan ke bagian Finance &amp; ERP paling lambat 1x24 jam.
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
