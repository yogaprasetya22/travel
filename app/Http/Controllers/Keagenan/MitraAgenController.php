<?php

namespace App\Http\Controllers\Keagenan;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class MitraAgenController extends Controller
{
    /**
     * Display the list of agents for the tenant.
     */
    public function index(Request $request): Response
    {
        $user = auth()->user();
        if (! in_array($user->role, ['owner_travel', 'admin_travel', 'super_admin_master'])) {
            abort(403, 'Unauthorized action.');
        }

        $perPage = (int) $request->input('per_page', 15);
        $tenantId = $user->getActiveTenantId();

        $agents = User::where('tenant_id', $tenantId)
            ->where('role', 'agen')
            ->withCount('jamaah')
            ->orderBy('name')
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('Keagenan/Agents', [
            'agents' => $agents,
        ]);
    }

    /**
     * Store a new agent under the tenant.
     */
    public function store(Request $request): RedirectResponse
    {
        $user = auth()->user();
        if (! in_array($user->role, ['owner_travel', 'admin_travel', 'super_admin_master'])) {
            abort(403, 'Unauthorized action.');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email',
            'password' => 'required|string|min:8',
        ]);

        User::create([
            'tenant_id' => $user->getActiveTenantId(),
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => 'agen',
            'created_by' => $user->id,
        ]);

        return redirect()->back()->with('success', 'Mitra agen baru berhasil didaftarkan.');
    }
}
