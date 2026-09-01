<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AgentProfileController extends Controller
{
    /**
     * Show the agent profile page.
     */
    public function show($referralCode)
    {
        $agent = User::where('referral_code', $referralCode)
            ->where('role', 'agen')
            ->with('tenant')
            ->firstOrFail();

        return Inertia::render('Agent/Profile', [
            'agent' => $agent,
            'tenant' => $agent->tenant,
            'registerUrl' => route('public.register', ['ref' => $agent->referral_code]),
        ]);
    }
}
