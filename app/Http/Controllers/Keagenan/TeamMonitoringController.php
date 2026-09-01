<?php

namespace App\Http\Controllers\Keagenan;

use App\Http\Controllers\Controller;
use App\Models\HierarchyLevel;
use App\Models\Jamaah;
use App\Models\KomisiAgen;
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

        $search = $request->input('search', '');
        $levelFilter = $request->input('level', 'all');
        $perPage = (int) $request->input('per_page', 10);

        // 1. Calculate overall summary metrics across ALL downlines (unpaginated)
        $allDownlines = User::whereIn('id', $downlineIds)
            ->where('tenant_id', $targetTenantId)
            ->with(['hierarchyLevel', 'creator'])
            ->withCount('jamaah')
            ->get();

        $allJamaahIds = Jamaah::whereIn('agen_id', $downlineIds)->pluck('id');

        $totalTeamOmzet = (float) Pembayaran::whereIn('jamaah_id', $allJamaahIds)
            ->where('status_verifikasi', 'verified')
            ->sum('nominal');

        $totalTeamKomisi = (float) KomisiAgen::whereIn('agen_id', $downlineIds)->sum('nominal_komisi');
        $totalKomisiPaid = (float) KomisiAgen::whereIn('agen_id', $downlineIds)->where('status_pencairan', 'paid')->sum('nominal_komisi');
        $totalKomisiPending = (float) KomisiAgen::whereIn('agen_id', $downlineIds)->where('status_pencairan', 'pending')->sum('nominal_komisi');

        // Compute performance stats for all downlines (for Top Performers & Charts)
        $allDownlinesStats = $allDownlines->map(function ($member) {
            $memberJamaahIds = Jamaah::where('agen_id', $member->id)->pluck('id');
            $omzet = (float) Pembayaran::whereIn('jamaah_id', $memberJamaahIds)
                ->where('status_verifikasi', 'verified')
                ->sum('nominal');
            $komisi = (float) KomisiAgen::where('agen_id', $member->id)->sum('nominal_komisi');

            return [
                'id' => $member->id,
                'name' => $member->name,
                'email' => $member->email,
                'level' => $member->level,
                'level_label' => $member->level_label,
                'jabatan' => $member->jabatan ?: $member->hierarchyLevel?->nama_level ?: 'Staff',
                'total_jamaah' => $member->jamaah_count,
                'total_omzet' => $omzet,
                'total_komisi' => $komisi,
            ];
        });

        // Top 5 Performers by Omzet & Jamaah
        $topPerformers = $allDownlinesStats
            ->sortByDesc('total_omzet')
            ->take(5)
            ->values();

        // Level Distribution Chart Data (Omzet & Members Count per Level)
        $palette = [
            1 => '#10b981', // Emerald (Owner)
            2 => '#0ea5e9', // Sky (Supervisor)
            3 => '#f59e0b', // Amber (Team Leader)
            4 => '#8b5cf6', // Purple (Staff / Agen)
            5 => '#ec4899', // Pink
        ];

        $levelDistribution = $allDownlinesStats
            ->groupBy('level')
            ->map(function ($membersInLevel, $lvl) use ($palette) {
                $first = $membersInLevel->first();

                return [
                    'level' => (int) $lvl,
                    'level_name' => "Level {$lvl} ({$first['jabatan']})",
                    'omzet' => $membersInLevel->sum('total_omzet'),
                    'jamaah' => $membersInLevel->sum('total_jamaah'),
                    'members_count' => $membersInLevel->count(),
                    'color' => $palette[$lvl] ?? '#64748b',
                ];
            })
            ->values();

        // 2. Query Paginated Downline Users for Table
        $teamMembersQuery = User::whereIn('id', $downlineIds)
            ->where('tenant_id', $targetTenantId)
            ->with(['hierarchyLevel', 'creator'])
            ->withCount('jamaah');

        if ($search) {
            $teamMembersQuery->where(function ($q) use ($search) {
                $q->where('name', 'ilike', "%{$search}%")
                    ->orWhere('email', 'ilike', "%{$search}%")
                    ->orWhere('jabatan', 'ilike', "%{$search}%")
                    ->orWhereHas('creator', fn ($c) => $c->where('name', 'ilike', "%{$search}%"));
            });
        }

        if ($levelFilter && $levelFilter !== 'all') {
            $teamMembersQuery->where(function ($q) use ($levelFilter) {
                $q->whereHas('hierarchyLevel', fn ($h) => $h->where('urutan', (int) $levelFilter));
            });
        }

        $paginatedMembers = $teamMembersQuery->orderBy('id')->paginate($perPage)->withQueryString();

        // Transform paginated items with computed stats
        $paginatedMembers->getCollection()->transform(function ($member) {
            $jamaahIds = Jamaah::where('agen_id', $member->id)->pluck('id');

            $verifiedRevenue = (float) Pembayaran::whereIn('jamaah_id', $jamaahIds)
                ->where('status_verifikasi', 'verified')
                ->sum('nominal');

            $totalKomisi = (float) KomisiAgen::where('agen_id', $member->id)->sum('nominal_komisi');
            $totalKomisiPaid = (float) KomisiAgen::where('agen_id', $member->id)->where('status_pencairan', 'paid')->sum('nominal_komisi');
            $totalKomisiPending = (float) KomisiAgen::where('agen_id', $member->id)->where('status_pencairan', 'pending')->sum('nominal_komisi');

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
                'total_komisi' => $totalKomisi,
                'komisi_paid' => $totalKomisiPaid,
                'komisi_pending' => $totalKomisiPending,
            ];
        });

        // 3. Dynamic hierarchy levels in this tenant for filtering
        $hierarchyLevels = HierarchyLevel::where('tenant_id', $targetTenantId)
            ->where('urutan', '>', $currentUser->level)
            ->orderBy('urutan')
            ->get();

        return Inertia::render('Keagenan/Monitoring', [
            'teamMembers' => $paginatedMembers,
            'summary' => [
                'total_members' => $allDownlines->count(),
                'total_jamaah' => $allDownlines->sum('jamaah_count'),
                'total_omzet' => $totalTeamOmzet,
                'total_komisi' => $totalTeamKomisi,
                'total_paid' => $totalKomisiPaid,
                'total_pending' => $totalKomisiPending,
            ],
            'topPerformers' => $topPerformers,
            'levelDistribution' => $levelDistribution,
            'hierarchyLevels' => $hierarchyLevels,
            'filters' => [
                'search' => $search,
                'level' => $levelFilter,
                'per_page' => $perPage,
            ],
            'currentUser' => [
                'id' => $currentUser->id,
                'name' => $currentUser->name,
                'level' => $currentUser->level,
                'level_label' => $currentUser->level_label,
            ],
        ]);
    }

    /**
     * Get paginated jamaah/nasabah list for a specific team member drawer (Infinite Scroll).
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
                $q->where('nama_lengkap', 'ilike', "%{$search}%")
                    ->orWhere('nomor_hp', 'ilike', "%{$search}%")
                    ->orWhere('nomor_paspor', 'ilike', "%{$search}%");
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
