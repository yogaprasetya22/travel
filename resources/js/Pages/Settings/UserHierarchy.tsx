import React, { useState, useMemo } from 'react';
import { useForm, usePage } from '@inertiajs/react';
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
} from 'lucide-react';
import DataTablePagination from '@/Components/DataTablePagination';
import PerPageSelector from '@/Components/PerPageSelector';
import { useDebounce } from '@/hooks/use-debounce';

interface HierarchyUser {
    id: number;
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
}

interface TenantItem {
    id: number;
    nama_travel: string;
}

interface UserHierarchyProps extends PageProps {
    users: HierarchyUser[];
    tenants: TenantItem[];
    currentUserRole: string;
}

// Tree Node structure definition for the 4 hierarchy levels
interface RoleNode {
    id: string;
    title: string;
    roleKey: 'super_admin_master' | 'owner_travel' | 'admin_travel' | 'agen';
    levelDesc: string;
    authorityNote: string;
    children?: RoleNode[];
}

const HIERARCHY_TREE: RoleNode[] = [
    {
        id: 'Owner',
        title: 'Owner',
        roleKey: 'owner_travel',
        levelDesc: 'Pimpinan & Pemilik Tenant Travel',
        authorityNote: 'Memiliki otoritas penuh atas seluruh manajemen tenant, keuangan, dan seluruh cabang struktur organisasi.',
        children: [
            {
                id: 'Supervisor',
                title: 'Supervisor',
                roleKey: 'admin_travel',
                levelDesc: 'Supervisor Pembina Mitra & Operasional',
                authorityNote: 'Membina team leader dan memonitor target penjualan serta evaluasi tim lapangan.',
                children: [
                    {
                        id: 'Team Leader',
                        title: 'Team Leader',
                        roleKey: 'admin_travel',
                        levelDesc: 'Ketua Tim Lapangan & Pembina Agen',
                        authorityNote: 'Membimbing staff agen dalam follow-up calon jamaah dan penyuluhan manasik.',
                        children: [
                            {
                                id: 'Staff',
                                title: 'Staff',
                                roleKey: 'agen',
                                levelDesc: 'Mitra Sales Agen Lapangan (Direct Sales)',
                                authorityNote: 'Merekrut dan melakukan pendekatan langsung dengan calon jamaah serta berhak atas komisi closing.',
                            },
                        ],
                    },
                ],
            },
        ],
    },
];

