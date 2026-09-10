<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LandingPageCmsController extends Controller
{
    /**
     * Display the Landing Page CMS editor screen.
     */
    public function index(Request $request): Response
    {
        $tenant = $request->user()->tenant;

        return Inertia::render('Settings/LandingCms', [
            'tenant' => $tenant,
            'landingConfig' => $tenant?->landing_config ?? [],
            'status' => session('status'),
        ]);
    }

    /**
     * Update the tenant landing page configuration.
     */
    public function update(Request $request): RedirectResponse
    {
        $tenant = $request->user()->tenant;

        if (! $tenant) {
            return back()->with('error', 'Tenant tidak ditemukan.');
        }

        $validated = $request->validate([
            'landing_config' => 'required|array',
            'landing_config.hero' => 'nullable|array',
            'landing_config.hero.badge_text' => 'nullable|string|max:255',
            'landing_config.hero.title' => 'nullable|string|max:500',
            'landing_config.hero.subtitle' => 'nullable|string|max:1000',
            'landing_config.hero.cta_package_text' => 'nullable|string|max:100',
            'landing_config.hero.cta_calc_text' => 'nullable|string|max:100',
            'landing_config.stats' => 'nullable|array',
            'landing_config.stats.jamaah_count' => 'nullable|string|max:50',
            'landing_config.stats.satisfaction_rate' => 'nullable|string|max:50',
            'landing_config.stats.on_time_rate' => 'nullable|string|max:50',
            'landing_config.stats.experience_years' => 'nullable|string|max:50',
            'landing_config.visibility' => 'nullable|array',
            'landing_config.visibility.hero' => 'nullable|boolean',
            'landing_config.visibility.search_bar' => 'nullable|boolean',
            'landing_config.visibility.stats' => 'nullable|boolean',
            'landing_config.visibility.partners' => 'nullable|boolean',
            'landing_config.visibility.katalog' => 'nullable|boolean',
            'landing_config.visibility.kalkulator' => 'nullable|boolean',
            'landing_config.visibility.legalitas' => 'nullable|boolean',
            'landing_config.visibility.testimoni' => 'nullable|boolean',
            'landing_config.visibility.tracking' => 'nullable|boolean',
            'landing_config.legalitas' => 'nullable|array',
            'landing_config.legalitas.nomor_ppiu' => 'nullable|string|max:255',
            'landing_config.legalitas.akreditasi' => 'nullable|string|max:100',
            'landing_config.legalitas.title' => 'nullable|string|max:255',
            'landing_config.legalitas.subtitle' => 'nullable|string|max:500',
            'landing_config.partners' => 'nullable|array',
            'landing_config.partners.airlines' => 'nullable|array',
            'landing_config.partners.hotels' => 'nullable|array',
        ]);

        $tenant->update([
            'landing_config' => $validated['landing_config'],
        ]);

        return back()
            ->with('status', 'Konfigurasi CMS Landing Page berhasil disimpan.')
            ->with('success', 'Konfigurasi CMS Landing Page berhasil disimpan.');
    }
}
