import * as React from "react"
import { router, useForm } from "@inertiajs/react"
import { Pencil, Trash2 } from "lucide-react"
import {
    AddButton, EmptyState, Field, FormSheet, SearchBox, SourceFields, cardClass, formatRupiah,
    iconButtonClass, sumberLabel, tdClass, thClass, toolbarClass, usePaged,
} from "./CatalogShared"

export interface Penerbangan {
    id: number
    maskapai: string
    nomor_penerbangan: string
    bandara_asal: string
    bandara_tujuan: string
    waktu_berangkat: string | null
    waktu_tiba: string | null
    harga: number | null
    sumber: string
    sumber_ref: string | null
    sumber_url: string | null
}

const empty = {
    maskapai: "", nomor_penerbangan: "", bandara_asal: "CGK", bandara_tujuan: "",
    waktu_berangkat: "", waktu_tiba: "", harga: "", sumber: "manual", sumber_ref: "", sumber_url: "",
}

const formatTime = (value: string | null) =>
    value ? new Date(value).toLocaleString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "-"

export default function PenerbanganTab({ items, sumberOptions }: { items: Penerbangan[]; sumberOptions: string[] }) {
    const [editing, setEditing] = React.useState<Penerbangan | null>(null)
    const [open, setOpen] = React.useState(false)
    const [search, setSearch] = React.useState("")
    const form = useForm(empty)

    const filtered = React.useMemo(() => {
        const q = search.trim().toLowerCase()
        return q ? items.filter((i) => `${i.maskapai} ${i.nomor_penerbangan} ${i.bandara_asal} ${i.bandara_tujuan}`.toLowerCase().includes(q)) : items
    }, [items, search])
    const { slice, pager, reset } = usePaged(filtered)

    const openForm = (item: Penerbangan | null) => {
        setEditing(item)
        form.clearErrors()
        form.setData(item ? {
            maskapai: item.maskapai, nomor_penerbangan: item.nomor_penerbangan,
            bandara_asal: item.bandara_asal, bandara_tujuan: item.bandara_tujuan,
            waktu_berangkat: item.waktu_berangkat ?? "", waktu_tiba: item.waktu_tiba ?? "",
            harga: item.harga?.toString() ?? "", sumber: item.sumber,
            sumber_ref: item.sumber_ref ?? "", sumber_url: item.sumber_url ?? "",
        } : empty)
        setOpen(true)
    }

    const submit = (e: React.FormEvent) => {
        e.preventDefault()
        const options = { preserveScroll: true, onSuccess: () => setOpen(false) }
        if (editing) {
            form.put(route("crm.penerbangan.update", editing.id), options)
        } else {
            form.post(route("crm.penerbangan.store"), options)
        }
    }

    const remove = (item: Penerbangan) => {
        if (confirm(`Hapus penerbangan ${item.nomor_penerbangan}?`)) {
            router.delete(route("crm.penerbangan.destroy", item.id), {
                preserveScroll: true,
                onError: (errors) => alert(errors.hapus ?? "Gagal menghapus."),
            })
        }
    }

    const set = (key: keyof typeof empty) => (value: string) => form.setData(key, value)

    return (
        <div className="flex flex-col gap-4">
            <div className={toolbarClass}>
                <SearchBox value={search} onChange={(v) => { setSearch(v); reset() }} placeholder="Cari maskapai, nomor, bandara..." />
                <AddButton label="Tambah Penerbangan" onClick={() => openForm(null)} />
            </div>

            <div className={`overflow-hidden ${cardClass}`}>
                {slice.length === 0 ? (
                    <EmptyState>{items.length === 0 ? "Belum ada penerbangan. Tambahkan satu, lalu pilih di keberangkatan." : "Tidak ada penerbangan yang cocok."}</EmptyState>
                ) : (
                    <div className="overflow-x-auto low-scrollbar">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-border/80 bg-muted/50 text-xs font-bold text-foreground">
                                    <th className={thClass}>Penerbangan</th>
                                    <th className={thClass}>Rute</th>
                                    <th className={thClass}>Berangkat</th>
                                    <th className={thClass}>Tiba</th>
                                    <th className={`${thClass} text-right`}>Harga</th>
                                    <th className={thClass}>Sumber</th>
                                    <th className={`${thClass} text-center`}>Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/60 text-xs">
                                {slice.map((item) => (
                                    <tr key={item.id} className="hover:bg-muted/40 transition-colors">
                                        <td className={tdClass}>
                                            <div className="font-bold text-foreground">{item.maskapai}</div>
                                            <div className="font-mono font-bold text-primary">{item.nomor_penerbangan}</div>
                                        </td>
                                        <td className={`${tdClass} font-medium text-foreground`}>{item.bandara_asal} → {item.bandara_tujuan}</td>
                                        <td className={`${tdClass} whitespace-nowrap text-muted-foreground`}>{formatTime(item.waktu_berangkat)}</td>
                                        <td className={`${tdClass} whitespace-nowrap text-muted-foreground`}>{formatTime(item.waktu_tiba)}</td>
                                        <td className={`${tdClass} text-right whitespace-nowrap`}>{formatRupiah(item.harga)}</td>
                                        <td className={tdClass}>
                                            {item.sumber_url
                                                ? <a href={item.sumber_url} target="_blank" rel="noreferrer" className="text-primary hover:underline">{sumberLabel[item.sumber] ?? item.sumber}</a>
                                                : <span className="text-muted-foreground">{sumberLabel[item.sumber] ?? item.sumber}</span>}
                                        </td>
                                        <td className={`${tdClass} whitespace-nowrap text-center`}>
                                            <button onClick={() => openForm(item)} className={iconButtonClass} aria-label="Ubah"><Pencil className="size-4" /></button>
                                            <button onClick={() => remove(item)} className={`${iconButtonClass} hover:text-destructive`} aria-label="Hapus"><Trash2 className="size-4" /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                {pager}
            </div>

            <FormSheet open={open} onOpenChange={setOpen} processing={form.processing} onSubmit={submit}
                title={editing ? `Ubah ${editing.nomor_penerbangan}` : "Tambah Penerbangan"}
                description="Data penerbangan ini bisa dipakai ulang di banyak keberangkatan.">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field id="maskapai" label="Maskapai *" value={form.data.maskapai} error={form.errors.maskapai} onChange={set("maskapai")} required placeholder="Saudia" />
                    <Field id="nomor_penerbangan" label="No. Penerbangan *" value={form.data.nomor_penerbangan} error={form.errors.nomor_penerbangan} onChange={set("nomor_penerbangan")} required placeholder="SV817" />
                    <Field id="bandara_asal" label="Bandara Asal *" value={form.data.bandara_asal} error={form.errors.bandara_asal} onChange={set("bandara_asal")} required />
                    <Field id="bandara_tujuan" label="Bandara Tujuan *" value={form.data.bandara_tujuan} error={form.errors.bandara_tujuan} onChange={set("bandara_tujuan")} required placeholder="JED" />
                    <Field id="waktu_berangkat" label="Waktu Berangkat" type="datetime-local" value={form.data.waktu_berangkat} error={form.errors.waktu_berangkat} onChange={set("waktu_berangkat")} />
                    <Field id="waktu_tiba" label="Waktu Tiba" type="datetime-local" value={form.data.waktu_tiba} error={form.errors.waktu_tiba} onChange={set("waktu_tiba")} />
                    <Field id="harga" label="Harga per Orang (Rp)" type="number" value={form.data.harga} error={form.errors.harga} onChange={set("harga")} />
                </div>
                <SourceFields data={form.data} errors={form.errors} options={sumberOptions} set={(k, v) => form.setData(k, v)} />
            </FormSheet>
        </div>
    )
}
