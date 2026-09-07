import * as React from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/Components/ui/dialog"
import { Printer, QrCode, Tag, MapPin } from "lucide-react"
import CuteQrCode from "@/Components/CuteQrCode"

interface InventoryItem {
    id: number
    sku?: string | null
    nama_barang: string
    kategori: string
    satuan: string
    lokasi_rak?: string | null
}

interface ItemBarcodeLabelModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    item: InventoryItem | null
    tenantName?: string
}

export default function ItemBarcodeLabelModal({
    open,
    onOpenChange,
    item,
    tenantName = "Travel Umroh & Haji",
}: ItemBarcodeLabelModalProps) {
    const [labelCount, setLabelCount] = React.useState<number>(6)
    const [labelType, setLabelType] = React.useState<"single_rack" | "multi_stickers">("multi_stickers")
    const printRef = React.useRef<HTMLDivElement>(null)

    if (!item) return null

    const handlePrint = () => {
        if (!printRef.current) return

        const iframe = document.createElement("iframe")
        iframe.style.position = "fixed"
        iframe.style.right = "0"
        iframe.style.bottom = "0"
        iframe.style.width = "0"
        iframe.style.height = "0"
        iframe.style.border = "0"
        iframe.title = "Print Item Labels"
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
                <title>Stiker_Label_${item.sku || item.id}</title>
                ${styles}
                <style>
                    @page {
                        size: A4 portrait;
                        margin: 10mm;
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
                    svg, img {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                        display: block !important;
                    }
                    .label-grid-container {
                        display: grid !important;
                        grid-template-columns: repeat(2, 1fr) !important;
                        gap: 12px !important;
                        width: 100% !important;
                    }
                    .single-rack-container {
                        display: flex !important;
                        justify-content: center !important;
                        padding-top: 20px !important;
                    }
                </style>
            </head>
            <body>
                <div class="${labelType === 'multi_stickers' ? 'label-grid-container' : 'single-rack-container'}">
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

    const skuText = item.sku || `INV-${item.id}`
    const qrPayload = `/inventaris?search=${encodeURIComponent(skuText)}`

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-4xl w-[95vw] max-h-[92vh] overflow-y-auto p-0 gap-0 border-border bg-card text-foreground low-scrollbar">
                <DialogHeader className="p-5 border-b border-border bg-muted/60  flex flex-row items-center justify-between">
                    <div>
                        <DialogTitle className="text-lg font-bold flex items-center gap-2">
                            <QrCode className="w-5 h-5 text-primary" />
                            <span>Cetak Stiker Label Barcode &amp; Rak Gudang</span>
                        </DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                            Format label standar untuk box logistik, koper jamaah, atau penanda rak fisik.
                        </DialogDescription>
                    </div>
                    <div className="flex items-center gap-2 mr-10">
                        <button
                            onClick={handlePrint}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition cursor-pointer shadow-xs"
                        >
                            <Printer className="w-4 h-4" />
                            <span>Cetak Label</span>
                        </button>
                    </div>
                </DialogHeader>

                {/* Settings toolbar */}
                <div className="p-4 bg-muted/30 border-b border-border flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2">
                        <span className="font-semibold text-muted-foreground">Mode Cetak:</span>
                        <button
                            onClick={() => setLabelType("multi_stickers")}
                            className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${labelType === "multi_stickers"
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-foreground hover:bg-muted/80"
                                }`}
                        >
                            Grid Stiker Barang (A4)
                        </button>
                        <button
                            onClick={() => setLabelType("single_rack")}
                            className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${labelType === "single_rack"
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-foreground hover:bg-muted/80"
                                }`}
                        >
                            Label Besar Rak Gudang
                        </button>
                    </div>

                    {labelType === "multi_stickers" && (
                        <div className="flex items-center gap-2">
                            <span className="text-muted-foreground font-semibold">Jumlah Stiker:</span>
                            {[2, 4, 6, 8, 12].map((cnt) => (
                                <button
                                    key={cnt}
                                    onClick={() => setLabelCount(cnt)}
                                    className={`px-2.5 py-1 rounded-md text-xs font-bold transition cursor-pointer ${labelCount === cnt
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                                        }`}
                                >
                                    {cnt}x
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Preview Container */}
                <div className="p-6 bg-muted/10 flex justify-center">
                    <div
                        ref={printRef}
                        className={
                            labelType === "multi_stickers"
                                ? "grid grid-cols-1 sm:grid-cols-2 gap-4 w-full"
                                : "flex justify-center w-full"
                        }
                    >
                        {labelType === "single_rack" ? (
                            /* Large Single Rack Sign */
                            <div className="w-full max-w-md bg-white text-slate-900 border-2 border-slate-900 rounded-2xl p-6 shadow-sm flex flex-col items-center text-center">
                                <div className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-1">
                                    {tenantName} • RAK PENYIMPANAN
                                </div>
                                <div className="text-xl font-black text-slate-900 leading-tight mb-2">
                                    {item.nama_barang}
                                </div>
                                <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-bold mb-4">
                                    <MapPin className="w-3.5 h-3.5 text-slate-900" />
                                    <span>{item.lokasi_rak || "Gudang Utama - Rak A"}</span>
                                </div>

                                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 mb-3">
                                    <CuteQrCode value={qrPayload} size={130} color="#0f172a" />
                                </div>

                                <div className="font-mono text-base font-black tracking-wider text-slate-900">
                                    {skuText}
                                </div>
                                <div className="text-[11px] text-slate-500 mt-1">
                                    Kategori: {item.kategori || "Perlengkapan"} • Satuan: {item.satuan || "Pcs"}
                                </div>
                            </div>
                        ) : (
                            /* Grid of Individual Item Stickers */
                            Array.from({ length: labelCount }).map((_, i) => (
                                <div
                                    key={i}
                                    className="bg-white text-slate-900 border border-slate-300 rounded-xl p-3.5 flex items-center justify-between gap-3 shadow-xs"
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="text-[9px] font-bold uppercase tracking-wider text-slate-500 truncate">
                                            {tenantName}
                                        </div>
                                        <div className="text-xs font-bold text-slate-900 truncate mt-0.5">
                                            {item.nama_barang}
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] text-slate-600 mt-1">
                                            <span className="font-mono font-bold text-slate-800">{skuText}</span>
                                            <span>•</span>
                                            <span className="truncate">{item.kategori}</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-1">
                                            <MapPin className="w-3 h-3 text-slate-600 shrink-0" />
                                            <span className="truncate">{item.lokasi_rak || "Gudang"}</span>
                                        </div>
                                    </div>

                                    <div className="shrink-0 p-1 bg-slate-50 rounded-lg border border-slate-200">
                                        <CuteQrCode value={qrPayload} size={64} color="#0f172a" />
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
