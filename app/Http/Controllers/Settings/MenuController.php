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

        $menus = Menu::whereNull('parent_id')
            ->with(['children' => function ($query) {
                $query->orderBy('urutan');
            }])
            ->orderBy('urutan')
            ->get();

        // Get dynamic hierarchy levels for this tenant
        $hierarchyLevels = HierarchyLevel::where('tenant_id', $tenantId)
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
                'name' => $lvl->nama_level,
                'role_key' => $lvl->role_key,
                'key' => $key,
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

        // Keep super_admin_master if it was already there (platform-wide)
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
}
