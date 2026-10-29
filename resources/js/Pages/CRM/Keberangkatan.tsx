import * as React from "react"
import { router, useForm } from "@inertiajs/react"
import PageLayout from "@/Components/Layouts/PageLayout"
import TextInput from "@/Components/TextInput"
import InputLabel from "@/Components/InputLabel"
import InputError from "@/Components/InputError"
import PrimaryButton from "@/Components/PrimaryButton"
import SecondaryButton from "@/Components/SecondaryButton"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/Components/ui/tabs"
import { Plus, Plane, Hotel as HotelIcon, Pencil, Trash2, CalendarDays, DoorOpen, Armchair, Users } from "lucide-react"
import { useDebounce } from "@/hooks/use-debounce"
import DataTablePagination, { PaginatedData } from "@/Components/DataTablePagination"
import PerPageSelector from "@/Components/PerPageSelector"
import PenerbanganTab, { Penerbangan } from "./Components/PenerbanganTab"
import HotelTab, { HotelItem } from "./Components/HotelTab"
import {
    AddButton, EmptyState, Field, FormSheet, SearchBox, cardClass, filterClass, formatDate, iconButtonClass,
    selectClass, tdClass, thClass, toolbarClass,
} from "./Components/CatalogShared"

interface Keberangkatan {
    id: number
    kode: string
    paket_id: number | null
    paket?: { id: number; nama_paket: string } | null
    tanggal_berangkat: string
    tanggal_pulang: string
    status: string
    kuota: number | null
    muthawwif: string | null
    tour_leader: string | null
    transportasi: string | null
    catatan: string | null
    penerbangan: (Penerbangan & { pivot: { arah: "pergi" | "pulang" } })[]
    hotel: (HotelItem & { pivot: { check_in: string | null; check_out: string | null } })[]
}

interface Props {
    keberangkatan: PaginatedData<Keberangkatan>
    metrics: { total: number; terbuka: number; penuh: number; total_kuota: number }
    penerbangan: Penerbangan[]
    hotel: HotelItem[]
    pakets: { id: number; nama_paket: string }[]
    statuses: string[]
    sumberOptions: string[]
    filters: { search: string; status: string; per_page: number }
}

interface FlightRow { id: number | ""; arah: "pergi" | "pulang" }
interface HotelRow { id: number | ""; check_in: string; check_out: string }

const statusTone: Record<string, string> = {
    Draft: "bg-muted text-muted-foreground",
    Terbuka: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    Penuh: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    Berangkat: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
    Selesai: "bg-muted text-muted-foreground",
}

const emptyForm = {
    kode: "", paket_id: "" as number | "", tanggal_berangkat: "", tanggal_pulang: "",
    status: "Draft", kuota: "", muthawwif: "", tour_leader: "", transportasi: "", catatan: "",
    penerbangan: [] as FlightRow[],
    hotel: [] as HotelRow[],
}

