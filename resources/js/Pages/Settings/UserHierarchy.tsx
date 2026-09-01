import React, { useState, useMemo } from 'react';
import { useForm, usePage, router } from '@inertiajs/react';
import { PageProps } from '@/Types';
import PageLayout from '@/Components/Layouts/PageLayout';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter,
} from '@/Components/ui/sheet';
import {
    ChevronRight,
    ChevronDown,
    Plus,
    Edit2,
    Trash2,
    Search,
    Check,
    Users,
    Shield,
    Building,
    Crown,
    Mail,
    UserCheck,
    Info,
    LayoutGrid,
    Table as TableIcon,
    ArrowRight,
    FolderPlus,
    MoveRight,
    Sparkles,
} from 'lucide-react';
import DataTablePagination from '@/Components/DataTablePagination';
import PerPageSelector from '@/Components/PerPageSelector';
import { useDebounce } from '@/hooks/use-debounce';

export interface HierarchyLevelItem {
    id: number;
    tenant_id: number;
    parent_id: number | null;
    nama_level: string;
    role_key: 'owner_travel' | 'admin_travel' | 'agen';
    deskripsi: string | null;
    wewenang_note: string | null;
    urutan: number;
    children?: HierarchyLevelItem[];
}

export interface HierarchyUser {
    id: number;
    tenant_id: number;
    hierarchy_level_id: number | null;
    name: string;
    email: string;
    role: 'super_admin_master' | 'owner_travel' | 'admin_travel' | 'agen';
    jabatan?: string | null;
    created_by: number | null;
    creator?: {
        name: string;
        role: string;
        jabatan?: string;
    } | null;
    tenant?: {
        nama_travel: string;
    } | null;
    hierarchy_level?: HierarchyLevelItem | null;
}

interface TenantItem {
    id: number;
    nama_travel: string;
}

interface UserHierarchyProps extends PageProps {
    users: HierarchyUser[];
    tenants: TenantItem[];
    selectedTenantId: number;
    hierarchyTree: HierarchyLevelItem[];
    allLevels: HierarchyLevelItem[];
    currentUserRole: string;
}

