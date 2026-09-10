import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import {
    ShieldCheck,
    Save,
    FileText,
    Power,
    Sliders,
    Info,
    Layers,
} from 'lucide-react';
import PrimaryButton from '@/Components/PrimaryButton';
import {
    DOCUMENT_TYPES,
    DocumentPermissionItem,
    DocumentTypeDefinition,
} from '@/Pages/CRM/Components/types';

export type { DocumentPermissionItem };

interface Props {
    documentPermissions?: DocumentPermissionItem[];
}

const ROLES = [
    { value: 'owner_travel', label: 'Owner / Direksi' },
    { value: 'admin_travel', label: 'Admin Operasional' },
    { value: 'leader', label: 'Team Leader' },
    { value: 'agen', label: 'Mitra Agen' },
    { value: 'staff', label: 'Staff Lapangan / Gudang' },
];

export function DocumentRbacTab({ documentPermissions = [] }: Props) {
    // Build initial document active status map
    const buildInitialActiveStatus = (): Record<string, boolean> => {
        const activeMap: Record<string, boolean> = {};
        DOCUMENT_TYPES.forEach((d: DocumentTypeDefinition) => {
            const found = documentPermissions.find((p) => p.document_type === d.value);
            activeMap[d.value] = found ? found.is_active !== false : true;
        });
        return activeMap;
    };

    // Build initial matrix: role -> docType -> permissions
    const buildInitialMatrix = () => {
        const matrix: Record<string, Record<string, { view: boolean; upload: boolean; delete: boolean }>> = {};

        ROLES.forEach((r) => {
            matrix[r.value] = {};
            DOCUMENT_TYPES.forEach((d: DocumentTypeDefinition) => {
                const existing = documentPermissions.find(
                    (p) => p.role_name === r.value && p.document_type === d.value
                );
                matrix[r.value][d.value] = {
                    view: existing ? Boolean(existing.can_view) : true,
                    upload: existing ? Boolean(existing.can_upload) : r.value !== 'staff',
                    delete:
                        existing
                            ? Boolean(existing.can_delete)
                            : r.value === 'owner_travel' || r.value === 'admin_travel',
                };
            });
        });

        return matrix;
    };

    const [docActiveStatus, setDocActiveStatus] = useState<Record<string, boolean>>(buildInitialActiveStatus);
    const [matrix, setMatrix] = useState(buildInitialMatrix);
    const [selectedRole, setSelectedRole] = useState<string>(ROLES[0].value);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    // Group categories
    const categories: string[] = Array.from(
        new Set(DOCUMENT_TYPES.map((d: DocumentTypeDefinition) => d.category || 'Lainnya'))
    );

    const toggleDocActive = (docValue: string) => {
        setDocActiveStatus((prev) => ({
            ...prev,
            [docValue]: !prev[docValue],
        }));
    };

    const togglePermission = (role: string, doc: string, perm: 'view' | 'upload' | 'delete') => {
        setMatrix((prev) => ({
            ...prev,
            [role]: {
                ...prev[role],
                [doc]: {
                    ...prev[role][doc],
                    [perm]: !prev[role][doc][perm],
                },
            },
        }));
    };

    const setAllActive = (status: boolean) => {
        const updated: Record<string, boolean> = {};
        DOCUMENT_TYPES.forEach((d: DocumentTypeDefinition) => {
            updated[d.value] = status;
        });
        setDocActiveStatus(updated);
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        const flattenedPermissions: Array<{
            role_name: string;
            document_type: string;
            is_active: boolean;
            can_view: boolean;
            can_upload: boolean;
            can_delete: boolean;
        }> = [];

        ROLES.forEach((r) => {
            DOCUMENT_TYPES.forEach((d: DocumentTypeDefinition) => {
                const perms = matrix[r.value]?.[d.value] || { view: true, upload: true, delete: false };
                flattenedPermissions.push({
                    role_name: r.value,
                    document_type: d.value,
                    is_active: Boolean(docActiveStatus[d.value]),
                    can_view: perms.view,
                    can_upload: perms.upload,
                    can_delete: perms.delete,
                });
            });
        });

        router.post(
            route('settings.master.document-permissions'),
            { permissions: flattenedPermissions },
            {
                preserveScroll: true,
                onFinish: () => setIsSaving(false),
            }
        );
    };

    const filteredDocs: DocumentTypeDefinition[] =
        selectedCategory === 'all'
            ? DOCUMENT_TYPES
            : DOCUMENT_TYPES.filter((d: DocumentTypeDefinition) => d.category === selectedCategory);

    const activeCount = Object.values(docActiveStatus).filter(Boolean).length;

    return (
        <form onSubmit={handleSave} className="flex flex-col gap-5">
            {/* Header info banner */}
            <div className="p-5 rounded-2xl bg-card border border-border/80 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-primary" /> Matriks Hak Akses &amp; Status Dokumen Persyaratan
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        Tentukan jenis dokumen yang <strong>diaktifkan / dinonaktifkan</strong> pada sistem travel Anda, serta kontrol per-role untuk izin <em>View</em> (Lihat), <em>Upload</em> (Unggah), dan <em>Delete</em> (Hapus).
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                            <Layers className="w-3 h-3" /> {activeCount} dari {DOCUMENT_TYPES.length} Jenis Dokumen Aktif
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <PrimaryButton disabled={isSaving} className="gap-1.5 shrink-0 shadow-sm">
                        <Save className="w-4 h-4" />
                        <span>{isSaving ? 'Menyimpan...' : 'Simpan Pengaturan RBAC'}</span>
                    </PrimaryButton>
                </div>
            </div>

            {/* Quick Actions & Category Filter */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-muted/30 p-3 rounded-2xl border border-border/60">
                <div className="flex items-center gap-1.5 overflow-x-auto low-scrollbar">
                    <span className="text-[11px] font-bold text-muted-foreground mr-1">Kategori:</span>
                    <button
                        type="button"
                        onClick={() => setSelectedCategory('all')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                            selectedCategory === 'all'
                                ? 'bg-primary text-primary-foreground shadow-2xs'
                                : 'bg-card border border-border/80 text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        Semua ({DOCUMENT_TYPES.length})
                    </button>
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            type="button"
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                                selectedCategory === cat
                                    ? 'bg-primary text-primary-foreground shadow-2xs'
                                    : 'bg-card border border-border/80 text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setAllActive(true)}
                        className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 hover:underline cursor-pointer"
                    >
                        Aktifkan Semua
                    </button>
                    <span className="text-border">|</span>
                    <button
                        type="button"
                        onClick={() => setAllActive(false)}
                        className="text-[11px] font-bold text-muted-foreground hover:text-rose-500 hover:underline cursor-pointer"
                    >
                        Nonaktifkan Semua
                    </button>
                </div>
            </div>

            {/* Role Tab Selector */}
            <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-primary" /> Pilih Role Pengguna untuk Dikonfigurasi Hak Aksesnya:
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-1 low-scrollbar">
                    {ROLES.map((r) => (
                        <button
                            key={r.value}
                            type="button"
                            onClick={() => setSelectedRole(r.value)}
                            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                                selectedRole === r.value
                                    ? 'bg-primary text-primary-foreground shadow-xs'
                                    : 'bg-card border border-border text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            <span>{r.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Matrix Permission Table for Selected Role */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs">
                    <thead>
                        <tr className="bg-muted/50 border-b border-border text-muted-foreground font-semibold">
                            <th className="p-4 font-bold">Jenis Dokumen Persyaratan</th>
                            <th className="p-4 font-bold text-center w-36">
                                Status Global Dokumen
                            </th>
                            <th className="p-4 font-bold text-center w-32">
                                Izin Lihat (View)
                            </th>
                            <th className="p-4 font-bold text-center w-32">
                                Izin Unggah (Upload)
                            </th>
                            <th className="p-4 font-bold text-center w-32">
                                Izin Hapus (Delete)
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {filteredDocs.map((doc: DocumentTypeDefinition) => {
                            const isActive = docActiveStatus[doc.value] !== false;
                            const perms = matrix[selectedRole]?.[doc.value] || { view: true, upload: true, delete: false };

                            return (
                                <tr
                                    key={doc.value}
                                    className={`transition ${
                                        !isActive
                                            ? 'bg-muted/20 opacity-60'
                                            : 'hover:bg-muted/10'
                                    }`}
                                >
                                    <td className="p-4">
                                        <div className="flex flex-col gap-0.5">
                                            <div className="font-bold text-foreground text-xs flex items-center gap-2">
                                                <FileText className={`w-4 h-4 shrink-0 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                                                <span>{doc.label}</span>
                                                <span className="text-[10px] font-normal px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
                                                    {doc.category}
                                                </span>
                                            </div>
                                            {doc.description && (
                                                <span className="text-[11px] text-muted-foreground pl-6">
                                                    {doc.description}
                                                </span>
                                            )}
                                        </div>
                                    </td>

                                    {/* Global On/Off Active Toggle */}
                                    <td className="p-4 text-center">
                                        <button
                                            type="button"
                                            onClick={() => toggleDocActive(doc.value)}
                                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold transition cursor-pointer ${
                                                isActive
                                                    ? 'bg-emerald-500/15 text-emerald-600 border border-emerald-500/30'
                                                    : 'bg-muted text-muted-foreground border border-border'
                                            }`}
                                        >
                                            <Power className={`w-3 h-3 ${isActive ? 'text-emerald-600' : 'text-muted-foreground'}`} />
                                            <span>{isActive ? 'Aktif' : 'Nonaktif'}</span>
                                        </button>
                                    </td>

                                    {/* View Checkbox */}
                                    <td className="p-4 text-center">
                                        <input
                                            type="checkbox"
                                            disabled={!isActive}
                                            checked={isActive && perms.view}
                                            onChange={() => togglePermission(selectedRole, doc.value, 'view')}
                                            className={`w-4 h-4 rounded text-primary focus:ring-primary ${
                                                isActive ? 'cursor-pointer' : 'cursor-not-allowed opacity-40'
                                            }`}
                                        />
                                    </td>

                                    {/* Upload Checkbox */}
                                    <td className="p-4 text-center">
                                        <input
                                            type="checkbox"
                                            disabled={!isActive}
                                            checked={isActive && perms.upload}
                                            onChange={() => togglePermission(selectedRole, doc.value, 'upload')}
                                            className={`w-4 h-4 rounded text-primary focus:ring-primary ${
                                                isActive ? 'cursor-pointer' : 'cursor-not-allowed opacity-40'
                                            }`}
                                        />
                                    </td>

                                    {/* Delete Checkbox */}
                                    <td className="p-4 text-center">
                                        <input
                                            type="checkbox"
                                            disabled={!isActive}
                                            checked={isActive && perms.delete}
                                            onChange={() => togglePermission(selectedRole, doc.value, 'delete')}
                                            className={`w-4 h-4 rounded text-primary focus:ring-primary ${
                                                isActive ? 'cursor-pointer' : 'cursor-not-allowed opacity-40'
                                            }`}
                                        />
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Note & explanation */}
            <div className="p-4 rounded-2xl bg-muted/40 border border-border/70 flex items-start gap-3 text-xs text-muted-foreground">
                <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div className="flex flex-col gap-1 leading-relaxed">
                    <span className="font-bold text-foreground">Catatan Penggunaan:</span>
                    <p>
                        Jika suatu jenis dokumen diset <strong>Nonaktif</strong> secara global, dokumen tersebut tidak akan muncul pada form pendaftaran, tab berkas jamaah, maupun pilihan unggah berkas untuk seluruh role pengguna.
                    </p>
                    <p>
                        Jika dokumen <strong>Aktif</strong>, Anda dapat mengatur hak spesifik per role (misalnya mitra agen hanya boleh <em>View</em> &amp; <em>Upload</em>, sedangkan hanya Owner/Admin yang boleh <em>Delete</em>).
                    </p>
                </div>
            </div>
        </form>
    );
}
