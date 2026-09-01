<?php

namespace App\Http\Controllers\Keagenan;

use App\Http\Controllers\Controller;
use App\Models\HierarchyLevel;
use App\Models\Jamaah;
use App\Models\KomisiAgen;
use App\Models\OverrideKomisiAgen;
use App\Models\Pembayaran;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TeamMonitoringController extends Controller
{
    /**
     * Display the hierarchical team performance & commission monitoring screen.
     */
    public function index(Request $request): Response
    {
        $currentUser = $request->user();
        $targetTenantId = $currentUser->getActiveTenantId();

        $downlineIds = $currentUser->getDownlineUserIds();

        // 1. Query Downline Users with performance statistics
        $teamMembers = User::whereIn('id', $downlineIds)
            ->where('tenant_id', $targetTenantId)
            ->with(['hierarchyLevel', 'creator'])
            ->withCount('jamaah')
            ->get()
            ->map(function ($member) {
                // Calculate verified revenue from member's jamaah
                $jamaahIds = Jamaah::where('agen_id', $member->id)->pluck('id');

                $verifiedRevenue = (float) Pembayaran::whereIn('jamaah_id', $jamaahIds)
                    ->where('status', 'verified')
                    ->sum('nominal');

                // Total commission & overrides
                $totalKomisiDirect = (float) KomisiAgen::where('agen_id', $member->id)->sum('nominal_komisi');
                $totalOverride = (float) OverrideKomisiAgen::where('agen_id', $member->id)->sum('nominal_override');
                $totalKomisiPaid = (float) KomisiAgen::where('agen_id', $member->id)->where('status', 'paid')->sum('nominal_komisi');
                $totalKomisiPending = (float) KomisiAgen::where('agen_id', $member->id)->where('status', 'pending')->sum('nominal_komisi');

                return [
                    'id' => $member->id,
                    'name' => $member->name,
                    'email' => $member->email,
                    'level' => $member->level,
                    'level_label' => $member->level_label,
                    'level_badge' => $member->level_badge,
                    'jabatan' => $member->jabatan ?: $member->hierarchyLevel?->nama_level ?: 'Staff',
                    'hierarchy_level_id' => $member->hierarchy_level_id,
                    'creator' => $member->creator ? [
                        'id' => $member->creator->id,
                        'name' => $member->creator->name,
                        'jabatan' => $member->creator->jabatan ?: $member->creator->hierarchyLevel?->nama_level,
                    ] : null,
                    'total_jamaah' => $member->jamaah_count,
                    'total_omzet' => $verifiedRevenue,
                    'total_komisi' => $totalKomisiDirect + $totalOverride,
                    'komisi_paid' => $totalKomisiPaid,
                    'komisi_pending' => $totalKomisiPending,
                    'override_komisi' => $totalOverride,
                ];
            })
            ->sortBy('level')
            ->values();

        // 2. Summary Statistics
        $totalTeamMembers = $teamMembers->count();
        $totalTeamJamaah = $teamMembers->sum('total_jamaah');
        $totalTeamOmzet = $teamMembers->sum('total_omzet');
        $totalTeamKomisi = $teamMembers->sum('total_komisi');
        $totalKomisiPaid = $teamMembers->sum('komisi_paid');
        $totalKomisiPending = $teamMembers->sum('komisi_pending');

        // 3. Dynamic hierarchy levels in this tenant for filtering
        $hierarchyLevels = HierarchyLevel::where('tenant_id', $targetTenantId)
            ->where('urutan', '>', $currentUser->level)
            ->orderBy('urutan')
            ->get();

        return Inertia::render('Keagenan/Monitoring', [
            'teamMembers' => $teamMembers,
            'summary' => [
                'total_members' => $totalTeamMembers,
                'total_jamaah' => $totalTeamJamaah,
                'total_omzet' => $totalTeamOmzet,
                'total_komisi' => $totalTeamKomisi,
                'total_paid' => $totalKomisiPaid,
                'total_pending' => $totalKomisiPending,
            ],
            'hierarchyLevels' => $hierarchyLevels,
            'currentUser' => [
                'id' => $currentUser->id,
                'name' => $currentUser->name,
                'level' => $currentUser->level,
                'level_label' => $currentUser->level_label,
            ],
        ]);
    }

    /**
     * Get paginated jamaah/nasabah list for a specific team member drawer.
     */
    public function getMemberJamaah(Request $request, User $member): JsonResponse
    {
        $currentUser = $request->user();
        $downlineIds = $currentUser->getDownlineUserIds();

        // Authorize: Current user can only view their valid downline members
        if (! in_array($member->id, $downlineIds) && $member->id !== $currentUser->id) {
            abort(403, 'Unauthorized access to team member.');
        }

        $page = (int) $request->input('page', 1);
        $perPage = (int) $request->input('per_page', 10);
        $search = $request->input('search', '');

        $query = Jamaah::where('agen_id', $member->id)
            ->with(['paket', 'crmStage', 'pembayaran']);

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('nama_lengkap', 'like', "%{$search}%")
                    ->orWhere('nomor_hp', 'like', "%{$search}%")
                    ->orWhere('nomor_paspor', 'like', "%{$search}%");
            });
        }

        $paginated = $query->latest()->paginate($perPage, ['*'], 'page', $page);

        return response()->json([
            'data' => $paginated->items(),
            'current_page' => $paginated->currentPage(),
            'last_page' => $paginated->lastPage(),
            'total' => $paginated->total(),
            'has_more' => $paginated->hasMorePages(),
        ]);
    }
}
