<?php

namespace App\Http\Middleware;

use App\Models\Tenant;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class TenantDetection
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $tenant = Tenant::fromHost($request->getHost());

        if (! $tenant && $request->hasSession() && $request->session()->has('tenant_id')) {
            $tenant = Tenant::find($request->session()->get('tenant_id'));
        }

        if (! $tenant && auth()->check() && auth()->user()->tenant_id) {
            $tenant = auth()->user()->tenant;
        }

        if (! $tenant && auth()->check() && auth()->user()->role === 'super_admin_master') {
            if ($request->hasSession() && $request->session()->has('tenant_id')) {
                $tenant = Tenant::find($request->session()->get('tenant_id'));
            }
            if (! $tenant) {
                $tenant = Tenant::oldest('id')->first();
            }
        }

        // Cross-Tenant Session Guard:
        // If a specific tenant subdomain is accessed, but active user belongs to a different tenant
        if ($tenant && auth()->check() && ! auth()->user()->isSuperAdmin()) {
            if (auth()->user()->tenant_id && auth()->user()->tenant_id !== $tenant->id) {
                auth()->guard('web')->logout();
                if ($request->hasSession()) {
                    $request->session()->invalidate();
                    $request->session()->regenerateToken();
                }
            }
        }

        if ($tenant) {
            app()->instance('tenant', $tenant);

            if ($request->hasSession()) {
                $request->session()->put('tenant_id', $tenant->id);
            }
        }

        return $next($request);
    }
}
