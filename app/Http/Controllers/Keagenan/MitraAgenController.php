<?php

namespace App\Http\Controllers\Keagenan;

use App\Http\Controllers\Controller;
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
        $tenantId = $user->getActiveTenantId();

        $query = User::where('tenant_id', $tenantId)
            ->where('role', 'agen')
            ->withCount('jamaah')
            ->withSum('komisi as total_komisi', 'nominal_komisi');

        if (! empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'ilike', "%{$search}%")
                    ->orWhere('email', 'ilike', "%{$search}%");
            });
        }

        $agents = $query->orderBy('name')
            ->paginate($perPage)
            ->withQueryString();

        // Metrics for summary
        $metrics = [
            'total_agents' => User::where('tenant_id', $tenantId)->where('role', 'agen')->count(),
            'active_producers' => User::where('tenant_id', $tenantId)->where('role', 'agen')->has('jamaah')->count(),
        ];

        return Inertia::render('Keagenan/Agents', [
            'agents' => $agents,
            'metrics' => $metrics,
            'filters' => [
                'search' => $search ?? '',
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
            'password' => 'required|string|min:8',
        ]);

        $tenantId = $user->getActiveTenantId();

        User::create([
            'tenant_id' => $tenantId,
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => 'agen',
            'jabatan' => 'Staff',
            'created_by' => $user->id,
        ]);

        return redirect()->back()->with('success', 'Mitra agen baru berhasil didaftarkan.');
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
            'password' => 'nullable|string|min:8',
        ]);

        $agent->name = $validated['name'];
        $agent->email = $validated['email'];

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
     * Get list of jamaah / customers registered under the given agent (for quick-view drawer).
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

        $jamaahList = $query->latest()->get()->map(function ($j) {
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
                'total_jamaah' => $jamaahList->count(),
                'total_omzet' => $jamaahList->sum('total_paid'),
            ],
            'jamaah' => $jamaahList,
        ]);
    }
}
