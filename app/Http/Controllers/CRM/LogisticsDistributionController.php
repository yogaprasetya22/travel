<?php

namespace App\Http\Controllers\CRM;

use App\Http\Controllers\Controller;
use App\Models\Inventaris;
use App\Models\ItemDistribution;
use App\Models\Jamaah;
use App\Models\Paket;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class LogisticsDistributionController extends Controller
{
    /**
     * Display logistics distribution and handover list with item checklists and filters.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $tenantId = $user->getActiveTenantId();

        $query = Jamaah::where('jamaah.tenant_id', $tenantId)
            ->where(function ($q) {
                $q->whereHas('inventarisTransaksi', function ($tq) {
                    $tq->where('tipe', 'OUT');
                })
                    ->orWhereHas('pembayaran')
                    ->orWhereHas('crmStage', function ($sq) {
                        $sq->where('nama_tahap', 'ilike', '%closing%')
                            ->orWhere('nama_tahap', 'ilike', '%won%')
                            ->orWhere('nama_tahap', 'ilike', '%selesai%');
                    });
            })
            ->with([
                'paket.inventaris',
                'agen',
                'itemDistributions.inventaris',
                'inventarisTransaksi.inventaris',
                'crmStage',
                'pembayaran',
            ]);

        // Role-based scoping
        if ($user->role === 'agen') {
            $query->where('agen_id', $user->id);
        } elseif ($user->level > 1) {
            $allowedAgentIds = array_unique(array_merge([$user->id], $user->getDownlineUserIds()));
            $query->whereIn('agen_id', $allowedAgentIds);
        }

        // Search Filter
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('nama_lengkap', 'ilike', "%{$search}%")
                    ->orWhere('no_hp', 'like', "%{$search}%")
                    ->orWhere('nik', 'like', "%{$search}%")
                    ->orWhereHas('agen', function ($aq) use ($search) {
                        $aq->where('name', 'ilike', "%{$search}%");
                    });
            });
        }

        // Status Logistik Filter
        if ($request->filled('status') && $request->input('status') !== 'ALL') {
            $status = $request->input('status');
            if ($status === 'Ready_to_Pickup') {
                $query->whereIn('status_logistik', ['Pending', 'Ready_to_Pickup']);
            } else {
                $query->where('status_logistik', $status);
            }
        }

        // 1. Paket Filter
        if ($request->filled('paket_id') && $request->input('paket_id') !== 'ALL') {
            $query->where('paket_id', $request->input('paket_id'));
        }

        // 2. Agen Pembimbing Filter
        if ($request->filled('agen_id') && $request->input('agen_id') !== 'ALL') {
            $query->where('agen_id', $request->input('agen_id'));
        }

        // 3. Tanggal Keberangkatan Filter (Rentang / Single)
        if ($request->filled('start_date') && $request->filled('end_date')) {
            $query->whereBetween('tanggal_keberangkatan', [$request->input('start_date'), $request->input('end_date')]);
        } elseif ($request->filled('start_date')) {
            $query->where('tanggal_keberangkatan', '>=', $request->input('start_date'));
        } elseif ($request->filled('end_date')) {
            $query->where('tanggal_keberangkatan', '<=', $request->input('end_date'));
        }

        // 4. Status Kelengkapan Barang (Fulfillment Status)
        if ($request->filled('fulfillment') && $request->input('fulfillment') !== 'ALL') {
            $fulfillment = $request->input('fulfillment');
            if ($fulfillment === 'full') {
                $query->where('status_logistik', 'Handed_Over');
            } elseif ($fulfillment === 'partial') {
                $query->where(function ($q) {
                    $q->where('status_logistik', 'Ready_to_Pickup')
                        ->orWhere(function ($subQ) {
                            $subQ->whereHas('itemDistributions', function ($idq) {
                                $idq->where('status', 'Delivered');
                            })->where('status_logistik', '!=', 'Handed_Over');
                        });
                });
            } elseif ($fulfillment === 'none') {
                $query->where('status_logistik', 'Pending')
                    ->whereDoesntHave('itemDistributions', function ($idq) {
                        $idq->where('status', 'Delivered');
                    });
            }
        }

        // 5. Status Pembayaran Filter
        if ($request->filled('payment_status') && $request->input('payment_status') !== 'ALL') {
            $paymentStatus = $request->input('payment_status');
            if ($paymentStatus === 'unpaid') {
                $query->whereDoesntHave('pembayaran', function ($pq) {
                    $pq->whereIn('status_verifikasi', ['Verified', 'verified']);
                });
            } elseif ($paymentStatus === 'dp') {
                $query->whereHas('pembayaran', function ($pq) {
                    $pq->whereIn('status_verifikasi', ['Verified', 'verified']);
                })->whereHas('paket', function ($pkq) {
                    $pkq->whereRaw('(SELECT COALESCE(SUM(nominal), 0) FROM pembayaran WHERE pembayaran.jamaah_id = jamaah.id AND LOWER(status_verifikasi) = \'verified\') < paket.harga');
                });
            } elseif ($paymentStatus === 'lunas') {
                $query->whereHas('paket', function ($pkq) {
                    $pkq->whereRaw('(SELECT COALESCE(SUM(nominal), 0) FROM pembayaran WHERE pembayaran.jamaah_id = jamaah.id AND LOWER(status_verifikasi) = \'verified\') >= paket.harga');
                });
            }
        }

        $perPage = (int) $request->input('per_page', 15);
        $logisticsList = $query->latest('jamaah.created_at')->paginate($perPage)->withQueryString();

        $allInventaris = Inventaris::where('tenant_id', $tenantId)
            ->orderBy('nama_barang')
            ->get(['id', 'nama_barang', 'sku', 'satuan', 'stok_tersedia']);

        $pakets = Paket::where('tenant_id', $tenantId)
            ->orderBy('nama_paket')
            ->get(['id', 'nama_paket', 'harga']);

        $agents = User::where('tenant_id', $tenantId)
            ->where(function ($q) {
                $q->where('role', 'agen')
                    ->orWhereNotNull('hierarchy_level_id');
            })
            ->orderBy('name')
            ->get(['id', 'name', 'email']);

        return Inertia::render('CRM/LogisticsDistribution', [
            'logisticsList' => $logisticsList,
            'inventarisList' => $allInventaris,
            'pakets' => $pakets,
            'agents' => $agents,
            'filters' => [
                'search' => $request->input('search', ''),
                'status' => $request->input('status', 'ALL'),
                'paket_id' => $request->input('paket_id', 'ALL'),
                'agen_id' => $request->input('agen_id', 'ALL'),
                'fulfillment' => $request->input('fulfillment', 'ALL'),
                'payment_status' => $request->input('payment_status', 'ALL'),
                'start_date' => $request->input('start_date', ''),
                'end_date' => $request->input('end_date', ''),
                'per_page' => $perPage,
            ],
        ]);
    }

    /**
     * Mark all logistics package as handed over (General Status).
     */
    public function handover(Request $request, Jamaah $jamaah): RedirectResponse
    {
        $user = $request->user();
        if (! $user->isSuperAdmin() && $jamaah->tenant_id !== $user->getActiveTenantId()) {
            abort(403, 'Aksi tidak diizinkan.');
        }

        $validated = $request->validate([
            'receiver_name' => ['nullable', 'string', 'max:255'],
            'notes' => ['nullable', 'string', 'max:500'],
        ]);

        DB::transaction(function () use ($jamaah, $user, $validated) {
            $jamaah->update([
                'status_logistik' => 'Handed_Over',
                'tanggal_serah_terima_logistik' => now(),
            ]);

            // If package has defined inventaris, ensure all item distributions are marked Delivered
            $packageItems = $jamaah->paket?->inventaris ?? [];
            foreach ($packageItems as $item) {
                ItemDistribution::updateOrCreate(
                    [
                        'tenant_id' => $jamaah->tenant_id,
                        'jamaah_id' => $jamaah->id,
                        'inventaris_id' => $item->id,
                    ],
                    [
                        'qty' => $item->pivot->qty ?? 1,
                        'status' => 'Delivered',
                        'delivered_at' => now(),
                        'receiver_name' => $validated['receiver_name'] ?? $jamaah->nama_lengkap,
                        'handed_over_by' => $user->id,
                        'notes' => $validated['notes'] ?? 'Serah terima paket lengkap.',
                    ]
                );
            }
        });

        return redirect()->back()->with('success', 'Perlengkapan berhasil diserahterimakan kepada jamaah.');
    }

    /**
     * Toggle or save individual item distribution checklist.
     */
    public function saveItemHandover(Request $request, Jamaah $jamaah): RedirectResponse
    {
        $user = $request->user();
        if (! $user->isSuperAdmin() && $jamaah->tenant_id !== $user->getActiveTenantId()) {
            abort(403, 'Aksi tidak diizinkan.');
        }

        $validated = $request->validate([
            'inventaris_id' => ['required', 'exists:inventaris,id'],
            'status' => ['required', 'in:Pending,Delivered'],
            'qty' => ['nullable', 'integer', 'min:1'],
            'receiver_name' => ['nullable', 'string', 'max:255'],
            'notes' => ['nullable', 'string', 'max:500'],
        ]);

        ItemDistribution::updateOrCreate(
            [
                'tenant_id' => $jamaah->tenant_id,
                'jamaah_id' => $jamaah->id,
                'inventaris_id' => $validated['inventaris_id'],
            ],
            [
                'qty' => $validated['qty'] ?? 1,
                'status' => $validated['status'],
                'delivered_at' => $validated['status'] === 'Delivered' ? now() : null,
                'receiver_name' => ! empty($validated['receiver_name']) ? $validated['receiver_name'] : $jamaah->nama_lengkap,
                'handed_over_by' => $user->id,
                'notes' => $validated['notes'] ?? null,
            ]
        );

        // Check if all items for this jamaah are delivered
        $totalItems = $jamaah->itemDistributions()->count();
        $pendingItems = $jamaah->itemDistributions()->where('status', 'Pending')->count();

        if ($totalItems > 0 && $pendingItems === 0) {
            $jamaah->update([
                'status_logistik' => 'Handed_Over',
                'tanggal_serah_terima_logistik' => now(),
            ]);
        } elseif ($totalItems > 0 && $pendingItems > 0) {
            $jamaah->update([
                'status_logistik' => 'Ready_to_Pickup',
            ]);
        }

        return redirect()->back()->with('success', 'Status serah terima item berhasil diperbarui.');
    }
}
