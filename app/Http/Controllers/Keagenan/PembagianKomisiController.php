<?php

namespace App\Http\Controllers\Keagenan;

use App\Http\Controllers\Controller;
use App\Models\KomisiAgen;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PembagianKomisiController extends Controller
{
    /**
     * Display the commissions list and summary statistics.
     */
    public function index(Request $request): Response
    {
        $user = auth()->user();
        if (! in_array($user->role, ['owner_travel', 'admin_travel', 'super_admin_master'])) {
            abort(403, 'Unauthorized action.');
        }

        $search = $request->input('search');
        $status = $request->input('status');
        $perPage = (int) $request->input('per_page', 15);

        $query = KomisiAgen::with(['agen', 'jamaah.paket']);

        if (! empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->whereHas('agen', function ($qa) use ($search) {
                    $qa->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                })->orWhereHas('jamaah', function ($qj) use ($search) {
                    $qj->where('nama_lengkap', 'like', "%{$search}%")
                        ->orWhereHas('paket', function ($qp) use ($search) {
                            $qp->where('nama_paket', 'like', "%{$search}%");
                        });
                });
            });
        }

        if (! empty($status) && in_array($status, ['Pending', 'Ready_to_Pay', 'Paid'])) {
            $query->where('status_pencairan', $status);
        }

        $commissions = $query
            ->orderBy('created_at', 'desc')
            ->paginate($perPage)
            ->withQueryString();

        $stats = [
            'total_paid' => (float) KomisiAgen::where('status_pencairan', 'Paid')->sum('nominal_komisi'),
            'total_ready' => (float) KomisiAgen::where('status_pencairan', 'Ready_to_Pay')->sum('nominal_komisi'),
            'total_pending' => (float) KomisiAgen::where('status_pencairan', 'Pending')->sum('nominal_komisi'),
        ];

        return Inertia::render('Keagenan/Commissions', [
            'commissions' => $commissions,
            'stats' => $stats,
            'filters' => [
                'search' => $search ?? '',
                'status' => $status ?? 'ALL',
                'per_page' => $perPage,
            ],
        ]);
    }

    /**
     * Update the disbursement status of a specific commission.
     */
    public function update(Request $request, KomisiAgen $commission): RedirectResponse
    {
        $user = auth()->user();
        if (! in_array($user->role, ['owner_travel', 'admin_travel', 'super_admin_master'])) {
            abort(403, 'Unauthorized action.');
        }

        $validated = $request->validate([
            'status_pencairan' => 'required|string|in:Pending,Ready_to_Pay,Paid',
        ]);

        $commission->update([
            'status_pencairan' => $validated['status_pencairan'],
        ]);

        return redirect()->back()->with('success', 'Status komisi berhasil diperbarui.');
    }
}