export default function UserHierarchy({
    users = [],
    tenants = [],
    currentUserRole,
}: UserHierarchyProps) {
    const { auth } = usePage<PageProps>().props;

    // View mode: 'canvas' (Visual Stepped Tree) | 'table' (Tabular Listing)
    const [viewMode, setViewMode] = useState<'canvas' | 'table'>('canvas');

    // Track collapsed/expanded node IDs in Canvas mode
    const [expandedNodeIds, setExpandedNodeIds] = useState<Record<string, boolean>>({
        'Owner': true,
        'Supervisor': true,
        'Team Leader': true,
        'Staff': true,
    });

    const [activeDrawerRole, setActiveDrawerRole] = useState<RoleNode | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [tableSearchQuery, setTableSearchQuery] = useState('');
    const [tableJabatanFilter, setTableJabatanFilter] = useState<string>('all');
    const [isAddUserOpen, setIsAddUserOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<HierarchyUser | null>(null);

    const createForm = useForm({
        name: '',
        email: '',
        password: '',
        role: 'agen',
        jabatan: 'Staff',
        tenant_id: tenants[0]?.id ? tenants[0].id.toString() : '',
    });

    const editForm = useForm({
        name: '',
        email: '',
        jabatan: '',
        password: '',
    });

    const handleExpandAll = () => {
        setExpandedNodeIds({
            'Owner': true,
            'Supervisor': true,
            'Team Leader': true,
            'Staff': true,
        });
    };

    const handleCollapseAll = () => {
        setExpandedNodeIds({});
    };

    const toggleNode = (nodeId: string) => {
        setExpandedNodeIds((prev) => ({
            ...prev,
            [nodeId]: !prev[nodeId],
        }));
    };

    // Calculate count from real database users per jabatan (excluding Super Admin Master)
    const roleCounts = useMemo(() => {
        const counts: Record<string, number> = {};
        const allJabatan = ['Owner', 'Supervisor', 'Team Leader', 'Staff'];

        allJabatan.forEach((jb) => {
            const countInDb = users.filter((u) => {
                if (u.role === 'super_admin_master') return false;
                if (u.jabatan) {
                    return u.jabatan.toLowerCase() === jb.toLowerCase();
                }
                if (jb === 'Owner' && u.role === 'owner_travel') return true;
                if (jb === 'Staff' && u.role === 'agen') return true;
                if (jb === 'Supervisor' && u.role === 'admin_travel') return true;
                return false;
            }).length;

            counts[jb] = countInDb;
        });

        return counts;
    }, [users]);

    const debouncedSearchQuery = useDebounce(searchQuery, 300);
    const debouncedTableSearchQuery = useDebounce(tableSearchQuery, 300);

    // Filter users inside Drawer by search query
    const drawerUsers = useMemo(() => {
        if (!activeDrawerRole) return [];
        const jb = activeDrawerRole.title;

        return users.filter((u) => {
            if (u.role === 'super_admin_master') return false;

            const matchesJabatan =
                (u.jabatan && u.jabatan.toLowerCase() === jb.toLowerCase()) ||
                (jb === 'Owner' && u.role === 'owner_travel') ||
                (jb === 'Staff' && u.role === 'agen') ||
                (jb === 'Supervisor' && u.role === 'admin_travel' && (!u.jabatan || u.jabatan === 'Supervisor'));

            const matchesSearch =
                !debouncedSearchQuery.trim() ||
                u.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
                u.email.toLowerCase().includes(debouncedSearchQuery.toLowerCase());

            return matchesJabatan && matchesSearch;
        });
    }, [users, activeDrawerRole, debouncedSearchQuery]);

    // Filter users in Table Mode
    const tableUsers = useMemo(() => {
        return users.filter((u) => {
            if (u.role === 'super_admin_master') return false;

            const userJabatan = u.jabatan || (u.role === 'owner_travel' ? 'Owner' : u.role === 'agen' ? 'Staff' : 'Supervisor');
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

    const handleOpenRoleDrawer = (node: RoleNode) => {
        setActiveDrawerRole(node);
        setSearchQuery('');
    };

    const handleOpenAddUser = (node?: RoleNode) => {
        const defaultJabatan = node ? node.title : 'Staff';
        const defaultRole = node ? node.roleKey : 'agen';

        createForm.setData({
            name: '',
            email: '',
            password: '',
            role: defaultRole,
            jabatan: defaultJabatan,
            tenant_id: tenants[0]?.id ? tenants[0].id.toString() : '',
        });
        setIsAddUserOpen(true);
    };

    const handleOpenEditUser = (user: HierarchyUser) => {
        setEditingUser(user);
        editForm.setData({
            name: user.name,
            email: user.email,
            jabatan: user.jabatan || activeDrawerRole?.title || '',
            password: '',
        });
    };

    const handleStoreSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post(route('settings.users.store'), {
            onSuccess: () => {
                createForm.reset();
                setIsAddUserOpen(false);
            },
        });
    };

    const handleUpdateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingUser) return;
        editForm.put(route('settings.users.update', editingUser.id), {
            onSuccess: () => {
                setEditingUser(null);
                editForm.reset();
            },
        });
    };

    // Render tree node with exact stepped lines in Canvas mode
    const renderTreeNode = (node: RoleNode, depth = 0) => {
        const isExpanded = !!expandedNodeIds[node.id];
        const count = roleCounts[node.id] || 0;
        const hasChildren = node.children && node.children.length > 0;
        const isSelected = activeDrawerRole?.id === node.id;

        return (
            <div key={node.id} className="relative flex flex-col">
                {/* Node Row */}
                <div
                    className="flex items-center gap-3 relative py-3 select-none"
                    style={{ paddingLeft: `${depth * 52}px` }}
                >
                    {/* Stepped Connector Lines */}
                    {depth > 0 && (
                        <div
                            className="absolute border-l-2 border-b-2 border-border/80 rounded-bl-2xl transition-all"
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
                            className="h-8 w-8 rounded-xl bg-card border border-border/80 hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-all shadow-xs z-10 cursor-pointer"
                        >
                            {isExpanded ? (
                                <ChevronDown className="w-4 h-4" />
                            ) : (
                                <ChevronRight className="w-4 h-4" />
                            )}
                        </button>
                    ) : (
                        <div className="w-8 shrink-0" />
                    )}

                    {/* Role Pill Card */}
                    <div
                        onClick={() => handleOpenRoleDrawer(node)}
                        className={`group flex items-center gap-3.5 px-5 py-2.5 rounded-2xl border transition-all cursor-pointer z-10 ${
                            isSelected
                                ? 'bg-card text-foreground border-foreground shadow-md ring-2 ring-primary/20 scale-[1.02]'
                                : 'bg-card/90 hover:bg-card text-foreground border-border/80 hover:border-border hover:shadow-sm'
                        }`}
                    >
                        {isSelected && (
                            <div className="h-5 w-5 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                                <Check className="w-3 h-3 stroke-[3]" />
                            </div>
                        )}

                        <span className="font-bold text-base text-foreground tracking-tight">
                            {node.title}
                        </span>

                        <span className="px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground text-xs font-bold">
                            {count}
                        </span>
                    </div>
                </div>

                {/* Render Nested Children */}
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
            title="Hierarki User & Akses"
            breadcrumbParent="Manajemen Pengguna"
            breadcrumbPage="Hierarki & Izin User"
            contentClass="p-6 md:p-8 flex flex-col gap-6 w-full max-w-none"
        >
            {/* Top Toolbar */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card/60 backdrop-blur-md p-6 rounded-2xl border border-border/80 shadow-xs">
                <div>
                    <div className="flex items-center gap-2.5">
                        <div className="h-8 w-1.5 rounded-full bg-primary" />
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                            Hierarki Struktur Organisasi User
                        </h1>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 ml-4">
                        Pohon struktur jabatan dari Owner, Supervisor, Team Leader hingga Staff Agen lapangan untuk pembagian hak akses.
                    </p>
                </div>

                {/* Mode Switcher & Controls */}
                <div className="flex items-center gap-4 flex-wrap">
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
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleExpandAll}
                                className="text-sm font-semibold text-primary hover:underline cursor-pointer"
                            >
                                Expand All
                            </button>
                            <span className="text-muted-foreground/40">|</span>
                            <button
                                onClick={handleCollapseAll}
                                className="text-sm font-semibold text-primary hover:underline cursor-pointer"
                            >
                                Collapse All
                            </button>
                        </div>
                    )}

                    {/* Table Mode Action: Add User directly */}
                    {viewMode === 'table' && (
                        <button
                            onClick={() => handleOpenAddUser()}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-xs hover:opacity-90 transition cursor-pointer"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Tambah User</span>
                        </button>
                    )}
                </div>
            </div>

            {/* MODE 1: FULL-WIDTH STEPPED CANVAS CONTAINER */}
            {viewMode === 'canvas' && (
                <div className="w-full bg-card/70 backdrop-blur-md border border-border/80 rounded-3xl p-6 sm:p-10 shadow-xs min-h-[600px] overflow-x-auto">
                    <div className="flex flex-col gap-1 min-w-[700px]">
                        {HIERARCHY_TREE.map((rootNode) => renderTreeNode(rootNode, 0))}
                    </div>
                </div>
            )}

            {/* MODE 2: TABLE LISTING VIEW */}
            {viewMode === 'table' && (
                <div className="flex flex-col gap-4">
                    {/* Filters bar */}
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-3 bg-card/60 p-4 rounded-2xl border border-border/80 shadow-xs">
                        <div className="relative w-full sm:w-80">
                            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Cari nama, email, atau jabatan..."
                                value={tableSearchQuery}
                                onChange={(e) => setTableSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-1.5 text-xs bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
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
                                <span className="text-xs text-muted-foreground font-medium shrink-0">Filter Jabatan:</span>
                                <select
                                    value={tableJabatanFilter}
                                    onChange={(e) => {
                                        setTableJabatanFilter(e.target.value);
                                        setTablePage(1);
                                    }}
                                    className="text-xs bg-background border border-border rounded-xl px-3 py-1.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                                >
                                    <option value="all">Semua Jabatan ({tableUsers.length})</option>
                                    <option value="Owner">Owner ({roleCounts['Owner'] || 0})</option>
                                    <option value="Supervisor">Supervisor ({roleCounts['Supervisor'] || 0})</option>
                                    <option value="Team Leader">Team Leader ({roleCounts['Team Leader'] || 0})</option>
                                    <option value="Staff">Staff ({roleCounts['Staff'] || 0})</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Full-width Responsive Table */}
                    <div className="overflow-hidden rounded-2xl border border-border/80 bg-card/70 backdrop-blur-md shadow-xs">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-border/80 bg-muted/50 text-xs font-bold text-foreground">
                                        <th className="px-6 py-4">Nama Lengkap</th>
                                        <th className="px-6 py-4">Alamat Email</th>
                                        <th className="px-6 py-4 text-center">Tingkatan Jabatan</th>
                                        <th className="px-6 py-4">Atasan Langsung / Pembuat</th>
                                        <th className="px-6 py-4 text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/60 text-xs">
                                    {paginatedTableUsers.map((u) => {
                                        const userJabatan = u.jabatan || (u.role === 'owner_travel' ? 'Owner' : u.role === 'agen' ? 'Staff' : 'Supervisor');
                                        return (
                                            <tr key={u.id} className="hover:bg-muted/40 transition-colors">
                                                <td className="px-6 py-4 font-bold text-foreground">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="h-7 w-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                                                            {u.name.substring(0, 2).toUpperCase()}
                                                        </div>
                                                        <span>{u.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-muted-foreground">{u.email}</td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`px-3 py-1 rounded-full font-bold text-[11px] border ${
                                                        userJabatan === 'Owner'
                                                            ? 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                                                            : userJabatan === 'Supervisor'
                                                            ? 'bg-sky-500/10 text-sky-600 border-sky-500/20'
                                                            : userJabatan === 'Team Leader'
                                                            ? 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20'
                                                            : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                                                    }`}>
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
                                                    <button
                                                        onClick={() => handleOpenEditUser(u)}
                                                        className="p-1.5 rounded-lg border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition cursor-pointer"
                                                        title="Edit User"
                                                    >
                                                        <Edit2 className="w-3.5 h-3.5" />
                                                    </button>
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
            <Sheet open={!!activeDrawerRole} onOpenChange={(open) => { if (!open) setActiveDrawerRole(null); }}>
                <SheetContent side="right" className="w-1/2 max-w-none flex flex-col justify-between">
                    <div className="flex flex-col gap-5 p-4 flex-1 overflow-y-auto">
                        <SheetHeader className="pb-3 border-b border-border/60">
                            <div className="flex justify-between items-start">
                                <div>
                                    <span className="text-xs font-bold text-primary uppercase tracking-wider">
                                        Detail Tingkatan Jabatan
                                    </span>
                                    <SheetTitle className="text-2xl font-bold text-foreground mt-1">
                                        {activeDrawerRole?.title}
                                    </SheetTitle>
                                    <SheetDescription className="text-xs text-muted-foreground mt-0.5">
                                        {activeDrawerRole?.levelDesc}
                                    </SheetDescription>
                                </div>

                                <button
                                    onClick={() => activeDrawerRole && handleOpenAddUser(activeDrawerRole)}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-foreground text-background font-bold text-xs shadow-xs hover:opacity-90 transition cursor-pointer shrink-0"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span>Tambah User</span>
                                </button>
                            </div>
                        </SheetHeader>

                        {/* Authority Callout */}
                        {activeDrawerRole && (
                            <div className="p-4 rounded-2xl bg-muted/40 border border-border/60 text-xs flex items-start gap-3">
                                <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                                <div>
                                    <strong className="text-foreground font-semibold">Wewenang: </strong>
                                    <span className="text-muted-foreground">{activeDrawerRole.authorityNote}</span>
                                </div>
                            </div>
                        )}

                        {/* Search in Drawer */}
                        <div className="relative w-full">
                            <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder={`Cari nama atau email di jabatan ${activeDrawerRole?.title}...`}
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
                                    <button
                                        onClick={() => handleOpenEditUser(u)}
                                        className="p-2 rounded-xl border border-border bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground transition cursor-pointer shrink-0"
                                        title="Edit Akun"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
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
                            onClick={() => setActiveDrawerRole(null)}
                            className="w-full px-4 py-2.5 border border-border rounded-xl text-sm font-semibold hover:bg-muted transition cursor-pointer"
                        >
                            Tutup Detail
                        </button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>

            {/* Drawer: Add User */}
            <Sheet open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
                <SheetContent side="right" className="w-1/2 max-w-none">
                    <SheetHeader>
                        <SheetTitle>Tambah Pengguna: {createForm.data.jabatan}</SheetTitle>
                        <SheetDescription>Daftarkan akun pengguna baru ke dalam struktur organisasi.</SheetDescription>
                    </SheetHeader>
                    <form onSubmit={handleStoreSubmit} className="flex flex-col gap-5 p-4 flex-1">
                        <div>
                            <InputLabel htmlFor="name" value="Nama Lengkap" />
                            <TextInput
                                id="name"
                                type="text"
                                value={createForm.data.name}
                                onChange={(e) => createForm.setData('name', e.target.value)}
                                className="mt-1 block w-full"
                                required
                                placeholder="Misal: Ust. Syahrul Ramadhan"
                            />
                            <InputError message={createForm.errors.name} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="email" value="Alamat Email" />
                            <TextInput
                                id="email"
                                type="email"
                                value={createForm.data.email}
                                onChange={(e) => createForm.setData('email', e.target.value)}
                                className="mt-1 block w-full"
                                required
                                placeholder="syahrul@travel.com"
                            />
                            <InputError message={createForm.errors.email} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="jabatan" value="Jabatan Struktur" />
                            <select
                                id="jabatan"
                                value={createForm.data.jabatan}
                                onChange={(e) => {
                                    const jb = e.target.value;
                                    let role = 'agen';
                                    if (jb === 'Owner') role = 'owner_travel';
                                    else if (jb === 'Supervisor' || jb === 'Team Leader') role = 'admin_travel';
                                    createForm.setData((data) => ({
                                        ...data,
                                        jabatan: jb,
                                        role: role,
                                    }));
                                }}
                                className="mt-1 block w-full bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                            >
                                <option value="Owner">Owner</option>
                                <option value="Supervisor">Supervisor</option>
                                <option value="Team Leader">Team Leader</option>
                                <option value="Staff">Staff</option>
                            </select>
                        </div>

                        <div>
                            <InputLabel htmlFor="password" value="Kata Sandi Awal" />
                            <TextInput
                                id="password"
                                type="password"
                                value={createForm.data.password}
                                onChange={(e) => createForm.setData('password', e.target.value)}
                                className="mt-1 block w-full"
                                required
                                placeholder="Minimal 6 karakter"
                            />
                            <InputError message={createForm.errors.password} className="mt-2" />
                        </div>

                        <SheetFooter>
                            <button
                                type="button"
                                onClick={() => setIsAddUserOpen(false)}
                                className="px-4 py-2 border border-border rounded-lg text-sm"
                            >
                                Batal
                            </button>
                            <PrimaryButton disabled={createForm.processing}>
                                Buat Akun
                            </PrimaryButton>
                        </SheetFooter>
                    </form>
                </SheetContent>
            </Sheet>

            {/* Drawer: Edit User */}
            <Sheet open={!!editingUser} onOpenChange={(open) => { if (!open) setEditingUser(null); }}>
                <SheetContent side="right" className="w-1/2 max-w-none">
                    <SheetHeader>
                        <SheetTitle>Edit Pengguna: {editingUser?.name}</SheetTitle>
                        <SheetDescription>Perbarui data profil pengguna atau reset kata sandi.</SheetDescription>
                    </SheetHeader>
                    <form onSubmit={handleUpdateSubmit} className="flex flex-col gap-5 p-4 flex-1">
                        <div>
                            <InputLabel htmlFor="edit_name" value="Nama Lengkap" />
                            <TextInput
                                id="edit_name"
                                type="text"
                                value={editForm.data.name}
                                onChange={(e) => editForm.setData('name', e.target.value)}
                                className="mt-1 block w-full"
                                required
                            />
                            <InputError message={editForm.errors.name} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="edit_email" value="Alamat Email" />
                            <TextInput
                                id="edit_email"
                                type="email"
                                value={editForm.data.email}
                                onChange={(e) => editForm.setData('email', e.target.value)}
                                className="mt-1 block w-full"
                                required
                            />
                            <InputError message={editForm.errors.email} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="edit_jabatan" value="Jabatan" />
                            <select
                                id="edit_jabatan"
                                value={editForm.data.jabatan}
                                onChange={(e) => editForm.setData('jabatan', e.target.value)}
                                className="mt-1 block w-full bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                            >
                                <option value="Owner">Owner</option>
                                <option value="Supervisor">Supervisor</option>
                                <option value="Team Leader">Team Leader</option>
                                <option value="Staff">Staff</option>
                            </select>
                            <InputError message={editForm.errors.jabatan} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="edit_password" value="Kata Sandi Baru (Opsional)" />
                            <TextInput
                                id="edit_password"
                                type="password"
                                value={editForm.data.password}
                                onChange={(e) => editForm.setData('password', e.target.value)}
                                className="mt-1 block w-full"
                                placeholder="Kosongkan jika tidak ingin mengubah sandi"
                            />
                            <InputError message={editForm.errors.password} className="mt-2" />
                        </div>

                        <SheetFooter>
                            <button
                                type="button"
                                onClick={() => setEditingUser(null)}
                                className="px-4 py-2 border border-border rounded-lg text-sm"
                            >
                                Batal
                            </button>
                            <PrimaryButton disabled={editForm.processing}>
                                Simpan Perubahan
                            </PrimaryButton>
                        </SheetFooter>
                    </form>
                </SheetContent>
            </Sheet>
        </PageLayout>
    );
}
