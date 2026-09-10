<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\CrmStage;
use App\Models\DocumentPermission;
use App\Models\Inventaris;
use App\Models\Paket;
use App\Models\RekeningTenant;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class MasterDataController extends Controller
{
    /**
     * Display unified Master Data management screen.
     */
    public function index(Request $request): Response
    {
        $tenantId = auth()->user()->getActiveTenantId();

        $stages = CrmStage::where('tenant_id', $tenantId)->orderBy('urutan')->get();
        $packages = Paket::where('tenant_id', $tenantId)->with('inventaris')->orderBy('nama_paket')->get();
        $banks = RekeningTenant::where('tenant_id', $tenantId)->orderBy('nama_bank')->get();
        $inventoryItems = Inventaris::where('tenant_id', $tenantId)->orderBy('nama_barang')->get();
        $documentPermissions = DocumentPermission::where('tenant_id', $tenantId)->get();

        return Inertia::render('Settings/MasterData', [
            'stages' => $stages,
            'packages' => $packages,
            'banks' => $banks,
            'inventoryItems' => $inventoryItems,
            'documentPermissions' => $documentPermissions,
            'activeTab' => $request->query('tab', 'stages'),
        ]);
    }

    /**
     * Store new CRM Stage.
     */
    public function storeStage(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'nama_tahap' => ['required', 'string', 'max:100'],
            'urutan' => ['required', 'integer', 'min:1'],
            'periode_mulai' => ['nullable', 'date'],
            'periode_selesai' => ['nullable', 'date', 'after_or_equal:periode_mulai'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        CrmStage::create([
            'tenant_id' => auth()->user()->getActiveTenantId(),
            'nama_tahap' => $validated['nama_tahap'],
            'urutan' => $validated['urutan'],
            'periode_mulai' => $validated['periode_mulai'] ?? null,
            'periode_selesai' => $validated['periode_selesai'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return redirect()->back()->with('success', 'Tahap CRM berhasil ditambahkan.');
    }

    /**
     * Store new Paket Umroh / Haji with Itinerary & Brochure.
     */
    public function storePackage(Request $request): RedirectResponse
    {
        $tenantId = auth()->user()->getActiveTenantId();

        $validated = $request->validate([
            'nama_paket' => ['required', 'string', 'max:255'],
            'harga' => ['required', 'numeric', 'min:0'],
            'kuota' => ['nullable', 'integer', 'min:1'],
            'deskripsi' => ['nullable', 'string'],
            'brosur_image' => ['nullable', 'file', 'image', 'max:5120'],
            'itinerary' => ['nullable'],
            'fasilitas' => ['nullable'],
            'komisi_flat' => ['nullable', 'numeric', 'min:0'],
            'komisi_persentase' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'periode_mulai' => ['nullable', 'date'],
            'periode_selesai' => ['nullable', 'date', 'after_or_equal:periode_mulai'],
            'is_active' => ['nullable', 'boolean'],
            'inventaris_ids' => ['nullable', 'array'],
        ]);

        $brosurPath = null;
        if ($request->hasFile('brosur_image')) {
            $brosurPath = $request->file('brosur_image')->store("tenants/{$tenantId}/brosur", 'public');
        }

        $itineraryData = is_string($request->input('itinerary'))
            ? json_decode($request->input('itinerary'), true)
            : $request->input('itinerary');

        $fasilitasData = is_string($request->input('fasilitas'))
            ? json_decode($request->input('fasilitas'), true)
            : $request->input('fasilitas');

        $paket = Paket::create([
            'tenant_id' => $tenantId,
            'nama_paket' => $validated['nama_paket'],
            'harga' => $validated['harga'],
            'kuota' => $validated['kuota'] ?? 45,
            'deskripsi' => $validated['deskripsi'] ?? null,
            'brosur_image' => $brosurPath,
            'itinerary' => $itineraryData,
            'fasilitas' => $fasilitasData,
            'komisi_flat' => $validated['komisi_flat'] ?? 0,
            'komisi_persentase' => $validated['komisi_persentase'] ?? 0,
            'periode_mulai' => $validated['periode_mulai'] ?? null,
            'periode_selesai' => $validated['periode_selesai'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        if (! empty($validated['inventaris_ids'])) {
            foreach ($validated['inventaris_ids'] as $invId) {
                $paket->inventaris()->attach($invId, ['qty' => 1]);
            }
        }

        return redirect()->back()->with('success', 'Paket travel beserta itinerary berhasil ditambahkan.');
    }

    /**
     * Update existing Paket Umroh / Haji with Itinerary & Brochure.
     */
    public function updatePackage(Request $request, Paket $paket): RedirectResponse
    {
        $tenantId = auth()->user()->getActiveTenantId();
        if (auth()->user()->role !== 'super_admin_master' && $paket->tenant_id !== $tenantId) {
            abort(403, 'Aksi tidak diizinkan.');
        }

        $validated = $request->validate([
            'nama_paket' => ['required', 'string', 'max:255'],
            'harga' => ['required', 'numeric', 'min:0'],
            'kuota' => ['nullable', 'integer', 'min:1'],
            'deskripsi' => ['nullable', 'string'],
            'brosur_image' => ['nullable', 'file', 'image', 'max:5120'],
            'itinerary' => ['nullable'],
            'fasilitas' => ['nullable'],
            'komisi_flat' => ['nullable', 'numeric', 'min:0'],
            'komisi_persentase' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'periode_mulai' => ['nullable', 'date'],
            'periode_selesai' => ['nullable', 'date', 'after_or_equal:periode_mulai'],
            'is_active' => ['nullable', 'boolean'],
            'inventaris_ids' => ['nullable', 'array'],
        ]);

        $brosurPath = $paket->brosur_image;
        if ($request->hasFile('brosur_image')) {
            if ($brosurPath && Storage::disk('public')->exists($brosurPath)) {
                Storage::disk('public')->delete($brosurPath);
            }
            $brosurPath = $request->file('brosur_image')->store("tenants/{$tenantId}/brosur", 'public');
        }

        $itineraryData = is_string($request->input('itinerary'))
            ? json_decode($request->input('itinerary'), true)
            : $request->input('itinerary');

        $fasilitasData = is_string($request->input('fasilitas'))
            ? json_decode($request->input('fasilitas'), true)
            : $request->input('fasilitas');

        $paket->update([
            'nama_paket' => $validated['nama_paket'],
            'harga' => $validated['harga'],
            'kuota' => $validated['kuota'] ?? $paket->kuota ?? 45,
            'deskripsi' => $validated['deskripsi'] ?? $paket->deskripsi,
            'brosur_image' => $brosurPath,
            'itinerary' => $itineraryData ?? $paket->itinerary,
            'fasilitas' => $fasilitasData ?? $paket->fasilitas,
            'komisi_flat' => $validated['komisi_flat'] ?? 0,
            'komisi_persentase' => $validated['komisi_persentase'] ?? 0,
            'periode_mulai' => $validated['periode_mulai'] ?? null,
            'periode_selesai' => $validated['periode_selesai'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        if (isset($validated['inventaris_ids'])) {
            $syncData = [];
            foreach ($validated['inventaris_ids'] as $invId) {
                $syncData[$invId] = ['qty' => 1];
            }
            $paket->inventaris()->sync($syncData);
        }

        return redirect()->back()->with('success', 'Paket travel berhasil diperbarui.');
    }

    /**
     * Toggle active/inactive status of a package.
     */
    public function togglePackage(Paket $paket): RedirectResponse
    {
        if (auth()->user()->role !== 'super_admin_master' && $paket->tenant_id !== auth()->user()->getActiveTenantId()) {
            abort(403, 'Aksi tidak diizinkan.');
        }

        $paket->update([
            'is_active' => ! $paket->is_active,
        ]);

        $statusText = $paket->is_active ? 'diaktifkan' : 'dinonaktifkan';

        return redirect()->back()->with('success', "Paket travel berhasil {$statusText}.");
    }

    /**
     * Delete a package if no jamaah is attached.
     */
    public function destroyPackage(Paket $paket): RedirectResponse
    {
        if (auth()->user()->role !== 'super_admin_master' && $paket->tenant_id !== auth()->user()->getActiveTenantId()) {
            abort(403, 'Aksi tidak diizinkan.');
        }

        if ($paket->jamaah()->exists()) {
            return redirect()->back()->with('error', 'Paket tidak dapat dihapus karena sudah memiliki data jamaah yang terdaftar. Anda dapat menonaktifkan status paket ini.');
        }

        $paket->inventaris()->detach();
        $paket->delete();

        return redirect()->back()->with('success', 'Paket travel berhasil dihapus.');
    }

    /**
     * Save dynamic Document Permissions (RBAC).
     */
    public function saveDocumentPermissions(Request $request): RedirectResponse
    {
        $tenantId = auth()->user()->getActiveTenantId();

        $validated = $request->validate([
            'permissions' => ['required', 'array'],
            'permissions.*.role_name' => ['required', 'string'],
            'permissions.*.document_type' => ['required', 'string'],
            'permissions.*.is_active' => ['nullable', 'boolean'],
            'permissions.*.can_view' => ['required', 'boolean'],
            'permissions.*.can_upload' => ['required', 'boolean'],
            'permissions.*.can_delete' => ['required', 'boolean'],
        ]);

        foreach ($validated['permissions'] as $perm) {
            DocumentPermission::updateOrCreate(
                [
                    'tenant_id' => $tenantId,
                    'role_name' => $perm['role_name'],
                    'document_type' => $perm['document_type'],
                ],
                [
                    'is_active' => $perm['is_active'] ?? true,
                    'can_view' => $perm['can_view'],
                    'can_upload' => $perm['can_upload'],
                    'can_delete' => $perm['can_delete'],
                ]
            );
        }

        return redirect()->back()->with('success', 'Pengaturan hak akses dokumen (RBAC) berhasil disimpan.');

    }

    /**
     * Store new Bank Account.
     */
    public function storeBank(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'nama_bank' => ['required', 'string', 'max:100'],
            'nomor_rekening' => ['required', 'string', 'max:50'],
            'atas_nama' => ['required', 'string', 'max:255'],
        ]);

        RekeningTenant::create([
            'tenant_id' => auth()->user()->getActiveTenantId(),
            'nama_bank' => $validated['nama_bank'],
            'nomor_rekening' => $validated['nomor_rekening'],
            'atas_nama' => $validated['atas_nama'],
            'is_active' => true,
        ]);

        return redirect()->back()->with('success', 'Rekening bank travel berhasil didaftarkan.');
    }
}
