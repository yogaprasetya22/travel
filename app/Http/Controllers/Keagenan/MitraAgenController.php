<?php

namespace App\Http\Controllers\Keagenan;

use App\Http\Controllers\Controller;
use App\Models\HierarchyLevel;
use App\Models\Pembayaran;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class MitraAgenController extends Controller
{
    /**
     * Display the list of agents for the active tenant.
     */
    public function index(Request $request): Response
    {
        $user = auth()->user();
        if (! in_array($user->role, ['owner_travel', 'admin_travel', 'super_admin_master'])) {
            abort(403, 'Unauthorized action.');
        }

        $perPage = (int) $request->input('per_page', 15);
        $search = $request->input('search');
        $levelId = $request->input('level_id');
        $status = $request->input('status');
        $leaderId = $request->input('leader_id');
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');
        $tenantId = $user->getActiveTenantId();

        $query = User::where('tenant_id', $tenantId)
            ->where('role', 'agen')
            ->with(['creator', 'hierarchyLevel', 'tenant'])
            ->withCount('jamaah')
            ->withSum('komisi as total_komisi', 'nominal_komisi');

        if (! empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'ilike', "%{$search}%")
                    ->orWhere('email', 'ilike', "%{$search}%")
                    ->orWhere('no_hp', 'ilike', "%{$search}%")
                    ->orWhere('kota', 'ilike', "%{$search}%")
                    ->orWhere('referral_code', 'ilike', "%{$search}%");
            });
        }

        if (! empty($levelId) && $levelId !== 'ALL') {
            $query->where('hierarchy_level_id', $levelId);
        }

        if (! empty($leaderId) && $leaderId !== 'ALL') {
            $query->where('created_by', $leaderId);
        }

        if (! empty($status) && $status !== 'ALL') {
            if ($status === 'PRODUCING') {
                $query->has('jamaah');
            } elseif ($status === 'NON_PRODUCING') {
                $query->doesntHave('jamaah');
            } elseif ($status === 'ACTIVE') {
                $query->where('status_karyawan', 'aktif');
            }
        }

        if (! empty($startDate)) {
            $query->whereDate('created_at', '>=', $startDate);
        }
        if (! empty($endDate)) {
            $query->whereDate('created_at', '<=', $endDate);
        }

        $agents = $query->orderBy('name')
            ->paginate($perPage)
            ->withQueryString();

        // Hierarchy levels available for this tenant
        $hierarchyLevels = HierarchyLevel::where('tenant_id', $tenantId)
            ->orderBy('urutan')
            ->get();

        // Potential leaders/supervisors in this tenant
        $leaders = User::where('tenant_id', $tenantId)
            ->whereIn('role', ['owner_travel', 'admin_travel', 'agen'])
            ->select('id', 'name', 'role', 'jabatan', 'hierarchy_level_id')
            ->orderBy('name')
            ->get();

        // Metrics for summary
        $metrics = [
            'total_agents' => User::where('tenant_id', $tenantId)->where('role', 'agen')->count(),
            'active_producers' => User::where('tenant_id', $tenantId)->where('role', 'agen')->has('jamaah')->count(),
        ];

        return Inertia::render('Keagenan/Agents', [
            'agents' => $agents,
            'hierarchyLevels' => $hierarchyLevels,
            'leaders' => $leaders,
            'metrics' => $metrics,
            'filters' => [
                'search' => $search ?? '',
                'level_id' => $levelId ?? 'ALL',
                'status' => $status ?? 'ALL',
                'leader_id' => $leaderId ?? 'ALL',
                'start_date' => $startDate ?? '',
                'end_date' => $endDate ?? '',
                'per_page' => $perPage,
            ],
        ]);
    }

    /**
     * Store a new agent under the active tenant.
     */
    public function store(Request $request): RedirectResponse
    {
        $user = auth()->user();
        if (! in_array($user->role, ['owner_travel', 'admin_travel', 'super_admin_master'])) {
            abort(403, 'Unauthorized action.');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email',
            'password' => 'required|string|min:6',
            'nik' => 'nullable|string|max:30',
            'no_hp' => 'nullable|string|max:30',
            'kota' => 'nullable|string|max:100',
            'alamat' => 'nullable|string',
            'status_karyawan' => 'nullable|string|max:30',
            'nama_bank' => 'nullable|string|max:50',
            'nomor_rekening' => 'nullable|string|max:50',
            'atas_nama_rekening' => 'nullable|string|max:150',
            'jabatan' => 'nullable|string|max:100',
            'hierarchy_level_id' => 'nullable|exists:hierarchy_levels,id',
            'created_by' => 'nullable|exists:users,id',
        ]);

        $tenantId = $user->getActiveTenantId();

        User::create([
            'tenant_id' => $tenantId,
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => 'agen',
            'nik' => $validated['nik'] ?? null,
            'no_hp' => $validated['no_hp'] ?? null,
            'kota' => $validated['kota'] ?? null,
            'alamat' => $validated['alamat'] ?? null,
            'status_karyawan' => $validated['status_karyawan'] ?? 'aktif',
            'nama_bank' => $validated['nama_bank'] ?? null,
            'nomor_rekening' => $validated['nomor_rekening'] ?? null,
            'atas_nama_rekening' => $validated['atas_nama_rekening'] ?? null,
            'jabatan' => $validated['jabatan'] ?? 'Konsultan Bimbingan Umroh',
            'hierarchy_level_id' => $validated['hierarchy_level_id'] ?? null,
            'created_by' => $validated['created_by'] ?? $user->id,
        ]);

        return redirect()->back()->with('success', 'Data mitra agen baru berhasil didaftarkan.');
    }

    /**
     * Update agent profile under the active tenant.
     */
    public function update(Request $request, User $agent): RedirectResponse
    {
        $user = auth()->user();
        if (! in_array($user->role, ['owner_travel', 'admin_travel', 'super_admin_master'])) {
            abort(403, 'Unauthorized action.');
        }

        $tenantId = $user->getActiveTenantId();
        if ($agent->tenant_id !== $tenantId || $agent->role !== 'agen') {
            abort(403, 'Mitra agen tidak ditemukan pada tenant ini.');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($agent->id),
            ],
            'password' => 'nullable|string|min:6',
            'nik' => 'nullable|string|max:30',
            'no_hp' => 'nullable|string|max:30',
            'kota' => 'nullable|string|max:100',
            'alamat' => 'nullable|string',
            'status_karyawan' => 'nullable|string|max:30',
            'nama_bank' => 'nullable|string|max:50',
            'nomor_rekening' => 'nullable|string|max:50',
            'atas_nama_rekening' => 'nullable|string|max:150',
            'jabatan' => 'nullable|string|max:100',
            'hierarchy_level_id' => 'nullable|exists:hierarchy_levels,id',
            'created_by' => 'nullable|exists:users,id',
        ]);

        $agent->name = $validated['name'];
        $agent->email = $validated['email'];
        $agent->nik = $validated['nik'] ?? $agent->nik;
        $agent->no_hp = $validated['no_hp'] ?? $agent->no_hp;
        $agent->kota = $validated['kota'] ?? $agent->kota;
        $agent->alamat = $validated['alamat'] ?? $agent->alamat;
        $agent->status_karyawan = $validated['status_karyawan'] ?? $agent->status_karyawan;
        $agent->nama_bank = $validated['nama_bank'] ?? $agent->nama_bank;
        $agent->nomor_rekening = $validated['nomor_rekening'] ?? $agent->nomor_rekening;
        $agent->atas_nama_rekening = $validated['atas_nama_rekening'] ?? $agent->atas_nama_rekening;
        $agent->jabatan = $validated['jabatan'] ?? $agent->jabatan;
        $agent->hierarchy_level_id = $validated['hierarchy_level_id'] ?? $agent->hierarchy_level_id;
        $agent->created_by = $validated['created_by'] ?? $agent->created_by;

        if (! empty($validated['password'])) {
            $agent->password = Hash::make($validated['password']);
        }

        $agent->save();

        return redirect()->back()->with('success', 'Data mitra agen berhasil diperbarui.');
    }

    /**
     * Delete an agent if they have no registered jamaah.
     */
    public function destroy(User $agent): RedirectResponse
    {
        $user = auth()->user();
        if (! in_array($user->role, ['owner_travel', 'super_admin_master'])) {
            abort(403, 'Unauthorized action.');
        }

        $tenantId = $user->getActiveTenantId();
        if ($agent->tenant_id !== $tenantId || $agent->role !== 'agen') {
            abort(403, 'Mitra agen tidak ditemukan pada tenant ini.');
        }

        if ($agent->jamaah()->count() > 0) {
            return redirect()->back()->with('error', 'Mitra agen tidak dapat dihapus karena sudah memiliki data jamaah terdaftar.');
        }

        $agent->delete();

        return redirect()->back()->with('success', 'Mitra agen berhasil dihapus dari sistem.');
    }

    /**
     * Get list of jamaah / customers registered under the given agent with pagination for infinite scroll.
     */
    public function getJamaah(Request $request, User $agent): JsonResponse
    {
        $user = auth()->user();
        if (! in_array($user->role, ['owner_travel', 'admin_travel', 'super_admin_master'])) {
            abort(403, 'Unauthorized action.');
        }

        $tenantId = $user->getActiveTenantId();
        if ($agent->tenant_id !== $tenantId || $agent->role !== 'agen') {
            abort(403, 'Mitra agen tidak ditemukan.');
        }

        $search = $request->input('search');
        $perPage = (int) $request->input('per_page', 15);

        // Overall stats for this agent
        $totalAgentJamaah = $agent->jamaah()->count();
        $totalAgentOmzet = (float) Pembayaran::where('tenant_id', $tenantId)
            ->where('status_verifikasi', 'Verified')
            ->whereHas('jamaah', function ($q) use ($agent) {
                $q->where('agen_id', $agent->id);
            })
            ->sum('nominal');

        $query = $agent->jamaah()
            ->with(['paket', 'crmStage', 'pembayaran' => function ($q) {
                $q->where('status_verifikasi', 'Verified');
            }]);

        if (! empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('nama_lengkap', 'ilike', "%{$search}%")
                    ->orWhere('no_hp', 'ilike', "%{$search}%")
                    ->orWhere('nik', 'ilike', "%{$search}%");
            });
        }

        $paginator = $query->latest()->paginate($perPage);

        $jamaahList = collect($paginator->items())->map(function ($j) {
            $totalPaid = (float) $j->pembayaran->sum('nominal');
            $hargaPaket = (float) ($j->paket?->harga ?? 0);
            $sisaTagihan = max(0, $hargaPaket - $totalPaid);

            return [
                'id' => $j->id,
                'nama_lengkap' => $j->nama_lengkap,
                'no_hp' => $j->no_hp,
                'email' => $j->email,
                'nik' => $j->nik,
                'nama_paket' => $j->paket?->nama_paket ?? '-',
                'harga_paket' => $hargaPaket,
                'total_paid' => $totalPaid,
                'sisa_tagihan' => $sisaTagihan,
                'status_bayar' => $totalPaid >= $hargaPaket && $hargaPaket > 0 ? 'Lunas' : ($totalPaid > 0 ? 'DP Terbayar' : 'Belum Bayar'),
                'stage' => $j->crmStage?->nama_tahap ?? 'New Leads',
                'tanggal_keberangkatan' => $j->tanggal_keberangkatan,
                'created_at' => $j->created_at?->format('d M Y'),
            ];
        });

        return response()->json([
            'agent' => [
                'id' => $agent->id,
                'name' => $agent->name,
                'email' => $agent->email,
                'total_jamaah' => $totalAgentJamaah,
                'total_omzet' => $totalAgentOmzet,
            ],
            'agent_stats' => [
                'total_jamaah' => $totalAgentJamaah,
                'total_omzet' => $totalAgentOmzet,
            ],
            'jamaah' => [
                'data' => $jamaahList,
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'next_page_url' => $paginator->nextPageUrl(),
                'has_more' => $paginator->hasMorePages(),
                'total' => $paginator->total(),
            ],
            'has_more' => $paginator->hasMorePages(),
            'total' => $paginator->total(),
        ]);
    }
}
