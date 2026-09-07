import React, { useEffect, useRef, useState } from "react"
import { router } from "@inertiajs/react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/Components/ui/dialog"
import {
    Printer,
    Truck,
    MapPin,
    Phone,
    User,
    Calendar,
    Tag,
    ShieldCheck,
    CheckSquare,
    Square,
    Send,
    Loader2,
    Eye,
    EyeOff,
    FileText,
} from "lucide-react"
import CuteQrCode from "@/Components/CuteQrCode"

export interface PackageItemRow {
    id: number
    nama_barang: string
    sku?: string | null
    satuan?: string | null
    qty: number
    is_delivered?: boolean
    status?: string | null
}

export interface ShippingCustomerData {
    id: number
    nama_lengkap: string
    no_hp: string
    email?: string | null
    nik?: string | null
    nomor_paspor?: string | null
    alamat_ktp?: string | null
    alamat_domisili?: string | null
    kota_asal?: string | null
    tanggal_keberangkatan?: string | null
    status_logistik?: string | null
    ekspedisi_logistik?: string | null
    no_resi_logistik?: string | null
    paket?: {
        nama_paket: string
    } | null
    agen?: {
        name: string
        no_hp?: string | null
    } | null
}

interface Props {
    open: boolean
    onOpenChange: (open: boolean) => void
    customer: ShippingCustomerData | null
    selectedItems: PackageItemRow[]
    tenantName?: string
}

// Helpers for masking sensitive data (Shopee / Tokopedia Style Privacy)
const maskPhone = (phone?: string | null): string => {
    if (!phone) return "-"
    const cleaned = phone.replace(/[^0-9+]/g, "").trim()
    if (cleaned.length <= 6) return cleaned
    const start = cleaned.slice(0, 4)
    const end = cleaned.slice(-3)
    return `${start}****${end}`
}

