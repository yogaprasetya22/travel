<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\HierarchyLevel;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class UserHierarchyController extends Controller
{
    /**
     * Display the visual user hierarchy canvas and permissions view.
     */
    public function index(Request $request): Response
    {
        $currentUser = $request->user();
        $targetTenantId = $currentUser->getActiveTenantId();

        $users = User::where('tenant_id', $targetTenantId)
            ->with(['creator', 'tenant', 'hierarchyLevel'])
            ->get();
        $tenants = Tenant::where('id', $targetTenantId)->get();

        // Get complete hierarchical tree for canvas
        $hierarchyTree = HierarchyLevel::where('tenant_id', $targetTenantId)
            ->whereNull('parent_id')
            ->with(['children.children.children.children'])
            ->orderBy('urutan')
            ->get();

        // Get flat list of all levels for dropdowns/forms
        $allLevels = HierarchyLevel::where('tenant_id', $targetTenantId)
            ->orderBy('urutan')
            ->get();

        return Inertia::render('Settings/UserHierarchy', [
            'users' => $users,
            'tenants' => $tenants,
            'selectedTenantId' => $targetTenantId,
            'hierarchyTree' => $hierarchyTree,
            'allLevels' => $allLevels,
            'currentUserRole' => $currentUser->role,
        ]);
    }

    /**
     * Store new user under the allowed hierarchy level.
     */
    public function store(Request $request): RedirectResponse
    {
        $currentUser = $request->user();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:6'],
            'hierarchy_level_id' => ['required', 'exists:hierarchy_levels,id'],
            'tenant_id' => [
                $currentUser->role === 'super_admin_master' ? 'required' : 'nullable',
                'exists:tenants,id',
            ],
        ]);

        $targetTenantId = $currentUser->role === 'super_admin_master'
            ? $validated['tenant_id']
            : $currentUser->tenant_id;

        $level = HierarchyLevel::where('tenant_id', $targetTenantId)->findOrFail($validated['hierarchy_level_id']);

        User::create([
            'tenant_id' => $targetTenantId,
            'hierarchy_level_id' => $level->id,
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $level->role_key,
            'jabatan' => $level->nama_level,
            'created_by' => $currentUser->id,
        ]);

        return redirect()->back()->with('success', 'Akun pengguna berhasil dibuat dalam hierarki sistem.');
    }

    /**
     * Update an existing user in hierarchy.
     */
    public function update(Request $request, User $user): RedirectResponse
    {
        $currentUser = $request->user();

        if ($currentUser->role !== 'super_admin_master' && $user->tenant_id !== $currentUser->tenant_id) {
            abort(403, 'Aksi tidak diizinkan.');
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'hierarchy_level_id' => ['nullable', 'exists:hierarchy_levels,id'],
            'password' => ['nullable', 'string', 'min:6'],
        ]);

        $updateData = [
            'name' => $validated['name'],
            'email' => $validated['email'],
        ];

        if (! empty($validated['hierarchy_level_id'])) {
            $level = HierarchyLevel::where('tenant_id', $user->tenant_id)->findOrFail($validated['hierarchy_level_id']);
            $updateData['hierarchy_level_id'] = $level->id;
            $updateData['jabatan'] = $level->nama_level;
            $updateData['role'] = $level->role_key;
        }

        if (! empty($validated['password'])) {
            $updateData['password'] = Hash::make($validated['password']);
        }

        $user->update($updateData);

        return redirect()->back()->with('success', 'Data akun pengguna berhasil diperbarui.');
    }

    /**
     * Reassign a user to another hierarchy level.
     */
    public function reassignUser(Request $request, User $user): RedirectResponse
    {
        $currentUser = $request->user();

        if ($currentUser->role !== 'super_admin_master' && $user->tenant_id !== $currentUser->tenant_id) {
            abort(403, 'Aksi tidak diizinkan.');
        }

        $validated = $request->validate([
            'target_level_id' => ['required', 'exists:hierarchy_levels,id'],
        ]);

        $targetLevel = HierarchyLevel::where('tenant_id', $user->tenant_id)->findOrFail($validated['target_level_id']);

        $user->update([
            'hierarchy_level_id' => $targetLevel->id,
            'jabatan' => $targetLevel->nama_level,
            'role' => $targetLevel->role_key,
        ]);

        return redirect()->back()->with('success', "Pengguna {$user->name} berhasil dipindahkan ke tingkatan {$targetLevel->nama_level}.");
    }

    /**
     * Store new hierarchy level node.
     */
    public function storeLevel(Request $request): RedirectResponse
    {
        $currentUser = $request->user();

        $allowedRoleKeys = $currentUser->role === 'super_admin_master'
            ? ['owner_travel', 'admin_travel', 'agen']
            : ['admin_travel', 'agen'];

        $targetTenantId = ($currentUser->role === 'super_admin_master' && ! empty($request->input('tenant_id')))
            ? (int) $request->input('tenant_id')
            : $currentUser->tenant_id;

        $validated = $request->validate([
            'nama_level' => ['required', 'string', 'max:100'],
            'parent_id' => [
                $currentUser->role === 'super_admin_master' ? 'nullable' : 'required',
                'exists:hierarchy_levels,id',
            ],
            'role_key' => ['required', 'string', Rule::in($allowedRoleKeys)],
            'deskripsi' => ['nullable', 'string', 'max:255'],
            'wewenang_note' => ['nullable', 'string', 'max:1000'],
            'tenant_id' => ['nullable'],
        ]);

        $maxUrutan = HierarchyLevel::where('tenant_id', $targetTenantId)->max('urutan') ?? 0;

        HierarchyLevel::create([
            'tenant_id' => $targetTenantId,
            'parent_id' => $validated['parent_id'] ?? null,
            'nama_level' => $validated['nama_level'],
            'role_key' => $validated['role_key'],
            'deskripsi' => $validated['deskripsi'] ?? null,
            'wewenang_note' => $validated['wewenang_note'] ?? null,
            'urutan' => $maxUrutan + 1,
        ]);

        return redirect()->back()->with('success', "Tingkatan jabatan '{$validated['nama_level']}' berhasil ditambahkan.");
    }

    /**
     * Update hierarchy level node.
     */
    public function updateLevel(Request $request, HierarchyLevel $level): RedirectResponse
    {
        $currentUser = $request->user();

        if ($currentUser->role !== 'super_admin_master' && $level->tenant_id !== $currentUser->tenant_id) {
            abort(403, 'Aksi tidak diizinkan.');
        }

        $allowedRoleKeys = $currentUser->role === 'super_admin_master'
            ? ['owner_travel', 'admin_travel', 'agen']
            : ($level->role_key === 'owner_travel' ? ['owner_travel'] : ['admin_travel', 'agen']);

        $validated = $request->validate([
            'nama_level' => ['required', 'string', 'max:100'],
            'role_key' => ['required', 'string', Rule::in($allowedRoleKeys)],
            'deskripsi' => ['nullable', 'string', 'max:255'],
            'wewenang_note' => ['nullable', 'string', 'max:1000'],
        ]);

        $level->update($validated);

        // Sync users assigned to this level
        User::where('hierarchy_level_id', $level->id)->update([
            'jabatan' => $level->nama_level,
            'role' => $level->role_key,
        ]);

        return redirect()->back()->with('success', "Tingkatan jabatan '{$level->nama_level}' berhasil diperbarui.");
    }

    /**
     * Delete hierarchy level node and optionally migrate users.
     */
    public function destroyLevel(Request $request, HierarchyLevel $level): RedirectResponse
    {
        $currentUser = $request->user();

        if ($currentUser->role !== 'super_admin_master' && $level->tenant_id !== $currentUser->tenant_id) {
            abort(403, 'Aksi tidak diizinkan.');
        }

        // Check if there are users in this level
        $userCount = $level->users()->count();
        if ($userCount > 0) {
            $validated = $request->validate([
                'reassign_to_level_id' => ['required', 'exists:hierarchy_levels,id', "not_in:{$level->id}"],
            ]);

            $targetLevel = HierarchyLevel::where('tenant_id', $level->tenant_id)->findOrFail($validated['reassign_to_level_id']);

            // Migrate all users to target level
            User::where('hierarchy_level_id', $level->id)->update([
                'hierarchy_level_id' => $targetLevel->id,
                'jabatan' => $targetLevel->nama_level,
                'role' => $targetLevel->role_key,
            ]);
        }

        // Re-parent children levels to this level's parent
        HierarchyLevel::where('parent_id', $level->id)->update([
            'parent_id' => $level->parent_id,
        ]);

        $levelName = $level->nama_level;
        $level->delete();

        return redirect()->back()->with('success', "Tingkatan jabatan '{$levelName}' berhasil dihapus.");
    }

    /**
     * Delete an existing user from hierarchy.
     */
    public function destroy(Request $request, User $user): RedirectResponse
    {
        $currentUser = $request->user();

        if ($currentUser->role !== 'super_admin_master' && $user->tenant_id !== $currentUser->tenant_id) {
            abort(403, 'Aksi tidak diizinkan.');
        }

        if ($user->id === $currentUser->id) {
            return redirect()->back()->with('error', 'Anda tidak dapat menghapus akun Anda sendiri.');
        }

        if ($user->role === 'owner_travel' && $currentUser->role !== 'super_admin_master') {
            return redirect()->back()->with('error', 'Akun Owner Travel tidak dapat dihapus oleh pengguna tenant.');
        }

        $user->delete();

        return redirect()->back()->with('success', 'Pengguna berhasil dihapus dari struktur hierarki.');
    }
}