export default function UserHierarchy({
    users = [],
    tenants = [],
    selectedTenantId,
    hierarchyTree = [],
    allLevels = [],
    currentUserRole,
}: UserHierarchyProps) {
    const { auth } = usePage<PageProps>().props;

    // View mode: 'canvas' | 'table'
    const [viewMode, setViewMode] = useState<'canvas' | 'table'>('canvas');

    // Track collapsed/expanded node IDs in Canvas mode
    const [expandedNodeIds, setExpandedNodeIds] = useState<Record<number, boolean>>(() => {
        const initial: Record<number, boolean> = {};
        allLevels.forEach((l) => {
            initial[l.id] = true;
        });
        return initial;
    });

    const [activeDrawerLevel, setActiveDrawerLevel] = useState<HierarchyLevelItem | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [tableSearchQuery, setTableSearchQuery] = useState('');
    const [tableJabatanFilter, setTableJabatanFilter] = useState<string>('all');

    // Modals
    const [isAddUserOpen, setIsAddUserOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<HierarchyUser | null>(null);
    const [reassigningUser, setReassigningUser] = useState<HierarchyUser | null>(null);

    // Level Management Modals
    const [levelModalMode, setLevelModalMode] = useState<'create' | 'edit' | null>(null);
    const [selectedParentLevelId, setSelectedParentLevelId] = useState<number | null>(null);
    const [editingLevel, setEditingLevel] = useState<HierarchyLevelItem | null>(null);
    const [deletingLevel, setDeletingLevel] = useState<HierarchyLevelItem | null>(null);

    // Form: Create / Edit User
    const userForm = useForm({
        name: '',
        email: '',
        password: '',
        hierarchy_level_id: allLevels[0]?.id ? allLevels[0].id.toString() : '',
        tenant_id: selectedTenantId ? selectedTenantId.toString() : (tenants[0]?.id?.toString() || ''),
    });

    const editUserForm = useForm({
        name: '',
        email: '',
        hierarchy_level_id: '',
        password: '',
    });

    // Form: Create / Edit Hierarchy Level
    const levelForm = useForm({
        nama_level: '',
        parent_id: '',
        role_key: 'agen' as 'owner_travel' | 'admin_travel' | 'agen',
        deskripsi: '',
        wewenang_note: '',
        tenant_id: selectedTenantId ? selectedTenantId.toString() : '',
    });

    // Form: Delete Level (with migration)
    const deleteLevelForm = useForm({
        reassign_to_level_id: '',
    });

    // Form: Reassign User
    const reassignForm = useForm({
        target_level_id: '',
    });

    const handleExpandAll = () => {
        const expanded: Record<number, boolean> = {};
        allLevels.forEach((l) => {
            expanded[l.id] = true;
        });
        setExpandedNodeIds(expanded);
    };

    const handleCollapseAll = () => {
        setExpandedNodeIds({});
    };

    const toggleNode = (nodeId: number) => {
        setExpandedNodeIds((prev) => ({
            ...prev,
            [nodeId]: !prev[nodeId],
        }));
    };

    // Calculate count from real database users per level
    const levelCounts = useMemo(() => {
        const counts: Record<number, number> = {};
        allLevels.forEach((lvl) => {
            const countInDb = users.filter((u) => {
                if (u.role === 'super_admin_master') return false;
                if (u.hierarchy_level_id) {
                    return u.hierarchy_level_id === lvl.id;
                }
                return u.jabatan?.toLowerCase() === lvl.nama_level.toLowerCase();
            }).length;
            counts[lvl.id] = countInDb;
        });
        return counts;
    }, [users, allLevels]);

    const debouncedSearchQuery = useDebounce(searchQuery, 300);
    const debouncedTableSearchQuery = useDebounce(tableSearchQuery, 300);

    // Filter users inside Drawer by search query
    const drawerUsers = useMemo(() => {
        if (!activeDrawerLevel) return [];
        return users.filter((u) => {
            if (u.role === 'super_admin_master') return false;

            const matchesLevel =
                u.hierarchy_level_id === activeDrawerLevel.id ||
                (!u.hierarchy_level_id && u.jabatan?.toLowerCase() === activeDrawerLevel.nama_level.toLowerCase());

            const matchesSearch =
                !debouncedSearchQuery.trim() ||
                u.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
                u.email.toLowerCase().includes(debouncedSearchQuery.toLowerCase());

            return matchesLevel && matchesSearch;
        });
    }, [users, activeDrawerLevel, debouncedSearchQuery]);

    // Filter users in Table Mode
    const tableUsers = useMemo(() => {
        return users.filter((u) => {
            if (u.role === 'super_admin_master') return false;

            const userJabatan = u.jabatan || u.hierarchy_level?.nama_level || (u.role === 'owner_travel' ? 'Owner' : u.role === 'agen' ? 'Staff' : 'Supervisor');
            const matchesJabatan = tableJabatanFilter === 'all' || userJabatan.toLowerCase() === tableJabatanFilter.toLowerCase();
            const matchesSearch =
                !debouncedTableSearchQuery.trim() ||
                u.name.toLowerCase().includes(debouncedTableSearchQuery.toLowerCase()) ||
                u.email.toLowerCase().includes(debouncedTableSearchQuery.toLowerCase()) ||
                userJabatan.toLowerCase().includes(debouncedTableSearchQuery.toLowerCase());

            return matchesJabatan && matchesSearch;
        });
    }, [users, tableJabatanFilter, debouncedTableSearchQuery]);

    // Table Pagination state
    const [tablePage, setTablePage] = useState(1);
    const [tablePerPage, setTablePerPage] = useState(15);
    const totalTablePages = Math.max(1, Math.ceil(tableUsers.length / tablePerPage));

    const paginatedTableUsers = useMemo(() => {
        const start = (tablePage - 1) * tablePerPage;
        return tableUsers.slice(start, start + tablePerPage);
    }, [tableUsers, tablePage]);

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

    const handleOpenRoleDrawer = (level: HierarchyLevelItem) => {
        setActiveDrawerLevel(level);
        setSearchQuery('');
    };

    const handleOpenAddUser = (level?: HierarchyLevelItem) => {
        userForm.reset();
        userForm.setData({
            name: '',
            email: '',
            password: '',
            hierarchy_level_id: level ? level.id.toString() : (allLevels[0]?.id?.toString() || ''),
            tenant_id: selectedTenantId.toString(),
        });
        setIsAddUserOpen(true);
    };

    const handleOpenEditUser = (user: HierarchyUser) => {
        setEditingUser(user);
        editUserForm.setData({
            name: user.name,
            email: user.email,
            hierarchy_level_id: user.hierarchy_level_id ? user.hierarchy_level_id.toString() : '',
            password: '',
        });
    };

    const handleOpenReassignUser = (user: HierarchyUser) => {
        setReassigningUser(user);
        reassignForm.setData({
            target_level_id: user.hierarchy_level_id ? user.hierarchy_level_id.toString() : (allLevels[0]?.id?.toString() || ''),
        });
    };

    const handleOpenCreateLevel = (parentLevel?: HierarchyLevelItem) => {
        setLevelModalMode('create');
        setEditingLevel(null);
        
        // Find default parent if none provided (Owner for tenant owner)
        const defaultParent = parentLevel
            ? parentLevel
            : (allLevels.find((l) => l.role_key === 'owner_travel' || l.nama_level === 'Owner') || allLevels[0]);

        setSelectedParentLevelId(defaultParent ? defaultParent.id : null);
        levelForm.reset();
        levelForm.setData({
            nama_level: '',
            parent_id: defaultParent ? defaultParent.id.toString() : '',
            role_key: defaultParent?.role_key === 'owner_travel' ? 'admin_travel' : 'agen',
            deskripsi: '',
            wewenang_note: '',
            tenant_id: selectedTenantId.toString(),
        });
    };

    const handleOpenEditLevel = (level: HierarchyLevelItem) => {
        setLevelModalMode('edit');
        setEditingLevel(level);
        setSelectedParentLevelId(level.parent_id);
        levelForm.setData({
            nama_level: level.nama_level,
            parent_id: level.parent_id ? level.parent_id.toString() : '',
            role_key: level.role_key,
            deskripsi: level.deskripsi || '',
            wewenang_note: level.wewenang_note || '',
            tenant_id: selectedTenantId.toString(),
        });
    };

    const handleOpenDeleteLevel = (level: HierarchyLevelItem) => {
        setDeletingLevel(level);
        const otherLevels = allLevels.filter((l) => l.id !== level.id);
        deleteLevelForm.setData({
            reassign_to_level_id: otherLevels[0]?.id ? otherLevels[0].id.toString() : '',
        });
    };

    const handleStoreUserSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        userForm.post(route('settings.users.store'), {
            onSuccess: () => {
                setIsAddUserOpen(false);
                userForm.reset();
            },
        });
    };

    const handleUpdateUserSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingUser) return;
        editUserForm.put(route('settings.users.update', editingUser.id), {
            onSuccess: () => {
                setEditingUser(null);
                editUserForm.reset();
            },
        });
    };

    const handleDeleteUser = (user: HierarchyUser) => {
        if (window.confirm(`Apakah Anda yakin ingin menghapus akun "${user.name}" (${user.jabatan || user.role})?`)) {
            router.delete(route('settings.users.destroy', user.id), {
                preserveScroll: true,
                onSuccess: () => {
                    if (editingUser?.id === user.id) setEditingUser(null);
                },
            });
        }
    };

    const handleReassignSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!reassigningUser) return;
        reassignForm.post(route('settings.users.reassign', reassigningUser.id), {
            preserveScroll: true,
            onSuccess: () => {
                setReassigningUser(null);
                reassignForm.reset();
            },
        });
    };

    const handleLevelFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (levelModalMode === 'create') {
            levelForm.post(route('settings.users.levels.store'), {
                preserveScroll: true,
                onSuccess: () => {
                    setLevelModalMode(null);
                    levelForm.reset();
                },
            });
        } else if (levelModalMode === 'edit' && editingLevel) {
            levelForm.put(route('settings.users.levels.update', editingLevel.id), {
                preserveScroll: true,
                onSuccess: () => {
                    setLevelModalMode(null);
                    setEditingLevel(null);
                    levelForm.reset();
                },
            });
        }
    };

    const handleDeleteLevelSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!deletingLevel) return;

        const count = levelCounts[deletingLevel.id] || 0;
        if (count > 0 && !deleteLevelForm.data.reassign_to_level_id) {
            alert('Silakan pilih tingkatan jabatan tujuan untuk memindahkan seluruh user yang ada!');
            return;
        }

        deleteLevelForm.delete(route('settings.users.levels.destroy', deletingLevel.id), {
            preserveScroll: true,
            onSuccess: () => {
                if (activeDrawerLevel?.id === deletingLevel.id) setActiveDrawerLevel(null);
                setDeletingLevel(null);
                deleteLevelForm.reset();
            },
        });
    };

    // Render tree node with exact stepped lines in Canvas mode
    const renderTreeNode = (node: HierarchyLevelItem, depth = 0) => {
        const isExpanded = !!expandedNodeIds[node.id];
        const count = levelCounts[node.id] || 0;
        const hasChildren = node.children && node.children.length > 0;
        const isSelected = activeDrawerLevel?.id === node.id;

        return (
            <div key={node.id} className="relative flex flex-col">
                {/* Node Row */}
                <div
                    className="flex items-center gap-3 relative py-3 select-none group/node"
                    style={{ paddingLeft: `${depth * 52}px` }}
                >
                    {/* Stepped Connector Lines */}
                    {depth > 0 && (
                        <div
                            className="absolute border-l-2 border-b-2 border-border/80 rounded-bl-2xl transition-all pointer-events-none"
                            style={{
                                left: `${(depth - 1) * 52 + 22}px`,
                                top: '-12px',
                                width: '30px',
                                height: '36px',
                            }}
                        />
                    )}

                    {/* Expand / Collapse Toggle Button */}
                    {hasChildren ? (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleNode(node.id);
                            }}
                            className="w-7 h-7 rounded-full bg-card border border-border shadow-xs flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition cursor-pointer shrink-0 z-10"
                            title={isExpanded ? 'Tutup cabang' : 'Buka cabang'}
                        >
                            {isExpanded ? (
                                <ChevronDown className="w-3.5 h-3.5" />
                            ) : (
                                <ChevronRight className="w-3.5 h-3.5" />
                            )}
                        </button>
                    ) : (
                        <div className="w-7 h-7 flex items-center justify-center shrink-0 z-10">
                            <div className="w-2 h-2 rounded-full bg-border" />
                        </div>
                    )}

                    {/* Pill Capsule Button */}
                    <div className="flex items-center gap-1.5">
                        <button
                            type="button"
                            onClick={() => handleOpenRoleDrawer(node)}
                            className={`flex items-center gap-2.5 px-4 py-2 rounded-full border shadow-xs transition-all cursor-pointer text-left ${
                                isSelected
                                    ? 'bg-primary text-primary-foreground border-primary ring-2 ring-primary/20 scale-102'
                                    : 'bg-card text-foreground border-border hover:border-primary/50 hover:bg-muted/40'
                            }`}
                        >
                            <span className="text-xs font-bold tracking-tight">{node.nama_level}</span>
                            <span
                                className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                                    isSelected
                                        ? 'bg-primary-foreground/20 text-primary-foreground'
                                        : 'bg-muted text-muted-foreground'
                                }`}
                            >
                                {count}
                            </span>
                        </button>

                        {/* Node Action Tools (Hover/Focused) */}
                        <div className="flex items-center gap-1 opacity-80 hover:opacity-100 transition">
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenCreateLevel(node);
                                }}
                                className="p-1.5 rounded-lg border border-border/60 bg-card/80 hover:bg-muted text-muted-foreground hover:text-primary transition cursor-pointer shadow-2xs"
                                title={`Tambah sub-level di bawah ${node.nama_level}`}
                            >
                                <Plus className="w-3.5 h-3.5" />
                            </button>

                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenEditLevel(node);
                                }}
                                className="p-1.5 rounded-lg border border-border/60 bg-card/80 hover:bg-muted text-muted-foreground hover:text-foreground transition cursor-pointer shadow-2xs"
                                title={`Edit level ${node.nama_level}`}
                            >
                                <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            {allLevels.length > 1 && node.nama_level !== 'Owner' && (
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleOpenDeleteLevel(node);
                                    }}
                                    className="p-1.5 rounded-lg border border-red-500/20 bg-red-500/5 hover:bg-red-500/15 text-red-600 dark:text-red-400 transition cursor-pointer shadow-2xs"
                                    title={`Hapus level ${node.nama_level}`}
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Recursive Children Rows */}
                {hasChildren && isExpanded && (
                    <div className="flex flex-col">
                        {node.children!.map((child) => renderTreeNode(child, depth + 1))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <PageLayout
            title="Hierarki Struktur Organisasi User"
            breadcrumbParent="Pengaturan"
            breadcrumbPage="Hierarki User"
        >
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div>
                    <div className="flex items-center gap-2.5">
                        <div className="h-8 w-1.5 rounded-full bg-primary" />
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                            Hierarki Struktur Organisasi User
                        </h1>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 ml-4">
                        Pohon tingkatan jabatan dinamis per tenant dari Owner hingga Staff Lapangan untuk hak akses dan pembagian komisi.
                    </p>
                </div>

                {/* Mode Switcher & Controls */}
                <div className="flex items-center gap-3 flex-wrap">

                    {/* View Mode Toggle Buttons */}
                    <div className="flex items-center bg-muted/60 p-1 rounded-xl border border-border/80">
                        <button
                            onClick={() => setViewMode('canvas')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                                viewMode === 'canvas'
                                    ? 'bg-card text-foreground shadow-xs'
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            <LayoutGrid className="w-3.5 h-3.5" />
                            <span>Mode Canvas</span>
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

                    {/* Canvas Controls */}
                    {viewMode === 'canvas' && (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleExpandAll}
                                className="text-xs font-semibold text-primary hover:underline cursor-pointer"
                            >
                                Expand All
                            </button>
                            <span className="text-muted-foreground/40">|</span>
                            <button
                                onClick={handleCollapseAll}
                                className="text-xs font-semibold text-primary hover:underline cursor-pointer"
                            >
                                Collapse All
                            </button>
                            <button
                                onClick={() => handleOpenCreateLevel()}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-xs hover:opacity-90 transition cursor-pointer ml-2"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Tambah Level</span>
                            </button>
                        </div>
                    )}

                    {/* Table Mode Action: Add User directly */}
                    {viewMode === 'table' && (
                        <button
                            onClick={() => handleOpenAddUser()}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-foreground text-background text-xs font-bold shadow-xs hover:opacity-90 transition cursor-pointer"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Tambah User</span>
                        </button>
                    )}
                </div>
            </div>

            {/* VIEW MODE 1: VISUAL STEPPED CANVAS TREE */}
            {viewMode === 'canvas' && (
                <div
                    className="relative w-full rounded-3xl border border-border/80 p-8 md:p-12 overflow-x-auto min-h-[480px] shadow-sm transition-all"
                    style={{
                        backgroundColor: 'hsl(var(--card))',
                        backgroundImage: `repeating-linear-gradient(45deg, hsl(var(--border) / 0.45) 0, hsl(var(--border) / 0.45) 1.5px, transparent 0, transparent 18px)`,
                    }}
                >
                    <div className="inline-block min-w-full">
                        {hierarchyTree.length > 0 ? (
                            hierarchyTree.map((rootNode) => renderTreeNode(rootNode, 0))
                        ) : (
                            <div className="py-24 text-center">
                                <p className="text-sm text-muted-foreground">Belum ada struktur hierarki di tenant ini.</p>
                                <button
                                    onClick={() => handleOpenCreateLevel()}
                                    className="mt-3 px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-xl"
                                >
                                    Buat Level Pertama
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* VIEW MODE 2: TABULAR LISTING */}
            {viewMode === 'table' && (
                <div className="flex flex-col gap-4">
                    {/* Filter & Search Bar for Table */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card p-4 rounded-2xl border border-border shadow-xs">
                        <div className="relative w-full sm:w-80">
                            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Cari nama, email, atau jabatan..."
                                value={tableSearchQuery}
                                onChange={(e) => {
                                    setTableSearchQuery(e.target.value);
                                    setTablePage(1);
                                }}
                                className="w-full pl-10 pr-4 py-2 text-xs bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                        </div>

                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <span className="text-xs font-medium text-muted-foreground shrink-0">Jabatan:</span>
                                <select
                                    value={tableJabatanFilter}
                                    onChange={(e) => {
                                        setTableJabatanFilter(e.target.value);
                                        setTablePage(1);
                                    }}
                                    className="w-full sm:w-auto bg-background border border-border rounded-xl px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                                >
                                    <option value="all">Semua Jabatan</option>
                                    {allLevels.map((lvl) => (
                                        <option key={lvl.id} value={lvl.nama_level}>
                                            {lvl.nama_level} ({levelCounts[lvl.id] || 0})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <PerPageSelector
                                value={tablePerPage}
                                onChange={(newPerPage) => {
                                    setTablePerPage(newPerPage);
                                    setTablePage(1);
                                }}
                            />
                        </div>
                    </div>

                    {/* Table View */}
                    <div className="bg-card rounded-2xl border border-border shadow-xs overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead>
                                    <tr className="border-b border-border/80 bg-muted/40 text-muted-foreground font-semibold uppercase tracking-wider">
                                        <th className="px-6 py-3.5">Nama Pengguna</th>
                                        <th className="px-6 py-3.5">Email</th>
                                        <th className="px-6 py-3.5 text-center">Tingkatan Jabatan</th>
                                        <th className="px-6 py-3.5">Atasan Langsung</th>
                                        <th className="px-6 py-3.5 text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/60">
                                    {paginatedTableUsers.map((u) => {
                                        const userJabatan = u.jabatan || u.hierarchy_level?.nama_level || 'Staff';

                                        return (
                                            <tr key={u.id} className="hover:bg-muted/20 transition-colors">
                                                <td className="px-6 py-4 font-bold text-foreground">
                                                    <div className="flex items-center gap-2">
                                                        <span>{u.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-muted-foreground">{u.email}</td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="px-3 py-1 rounded-full font-bold text-[11px] border bg-primary/10 text-primary border-primary/20">
                                                        {userJabatan}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-muted-foreground">
                                                    {u.creator ? (
                                                        <span className="font-medium text-foreground">
                                                            {u.creator.name} ({u.creator.jabatan || u.creator.role})
                                                        </span>
                                                    ) : (
                                                        <span className="italic text-muted-foreground/60">-</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className="flex items-center justify-center gap-1.5">
                                                        <button
                                                            onClick={() => handleOpenReassignUser(u)}
                                                            className="p-1.5 rounded-lg border border-border bg-card hover:bg-muted text-muted-foreground hover:text-primary transition cursor-pointer shadow-2xs"
                                                            title="Pindahkan Jabatan"
                                                        >
                                                            <MoveRight className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleOpenEditUser(u)}
                                                            className="p-1.5 rounded-lg border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition cursor-pointer shadow-2xs"
                                                            title="Edit User"
                                                        >
                                                            <Edit2 className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteUser(u)}
                                                            className="p-1.5 rounded-lg border border-red-500/20 bg-red-500/5 hover:bg-red-500/15 text-red-600 dark:text-red-400 transition cursor-pointer shadow-2xs"
                                                            title="Hapus User"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {paginatedTableUsers.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="py-12 text-center text-muted-foreground italic">
                                                Tidak ada data akun pengguna yang sesuai dengan filter.
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
                                from={tableUsers.length > 0 ? (tablePage - 1) * tablePerPage + 1 : 0}
                                to={Math.min(tablePage * tablePerPage, tableUsers.length)}
                                total={tableUsers.length}
                                currentPage={tablePage}
                                lastPage={totalTablePages}
                                onPageChange={(p) => setTablePage(p)}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* SLIDE-OUT DRAWER 50%: DETAIL TINGKATAN JABATAN & DAFTAR USER */}
            <Sheet open={!!activeDrawerLevel} onOpenChange={(open) => { if (!open) setActiveDrawerLevel(null); }}>
                <SheetContent side="right" className="w-1/2 max-w-none flex flex-col justify-between">
                    <div className="flex flex-col gap-5 p-4 flex-1 overflow-y-auto">
                        <SheetHeader className="pb-3 border-b border-border/60">
                            <div className="flex justify-between items-start">
                                <div>
                                    <span className="text-xs font-bold text-primary uppercase tracking-wider">
                                        Detail Tingkatan Jabatan
                                    </span>
                                    <SheetTitle className="text-2xl font-bold text-foreground mt-1">
                                        {activeDrawerLevel?.nama_level}
                                    </SheetTitle>
                                    <SheetDescription className="text-xs text-muted-foreground mt-0.5">
                                        {activeDrawerLevel?.deskripsi || 'Tidak ada deskripsi level'}
                                    </SheetDescription>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => activeDrawerLevel && handleOpenAddUser(activeDrawerLevel)}
                                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-foreground text-background font-bold text-xs shadow-xs hover:opacity-90 transition cursor-pointer shrink-0"
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                        <span>Tambah User</span>
                                    </button>
                                </div>
                            </div>
                        </SheetHeader>

                        {/* Authority Callout */}
                        {activeDrawerLevel && activeDrawerLevel.wewenang_note && (
                            <div className="p-4 rounded-2xl bg-muted/40 border border-border/60 text-xs flex items-start gap-3">
                                <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                                <div>
                                    <strong className="text-foreground font-semibold">Wewenang & Hak Akses: </strong>
                                    <span className="text-muted-foreground">{activeDrawerLevel.wewenang_note}</span>
                                </div>
                            </div>
                        )}

                        {/* Search in Drawer */}
                        <div className="relative w-full">
                            <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder={`Cari nama atau email di jabatan ${activeDrawerLevel?.nama_level}...`}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 text-xs bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                        </div>

                        {/* User List Cards inside Drawer */}
                        <div className="flex flex-col gap-3">
                            {drawerUsers.map((u) => (
                                <div
                                    key={u.id}
                                    className="p-4 rounded-2xl bg-card border border-border/80 shadow-xs flex items-center justify-between gap-4 transition hover:border-primary/40"
                                >
                                    <div className="min-w-0 flex-1">
                                        <div className="font-bold text-sm text-foreground truncate">{u.name}</div>
                                        <div className="text-xs text-muted-foreground mt-0.5 truncate">{u.email}</div>
                                        {u.creator && (
                                            <div className="text-[11px] text-primary font-medium mt-1">
                                                Atasan / Dibuat oleh: {u.creator.name} ({u.creator.jabatan || u.creator.role})
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1.5 shrink-0">
                                        <button
                                            onClick={() => handleOpenReassignUser(u)}
                                            className="p-2 rounded-xl border border-border bg-muted/40 hover:bg-muted text-muted-foreground hover:text-primary transition cursor-pointer shadow-2xs"
                                            title="Pindahkan Jabatan User"
                                        >
                                            <MoveRight className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleOpenEditUser(u)}
                                            className="p-2 rounded-xl border border-border bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground transition cursor-pointer shadow-2xs"
                                            title="Edit Akun"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteUser(u)}
                                            className="p-2 rounded-xl border border-red-500/20 bg-red-500/5 hover:bg-red-500/15 text-red-600 dark:text-red-400 transition cursor-pointer shadow-2xs"
                                            title="Hapus Akun"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {drawerUsers.length === 0 && (
                                <div className="py-16 text-center text-xs text-muted-foreground italic bg-muted/20 rounded-2xl border border-dashed border-border/80">
                                    Belum ada akun pengguna aktif di jabatan ini.
                                </div>
                            )}
                        </div>
                    </div>

                    <SheetFooter className="p-4 border-t border-border/60">
                        <button
                            type="button"
                            onClick={() => setActiveDrawerLevel(null)}
                            className="w-full px-4 py-2.5 border border-border rounded-xl text-sm font-semibold hover:bg-muted transition cursor-pointer"
                        >
                            Tutup Detail
                        </button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>

            {/* MODAL: Tambah User */}
            <Sheet open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
                <SheetContent side="right" className="w-1/2 max-w-none">
                    <SheetHeader>
                        <SheetTitle>Tambah Pengguna Baru</SheetTitle>
                        <SheetDescription>Daftarkan akun pengguna baru ke dalam struktur hierarki organisasi.</SheetDescription>
                    </SheetHeader>
                    <form onSubmit={handleStoreUserSubmit} className="flex flex-col gap-5 p-4 flex-1 overflow-y-auto">
                        {currentUserRole === 'super_admin_master' && tenants.length > 0 && (
                            <div>
                                <InputLabel htmlFor="tenant_id" value="Pilih Tenant Travel *" />
                                <select
                                    id="tenant_id"
                                    value={userForm.data.tenant_id}
                                    onChange={(e) => userForm.setData('tenant_id', e.target.value)}
                                    className="mt-1 block w-full bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    required
                                >
                                    {tenants.map((t) => (
                                        <option key={t.id} value={t.id.toString()}>{t.nama_travel}</option>
                                    ))}
                                </select>
                                <InputError message={userForm.errors.tenant_id} className="mt-2" />
                            </div>
                        )}
                        <div>
                            <InputLabel htmlFor="name" value="Nama Lengkap" />
                            <TextInput
                                id="name"
                                type="text"
                                value={userForm.data.name}
                                onChange={(e) => userForm.setData('name', e.target.value)}
                                className="mt-1 block w-full"
                                required
                                placeholder="Misal: Ust. Syahrul Ramadhan"
                            />
                            <InputError message={userForm.errors.name} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="email" value="Alamat Email" />
                            <TextInput
                                id="email"
                                type="email"
                                value={userForm.data.email}
                                onChange={(e) => userForm.setData('email', e.target.value)}
                                className="mt-1 block w-full"
                                required
                                placeholder="syahrul@travel.com"
                            />
                            <InputError message={userForm.errors.email} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="hierarchy_level_id" value="Tingkatan Jabatan *" />
                            <select
                                id="hierarchy_level_id"
                                value={userForm.data.hierarchy_level_id}
                                onChange={(e) => userForm.setData('hierarchy_level_id', e.target.value)}
                                className="mt-1 block w-full bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                                required
                            >
                                {allLevels.map((lvl) => (
                                    <option key={lvl.id} value={lvl.id.toString()}>
                                        {lvl.nama_level} ({lvl.role_key})
                                    </option>
                                ))}
                            </select>
                            <InputError message={userForm.errors.hierarchy_level_id} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="password" value="Kata Sandi Awal" />
                            <TextInput
                                id="password"
                                type="password"
                                value={userForm.data.password}
                                onChange={(e) => userForm.setData('password', e.target.value)}
                                className="mt-1 block w-full"
                                required
                                placeholder="Minimal 6 karakter"
                            />
                            <InputError message={userForm.errors.password} className="mt-2" />
                        </div>

                        <SheetFooter>
                            <button
                                type="button"
                                onClick={() => setIsAddUserOpen(false)}
                                className="px-4 py-2 border border-border rounded-lg text-sm"
                            >
                                Batal
                            </button>
                            <PrimaryButton disabled={userForm.processing}>
                                Buat Akun
                            </PrimaryButton>
                        </SheetFooter>
                    </form>
                </SheetContent>
            </Sheet>

            {/* MODAL: Edit User */}
            <Sheet open={!!editingUser} onOpenChange={(open) => { if (!open) setEditingUser(null); }}>
                <SheetContent side="right" className="w-1/2 max-w-none">
                    <SheetHeader>
                        <SheetTitle>Edit Pengguna: {editingUser?.name}</SheetTitle>
                        <SheetDescription>Perbarui data profil pengguna atau reset kata sandi.</SheetDescription>
                    </SheetHeader>
                    <form onSubmit={handleUpdateUserSubmit} className="flex flex-col gap-5 p-4 flex-1">
                        <div>
                            <InputLabel htmlFor="edit_name" value="Nama Lengkap" />
                            <TextInput
                                id="edit_name"
                                type="text"
                                value={editUserForm.data.name}
                                onChange={(e) => editUserForm.setData('name', e.target.value)}
                                className="mt-1 block w-full"
                                required
                            />
                            <InputError message={editUserForm.errors.name} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="edit_email" value="Alamat Email" />
                            <TextInput
                                id="edit_email"
                                type="email"
                                value={editUserForm.data.email}
                                onChange={(e) => editUserForm.setData('email', e.target.value)}
                                className="mt-1 block w-full"
                                required
                            />
                            <InputError message={editUserForm.errors.email} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="edit_level" value="Tingkatan Jabatan" />
                            <select
                                id="edit_level"
                                value={editUserForm.data.hierarchy_level_id}
                                onChange={(e) => editUserForm.setData('hierarchy_level_id', e.target.value)}
                                className="mt-1 block w-full bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                            >
                                {allLevels.map((lvl) => (
                                    <option key={lvl.id} value={lvl.id.toString()}>
                                        {lvl.nama_level} ({lvl.role_key})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <InputLabel htmlFor="edit_password" value="Kata Sandi Baru (Opsional)" />
                            <TextInput
                                id="edit_password"
                                type="password"
                                value={editUserForm.data.password}
                                onChange={(e) => editUserForm.setData('password', e.target.value)}
                                className="mt-1 block w-full"
                                placeholder="Kosongkan jika tidak ingin mengubah sandi"
                            />
                            <InputError message={editUserForm.errors.password} className="mt-2" />
                        </div>

                        <SheetFooter>
                            <button
                                type="button"
                                onClick={() => setEditingUser(null)}
                                className="px-4 py-2 border border-border rounded-lg text-sm"
                            >
                                Batal
                            </button>
                            <PrimaryButton disabled={editUserForm.processing}>
                                Simpan Perubahan
                            </PrimaryButton>
                        </SheetFooter>
                    </form>
                </SheetContent>
            </Sheet>

            {/* MODAL: Pindahkan User (Reassign) */}
            <Sheet open={!!reassigningUser} onOpenChange={(open) => { if (!open) setReassigningUser(null); }}>
                <SheetContent side="right" className="w-1/2 max-w-none">
                    <SheetHeader>
                        <SheetTitle>Pindahkan Jabatan: {reassigningUser?.name}</SheetTitle>
                        <SheetDescription>
                            Pindahkan akun pengguna ke tingkatan struktur jabatan yang baru. Hak akses dan role sistem akan disinkronkan secara otomatis.
                        </SheetDescription>
                    </SheetHeader>
                    <form onSubmit={handleReassignSubmit} className="flex flex-col gap-5 p-4 flex-1">
                        <div className="p-3.5 bg-muted/40 rounded-xl border border-border text-xs">
                            <span className="text-muted-foreground">Jabatan Saat Ini: </span>
                            <span className="font-bold text-foreground">
                                {reassigningUser?.jabatan || reassigningUser?.hierarchy_level?.nama_level || 'Belum Ditentukan'}
                            </span>
                        </div>

                        <div>
                            <InputLabel htmlFor="target_level_id" value="Pilih Tingkatan Jabatan Tujuan *" />
                            <select
                                id="target_level_id"
                                value={reassignForm.data.target_level_id}
                                onChange={(e) => reassignForm.setData('target_level_id', e.target.value)}
                                className="mt-1 block w-full bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                                required
                            >
                                {allLevels.map((lvl) => (
                                    <option key={lvl.id} value={lvl.id.toString()}>
                                        {lvl.nama_level} (Role: {lvl.role_key})
                                    </option>
                                ))}
                            </select>
                            <InputError message={reassignForm.errors.target_level_id} className="mt-2" />
                        </div>

                        <SheetFooter>
                            <button
                                type="button"
                                onClick={() => setReassigningUser(null)}
                                className="px-4 py-2 border border-border rounded-lg text-sm"
                            >
                                Batal
                            </button>
                            <PrimaryButton disabled={reassignForm.processing}>
                                Pindahkan User
                            </PrimaryButton>
                        </SheetFooter>
                    </form>
                </SheetContent>
            </Sheet>

            {/* MODAL: Tambah / Edit Hierarchy Level */}
            <Sheet open={!!levelModalMode} onOpenChange={(open) => { if (!open) setLevelModalMode(null); }}>
                <SheetContent side="right" className="w-1/2 max-w-none">
                    <SheetHeader>
                        <SheetTitle>
                            {levelModalMode === 'create' ? 'Tambah Tingkatan Jabatan Baru' : `Edit Level: ${editingLevel?.nama_level}`}
                        </SheetTitle>
                        <SheetDescription>
                            Atur nama jabatan, atasan langsung (parent), wewenang, dan role sistem.
                        </SheetDescription>
                    </SheetHeader>
                    <form onSubmit={handleLevelFormSubmit} className="flex flex-col gap-5 p-4 flex-1 overflow-y-auto">
                        <div>
                            <InputLabel htmlFor="nama_level" value="Nama Jabatan / Level *" />
                            <TextInput
                                id="nama_level"
                                type="text"
                                value={levelForm.data.nama_level}
                                onChange={(e) => levelForm.setData('nama_level', e.target.value)}
                                className="mt-1 block w-full"
                                required
                                placeholder="Misal: Koordinator Wilayah, Senior Agen, Branch Manager"
                            />
                            <InputError message={levelForm.errors.nama_level} className="mt-2" />
                        </div>

                        {levelModalMode === 'create' && (
                            <div>
                                <InputLabel htmlFor="parent_id" value="Atasan Langsung (Parent Level) *" />
                                <select
                                    id="parent_id"
                                    value={levelForm.data.parent_id}
                                    onChange={(e) => {
                                        const pid = e.target.value;
                                        const parentObj = allLevels.find((l) => l.id.toString() === pid);
                                        levelForm.setData((data) => ({
                                            ...data,
                                            parent_id: pid,
                                            role_key: parentObj?.role_key === 'owner_travel' ? 'admin_travel' : 'agen',
                                        }));
                                    }}
                                    className="mt-1 block w-full bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    required={currentUserRole !== 'super_admin_master'}
                                >
                                    {currentUserRole === 'super_admin_master' && (
                                        <option value="">Level Tertinggi (Root / Tanpa Atasan)</option>
                                    )}
                                    {allLevels.map((lvl) => (
                                        <option key={lvl.id} value={lvl.id.toString()}>
                                            {lvl.nama_level} {lvl.role_key === 'owner_travel' ? '(Pimpinan Tertinggi)' : ''}
                                        </option>
                                    ))}
                                </select>
                                <InputError message={levelForm.errors.parent_id} className="mt-2" />
                            </div>
                        )}

                        <div>
                            <InputLabel htmlFor="role_key" value="Role Sistem Dasar (Hak Akses Sistem) *" />
                            <select
                                id="role_key"
                                value={levelForm.data.role_key}
                                onChange={(e) => levelForm.setData('role_key', e.target.value as any)}
                                className="mt-1 block w-full bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                                required
                            >
                                <option value="agen">Agen (Direct Sales / Mitra Lapangan)</option>
                                <option value="admin_travel">Admin Travel (Pengawas Tim / Operasional)</option>
                                {currentUserRole === 'super_admin_master' && (
                                    <option value="owner_travel">Owner Travel (Pimpinan Penuh)</option>
                                )}
                            </select>
                            <InputError message={levelForm.errors.role_key} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="deskripsi" value="Deskripsi Singkat" />
                            <TextInput
                                id="deskripsi"
                                type="text"
                                value={levelForm.data.deskripsi}
                                onChange={(e) => levelForm.setData('deskripsi', e.target.value)}
                                className="mt-1 block w-full"
                                placeholder="Contoh: Mengkoordinasikan pendaftaran agen wilayah barat"
                            />
                        </div>

                        <div>
                            <InputLabel htmlFor="wewenang_note" value="Catatan Wewenang & Tanggung Jawab" />
                            <textarea
                                id="wewenang_note"
                                rows={3}
                                value={levelForm.data.wewenang_note}
                                onChange={(e) => levelForm.setData('wewenang_note', e.target.value)}
                                className="mt-1 block w-full bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                                placeholder="Deskripsikan wewenang atau KPI utama pemegang jabatan ini..."
                            />
                        </div>

                        <SheetFooter>
                            <button
                                type="button"
                                onClick={() => setLevelModalMode(null)}
                                className="px-4 py-2 border border-border rounded-lg text-sm"
                            >
                                Batal
                            </button>
                            <PrimaryButton disabled={levelForm.processing}>
                                {levelModalMode === 'create' ? 'Tambah Level' : 'Simpan Perubahan'}
                            </PrimaryButton>
                        </SheetFooter>
                    </form>
                </SheetContent>
            </Sheet>

            {/* MODAL: Hapus Level & Migrasi User */}
            <Sheet open={!!deletingLevel} onOpenChange={(open) => { if (!open) setDeletingLevel(null); }}>
                <SheetContent side="right" className="w-1/2 max-w-none">
                    <SheetHeader>
                        <SheetTitle className="text-red-600">Hapus Tingkatan: {deletingLevel?.nama_level}</SheetTitle>
                        <SheetDescription>
                            Tindakan ini akan menghapus tingkatan jabatan dari pohon hierarki tenant Anda.
                        </SheetDescription>
                    </SheetHeader>
                    <form onSubmit={handleDeleteLevelSubmit} className="flex flex-col gap-5 p-4 flex-1">
                        {deletingLevel && (levelCounts[deletingLevel.id] || 0) > 0 ? (
                            <div className="flex flex-col gap-4">
                                <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-xs text-amber-900 dark:text-amber-200">
                                    <strong className="block font-bold mb-1">
                                        Perhatian: Terdapat {levelCounts[deletingLevel.id]} akun pengguna di jabatan ini!
                                    </strong>
                                    Untuk mencegah user kehilangan jabatan, silakan pilih tingkatan jabatan baru untuk memindahkan seluruh user secara otomatis:
                                </div>

                                <div>
                                    <InputLabel htmlFor="reassign_target" value="Pindahkan Seluruh User ke *" />
                                    <select
                                        id="reassign_target"
                                        value={deleteLevelForm.data.reassign_to_level_id}
                                        onChange={(e) => deleteLevelForm.setData('reassign_to_level_id', e.target.value)}
                                        className="mt-1 block w-full bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        required
                                    >
                                        <option value="">-- Pilih Jabatan Tujuan --</option>
                                        {allLevels
                                            .filter((l) => l.id !== deletingLevel.id)
                                            .map((lvl) => (
                                                <option key={lvl.id} value={lvl.id.toString()}>
                                                    {lvl.nama_level} ({lvl.role_key})
                                                </option>
                                            ))}
                                    </select>
                                    <InputError message={deleteLevelForm.errors.reassign_to_level_id} className="mt-2" />
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                Tidak ada pengguna di tingkatan jabatan ini. Level ini dapat langsung dihapus dengan aman.
                            </p>
                        )}

                        <SheetFooter>
                            <button
                                type="button"
                                onClick={() => setDeletingLevel(null)}
                                className="px-4 py-2 border border-border rounded-lg text-sm"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                disabled={deleteLevelForm.processing}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-lg transition disabled:opacity-50"
                            >
                                Hapus & Migrasikan
                            </button>
                        </SheetFooter>
                    </form>
                </SheetContent>
            </Sheet>
        </PageLayout>
    );
}
