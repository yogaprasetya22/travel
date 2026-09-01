<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\HierarchyLevel;
use App\Models\Menu;
use App\Models\Tenant;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MenuController extends Controller
{
    /**
     * Display the Roles & Permissions menu access list.
     */
    public function index(Request $request): Response
    {
        $currentUser = $request->user();
        if (! in_array($currentUser->role, ['owner_travel', 'super_admin_master'])) {
            abort(403, 'Unauthorized action.');
        }

        $tenantId = $currentUser->getActiveTenantId();

        $menusQuery = Menu::whereNull('parent_id')
            ->with(['children' => function ($query) {
                $query->orderBy('urutan');
            }])
            ->orderBy('urutan');

        if (! $currentUser->isSuperAdmin()) {
            $menusQuery->where('url', '!=', '/tenants');
        }

        $menus = $menusQuery->get();

        // Get dynamic hierarchy levels for this tenant
        $hierarchyLevels = HierarchyLevel::where('tenant_id', $tenantId)
            ->whereNotIn('nama_level', ['Admin', 'Admin Travel', 'admin_travel'])
            ->orderBy('urutan')
            ->get();

        $availableLevels = $hierarchyLevels->map(function ($lvl) {
            $key = strtolower(str_replace(' ', '_', $lvl->nama_level));
            if ($lvl->role_key === 'owner_travel') {
                $key = 'owner_travel';
            } elseif ($lvl->nama_level === 'Staff' || $lvl->nama_level === 'Staff (Mitra Agen)') {
                $key = 'agen';
            }

            return [
                'id' => $lvl->id,
                'level_number' => (int) $lvl->urutan,
                'name' => $lvl->nama_level,
                'role_key' => $lvl->role_key,
                'key' => $key,
                'rank_key' => 'level_'.$lvl->urutan,
                'level_key' => 'level_'.$lvl->id,
            ];
        });

        $tenants = $currentUser->role === 'super_admin_master'
            ? Tenant::orderBy('nama_travel')->get(['id', 'nama_travel', 'domain_atau_subdomain'])
            : [];

        return Inertia::render('Settings/Menus', [
            'menus' => $menus,
            'availableLevels' => $availableLevels,
            'tenants' => $tenants,
            'selectedTenantId' => $tenantId,
        ]);
    }

    /**
     * Update the allowed roles for a specific menu item.
     */
    public function update(Request $request, Menu $menu): RedirectResponse
    {
        $currentUser = $request->user();
        if (! in_array($currentUser->role, ['owner_travel', 'super_admin_master'])) {
            abort(403, 'Unauthorized action.');
        }

        $validated = $request->validate([
            'roles' => 'present|array',
            'roles.*' => 'string|max:100',
        ]);

        $newRoles = $validated['roles'];
        if (in_array('super_admin_master', $menu->roles ?? [])) {
            if (! in_array('super_admin_master', $newRoles)) {
                $newRoles[] = 'super_admin_master';
            }
        }

        $menu->update([
            'roles' => array_values(array_unique($newRoles)),
        ]);

        return redirect()->back()->with('success', 'Akses menu berhasil diperbarui.');
    }

    /**
     * Batch update allowed roles for multiple menu items.
     */
    public function batchUpdate(Request $request): RedirectResponse
    {
        $currentUser = $request->user();
        if (! in_array($currentUser->role, ['owner_travel', 'super_admin_master'])) {
            abort(403, 'Unauthorized action.');
        }

        $validated = $request->validate([
            'updates' => 'required|array',
            'updates.*.id' => 'required|exists:menus,id',
            'updates.*.roles' => 'present|array',
            'updates.*.roles.*' => 'string|max:100',
        ]);

        foreach ($validated['updates'] as $item) {
            $menu = Menu::find($item['id']);
            if (! $menu) {
                continue;
            }

            $newRoles = $item['roles'];
            if (in_array('super_admin_master', $menu->roles ?? [])) {
                if (! in_array('super_admin_master', $newRoles)) {
                    $newRoles[] = 'super_admin_master';
                }
            }

            $menu->update([
                'roles' => array_values(array_unique($newRoles)),
            ]);
        }

        return redirect()->back()->with('success', 'Semua perubahan hak akses berhasil disimpan.');
    }
}
