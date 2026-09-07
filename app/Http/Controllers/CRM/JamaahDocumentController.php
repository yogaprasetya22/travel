<?php

namespace App\Http\Controllers\CRM;

use App\Http\Controllers\Controller;
use App\Models\DocumentPermission;
use App\Models\Jamaah;
use App\Models\JamaahDocument;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class JamaahDocumentController extends Controller
{
    /**
     * Upload document for a specific jamaah.
     */
    public function store(Request $request, Jamaah $jamaah): RedirectResponse
    {
        $user = $request->user();
        $tenantId = $user->getActiveTenantId();

        if ($jamaah->tenant_id !== $tenantId && ! $user->isSuperAdmin()) {
            abort(403, 'Akses ditolak.');
        }

        // Check RBAC permission for upload
        $userRole = $user->role ?? 'staff';
        $permission = DocumentPermission::where('tenant_id', $tenantId)
            ->where('role_name', $userRole)
            ->where('document_type', $request->input('type'))
            ->first();

        if ($permission && ! $permission->can_upload && ! $user->isOwner() && ! $user->isSuperAdmin()) {
            return redirect()->back()->withErrors(['document' => 'Role Anda tidak memiliki izin untuk mengunggah jenis dokumen ini.']);
        }

        $validated = $request->validate([
            'type' => ['required', 'string', 'in:ktp,kk,paspor,foto,visa,tiket,asuransi,siskopatuh,vaksin,other'],
            'title' => ['nullable', 'string', 'max:255'],
            'file' => ['required', 'file', 'mimes:jpg,jpeg,png,webp,pdf', 'max:10240'], // max 10MB
            'notes' => ['nullable', 'string', 'max:500'],
        ]);

        $file = $request->file('file');
        $filename = time().'_'.preg_replace('/[^a-zA-Z0-9._-]/', '', $file->getClientOriginalName());
        $path = $file->storeAs("tenants/{$tenantId}/jamaah/{$jamaah->id}/documents", $filename, 'public');

        JamaahDocument::create([
            'tenant_id' => $tenantId,
            'jamaah_id' => $jamaah->id,
            'type' => $validated['type'],
            'title' => ! empty($validated['title']) ? $validated['title'] : strtoupper($validated['type']).' - '.$jamaah->nama_lengkap,
            'file_path' => $path,
            'file_name' => $file->getClientOriginalName(),
            'mime_type' => $file->getClientMimeType(),
            'file_size' => $file->getSize(),
            'notes' => $validated['notes'] ?? null,
            'uploaded_by' => $user->id,
        ]);

        return redirect()->back()->with('success', 'Dokumen '.strtoupper($validated['type']).' berhasil diunggah.');
    }

    /**
     * Delete document.
     */
    public function destroy(Request $request, JamaahDocument $document): RedirectResponse
    {
        $user = $request->user();
        $tenantId = $user->getActiveTenantId();

        if ($document->tenant_id !== $tenantId && ! $user->isSuperAdmin()) {
            abort(403, 'Akses ditolak.');
        }

        // Check RBAC permission for delete
        $userRole = $user->role ?? 'staff';
        $permission = DocumentPermission::where('tenant_id', $tenantId)
            ->where('role_name', $userRole)
            ->where('document_type', $document->type)
            ->first();

        if ($permission && ! $permission->can_delete && ! $user->isOwner() && ! $user->isSuperAdmin()) {
            return redirect()->back()->withErrors(['document' => 'Role Anda tidak memiliki izin untuk menghapus dokumen ini.']);
        }

        if (Storage::disk('public')->exists($document->file_path)) {
            Storage::disk('public')->delete($document->file_path);
        }

        $document->delete();

        return redirect()->back()->with('success', 'Dokumen berhasil dihapus.');
    }
}
