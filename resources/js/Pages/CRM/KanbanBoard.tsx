import { router, useForm, usePage } from '@inertiajs/react';
import React, { useState, useMemo } from 'react';
import { CrmStage, Jamaah, PageProps } from '@/Types';
import PageLayout from '@/Components/Layouts/PageLayout';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import { guestRegisterSchema, zodErrors } from '@/lib/schemas';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter,
} from "@/Components/ui/sheet";
import { Edit2, MessageSquare, Plus, Search, X, LayoutGrid, Table as TableIcon } from 'lucide-react';
import DataTablePagination from '@/Components/DataTablePagination';
import PerPageSelector from '@/Components/PerPageSelector';
import { useDebounce } from '@/hooks/use-debounce';

interface Package {
    id: number;
    nama_paket: string;
    harga: number;
}

interface Agent {
    id: number;
    name: string;
}

interface KanbanStageItem extends CrmStage {
    total_leads: number;
    total_nominal: number;
    current_page: number;
    total_pages: number;
    per_page: number;
    jamaah: (Jamaah & {
        paket: { id: number; nama_paket: string; harga: number };
        agen: { id: number; name: string; email?: string } | null;
        inventaris_transaksi?: Array<{ id: number; qty: number }>;
    })[];
}

interface KanbanProps {
    stages: KanbanStageItem[];
    packages: Package[];
    agents: Agent[];
    filters: {
        search: string;
        per_page: number;
        stage_pages: Record<string, number>;
    };
}

