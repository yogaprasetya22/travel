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
        if (! in_array($user->role, ['owner_travel', 'admin_travel'])) {
            abort(403, 'Unauthorized action.');
        }

        $perPage = (int) $request->input('per_page', 15);

        $commissions = KomisiAgen::with(['agen', 'jamaah.paket'])
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
        ]);
    }

    /**
     * Update the disbursement status of a specific commission.
     */
    public function update(Request $request, KomisiAgen $commission): RedirectResponse
    {
        $user = auth()->user();
        if (! in_array($user->role, ['owner_travel', 'admin_travel'])) {
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
