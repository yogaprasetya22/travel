import * as React from 'react';
import { useForm, router } from '@inertiajs/react';
import PageLayout from '@/Components/Layouts/PageLayout';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import DataTablePagination, { PaginatedData } from '@/Components/DataTablePagination';
import PerPageSelector from '@/Components/PerPageSelector';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter,
} from '@/Components/ui/sheet';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/Components/ui/dialog';
import {
    Users,
    UserCheck,
    Search,
    Pen,
    Trash2,
    Plus,
    Coins,
    Calendar,
    Mail,
    CheckCircle2,
} from 'lucide-react';

interface Agent {
    id: number;
    name: string;
    email: string;
    created_at: string;
    jamaah_count?: number;
    total_komisi?: number;
}

interface Props {
    agents: PaginatedData<Agent>;
    metrics?: {
        total_agents: number;
        active_producers: number;
    };
    filters?: {
        search: string;
        per_page: number;
    };
}

export default function Agents({ agents, metrics, filters }: Props) {
    const [isCreateOpen, setIsCreateOpen] = React.useState(false);
    const [isEditOpen, setIsEditOpen] = React.useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
    const [selectedAgent, setSelectedAgent] = React.useState<Agent | null>(null);
    const [searchQuery, setSearchQuery] = React.useState(filters?.search || '');

    const agentList = agents.data || [];

    // Create Form
    const createForm = useForm({
        name: '',
        email: '',
        password: '',
    });

    // Edit Form
    const editForm = useForm({
        name: '',
        email: '',
        password: '',
    });

    // Delete Form
    const deleteForm = useForm({});

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            route('keagenan.agents.index'),
            { search: searchQuery || undefined },
            { preserveState: true, replace: true }
        );
    };

    const openEditModal = (agent: Agent) => {
        setSelectedAgent(agent);
        editForm.setData({
            name: agent.name,
            email: agent.email,
            password: '',
        });
        editForm.clearErrors();
        setIsEditOpen(true);
    };

    const openDeleteModal = (agent: Agent) => {
        setSelectedAgent(agent);
        setIsDeleteOpen(true);
    };

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post(route('keagenan.agents.store'), {
            onSuccess: () => {
                createForm.reset();
                setIsCreateOpen(false);
            },
        });
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedAgent) return;
        editForm.put(route('keagenan.agents.update', selectedAgent.id), {
            onSuccess: () => {
                editForm.reset();
                setIsEditOpen(false);
                setSelectedAgent(null);
            },
        });
    };

    const handleDeleteSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedAgent) return;
        deleteForm.delete(route('keagenan.agents.destroy', selectedAgent.id), {
            onSuccess: () => {
                setIsDeleteOpen(false);
                setSelectedAgent(null);
            },
        });
    };

    return (
        <PageLayout
            title="Daftar Mitra Agen"
            breadcrumbParent="Keagenan & Komisi"
            breadcrumbPage="Daftar Mitra Agen"
            contentClass="p-6 md:p-8 flex flex-col gap-6 w-full max-w-none"
        >
            {/* Header Greeting & Action */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card/60 backdrop-blur-md p-6 rounded-2xl border border-border/80 shadow-xs">
                <div>
                    <div className="flex items-center gap-2.5">
                        <div className="h-8 w-1.5 rounded-full bg-primary" />
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">Daftar Mitra Agen</h1>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 ml-4">
                        Kelola seluruh mitra agen penjualan travel, monitor perolehan jamaah closing, dan perbarui data profil akun agen.
                    </p>
                </div>
                <button
                    onClick={() => {
                        createForm.reset();
                        createForm.clearErrors();
                        setIsCreateOpen(true);
                    }}
                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground shadow-xs hover:opacity-90 transition cursor-pointer shrink-0"
                >
                    <Plus className="w-4 h-4" />
                    <span>Tambah Agen Baru</span>
                </button>
            </div>

            {/* Metrics Statistics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                <div className="bg-card/70 border border-border/80 rounded-2xl p-5 shadow-xs flex justify-between items-start">
                    <div>
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Total Mitra Agen
                        </span>
                        <h3 className="text-2xl font-extrabold text-foreground mt-1.5">
                            {metrics?.total_agents || agents.total || 0} Orang
                        </h3>
                    </div>
                    <div className="p-3 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
                        <Users className="w-6 h-6" />
                    </div>
                </div>

                <div className="bg-card/70 border border-border/80 rounded-2xl p-5 shadow-xs flex justify-between items-start">
                    <div>
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Agen Produktif (Pernah Closing)
                        </span>
                        <h3 className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1.5">
                            {metrics?.active_producers || 0} Agen
                        </h3>
                    </div>
                    <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        <UserCheck className="w-6 h-6" />
                    </div>
                </div>

                <div className="bg-card/70 border border-border/80 rounded-2xl p-5 shadow-xs flex justify-between items-start">
                    <div>
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Status Akun
                        </span>
                        <h3 className="text-2xl font-extrabold text-primary mt-1.5">
                            100% Aktif
                        </h3>
                    </div>
                    <div className="p-3 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                        <CheckCircle2 className="w-6 h-6" />
                    </div>
                </div>
            </div>

            {/* Filter Toolbar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card/60 p-4 rounded-2xl border border-border/80">
                <form onSubmit={handleSearch} className="relative w-full sm:w-80">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Cari nama agen atau email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 text-xs bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground placeholder:text-muted-foreground"
                    />
                </form>

                <PerPageSelector value={agents.per_page} />
            </div>

            {/* Table Card */}
            <div className="overflow-hidden rounded-2xl border border-border/80 bg-card/70 backdrop-blur-md shadow-xs">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-border/80 bg-muted/50 text-xs font-bold text-foreground">
                                <th className="px-6 py-4">Nama Agen</th>
                                <th className="px-6 py-4">Kontak Email</th>
                                <th className="px-6 py-4 text-center">Closing Jamaah</th>
                                <th className="px-6 py-4 text-right">Akumulasi Komisi</th>
                                <th className="px-6 py-4">Terdaftar</th>
                                <th className="px-6 py-4 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60 text-xs">
                            {agentList.map((agent) => (
                                <tr key={agent.id} className="hover:bg-muted/40 transition-colors">
                                    <td className="px-6 py-4 font-bold text-foreground">
                                        <div className="flex items-center gap-3">
                                            <div className="h-9 w-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs border border-emerald-500/20">
                                                {agent.name.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="text-foreground font-bold">{agent.name}</div>
                                                <div className="text-[10px] text-muted-foreground font-medium">Mitra Agen</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-muted-foreground">
                                        <div className="flex items-center gap-1.5">
                                            <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                                            <span>{agent.email}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-extrabold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                            {agent.jamaah_count ?? 0} Jamaah
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right font-extrabold text-primary">
                                        Rp {Number(agent.total_komisi || 0).toLocaleString('id-ID')}
                                    </td>
                                    <td className="px-6 py-4 text-muted-foreground">
                                        <div className="flex items-center gap-1.5">
                                            <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                                            <span>
                                                {new Date(agent.created_at).toLocaleDateString('id-ID', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric',
                                                })}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => openEditModal(agent)}
                                                className="p-2 rounded-xl bg-muted hover:bg-muted/80 text-foreground transition cursor-pointer border border-border"
                                                title="Edit Akun Agen"
                                            >
                                                <Pen className="w-3.5 h-3.5 text-primary" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => openDeleteModal(agent)}
                                                className="p-2 rounded-xl bg-destructive/10 hover:bg-destructive/20 text-destructive transition cursor-pointer border border-destructive/20"
                                                title="Hapus Agen"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {agentList.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="py-12 text-center text-muted-foreground italic">
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

            {/* DRAWER: TAMBAH AGEN BARU */}
            <Sheet open={isCreateOpen} onOpenChange={(open) => { setIsCreateOpen(open); if (!open) createForm.reset(); }}>
                <SheetContent side="right" className="w-full sm:max-w-md">
                    <SheetHeader>
                        <SheetTitle>Tambah Mitra Agen Baru</SheetTitle>
                        <SheetDescription>Daftarkan akun mitra agen baru untuk travel aktif.</SheetDescription>
                    </SheetHeader>
                    <form onSubmit={handleCreateSubmit} className="flex flex-col gap-4 p-4 overflow-y-auto flex-1">
                        <div>
                            <InputLabel htmlFor="create-name" value="Nama Lengkap Agen" />
                            <TextInput
                                id="create-name"
                                type="text"
                                value={createForm.data.name}
                                className="mt-1 block w-full"
                                onChange={(e) => createForm.setData('name', e.target.value)}
                                placeholder="Contoh: Ahmad Subagja"
                                required
                            />
                            <InputError message={createForm.errors.name} className="mt-1" />
                        </div>
                        <div>
                            <InputLabel htmlFor="create-email" value="Alamat Email" />
                            <TextInput
                                id="create-email"
                                type="email"
                                value={createForm.data.email}
                                className="mt-1 block w-full"
                                onChange={(e) => createForm.setData('email', e.target.value)}
                                placeholder="agen@travel.com"
                                required
                            />
                            <InputError message={createForm.errors.email} className="mt-1" />
                        </div>
                        <div>
                            <InputLabel htmlFor="create-password" value="Password Akun" />
                            <TextInput
                                id="create-password"
                                type="password"
                                value={createForm.data.password}
                                className="mt-1 block w-full"
                                onChange={(e) => createForm.setData('password', e.target.value)}
                                placeholder="Minimal 8 karakter"
                                required
                            />
                            <InputError message={createForm.errors.password} className="mt-1" />
                        </div>
                        <SheetFooter className="mt-4">
                            <button
                                type="button"
                                onClick={() => { setIsCreateOpen(false); createForm.reset(); }}
                                className="px-4 py-2 border border-border text-foreground hover:bg-muted/40 rounded-xl text-xs font-semibold transition"
                            >
                                Batal
                            </button>
                            <PrimaryButton disabled={createForm.processing}>
                                {createForm.processing ? 'Menyimpan...' : 'Simpan Agen'}
                            </PrimaryButton>
                        </SheetFooter>
                    </form>
                </SheetContent>
            </Sheet>

            {/* DRAWER: EDIT MITRA AGEN */}
            <Sheet open={isEditOpen} onOpenChange={(open) => { setIsEditOpen(open); if (!open) { setSelectedAgent(null); editForm.reset(); } }}>
                <SheetContent side="right" className="w-full sm:max-w-md">
                    <SheetHeader>
                        <SheetTitle>Edit Data Mitra Agen</SheetTitle>
                        <SheetDescription>Perbarui nama, email, atau reset password mitra agen.</SheetDescription>
                    </SheetHeader>
                    <form onSubmit={handleEditSubmit} className="flex flex-col gap-4 p-4 overflow-y-auto flex-1">
                        <div>
                            <InputLabel htmlFor="edit-name" value="Nama Lengkap Agen" />
                            <TextInput
                                id="edit-name"
                                type="text"
                                value={editForm.data.name}
                                className="mt-1 block w-full"
                                onChange={(e) => editForm.setData('name', e.target.value)}
                                required
                            />
                            <InputError message={editForm.errors.name} className="mt-1" />
                        </div>
                        <div>
                            <InputLabel htmlFor="edit-email" value="Alamat Email" />
                            <TextInput
                                id="edit-email"
                                type="email"
                                value={editForm.data.email}
                                className="mt-1 block w-full"
                                onChange={(e) => editForm.setData('email', e.target.value)}
                                required
                            />
                            <InputError message={editForm.errors.email} className="mt-1" />
                        </div>
                        <div>
                            <InputLabel htmlFor="edit-password" value="Password Baru (Kosongkan jika tidak diubah)" />
                            <TextInput
                                id="edit-password"
                                type="password"
                                value={editForm.data.password}
                                className="mt-1 block w-full"
                                onChange={(e) => editForm.setData('password', e.target.value)}
                                placeholder="Kosongkan jika tetap"
                            />
                            <InputError message={editForm.errors.password} className="mt-1" />
                        </div>
                        <SheetFooter className="mt-4">
                            <button
                                type="button"
                                onClick={() => { setIsEditOpen(false); editForm.reset(); setSelectedAgent(null); }}
                                className="px-4 py-2 border border-border text-foreground hover:bg-muted/40 rounded-xl text-xs font-semibold transition"
                            >
                                Batal
                            </button>
                            <PrimaryButton disabled={editForm.processing}>
                                {editForm.processing ? 'Menyimpan...' : 'Perbarui Agen'}
                            </PrimaryButton>
                        </SheetFooter>
                    </form>
                </SheetContent>
            </Sheet>

            {/* MODAL: KONFIRMASI HAPUS AGEN */}
            <Dialog open={isDeleteOpen} onOpenChange={(open) => { setIsDeleteOpen(open); if (!open) setSelectedAgent(null); }}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-destructive flex items-center gap-2">
                            <Trash2 className="w-5 h-5" />
                            <span>Hapus Mitra Agen</span>
                        </DialogTitle>
                        <DialogDescription className="mt-2 text-xs">
                            Apakah Anda yakin ingin menghapus akun mitra agen <strong>{selectedAgent?.name}</strong> ({selectedAgent?.email})? Tindakan ini tidak dapat dibatalkan.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-4 flex gap-2 justify-end">
                        <button
                            type="button"
                            onClick={() => { setIsDeleteOpen(false); setSelectedAgent(null); }}
                            className="px-4 py-2 border border-border rounded-xl text-xs font-semibold hover:bg-muted transition"
                        >
                            Batal
                        </button>
                        <button
                            type="button"
                            onClick={handleDeleteSubmit}
                            disabled={deleteForm.processing}
                            className="px-4 py-2 bg-destructive text-destructive-foreground rounded-xl text-xs font-bold hover:opacity-90 transition"
                        >
                            {deleteForm.processing ? 'Menghapus...' : 'Ya, Hapus Agen'}
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </PageLayout>
    );
}