export default function Kanban({ stages: initialStages, packages, agents, filters }: KanbanProps) {
    const { auth } = usePage<PageProps>().props;

    // View mode: 'kanban' (Card Pipeline) | 'table' (Tabular Listing)
    const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');

    const [stages, setStages] = useState(initialStages);

    React.useEffect(() => {
        setStages(initialStages);
    }, [initialStages]);

    const [draggedLeadId, setDraggedLeadId] = useState<number | null>(null);
    const [selectedLead, setSelectedLead] = useState<any | null>(null);
    const [editingLead, setEditingLead] = useState<any | null>(null);
    const [followUpNote, setFollowUpNote] = useState('');
    const [isAddLeadOpen, setIsAddLeadOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState(filters?.search || '');
    const [selectedStageFilter, setSelectedStageFilter] = useState<string>('all');

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
                search: debouncedSearchQuery,
                per_page: filters?.per_page || 5,
                stage_pages: filters?.stage_pages || {},
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            }
        );
    }, [debouncedSearchQuery]);

    // Handle Server-Side Page change for specific stage column
    const handleStagePageChange = (stageId: number, targetPage: number) => {
        const stageKey = `stage_${stageId}`;
        const newStagePages = {
            ...(filters?.stage_pages || {}),
            [stageKey]: targetPage,
        };

        router.get(
            route('crm.index'),
            {
                search: debouncedSearchQuery,
                per_page: filters?.per_page || 10,
                stage_pages: newStagePages,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            }
        );
    };

    // Handle Per-Page change across all columns
    const handlePerPageChange = (newPerPage: number) => {
        router.get(
            route('crm.index'),
            {
                search: debouncedSearchQuery,
                per_page: newPerPage,
                stage_pages: {},
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            }
        );
    };

    // Form registration hooks for adding manual leads
    const addForm = useForm({
        nama_lengkap: '',
        nik: '',
        no_hp: '',
        email: '',
        paket_id: '',
        agen_id: auth.user.role === 'agen' ? auth.user.id.toString() : '',
        catatan_admin: '',
    });

    // Form registration hooks for editing leads
    const editForm = useForm({
        nama_lengkap: '',
        nik: '',
        no_hp: '',
        email: '',
        paket_id: '',
        agen_id: '',
        catatan_admin: '',
    });

    const handleDragStart = (e: React.DragEvent, leadId: number) => {
        e.dataTransfer.setData('text/plain', leadId.toString());
        setDraggedLeadId(leadId);
    };

    const handleDrop = (e: React.DragEvent, targetStageId: number) => {
        e.preventDefault();
        const leadIdStr = e.dataTransfer.getData('text/plain') || draggedLeadId?.toString();
        if (!leadIdStr) return;

        const leadId = parseInt(leadIdStr, 10);
        let movedLead: any = null;

        // Optimistic UI Update
        const nextStages = stages.map((stage) => {
            const leadExists = stage.jamaah.find((j) => j.id === leadId);
            if (leadExists) {
                movedLead = { ...leadExists, crm_stage_id: targetStageId };
                return {
                    ...stage,
                    jamaah: stage.jamaah.filter((j) => j.id !== leadId),
                };
            }
            return stage;
        });

        if (movedLead) {
            const updatedStages = nextStages.map((stage) => {
                if (stage.id === targetStageId) {
                    return {
                        ...stage,
                        jamaah: [movedLead, ...stage.jamaah],
                    };
                }
                return stage;
            });
            setStages(updatedStages);
        }

        // Call backend update
        router.patch(
            route('crm.update-stage', leadId),
            { crm_stage_id: targetStageId },
            {
                preserveScroll: true,
                onError: () => setStages(initialStages),
            }
        );
        setDraggedLeadId(null);
    };

    const handleStageChangeFromTable = (leadId: number, targetStageId: number) => {
        let movedLead: any = null;
        const nextStages = stages.map((stage) => {
            const leadExists = stage.jamaah.find((j) => j.id === leadId);
            if (leadExists) {
                movedLead = { ...leadExists, crm_stage_id: targetStageId };
                return {
                    ...stage,
                    jamaah: stage.jamaah.filter((j) => j.id !== leadId),
                };
            }
            return stage;
        });

        if (movedLead) {
            const updatedStages = nextStages.map((stage) => {
                if (stage.id === targetStageId) {
                    return {
                        ...stage,
                        jamaah: [movedLead, ...stage.jamaah],
                    };
                }
                return stage;
            });
            setStages(updatedStages);
        }

        router.patch(
            route('crm.update-stage', leadId),
            { crm_stage_id: targetStageId },
            {
                preserveScroll: true,
                onError: () => setStages(initialStages),
            }
        );
    };

    const handleOpenFollowUp = (lead: any) => {
        setSelectedLead(lead);
        setFollowUpNote(lead.catatan_admin || '');
    };

    const handleOpenEditLead = (lead: any) => {
        setEditingLead(lead);
        editForm.setData({
            nama_lengkap: lead.nama_lengkap || '',
            nik: lead.nik || '',
            no_hp: lead.no_hp || '',
            email: lead.email || '',
            paket_id: lead.paket_id ? lead.paket_id.toString() : (lead.paket?.id ? lead.paket.id.toString() : ''),
            agen_id: lead.agen_id ? lead.agen_id.toString() : (lead.agen?.id ? lead.agen.id.toString() : ''),
            catatan_admin: lead.catatan_admin || '',
        });
    };

    const handleSaveNote = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedLead) return;

        router.patch(
            route('crm.update-stage', selectedLead.id),
            {
                crm_stage_id: selectedLead.crm_stage_id,
                catatan_admin: followUpNote,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setSelectedLead(null);
                },
            }
        );
    };

    const handleAddLeadSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const fieldErrors = zodErrors(guestRegisterSchema, addForm.data);
        if (Object.keys(fieldErrors).length > 0) {
            Object.entries(fieldErrors).forEach(([field, msg]) => {
                if (msg) addForm.setError(field as any, msg);
            });
            return;
        }

        addForm.post(route('crm.store'), {
            preserveScroll: true,
            onSuccess: () => {
                setIsAddLeadOpen(false);
                addForm.reset();
            },
        });
    };

    const handleUpdateLeadSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingLead) return;

        editForm.put(route('crm.jamaah.update', editingLead.id), {
            preserveScroll: true,
            onSuccess: () => {
                setEditingLead(null);
                editForm.reset();
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

                    {/* Kanban Limit per Column Selector */}
                    {viewMode === 'kanban' && (
                        <div className="flex items-center gap-2 bg-muted/40 px-3 py-1 rounded-xl border border-border/70 shrink-0">
                            <span className="text-xs text-muted-foreground font-medium">Tampil / Kolom:</span>
                            {[5, 10, 15, 20].map((limit) => (
                                <button
                                    key={limit}
                                    type="button"
                                    onClick={() => handlePerPageChange(limit)}
                                    className={`px-2.5 py-0.5 rounded text-xs font-bold transition cursor-pointer ${
                                        (filters?.per_page || 10) === limit
                                            ? 'bg-primary text-primary-foreground shadow-xs'
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    {limit}
                                </button>
                            ))}
                        </div>
                    )}

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

            {/* MODE 1: KANBAN BOARD */}
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

                        const currentPage = stage.current_page || 1;
                        const totalPages = stage.total_pages || 1;

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

                                {/* Leads List */}
                                <div className="flex flex-col gap-3 min-h-[100px]">
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

                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleOpenEditLead(lead)}
                                                        className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition cursor-pointer"
                                                        title="Edit Data Calon Nasabah"
                                                    >
                                                        <Edit2 className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleOpenFollowUp(lead)}
                                                        className="text-primary hover:underline font-semibold text-xs flex items-center gap-1 cursor-pointer"
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
                                </div>

                                {/* Column Pagination Footer */}
                                {totalPages > 1 && (
                                    <div className="flex items-center justify-between pt-2 border-t border-border/50 text-xs text-muted-foreground">
                                        <span>
                                            Hal {currentPage} dari {totalPages} ({totalLeadsCount} total)
                                        </span>
                                        <div className="flex items-center gap-1">
                                            <button
                                                type="button"
                                                onClick={() => handleStagePageChange(stage.id, Math.max(1, currentPage - 1))}
                                                disabled={currentPage <= 1}
                                                className="px-2 py-1 rounded-md border border-border bg-card hover:bg-muted text-foreground disabled:opacity-30 disabled:cursor-not-allowed text-[11px] font-bold transition cursor-pointer"
                                            >
                                                &larr; Prev
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleStagePageChange(stage.id, Math.min(totalPages, currentPage + 1))}
                                                disabled={currentPage >= totalPages}
                                                className="px-2 py-1 rounded-md border border-border bg-card hover:bg-muted text-foreground disabled:opacity-30 disabled:cursor-not-allowed text-[11px] font-bold transition cursor-pointer"
                                            >
                                                Next &rarr;
                                            </button>
                                        </div>
                                    </div>
                                )}
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
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => handleOpenEditLead(lead)}
                                                        className="p-1.5 rounded-lg border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition cursor-pointer"
                                                        title="Edit Data Calon Nasabah"
                                                    >
                                                        <Edit2 className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleOpenFollowUp(lead)}
                                                        className="p-1.5 rounded-lg border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 transition cursor-pointer font-bold text-[11px] flex items-center gap-1"
                                                        title="Catatan Follow-up"
                                                    >
                                                        <MessageSquare className="w-3.5 h-3.5" />
                                                        <span>Catatan</span>
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

            {/* Follow-up Note Modal/Drawer */}
            <Sheet open={!!selectedLead} onOpenChange={(open) => { if (!open) setSelectedLead(null); }}>
                <SheetContent side="right" className="w-1/2 max-w-none">
                    <SheetHeader>
                        <SheetTitle>Log Follow-up: {selectedLead?.nama_lengkap}</SheetTitle>
                        <SheetDescription>
                            Simpan rangkuman hasil interaksi atau catatan penting prospek jamaah ini.
                        </SheetDescription>
                    </SheetHeader>
                    <form onSubmit={handleSaveNote} className="flex flex-col gap-4 p-4 flex-1">
                        <div className="bg-muted/40 p-3.5 rounded-xl border border-border/50 text-xs flex flex-col gap-1">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Paket Pilihan:</span>
                                <span className="font-semibold text-foreground">{selectedLead?.paket?.nama_paket}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Nomor HP / WhatsApp:</span>
                                <span className="font-semibold text-foreground">{selectedLead?.no_hp}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Mitra Agen:</span>
                                <span className="font-semibold text-foreground">{selectedLead?.agen?.name || 'Direct / Kantor'}</span>
                            </div>
                        </div>

                        <div className="flex-1 flex flex-col">
                            <InputLabel htmlFor="catatan" value="Catatan Hasil Follow-up" />
                            <textarea
                                id="catatan"
                                rows={6}
                                value={followUpNote}
                                onChange={(e) => setFollowUpNote(e.target.value)}
                                placeholder="Contoh: Sudah ditelepon tanggal 1 September, jamaah tertarik paket Gold tapi menunggu konfirmasi cuti dari kantor..."
                                className="mt-1 w-full bg-background border border-border rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground placeholder:text-muted-foreground"
                            />
                        </div>

                        <SheetFooter>
                            <button
                                type="button"
                                onClick={() => setSelectedLead(null)}
                                className="px-4 py-2 border border-border rounded-lg text-sm"
                            >
                                Batal
                            </button>
                            <PrimaryButton type="submit">
                                Simpan Catatan
                            </PrimaryButton>
                        </SheetFooter>
                    </form>
                </SheetContent>
            </Sheet>

            {/* Slide-out Drawer 50%: Edit Calon Nasabah */}
            <Sheet open={!!editingLead} onOpenChange={(open) => { if (!open) setEditingLead(null); }}>
                <SheetContent side="right" className="w-1/2 max-w-none flex flex-col justify-between">
                    <div className="flex flex-col gap-5 p-4 flex-1 overflow-y-auto">
                        <SheetHeader className="pb-3 border-b border-border/60">
                            <SheetTitle className="text-2xl font-bold text-foreground">
                                Edit Data Calon Nasabah
                            </SheetTitle>
                            <SheetDescription className="text-xs text-muted-foreground">
                                Perbarui data diri, nomor kontak, paket yang diminati, atau penugasan agen perujuk.
                            </SheetDescription>
                        </SheetHeader>

                        <form id="edit-lead-form" onSubmit={handleUpdateLeadSubmit} className="flex flex-col gap-4">
                            <div>
                                <InputLabel htmlFor="edit_nama_lengkap" value="Nama Lengkap Calon Jamaah" />
                                <TextInput
                                    id="edit_nama_lengkap"
                                    type="text"
                                    value={editForm.data.nama_lengkap}
                                    onChange={(e) => editForm.setData('nama_lengkap', e.target.value)}
                                    className="mt-1 block w-full"
                                    required
                                />
                                <InputError message={editForm.errors.nama_lengkap} className="mt-2" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <InputLabel htmlFor="edit_nik" value="NIK (Opsional)" />
                                    <TextInput
                                        id="edit_nik"
                                        type="text"
                                        value={editForm.data.nik}
                                        onChange={(e) => editForm.setData('nik', e.target.value)}
                                        className="mt-1 block w-full"
                                        maxLength={16}
                                        placeholder="16 Digit NIK KTP"
                                    />
                                    <InputError message={editForm.errors.nik} className="mt-2" />
                                </div>
                                <div>
                                    <InputLabel htmlFor="edit_no_hp" value="Nomor HP / WhatsApp" />
                                    <TextInput
                                        id="edit_no_hp"
                                        type="text"
                                        value={editForm.data.no_hp}
                                        onChange={(e) => editForm.setData('no_hp', e.target.value)}
                                        className="mt-1 block w-full"
                                        required
                                    />
                                    <InputError message={editForm.errors.no_hp} className="mt-2" />
                                </div>
                            </div>

                            <div>
                                <InputLabel htmlFor="edit_email" value="Alamat Email (Opsional)" />
                                <TextInput
                                    id="edit_email"
                                    type="email"
                                    value={editForm.data.email}
                                    onChange={(e) => editForm.setData('email', e.target.value)}
                                    className="mt-1 block w-full"
                                />
                                <InputError message={editForm.errors.email} className="mt-2" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <InputLabel htmlFor="edit_paket_id" value="Pilihan Paket Umroh" />
                                    <select
                                        id="edit_paket_id"
                                        value={editForm.data.paket_id}
                                        onChange={(e) => editForm.setData('paket_id', e.target.value)}
                                        className="mt-1 block w-full bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        required
                                    >
                                        <option value="">Pilih Paket...</option>
                                        {packages.map((pkg) => (
                                            <option key={pkg.id} value={pkg.id}>
                                                {pkg.nama_paket} (Rp {Number(pkg.harga).toLocaleString('id-ID')})
                                            </option>
                                        ))}
                                    </select>
                                    <InputError message={editForm.errors.paket_id} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="edit_agen_id" value="Mitra Agen Perujuk" />
                                    <select
                                        id="edit_agen_id"
                                        value={editForm.data.agen_id}
                                        onChange={(e) => editForm.setData('agen_id', e.target.value)}
                                        disabled={auth.user.role === 'agen'}
                                        className="mt-1 block w-full bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:bg-muted"
                                    >
                                        <option value="">Direct / Kantor Pusat</option>
                                        {agents.map((ag) => (
                                            <option key={ag.id} value={ag.id}>
                                                {ag.name}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError message={editForm.errors.agen_id} className="mt-2" />
                                </div>
                            </div>

                            <div>
                                <InputLabel htmlFor="edit_catatan_admin" value="Catatan Kebutuhan Calon Jamaah" />
                                <textarea
                                    id="edit_catatan_admin"
                                    rows={4}
                                    value={editForm.data.catatan_admin}
                                    onChange={(e) => editForm.setData('catatan_admin', e.target.value)}
                                    placeholder="Catatan khusus, tanggal rencana berangkat, permintaan sekamar, dll..."
                                    className="mt-1 w-full bg-background border border-border rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground placeholder:text-muted-foreground"
                                />
                                <InputError message={editForm.errors.catatan_admin} className="mt-2" />
                            </div>
                        </form>
                    </div>

                    <SheetFooter className="p-4 border-t border-border/60">
                        <button
                            type="button"
                            onClick={() => setEditingLead(null)}
                            className="px-4 py-2 border border-border rounded-xl text-sm font-semibold hover:bg-muted transition cursor-pointer"
                        >
                            Batal
                        </button>
                        <PrimaryButton form="edit-lead-form" type="submit" disabled={editForm.processing}>
                            Simpan Perubahan
                        </PrimaryButton>
                    </SheetFooter>
                </SheetContent>
            </Sheet>

            {/* Slide-out Drawer 50%: Tambah Calon Nasabah */}
            <Sheet open={isAddLeadOpen} onOpenChange={setIsAddLeadOpen}>
                <SheetContent side="right" className="w-1/2 max-w-none">
                    <SheetHeader>
                        <SheetTitle>Tambah Calon Nasabah Baru</SheetTitle>
                        <SheetDescription>Daftarkan prospek baru ke dalam CRM pipeline.</SheetDescription>
                    </SheetHeader>
                    <form onSubmit={handleAddLeadSubmit} className="flex flex-col gap-4 p-4 flex-1">
                        <div>
                            <InputLabel htmlFor="nama_lengkap" value="Nama Lengkap Calon Jamaah" />
                            <TextInput
                                id="nama_lengkap"
                                type="text"
                                value={addForm.data.nama_lengkap}
                                onChange={(e) => addForm.setData('nama_lengkap', e.target.value)}
                                className="mt-1 block w-full"
                                required
                                placeholder="Misal: Bapak Hendra Pratama"
                            />
                            <InputError message={addForm.errors.nama_lengkap} className="mt-2" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <InputLabel htmlFor="nik" value="NIK (Opsional)" />
                                <TextInput
                                    id="nik"
                                    type="text"
                                    value={addForm.data.nik}
                                    onChange={(e) => addForm.setData('nik', e.target.value)}
                                    className="mt-1 block w-full"
                                    maxLength={16}
                                    placeholder="16 Digit NIK KTP"
                                />
                                <InputError message={addForm.errors.nik} className="mt-2" />
                            </div>
                            <div>
                                <InputLabel htmlFor="no_hp" value="Nomor HP / WhatsApp" />
                                <TextInput
                                    id="no_hp"
                                    type="text"
                                    value={addForm.data.no_hp}
                                    onChange={(e) => addForm.setData('no_hp', e.target.value)}
                                    className="mt-1 block w-full"
                                    required
                                    placeholder="08123456789"
                                />
                                <InputError message={addForm.errors.no_hp} className="mt-2" />
                            </div>
                        </div>

                        <div>
                            <InputLabel htmlFor="email" value="Alamat Email (Opsional)" />
                            <TextInput
                                id="email"
                                type="email"
                                value={addForm.data.email}
                                onChange={(e) => addForm.setData('email', e.target.value)}
                                className="mt-1 block w-full"
                                placeholder="hendra@gmail.com"
                            />
                            <InputError message={addForm.errors.email} className="mt-2" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <InputLabel htmlFor="paket_id" value="Pilihan Paket Umroh" />
                                <select
                                    id="paket_id"
                                    value={addForm.data.paket_id}
                                    onChange={(e) => addForm.setData('paket_id', e.target.value)}
                                    className="mt-1 block w-full bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    required
                                >
                                    <option value="">Pilih Paket...</option>
                                    {packages.map((pkg) => (
                                        <option key={pkg.id} value={pkg.id}>
                                            {pkg.nama_paket} (Rp {Number(pkg.harga).toLocaleString('id-ID')})
                                        </option>
                                    ))}
                                </select>
                                <InputError message={addForm.errors.paket_id} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="agen_id" value="Mitra Agen Perujuk" />
                                <select
                                    id="agen_id"
                                    value={addForm.data.agen_id}
                                    onChange={(e) => addForm.setData('agen_id', e.target.value)}
                                    disabled={auth.user.role === 'agen'}
                                    className="mt-1 block w-full bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:bg-muted"
                                >
                                    <option value="">Direct / Kantor Pusat</option>
                                    {agents.map((ag) => (
                                        <option key={ag.id} value={ag.id}>
                                            {ag.name}
                                        </option>
                                    ))}
                                </select>
                                <InputError message={addForm.errors.agen_id} className="mt-2" />
                            </div>
                        </div>

                        <div>
                            <InputLabel htmlFor="catatan_admin" value="Catatan Kebutuhan Calon Jamaah" />
                            <textarea
                                id="catatan_admin"
                                rows={4}
                                value={addForm.data.catatan_admin}
                                onChange={(e) => addForm.setData('catatan_admin', e.target.value)}
                                placeholder="Catatan khusus, tanggal rencana berangkat, permintaan sekamar, dll..."
                                className="mt-1 w-full bg-background border border-border rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground placeholder:text-muted-foreground"
                            />
                            <InputError message={addForm.errors.catatan_admin} className="mt-2" />
                        </div>

                        <SheetFooter>
                            <button
                                type="button"
                                onClick={() => setIsAddLeadOpen(false)}
                                className="px-4 py-2 border border-border rounded-lg text-sm"
                            >
                                Batal
                            </button>
                            <PrimaryButton type="submit" disabled={addForm.processing}>
                                Simpan Prospek
                            </PrimaryButton>
                        </SheetFooter>
                    </form>
                </SheetContent>
            </Sheet>
        </PageLayout>
    );
}
