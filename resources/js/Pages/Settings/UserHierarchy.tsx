import React, { useState, useMemo } from 'react';
import { router } from '@inertiajs/react';
import PageLayout from '@/Components/Layouts/PageLayout';
import {
    Plus,
    LayoutGrid,
    Table as TableIcon,
} from 'lucide-react';
import {
    HierarchyLevelItem,
    HierarchyUser,
    UserHierarchyProps,
} from './UserHierarchyPartials/types';
import { AddUserSheet, EditUserSheet } from './UserHierarchyPartials/UserFormSheet';
import { LevelFormModal, DeleteLevelModal } from './UserHierarchyPartials/LevelModals';
import { UserReassignModal } from './UserHierarchyPartials/UserReassignModal';
import { LevelUsersDrawer } from './UserHierarchyPartials/LevelUsersDrawer';
import { UserHierarchyVisual } from './UserHierarchyPartials/UserHierarchyVisual';
import { UserHierarchyTable } from './UserHierarchyPartials/UserHierarchyTable';

export default function UserHierarchy({
    users = [],
    tenants = [],
    selectedTenantId,
    hierarchyTree = [],
    allLevels = [],
    currentUserRole,
}: UserHierarchyProps) {
    // View mode: 'canvas' | 'table'
    const [viewMode, setViewMode] = useState<'canvas' | 'table'>('table');

    // Track collapsed/expanded node IDs in Canvas mode
    const [expandedNodeIds, setExpandedNodeIds] = useState<Record<number, boolean>>(() => {
        const initial: Record<number, boolean> = {};
        allLevels.forEach((l) => {
            initial[l.id] = true;
        });
        return initial;
    });

    // Drawer state
    const [activeDrawerLevel, setActiveDrawerLevel] = useState<HierarchyLevelItem | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Table state
    const [tableSearchQuery, setTableSearchQuery] = useState('');
    const [tableJabatanFilter, setTableJabatanFilter] = useState<string>('all');
    const [tablePage, setTablePage] = useState(1);
    const [tablePerPage, setTablePerPage] = useState(10);

    // User Modals state
    const [isAddUserOpen, setIsAddUserOpen] = useState(false);
    const [addUserDefaultLevelId, setAddUserDefaultLevelId] = useState<number | null>(null);
    const [editingUser, setEditingUser] = useState<HierarchyUser | null>(null);
    const [reassigningUser, setReassigningUser] = useState<HierarchyUser | null>(null);

    // Level Management Modals state
    const [levelModalMode, setLevelModalMode] = useState<'create' | 'edit' | null>(null);
    const [selectedParentLevelId, setSelectedParentLevelId] = useState<number | null>(null);
    const [editingLevel, setEditingLevel] = useState<HierarchyLevelItem | null>(null);
    const [deletingLevel, setDeletingLevel] = useState<HierarchyLevelItem | null>(null);

    // Count users per hierarchy level
    const levelCounts = useMemo(() => {
        const counts: Record<number, number> = {};
        allLevels.forEach((l) => {
            counts[l.id] = 0;
        });
        users.forEach((u) => {
            if (u.hierarchy_level_id && counts[u.hierarchy_level_id] !== undefined) {
                counts[u.hierarchy_level_id]++;
            }
        });
        return counts;
    }, [users, allLevels]);

    // Filtered users for Drawer
    const drawerUsers = useMemo(() => {
        if (!activeDrawerLevel) return [];
        let list = users.filter((u) => u.hierarchy_level_id === activeDrawerLevel.id);
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            list = list.filter(
                (u) =>
                    u.name.toLowerCase().includes(q) ||
                    u.email.toLowerCase().includes(q)
            );
        }
        return list;
    }, [activeDrawerLevel, users, searchQuery]);

    // Filtered users for Table View
    const tableUsers = useMemo(() => {
        let list = [...users];

        if (tableJabatanFilter !== 'all') {
            list = list.filter((u) => {
                if (u.hierarchy_level_id && String(u.hierarchy_level_id) === tableJabatanFilter) {
                    return true;
                }
                if (u.hierarchy_level?.id && String(u.hierarchy_level.id) === tableJabatanFilter) {
                    return true;
                }
                if (u.hierarchy_level?.nama_level === tableJabatanFilter) {
                    return true;
                }
                if (u.jabatan === tableJabatanFilter) {
                    return true;
                }
                return false;
            });
        }

        if (tableSearchQuery.trim()) {
            const q = tableSearchQuery.toLowerCase();
            list = list.filter(
                (u) =>
                    u.name.toLowerCase().includes(q) ||
                    u.email.toLowerCase().includes(q) ||
                    (u.jabatan && u.jabatan.toLowerCase().includes(q)) ||
                    (u.hierarchy_level?.nama_level &&
                        u.hierarchy_level.nama_level.toLowerCase().includes(q))
            );
        }

        return list;
    }, [users, tableJabatanFilter, tableSearchQuery]);

    // Paginated users for Table View
    const paginatedTableUsers = useMemo(() => {
        const start = (tablePage - 1) * tablePerPage;
        return tableUsers.slice(start, start + tablePerPage);
    }, [tableUsers, tablePage, tablePerPage]);

    const totalTablePages = Math.ceil(tableUsers.length / tablePerPage) || 1;

    // Build pagination links
    const tablePaginationLinks = useMemo(() => {
        const links = [];
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

    // Node toggling
    const toggleNode = (nodeId: number) => {
        setExpandedNodeIds((prev) => ({
            ...prev,
            [nodeId]: !prev[nodeId],
        }));
    };

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

    // User actions
    const handleOpenRoleDrawer = (level: HierarchyLevelItem) => {
        setActiveDrawerLevel(level);
        setSearchQuery('');
    };

    const handleOpenAddUser = (level?: HierarchyLevelItem) => {
        setAddUserDefaultLevelId(level ? level.id : (allLevels[0]?.id || null));
        setIsAddUserOpen(true);
    };

    const handleOpenEditUser = (user: HierarchyUser) => {
        setEditingUser(user);
    };

    const handleOpenReassignUser = (user: HierarchyUser) => {
        setReassigningUser(user);
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

    // Level actions
    const handleOpenCreateLevel = (parentLevel?: HierarchyLevelItem) => {
        setLevelModalMode('create');
        setEditingLevel(null);
        const defaultParent = parentLevel
            ? parentLevel
            : (allLevels.find((l) => l.role_key === 'owner_travel' || l.nama_level === 'Owner') || allLevels[0]);
        setSelectedParentLevelId(defaultParent ? defaultParent.id : null);
    };

    const handleOpenEditLevel = (level: HierarchyLevelItem) => {
        setLevelModalMode('edit');
        setEditingLevel(level);
        setSelectedParentLevelId(level.parent_id ?? null);
    };

    const handleOpenDeleteLevel = (level: HierarchyLevelItem) => {
        setDeletingLevel(level);
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
                        </div>
                    )}

                    {/* View Mode Toggle */}
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
                            <span>Manajemen Hierarchy Jabatan</span>
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
                            <span>Manajemen User</span>
                        </button>
                    </div>

                    {/* Table Mode Action: Add User */}
                    {viewMode === 'table' ? (
                        <button
                            onClick={() => handleOpenAddUser()}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-foreground text-background text-xs font-bold shadow-xs hover:opacity-90 transition cursor-pointer"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Tambah User</span>
                        </button>
                    ):(
                            <button
                                onClick={() => handleOpenCreateLevel()}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-xs hover:opacity-90 transition cursor-pointer ml-2"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Tambah Level</span>
                            </button>
                    )}
                </div>
            </div>

            {/* VIEW MODE 1: VISUAL STEPPED CANVAS TREE */}
            {viewMode === 'canvas' && (
                <UserHierarchyVisual
                    hierarchyTree={hierarchyTree}
                    allLevels={allLevels}
                    levelCounts={levelCounts}
                    activeDrawerLevel={activeDrawerLevel}
                    expandedNodeIds={expandedNodeIds}
                    toggleNode={toggleNode}
                    onOpenRoleDrawer={handleOpenRoleDrawer}
                    onOpenCreateLevel={handleOpenCreateLevel}
                    onOpenEditLevel={handleOpenEditLevel}
                    onOpenDeleteLevel={handleOpenDeleteLevel}
                />
            )}

            {/* VIEW MODE 2: TABULAR LISTING */}
            {viewMode === 'table' && (
                <UserHierarchyTable
                    paginatedTableUsers={paginatedTableUsers}
                    totalUsersCount={tableUsers.length}
                    tableSearchQuery={tableSearchQuery}
                    setTableSearchQuery={setTableSearchQuery}
                    tableJabatanFilter={tableJabatanFilter}
                    setTableJabatanFilter={setTableJabatanFilter}
                    tablePerPage={tablePerPage}
                    setTablePerPage={setTablePerPage}
                    tablePage={tablePage}
                    setTablePage={setTablePage}
                    totalTablePages={totalTablePages}
                    tablePaginationLinks={tablePaginationLinks}
                    allLevels={allLevels}
                    levelCounts={levelCounts}
                    onOpenReassignUser={handleOpenReassignUser}
                    onOpenEditUser={handleOpenEditUser}
                    onDeleteUser={handleDeleteUser}
                />
            )}

            {/* SLIDE-OUT DRAWER: DETAIL TINGKATAN JABATAN & DAFTAR USER */}
            <LevelUsersDrawer
                activeDrawerLevel={activeDrawerLevel}
                drawerUsers={drawerUsers}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                onClose={() => setActiveDrawerLevel(null)}
                onOpenAddUser={handleOpenAddUser}
                onOpenReassignUser={handleOpenReassignUser}
                onOpenEditUser={handleOpenEditUser}
                onDeleteUser={handleDeleteUser}
            />

            {/* MODAL: Tambah User */}
            <AddUserSheet
                isOpen={isAddUserOpen}
                onClose={() => setIsAddUserOpen(false)}
                allLevels={allLevels}
                tenants={tenants}
                users={users}
                currentUserRole={currentUserRole}
                selectedTenantId={selectedTenantId}
                defaultLevelId={addUserDefaultLevelId}
            />

            {/* MODAL: Edit User */}
            <EditUserSheet
                editingUser={editingUser}
                onClose={() => setEditingUser(null)}
                allLevels={allLevels}
                users={users}
            />

            {/* MODAL: Pindahkan User (Reassign) */}
            <UserReassignModal
                reassigningUser={reassigningUser}
                allLevels={allLevels}
                onClose={() => setReassigningUser(null)}
            />

            {/* MODAL: Tambah / Edit Hierarchy Level */}
            <LevelFormModal
                mode={levelModalMode}
                editingLevel={editingLevel}
                selectedParentLevelId={selectedParentLevelId}
                allLevels={allLevels}
                currentUserRole={currentUserRole}
                onClose={() => {
                    setLevelModalMode(null);
                    setEditingLevel(null);
                }}
            />

            {/* MODAL: Hapus Level & Migrasi User */}
            <DeleteLevelModal
                deletingLevel={deletingLevel}
                levelCounts={levelCounts}
                allLevels={allLevels}
                onClose={() => setDeletingLevel(null)}
            />
        </PageLayout>
    );
}
