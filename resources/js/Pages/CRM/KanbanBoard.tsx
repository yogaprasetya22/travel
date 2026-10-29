import { router, useForm, usePage } from '@inertiajs/react';
import React, { useState, useMemo } from 'react';
import { CrmStage, Jamaah, PageProps } from '@/Types';
import PageLayout from '@/Components/Layouts/PageLayout';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import { crmLeadSchema, zodErrors } from '@/lib/schemas';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter,
} from "@/Components/ui/sheet";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/Components/ui/dialog";
import { Badge } from "@/Components/ui/badge";
import {
    Edit2,
    MessageSquare,
    Plus,
    Search,
    X,
    LayoutGrid,
    Table as TableIcon,
    ArrowRightLeft,
    ArrowRight,
    CheckCircle2,
    History,
    Clock,
    FileText,
    Building2,
    CreditCard,
    UploadCloud,
    Eye,
    UserPlus,
    User,
    Package,
    Phone,
    HeartPulse,
    MapPin,
    Calendar,
} from 'lucide-react';
import DataTablePagination from '@/Components/DataTablePagination';
import PerPageSelector from '@/Components/PerPageSelector';
import { useDebounce } from '@/hooks/use-debounce';
import CurrencyInput, { toRupiah, unformatRupiah } from '@/Components/CurrencyInput';
import CustomerDrawer, { Customer } from './Components/CustomerDrawer';
import CustomerEditDrawer from './Components/CustomerEditDrawer';

interface Package {
    id: number;
    nama_paket: string;
    harga: number;
}

interface Agent {
    id: number;
    name: string;
}

export interface BankAccount {
    id: number;
    nama_bank: string;
    nomor_rekening: string;
    atas_nama: string;
}

interface KanbanStageItem extends CrmStage {
    total_leads: number;
    total_nominal: number;
    current_page: number;
    total_pages: number;
    per_page: number;
    has_more?: boolean;
    jamaah: (Jamaah & {
        paket: { id: number; nama_paket: string; harga: number };
        agen: { id: number; name: string; email?: string } | null;
        inventaris_transaksi?: Array<{ id: number; qty: number }>;
    })[];
}

interface Props extends PageProps {
    stages: KanbanStageItem[];
    packages: Package[];
    agents: Agent[];
    banks?: BankAccount[];
    documentPermissions?: any[];
    filters: {
        search?: string;
    };
}

