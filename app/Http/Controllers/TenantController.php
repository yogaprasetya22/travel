<?php

namespace App\Http\Controllers;

use App\Models\CrmStage;
use App\Models\HierarchyLevel;
use App\Models\Jamaah;
use App\Models\Pembayaran;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class TenantController extends Controller
{
    /**
     * Display the Tenants Management platform list with summary metrics.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        if ($user->role !== 'super_admin_master') {
            abort(403, 'Hanya Super Admin Master yang dapat mengakses Tenants Management.');
        }

        $search = $request->input('search');
        $perPage = (int) $request->input('per_page', 12);

        $query = Tenant::query()
            ->withCount(['users', 'jamaah', 'paket'])
            ->with(['users' => function ($q) {
                $q->where('role', 'owner_travel')->select('id', 'tenant_id', 'name', 'email');
            }]);

        if (! empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('nama_travel', 'ilike', "%{$search}%")
                    ->orWhere('domain_atau_subdomain', 'ilike', "%{$search}%");
            });
        }

        $tenants = $query->orderBy('nama_travel')->paginate($perPage)->withQueryString();

        // Calculate verified omzet for each tenant in current page
        $tenants->getCollection()->transform(function ($t) {
            $t->total_omzet = (float) Pembayaran::withoutGlobalScope('tenant')
                ->where('tenant_id', $t->id)
                ->where('status_verifikasi', 'Verified')
                ->sum('nominal');

            return $t;
        });

        // Platform-wide metrics
        $metrics = [
            'total_tenants' => Tenant::count(),
            'total_users' => User::whereNotNull('tenant_id')->count(),
            'total_jamaah' => Jamaah::withoutGlobalScope('tenant')->count(),
            'total_omzet' => (float) Pembayaran::withoutGlobalScope('tenant')->where('status_verifikasi', 'Verified')->sum('nominal'),
        ];

        $appUrl = env('APP_URL', 'http://localhost:8000');
        $host = parse_url($appUrl, PHP_URL_HOST) ?? 'localhost';
        $port = parse_url($appUrl, PHP_URL_PORT);
        $domainSuffix = '.' . $host . ($port ? ':' . $port : '');

        return Inertia::render('Tenants/Index', [
            'tenants' => $tenants,
            'metrics' => $metrics,
            'filters' => [
                'search' => $search ?? '',
                'per_page' => $perPage,
            ],
            'activeTenantId' => (int) $request->session()->get('tenant_id', Tenant::first()?->id ?? 1),
            'domainSuffix' => $domainSuffix,
        ]);
    }

    /**
     * Store and onboard a new Tenant with default Owner, CRM Stages, and Hierarchy Levels.
     */
    public function store(Request $request): RedirectResponse
    {
        $user = $request->user();
        if ($user->role !== 'super_admin_master') {
            abort(403, 'Hanya Super Admin Master yang dapat membuat tenant baru.');
        }

        $validated = $request->validate([
            'nama_travel' => ['required', 'string', 'max:255'],
            'domain_atau_subdomain' => ['required', 'string', 'max:100', 'unique:tenants,domain_atau_subdomain'],
            'logo' => ['nullable', 'string', 'max:255'],
            'owner_name' => ['required', 'string', 'max:255'],
            'owner_email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'owner_password' => ['required', 'string', 'min:6'],
        ]);

        DB::transaction(function () use ($validated, $user) {
            // 1. Create Tenant
            $tenant = Tenant::create([
                'nama_travel' => $validated['nama_travel'],
                'domain_atau_subdomain' => strtolower(preg_replace('/[^a-zA-Z0-9.-]/', '', $validated['domain_atau_subdomain'])),
                'logo' => $validated['logo'] ?? null,
            ]);

            // 2. Create Default Hierarchy Levels
            $ownerLevel = HierarchyLevel::create([
                'tenant_id' => $tenant->id,
                'parent_id' => null,
                'nama_level' => 'Owner',
                'role_key' => 'owner_travel',
                'deskripsi' => 'Pemilik Travel / Pimpinan Utama',
                'wewenang_note' => 'Akses penuh seluruh operasional, keuangan, dan konfigurasi travel.',
                'urutan' => 1,
            ]);

            $supervisorLevel = HierarchyLevel::create([
                'tenant_id' => $tenant->id,
                'parent_id' => $ownerLevel->id,
                'nama_level' => 'Supervisor',
                'role_key' => 'admin_travel',
                'deskripsi' => 'Pengawas Operasional & Verifikator',
                'wewenang_note' => 'Verifikasi pembayaran jamaah, monitoring komisi agen, dan distribusi inventaris.',
                'urutan' => 2,
            ]);

            HierarchyLevel::create([
                'tenant_id' => $tenant->id,
                'parent_id' => $supervisorLevel->id,
                'nama_level' => 'Staff (Mitra Agen)',
                'role_key' => 'agen',
                'deskripsi' => 'Staff Lapangan / Mitra Agen Penjualan',
                'wewenang_note' => 'Pendaftaran calon jamaah, input lead CRM, dan cek komisi closing.',
                'urutan' => 3,
            ]);

            // 3. Create Initial Travel Owner User
            User::create([
                'tenant_id' => $tenant->id,
                'hierarchy_level_id' => $ownerLevel->id,
                'name' => $validated['owner_name'],
                'email' => $validated['owner_email'],
                'password' => Hash::make($validated['owner_password']),
                'role' => 'owner_travel',
                'jabatan' => 'Owner',
                'created_by' => $user->id,
            ]);

            // 4. Create Default CRM Stages
            $defaultStages = [
                ['nama_tahap' => 'Leads Baru', 'urutan' => 1],
                ['nama_tahap' => 'Follow Up / Tertarik', 'urutan' => 2],
                ['nama_tahap' => 'Closing DP & Berkas', 'urutan' => 3],
                ['nama_tahap' => 'Pelunasan & Paspor Ready', 'urutan' => 4],
                ['nama_tahap' => 'Siap Berangkat & Manasik', 'urutan' => 5],
            ];

            foreach ($defaultStages as $stage) {
                CrmStage::create([
                    'tenant_id' => $tenant->id,
                    'nama_tahap' => $stage['nama_tahap'],
                    'urutan' => $stage['urutan'],
                    'is_active' => true,
                ]);
            }
        });

        return redirect()->back()->with('success', "Tenant {$validated['nama_travel']} dan akun Owner berhasil dibuat.");
    }

    /**
     * Update Tenant information.
     */
    public function update(Request $request, Tenant $tenant): RedirectResponse
    {
        $user = $request->user();
        if ($user->role !== 'super_admin_master') {
            abort(403, 'Hanya Super Admin Master yang dapat mengedit tenant.');
        }

        $validated = $request->validate([
            'nama_travel' => ['required', 'string', 'max:255'],
            'domain_atau_subdomain' => ['required', 'string', 'max:100', Rule::unique('tenants', 'domain_atau_subdomain')->ignore($tenant->id)],
            'logo' => ['nullable', 'string', 'max:255'],
        ]);

        $tenant->update([
            'nama_travel' => $validated['nama_travel'],
            'domain_atau_subdomain' => strtolower(preg_replace('/[^a-zA-Z0-9.-]/', '', $validated['domain_atau_subdomain'])),
            'logo' => $validated['logo'] ?? $tenant->logo,
        ]);

        return redirect()->back()->with('success', "Informasi tenant {$tenant->nama_travel} berhasil diperbarui.");
    }

    /**
     * Delete/Deactivate Tenant with safety validation.
     */
    public function destroy(Request $request, Tenant $tenant): RedirectResponse
    {
        $user = $request->user();
        if ($user->role !== 'super_admin_master') {
            abort(403, 'Hanya Super Admin Master yang dapat menghapus tenant.');
        }

        if (Tenant::count() <= 1) {
            return redirect()->back()->with('error', 'Tidak dapat menghapus tenant terakhir dalam sistem.');
        }

        $travelName = $tenant->nama_travel;

        DB::transaction(function () use ($tenant) {
            $tenant->delete();
        });

        return redirect()->route('tenants.index')->with('success', "Tenant {$travelName} berhasil dihapus.");
    }

    /**
     * Enter/Directly Switch to a Tenant and redirect to its Dashboard.
     */
    public function enterTenant(Request $request, Tenant $tenant): RedirectResponse
    {
        $user = $request->user();
        if ($user->role !== 'super_admin_master') {
            abort(403, 'Hanya Super Admin Master yang dapat beralih tenant.');
        }

        $request->session()->put('tenant_id', $tenant->id);
        app()->instance('tenant', $tenant);

        return redirect()->route('dashboard')->with('success', "Beralih ke tenant: {$tenant->nama_travel}");
    }

    /**
     * Switch active tenant context for Super Admin Master (AJAX/In-place).
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
