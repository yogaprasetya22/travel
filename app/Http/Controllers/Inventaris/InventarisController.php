<?php

namespace App\Http\Controllers\Inventaris;

use App\Http\Controllers\Controller;
use App\Models\Inventaris;
use App\Models\InventarisTransaksi;
use App\Models\Jamaah;
use App\Models\Menu;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class InventarisController extends Controller
{
    /**
     * Display the inventory listing and transaction logs with ERP metrics and filters.
     */
    public function index(Request $request): Response
    {
        $user = auth()->user();
        $allowedRoles = Menu::where('url', '/inventaris')->value('roles') ?? ['super_admin_master', 'owner_travel', 'admin_travel'];
        if (! $user->isSuperAdmin() && ! $user->isOwner() && ! in_array($user->role, $allowedRoles)) {
            abort(403, 'Unauthorized action.');
        }

        $itemsPerPage = (int) $request->input('items_per_page', 15);
        $logsPerPage = (int) $request->input('logs_per_page', 15);
        $search = $request->input('search');
        $statusFilter = $request->input('status', 'ALL');
        $kategoriFilter = $request->input('kategori', 'ALL');
        $lokasiFilter = $request->input('lokasi', 'ALL');
        $logTypeFilter = $request->input('log_type', 'ALL');
        $logStartDate = $request->input('log_start_date');
        $logEndDate = $request->input('log_end_date');
        $activeTab = $request->input('tab', 'items');
        $tenantId = $user->getActiveTenantId();

        // Base query for items
        $itemsQuery = Inventaris::where('tenant_id', $tenantId);

        // Search filter
        if ($request->filled('search')) {
            $itemsQuery->where(function ($q) use ($search) {
                $q->where('nama_barang', 'ilike', "%{$search}%")
                    ->orWhere('sku', 'ilike', "%{$search}%")
                    ->orWhere('kategori', 'ilike', "%{$search}%")
                    ->orWhere('lokasi_rak', 'ilike', "%{$search}%");
            });
        }

        // Status filter: ALL, SAFE, LOW, OUT
        if ($statusFilter === 'LOW') {
            $itemsQuery->whereRaw('stok_tersedia <= stok_minimum AND stok_tersedia > 0');
        } elseif ($statusFilter === 'OUT') {
            $itemsQuery->where('stok_tersedia', '<=', 0);
        } elseif ($statusFilter === 'SAFE') {
            $itemsQuery->whereRaw('stok_tersedia > stok_minimum');
        }

        // Kategori filter
        if ($kategoriFilter && $kategoriFilter !== 'ALL') {
            $itemsQuery->where('kategori', $kategoriFilter);
        }

        // Lokasi rak filter
        if ($lokasiFilter && $lokasiFilter !== 'ALL') {
            $itemsQuery->where('lokasi_rak', $lokasiFilter);
        }

        $items = $itemsQuery->orderBy('nama_barang')
            ->paginate($itemsPerPage, ['*'], 'items_page')
            ->withQueryString();

        // Transaction Logs query
        $logsQuery = InventarisTransaksi::where('tenant_id', $tenantId)
            ->with(['inventaris', 'jamaah', 'creator']);

        if ($request->filled('log_search')) {
            $logSearch = $request->input('log_search');
            $logsQuery->where(function ($q) use ($logSearch) {
                $q->whereHas('inventaris', function ($iq) use ($logSearch) {
                    $iq->where('nama_barang', 'ilike', "%{$logSearch}%")
                        ->orWhere('sku', 'ilike', "%{$logSearch}%");
                })->orWhereHas('jamaah', function ($jq) use ($logSearch) {
                    $jq->where('nama_lengkap', 'ilike', "%{$logSearch}%");
                })->orWhere('alasan', 'ilike', "%{$logSearch}%");
            });
        }

        if ($logTypeFilter && $logTypeFilter !== 'ALL') {
            $logsQuery->where('tipe', $logTypeFilter);
        }

        if (! empty($logStartDate)) {
            $logsQuery->whereDate('created_at', '>=', $logStartDate);
        }
        if (! empty($logEndDate)) {
            $logsQuery->whereDate('created_at', '<=', $logEndDate);
        }

        $logs = $logsQuery->orderBy('created_at', 'desc')
            ->paginate($logsPerPage, ['*'], 'logs_page')
            ->withQueryString();

        // 4 Key ERP Summary Metrics
        $allItems = Inventaris::where('tenant_id', $tenantId)->orderBy('nama_barang')->get();
        $totalSku = $allItems->count();
        $totalStockUnits = $allItems->sum('stok_tersedia');
        $totalAssetValue = $allItems->sum(fn ($i) => (float) $i->stok_tersedia * (float) $i->harga_pokok);
        $criticalCount = $allItems->filter(fn ($i) => $i->stok_tersedia <= $i->stok_minimum)->count();

        // Available categories & locations for filter dropdowns
        $categories = Inventaris::where('tenant_id', $tenantId)
            ->whereNotNull('kategori')
            ->where('kategori', '!=', '')
            ->distinct()
            ->pluck('kategori');

        $locations = Inventaris::where('tenant_id', $tenantId)
            ->whereNotNull('lokasi_rak')
            ->where('lokasi_rak', '!=', '')
            ->distinct()
            ->pluck('lokasi_rak');

        // Recent Jamaah for distribution modal
        $jamaahList = Jamaah::where('tenant_id', $tenantId)
            ->select('id', 'nama_lengkap', 'no_hp', 'nik')
            ->orderBy('nama_lengkap')
            ->limit(300)
            ->get();

        return Inertia::render('Inventory/Inventory', [
            'items' => $items,
            'logs' => $logs,
            'allItems' => $allItems,
            'categories' => $categories,
            'locations' => $locations,
            'jamaahList' => $jamaahList,
            'tenantName' => $user->tenant?->name ?? 'Travel Umroh & Haji',
            'metrics' => [
                'total_sku' => $totalSku,
                'total_units' => $totalStockUnits,
                'total_asset_value' => $totalAssetValue,
                'critical_count' => $criticalCount,
            ],
            'filters' => [
                'search' => $request->input('search', ''),
                'status' => $statusFilter,
                'kategori' => $kategoriFilter,
                'lokasi' => $lokasiFilter,
                'items_per_page' => $itemsPerPage,
                'logs_per_page' => $logsPerPage,
                'log_search' => $request->input('log_search', ''),
                'log_type' => $logTypeFilter,
                'log_start_date' => $logStartDate ?? '',
                'log_end_date' => $logEndDate ?? '',
                'tab' => $activeTab,
            ],
        ]);
    }

    /**
     * Create a new inventory item with ERP attributes.
     */
    public function store(Request $request): RedirectResponse
    {
        $user = auth()->user();
        $allowedRoles = Menu::where('url', '/inventaris')->value('roles') ?? ['super_admin_master', 'owner_travel', 'admin_travel'];
        if (! $user->isSuperAdmin() && ! $user->isOwner() && ! in_array($user->role, $allowedRoles)) {
            abort(403, 'Unauthorized action.');
        }

        $validated = $request->validate([
            'nama_barang' => 'required|string|max:255',
            'sku' => 'nullable|string|max:50',
            'kategori' => 'nullable|string|max:100',
            'satuan' => 'nullable|string|max:50',
            'harga_pokok' => 'nullable|numeric|min:0',
            'stok_tersedia' => 'required|integer|min:0',
            'stok_minimum' => 'required|integer|min:0',
            'lokasi_rak' => 'nullable|string|max:100',
        ]);

        DB::transaction(function () use ($validated, $user) {
            // Auto generate SKU if empty
            $sku = $validated['sku'] ?? null;
            if (! $sku) {
                $sku = 'INV-'.strtoupper(substr(preg_replace('/[^A-Za-z0-9]/', '', $validated['nama_barang']), 0, 3)).'-'.rand(100, 999);
            }

            $item = Inventaris::create([
                'tenant_id' => $user->getActiveTenantId(),
                'sku' => $sku,
                'nama_barang' => $validated['nama_barang'],
                'kategori' => $validated['kategori'] ?? 'Perlengkapan',
                'satuan' => $validated['satuan'] ?? 'Pcs',
                'harga_pokok' => $validated['harga_pokok'] ?? 0,
                'stok_tersedia' => $validated['stok_tersedia'],
                'stok_minimum' => $validated['stok_minimum'],
                'lokasi_rak' => $validated['lokasi_rak'] ?? null,
            ]);

            if ($item->stok_tersedia > 0) {
                InventarisTransaksi::create([
                    'tenant_id' => $user->getActiveTenantId(),
                    'inventaris_id' => $item->id,
                    'jamaah_id' => null,
                    'qty' => $item->stok_tersedia,
                    'tipe' => 'IN',
                    'alasan' => 'Saldo Awal Stok Barang Baru',
                    'created_by' => $user->id,
                ]);
            }
        });

        return redirect()->back()->with('success', 'Barang inventaris baru berhasil didaftarkan.');
    }

    /**
     * Update details of an existing inventory item.
     */
    public function update(Request $request, Inventaris $item): RedirectResponse
    {
        $user = auth()->user();
        $allowedRoles = Menu::where('url', '/inventaris')->value('roles') ?? ['super_admin_master', 'owner_travel', 'admin_travel'];
        if (! $user->isSuperAdmin() && ! $user->isOwner() && ! in_array($user->role, $allowedRoles)) {
            abort(403, 'Unauthorized action.');
        }

        $validated = $request->validate([
            'nama_barang' => 'required|string|max:255',
            'sku' => 'nullable|string|max:50',
            'kategori' => 'nullable|string|max:100',
            'satuan' => 'nullable|string|max:50',
            'harga_pokok' => 'nullable|numeric|min:0',
            'stok_tersedia' => 'nullable|integer|min:0',
            'stok_minimum' => 'required|integer|min:0',
            'lokasi_rak' => 'nullable|string|max:100',
        ]);

        DB::transaction(function () use ($validated, $item, $user) {
            $oldStock = (int) $item->stok_tersedia;
            $newStock = isset($validated['stok_tersedia']) ? (int) $validated['stok_tersedia'] : $oldStock;

            $item->update([
                'nama_barang' => $validated['nama_barang'],
                'sku' => $validated['sku'] ?? $item->sku,
                'kategori' => $validated['kategori'] ?? $item->kategori,
                'satuan' => $validated['satuan'] ?? $item->satuan,
                'harga_pokok' => $validated['harga_pokok'] ?? $item->harga_pokok,
                'stok_tersedia' => $newStock,
                'stok_minimum' => $validated['stok_minimum'],
                'lokasi_rak' => $validated['lokasi_rak'] ?? $item->lokasi_rak,
            ]);

            if ($newStock !== $oldStock) {
                $diff = $newStock - $oldStock;
                InventarisTransaksi::create([
                    'tenant_id' => $user->getActiveTenantId(),
                    'inventaris_id' => $item->id,
                    'jamaah_id' => null,
                    'qty' => abs($diff),
                    'tipe' => $diff > 0 ? 'IN' : 'OUT',
                    'alasan' => 'Penyesuaian Manual Master Data Barang',
                    'created_by' => $user->id,
                ]);
            }
        });

        return redirect()->back()->with('success', 'Master data dan stok barang berhasil diperbarui.');
    }

    /**
     * Quick stock adjustment / Restock (Stock IN / Stock OUT) with reason and user trace.
     */
    public function adjust(Request $request, Inventaris $item): RedirectResponse
    {
        $user = auth()->user();
        $allowedRoles = Menu::where('url', '/inventaris')->value('roles') ?? ['super_admin_master', 'owner_travel', 'admin_travel'];
        if (! $user->isSuperAdmin() && ! $user->isOwner() && ! in_array($user->role, $allowedRoles)) {
            abort(403, 'Unauthorized action.');
        }

        $validated = $request->validate([
            'tipe' => 'required|in:IN,OUT',
            'qty' => 'required|integer|min:1',
            'alasan' => 'required|string|max:255',
        ]);

        $qty = (int) $validated['qty'];
        $tipe = $validated['tipe'];
        $alasan = $validated['alasan'];

        if ($tipe === 'OUT' && $item->stok_tersedia < $qty) {
            return redirect()->back()->withErrors(['qty' => 'Stok saat ini tidak mencukupi untuk pengurangan.']);
        }

        DB::transaction(function () use ($item, $tipe, $qty, $alasan, $user) {
            if ($tipe === 'IN') {
                $item->increment('stok_tersedia', $qty);
            } else {
                $item->decrement('stok_tersedia', $qty);
            }

            InventarisTransaksi::create([
                'tenant_id' => $user->getActiveTenantId(),
                'inventaris_id' => $item->id,
                'jamaah_id' => null,
                'qty' => $qty,
                'tipe' => $tipe,
                'alasan' => $alasan,
                'created_by' => $user->id,
            ]);
        });

        $tipeLabel = $tipe === 'IN' ? 'Penambahan (Restock)' : 'Pengurangan (Stock Out)';

        return redirect()->back()->with('success', "{$tipeLabel} sebanyak {$qty} {$item->satuan} berhasil dicatat.");
    }

    /**
     * Distribute inventory equipment to a specific Jamaah.
     */
    public function distribute(Request $request, Inventaris $item): RedirectResponse
    {
        $user = auth()->user();
        $allowedRoles = Menu::where('url', '/inventaris')->value('roles') ?? ['super_admin_master', 'owner_travel', 'admin_travel'];
        if (! $user->isSuperAdmin() && ! $user->isOwner() && ! in_array($user->role, $allowedRoles)) {
            abort(403, 'Unauthorized action.');
        }

        $validated = $request->validate([
            'jamaah_id' => 'required|exists:jamaah,id',
            'qty' => 'required|integer|min:1',
            'alasan' => 'nullable|string|max:255',
        ]);

        $qty = (int) $validated['qty'];
        if ($item->stok_tersedia < $qty) {
            return redirect()->back()->withErrors(['qty' => "Stok {$item->nama_barang} tidak mencukupi (tersedia {$item->stok_tersedia})."]);
        }

        $jamaah = Jamaah::where('tenant_id', $user->getActiveTenantId())->findOrFail($validated['jamaah_id']);

        DB::transaction(function () use ($item, $jamaah, $qty, $validated, $user) {
            $item->decrement('stok_tersedia', $qty);

            InventarisTransaksi::create([
                'tenant_id' => $user->getActiveTenantId(),
                'inventaris_id' => $item->id,
                'jamaah_id' => $jamaah->id,
                'qty' => $qty,
                'tipe' => 'OUT',
                'alasan' => $validated['alasan'] ?? "Distribusi perlengkapan untuk jamaah {$jamaah->nama_lengkap}",
                'created_by' => $user->id,
            ]);
        });

        return redirect()->back()->with('success', "Distribusi {$qty} {$item->satuan} ({$item->nama_barang}) untuk jamaah {$jamaah->nama_lengkap} berhasil dicatat.");
    }
}
