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
     * Helper to mask sensitive string (e.g., NIK, phone number).
     */
    private function maskSensitive(?string $str, int $visibleStart = 4, int $visibleEnd = 4, string $maskChar = '•'): string
    {
        if (! $str) {
            return '-';
        }
        $len = mb_strlen($str);
        if ($len <= ($visibleStart + $visibleEnd)) {
            return $str;
        }
        $start = mb_substr($str, 0, $visibleStart);
        $end = mb_substr($str, -$visibleEnd);
        $maskLen = min(6, $len - $visibleStart - $visibleEnd);

        return $start.' '.str_repeat($maskChar, $maskLen).' '.$end;
    }

    /**
     * Helper to mask email address.
     */
    private function maskEmail(?string $email): string
    {
        if (! $email || ! str_contains($email, '@')) {
            return '-';
        }
        [$name, $domain] = explode('@', $email, 2);
        $nameLen = mb_strlen($name);
        $visible = min(2, $nameLen);
        $maskedName = mb_substr($name, 0, $visible).'•••';

        return $maskedName.'@'.$domain;
    }

    /**
     * Display public customer tracking portal for real-time payment progress, schedules, and document status.
     * Supports 2-Factor verification (Code/Invoice/Phone + Last 4 digits of phone PIN) and secure token.
     */
    public function trackingPage(Request $request): Response
    {
        $tenant = $this->resolveTenant($request);
        $tenantId = $tenant?->id ?? 1;

        $code = trim((string) $request->input('code', $request->input('q', $request->input('kode', ''))));
        $pin = trim((string) $request->input('pin', $request->input('phone_last4', '')));
        $token = trim((string) $request->input('token', ''));

        $jamaahData = null;
        $searchPerformed = ! empty($code) || ! empty($token);
        $notFound = false;
        $requirePin = false;
        $invalidPin = false;
        $candidateHint = null;

        if ($searchPerformed) {
            $cleanPhone = preg_replace('/[^0-9]/', '', $code);

            $queryBuilder = Jamaah::where('tenant_id', $tenantId)
                ->where(function ($q) use ($code, $cleanPhone) {
                    if (! empty($code)) {
                        $q->whereRaw('LOWER(kode_pendaftaran) = ?', [strtolower($code)])
                            ->orWhereHas('pembayaran', function ($pQ) use ($code) {
                                $pQ->whereRaw('LOWER(nomor_invoice) = ?', [strtolower($code)]);
                            });

                        if (strlen($cleanPhone) >= 8) {
                            $q->orWhere('no_hp', 'like', "%{$cleanPhone}%");
                        }
                    }
                })
                ->with([
                    'paket',
                    'agen',
                    'crmStage',
                    'documents',
                    'pembayaran.rekeningTenant',
                    'itemDistributions.inventaris',
                ])
                ->latest();

            $jamaah = $queryBuilder->first();

            if ($jamaah) {
                $cleanNik = preg_replace('/[^0-9]/', '', (string) $jamaah->nik);
                $cleanJamaahPhone = preg_replace('/[^0-9]/', '', (string) $jamaah->no_hp);

                // Priority PIN: 4 digit terakhir NIK KTP, fallback ke 4 digit terakhir No. HP
                $hasNik = strlen($cleanNik) >= 4;
                $expectedPin = $hasNik ? substr($cleanNik, -4) : substr($cleanJamaahPhone, -4);
                $pinLabel = $hasNik ? 'NIK KTP' : 'Nomor WhatsApp';
                $maskedHint = $hasNik
                    ? substr($cleanNik, 0, 4).'••••••••'.substr($cleanNik, -2)
                    : substr($cleanJamaahPhone, 0, 4).'••••'.substr($cleanJamaahPhone, -2);

                $isTokenValid = ! empty($token) && $jamaah->isValidTrackingToken($token);

                // If token is valid OR PIN matches expected PIN (4 digit NIK)
                if ($isTokenValid || (! empty($pin) && $pin === $expectedPin)) {
                    $totalPaket = (float) ($jamaah->paket?->harga ?? 0);
                    $totalVerified = (float) $jamaah->pembayaran->filter(fn ($p) => in_array(strtolower((string) $p->status_verifikasi), ['verified', 'diverifikasi']))->sum('nominal');
                    $totalPending = (float) $jamaah->pembayaran->filter(fn ($p) => in_array(strtolower((string) $p->status_verifikasi), ['pending', 'menunggu']))->sum('nominal');
                    $sisaTagihan = max(0, $totalPaket - $totalVerified);
                    $persentase = $totalPaket > 0 ? min(100, round(($totalVerified / $totalPaket) * 100)) : 0;
                    $isLunas = $totalPaket > 0 && $sisaTagihan <= 0;

                    $jamaahData = [
                        'id' => $jamaah->id,
                        'kode_pendaftaran' => $jamaah->kode_pendaftaran,
                        'nama_lengkap' => $jamaah->nama_lengkap,
                        'no_hp' => $this->maskSensitive($jamaah->no_hp, 4, 4),
                        'email' => $this->maskEmail($jamaah->email),
                        'nik' => $this->maskSensitive($jamaah->nik, 4, 4),
                        'tracking_token' => $jamaah->getTrackingToken(),
                        'tanggal_keberangkatan' => $jamaah->tanggal_keberangkatan ?: $jamaah->paket?->periode_mulai,
                        'created_at' => $jamaah->created_at?->toISOString(),
                        'status_logistik' => $jamaah->status_logistik,
                        'no_resi_logistik' => $jamaah->no_resi_logistik,
                        'ekspedisi_logistik' => $jamaah->ekspedisi_logistik,
                        'tanggal_serah_terima_logistik' => $jamaah->tanggal_serah_terima_logistik?->toISOString(),
                        'stage' => [
                            'name' => $jamaah->crmStage?->nama_tahap ?? 'Pendaftaran Baru',
                            'urutan' => $jamaah->crmStage?->urutan ?? 1,
                        ],
                        'paket' => $jamaah->paket ? [
                            'id' => $jamaah->paket->id,
                            'nama_paket' => $jamaah->paket->nama_paket,
                            'harga' => (float) $jamaah->paket->harga,
                            'durasi_hari' => $jamaah->paket->durasi_hari ?? 9,
                            'maskapai' => $jamaah->paket->maskapai,
                            'hotel_makkah' => $jamaah->paket->hotel_makkah,
                            'hotel_madinah' => $jamaah->paket->hotel_madinah,
                            'bintang_makkah' => $jamaah->paket->bintang_makkah ?? 5,
                            'bintang_madinah' => $jamaah->paket->bintang_madinah ?? 5,
                            'brosur_url' => $jamaah->paket->brosur_url,
                            'itinerary' => $jamaah->paket->itinerary,
                            'fasilitas' => $jamaah->paket->fasilitas,
                            'deskripsi' => $jamaah->paket->deskripsi,
                        ] : null,
                        'item_distributions' => $jamaah->itemDistributions->map(function ($item) {
                            return [
                                'id' => $item->id,
                                'nama_barang' => $item->inventaris?->nama_barang ?? 'Perlengkapan Umroh',
                                'status' => $item->status,
                                'tanggal_serah_terima' => $item->tanggal_serah_terima?->toISOString(),
                                'catatan' => $item->catatan,
                            ];
                        }),
                        'agen' => $jamaah->agen ? [
                            'name' => $jamaah->agen->name,
                            'phone' => $jamaah->agen->no_telepon,
                        ] : null,
                        'financial_summary' => [
                            'total_biaya' => $totalPaket,
                            'total_terbayar' => $totalVerified,
                            'total_pending' => $totalPending,
                            'sisa_tagihan' => $sisaTagihan,
                            'persentase_lunas' => $persentase,
                            'is_lunas' => $isLunas,
                            'status_label' => $isLunas ? 'LUNAS 100%' : ($totalVerified > 0 ? 'DP TERVERIFIKASI' : ($totalPending > 0 ? 'MENUNGGU VERIFIKASI' : 'BELUM ADA PEMBAYARAN')),
                        ],
                        'pembayaran_list' => $jamaah->pembayaran->sortBy('created_at')->values()->map(function ($p) {
                            return [
                                'id' => $p->id,
                                'nomor_invoice' => $p->nomor_invoice,
                                'nominal' => (float) $p->nominal,
                                'jumlah_bayar' => (float) $p->nominal,
                                'tipe_pembayaran' => $p->tipe_pembayaran,
                                'metode_pembayaran' => $p->metode_pembayaran,
                                'status_verifikasi' => $p->status_verifikasi,
                                'keterangan' => $p->keterangan,
                                'created_at' => $p->created_at?->toISOString(),
                                'verified_at' => $p->verified_at?->toISOString(),
                                'bank_tujuan' => $p->rekeningTenant ? [
                                    'nama_bank' => $p->rekeningTenant->nama_bank,
                                    'nomor_rekening' => $p->rekeningTenant->nomor_rekening,
                                    'atas_nama' => $p->rekeningTenant->atas_nama,
                                ] : null,
                            ];
                        }),
                        'documents_count' => $jamaah->documents->count(),
                    ];
                } elseif (empty($pin)) {
                    $requirePin = true;
                    $candidateHint = [
                        'kode' => $jamaah->kode_pendaftaran,
                        'pin_type' => $hasNik ? 'NIK' : 'HP',
                        'pin_label' => $pinLabel,
                        'masked_identifier' => $maskedHint,
                    ];
                } else {
                    $invalidPin = true;
                    $candidateHint = [
                        'kode' => $jamaah->kode_pendaftaran,
                        'pin_type' => $hasNik ? 'NIK' : 'HP',
                        'pin_label' => $pinLabel,
                        'masked_identifier' => $maskedHint,
                    ];
                }
            } else {
                $notFound = true;
            }
        }

        $bankAccounts = RekeningTenant::where('tenant_id', $tenantId)
            ->where('is_active', true)
            ->get(['id', 'nama_bank', 'nomor_rekening', 'atas_nama']);

        return Inertia::render('Public/TrackingStatus', [
            'tenant' => $tenant,
            'query' => $code,
            'code' => $code,
            'pin' => $pin,
            'token' => $token,
            'searchPerformed' => $searchPerformed,
            'notFound' => $notFound,
            'requirePin' => $requirePin,
            'invalidPin' => $invalidPin,
            'candidateHint' => $candidateHint,
            'jamaah' => $jamaahData,
            'bank_accounts' => $bankAccounts,
        ]);
    }

    /**
     * Submit installment payment proof from public tracking portal.
     */
    public function submitInstallment(Request $request): RedirectResponse
    {
        $tenant = $this->resolveTenant($request);
        $tenantId = $tenant?->id ?? 1;

        $validated = $request->validate([
            'jamaah_id' => ['required', 'exists:jamaah,id'],
            'nominal' => ['required', 'numeric', 'min:10000'],
            'rekening_tenant_id' => ['required', 'exists:rekening_tenant,id'],
            'tipe_pembayaran' => ['required', 'string', 'in:Cicilan,Pelunasan,DP,Tambahan'],
            'bukti_transfer' => ['required', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:5120'],
            'keterangan' => ['nullable', 'string', 'max:255'],
        ]);

        $jamaah = Jamaah::where('tenant_id', $tenantId)->where('id', $validated['jamaah_id'])->firstOrFail();

        $storedPath = null;
        if ($request->hasFile('bukti_transfer')) {
            $uploadedFile = $request->file('bukti_transfer');
            $storedPath = $uploadedFile->storeAs(
                "tenants/{$tenantId}/jamaah/{$jamaah->id}/payments",
                time().'_cicilan_'.$uploadedFile->getClientOriginalExtension(),
                'public'
            );

            JamaahDocument::create([
                'tenant_id' => $tenantId,
                'jamaah_id' => $jamaah->id,
                'type' => 'pembayaran',
                'title' => 'Bukti Setor '.$validated['tipe_pembayaran'].' - '.$jamaah->nama_lengkap,
                'file_path' => $storedPath,
                'file_name' => $uploadedFile->getClientOriginalName(),
                'mime_type' => $uploadedFile->getClientMimeType(),
                'file_size' => $uploadedFile->getSize(),
                'notes' => $validated['keterangan'] ?? 'Bukti setor cicilan diunggah via portal cek status.',
            ]);
        }

        $pembayaran = Pembayaran::create([
            'tenant_id' => $tenantId,
            'jamaah_id' => $jamaah->id,
            'rekening_tenant_id' => $validated['rekening_tenant_id'],
            'tipe_pembayaran' => $validated['tipe_pembayaran'],
            'nominal' => $validated['nominal'],
            'bukti_transfer' => $storedPath,
            'status_verifikasi' => 'Pending',
            'keterangan' => $validated['keterangan'] ?? null,
        ]);

        return redirect()->route('public.tracking', [
            'code' => $jamaah->kode_pendaftaran,
            'token' => $jamaah->getTrackingToken(),
        ])->with('success', 'Bukti setoran cicilan berhasil dikirim dengan Invoice #'.$pembayaran->nomor_invoice.'. Mohon tunggu verifikasi staf kami.');
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
