<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
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

        // Get users according to role scope
        if ($currentUser->role === 'super_admin_master') {
            $users = User::with(['creator', 'tenant'])->get();
            $tenants = Tenant::all();
        } else {
            $users = User::where('tenant_id', $currentUser->tenant_id)
                ->with(['creator'])
                ->get();
            $tenants = Tenant::where('id', $currentUser->tenant_id)->get();
        }

        return Inertia::render('Settings/UserHierarchy', [
            'users' => $users,
            'tenants' => $tenants,
            'currentUserRole' => $currentUser->role,
        ]);
    }

    /**
     * Store new user under the allowed hierarchy level.
     */
    public function store(Request $request): RedirectResponse
    {
        $currentUser = $request->user();

        // Determine which roles current user is permitted to create
        // Super Admin Master -> Owner Travel
        // Owner Travel -> Admin Travel & Agen
        // Admin Travel -> Agen
        $allowedTargetRoles = [];
        if ($currentUser->role === 'super_admin_master') {
            $allowedTargetRoles = ['owner_travel'];
        } elseif ($currentUser->role === 'owner_travel') {
            $allowedTargetRoles = ['admin_travel', 'agen'];
        } elseif ($currentUser->role === 'admin_travel') {
            $allowedTargetRoles = ['agen'];
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:6'],
            'role' => ['required', 'string', Rule::in($allowedTargetRoles)],
            'jabatan' => ['nullable', 'string', 'max:100'],
            'tenant_id' => [
                $currentUser->role === 'super_admin_master' ? 'required' : 'nullable',
                'exists:tenants,id',
            ],
        ]);

        $targetTenantId = $currentUser->role === 'super_admin_master'
            ? $validated['tenant_id']
            : $currentUser->tenant_id;

        User::create([
            'tenant_id' => $targetTenantId,
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
            'jabatan' => $validated['jabatan'] ?? 'Staff',
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

        // Check if current user has permission to edit this user
        if ($currentUser->role !== 'super_admin_master' && $user->tenant_id !== $currentUser->tenant_id) {
            abort(403, 'Aksi tidak diizinkan.');
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'jabatan' => ['nullable', 'string', 'max:100'],
            'password' => ['nullable', 'string', 'min:6'],
        ]);

        $updateData = [
            'name' => $validated['name'],
            'email' => $validated['email'],
        ];

        if (isset($validated['jabatan'])) {
            $updateData['jabatan'] = $validated['jabatan'];
        }

        if (! empty($validated['password'])) {
            $updateData['password'] = Hash::make($validated['password']);
        }

        $user->update($updateData);

        return redirect()->back()->with('success', 'Data akun pengguna berhasil diperbarui.');
    }
}
