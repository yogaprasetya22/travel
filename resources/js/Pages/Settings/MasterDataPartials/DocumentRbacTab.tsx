import React, { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import { ShieldCheck, Check, Save, Lock, FileText, CheckCircle2 } from 'lucide-react';
import PrimaryButton from '@/Components/PrimaryButton';

export interface DocumentPermissionItem {
    id?: number;
    role_name: string;
    document_type: string;
    can_view: boolean;
    can_upload: boolean;
    can_delete: boolean;
}

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

const DOCUMENT_TYPES = [
    { value: 'ktp', label: 'KTP (Identitas)' },
    { value: 'kk', label: 'Kartu Keluarga (KK)' },
    { value: 'paspor', label: 'Buku Paspor' },
    { value: 'foto', label: 'Pas Foto 4x6' },
    { value: 'visa', label: 'E-Visa Umroh / Haji' },
    { value: 'tiket', label: 'Tiket Pesawat' },
    { value: 'asuransi', label: 'Polis Asuransi' },
    { value: 'siskopatuh', label: 'SISKOPATUH' },
    { value: 'vaksin', label: 'Sertifikat Vaksin' },
];

export function DocumentRbacTab({ documentPermissions = [] }: Props) {
    // Build initial matrix
    const buildInitialMatrix = () => {
        const matrix: Record<string, Record<string, { view: boolean; upload: boolean; delete: boolean }>> = {};

        ROLES.forEach((r) => {
            matrix[r.value] = {};
            DOCUMENT_TYPES.forEach((d) => {
                const existing = documentPermissions.find((p) => p.role_name === r.value && p.document_type === d.value);
                matrix[r.value][d.value] = {
                    view: existing ? Boolean(existing.can_view) : true,
                    upload: existing ? Boolean(existing.can_upload) : (r.value !== 'staff'),
                    delete: existing ? Boolean(existing.can_delete) : (r.value === 'owner_travel' || r.value === 'admin_travel'),
                };
            });
        });

        return matrix;
    };

    const [matrix, setMatrix] = useState(buildInitialMatrix);
    const [selectedRole, setSelectedRole] = useState(ROLES[0].value);
    const [isSaving, setIsSaving] = useState(false);

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

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        const flattenedPermissions: Array<{
            role_name: string;
            document_type: string;
            can_view: boolean;
            can_upload: boolean;
            can_delete: boolean;
        }> = [];

        Object.entries(matrix).forEach(([role, docs]) => {
            Object.entries(docs).forEach(([docType, perms]) => {
                flattenedPermissions.push({
                    role_name: role,
                    document_type: docType,
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

    return (
        <form onSubmit={handleSave} className="flex flex-col gap-5">
            {/* Header info */}
            <div className="p-5 rounded-2xl bg-card border border-border/80 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-primary" /> Matriks Hak Akses Unggah &amp; Lihat Dokumen (RBAC)
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        Atur role mana saja yang memiliki hak izin untuk Melihat (*View*), Mengunggah (*Upload*), atau Menghapus (*Delete*) dokumen sensitif jamaah.
                    </p>
                </div>
                <PrimaryButton disabled={isSaving} className="gap-1.5 shrink-0">
                    <Save className="w-4 h-4" />
                    <span>{isSaving ? 'Menyimpan...' : 'Simpan Konfigurasi RBAC'}</span>
                </PrimaryButton>
            </div>

            {/* Role Tab Selector */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {ROLES.map((r) => (
                    <button
                        key={r.value}
                        type="button"
                        onClick={() => setSelectedRole(r.value)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                            selectedRole === r.value
                                ? 'bg-primary text-primary-foreground shadow-xs'
                                : 'bg-card border border-border text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        {r.label}
                    </button>
                ))}
            </div>

            {/* Matrix Permission Table for Selected Role */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs">
                    <thead>
                        <tr className="bg-muted/50 border-b border-border text-muted-foreground">
                            <th className="p-4 font-bold">Jenis Dokumen Persyaratan</th>
                            <th className="p-4 font-bold text-center w-32">Boleh Melihat (View)</th>
                            <th className="p-4 font-bold text-center w-32">Boleh Upload (Upload)</th>
                            <th className="p-4 font-bold text-center w-32">Boleh Hapus (Delete)</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {DOCUMENT_TYPES.map((doc) => {
                            const perms = matrix[selectedRole]?.[doc.value] || { view: true, upload: true, delete: false };

                            return (
                                <tr key={doc.value} className="hover:bg-muted/20 transition">
                                    <td className="p-4">
                                        <div className="font-bold text-foreground text-xs flex items-center gap-2">
                                            <FileText className="w-4 h-4 text-primary shrink-0" />
                                            <span>{doc.label}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-center">
                                        <input
                                            type="checkbox"
                                            checked={perms.view}
                                            onChange={() => togglePermission(selectedRole, doc.value, 'view')}
                                            className="w-4 h-4 rounded text-primary focus:ring-primary cursor-pointer"
                                        />
                                    </td>
                                    <td className="p-4 text-center">
                                        <input
                                            type="checkbox"
                                            checked={perms.upload}
                                            onChange={() => togglePermission(selectedRole, doc.value, 'upload')}
                                            className="w-4 h-4 rounded text-primary focus:ring-primary cursor-pointer"
                                        />
                                    </td>
                                    <td className="p-4 text-center">
                                        <input
                                            type="checkbox"
                                            checked={perms.delete}
                                            onChange={() => togglePermission(selectedRole, doc.value, 'delete')}
                                            className="w-4 h-4 rounded text-primary focus:ring-primary cursor-pointer"
                                        />
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </form>
    );
}
