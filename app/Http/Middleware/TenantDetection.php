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
        $host = $request->getHost();
        $subdomain = explode('.', $host)[0];

        $tenant = null;

        if (! in_array($subdomain, ['localhost', 'travel', 'app', 'www', '127']) && ! filter_var($host, FILTER_VALIDATE_IP)) {
            $tenant = Tenant::where('domain_atau_subdomain', $subdomain)->first();
        }

        if (! $tenant && $request->hasSession() && $request->session()->has('tenant_id')) {
            $tenant = Tenant::find($request->session()->get('tenant_id'));
        }

        if (! $tenant && auth()->check() && auth()->user()->tenant_id) {
            $tenant = auth()->user()->tenant;
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
