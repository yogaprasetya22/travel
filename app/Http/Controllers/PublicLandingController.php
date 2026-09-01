<?php

namespace App\Http\Controllers;

use App\Models\CrmStage;
use App\Models\Jamaah;
use App\Models\KomisiAgen;
use App\Models\Paket;
use App\Models\Pembayaran;
use App\Models\RekeningTenant;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class PublicLandingController extends Controller
{
    private function resolveTenant(Request $request)
    {
        if (app()->bound('tenant')) {
            return app('tenant');
        }

        $host = $request->getHost();
        $subdomain = explode('.', $host)[0];

        $tenant = Tenant::where('domain_atau_subdomain', $subdomain)->first();

        return $tenant ?: Tenant::first();
    }

    /**
     * Display the public landing page with coffee theme.
     */
    public function index(Request $request): Response
    {
        $tenant = $this->resolveTenant($request);
        $tenantId = $tenant?->id ?? 1;

        $packages = Paket::where('tenant_id', $tenantId)
            ->with('inventaris')
            ->orderBy('harga')
            ->get();

        $banks = RekeningTenant::where('tenant_id', $tenantId)
            ->where('is_active', true)
            ->orderBy('nama_bank')
            ->get();

        return Inertia::render('Welcome', [
            'canLogin' => Route::has('login'),
            'tenant' => $tenant,
            'packages' => $packages,
            'banks' => $banks,
        ]);
    }

    /**
     * Display the public prospective jamaah booking/registration form.
     */
    public function registerForm(Request $request): Response
    {
        $tenant = $this->resolveTenant($request);
        $tenantId = $tenant?->id ?? 1;

        // Detect Agent Referral from query string (?ref=... or ?agent_id=...)
        $ref = $request->query('ref') ?: $request->query('agent_id');
        $referralAgent = null;

        if ($ref) {
            $referralAgent = User::where('tenant_id', $tenantId)
                ->where(function ($q) use ($ref) {
                    $q->where('referral_code', $ref)
                        ->orWhere('email', $ref)
                        ->orWhere('id', (int) $ref)
                        ->orWhere('name', 'ilike', "%{$ref}%");
                })
                ->first();
        }

        $packages = Paket::where('tenant_id', $tenantId)->orderBy('harga')->get();
        $banks = RekeningTenant::where('tenant_id', $tenantId)->where('is_active', true)->get();

        $selectedPackageId = $request->query('paket') ? (int) $request->query('paket') : null;

        return Inertia::render('Public/Register', [
            'tenant' => $tenant,
            'packages' => $packages,
            'banks' => $banks,
            'selectedPackageId' => $selectedPackageId,
            'referralAgent' => $referralAgent ? [
                'id' => $referralAgent->id,
                'name' => $referralAgent->name,
                'email' => $referralAgent->email,
                'jabatan' => $referralAgent->jabatan ?: $referralAgent->hierarchyLevel?->nama_level ?: 'Mitra Agen',
            ] : null,
        ]);
    }

    /**
     * Store new online registration from public prospective jamaah.
     */
    public function registerSubmit(Request $request): RedirectResponse
    {
        $tenant = $this->resolveTenant($request);
        $tenantId = $tenant?->id ?? 1;

        $validated = $request->validate([
            'nama_lengkap' => ['required', 'string', 'max:255'],
            'no_hp' => ['required', 'string', 'max:25'],
            'email' => ['nullable', 'email', 'max:255'],
            'nik' => ['nullable', 'string', 'max:20'],
            'nomor_paspor' => ['nullable', 'string', 'max:30'],
            'paket_id' => ['required', 'exists:paket,id'],
            'agen_id' => ['nullable', 'exists:users,id'],
            'rekening_tenant_id' => ['nullable', 'exists:rekening_tenant,id'],
            'nominal_dp' => ['nullable', 'numeric', 'min:0'],
            'catatan' => ['nullable', 'string', 'max:500'],
        ]);

        // 1. Determine Assigned Agent (Priority: Selected Agent -> Referral -> Tenant Owner)
        $agenId = $validated['agen_id'] ?? null;
        if (! $agenId) {
            $owner = User::where('tenant_id', $tenantId)->where('role', 'owner_travel')->first();
            $agenId = $owner?->id;
        }

        // 2. Get initial CRM Stage (Stage 1)
        $firstStage = CrmStage::where('tenant_id', $tenantId)->orderBy('urutan')->first();

        // 3. Create Jamaah record
        $jamaah = Jamaah::create([
            'tenant_id' => $tenantId,
            'crm_stage_id' => $firstStage?->id ?? 1,
            'agen_id' => $agenId,
            'paket_id' => $validated['paket_id'],
            'nama_lengkap' => $validated['nama_lengkap'],
            'no_hp' => $validated['no_hp'],
            'email' => $validated['email'] ?? null,
            'nik' => $validated['nik'] ?? null,
            'nomor_paspor' => $validated['nomor_paspor'] ?? null,
            'catatan_admin' => $validated['catatan'] ?: 'Pendaftaran online mandiri via Website Resmi.',
        ]);

        // 4. Record DP Payment if entered
        if (! empty($validated['nominal_dp']) && $validated['nominal_dp'] > 0 && ! empty($validated['rekening_tenant_id'])) {
            Pembayaran::create([
                'tenant_id' => $tenantId,
                'jamaah_id' => $jamaah->id,
                'rekening_tenant_id' => $validated['rekening_tenant_id'],
                'tipe_pembayaran' => 'DP',
                'nominal' => $validated['nominal_dp'],
                'status_verifikasi' => 'Pending',
            ]);
        }

        // 5. Automatically create Komisi record for assigned agent
        $paket = Paket::find($validated['paket_id']);
        if ($paket && $agenId) {
            $nominalKomisi = $paket->komisi_flat > 0
                ? (float) $paket->komisi_flat
                : (float) ($paket->harga * ($paket->komisi_persentase / 100));

            if ($nominalKomisi > 0) {
                KomisiAgen::create([
                    'tenant_id' => $tenantId,
                    'agen_id' => $agenId,
                    'jamaah_id' => $jamaah->id,
                    'nominal_komisi' => $nominalKomisi,
                    'status_pencairan' => 'Pending',
                ]);
            }
        }

        return redirect()->route('public.register.success', [
            'booking_id' => $jamaah->id,
        ]);
    }

    /**
     * Display booking success receipt screen.
     */
    public function registerSuccess(Request $request): Response
    {
        $tenant = $this->resolveTenant($request);
        $tenantId = $tenant?->id ?? 1;

        $bookingId = $request->query('booking_id');
        $jamaah = Jamaah::where('tenant_id', $tenantId)
            ->with(['paket', 'agen', 'pembayaran.rekeningTenant'])
            ->find($bookingId);

        return Inertia::render('Public/RegisterSuccess', [
            'tenant' => $tenant,
            'jamaah' => $jamaah,
        ]);
    }
}
