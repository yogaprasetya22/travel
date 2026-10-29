import * as React from "react"
import InputLabel from "@/Components/InputLabel"
import InputError from "@/Components/InputError"
import TextInput from "@/Components/TextInput"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/Components/ui/sheet"
import PrimaryButton from "@/Components/PrimaryButton"
import SecondaryButton from "@/Components/SecondaryButton"
import DataTablePagination from "@/Components/DataTablePagination"
import { Plus, Search } from "lucide-react"

export const selectClass =
    "mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-xs shadow-xs focus:outline-none focus:ring-2 focus:ring-ring"

export const sumberLabel: Record<string, string> = {
    manual: "Manual",
    traveloka: "Traveloka",
    agoda: "Agoda",
    tiket_com: "Tiket.com",
    lainnya: "Lainnya",
}

export const formatDate = (value: string | null) =>
    value ? new Date(value).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }) : "-"

export const formatRupiah = (value: number | null) =>
    value ? `Rp ${Math.round(value).toLocaleString("id-ID")}` : "-"

interface FieldProps {
    id: string
    label: string
    value: string | number
    error?: string
    onChange: (value: string) => void
    type?: string
    placeholder?: string
    required?: boolean
}

export function Field({ id, label, value, error, onChange, ...rest }: FieldProps) {
    return (
        <div>
            <InputLabel htmlFor={id} value={label} />
            <TextInput id={id} className="mt-1 block w-full text-xs" value={value} onChange={(e) => onChange(e.target.value)} {...rest} />
            <InputError message={error} className="mt-1" />
        </div>
    )
}

interface SourceFieldsProps {
    data: { sumber: string; sumber_ref: string; sumber_url: string }
    errors: Record<string, string | undefined>
    options: string[]
    set: (key: "sumber" | "sumber_ref" | "sumber_url", value: string) => void
}

/** Penanda asal data; dipakai nanti untuk impor dari Traveloka, Agoda, dll. */
export function SourceFields({ data, errors, options, set }: SourceFieldsProps) {
    return (
        <fieldset className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-md border p-3">
            <legend className="px-1 text-xs font-semibold">Sumber data</legend>
            <div>
                <InputLabel htmlFor="sumber" value="Asal data" />
                <select id="sumber" className={selectClass} value={data.sumber} onChange={(e) => set("sumber", e.target.value)}>
                    {options.map((o) => (
                        <option key={o} value={o}>{sumberLabel[o] ?? o}</option>
                    ))}
                </select>
                <InputError message={errors.sumber} className="mt-1" />
            </div>
            <Field id="sumber_ref" label="ID di sumber" value={data.sumber_ref} error={errors.sumber_ref} onChange={(v) => set("sumber_ref", v)} />
            <div className="sm:col-span-2">
                <Field id="sumber_url" label="Tautan sumber" type="url" value={data.sumber_url} error={errors.sumber_url} onChange={(v) => set("sumber_url", v)} placeholder="https://" />
            </div>
        </fieldset>
    )
}

interface FormSheetProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    title: string
    description: string
    processing: boolean
    onSubmit: (e: React.FormEvent) => void
    children: React.ReactNode
}

export function FormSheet({ open, onOpenChange, title, description, processing, onSubmit, children }: FormSheetProps) {
    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="w-full sm:max-w-3xl md:w-1/2 flex flex-col">
                <SheetHeader>
                    <SheetTitle>{title}</SheetTitle>
                    <SheetDescription>{description}</SheetDescription>
                </SheetHeader>
                <form onSubmit={onSubmit} className="flex flex-col gap-5 p-4 overflow-y-auto flex-1">
                    {children}
                    <div className="flex justify-end gap-2 border-t pt-4">
                        <SecondaryButton type="button" onClick={() => onOpenChange(false)}>Batal</SecondaryButton>
                        <PrimaryButton disabled={processing}>{processing ? "Menyimpan..." : "Simpan"}</PrimaryButton>
                    </div>
                </form>
            </SheetContent>
        </Sheet>
    )
}

export const cardClass = "rounded-2xl border border-border/80 bg-card/70 backdrop-blur-md shadow-xs"
export const toolbarClass = "flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card/60 backdrop-blur-md p-4 rounded-2xl border border-border/80 shadow-xs"
export const filterClass =
    "h-9 px-3 text-xs rounded-xl border border-border bg-background text-foreground hover:bg-muted/40 transition cursor-pointer shadow-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
export const thClass = "px-5 py-3.5"
export const tdClass = "px-5 py-3.5"
export const iconButtonClass = "inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground cursor-pointer"

export function AddButton({ label, onClick }: { label: string; onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs sm:text-sm font-semibold text-primary-foreground shadow-xs hover:opacity-90 transition cursor-pointer shrink-0"
        >
            <Plus className="w-4 h-4" />
            <span>{label}</span>
        </button>
    )
}

export function SearchBox({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
    return (
        <div className="relative w-full sm:w-72 shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <TextInput value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="pl-9 text-xs h-9 w-full" />
        </div>
    )
}

export function EmptyState({ children }: { children: React.ReactNode }) {
    return <div className="px-5 py-12 text-center text-sm text-muted-foreground">{children}</div>
}

/** Pagination di sisi klien untuk katalog (data sudah dimuat seluruhnya). */
export function usePaged<T>(items: T[], perPage = 10) {
    const [page, setPage] = React.useState(1)
    const lastPage = Math.max(1, Math.ceil(items.length / perPage))
    const current = Math.min(page, lastPage)
    const slice = items.slice((current - 1) * perPage, current * perPage)

    const pages = Array.from({ length: lastPage }, (_, i) => i + 1).filter((n) => n === 1 || n === lastPage || Math.abs(n - current) <= 1)
    const links = [{ url: current > 1 ? `?page=${current - 1}` : null, label: "&laquo;", active: false }]
    pages.forEach((n, idx) => {
        if (idx > 0 && n - pages[idx - 1] > 1) links.push({ url: null, label: "...", active: false })
        links.push({ url: `?page=${n}`, label: String(n), active: n === current })
    })
    links.push({ url: current < lastPage ? `?page=${current + 1}` : null, label: "&raquo;", active: false })

    const pager = (
        <div className="border-t border-border/80 px-4 bg-muted/20">
            <DataTablePagination
                links={links}
                from={items.length ? (current - 1) * perPage + 1 : 0}
                to={Math.min(current * perPage, items.length)}
                total={items.length}
                currentPage={current}
                lastPage={lastPage}
                onPageChange={setPage}
            />
        </div>
    )

    return { slice, pager, reset: () => setPage(1) }
}
