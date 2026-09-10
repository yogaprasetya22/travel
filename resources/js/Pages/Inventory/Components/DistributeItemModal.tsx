import * as React from "react"
import { useForm } from "@inertiajs/react"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter,
} from "@/Components/ui/sheet"
import TextInput from "@/Components/TextInput"
import InputLabel from "@/Components/InputLabel"
import InputError from "@/Components/InputError"
import PrimaryButton from "@/Components/PrimaryButton"
import { UserCheck, Search, Users, PackageCheck } from "lucide-react"

interface InventoryItem {
    id: number
    sku?: string | null
    nama_barang: string
    satuan: string
    stok_tersedia: number
}

interface JamaahOption {
    id: number
    nama_lengkap: string
    no_hp?: string | null
    nik?: string | null
}

interface DistributeItemModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    item: InventoryItem | null
    jamaahList: JamaahOption[]
}

export default function DistributeItemModal({
    open,
    onOpenChange,
    item,
    jamaahList,
}: DistributeItemModalProps) {
    const [searchJamaah, setSearchJamaah] = React.useState("")

    const { data, setData, post, processing, errors, reset } = useForm({
        jamaah_id: "" as string | number,
        qty: 1,
        alasan: "Distribusi perlengkapan jamaah",
    })

    React.useEffect(() => {
        if (open && item) {
            setData("alasan", `Distribusi perlengkapan ${item.nama_barang} ke jamaah`)
        }
    }, [open, item])

    if (!item) return null

    const filteredJamaah = jamaahList.filter((j) => {
        if (!searchJamaah) return true
        const q = searchJamaah.toLowerCase()
        return (
            j.nama_lengkap.toLowerCase().includes(q) ||
            (j.nik && j.nik.includes(q)) ||
            (j.no_hp && j.no_hp.includes(q))
        )
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!data.jamaah_id) return

        post(route("inventaris.distribute", item.id), {
            onSuccess: () => {
                reset()
                onOpenChange(false)
            },
        })
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="w-full sm:max-w-5xl md:w-1/2 flex flex-col">
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                        <UserCheck className="w-5 h-5 text-primary" />
                        <span>Distribusi Perlengkapan Jamaah</span>
                    </SheetTitle>
                    <SheetDescription>
                        Serahkan barang perlengkapan langsung ke jamaah terdaftar. Stok akan otomatis berkurang dan tercatat pada kartu kendali logistik jamaah.
                    </SheetDescription>
                </SheetHeader>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4 overflow-y-auto flex-1">
                    {/* Item Info Box */}
                    <div className="p-3.5 rounded-xl bg-muted/40 border border-border flex items-center justify-between gap-3 text-xs">
                        <div>
                            <span className="text-muted-foreground">Barang yang dibagikan:</span>
                            <div className="font-bold text-foreground text-sm mt-0.5">{item.nama_barang}</div>
                            <div className="font-mono text-primary text-[11px]">{item.sku || `INV-${item.id}`}</div>
                        </div>
                        <div className="text-right">
                            <span className="text-muted-foreground">Stok Tersedia:</span>
                            <div className="font-extrabold text-foreground text-base text-emerald-600 dark:text-emerald-400">
                                {item.stok_tersedia} <span className="text-xs font-normal text-muted-foreground">{item.satuan}</span>
                            </div>
                        </div>
                    </div>

                    {/* Jamaah Selector with Search */}
                    <div>
                        <InputLabel value="Pilih Jamaah Penerima *" />
                        <div className="relative mt-1.5 mb-2">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <TextInput
                                type="text"
                                value={searchJamaah}
                                onChange={(e) => setSearchJamaah(e.target.value)}
                                placeholder="Ketik nama jamaah / NIK / No. HP..."
                                className="pl-9 text-xs h-9 w-full"
                            />
                        </div>

                        <div className="max-h-48 overflow-y-auto rounded-xl border border-border bg-card divide-y divide-border/60 low-scrollbar">
                            {filteredJamaah.slice(0, 30).map((j) => {
                                const isSelected = String(data.jamaah_id) === String(j.id)
                                return (
                                    <div
                                        key={j.id}
                                        onClick={() => setData("jamaah_id", j.id)}
                                        className={`p-2.5 flex items-center justify-between cursor-pointer transition text-xs ${isSelected
                                                ? "bg-primary/15 font-semibold text-primary"
                                                : "hover:bg-muted/60 text-foreground"
                                            }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <Users className="w-3.5 h-3.5 text-muted-foreground" />
                                            <div>
                                                <div>{j.nama_lengkap}</div>
                                                <div className="text-[10px] text-muted-foreground font-normal">
                                                    {j.no_hp || "No HP -"} {j.nik ? `• NIK: ${j.nik}` : ""}
                                                </div>
                                            </div>
                                        </div>
                                        {isSelected && (
                                            <span className="text-[11px] font-bold text-primary">Terpilih ✓</span>
                                        )}
                                    </div>
                                )
                            })}
                            {filteredJamaah.length === 0 && (
                                <div className="p-4 text-center text-xs text-muted-foreground italic">
                                    Jamaah tidak ditemukan.
                                </div>
                            )}
                        </div>
                        <InputError message={errors.jamaah_id} className="mt-1" />
                    </div>

                    {/* Qty Input */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <InputLabel htmlFor="distribute_qty" value={`Jumlah Unit (${item.satuan}) *`} />
                            <TextInput
                                id="distribute_qty"
                                type="number"
                                value={data.qty}
                                className="mt-1 block w-full text-xs"
                                onChange={(e) => setData("qty", parseInt(e.target.value, 10) || 1)}
                                required
                                min={1}
                                max={item.stok_tersedia}
                            />
                            <InputError message={errors.qty} className="mt-1" />
                        </div>

                        <div>
                            <InputLabel htmlFor="distribute_notes" value="Catatan / Acara Serah Terima" />
                            <TextInput
                                id="distribute_notes"
                                type="text"
                                value={data.alasan}
                                className="mt-1 block w-full text-xs"
                                onChange={(e) => setData("alasan", e.target.value)}
                                placeholder="Contoh: Manasik Akbar / Keberangkatan"
                            />
                            <InputError message={errors.alasan} className="mt-1" />
                        </div>
                    </div>

                    <SheetFooter className="mt-auto pt-4 border-t border-border">
                        <button
                            type="button"
                            onClick={() => onOpenChange(false)}
                            className="px-4 py-2 border border-border rounded-xl text-xs font-medium cursor-pointer"
                        >
                            Batal
                        </button>
                        <PrimaryButton
                            disabled={processing || !data.jamaah_id || item.stok_tersedia < 1}
                            className="flex items-center gap-1.5"
                        >
                            <PackageCheck className="w-4 h-4" />
                            <span>Konfirmasi Distribusi</span>
                        </PrimaryButton>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    )
}
