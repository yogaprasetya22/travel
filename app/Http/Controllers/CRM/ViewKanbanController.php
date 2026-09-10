<?php

namespace App\Http\Controllers\CRM;

use App\Http\Controllers\Controller;
use App\Models\CrmStage;
use App\Models\DocumentPermission;
use App\Models\Jamaah;
use App\Models\Paket;
use App\Models\RekeningTenant;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ViewKanbanController extends Controller
{
    /**
     * Handle the incoming request with initial stage data for Kanban Board.
     */
    public function __invoke(Request $request): Response
    {
        $user = auth()->user();
        $tenantId = $user->getActiveTenantId();
        $search = $request->input('search');
        $perPage = (int) $request->input('per_page', 10);

        // Retrieve active stages for tenant
        $stages = CrmStage::where('tenant_id', $tenantId)
            ->orderBy('urutan')
            ->get();

        // RBAC scope for Jamaah
        $buildScopedQuery = function () use ($user, $tenantId, $search) {
            $query = Jamaah::where('jamaah.tenant_id', $tenantId);

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

        // Populate stages with lightweight initial leads & fast aggregate stats
        $stagesData = $stages->map(function ($stage) use ($buildScopedQuery, $perPage) {
            $stageQuery = $buildScopedQuery()->where('jamaah.crm_stage_id', $stage->id);

            // Fast DB aggregates without loading all models into memory
            $totalCount = (clone $stageQuery)->count();
            $totalNominal = (clone $stageQuery)
                ->join('paket', 'jamaah.paket_id', '=', 'paket.id')
                ->sum('paket.harga');

            // Paginated initial slice (ordered by updated_at desc so newly moved/updated leads appear at the top)
            $paginatedLeads = (clone $stageQuery)
                ->with([
                    'paket:id,nama_paket,harga,kuota',
                    'agen:id,name,email',
                    'documents.uploader:id,name',
                    'pembayaran',
                    'komisiAgen',
                    'stageLogs.fromStage',
                    'stageLogs.toStage',
                    'stageLogs.user:id,name',
                ])
                ->orderBy('jamaah.updated_at', 'desc')
                ->orderBy('jamaah.id', 'desc')
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
                'current_page' => 1,
                'total_pages' => $totalPages,
                'has_more' => $totalCount > $perPage,
                'per_page' => $perPage,
                'jamaah' => $paginatedLeads,
            ];
        });

        $packages = Paket::where('tenant_id', $tenantId)
            ->select('id', 'nama_paket', 'harga')
            ->orderBy('nama_paket')
            ->get();

        $banks = RekeningTenant::where('tenant_id', $tenantId)
            ->where('is_active', true)
            ->get(['id', 'nama_bank', 'nomor_rekening', 'atas_nama']);

        // Agents dropdown scope
        if ($user->role === 'admin_travel') {
            $agents = User::where('tenant_id', $tenantId)
                ->where('role', 'agen')
                ->where('created_by', $user->id)
                ->select('id', 'name', 'email')
                ->orderBy('name')
                ->get();
        } else {
            $agents = User::where('tenant_id', $tenantId)
                ->where('role', 'agen')
                ->select('id', 'name', 'email')
                ->orderBy('name')
                ->get();
        }

        $documentPermissions = DocumentPermission::where('tenant_id', $tenantId)
            ->where('role_name', $user->role ?? 'staff')
            ->get();

        return Inertia::render('CRM/KanbanBoard', [
            'stages' => $stagesData,
            'packages' => $packages,
            'agents' => $agents,
            'banks' => $banks,
            'documentPermissions' => $documentPermissions,
            'filters' => [
                'search' => $search ?? '',
                'per_page' => $perPage,
            ],
        ]);
    }

    /**
     * Fetch next page of leads for a specific CRM stage (used by column infinite scroll).
     */
    public function getStageLeads(Request $request, CrmStage $stage): JsonResponse
    {
        $user = auth()->user();
        $tenantId = $user->getActiveTenantId();

        if ($stage->tenant_id !== $tenantId) {
            abort(403, 'Stage tidak ditemukan pada tenant ini.');
        }

        $search = $request->input('search');
        $perPage = (int) $request->input('per_page', 10);
        $page = (int) $request->input('page', 1);

        $query = Jamaah::where('jamaah.tenant_id', $tenantId)
            ->where('jamaah.crm_stage_id', $stage->id);

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

        $paginator = $query->with([
            'paket:id,nama_paket,harga,kuota',
            'agen:id,name,email',
            'documents.uploader:id,name',
            'pembayaran',
            'komisiAgen',
            'stageLogs.fromStage',
            'stageLogs.toStage',
            'stageLogs.user:id,name',
        ])
            ->orderBy('jamaah.updated_at', 'desc')
            ->orderBy('jamaah.id', 'desc')
            ->paginate($perPage, ['*'], 'page', $page);

        return response()->json([
            'stage_id' => $stage->id,
            'jamaah' => $paginator->items(),
            'current_page' => $paginator->currentPage(),
            'last_page' => $paginator->lastPage(),
            'has_more' => $paginator->hasMorePages(),
            'total' => $paginator->total(),
        ]);
    }
}
