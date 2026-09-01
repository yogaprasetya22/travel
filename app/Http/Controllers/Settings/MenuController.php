<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\Menu;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MenuController extends Controller
{
    /**
     * Display the Roles & Permissions menu access list.
     */
    public function index(): Response
    {
        if (auth()->user()->role !== 'owner_travel') {
            abort(403, 'Unauthorized action.');
        }

        $menus = Menu::whereNull('parent_id')
            ->with(['children' => function ($query) {
                $query->orderBy('urutan');
            }])
            ->orderBy('urutan')
            ->get();

        $roles = [
            'owner_travel',
            'supervisor',
            'team_leader',
            'agen',
        ];

        return Inertia::render('Settings/Menus', [
            'menus' => $menus,
            'availableRoles' => $roles,
        ]);
    }

    /**
     * Update the allowed roles for a specific menu item.
     */
    public function update(Request $request, Menu $menu): RedirectResponse
    {
        if (auth()->user()->role !== 'owner_travel') {
            abort(403, 'Unauthorized action.');
        }

        $validated = $request->validate([
            'roles' => 'present|array',
            'roles.*' => 'string|in:super_admin_master,owner_travel,supervisor,team_leader,admin_travel,agen',
        ]);

        // Keep super_admin_master if it was already there (since SAM is platform-wide and not managed at tenant level)
        $newRoles = $validated['roles'];
        if (in_array('super_admin_master', $menu->roles)) {
            if (! in_array('super_admin_master', $newRoles)) {
                $newRoles[] = 'super_admin_master';
            }
        }

        $menu->update([
            'roles' => $newRoles,
        ]);

        return redirect()->back()->with('success', 'Akses menu berhasil diperbarui.');
    }
}
