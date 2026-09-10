<?php

namespace App\Http\Controllers;

use App\Models\CrmStage;
use App\Models\Jamaah;
use App\Models\JamaahDocument;
use App\Models\KomisiAgen;
use App\Models\Paket;
use App\Models\Pembayaran;
use App\Models\RekeningTenant;
use App\Models\Tenant;
use App\Models\User;
use App\Notifications\JamaahRegisteredNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
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
     * Display the public landing page showcasing brochures and packages with itinerary popup.
     */
    public function index(Request $request): Response
    {
        $tenant = $this->resolveTenant($request);
        $tenantId = $tenant?->id ?? 1;

        $packages = Paket::where('tenant_id', $tenantId)
            ->where('is_active', true)
            ->withCount('jamaah')
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

        $packages = Paket::where('tenant_id', $tenantId)
            ->where('is_active', true)
            ->orderBy('harga')
            ->get();

        $banks = RekeningTenant::where('tenant_id', $tenantId)
            ->where('is_active', true)
            ->get();

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
     * Store new online registration from public prospective jamaah with mandatory KTP & KK files.
     */
    public function registerSubmit(Request $request): RedirectResponse
    {
        $tenant = $this->resolveTenant($request);
        $tenantId = $tenant?->id ?? 1;

        $validated = $request->validate([
            'nama_lengkap' => ['required', 'string', 'max:255'],
            'jenis_kelamin' => ['nullable', 'string', 'in:L,P,Laki-laki,Perempuan'],
            'tempat_lahir' => ['nullable', 'string', 'max:100'],
            'tanggal_lahir' => ['nullable', 'date'],
            'no_hp' => ['required', 'string', 'max:25'],
            'email' => ['nullable', 'email', 'max:255'],
            'nik' => ['nullable', 'string', 'max:20'],
            'alamat_ktp' => ['nullable', 'string', 'max:500'],
            'alamat_domisili' => ['nullable', 'string', 'max:500'],
            'golongan_darah' => ['nullable', 'string', 'max:10'],
            'status_pernikahan' => ['nullable', 'string', 'max:30'],
            'kontak_darurat_nama' => ['nullable', 'string', 'max:255'],
            'kontak_darurat_hp' => ['nullable', 'string', 'max:30'],
            'nomor_paspor' => ['nullable', 'string', 'max:30'],
            'paket_id' => ['required', 'exists:paket,id'],
            'agen_id' => ['nullable', 'exists:users,id'],
            'rekening_tenant_id' => ['nullable', 'exists:rekening_tenant,id'],
            'nominal_dp' => ['nullable', 'numeric', 'min:0'],
            'catatan' => ['nullable', 'string', 'max:500'],
            // Mandatory Documents (KTP & KK)
            'file_ktp' => ['required', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:5120'],
            'file_kk' => ['required', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:5120'],
            // Optional Documents (Foto & Paspor)
            'file_foto' => ['nullable', 'file', 'mimes:jpg,jpeg,png', 'max:5120'],
            'file_paspor' => ['nullable', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:5120'],
            'bukti_transfer' => ['nullable', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:5120'],
        ]);

        // 1. Determine Assigned Agent
        $agenId = $validated['agen_id'] ?? null;
        if (! $agenId) {
            $owner = User::where('tenant_id', $tenantId)->where('role', 'owner_travel')->first();
            $agenId = $owner?->id;
        }

        // 2. Get initial CRM Stage
        $firstStage = CrmStage::where('tenant_id', $tenantId)->orderBy('urutan')->first();

        // 3. Create Jamaah record
        $jamaah = Jamaah::create([
            'tenant_id' => $tenantId,
            'crm_stage_id' => $firstStage?->id ?? 1,
            'agen_id' => $agenId,
            'paket_id' => $validated['paket_id'],
            'nama_lengkap' => $validated['nama_lengkap'],
            'jenis_kelamin' => $validated['jenis_kelamin'] ?? null,
            'tempat_lahir' => $validated['tempat_lahir'] ?? null,
            'tanggal_lahir' => $validated['tanggal_lahir'] ?? null,
            'no_hp' => $validated['no_hp'],
            'email' => $validated['email'] ?? null,
            'nik' => $validated['nik'] ?? null,
            'alamat_ktp' => $validated['alamat_ktp'] ?? null,
            'alamat_domisili' => $validated['alamat_domisili'] ?? null,
            'golongan_darah' => $validated['golongan_darah'] ?? null,
            'status_pernikahan' => $validated['status_pernikahan'] ?? null,
            'kontak_darurat_nama' => $validated['kontak_darurat_nama'] ?? null,
            'kontak_darurat_hp' => $validated['kontak_darurat_hp'] ?? null,
            'nomor_paspor' => $validated['nomor_paspor'] ?? null,
            'catatan_admin' => ($validated['catatan'] ?? null) ?: 'Pendaftaran online mandiri via Website Resmi.',
        ]);

        // 4. Handle Documents Upload (KTP & KK mandatory, Foto & Paspor optional)
        $docUploads = [
            'file_ktp' => 'ktp',
            'file_kk' => 'kk',
            'file_foto' => 'foto',
            'file_paspor' => 'paspor',
        ];

        foreach ($docUploads as $fileInput => $docType) {
            if ($request->hasFile($fileInput)) {
                $uploadedFile = $request->file($fileInput);
                $storedPath = $uploadedFile->storeAs(
                    "tenants/{$tenantId}/jamaah/{$jamaah->id}/documents",
                    time()."_{$docType}.".$uploadedFile->getClientOriginalExtension(),
                    'public'
                );

                JamaahDocument::create([
                    'tenant_id' => $tenantId,
                    'jamaah_id' => $jamaah->id,
                    'type' => $docType,
                    'title' => strtoupper($docType).' - '.$jamaah->nama_lengkap,
                    'file_path' => $storedPath,
                    'file_name' => $uploadedFile->getClientOriginalName(),
                    'mime_type' => $uploadedFile->getClientMimeType(),
                    'file_size' => $uploadedFile->getSize(),
                    'notes' => 'Diunggah saat pendaftaran online.',
                ]);
            }
        }

        // 5. Record DP Payment if entered
        if (! empty($validated['nominal_dp']) && $validated['nominal_dp'] > 0 && ! empty($validated['rekening_tenant_id'])) {
            $buktiPath = null;
            if ($request->hasFile('bukti_transfer')) {
                $uploadedBukti = $request->file('bukti_transfer');
                $buktiPath = $uploadedBukti->storeAs(
                    "tenants/{$tenantId}/jamaah/{$jamaah->id}/payments",
                    time().'_bukti_transfer.'.$uploadedBukti->getClientOriginalExtension(),
                    'public'
                );

                // Also record in JamaahDocument as proof of payment
                JamaahDocument::create([
                    'tenant_id' => $tenantId,
                    'jamaah_id' => $jamaah->id,
                    'type' => 'pembayaran',
                    'title' => 'Bukti Transfer DP - '.$jamaah->nama_lengkap,
                    'file_path' => $buktiPath,
                    'file_name' => $uploadedBukti->getClientOriginalName(),
                    'mime_type' => $uploadedBukti->getClientMimeType(),
                    'file_size' => $uploadedBukti->getSize(),
                    'notes' => 'Bukti transfer pembayaran uang muka (DP) pendaftaran online.',
                ]);
            }

            Pembayaran::create([
                'tenant_id' => $tenantId,
                'jamaah_id' => $jamaah->id,
                'rekening_tenant_id' => $validated['rekening_tenant_id'],
                'tipe_pembayaran' => 'DP',
                'nominal' => $validated['nominal_dp'],
                'bukti_transfer' => $buktiPath,
                'status_verifikasi' => 'Pending',
            ]);
        }

        // 6. Automatically create Komisi record for assigned agent
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

        // 7. Broadcast Notification
        try {
            $admins = User::where('tenant_id', $tenantId)
                ->whereIn('role', ['tenant_owner', 'super_admin', 'admin', 'staff', 'owner_travel', 'admin_travel'])
                ->get();

            $assignedAgent = $agenId ? User::find($agenId) : null;
            $notification = new JamaahRegisteredNotification(
                jamaah: $jamaah,
                source: 'Website Resmi',
                agentName: $assignedAgent?->name
            );

            foreach ($admins as $admin) {
                $admin->notify($notification);
            }

            if ($assignedAgent && ! $admins->contains('id', $assignedAgent->id)) {
                $assignedAgent->notify($notification);
            }
        } catch (\Throwable $e) {
            Log::warning('Broadcast notification error: '.$e->getMessage());
        }

        return redirect()->route('public.register.success', [
            'booking_ref' => $jamaah->kode_pendaftaran,
        ]);
    }

    /**
     * Display booking success receipt screen using secure unique booking token.
     */
    public function registerSuccess(Request $request): Response
    {
        $tenant = $this->resolveTenant($request);
        $tenantId = $tenant?->id ?? 1;

        $bookingRef = $request->query('booking_ref');
        if (! $bookingRef) {
            abort(404, 'Kode pendaftaran tidak ditemukan atau tautan tidak valid.');
        }

        $jamaah = Jamaah::where('tenant_id', $tenantId)
            ->where('kode_pendaftaran', $bookingRef)
            ->with(['paket', 'agen', 'documents', 'pembayaran.rekeningTenant'])
            ->firstOrFail();

        return Inertia::render('Public/RegisterSuccess', [
            'tenant' => $tenant,
            'jamaah' => $jamaah,
        ]);
    }

    /**
     * Display public invoice authenticity verification page using secure unique invoice token.
     */
    public function verifyInvoice(Request $request, string $invoice): Response
    {
        $pembayaran = Pembayaran::where('nomor_invoice', $invoice)->firstOrFail();

        $pembayaran->load(['jamaah.paket', 'rekeningTenant', 'verifiedBy']);
        $tenant = $this->resolveTenant($request);

        return Inertia::render('Public/VerifyInvoice', [
            'tenant' => $tenant,
            'payment' => $pembayaran,
        ]);
    }
}