export default function KeberangkatanPage({ keberangkatan, metrics, penerbangan, hotel, pakets, statuses, sumberOptions, filters }: Props) {
    const [tab, setTab] = React.useState("keberangkatan")
    const [editing, setEditing] = React.useState<Keberangkatan | null>(null)
    const [open, setOpen] = React.useState(false)
    const [search, setSearch] = React.useState(filters.search)
    const form = useForm(emptyForm)
    const debouncedSearch = useDebounce(search, 350)

    React.useEffect(() => {
        if (debouncedSearch !== filters.search) {
            applyFilters({ search: debouncedSearch })
        }
    }, [debouncedSearch])

    const applyFilters = (next: Partial<Props["filters"]>) => {
        router.get(route("crm.keberangkatan.index"), { ...filters, page: 1, ...next }, { preserveState: true, preserveScroll: true, replace: true })
    }

    const openForm = (item: Keberangkatan | null) => {
        setEditing(item)
        form.clearErrors()
        form.setData(item ? {
            kode: item.kode, paket_id: item.paket_id ?? "", tanggal_berangkat: item.tanggal_berangkat,
            tanggal_pulang: item.tanggal_pulang, status: item.status, kuota: item.kuota?.toString() ?? "",
            muthawwif: item.muthawwif ?? "", tour_leader: item.tour_leader ?? "",
            transportasi: item.transportasi ?? "", catatan: item.catatan ?? "",
            penerbangan: item.penerbangan.map((p) => ({ id: p.id, arah: p.pivot.arah })),
            hotel: item.hotel.map((h) => ({ id: h.id, check_in: h.pivot.check_in ?? "", check_out: h.pivot.check_out ?? "" })),
        } : emptyForm)
        setOpen(true)
    }

    const submit = (e: React.FormEvent) => {
        e.preventDefault()
        const options = { preserveScroll: true, onSuccess: () => setOpen(false) }
        if (editing) {
            form.put(route("crm.keberangkatan.update", editing.id), options)
        } else {
            form.post(route("crm.keberangkatan.store"), options)
        }
    }

    const remove = (item: Keberangkatan) => {
        if (confirm(`Hapus keberangkatan ${item.kode}?`)) {
            router.delete(route("crm.keberangkatan.destroy", item.id), { preserveScroll: true })
        }
    }

    const set = (key: keyof typeof emptyForm) => (value: string) => form.setData(key, value as never)
    const err = (key: string) => (form.errors as Record<string, string | undefined>)[key]

    const setFlight = (i: number, patch: Partial<FlightRow>) =>
        form.setData("penerbangan", form.data.penerbangan.map((r, idx) => (idx === i ? { ...r, ...patch } : r)))
    const setHotel = (i: number, patch: Partial<HotelRow>) =>
        form.setData("hotel", form.data.hotel.map((r, idx) => (idx === i ? { ...r, ...patch } : r)))

    return (
        <PageLayout
            title="Paket Keberangkatan"
            breadcrumbParent="CRM & Jamaah"
            breadcrumbPage="Paket Keberangkatan"
            contentClass="p-6 md:p-8 flex flex-col gap-6 w-full max-w-none"
        >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card/60 backdrop-blur-md p-6 rounded-2xl border border-border/80 shadow-xs">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">Paket Keberangkatan</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Susun jadwal keberangkatan jamaah dari katalog penerbangan dan hotel: tanggal, pesawat, hotel Makkah &amp; Madinah, serta petugas.
                    </p>
                </div>
                <AddButton label="Tambah Keberangkatan" onClick={() => { setTab("keberangkatan"); openForm(null) }} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "Total Keberangkatan", value: metrics.total, unit: "Paket", icon: CalendarDays, tone: "bg-primary/10 text-primary" },
                    { label: "Terbuka untuk Pendaftaran", value: metrics.terbuka, unit: "Paket", icon: DoorOpen, tone: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
                    { label: "Kuota Penuh", value: metrics.penuh, unit: "Paket", icon: Users, tone: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
                    { label: "Total Kuota Seat", value: metrics.total_kuota.toLocaleString("id-ID"), unit: "Seat", icon: Armchair, tone: "bg-sky-500/10 text-sky-600 dark:text-sky-400" },
                ].map((card) => (
                    <div key={card.label} className="bg-card/70 border border-border/80 rounded-2xl p-5 shadow-xs flex items-center gap-4">
                        <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${card.tone}`}>
                            <card.icon className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="text-xs font-semibold text-muted-foreground">{card.label}</div>
                            <div className="text-2xl font-extrabold text-foreground mt-0.5">{card.value} <span className="text-xs font-normal text-muted-foreground">{card.unit}</span></div>
                        </div>
                    </div>
                ))}
            </div>

            <Tabs value={tab} onValueChange={(v) => setTab(String(v))} className="flex flex-col gap-4 w-full">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <TabsList className="flex flex-row items-center justify-start p-1 bg-card/60 backdrop-blur-md rounded-2xl border border-border/80 shadow-xs gap-1 h-auto overflow-x-auto low-scrollbar w-full sm:w-auto">
                        {[
                            { value: "keberangkatan", label: "Keberangkatan", count: keberangkatan.total, icon: CalendarDays },
                            { value: "penerbangan", label: "Penerbangan", count: penerbangan.length, icon: Plane },
                            { value: "hotel", label: "Hotel", count: hotel.length, icon: HotelIcon },
                        ].map((t) => (
                            <TabsTrigger
                                key={t.value}
                                value={t.value}
                                className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer text-foreground/80 hover:bg-muted hover:text-foreground border-0 shadow-none after:hidden shrink-0 data-[active]:bg-primary data-[active]:text-primary-foreground data-[active]:shadow-xs"
                            >
                                <t.icon className="w-4 h-4 shrink-0" />
                                <span className="whitespace-nowrap">{t.label} ({t.count})</span>
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    {tab === "keberangkatan" && (
                        <div className="pb-2 sm:pb-0 flex items-center gap-3 self-end sm:self-auto">
                            <PerPageSelector value={keberangkatan.per_page} options={[10, 15, 25, 50, 100]} />
                        </div>
                    )}
                </div>

                <TabsContent value="keberangkatan" className="flex flex-col gap-4 m-0 outline-none">
                    <div className={toolbarClass}>
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1">
                            <SearchBox value={search} onChange={setSearch} placeholder="Cari kode, paket, muthawwif..." />
                            <select value={filters.status} onChange={(e) => applyFilters({ status: e.target.value })} className={filterClass}>
                                <option value="ALL">Semua Status</option>
                                {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className={`overflow-hidden ${cardClass}`}>
                        {keberangkatan.data.length === 0 ? (
                            <EmptyState>
                                {filters.search || filters.status !== "ALL"
                                    ? "Tidak ada keberangkatan yang cocok dengan filter."
                                    : "Belum ada keberangkatan. Isi katalog penerbangan dan hotel dulu, lalu tambahkan keberangkatan."}
                            </EmptyState>
                        ) : (
                            <div className="overflow-x-auto low-scrollbar">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-border/80 bg-muted/50 text-xs font-bold text-foreground">
                                            <th className={thClass}>Kode &amp; Paket</th>
                                            <th className={thClass}>Tanggal</th>
                                            <th className={thClass}>Pesawat</th>
                                            <th className={thClass}>Hotel</th>
                                            <th className={thClass}>Petugas</th>
                                            <th className={thClass}>Status</th>
                                            <th className={`${thClass} text-center`}>Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/60 text-xs">
                                        {keberangkatan.data.map((item) => (
                                            <tr key={item.id} className="hover:bg-muted/40 transition-colors align-top">
                                                <td className={tdClass}>
                                                    <div className="font-mono font-bold text-primary">{item.kode}</div>
                                                    <div className="text-[11px] text-muted-foreground mt-0.5">{item.paket?.nama_paket ?? "Tanpa paket"}</div>
                                                </td>
                                                <td className={`${tdClass} whitespace-nowrap`}>
                                                    <div className="font-medium text-foreground">{formatDate(item.tanggal_berangkat)}</div>
                                                    <div className="text-[11px] text-muted-foreground mt-0.5">s/d {formatDate(item.tanggal_pulang)}</div>
                                                </td>
                                                <td className={tdClass}>
                                                    {item.penerbangan.length === 0 && <span className="text-muted-foreground">-</span>}
                                                    {item.penerbangan.map((p) => (
                                                        <div key={p.id} className="flex items-center gap-1.5 text-foreground">
                                                            <Plane className="w-3 h-3 text-muted-foreground shrink-0" />
                                                            <span className="text-muted-foreground">{p.pivot.arah === "pergi" ? "Pergi" : "Pulang"}</span>
                                                            <span className="font-medium">{p.maskapai} {p.nomor_penerbangan}</span>
                                                        </div>
                                                    ))}
                                                </td>
                                                <td className={tdClass}>
                                                    {item.hotel.length === 0 && <span className="text-muted-foreground">-</span>}
                                                    {item.hotel.map((h) => (
                                                        <div key={h.id} className="flex items-center gap-1.5 text-foreground">
                                                            <HotelIcon className="w-3 h-3 text-muted-foreground shrink-0" />
                                                            <span className="text-muted-foreground">{h.kota}</span>
                                                            <span className="font-medium">{h.nama}</span>
                                                        </div>
                                                    ))}
                                                </td>
                                                <td className={tdClass}>
                                                    <div className="font-medium text-foreground">{item.muthawwif ?? "-"}</div>
                                                    <div className="text-[11px] text-muted-foreground mt-0.5">{item.transportasi ?? ""}</div>
                                                </td>
                                                <td className={tdClass}>
                                                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-bold ${statusTone[item.status] ?? statusTone.Draft}`}>{item.status}</span>
                                                    {item.kuota ? <div className="mt-1 text-[11px] text-muted-foreground">Kuota {item.kuota} seat</div> : null}
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
                        <div className="border-t border-border/80 px-4 bg-muted/20">
                            <DataTablePagination
                                links={keberangkatan.links}
                                from={keberangkatan.from}
                                to={keberangkatan.to}
                                total={keberangkatan.total}
                                currentPage={keberangkatan.current_page}
                                lastPage={keberangkatan.last_page}
                            />
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="penerbangan" className="m-0 outline-none">
                    <PenerbanganTab items={penerbangan} sumberOptions={sumberOptions} />
                </TabsContent>
                <TabsContent value="hotel" className="m-0 outline-none">
                    <HotelTab items={hotel} sumberOptions={sumberOptions} />
                </TabsContent>
            </Tabs>

            <FormSheet open={open} onOpenChange={setOpen} processing={form.processing} onSubmit={submit}
                title={editing ? `Ubah ${editing.kode}` : "Tambah Keberangkatan"}
                description="Pilih penerbangan dan hotel dari katalog.">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field id="kode" label="Kode Keberangkatan *" value={form.data.kode} error={form.errors.kode} onChange={set("kode")} required placeholder="KBR-DES26-A" />
                    <div>
                        <InputLabel htmlFor="paket_id" value="Paket" />
                        <select id="paket_id" className={selectClass} value={form.data.paket_id} onChange={(e) => form.setData("paket_id", e.target.value ? Number(e.target.value) : "")}>
                            <option value="">Tanpa paket</option>
                            {pakets.map((p) => <option key={p.id} value={p.id}>{p.nama_paket}</option>)}
                        </select>
                        <InputError message={form.errors.paket_id} className="mt-1" />
                    </div>
                    <Field id="tanggal_berangkat" label="Tanggal Berangkat *" type="date" value={form.data.tanggal_berangkat} error={form.errors.tanggal_berangkat} onChange={set("tanggal_berangkat")} required />
                    <Field id="tanggal_pulang" label="Tanggal Pulang *" type="date" value={form.data.tanggal_pulang} error={form.errors.tanggal_pulang} onChange={set("tanggal_pulang")} required />
                    <div>
                        <InputLabel htmlFor="status" value="Status" />
                        <select id="status" className={selectClass} value={form.data.status} onChange={(e) => form.setData("status", e.target.value)}>
                            {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <InputError message={form.errors.status} className="mt-1" />
                    </div>
                    <Field id="kuota" label="Kuota Seat" type="number" value={form.data.kuota} error={form.errors.kuota} onChange={set("kuota")} />
                </div>

                <fieldset className="flex flex-col gap-3">
                    <legend className="mb-2 text-sm font-semibold">Penerbangan</legend>
                    {form.data.penerbangan.map((row, i) => (
                        <div key={i} className="grid grid-cols-6 gap-2 rounded-md border p-3">
                            <div className="col-span-2">
                                <InputLabel value="Arah" />
                                <select className={selectClass} value={row.arah} onChange={(e) => setFlight(i, { arah: e.target.value as "pergi" | "pulang" })}>
                                    <option value="pergi">Pergi</option>
                                    <option value="pulang">Pulang</option>
                                </select>
                            </div>
                            <div className="col-span-3">
                                <InputLabel value="Penerbangan *" />
                                <select className={selectClass} value={row.id} onChange={(e) => setFlight(i, { id: e.target.value ? Number(e.target.value) : "" })}>
                                    <option value="">Pilih dari katalog</option>
                                    {penerbangan.map((p) => <option key={p.id} value={p.id}>{p.maskapai} {p.nomor_penerbangan} ({p.bandara_asal}→{p.bandara_tujuan})</option>)}
                                </select>
                                <InputError message={err(`penerbangan.${i}.id`)} className="mt-1" />
                            </div>
                            <div className="flex items-end justify-end">
                                <button type="button" onClick={() => form.setData("penerbangan", form.data.penerbangan.filter((_, idx) => idx !== i))} className="p-2 hover:text-destructive" aria-label="Lepas penerbangan"><Trash2 className="size-4" /></button>
                            </div>
                        </div>
                    ))}
                    <SecondaryButton type="button" onClick={() => form.setData("penerbangan", [...form.data.penerbangan, { id: "", arah: form.data.penerbangan.length ? "pulang" : "pergi" }])}>
                        <Plus className="size-4 mr-1" /> Tambah Penerbangan
                    </SecondaryButton>
                </fieldset>

                <fieldset className="flex flex-col gap-3">
                    <legend className="mb-2 text-sm font-semibold">Hotel</legend>
                    {form.data.hotel.map((row, i) => (
                        <div key={i} className="grid grid-cols-2 sm:grid-cols-6 gap-2 rounded-md border p-3">
                            <div className="col-span-2 sm:col-span-6">
                                <InputLabel value="Hotel *" />
                                <select className={selectClass} value={row.id} onChange={(e) => setHotel(i, { id: e.target.value ? Number(e.target.value) : "" })}>
                                    <option value="">Pilih dari katalog</option>
                                    {hotel.map((h) => <option key={h.id} value={h.id}>{h.kota}: {h.nama}{h.bintang ? ` (${h.bintang}★)` : ""}</option>)}
                                </select>
                                <InputError message={err(`hotel.${i}.id`)} className="mt-1" />
                            </div>
                            <div className="sm:col-span-3">
                                <InputLabel value="Check-in" />
                                <TextInput type="date" className="mt-1 w-full text-xs" value={row.check_in} onChange={(e) => setHotel(i, { check_in: e.target.value })} />
                            </div>
                            <div className="sm:col-span-2">
                                <InputLabel value="Check-out" />
                                <TextInput type="date" className="mt-1 w-full text-xs" value={row.check_out} onChange={(e) => setHotel(i, { check_out: e.target.value })} />
                                <InputError message={err(`hotel.${i}.check_out`)} className="mt-1" />
                            </div>
                            <div className="flex items-end justify-end">
                                <button type="button" onClick={() => form.setData("hotel", form.data.hotel.filter((_, idx) => idx !== i))} className="p-2 hover:text-destructive" aria-label="Lepas hotel"><Trash2 className="size-4" /></button>
                            </div>
                        </div>
                    ))}
                    <SecondaryButton type="button" onClick={() => form.setData("hotel", [...form.data.hotel, { id: "", check_in: "", check_out: "" }])}>
                        <Plus className="size-4 mr-1" /> Tambah Hotel
                    </SecondaryButton>
                </fieldset>

                <fieldset className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <legend className="mb-2 text-sm font-semibold">Petugas &amp; Transportasi</legend>
                    <Field id="muthawwif" label="Muthawwif" value={form.data.muthawwif} error={form.errors.muthawwif} onChange={set("muthawwif")} />
                    <Field id="tour_leader" label="Tour Leader" value={form.data.tour_leader} error={form.errors.tour_leader} onChange={set("tour_leader")} />
                    <Field id="transportasi" label="Transportasi Darat" value={form.data.transportasi} error={form.errors.transportasi} onChange={set("transportasi")} placeholder="Bus AC Full" />
                </fieldset>

                <div>
                    <InputLabel htmlFor="catatan" value="Catatan" />
                    <textarea id="catatan" rows={3} className={selectClass} value={form.data.catatan} onChange={(e) => form.setData("catatan", e.target.value)} />
                    <InputError message={form.errors.catatan} className="mt-1" />
                </div>
            </FormSheet>
        </PageLayout>
    )
}
