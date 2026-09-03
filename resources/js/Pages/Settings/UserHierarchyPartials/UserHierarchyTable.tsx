import React from 'react';
import {
    Edit2,
    Trash2,
    Search,
    Mail,
    MoveRight,
    CreditCard,
    Phone,
    MapPin,
} from 'lucide-react';
import DataTablePagination from '@/Components/DataTablePagination';
import PerPageSelector from '@/Components/PerPageSelector';
import { HierarchyLevelItem, HierarchyUser } from './types';

interface UserHierarchyTableProps {
    paginatedTableUsers: HierarchyUser[];
    totalUsersCount: number;
    tableSearchQuery: string;
    setTableSearchQuery: (query: string) => void;
    tableJabatanFilter: string;
    setTableJabatanFilter: (filter: string) => void;
    tablePerPage: number;
    setTablePerPage: (perPage: number) => void;
    tablePage: number;
    setTablePage: (page: number) => void;
    totalTablePages: number;
    tablePaginationLinks: any[];
    allLevels: HierarchyLevelItem[];
    levelCounts: Record<number, number>;
    onOpenReassignUser: (user: HierarchyUser) => void;
    onOpenEditUser: (user: HierarchyUser) => void;
    onDeleteUser: (user: HierarchyUser) => void;
}

export function UserHierarchyTable({
    paginatedTableUsers,
    totalUsersCount,
    tableSearchQuery,
    setTableSearchQuery,
    tableJabatanFilter,
    setTableJabatanFilter,
    tablePerPage,
    setTablePerPage,
    tablePage,
    setTablePage,
    totalTablePages,
    tablePaginationLinks,
    allLevels,
    levelCounts,
    onOpenReassignUser,
    onOpenEditUser,
    onDeleteUser,
}: UserHierarchyTableProps) {
    return (
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
                                <option key={lvl.id} value={lvl.id.toString()}>
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
                                <th className="px-6 py-3.5">Karyawan / Pengguna</th>
                                <th className="px-6 py-3.5">Kontak &amp; Domisili</th>
                                <th className="px-6 py-3.5 text-center">Tingkatan Jabatan</th>
                                <th className="px-6 py-3.5">Rekening Pencairan</th>
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
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                    <span>{u.name}</span>
                                                    <span className={`px-1.5 py-0.2 rounded-md text-[9px] font-bold ${
                                                        u.status_karyawan === 'aktif' || !u.status_karyawan
                                                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                                            : 'bg-muted text-muted-foreground border border-border'
                                                    }`}>
                                                        {u.status_karyawan ? u.status_karyawan.toUpperCase() : 'AKTIF'}
                                                    </span>
                                                </div>
                                                {u.nik && (
                                                    <span className="text-[10px] text-muted-foreground font-mono">
                                                        NIK: {u.nik}
                                                    </span>
                                                )}
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 text-muted-foreground">
                                            <div className="flex flex-col gap-1">
                                                {u.no_hp ? (
                                                    <a
                                                        href={`https://wa.me/${u.no_hp.replace(/^0/, '62')}`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
                                                    >
                                                        <Phone className="w-3 h-3" />
                                                        <span>{u.no_hp}</span>
                                                    </a>
                                                ) : (
                                                    <span className="text-[11px] text-muted-foreground italic">-</span>
                                                )}
                                                <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                                                    <Mail className="w-3 h-3" />
                                                    <span>{u.email}</span>
                                                </div>
                                                {u.kota && (
                                                    <div className="flex items-center gap-1 text-[10px] text-foreground/80 font-medium">
                                                        <MapPin className="w-3 h-3 text-primary" />
                                                        <span>{u.kota}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 text-center">
                                            <span className="px-3 py-1 rounded-full font-bold text-[11px] border bg-primary/10 text-primary border-primary/20">
                                                {userJabatan}
                                            </span>
                                        </td>

                                        <td className="px-6 py-4 text-foreground">
                                            {u.nama_bank && u.nomor_rekening ? (
                                                <div className="flex flex-col gap-0.5">
                                                    <div className="flex items-center gap-1">
                                                        <CreditCard className="w-3 h-3 text-primary" />
                                                        <span className="font-bold text-xs">{u.nama_bank}</span>
                                                    </div>
                                                    <span className="font-mono text-xs font-semibold text-foreground tracking-wider">
                                                        {u.nomor_rekening}
                                                    </span>
                                                    {u.atas_nama_rekening && (
                                                        <span className="text-[10px] text-muted-foreground">
                                                            a/n {u.atas_nama_rekening}
                                                        </span>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-[11px] text-muted-foreground italic">Belum diisi</span>
                                            )}
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
                                                    onClick={() => onOpenReassignUser(u)}
                                                    className="p-1.5 rounded-lg border border-border bg-card hover:bg-muted text-muted-foreground hover:text-primary transition cursor-pointer shadow-2xs"
                                                    title="Pindahkan Jabatan"
                                                >
                                                    <MoveRight className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => onOpenEditUser(u)}
                                                    className="p-1.5 rounded-lg border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition cursor-pointer shadow-2xs"
                                                    title="Edit User"
                                                >
                                                    <Edit2 className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => onDeleteUser(u)}
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
                                    <td colSpan={6} className="py-12 text-center text-muted-foreground italic">
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
                        from={totalUsersCount > 0 ? (tablePage - 1) * tablePerPage + 1 : 0}
                        to={Math.min(tablePage * tablePerPage, totalUsersCount)}
                        total={totalUsersCount}
                        currentPage={tablePage}
                        lastPage={totalTablePages}
                        onPageChange={(p) => setTablePage(p)}
                    />
                </div>
            </div>
        </div>
    );
}
