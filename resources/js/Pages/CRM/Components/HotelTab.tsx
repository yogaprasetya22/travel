import * as React from "react"
import { router, useForm } from "@inertiajs/react"
import { Pencil, Trash2 } from "lucide-react"
import {
    AddButton, EmptyState, Field, FormSheet, SearchBox, SourceFields, cardClass, formatRupiah,
    iconButtonClass, sumberLabel, tdClass, thClass, toolbarClass, usePaged,
} from "./CatalogShared"

export interface HotelItem {
    id: number
    nama: string
    kota: string
    bintang: number | null
    alamat: string | null
    jarak_ke_masjid: number | null
    harga_per_malam: number | null
    sumber: string
    sumber_ref: string | null
    sumber_url: string | null
}

const empty = {
    nama: "", kota: "", bintang: "", alamat: "", jarak_ke_masjid: "", harga_per_malam: "",
    sumber: "manual", sumber_ref: "", sumber_url: "",
}

export default function HotelTab({ items, sumberOptions }: { items: HotelItem[]; sumberOptions: string[] }) {
    const [editing, setEditing] = React.useState<HotelItem | null>(null)
    const [open, setOpen] = React.useState(false)
    const [search, setSearch] = React.useState("")
    const form = useForm(empty)

    const filtered = React.useMemo(() => {
        const q = search.trim().toLowerCase()
        return q ? items.filter((i) => `${i.nama} ${i.kota}`.toLowerCase().includes(q)) : items
    }, [items, search])
    const { slice, pager, reset } = usePaged(filtered)

    const openForm = (item: HotelItem | null) => {
        setEditing(item)
        form.clearErrors()
        form.setData(item ? {
            nama: item.nama, kota: item.kota, bintang: item.bintang?.toString() ?? "",
            alamat: item.alamat ?? "", jarak_ke_masjid: item.jarak_ke_masjid?.toString() ?? "",
            harga_per_malam: item.harga_per_malam?.toString() ?? "", sumber: item.sumber,
            sumber_ref: item.sumber_ref ?? "", sumber_url: item.sumber_url ?? "",
        } : empty)
        setOpen(true)
    }

    const submit = (e: React.FormEvent) => {
        e.preventDefault()
        const options = { preserveScroll: true, onSuccess: () => setOpen(false) }
        if (editing) {
            form.put(route("crm.hotel.update", editing.id), options)
        } else {
            form.post(route("crm.hotel.store"), options)
        }
    }

    const remove = (item: HotelItem) => {
        if (confirm(`Hapus hotel ${item.nama}?`)) {
            router.delete(route("crm.hotel.destroy", item.id), {
                preserveScroll: true,
                onError: (errors) => alert(errors.hapus ?? "Gagal menghapus."),
            })
        }
    }

    const set = (key: keyof typeof empty) => (value: string) => form.setData(key, value)

    return (
        <div className="flex flex-col gap-4">
            <div className={toolbarClass}>
                <SearchBox value={search} onChange={(v) => { setSearch(v); reset() }} placeholder="Cari nama hotel atau kota..." />
                <AddButton label="Tambah Hotel" onClick={() => openForm(null)} />
            </div>

            <div className={`overflow-hidden ${cardClass}`}>
                {slice.length === 0 ? (
                    <EmptyState>{items.length === 0 ? "Belum ada hotel. Tambahkan satu, lalu pilih di keberangkatan." : "Tidak ada hotel yang cocok."}</EmptyState>
                ) : (
                    <div className="overflow-x-auto low-scrollbar">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-border/80 bg-muted/50 text-xs font-bold text-foreground">
                                    <th className={thClass}>Hotel</th>
                                    <th className={thClass}>Kota</th>
                                    <th className={`${thClass} text-right`}>Jarak ke Masjid</th>
                                    <th className={`${thClass} text-right`}>Harga / Malam</th>
                                    <th className={thClass}>Sumber</th>
                                    <th className={`${thClass} text-center`}>Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/60 text-xs">
                                {slice.map((item) => (
                                    <tr key={item.id} className="hover:bg-muted/40 transition-colors">
                                        <td className={tdClass}>
                                            <div className="font-bold text-foreground">{item.nama}</div>
                                            {item.bintang ? <div className="text-[11px] text-muted-foreground mt-0.5">{"★".repeat(item.bintang)}</div> : null}
                                        </td>
                                        <td className={`${tdClass} font-medium text-foreground`}>{item.kota}</td>
                                        <td className={`${tdClass} text-right text-muted-foreground`}>{item.jarak_ke_masjid != null ? `${item.jarak_ke_masjid} m` : "-"}</td>
                                        <td className={`${tdClass} text-right whitespace-nowrap`}>{formatRupiah(item.harga_per_malam)}</td>
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
                title={editing ? `Ubah ${editing.nama}` : "Tambah Hotel"}
                description="Data hotel ini bisa dipakai ulang di banyak keberangkatan.">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                        <Field id="nama" label="Nama Hotel *" value={form.data.nama} error={form.errors.nama} onChange={set("nama")} required />
                    </div>
                    <Field id="kota" label="Kota *" value={form.data.kota} error={form.errors.kota} onChange={set("kota")} required placeholder="Makkah" />
                    <Field id="bintang" label="Bintang (1-5)" type="number" value={form.data.bintang} error={form.errors.bintang} onChange={set("bintang")} />
                    <Field id="jarak_ke_masjid" label="Jarak ke Masjid (meter)" type="number" value={form.data.jarak_ke_masjid} error={form.errors.jarak_ke_masjid} onChange={set("jarak_ke_masjid")} />
                    <Field id="harga_per_malam" label="Harga per Malam (Rp)" type="number" value={form.data.harga_per_malam} error={form.errors.harga_per_malam} onChange={set("harga_per_malam")} />
                    <div className="sm:col-span-2">
                        <Field id="alamat" label="Alamat" value={form.data.alamat} error={form.errors.alamat} onChange={set("alamat")} />
                    </div>
                </div>
                <SourceFields data={form.data} errors={form.errors} options={sumberOptions} set={(k, v) => form.setData(k, v)} />
            </FormSheet>
        </div>
    )
}
