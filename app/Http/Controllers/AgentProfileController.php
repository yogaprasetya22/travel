<?php

namespace App\Http\Controllers;

use App\Models\Tenant;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AgentProfileController extends Controller
{
    /**
     * Show the agent profile page.
     */
    public function show(Request $request, $referralCode)
    {
        $host = $request->getHost();
        $subdomain = explode('.', $host)[0];

        $tenant = Tenant::where('domain_atau_subdomain', $subdomain)->first();
        if (! $tenant) {
            abort(404, 'Tenant not found');
        }

        $agent = User::where('referral_code', $referralCode)
            ->where('role', 'agen')
            ->where('tenant_id', $tenant->id)
            ->with('tenant')
            ->firstOrFail();

        return Inertia::render('Agent/Profile', [
            'agent' => $agent,
            'tenant' => $agent->tenant,
            'registerUrl' => route('public.register', ['ref' => $agent->referral_code]),
        ]);
    }
}
