<?php

namespace App\Http\Controllers;

use App\Models\Paket;
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

        $tenant = Tenant::fromHost($host) ?? (Tenant::isBaseHost($host) ? Tenant::default() : null);
        if (! $tenant) {
            abort(404, 'Tenant not found');
        }

        $agent = User::where('referral_code', $referralCode)
            ->where('tenant_id', $tenant->id)
            ->with('tenant')
            ->firstOrFail();

        $packages = Paket::where('tenant_id', $tenant->id)
            ->where('is_active', true)
            ->get();

        return Inertia::render('Agent/Profile', [
            'agent' => $agent,
            'tenant' => $agent->tenant,
            'packages' => $packages,
            'registerUrl' => route('public.register', ['ref' => $agent->referral_code]),
        ]);
    }
}