export default function ShippingPackageLabelModal({
    open,
    onOpenChange,
    customer,
    selectedItems = [],
    tenantName = "Travel Umroh & Haji",
}: Props) {
    const printRef = useRef<HTMLDivElement>(null)
    const [labelFormat, setLabelFormat] = useState<"a4" | "standard_a5" | "thermal_4x6">("a4")
    const [expedition, setExpedition] = useState<string>("Kurir Internal Travel")
    const [serviceType, setServiceType] = useState<string>("REGULER / KOPER")
    const [trackingNumber, setTrackingNumber] = useState<string>("")
    const [notes, setNotes] = useState<string>("FRAGILE / JANGAN DIBANTING - DOKUMEN & KOPER UMROH")
    const [showNotes, setShowNotes] = useState<boolean>(true)
    const [maskSensitiveData, setMaskSensitiveData] = useState<boolean>(true)
    const [checkedItemIds, setCheckedItemIds] = useState<number[]>([])
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
    const [validationError, setValidationError] = useState<string | null>(null)

    useEffect(() => {
        if (open && selectedItems.length > 0) {
            const activeItemsToShip = selectedItems.filter((i) => !i.is_delivered)
            if (activeItemsToShip.length > 0) {
                setCheckedItemIds(activeItemsToShip.map((item) => item.id))
            } else {
                setCheckedItemIds(selectedItems.map((item) => item.id))
            }
        }
        if (customer) {
            if (customer.ekspedisi_logistik) {
                setExpedition(customer.ekspedisi_logistik)
            }
            if (customer.no_resi_logistik) {
                setTrackingNumber(customer.no_resi_logistik)
            } else {
                setTrackingNumber(`AWB-${customer.id}${Math.floor(100000 + Math.random() * 900000)}`)
            }
        }
    }, [open, selectedItems, customer])

    if (!customer) return null

    const toggleItem = (itemId: number) => {
        setCheckedItemIds((prev) =>
            prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
        )
    }

    const toggleAll = () => {
        if (checkedItemIds.length === shippableItems.length) {
            setCheckedItemIds([])
        } else {
            setCheckedItemIds(shippableItems.map((i) => i.id))
        }
    }

    // Items not yet delivered — the only ones that belong in a new shipment label
    const shippableItems = selectedItems.filter((i) => !i.is_delivered)

    const activeItems = selectedItems.filter((i) => checkedItemIds.includes(i.id))

    const currentDate = new Date().toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
    })

    const departureDateFormatted = customer.tanggal_keberangkatan
        ? new Date(customer.tanggal_keberangkatan).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
              year: "numeric",
          })
        : "Menunggu Jadwal"

    const fullAddress = customer.alamat_domisili || customer.alamat_ktp || "Diambil langsung di kantor pusat travel"
    const qrPayload = `/crm/logistics?jamaah=${customer.id}&resi=${encodeURIComponent(trackingNumber)}`

    // Generate simulated Code128-like Barcode SVG
    const generateBarcodeLines = (text: string) => {
        const hash = text.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
        const pattern = [2, 1, 3, 1, 2, 4, 1, 2, 1, 3, 2, 1, 4, 1, 2, 3, 1, 2, 1, 4, 2, 1, 3, 1, 2, 1, 4, 2, 1, 3, 2, 1, 4]
        return pattern.map((w, idx) => (
            <div
                key={idx}
                style={{
                    width: `${((w * ((hash % 3) + 1)) % 4) + 1.2}px`,
                    height: "100%",
                    backgroundColor: idx % 2 === 0 ? "#0f172a" : "transparent",
                    marginRight: "1px",
                }}
            />
        ))
    }

    const triggerBrowserPrint = () => {
        if (!printRef.current) return

        const iframe = document.createElement("iframe")
        iframe.style.position = "fixed"
        iframe.style.right = "0"
        iframe.style.bottom = "0"
        iframe.style.width = "0"
        iframe.style.height = "0"
        iframe.style.border = "0"
        document.body.appendChild(iframe)

        const doc = iframe.contentWindow?.document
        if (!doc) return

        const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
            .map((el) => el.outerHTML)
            .join("\n")

        const pageSizeRule =
            labelFormat === "thermal_4x6"
                ? "100mm 150mm"
                : labelFormat === "standard_a5"
                ? "A5 landscape"
                : "A4 portrait"

        doc.open()
        doc.write(`
            <!DOCTYPE html>
            <html lang="id">
            <head>
                <meta charset="utf-8">
                <title>Resi_Pengiriman_${customer.nama_lengkap.replace(/\s+/g, "_")}</title>
                ${styles}
                <style>
                    @page {
                        size: ${pageSizeRule};
                        margin: 6mm;
                    }
                    html, body {
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
                    .shipping-print-sheet {
                        width: 100% !important;
                        max-width: ${labelFormat === "a4" ? "190mm" : labelFormat === "standard_a5" ? "195mm" : "90mm"} !important;
                        margin: 0 auto !important;
                        box-sizing: border-box !important;
                        page-break-inside: avoid !important;
                        break-inside: avoid !important;
                    }
                    table {
                        border-collapse: collapse !important;
                    }
                </style>
            </head>
            <body>
                <div class="shipping-print-sheet">
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

    const handlePrintOnly = () => {
        setValidationError(null)
        triggerBrowserPrint()
    }

    const handlePrintAndShip = () => {
        if (checkedItemIds.length === 0) {
            setValidationError("Silakan pilih minimal satu barang yang ingin dikirim dalam paket ini.")
            return
        }
        setValidationError(null)

        setIsSubmitting(true)

        router.post(
            route("crm.logistics.ship-items", customer.id),
            {
                item_ids: checkedItemIds,
                ekspedisi: expedition,
                no_resi: trackingNumber,
                notes: showNotes ? notes : "",
            },
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    setIsSubmitting(false)
                    triggerBrowserPrint()
                    onOpenChange(false)
                },
                onError: () => {
                    setIsSubmitting(false)
                },
            }
        )
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-4xl w-[95vw] max-h-[94vh] overflow-y-auto p-0 gap-0 border-border bg-card text-foreground low-scrollbar">
                <DialogHeader className="p-5 border-b border-border bg-muted/60 flex flex-row items-center justify-between flex-wrap gap-3">
                    <div>
                        <DialogTitle className="text-lg font-bold flex items-center gap-2">
                            <Truck className="w-5 h-5 text-primary" />
                            <span>Label Resi Pengiriman (E-Commerce Style)</span>
                        </DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                            Format resi standar ekspedisi Shopee/Tokopedia dengan sensor privasi data sensitif &amp; 1 lembar pas tanpa overflow.
                        </DialogDescription>
                    </div>
                    <div className="flex items-center gap-2 mr-6 sm:mr-8 flex-wrap">
                        <button
                            type="button"
                            onClick={handlePrintOnly}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border bg-background hover:bg-muted text-xs font-semibold text-foreground transition cursor-pointer shadow-2xs"
                        >
                            <Printer className="w-4 h-4 text-muted-foreground" />
                            <span>Hanya Cetak</span>
                        </button>

                        <button
                            type="button"
                            disabled={isSubmitting || checkedItemIds.length === 0}
                            onClick={handlePrintAndShip}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 transition cursor-pointer shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Send className="w-4 h-4" />
                            )}
                            <span>Cetak &amp; Ubah Status Mengirim</span>
                        </button>
                    </div>
                </DialogHeader>

                {validationError && (
                    <div className="px-6 py-2 bg-destructive/10 border-b border-destructive/20 text-destructive text-xs font-semibold flex items-center justify-between">
                        <span>⚠ {validationError}</span>
                        <button
                            onClick={() => setValidationError(null)}
                            className="text-destructive font-bold text-xs hover:underline cursor-pointer"
                        >
                            Tutup
                        </button>
                    </div>
                )}

                <div className="p-4 bg-muted/30 border-b border-border flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-semibold text-muted-foreground mr-1">Ukuran Kertas:</span>
                        <button
                            onClick={() => setLabelFormat("a4")}
                            className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                                labelFormat === "a4"
                                    ? "bg-primary text-primary-foreground shadow-xs"
                                    : "bg-muted text-foreground hover:bg-muted/80"
                            }`}
                        >
                            A4 (Portrait Pas)
                        </button>
                        <button
                            onClick={() => setLabelFormat("standard_a5")}
                            className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                                labelFormat === "standard_a5"
                                    ? "bg-primary text-primary-foreground shadow-xs"
                                    : "bg-muted text-foreground hover:bg-muted/80"
                            }`}
                        >
                            A5 (Landscape)
                        </button>
                        <button
                            onClick={() => setLabelFormat("thermal_4x6")}
                            className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                                labelFormat === "thermal_4x6"
                                    ? "bg-primary text-primary-foreground shadow-xs"
                                    : "bg-muted text-foreground hover:bg-muted/80"
                            }`}
                        >
                            Resi Termal (4x6")
                        </button>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                        <div className="flex items-center gap-1.5">
                            <span className="text-muted-foreground font-semibold">Kurir:</span>
                            <select
                                value={expedition}
                                onChange={(e) => setExpedition(e.target.value)}
                                className="bg-background border border-border text-foreground rounded-lg px-2.5 py-1 text-xs font-medium"
                            >
                                <option value="JNE Express">JNE Express</option>
                                <option value="J&T Express">J&T Express</option>
                                <option value="SiCepat Ekspres">SiCepat Ekspres</option>
                                <option value="Sentral Cargo">Sentral Cargo</option>
                                <option value="Kurir Internal Travel">Kurir Internal Travel</option>
                                <option value="Diambil di Kantor Pusat">Diambil di Kantor</option>
                                <option value="Lion Parcel">Lion Parcel</option>
                                <option value="Anteraja">Anteraja</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-1.5">
                            <span className="text-muted-foreground font-semibold">No. Resi:</span>
                            <input
                                type="text"
                                value={trackingNumber}
                                onChange={(e) => setTrackingNumber(e.target.value)}
                                placeholder="Auto AWB..."
                                className="bg-background border border-border text-foreground rounded-lg px-2 py-1 text-xs w-36 font-mono font-bold"
                            />
                        </div>
                    </div>
                </div>

                <div className="px-6 py-2.5 bg-muted/20 border-b border-border flex items-center justify-between gap-3 text-xs flex-wrap">
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={toggleAll}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-background border border-border hover:bg-muted text-xs font-semibold text-foreground transition cursor-pointer"
                        >
                            {checkedItemIds.length === shippableItems.length ? (
                                <CheckSquare className="w-3.5 h-3.5 text-primary" />
                            ) : (
                                <Square className="w-3.5 h-3.5 text-muted-foreground" />
                            )}
                            <span>{checkedItemIds.length === shippableItems.length ? "Batal Centang" : "Pilih Semua"}</span>
                        </button>
                        <span className="text-muted-foreground text-[11px]">
                            (<strong>{checkedItemIds.length}</strong>/{shippableItems.length} item masuk paket)
                        </span>
                    </div>

                    <div className="flex items-center gap-4 flex-wrap">
                        <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-foreground select-none text-[11px]">
                            <input
                                type="checkbox"
                                checked={maskSensitiveData}
                                onChange={(e) => setMaskSensitiveData(e.target.checked)}
                                className="rounded border-border text-primary focus:ring-primary h-3.5 w-3.5 cursor-pointer"
                            />
                            {maskSensitiveData ? (
                                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                                    <ShieldCheck className="w-3.5 h-3.5" /> Sensor Privasi Aktif (HP/NIK)
                                </span>
                            ) : (
                                <span className="text-amber-600 flex items-center gap-1">
                                    <Eye className="w-3.5 h-3.5" /> Tampilkan No. HP Lengkap
                                </span>
                            )}
                        </label>

                        <div className="flex items-center gap-1.5">
                            <label className="flex items-center gap-1.5 cursor-pointer font-medium text-foreground select-none text-[11px]">
                                <input
                                    type="checkbox"
                                    checked={showNotes}
                                    onChange={(e) => setShowNotes(e.target.checked)}
                                    className="rounded border-border text-primary focus:ring-primary h-3.5 w-3.5 cursor-pointer"
                                />
                                <span>Peringatan Fragile</span>
                            </label>
                            {showNotes && (
                                <input
                                    type="text"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Instruksi paket..."
                                    className="bg-background border border-border text-foreground rounded-lg px-2 py-0.5 text-[11px] w-52"
                                />
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-muted/10 flex justify-center overflow-x-auto">
                    <div
                        ref={printRef}
                        className={`w-full bg-white text-slate-900 border-2 border-slate-900 rounded-xl p-4 shadow-md font-sans text-xs ${
                            labelFormat === "thermal_4x6"
                                ? "max-w-sm text-[10px]"
                                : labelFormat === "standard_a5"
                                ? "max-w-2xl text-[11px]"
                                : "max-w-3xl text-xs"
                        }`}
                    >
                        <div className="border-b-2 border-slate-900 pb-2.5 mb-2.5 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5">
                                <div className="px-3 py-1 bg-slate-950 text-white font-black text-sm uppercase rounded tracking-wider">
                                    {expedition.toUpperCase()}
                                </div>
                                <div>
                                    <div className="text-[10px] font-black uppercase text-slate-900 tracking-wider">
                                        {serviceType} &bull; NON-COD
                                    </div>
                                    <div className="text-[9px] text-slate-500 font-medium">
                                        Koli: <strong>1/1</strong> &bull; Berat: <strong>~15-20 Kg</strong> &bull; {currentDate}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 text-right">
                                <div>
                                    <div className="h-6 flex items-center justify-end overflow-hidden">
                                        {generateBarcodeLines(trackingNumber)}
                                    </div>
                                    <div className="font-mono font-black text-[11px] tracking-wider text-slate-950 mt-0.5">
                                        {trackingNumber}
                                    </div>
                                </div>
                                <div className="p-0.5 bg-slate-50 rounded border border-slate-300 shrink-0">
                                    <CuteQrCode value={qrPayload} size={42} color="#0f172a" />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 border border-slate-900 rounded-lg overflow-hidden mb-2.5 text-[10px] leading-tight">
                            {/* Left Box: Penerima (To) - Focused on Full Address */}
                            <div className="p-3 border-r border-slate-900 bg-slate-50/50 flex flex-col justify-between">
                                <div>
                                    <div className="text-[9px] font-black uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1">
                                        <User className="w-3 h-3 text-slate-700" />
                                        <span>PENERIMA (TUJUAN):</span>
                                    </div>
                                    <div className="text-sm font-black text-slate-950 uppercase tracking-tight">
                                        {customer.nama_lengkap}
                                    </div>
                                    <div className="font-mono font-bold text-slate-800 text-[11px] my-1 flex items-center gap-1">
                                        <Phone className="w-3 h-3 text-slate-600" />
                                        <span>Telp: {maskSensitiveData ? maskPhone(customer.no_hp) : customer.no_hp}</span>
                                    </div>
                                    <div className="mt-2 p-2 bg-white rounded-md border border-slate-200">
                                        <div className="text-[8px] font-bold text-slate-400 uppercase mb-0.5 flex items-center gap-1">
                                            <MapPin className="w-2.5 h-2.5 text-primary" />
                                            <span>ALAMAT PENGIRIMAN:</span>
                                        </div>
                                        <div className="text-slate-900 text-xs font-semibold leading-relaxed">
                                            {fullAddress}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Box: Pengirim (From) */}
                            <div className="p-3 bg-slate-50/50 flex flex-col justify-between">
                                <div>
                                    <div className="text-[9px] font-black uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1">
                                        <Tag className="w-3 h-3 text-slate-700" />
                                        <span>PENGIRIM (ASAL):</span>
                                    </div>
                                    <div className="text-sm font-black text-slate-950 uppercase tracking-tight">
                                        {tenantName}
                                    </div>
                                    <div className="text-[11px] text-slate-800 font-semibold mt-1">
                                        Petugas / Agen: {customer.agen?.name || "Kantor Pusat Logistik Travel"}
                                    </div>
                                    {customer.agen?.no_hp && (
                                        <div className="font-mono text-slate-700 text-[10px] mt-0.5 flex items-center gap-1">
                                            <Phone className="w-3 h-3 text-slate-500" />
                                            <span>CS: {maskSensitiveData ? maskPhone(customer.agen.no_hp) : customer.agen.no_hp}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-2 p-2 bg-white rounded-md border border-slate-200 text-[10px] text-slate-600">
                                    <div className="text-[8px] font-bold text-slate-400 uppercase mb-0.5">Layanan Ekspedisi:</div>
                                    <div className="font-bold text-slate-900">{expedition} &bull; {serviceType}</div>
                                    <div className="text-[9px] text-slate-500 mt-0.5">Tgl Kirim: {currentDate}</div>
                                </div>
                            </div>
                        </div>

                        <div className="mb-2">
                            <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-wider text-slate-700 mb-1">
                                <span>DAFTAR ISI KOLI / PERLENGKAPAN ({activeItems.length} ITEM)</span>
                                <span className="text-[8px] font-normal text-slate-500">Wajib Ceklis Fisik Saat Diterima</span>
                            </div>
                            <div className="border border-slate-900 rounded-lg overflow-hidden text-[9px]">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-100 border-b border-slate-900 font-bold text-slate-900">
                                            <th className="py-1 px-2 w-6 text-center">#</th>
                                            <th className="py-1 px-2">Nama Barang Perlengkapan</th>
                                            <th className="py-1 px-2 text-center w-16">Qty</th>
                                            <th className="py-1 px-2 text-center w-24">Kondisi</th>
                                            <th className="py-1 px-2 text-center w-12">Cek</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-300 text-slate-900 font-medium">
                                        {activeItems.map((item, idx) => (
                                            <tr key={item.id}>
                                                <td className="py-0.5 px-2 text-center font-bold text-slate-600">{idx + 1}</td>
                                                <td className="py-0.5 px-2 font-bold">
                                                    {item.nama_barang}
                                                    {item.sku && <span className="text-slate-500 font-mono font-normal ml-1">({item.sku})</span>}
                                                </td>
                                                <td className="py-0.5 px-2 text-center font-bold">
                                                    {item.qty} {item.satuan || "Pcs"}
                                                </td>
                                                <td className="py-0.5 px-2 text-center text-slate-600">Lengkap / Baru</td>
                                                <td className="py-0.5 px-2 text-center font-bold text-slate-950">[ &nbsp; ✓ &nbsp; ]</td>
                                            </tr>
                                        ))}
                                        {activeItems.length === 0 && (
                                            <tr>
                                                <td colSpan={5} className="p-2 text-center text-slate-500 italic">
                                                    Belum ada barang yang dipilih untuk dimasukkan ke paket ini.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {shippableItems.length > 0 && (
                            <div className="mb-2.5 p-2 bg-slate-50 rounded-lg border border-slate-200 print:hidden text-[10px]">
                                <div className="font-bold text-slate-700 mb-1 text-[9px]">Klik untuk memilih item yang masuk dalam paket kiriman:</div>
                                <div className="grid grid-cols-2 gap-1">
                                    {shippableItems.map((item) => {
                                        const isChecked = checkedItemIds.includes(item.id)
                                        return (
                                            <div
                                                key={item.id}
                                                onClick={() => toggleItem(item.id)}
                                                className={`p-1 rounded border flex items-center justify-between cursor-pointer transition ${
                                                    isChecked
                                                        ? "bg-emerald-50 border-emerald-400 text-emerald-950 font-bold"
                                                        : "bg-white border-slate-200 text-slate-400"
                                                }`}
                                            >
                                                <div className="flex items-center gap-1 truncate">
                                                    {isChecked ? (
                                                        <CheckSquare className="w-3 h-3 text-emerald-600 shrink-0" />
                                                    ) : (
                                                        <Square className="w-3 h-3 text-slate-400 shrink-0" />
                                                    )}
                                                    <span className="truncate">{item.nama_barang}</span>
                                                </div>
                                                <span className="text-[8px] font-mono px-1 rounded bg-slate-100 shrink-0">
                                                    {item.qty} {item.satuan || "Pcs"}
                                                </span>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )}

                        {showNotes && notes.trim() !== "" && (
                            <div className="p-1.5 bg-amber-50 rounded-lg border border-amber-400 mb-2 text-[9px] text-amber-950 font-black flex items-center justify-between">
                                <span>⚠ {notes}</span>
                                <span className="font-mono text-[8px]">ID-JMH: #{customer.id}</span>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-3 text-center text-[9px] border-t border-slate-900 pt-1.5">
                            <div className="border border-slate-300 rounded p-1.5 bg-slate-50/50">
                                <div className="text-slate-600 font-bold mb-5">Petugas Gudang / Kurir Ekspedisi</div>
                                <div className="border-t border-slate-400 mx-3 pt-0.5 font-bold text-slate-900">
                                    ( .................................................. )
                                </div>
                            </div>
                            <div className="border border-slate-300 rounded p-1.5 bg-slate-50/50">
                                <div className="text-slate-600 font-bold mb-5">Penerima / Jamaah Umroh</div>
                                <div className="border-t border-slate-400 mx-3 pt-0.5 font-bold text-slate-900">
                                    ( {customer.nama_lengkap} )
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-[7px] text-slate-400 mt-1 font-mono">
                            <span>Sistem Logistik Resmi &bull; Keamanan Data UU PDP Dilindungi</span>
                            <span>Dokumen Cetak Digital #{customer.id}-{trackingNumber}</span>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
