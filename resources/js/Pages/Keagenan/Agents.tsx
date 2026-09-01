import * as React from "react"
import { useForm } from "@inertiajs/react"
import PageLayout from "@/Components/Layouts/PageLayout"
import TextInput from "@/Components/TextInput"
import InputLabel from "@/Components/InputLabel"
import InputError from "@/Components/InputError"
import PrimaryButton from "@/Components/PrimaryButton"
import { agentSchema, zodErrors } from "@/lib/schemas"
import DataTablePagination, { PaginatedData } from "@/Components/DataTablePagination"
import PerPageSelector from "@/Components/PerPageSelector"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter,
} from "@/Components/ui/sheet"

interface Agent {
    id: number
    name: string
    email: string
    created_at: string
    jamaah_count?: number
}

interface Props {
    agents: PaginatedData<Agent>
}

export default function Agents({ agents }: Props) {
    const [isOpen, setIsOpen] = React.useState(false)
    const agentList = agents.data || []

    const { data, setData, post, processing, errors, reset, setError } = useForm({
        name: "",
        email: "",
        password: "",
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        const clientErrors = zodErrors(agentSchema, data)
        if (Object.keys(clientErrors).length > 0) { setError(clientErrors as any); return }
        post(route("keagenan.agents.store"), {
            onSuccess: () => { reset(); setIsOpen(false) },
        })
    }

    return (
        <PageLayout
            title="Daftar Mitra Agen"
            breadcrumbParent="Keagenan & Komisi"
            breadcrumbPage="Daftar Mitra Agen"
            contentClass="p-6 md:p-8 flex flex-col gap-6 w-full max-w-none"
        >
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card/60 backdrop-blur-md p-6 rounded-2xl border border-border/80 shadow-xs">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">Daftar Mitra Agen</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Kelola mitra agen perjalanan travel Anda dan lihat jumlah jamaah yang terdaftar melalui mereka.
                    </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                    <PerPageSelector value={agents.per_page} />
                    <button
                        onClick={() => setIsOpen(true)}
                        className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-xs hover:opacity-90 transition cursor-pointer shrink-0"
                    >
                        + Tambah Agen Baru
                    </button>
                </div>
            </div>

            {/* Table Card */}
            <div className="overflow-hidden rounded-2xl border border-border/80 bg-card/70 backdrop-blur-md shadow-xs">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-border/80 bg-muted/50 text-xs font-bold text-foreground">
                                <th className="px-6 py-4">Nama Agen</th>
                                <th className="px-6 py-4">Email</th>
                                <th className="px-6 py-4">Total Jamaah Closing</th>
                                <th className="px-6 py-4">Tanggal Bergabung</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60 text-xs">
                            {agentList.map((agent) => (
                                <tr key={agent.id} className="hover:bg-muted/40 transition-colors">
                                    <td className="px-6 py-4 font-bold text-foreground">
                                        <div className="flex items-center gap-2.5">
                                            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs">
                                                {agent.name.substring(0, 2).toUpperCase()}
                                            </div>
                                            <span>{agent.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-muted-foreground">{agent.email}</td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                            {agent.jamaah_count ?? 0} Jamaah
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-muted-foreground">
                                        {new Date(agent.created_at).toLocaleDateString("id-ID", {
                                            day: "numeric",
                                            month: "short",
                                            year: "numeric",
                                        })}
                                    </td>
                                </tr>
                            ))}
                            {agentList.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="py-12 text-center text-muted-foreground italic">
                                        Belum ada mitra agen yang terdaftar.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Shared Pagination */}
                <div className="border-t border-border/80 px-4 bg-muted/20">
                    <DataTablePagination
                        links={agents.links}
                        from={agents.from}
                        to={agents.to}
                        total={agents.total}
                        currentPage={agents.current_page}
                        lastPage={agents.last_page}
                    />
                </div>
            </div>

            {/* Drawer: Daftar Agen Baru */}
            <Sheet open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) reset() }}>
                <SheetContent side="right" className="w-1/2 max-w-none">
                    <SheetHeader>
                        <SheetTitle>Daftar Agen Baru</SheetTitle>
                        <SheetDescription>Isi data akun mitra agen yang akan didaftarkan ke sistem.</SheetDescription>
                    </SheetHeader>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-4 overflow-y-auto flex-1">
                        <div>
                            <InputLabel htmlFor="name" value="Nama Lengkap" />
                            <TextInput id="name" type="text" value={data.name} className="mt-1 block w-full" isFocused
                                onChange={(e) => setData("name", e.target.value)} required />
                            <InputError message={errors.name} className="mt-2" />
                        </div>
                        <div>
                            <InputLabel htmlFor="email" value="Alamat Email" />
                            <TextInput id="email" type="email" value={data.email} className="mt-1 block w-full"
                                onChange={(e) => setData("email", e.target.value)} required />
                            <InputError message={errors.email} className="mt-2" />
                        </div>
                        <div>
                            <InputLabel htmlFor="password" value="Password Sementara" />
                            <TextInput id="password" type="password" value={data.password} className="mt-1 block w-full"
                                onChange={(e) => setData("password", e.target.value)} required />
                            <InputError message={errors.password} className="mt-2" />
                        </div>
                        <SheetFooter>
                            <button type="button" onClick={() => { setIsOpen(false); reset() }}
                                className="px-4 py-2 border border-border text-foreground hover:bg-muted/40 rounded-lg text-sm transition-colors">Batal</button>
                            <PrimaryButton disabled={processing}>Simpan</PrimaryButton>
                        </SheetFooter>
                    </form>
                </SheetContent>
            </Sheet>
        </PageLayout>
    )
}
