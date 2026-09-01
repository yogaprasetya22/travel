<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\CrmStage;
use App\Models\Inventaris;
use App\Models\Paket;
use App\Models\RekeningTenant;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
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

        return Inertia::render('Settings/MasterData', [
            'stages' => $stages,
            'packages' => $packages,
            'banks' => $banks,
            'inventoryItems' => $inventoryItems,
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
     * Store new Paket Umroh / Haji.
     */
    public function storePackage(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'nama_paket' => ['required', 'string', 'max:255'],
            'harga' => ['required', 'numeric', 'min:0'],
            'komisi_flat' => ['nullable', 'numeric', 'min:0'],
            'komisi_persentase' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'periode_mulai' => ['nullable', 'date'],
            'periode_selesai' => ['nullable', 'date', 'after_or_equal:periode_mulai'],
            'is_active' => ['nullable', 'boolean'],
            'inventaris_ids' => ['nullable', 'array'],
        ]);

        $paket = Paket::create([
            'tenant_id' => auth()->user()->getActiveTenantId(),
            'nama_paket' => $validated['nama_paket'],
            'harga' => $validated['harga'],
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

        return redirect()->back()->with('success', 'Paket travel berhasil ditambahkan.');
    }

    /**
     * Update existing Paket Umroh / Haji.
     */
    public function updatePackage(Request $request, Paket $paket): RedirectResponse
    {
        if (auth()->user()->role !== 'super_admin_master' && $paket->tenant_id !== auth()->user()->getActiveTenantId()) {
            abort(403, 'Aksi tidak diizinkan.');
        }

        $validated = $request->validate([
            'nama_paket' => ['required', 'string', 'max:255'],
            'harga' => ['required', 'numeric', 'min:0'],
            'komisi_flat' => ['nullable', 'numeric', 'min:0'],
            'komisi_persentase' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'periode_mulai' => ['nullable', 'date'],
            'periode_selesai' => ['nullable', 'date', 'after_or_equal:periode_mulai'],
            'is_active' => ['nullable', 'boolean'],
            'inventaris_ids' => ['nullable', 'array'],
        ]);

        $paket->update([
            'nama_paket' => $validated['nama_paket'],
            'harga' => $validated['harga'],
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
