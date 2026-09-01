<?php

namespace App\Http\Controllers\CRM;

use App\Http\Controllers\Controller;
use App\Models\Paket;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class GuestRegisterFormController extends Controller
{
    /**
     * Handle display of the registration form.
     */
    public function __invoke(Request $request, string $email): Response
    {
        $packages = Paket::all();

        return Inertia::render('CRM/GuestRegisterForm', [
            'email' => $email,
            'packages' => $packages,
            'tenant' => app()->bound('tenant') ? app('tenant') : null,
        ]);
    }
}