export default function KanbanBoard({
    auth,
    stages: initialStages,
    packages,
    agents,
    banks = [],
    documentPermissions = [],
    filters,
}: Props) {

    // View mode: 'kanban' (Card Pipeline) | 'table' (Tabular Listing)
    const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');

    const [stages, setStages] = useState(initialStages);
    const [stagePages, setStagePages] = useState<Record<number, number>>({});
    const [stageHasMore, setStageHasMore] = useState<Record<number, boolean>>({});
    const [stageLoadingMore, setStageLoadingMore] = useState<Record<number, boolean>>({});

    React.useEffect(() => {
        setStages(initialStages);
        const initialHasMore: Record<number, boolean> = {};
        const initialPages: Record<number, number> = {};
        initialStages.forEach((s) => {
            initialHasMore[s.id] = Boolean(s.has_more ?? (s.total_leads > s.jamaah.length));
            initialPages[s.id] = 1;
        });
        setStageHasMore(initialHasMore);
        setStagePages(initialPages);
    }, [initialStages]);

    const [draggedLeadId, setDraggedLeadId] = useState<number | null>(null);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [drawerInitialTab, setDrawerInitialTab] = useState<'view' | 'financial' | 'documents' | 'riwayat'>('view');
    const [editingCustomer, setEditingCustomer] = useState<Customer | any>(null);
    const [isAddLeadOpen, setIsAddLeadOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState(filters?.search || '');
    const [selectedStageFilter, setSelectedStageFilter] = useState<string>('all');

    const handleOpenDrawer = (lead: any, tab: 'view' | 'financial' | 'documents' | 'riwayat' = 'view') => {
        setSelectedCustomer(lead);
        setDrawerInitialTab(tab);
    };

    // Live Server Search with debounce
    const debouncedSearchQuery = useDebounce(searchQuery, 350);
    const isInitialMount = React.useRef(true);

    React.useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        router.get(
            route('crm.index'),
            {
                search: debouncedSearchQuery || undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            }
        );
    }, [debouncedSearchQuery]);

    // Load next page of leads for specific column on infinite scroll
    const loadMoreStageLeads = async (stageId: number) => {
        const hasMore = stageHasMore[stageId] ?? true;
        const isLoading = stageLoadingMore[stageId] ?? false;
        if (!hasMore || isLoading) return;

        setStageLoadingMore((prev) => ({ ...prev, [stageId]: true }));
        const currentPage = stagePages[stageId] || 1;
        const nextPage = currentPage + 1;

        try {
            const url = new URL(route('crm.stage.leads', stageId), window.location.origin);
            url.searchParams.set('page', nextPage.toString());
            url.searchParams.set('per_page', '10');
            if (debouncedSearchQuery) url.searchParams.set('search', debouncedSearchQuery);

            const res = await fetch(url.toString());
            const data = await res.json();

            setStages((prevStages) =>
                prevStages.map((s) => {
                    if (s.id === stageId) {
                        return {
                            ...s,
                            jamaah: [...s.jamaah, ...(data.jamaah || [])],
                        };
                    }
                    return s;
                })
            );

            setStagePages((prev) => ({ ...prev, [stageId]: nextPage }));
            setStageHasMore((prev) => ({ ...prev, [stageId]: Boolean(data.has_more) }));
        } catch (err) {
            console.error('Failed to load more leads for stage:', err);
        } finally {
            setStageLoadingMore((prev) => ({ ...prev, [stageId]: false }));
        }
    };

    const handleColumnScroll = (e: React.UIEvent<HTMLDivElement>, stageId: number) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        if (scrollHeight - scrollTop - clientHeight < 150) {
            loadMoreStageLeads(stageId);
        }
    };

    // Form registration hooks for adding manual leads
    const addForm = useForm<{
        nama_lengkap: string;
        nik: string;
        jenis_kelamin: string;
        tempat_lahir: string;
        tanggal_lahir: string;
        nomor_paspor: string;
        golongan_darah: string;
        status_pernikahan: string;
        no_hp: string;
        email: string;
        alamat_ktp: string;
        alamat_domisili: string;
        kontak_darurat_nama: string;
        kontak_darurat_hp: string;
        kontak_darurat_hubungan: string;
        riwayat_penyakit: string;
        paket_id: string;
        agen_id: string;
        tanggal_keberangkatan: string;
        catatan_admin: string;
        file_ktp: File | null;
        file_kk: File | null;
        file_foto: File | null;
        file_paspor: File | null;
    }>({
        nama_lengkap: '',
        nik: '',
        jenis_kelamin: 'L',
        tempat_lahir: '',
        tanggal_lahir: '',
        nomor_paspor: '',
        golongan_darah: '',
        status_pernikahan: 'Menikah',
        no_hp: '',
        email: '',
        alamat_ktp: '',
        alamat_domisili: '',
        kontak_darurat_nama: '',
        kontak_darurat_hp: '',
        kontak_darurat_hubungan: '',
        riwayat_penyakit: '',
        paket_id: '',
        agen_id: auth.user.role === 'agen' ? auth.user.id.toString() : '',
        tanggal_keberangkatan: '',
        catatan_admin: '',
        file_ktp: null,
        file_kk: null,
        file_foto: null,
        file_paspor: null,
    });

    // Pending Stage Move Dialog State
    const [pendingStageMove, setPendingStageMove] = useState<{
        lead: any;
        targetStage: { id: number; nama_tahap: string };
        sourceStage: { id: number; nama_tahap: string } | null;
    } | null>(null);
    const [stageMoveNote, setStageMoveNote] = useState('');
    const [stageDpNominal, setStageDpNominal] = useState('');
    const [stageBankId, setStageBankId] = useState('');
    const [stageBuktiFile, setStageBuktiFile] = useState<File | null>(null);

    const handleDragStart = (e: React.DragEvent, leadId: number) => {
        e.dataTransfer.setData('text/plain', leadId.toString());
        setDraggedLeadId(leadId);
    };

    const handleDrop = (e: React.DragEvent, targetStageId: number) => {
        e.preventDefault();
        const leadIdStr = e.dataTransfer.getData('text/plain') || draggedLeadId?.toString();
        if (!leadIdStr) return;

        const leadId = parseInt(leadIdStr, 10);
        let foundLead: any = null;
        let sourceStage: any = null;

        for (const stage of stages) {
            const l = stage.jamaah.find((j) => j.id === leadId);
            if (l) {
                foundLead = l;
                sourceStage = stage;
                break;
            }
        }

        const targetStage = stages.find((s) => s.id === targetStageId);
        if (!foundLead || !targetStage || foundLead.crm_stage_id === targetStageId) {
            setDraggedLeadId(null);
            return;
        }

        setPendingStageMove({
            lead: foundLead,
            sourceStage: sourceStage ? { id: sourceStage.id, nama_tahap: sourceStage.nama_tahap } : null,
            targetStage: { id: targetStage.id, nama_tahap: targetStage.nama_tahap },
        });
        setStageMoveNote('');
        setStageDpNominal('');
        setStageBankId(banks[0]?.id?.toString() || '');
        setStageBuktiFile(null);
        setDraggedLeadId(null);
    };

    const handleStageChangeFromTable = (leadId: number, targetStageId: number) => {
        let foundLead: any = null;
        let sourceStage: any = null;

        for (const stage of stages) {
            const l = stage.jamaah.find((j) => j.id === leadId);
            if (l) {
                foundLead = l;
                sourceStage = stage;
                break;
            }
        }

        const targetStage = stages.find((s) => s.id === targetStageId);
        if (!foundLead || !targetStage || foundLead.crm_stage_id === targetStageId) {
            return;
        }

        setPendingStageMove({
            lead: foundLead,
            sourceStage: sourceStage ? { id: sourceStage.id, nama_tahap: sourceStage.nama_tahap } : null,
            targetStage: { id: targetStage.id, nama_tahap: targetStage.nama_tahap },
        });
        setStageMoveNote('');
        setStageDpNominal('');
        setStageBankId(banks[0]?.id?.toString() || '');
        setStageBuktiFile(null);
    };

    const confirmStageMove = (note?: string) => {
        if (!pendingStageMove) return;

        const { lead, targetStage, sourceStage } = pendingStageMove;
        const targetStageId = targetStage.id;
        const leadId = lead.id;

        // Optimistic UI Update
        const nextStages = stages.map((stage) => {
            const leadExists = stage.jamaah.find((j) => j.id === leadId);
            if (leadExists) {
                return {
                    ...stage,
                    jamaah: stage.jamaah.filter((j) => j.id !== leadId),
                    total_leads: Math.max(0, stage.total_leads - 1),
                };
            }
            if (stage.id === targetStageId) {
                const newLog = {
                    id: Date.now(),
                    user: { id: auth.user.id, name: auth.user.name },
                    from_stage: sourceStage,
                    to_stage: targetStage,
                    catatan: note || null,
                    created_at: new Date().toISOString(),
                };

                const updatedLead = {
                    ...lead,
                    crm_stage_id: targetStageId,
                    catatan_admin: note || lead.catatan_admin,
                    stage_logs: [newLog, ...(lead.stage_logs || [])],
                };
                return {
                    ...stage,
                    jamaah: [updatedLead, ...stage.jamaah],
                    total_leads: stage.total_leads + 1,
                };
            }
            return stage;
        });
        setStages(nextStages);
        setPendingStageMove(null);

        const numericDp = Number(unformatRupiah(stageDpNominal)) || 0;

        // Call backend update with note and optional DP payment
        if (stageBuktiFile || numericDp > 0) {
            router.post(
                route('crm.update-stage', leadId),
                {
                    _method: 'PATCH',
                    crm_stage_id: targetStageId,
                    catatan: note || undefined,
                    nominal_dp: numericDp > 0 ? numericDp : undefined,
                    rekening_tenant_id: stageBankId || undefined,
                    bukti_transfer: stageBuktiFile || undefined,
                },
                {
                    preserveScroll: true,
                    forceFormData: true,
                    onError: () => setStages(initialStages),
                }
            );
        } else {
            router.patch(
                route('crm.update-stage', leadId),
                {
                    crm_stage_id: targetStageId,
                    catatan: note || undefined,
                },
                {
                    preserveScroll: true,
                    onError: () => setStages(initialStages),
                }
            );
        }
    };

    const handleAddLeadSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        addForm.clearErrors();
        const fieldErrors = zodErrors(crmLeadSchema, addForm.data);
        if (Object.keys(fieldErrors).length > 0) {
            Object.entries(fieldErrors).forEach(([field, msg]) => {
                if (msg) addForm.setError(field as any, msg);
            });
            return;
        }

        if (!addForm.data.file_ktp) {
            addForm.setError('file_ktp' as any, 'File KTP wajib diunggah (JPG/PNG/PDF max 5MB).');
            return;
        }

        if (!addForm.data.file_kk) {
            addForm.setError('file_kk' as any, 'File Kartu Keluarga (KK) wajib diunggah (JPG/PNG/PDF max 5MB).');
            return;
        }

        addForm.post(route('crm.store'), {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                setIsAddLeadOpen(false);
                addForm.reset();
            },
        });
    };

    // Flatten all leads for Table mode
    const allTableLeads = useMemo(() => {
        const list: Array<any> = [];
        stages.forEach((stage) => {
            stage.jamaah.forEach((j) => {
                list.push({
                    ...j,
                    stageName: stage.nama_tahap,
                    stageId: stage.id,
                });
            });
        });

        return list.filter((lead) => {
            const matchesStage = selectedStageFilter === 'all' || lead.crm_stage_id.toString() === selectedStageFilter;
            if (!matchesStage) return false;

            if (!debouncedSearchQuery.trim()) return true;
            const q = debouncedSearchQuery.toLowerCase();
            return (
                lead.nama_lengkap.toLowerCase().includes(q) ||
                lead.no_hp.includes(q) ||
                (lead.email && lead.email.toLowerCase().includes(q)) ||
                lead.paket.nama_paket.toLowerCase().includes(q) ||
                (lead.agen?.name && lead.agen.name.toLowerCase().includes(q))
            );
        });
    }, [stages, debouncedSearchQuery, selectedStageFilter]);

    // Table Pagination state
    const [tablePage, setTablePage] = useState(1);
    const [tablePerPage, setTablePerPage] = useState(15);
    const totalTablePages = Math.max(1, Math.ceil(allTableLeads.length / tablePerPage));

    // Kanban Per-Column Pagination State
    const [kanbanPerPage, setKanbanPerPage] = useState(5);
    const [kanbanPages, setKanbanPages] = useState<Record<number, number>>({});

    const getStagePage = (stageId: number) => kanbanPages[stageId] || 1;

    const setStagePage = (stageId: number, page: number) => {
        setKanbanPages((prev) => ({
            ...prev,
            [stageId]: page,
        }));
    };

    const paginatedTableLeads = useMemo(() => {
        const start = (tablePage - 1) * tablePerPage;
        return allTableLeads.slice(start, start + tablePerPage);
    }, [allTableLeads, tablePage]);

    const tablePaginationLinks = useMemo(() => {
        const links: Array<{ url: string | null; label: string; active: boolean }> = [];
        links.push({
            url: tablePage > 1 ? `?page=${tablePage - 1}` : null,
            label: '&laquo; Previous',
            active: false,
        });

        for (let i = 1; i <= totalTablePages; i++) {
            links.push({
                url: `?page=${i}`,
                label: i.toString(),
                active: i === tablePage,
            });
        }

        links.push({
            url: tablePage < totalTablePages ? `?page=${tablePage + 1}` : null,
            label: 'Next &raquo;',
            active: false,
        });

        return links;
    }, [tablePage, totalTablePages]);

    return (
        <PageLayout
            title="CRM Leads & Prospek"
            breadcrumbParent="CRM & Jamaah"
            breadcrumbPage="Pipeline Leads"
            contentClass="p-6 md:p-8 flex flex-col gap-6 w-full max-w-none"
        >
            {/* Header & Controls */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-card/60 backdrop-blur-md p-6 rounded-2xl border border-border/80 shadow-xs">
                <div>
                    <div className="flex items-center gap-2.5">
                        <div className="h-8 w-1.5 rounded-full bg-primary" />
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                            Pipeline Prospek Calon Jamaah
                        </h1>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 ml-4">
                        Pantau konversi prospek jamaah antar tahapan secara visual (Kanban) atau melalui tabel lengkap.
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
                    {/* View Mode Switcher */}
                    <div className="flex items-center bg-muted/60 p-1 rounded-xl border border-border/80 shrink-0">
                        <button
                            onClick={() => setViewMode('kanban')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                                viewMode === 'kanban'
                                    ? 'bg-card text-foreground shadow-xs'
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            <LayoutGrid className="w-3.5 h-3.5" />
                            <span>Mode Kanban</span>
                        </button>
                        <button
                            onClick={() => setViewMode('table')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                                viewMode === 'table'
                                    ? 'bg-card text-foreground shadow-xs'
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            <TableIcon className="w-3.5 h-3.5" />
                            <span>Mode Table</span>
                        </button>
                    </div>

                    {/* Live Search Input */}
                    <div className="relative flex-1 sm:w-64">
                        <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Cari nama, HP, paket, agen..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-10 py-2 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground placeholder:text-muted-foreground transition-all"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground text-xs font-semibold p-0.5 rounded bg-muted cursor-pointer"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>

                    <button
                        onClick={() => setIsAddLeadOpen(true)}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-xl hover:opacity-90 transition-all shadow-sm text-sm shrink-0 cursor-pointer"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Tambah Calon Nasabah</span>
                    </button>
                </div>
            </div>

            {/* MODE 1: KANBAN BOARD (INFINITE SCROLL) */}
            {viewMode === 'kanban' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 w-full items-start">
                    {stages.map((stage, idx) => {
                        const totalNominal = stage.total_nominal !== undefined ? stage.total_nominal : stage.jamaah.reduce((sum, j) => sum + Number(j.paket.harga), 0);
                        const totalLeadsCount = stage.total_leads !== undefined ? stage.total_leads : stage.jamaah.length;
                        const stageColors = [
                            'border-t-sky-500 bg-sky-500/5',
                            'border-t-amber-500 bg-amber-500/5',
                            'border-t-purple-500 bg-purple-500/5',
                            'border-t-emerald-500 bg-emerald-500/5',
                        ];
                        const badgeColors = [
                            'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
                            'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
                            'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
                            'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
                        ];

                        const isColumnLoadingMore = stageLoadingMore[stage.id] ?? false;
                        const columnHasMore = stageHasMore[stage.id] ?? (totalLeadsCount > stage.jamaah.length);

                        return (
                            <div
                                key={stage.id}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => handleDrop(e, stage.id)}
                                className={`w-full bg-card/40 backdrop-blur-xs border border-border/70 border-t-4 ${stageColors[idx % 4]} rounded-2xl p-4 flex flex-col gap-3.5 shadow-xs transition-colors`}
                            >
                                {/* Column Header */}
                                <div className="flex justify-between items-center pb-2 border-b border-border/40">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-sm text-foreground">{stage.nama_tahap}</span>
                                        <span className={`px-2 py-0.5 text-xs font-bold rounded-full border ${badgeColors[idx % 4]}`}>
                                            {totalLeadsCount}
                                        </span>
                                    </div>
                                    <span className="text-[11px] font-semibold text-muted-foreground tracking-tight">
                                        Rp {totalNominal.toLocaleString('id-ID')}
                                    </span>
                                </div>

                                {/* Scrollable Leads Container with Infinite Scroll (Hidden Scrollbar) */}
                                <div
                                    onScroll={(e) => handleColumnScroll(e, stage.id)}
                                    className="flex flex-col gap-3 min-h-[120px] max-h-[calc(100vh-270px)] overflow-y-auto no-scrollbar"
                                >
                                    {stage.jamaah.map((lead) => (
                                        <div
                                            key={lead.id}
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, lead.id)}
                                            className={`p-4 rounded-xl border border-border/70 bg-card hover:border-primary/50 transition-all cursor-grab active:cursor-grabbing shadow-xs flex flex-col gap-3 group relative ${
                                                draggedLeadId === lead.id ? 'opacity-40 ring-2 ring-primary' : ''
                                            }`}
                                        >
                                            {/* Lead Card Content */}
                                            <div className="flex justify-between items-start gap-2">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                                                        {lead.nama_lengkap}
                                                    </span>
                                                    <div className="text-[11px] text-muted-foreground mt-0.5 truncate">
                                                        HP: {lead.no_hp}
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end gap-1 shrink-0">
                                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                                                        lead.nik
                                                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                                                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                                                    }`}>
                                                        {lead.nik ? 'Doc Ready' : 'Doc Pending'}
                                                    </span>
                                                    {lead.inventaris_transaksi && lead.inventaris_transaksi.length > 0 && (
                                                        <span className="text-[9px] px-1.5 py-0.5 rounded-md font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                                                            Logistik Siap
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="bg-muted/40 rounded-lg p-2.5 flex flex-col gap-1 border border-border/30">
                                                <div className="text-xs font-medium text-foreground/90 flex items-center justify-between">
                                                    <span className="truncate">{lead.paket.nama_paket}</span>
                                                </div>
                                                <div className="text-xs font-bold text-primary">
                                                    Rp {Number(lead.paket.harga).toLocaleString('id-ID')}
                                                </div>
                                            </div>

                                            <div className="pt-2 flex justify-between items-center text-[11px] text-muted-foreground border-t border-border/40">
                                                <div className="flex items-center gap-1.5 truncate max-w-[120px]">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 shrink-0" />
                                                    <span className="truncate">{lead.agen?.name ? `Agen: ${lead.agen.name}` : 'Direct'}</span>
                                                </div>

                                                <div className="flex items-center gap-1.5">
                                                    <button
                                                        onClick={() => handleOpenDrawer(lead, 'view')}
                                                        className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition cursor-pointer"
                                                        title="Lihat Detail Calon Nasabah"
                                                    >
                                                        <Eye className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => setEditingCustomer(lead)}
                                                        className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition cursor-pointer"
                                                        title="Edit Data Calon Nasabah"
                                                    >
                                                        <Edit2 className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleOpenDrawer(lead, 'riwayat')}
                                                        className="text-primary hover:underline font-semibold text-xs flex items-center gap-1 cursor-pointer"
                                                        title="Log Follow-up & Tracking"
                                                    >
                                                        <MessageSquare className="w-3 h-3" />
                                                        <span>Follow-up</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {stage.jamaah.length === 0 && (
                                        <div className="flex flex-col items-center justify-center border border-dashed border-border/80 rounded-xl py-10 px-4 text-center text-xs text-muted-foreground/70 bg-card/10">
                                            <span>Tidak ada data di tahap ini</span>
                                        </div>
                                    )}

                                    {/* Column Infinite Scroll Loading Spinner */}
                                    {isColumnLoadingMore && (
                                        <div className="py-3 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                                            <div className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                                            <span>Memuat prospek...</span>
                                        </div>
                                    )}

                                    {!isColumnLoadingMore && !columnHasMore && stage.jamaah.length > 0 && (
                                        <div className="py-2 text-center text-[10px] text-muted-foreground/70">
                                            {stage.jamaah.length} prospek termuat
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* MODE 2: TABLE VIEW */}
            {viewMode === 'table' && (
                <div className="flex flex-col gap-4">
                    {/* Stage Filter Selector */}
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-3 bg-card/60 p-4 rounded-2xl border border-border/80 shadow-xs">
                        <div className="text-xs font-bold text-foreground">
                            Total {allTableLeads.length} Calon Jamaah Terdaftar
                        </div>

                        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                            <PerPageSelector
                                value={tablePerPage}
                                onChange={(val) => {
                                    setTablePerPage(val);
                                    setTablePage(1);
                                }}
                            />
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground font-medium shrink-0">Tahapan:</span>
                                <select
                                    value={selectedStageFilter}
                                    onChange={(e) => {
                                        setSelectedStageFilter(e.target.value);
                                        setTablePage(1);
                                    }}
                                    className="text-xs bg-background border border-border rounded-xl px-3 py-1.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                                >
                                    <option value="all">Semua Tahapan ({stages.reduce((sum, s) => sum + s.jamaah.length, 0)})</option>
                                    {stages.map((stage) => (
                                        <option key={stage.id} value={stage.id.toString()}>
                                            {stage.nama_tahap} ({stage.jamaah.length})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Table Container */}
                    <div className="overflow-hidden rounded-2xl border border-border/80 bg-card/70 backdrop-blur-md shadow-xs">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-border/80 bg-muted/50 text-xs font-bold text-foreground">
                                        <th className="px-6 py-4">Calon Jamaah</th>
                                        <th className="px-6 py-4">Kontak (HP/Email)</th>
                                        <th className="px-6 py-4">Pilihan Paket</th>
                                        <th className="px-6 py-4">Mitra Agen</th>
                                        <th className="px-6 py-4 text-center">Tahap CRM</th>
                                        <th className="px-6 py-4 text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/60 text-xs">
                                    {paginatedTableLeads.map((lead) => (
                                        <tr key={lead.id} className="hover:bg-muted/40 transition-colors">
                                            <td className="px-6 py-4 font-bold text-foreground">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                                                        {lead.nama_lengkap.substring(0, 2).toUpperCase()}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="font-bold text-foreground truncate">{lead.nama_lengkap}</div>
                                                        <div className="text-[11px] text-muted-foreground font-mono">
                                                            {lead.nik ? `NIK: ${lead.nik}` : 'NIK: -'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-muted-foreground">
                                                <div>{lead.no_hp}</div>
                                                <div className="text-[11px] text-muted-foreground/80">{lead.email || '-'}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-foreground">{lead.paket.nama_paket}</div>
                                                <div className="text-primary font-bold text-[11px]">
                                                    Rp {Number(lead.paket.harga).toLocaleString('id-ID')}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-muted-foreground">
                                                {lead.agen?.name ? (
                                                    <span className="font-medium text-foreground">{lead.agen.name}</span>
                                                ) : (
                                                    <span className="italic text-muted-foreground/60">Direct / Organik</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <select
                                                    value={lead.crm_stage_id}
                                                    onChange={(e) => handleStageChangeFromTable(lead.id, parseInt(e.target.value, 10))}
                                                    className="text-xs bg-background border border-border rounded-lg px-2.5 py-1 text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-semibold"
                                                >
                                                    {stages.map((stg) => (
                                                        <option key={stg.id} value={stg.id}>
                                                            {stg.nama_tahap}
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <button
                                                        onClick={() => handleOpenDrawer(lead, 'view')}
                                                        className="p-1.5 rounded-lg border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition cursor-pointer"
                                                        title="Lihat Detail"
                                                    >
                                                        <Eye className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => setEditingCustomer(lead)}
                                                        className="p-1.5 rounded-lg border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition cursor-pointer"
                                                        title="Edit Data Calon Nasabah"
                                                    >
                                                        <Edit2 className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleOpenDrawer(lead, 'riwayat')}
                                                        className="p-1.5 rounded-lg border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 transition cursor-pointer font-bold text-[11px] flex items-center gap-1"
                                                        title="Catatan &amp; Log Follow-up"
                                                    >
                                                        <MessageSquare className="w-3.5 h-3.5" />
                                                        <span>Follow-up</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}

                                    {paginatedTableLeads.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="py-12 text-center text-muted-foreground italic">
                                                Tidak ada calon nasabah yang sesuai dengan filter.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Shared Pagination Bar */}
                        <div className="border-t border-border/80 px-4 bg-muted/20">
                            <DataTablePagination
                                links={tablePaginationLinks}
                                from={allTableLeads.length > 0 ? (tablePage - 1) * tablePerPage + 1 : 0}
                                to={Math.min(tablePage * tablePerPage, allTableLeads.length)}
                                total={allTableLeads.length}
                                currentPage={tablePage}
                                lastPage={totalTablePages}
                                onPageChange={(p) => setTablePage(p)}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Slide-out Drawer: Detail / Log Follow-up Calon Nasabah */}
            <CustomerDrawer
                customer={selectedCustomer}
                initialTab={drawerInitialTab}
                banks={banks}
                onClose={() => setSelectedCustomer(null)}
                onEdit={(cust) => {
                    setSelectedCustomer(null);
                    setEditingCustomer(cust);
                }}
                documentPermissions={documentPermissions}
            />


            {/* Slide-out Drawer: Edit Data Calon Nasabah */}
            <CustomerEditDrawer
                customer={editingCustomer}
                isOpen={!!editingCustomer}
                onClose={() => setEditingCustomer(null)}
            />

            {/* Slide-out Drawer: Tambah Calon Nasabah */}
            <Sheet open={isAddLeadOpen} onOpenChange={setIsAddLeadOpen}>
                <SheetContent side="right" className="w-full sm:max-w-3xl lg:max-w-5xl flex flex-col justify-between p-0">
                    <div className="p-6 border-b border-border/80 bg-muted/20">
                        <SheetHeader>
                            <SheetTitle className="text-lg sm:text-xl font-bold text-foreground flex items-center gap-2">
                                <UserPlus className="w-5 h-5 text-primary" />
                                <span>Tambah Calon Nasabah Baru</span>
                            </SheetTitle>
                            <SheetDescription className="text-xs text-muted-foreground mt-1">
                                Daftarkan prospek baru ke dalam CRM pipeline beserta paket &amp; kelengkapan awal dokumen.
                            </SheetDescription>
                        </SheetHeader>
                    </div>

                    <form id="add-lead-form" onSubmit={handleAddLeadSubmit} noValidate className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 low-scrollbar">
                        {/* Seksi 1: Data Diri & Identitas */}
                        <div className="bg-card p-4 rounded-2xl border border-border/80 shadow-2xs flex flex-col gap-3.5">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5 pb-2 border-b border-border/60">
                                <User className="w-3.5 h-3.5" /> Identitas Pribadi
                            </h4>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <InputLabel htmlFor="add_nama_lengkap" value="Nama Lengkap Calon Jamaah *" className="text-xs font-semibold" />
                                    <TextInput
                                        id="add_nama_lengkap"
                                        type="text"
                                        value={addForm.data.nama_lengkap}
                                        onChange={(e) => addForm.setData('nama_lengkap', e.target.value)}
                                        className={`mt-1 block w-full text-xs font-medium ${addForm.errors.nama_lengkap ? 'border-destructive focus:border-destructive focus:ring-destructive' : ''}`}
                                        placeholder="Misal: Bapak Hendra Pratama"
                                        required
                                    />
                                    <InputError message={addForm.errors.nama_lengkap} className="mt-1" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="add_nik" value="NIK (KTP 16 Digit)" className="text-xs font-semibold" />
                                    <TextInput
                                        id="add_nik"
                                        type="text"
                                        value={addForm.data.nik}
                                        onChange={(e) => addForm.setData('nik', e.target.value)}
                                        className={`mt-1 block w-full text-xs font-mono ${addForm.errors.nik ? 'border-destructive focus:border-destructive focus:ring-destructive' : ''}`}
                                        maxLength={16}
                                        placeholder="32xxxxxxxxxxxxxx"
                                    />
                                    <InputError message={addForm.errors.nik} className="mt-1" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div>
                                    <InputLabel htmlFor="add_jenis_kelamin" value="Jenis Kelamin" className="text-xs font-semibold" />
                                    <select
                                        id="add_jenis_kelamin"
                                        value={addForm.data.jenis_kelamin}
                                        onChange={(e) => addForm.setData('jenis_kelamin', e.target.value)}
                                        className="mt-1 block w-full text-xs rounded-xl border border-border bg-background p-2.5 text-foreground focus:ring-primary focus:border-primary"
                                    >
                                        <option value="L">Laki-laki</option>
                                        <option value="P">Perempuan</option>
                                    </select>
                                    <InputError message={addForm.errors.jenis_kelamin} className="mt-1" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="add_tempat_lahir" value="Tempat Lahir" className="text-xs font-semibold" />
                                    <TextInput
                                        id="add_tempat_lahir"
                                        type="text"
                                        value={addForm.data.tempat_lahir}
                                        className="mt-1 block w-full text-xs"
                                        onChange={(e) => addForm.setData('tempat_lahir', e.target.value)}
                                        placeholder="Kota Kelahiran"
                                    />
                                    <InputError message={addForm.errors.tempat_lahir} className="mt-1" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="add_tanggal_lahir" value="Tanggal Lahir" className="text-xs font-semibold" />
                                    <TextInput
                                        id="add_tanggal_lahir"
                                        type="date"
                                        value={addForm.data.tanggal_lahir}
                                        className="mt-1 block w-full text-xs"
                                        onChange={(e) => addForm.setData('tanggal_lahir', e.target.value)}
                                    />
                                    <InputError message={addForm.errors.tanggal_lahir} className="mt-1" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div>
                                    <InputLabel htmlFor="add_nomor_paspor" value="Nomor Paspor" className="text-xs font-semibold" />
                                    <TextInput
                                        id="add_nomor_paspor"
                                        type="text"
                                        value={addForm.data.nomor_paspor}
                                        className="mt-1 block w-full text-xs font-mono uppercase"
                                        placeholder="A1234567"
                                        onChange={(e) => addForm.setData('nomor_paspor', e.target.value)}
                                    />
                                    <InputError message={addForm.errors.nomor_paspor} className="mt-1" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="add_golongan_darah" value="Golongan Darah" className="text-xs font-semibold" />
                                    <select
                                        id="add_golongan_darah"
                                        value={addForm.data.golongan_darah}
                                        onChange={(e) => addForm.setData('golongan_darah', e.target.value)}
                                        className="mt-1 block w-full text-xs rounded-xl border border-border bg-background p-2.5 text-foreground focus:ring-primary focus:border-primary"
                                    >
                                        <option value="">- Belum Ditentukan -</option>
                                        <option value="A">A</option>
                                        <option value="B">B</option>
                                        <option value="AB">AB</option>
                                        <option value="O">O</option>
                                    </select>
                                    <InputError message={addForm.errors.golongan_darah} className="mt-1" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="add_status_pernikahan" value="Status Pernikahan" className="text-xs font-semibold" />
                                    <select
                                        id="add_status_pernikahan"
                                        value={addForm.data.status_pernikahan}
                                        onChange={(e) => addForm.setData('status_pernikahan', e.target.value)}
                                        className="mt-1 block w-full text-xs rounded-xl border border-border bg-background p-2.5 text-foreground focus:ring-primary focus:border-primary"
                                    >
                                        <option value="Menikah">Menikah</option>
                                        <option value="Belum Menikah">Belum Menikah</option>
                                        <option value="Duda/Janda">Duda / Janda</option>
                                    </select>
                                    <InputError message={addForm.errors.status_pernikahan} className="mt-1" />
                                </div>
                            </div>
                        </div>

                        {/* Seksi 2: Kontak & Alamat Domisili */}
                        <div className="bg-card p-4 rounded-2xl border border-border/80 shadow-2xs flex flex-col gap-3.5">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5 pb-2 border-b border-border/60">
                                <Phone className="w-3.5 h-3.5" /> Kontak &amp; Alamat
                            </h4>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <InputLabel htmlFor="add_no_hp" value="Nomor WhatsApp / HP *" className="text-xs font-semibold" />
                                    <TextInput
                                        id="add_no_hp"
                                        type="text"
                                        value={addForm.data.no_hp}
                                        onChange={(e) => addForm.setData('no_hp', e.target.value)}
                                        className={`mt-1 block w-full text-xs font-mono ${addForm.errors.no_hp ? 'border-destructive focus:border-destructive focus:ring-destructive' : ''}`}
                                        placeholder="08123456789"
                                        required
                                    />
                                    <InputError message={addForm.errors.no_hp} className="mt-1" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="add_email" value="Alamat Email (Opsional)" className="text-xs font-semibold" />
                                    <TextInput
                                        id="add_email"
                                        type="email"
                                        value={addForm.data.email}
                                        onChange={(e) => addForm.setData('email', e.target.value)}
                                        className={`mt-1 block w-full text-xs ${addForm.errors.email ? 'border-destructive focus:border-destructive focus:ring-destructive' : ''}`}
                                        placeholder="hendra@gmail.com"
                                    />
                                    <InputError message={addForm.errors.email} className="mt-1" />
                                </div>
                            </div>

                            <div>
                                <InputLabel htmlFor="add_alamat_ktp" value="Alamat Lengkap Sesuai KTP" className="text-xs font-semibold" />
                                <textarea
                                    id="add_alamat_ktp"
                                    rows={2}
                                    value={addForm.data.alamat_ktp}
                                    onChange={(e) => addForm.setData('alamat_ktp', e.target.value)}
                                    className="mt-1 block w-full text-xs rounded-xl border border-border bg-background p-2.5 text-foreground focus:ring-primary focus:border-primary"
                                    placeholder="Jalan, RT/RW, Kelurahan, Kecamatan, Kota/Kabupaten, Provinsi"
                                />
                                <InputError message={addForm.errors.alamat_ktp} className="mt-1" />
                            </div>

                            <div>
                                <InputLabel htmlFor="add_alamat_domisili" value="Alamat Domisili (Bila berbeda dengan KTP)" className="text-xs font-semibold" />
                                <textarea
                                    id="add_alamat_domisili"
                                    rows={2}
                                    value={addForm.data.alamat_domisili}
                                    onChange={(e) => addForm.setData('alamat_domisili', e.target.value)}
                                    className="mt-1 block w-full text-xs rounded-xl border border-border bg-background p-2.5 text-foreground focus:ring-primary focus:border-primary"
                                    placeholder="Alamat tempat tinggal saat ini..."
                                />
                                <InputError message={addForm.errors.alamat_domisili} className="mt-1" />
                            </div>
                        </div>

                        {/* Seksi 3: Kontak Darurat & Riwayat Kesehatan */}
                        <div className="bg-card p-4 rounded-2xl border border-border/80 shadow-2xs flex flex-col gap-3.5">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5 pb-2 border-b border-border/60">
                                <HeartPulse className="w-3.5 h-3.5" /> Kontak Darurat &amp; Riwayat Penyakit
                            </h4>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div>
                                    <InputLabel htmlFor="add_kontak_darurat_nama" value="Nama Kontak Darurat" className="text-xs font-semibold" />
                                    <TextInput
                                        id="add_kontak_darurat_nama"
                                        type="text"
                                        value={addForm.data.kontak_darurat_nama}
                                        className="mt-1 block w-full text-xs"
                                        onChange={(e) => addForm.setData('kontak_darurat_nama', e.target.value)}
                                    />
                                    <InputError message={addForm.errors.kontak_darurat_nama} className="mt-1" />
                                </div>
                                <div>
                                    <InputLabel htmlFor="add_kontak_darurat_hp" value="No. HP Darurat" className="text-xs font-semibold" />
                                    <TextInput
                                        id="add_kontak_darurat_hp"
                                        type="text"
                                        value={addForm.data.kontak_darurat_hp}
                                        className="mt-1 block w-full text-xs font-mono"
                                        onChange={(e) => addForm.setData('kontak_darurat_hp', e.target.value)}
                                    />
                                    <InputError message={addForm.errors.kontak_darurat_hp} className="mt-1" />
                                </div>
                                <div>
                                    <InputLabel htmlFor="add_kontak_darurat_hubungan" value="Hubungan Keluarga" className="text-xs font-semibold" />
                                    <TextInput
                                        id="add_kontak_darurat_hubungan"
                                        type="text"
                                        value={addForm.data.kontak_darurat_hubungan}
                                        className="mt-1 block w-full text-xs"
                                        placeholder="Suami/Istri/Anak/Saudara"
                                        onChange={(e) => addForm.setData('kontak_darurat_hubungan', e.target.value)}
                                    />
                                    <InputError message={addForm.errors.kontak_darurat_hubungan} className="mt-1" />
                                </div>
                            </div>

                            <div>
                                <InputLabel htmlFor="add_riwayat_penyakit" value="Riwayat Penyakit / Catatan Khusus Medis" className="text-xs font-semibold" />
                                <TextInput
                                    id="add_riwayat_penyakit"
                                    type="text"
                                    value={addForm.data.riwayat_penyakit}
                                    className="mt-1 block w-full text-xs"
                                    placeholder="Contoh: Asma, Hipertensi, Alergi Makanan Laut, dll"
                                    onChange={(e) => addForm.setData('riwayat_penyakit', e.target.value)}
                                />
                                <InputError message={addForm.errors.riwayat_penyakit} className="mt-1" />
                            </div>
                        </div>

                        {/* Seksi 4: Paket & Jadwal Operasional */}
                        <div className="bg-card p-4 rounded-2xl border border-border/80 shadow-2xs flex flex-col gap-3.5">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5 pb-2 border-b border-border/60">
                                <Package className="w-3.5 h-3.5" /> Pilihan Paket &amp; Mitra Keagenan
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <InputLabel htmlFor="add_paket_id" value="Pilihan Paket Umroh *" className="text-xs font-semibold" />
                                    <select
                                        id="add_paket_id"
                                        value={addForm.data.paket_id}
                                        onChange={(e) => addForm.setData('paket_id', e.target.value)}
                                        className={`mt-1 block w-full text-xs rounded-xl border bg-background p-2.5 text-foreground focus:ring-primary focus:border-primary ${addForm.errors.paket_id ? 'border-destructive' : 'border-border'}`}
                                        required
                                    >
                                        <option value="">Pilih Paket...</option>
                                        {packages.map((pkg) => (
                                            <option key={pkg.id} value={pkg.id}>
                                                {pkg.nama_paket} (Rp {Number(pkg.harga).toLocaleString('id-ID')})
                                            </option>
                                        ))}
                                    </select>
                                    <InputError message={addForm.errors.paket_id} className="mt-1" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="add_agen_id" value="Mitra Agen Perujuk" className="text-xs font-semibold" />
                                    <select
                                        id="add_agen_id"
                                        value={addForm.data.agen_id}
                                        onChange={(e) => addForm.setData('agen_id', e.target.value)}
                                        disabled={auth.user.role === 'agen'}
                                        className="mt-1 block w-full text-xs rounded-xl border border-border bg-background p-2.5 text-foreground focus:ring-primary focus:border-primary disabled:bg-muted"
                                    >
                                        <option value="">Direct / Kantor Pusat</option>
                                        {agents.map((ag) => (
                                            <option key={ag.id} value={ag.id}>
                                                {ag.name}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError message={addForm.errors.agen_id} className="mt-1" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="add_tanggal_keberangkatan" value="Rencana Tanggal Keberangkatan" className="text-xs font-semibold" />
                                    <TextInput
                                        id="add_tanggal_keberangkatan"
                                        type="date"
                                        value={addForm.data.tanggal_keberangkatan}
                                        className="mt-1 block w-full text-xs"
                                        onChange={(e) => addForm.setData('tanggal_keberangkatan', e.target.value)}
                                    />
                                    <InputError message={addForm.errors.tanggal_keberangkatan} className="mt-1" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="add_catatan_admin" value="Catatan Khusus Operasional" className="text-xs font-semibold" />
                                    <TextInput
                                        id="add_catatan_admin"
                                        type="text"
                                        value={addForm.data.catatan_admin}
                                        className="mt-1 block w-full text-xs"
                                        onChange={(e) => addForm.setData('catatan_admin', e.target.value)}
                                        placeholder="Permintaan kamar khusus, dll..."
                                    />
                                    <InputError message={addForm.errors.catatan_admin} className="mt-1" />
                                </div>
                            </div>
                        </div>

                        {/* Seksi 5: Berkas Persyaratan & Dokumen Awal */}
                        <div className="bg-card p-4 rounded-2xl border border-border/80 shadow-2xs flex flex-col gap-3.5">
                            <div className="flex items-center justify-between pb-2 border-b border-border/60">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                                    <FileText className="w-3.5 h-3.5" /> Berkas Persyaratan &amp; Dokumen Awal
                                </h4>
                                <span className="text-[11px] text-muted-foreground">
                                    KTP &amp; KK wajib untuk registrasi awal
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {/* KTP */}
                                <div className={`p-3 rounded-xl border transition flex flex-col justify-between gap-2.5 ${addForm.data.file_ktp ? 'bg-primary/5 border-primary/40' : 'bg-muted/30 border-border/70'}`}>
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                            <FileText className="w-4 h-4 text-primary shrink-0" />
                                            <span className="text-xs font-bold text-foreground">File KTP</span>
                                        </div>
                                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-primary/10 text-primary border border-primary/20 shrink-0">
                                            Wajib *
                                        </span>
                                    </div>
                                    <div>
                                        <label className="text-[11px] font-medium text-muted-foreground block mb-1">
                                            Pilih File (JPG/PNG/PDF):
                                        </label>
                                        <input
                                            id="add_file_ktp"
                                            type="file"
                                            accept="image/jpeg,image/png,application/pdf"
                                            onChange={(e) => addForm.setData('file_ktp', e.target.files?.[0] || null)}
                                            className="block w-full text-[11px] file:mr-2.5 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[11px] file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer text-muted-foreground"
                                        />
                                    </div>
                                    {addForm.data.file_ktp && (
                                        <div className="text-[10px] text-primary font-semibold truncate flex items-center gap-1">
                                            <UploadCloud className="w-3 h-3 shrink-0" />
                                            <span>{addForm.data.file_ktp.name}</span>
                                        </div>
                                    )}
                                    <InputError message={addForm.errors.file_ktp} className="mt-1" />
                                </div>

                                {/* KK */}
                                <div className={`p-3 rounded-xl border transition flex flex-col justify-between gap-2.5 ${addForm.data.file_kk ? 'bg-primary/5 border-primary/40' : 'bg-muted/30 border-border/70'}`}>
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                            <FileText className="w-4 h-4 text-primary shrink-0" />
                                            <span className="text-xs font-bold text-foreground">File Kartu Keluarga (KK)</span>
                                        </div>
                                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-primary/10 text-primary border border-primary/20 shrink-0">
                                            Wajib *
                                        </span>
                                    </div>
                                    <div>
                                        <label className="text-[11px] font-medium text-muted-foreground block mb-1">
                                            Pilih File (JPG/PNG/PDF):
                                        </label>
                                        <input
                                            id="add_file_kk"
                                            type="file"
                                            accept="image/jpeg,image/png,application/pdf"
                                            onChange={(e) => addForm.setData('file_kk', e.target.files?.[0] || null)}
                                            className="block w-full text-[11px] file:mr-2.5 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[11px] file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer text-muted-foreground"
                                        />
                                    </div>
                                    {addForm.data.file_kk && (
                                        <div className="text-[10px] text-primary font-semibold truncate flex items-center gap-1">
                                            <UploadCloud className="w-3 h-3 shrink-0" />
                                            <span>{addForm.data.file_kk.name}</span>
                                        </div>
                                    )}
                                    <InputError message={addForm.errors.file_kk} className="mt-1" />
                                </div>

                                {/* Foto */}
                                <div className={`p-3 rounded-xl border transition flex flex-col justify-between gap-2.5 ${addForm.data.file_foto ? 'bg-primary/5 border-primary/40' : 'bg-muted/30 border-border/70'}`}>
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                            <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                                            <span className="text-xs font-bold text-foreground">Pas Foto 4x6</span>
                                        </div>
                                        <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-muted text-muted-foreground shrink-0">
                                            Opsional
                                        </span>
                                    </div>
                                    <div>
                                        <label className="text-[11px] font-medium text-muted-foreground block mb-1">
                                            Pilih File (JPG/PNG):
                                        </label>
                                        <input
                                            id="add_file_foto"
                                            type="file"
                                            accept="image/jpeg,image/png"
                                            onChange={(e) => addForm.setData('file_foto', e.target.files?.[0] || null)}
                                            className="block w-full text-[11px] file:mr-2.5 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[11px] file:font-semibold file:bg-muted file:text-foreground hover:file:bg-muted/80 cursor-pointer text-muted-foreground"
                                        />
                                    </div>
                                    {addForm.data.file_foto && (
                                        <div className="text-[10px] text-primary font-semibold truncate flex items-center gap-1">
                                            <UploadCloud className="w-3 h-3 shrink-0" />
                                            <span>{addForm.data.file_foto.name}</span>
                                        </div>
                                    )}
                                    <InputError message={addForm.errors.file_foto} className="mt-1" />
                                </div>

                                {/* Paspor */}
                                <div className={`p-3 rounded-xl border transition flex flex-col justify-between gap-2.5 ${addForm.data.file_paspor ? 'bg-primary/5 border-primary/40' : 'bg-muted/30 border-border/70'}`}>
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                            <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                                            <span className="text-xs font-bold text-foreground">Buku Paspor</span>
                                        </div>
                                        <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-muted text-muted-foreground shrink-0">
                                            Opsional
                                        </span>
                                    </div>
                                    <div>
                                        <label className="text-[11px] font-medium text-muted-foreground block mb-1">
                                            Pilih File (JPG/PNG/PDF):
                                        </label>
                                        <input
                                            id="add_file_paspor"
                                            type="file"
                                            accept="image/jpeg,image/png,application/pdf"
                                            onChange={(e) => addForm.setData('file_paspor', e.target.files?.[0] || null)}
                                            className="block w-full text-[11px] file:mr-2.5 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[11px] file:font-semibold file:bg-muted file:text-foreground hover:file:bg-muted/80 cursor-pointer text-muted-foreground"
                                        />
                                    </div>
                                    {addForm.data.file_paspor && (
                                        <div className="text-[10px] text-primary font-semibold truncate flex items-center gap-1">
                                            <UploadCloud className="w-3 h-3 shrink-0" />
                                            <span>{addForm.data.file_paspor.name}</span>
                                        </div>
                                    )}
                                    <InputError message={addForm.errors.file_paspor} className="mt-1" />
                                </div>
                            </div>
                        </div>
                    </form>

                    <SheetFooter className="p-4 border-t border-border/80 bg-muted/20 flex flex-row items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => setIsAddLeadOpen(false)}
                            className="px-4 py-2.5 rounded-xl border border-border text-xs font-semibold hover:bg-muted text-muted-foreground hover:text-foreground transition cursor-pointer"
                        >
                            Batal
                        </button>
                        <PrimaryButton
                            form="add-lead-form"
                            type="submit"
                            disabled={addForm.processing}
                            className="text-xs font-bold px-5 py-2.5"
                        >
                            {addForm.processing ? 'Menyimpan...' : 'Simpan Prospek'}
                        </PrimaryButton>
                    </SheetFooter>
                </SheetContent>
            </Sheet>

            {/* Modal Dialog: Konfirmasi & Catatan Pindah Tahap CRM */}
            <Dialog open={!!pendingStageMove} onOpenChange={(open) => { if (!open) setPendingStageMove(null); }}>
                <DialogContent className="sm:max-w-xl md:max-w-2xl rounded-2xl p-6 sm:p-7 bg-card border border-border shadow-2xl">
                    <DialogHeader className="pb-2 border-b border-border/60">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20">
                                <ArrowRightLeft className="w-5 h-5" />
                            </div>
                            <div>
                                <DialogTitle className="text-base sm:text-lg font-bold text-foreground tracking-tight">
                                    Pindah Tahap CRM &amp; Catat Log
                                </DialogTitle>
                                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                                    Pindahkan prospek nasabah ke tahap berikutnya dan tambahkan catatan riwayat aktivitas.
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    {pendingStageMove && (
                        <div className="flex flex-col gap-4 py-2">
                            {/* Lead Information & Stage Badge Summary */}
                            <div className="p-4 rounded-xl bg-muted/40 border border-border flex flex-col gap-3">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-sm font-bold text-foreground">
                                            {pendingStageMove.lead.nama_lengkap}
                                        </div>
                                        {pendingStageMove.lead.paket?.nama_paket && (
                                            <div className="text-xs text-muted-foreground mt-0.5">
                                                {pendingStageMove.lead.paket.nama_paket} ({toRupiah(pendingStageMove.lead.paket.harga || 0)})
                                            </div>
                                        )}
                                    </div>
                                    <span className="text-xs text-muted-foreground font-mono bg-background px-2.5 py-1 rounded-lg border border-border/80">
                                        {pendingStageMove.lead.no_hp}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2.5 pt-2 border-t border-border/60 text-xs">
                                    <span className="text-[11px] text-muted-foreground">Transisi:</span>
                                    <Badge variant="outline" className="text-xs font-semibold px-2.5 py-0.5">
                                        {pendingStageMove.sourceStage?.nama_tahap || 'Tahap Asal'}
                                    </Badge>
                                    <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
                                    <Badge className="text-xs font-bold px-2.5 py-0.5 bg-primary text-primary-foreground">
                                        {pendingStageMove.targetStage.nama_tahap}
                                    </Badge>
                                </div>
                            </div>

                            {/* Optional DP payment inputs when moving to Closing stage */}
                            {pendingStageMove.targetStage.nama_tahap.toLowerCase().includes('closing') && (
                                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/25 flex flex-col gap-3.5 shadow-xs">
                                    <div className="flex items-center justify-between pb-2 border-b border-amber-500/20">
                                        <div className="flex items-center gap-2">
                                            <CreditCard className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                                            <span className="text-xs font-bold text-amber-900 dark:text-amber-300">
                                                Catat Pembayaran Uang Muka / DP (Opsional)
                                            </span>
                                        </div>
                                        <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded-full border border-amber-500/30">
                                            Masuk Verifikasi Keuangan
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                        <div>
                                            <InputLabel htmlFor="stage-dp-nominal" value="Nominal DP (Rp)" className="text-xs font-semibold" />
                                            <CurrencyInput
                                                id="stage-dp-nominal"
                                                value={stageDpNominal}
                                                onChange={(val) => setStageDpNominal(String(val))}
                                                placeholder="0"
                                                className="mt-1.5 block w-full text-xs font-bold"
                                            />
                                        </div>

                                        <div>
                                            <InputLabel htmlFor="stage-bank-id" value="Rekening Bank Tujuan" className="text-xs font-semibold" />
                                            <select
                                                id="stage-bank-id"
                                                value={stageBankId}
                                                onChange={(e) => setStageBankId(e.target.value)}
                                                className="mt-1.5 block w-full text-xs rounded-xl border border-border bg-background p-2.5 text-foreground focus:ring-primary focus:border-primary"
                                            >
                                                {banks.map((b) => (
                                                    <option key={b.id} value={b.id}>
                                                        {b.nama_bank} - {b.nomor_rekening} (a.n {b.atas_nama})
                                                    </option>
                                                ))}
                                                {banks.length === 0 && (
                                                    <option value="">Rekening Utama</option>
                                                )}
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="stage-bukti-file" value="Upload Lampiran Bukti Transfer (Opsional)" className="text-xs font-semibold" />
                                        <input
                                            id="stage-bukti-file"
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => setStageBuktiFile(e.target.files?.[0] || null)}
                                            className="mt-1.5 block w-full text-xs rounded-xl border border-border/80 bg-background/80 p-1.5 text-foreground file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Note / Log Reason */}
                            <div className="flex flex-col gap-1.5">
                                <InputLabel htmlFor="stage-note" value="Catatan / Alasan Perpindahan (Opsional)" className="text-xs font-semibold" />
                                <textarea
                                    id="stage-note"
                                    rows={3}
                                    value={stageMoveNote}
                                    onChange={(e) => setStageMoveNote(e.target.value)}
                                    placeholder="Contoh: Sudah bayar DP Rp 5jt via transfer BSI, paspor sudah diverifikasi, siap proses perlengkapan..."
                                    className="w-full rounded-xl border border-border bg-background p-3 text-xs text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground leading-relaxed"
                                    autoFocus
                                />
                            </div>

                            <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2.5 pt-3 border-t border-border/60">
                                <button
                                    type="button"
                                    onClick={() => setPendingStageMove(null)}
                                    className="px-4 py-2.5 border border-border rounded-xl text-xs font-semibold hover:bg-muted transition cursor-pointer text-muted-foreground hover:text-foreground"
                                >
                                    Batal
                                </button>
                                <button
                                    type="button"
                                    onClick={() => confirmStageMove(stageMoveNote)}
                                    className="px-5 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-xs font-bold transition cursor-pointer shadow-xs flex items-center justify-center gap-2"
                                >
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span>Simpan &amp; Pindahkan</span>
                                </button>
                            </DialogFooter>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </PageLayout>
    );
}
