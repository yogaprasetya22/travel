import React from 'react';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter,
} from '@/Components/ui/sheet';
import { Plus, Edit2, Trash2, Search, Info, MoveRight } from 'lucide-react';
import { HierarchyLevelItem, HierarchyUser } from './types';

interface LevelUsersDrawerProps {
    activeDrawerLevel: HierarchyLevelItem | null;
    drawerUsers: HierarchyUser[];
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    onClose: () => void;
    onOpenAddUser: (level: HierarchyLevelItem) => void;
    onOpenReassignUser: (user: HierarchyUser) => void;
    onOpenEditUser: (user: HierarchyUser) => void;
    onDeleteUser: (user: HierarchyUser) => void;
}

export function LevelUsersDrawer({
    activeDrawerLevel,
    drawerUsers,
    searchQuery,
    setSearchQuery,
    onClose,
    onOpenAddUser,
    onOpenReassignUser,
    onOpenEditUser,
    onDeleteUser,
}: LevelUsersDrawerProps) {
    return (
        <Sheet open={!!activeDrawerLevel} onOpenChange={(open) => { if (!open) onClose(); }}>
            <SheetContent side="right" className="w-full sm:max-w-xl md:w-1/2 flex flex-col justify-between">
                <div className="flex flex-col gap-5 p-4 flex-1 overflow-y-auto low-scrollbar">
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
                                    onClick={() => activeDrawerLevel && onOpenAddUser(activeDrawerLevel)}
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
                                <strong className="text-foreground font-semibold">Wewenang &amp; Hak Akses: </strong>
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
                                        onClick={() => onOpenReassignUser(u)}
                                        className="p-2 rounded-xl border border-border bg-muted/40 hover:bg-muted text-muted-foreground hover:text-primary transition cursor-pointer shadow-2xs"
                                        title="Pindahkan Jabatan User"
                                    >
                                        <MoveRight className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => onOpenEditUser(u)}
                                        className="p-2 rounded-xl border border-border bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground transition cursor-pointer shadow-2xs"
                                        title="Edit Akun"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => onDeleteUser(u)}
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
                        onClick={onClose}
                        className="w-full px-4 py-2.5 border border-border rounded-xl text-sm font-semibold hover:bg-muted transition cursor-pointer"
                    >
                        Tutup Detail
                    </button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
