<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AppSettingsController extends Controller
{
    /**
     * Display the application settings screen.
     */
    public function index(Request $request): Response
    {
        return Inertia::render('Settings/AppSettings', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => session('status'),
            'tenant' => auth()->user()->tenant,
        ]);
    }
}
