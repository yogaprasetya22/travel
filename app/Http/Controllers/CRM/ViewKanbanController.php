<?php

namespace App\Http\Controllers\CRM;

use App\Http\Controllers\Controller;
use App\Models\CrmStage;
use App\Models\Jamaah;
use App\Models\Paket;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ViewKanbanController extends Controller
{
    /**
     * Handle the incoming request with optimized server-side stage pagination and search.
     */
    public function __invoke(Request $request): Response
    {
        $user = auth()->user();
        $search = $request->input('search');
        $stagePages = $request->input('stage_pages', []); // ['stage_1' => 1, 'stage_2' => 2]
        $perPage = (int) $request->input('per_page', 5);

        // Retrieve active stages for tenant
        $stages = CrmStage::where('tenant_id', $user->tenant_id)
            ->orderBy('urutan')
            ->get();

        // RBAC scope for Jamaah
        $buildScopedQuery = function () use ($user, $search) {
            $query = Jamaah::where('jamaah.tenant_id', $user->tenant_id);

            if ($user->role === 'agen') {
                $query->where('jamaah.agen_id', $user->id);
            } elseif ($user->role === 'admin_travel') {
                $subordinateAgentIds = User::where('created_by', $user->id)
                    ->where('role', 'agen')
                    ->pluck('id')
                    ->toArray();
                $query->whereIn('jamaah.agen_id', $subordinateAgentIds);
            }

            if (! empty($search)) {
                $query->where(function ($q) use ($search) {
                    $q->where('jamaah.nama_lengkap', 'ilike', "%{$search}%")
                        ->orWhere('jamaah.no_hp', 'ilike', "%{$search}%")
                        ->orWhere('jamaah.email', 'ilike', "%{$search}%")
                        ->orWhereHas('paket', function ($pq) use ($search) {
                            $pq->where('paket.nama_paket', 'ilike', "%{$search}%");
                        })
                        ->orWhereHas('agen', function ($aq) use ($search) {
                            $aq->where('users.name', 'ilike', "%{$search}%");
                        });
                });
            }

            return $query;
        };

        // Populate stages with lightweight paginated leads & fast aggregate stats
        $stagesData = $stages->map(function ($stage) use ($buildScopedQuery, $stagePages, $perPage) {
            $stageKey = "stage_{$stage->id}";
            $currentPage = isset($stagePages[$stageKey]) ? (int) $stagePages[$stageKey] : 1;

            $stageQuery = $buildScopedQuery()->where('jamaah.crm_stage_id', $stage->id);

            // Fast DB aggregates without loading all models into memory
            $totalCount = (clone $stageQuery)->count();
            $totalNominal = (clone $stageQuery)
                ->join('paket', 'jamaah.paket_id', '=', 'paket.id')
                ->sum('paket.harga');

            // Paginated slice with only necessary relationships
            $paginatedLeads = (clone $stageQuery)
                ->with([
                    'paket:id,nama_paket,harga',
                    'agen:id,name,email',
                ])
                ->select([
                    'id',
                    'tenant_id',
                    'agen_id',
                    'crm_stage_id',
                    'nama_lengkap',
                    'nik',
                    'no_hp',
                    'email',
                    'paket_id',
                    'catatan_admin',
                    'created_at',
                ])
                ->orderBy('id', 'desc')
                ->skip(($currentPage - 1) * $perPage)
                ->take($perPage)
                ->get();

            $totalPages = max(1, (int) ceil($totalCount / $perPage));

            return [
                'id' => $stage->id,
                'tenant_id' => $stage->tenant_id,
                'nama_tahap' => $stage->nama_tahap,
                'urutan' => $stage->urutan,
                'periode_mulai' => $stage->periode_mulai,
                'periode_selesai' => $stage->periode_selesai,
                'is_active' => $stage->is_active,
                'total_leads' => $totalCount,
                'total_nominal' => (float) $totalNominal,
                'current_page' => $currentPage,
                'total_pages' => $totalPages,
                'per_page' => $perPage,
                'jamaah' => $paginatedLeads,
            ];
        });

        $packages = Paket::where('tenant_id', $user->tenant_id)
            ->select('id', 'nama_paket', 'harga')
            ->orderBy('nama_paket')
            ->get();

        // Agents dropdown scope
        if ($user->role === 'admin_travel') {
            $agents = User::where('tenant_id', $user->tenant_id)
                ->where('role', 'agen')
                ->where('created_by', $user->id)
                ->select('id', 'name', 'email')
                ->orderBy('name')
                ->get();
        } else {
            $agents = User::where('tenant_id', $user->tenant_id)
                ->where('role', 'agen')
                ->select('id', 'name', 'email')
                ->orderBy('name')
                ->get();
        }

        return Inertia::render('CRM/KanbanBoard', [
            'stages' => $stagesData,
            'packages' => $packages,
            'agents' => $agents,
            'filters' => [
                'search' => $search ?? '',
                'per_page' => $perPage,
                'stage_pages' => $stagePages,
            ],
        ]);
    }
}
