<?php

namespace App\Http\Controllers;

use App\Models\Tenant;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class TenantController extends Controller
{
    /**
     * Switch active tenant context for Super Admin Master.
     */
    public function switchTenant(Request $request): RedirectResponse
    {
        $user = $request->user();

        if ($user->role !== 'super_admin_master') {
            abort(403, 'Hanya Super Admin Master yang dapat beralih tenant.');
        }

        $validated = $request->validate([
            'tenant_id' => ['required', 'exists:tenants,id'],
        ]);

        $tenant = Tenant::findOrFail($validated['tenant_id']);

        $request->session()->put('tenant_id', $tenant->id);

        return redirect()->back()->with('success', "Beralih ke tenant: {$tenant->nama_travel}");
    }
}
