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
        app()->instance('tenant', $tenant);

        $referer = $request->header('Referer');
        if ($referer) {
            $parsed = parse_url($referer);
            $path = $parsed['path'] ?? '/dashboard';
            if (isset($parsed['query'])) {
                parse_str($parsed['query'], $params);
                unset($params['tenant_id']);
                $newQuery = http_build_query($params);
                $cleanUrl = $path.($newQuery ? '?'.$newQuery : '');
            } else {
                $cleanUrl = $path;
            }

            return redirect($cleanUrl)->with('success', "Beralih ke tenant: {$tenant->nama_travel}");
        }

        return redirect()->back()->with('success', "Beralih ke tenant: {$tenant->nama_travel}");
    }
}
