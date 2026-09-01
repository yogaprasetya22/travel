<?php

namespace App\Http\Controllers\CRM;

use App\Http\Controllers\Controller;
use App\Models\Jamaah;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class UpdateJamaahController extends Controller
{
    /**
     * Update lead / prospective jamaah details in CRM.
     */
    public function __invoke(Request $request, Jamaah $jamaah): RedirectResponse
    {
        $user = $request->user();

        // Ensure user belongs to the same tenant or has access
        if ($user->role !== 'super_admin_master' && $jamaah->tenant_id !== $user->tenant_id) {
            abort(403, 'Aksi tidak diizinkan.');
        }

        // If agent, ensure they own this lead
        if ($user->role === 'agen' && $jamaah->agen_id !== $user->id) {
            abort(403, 'Aksi tidak diizinkan.');
        }

        $validated = $request->validate([
            'nama_lengkap' => ['required', 'string', 'max:255'],
            'nik' => ['nullable', 'string', 'max:50'],
            'no_hp' => ['required', 'string', 'max:20'],
            'email' => ['nullable', 'string', 'email', 'max:255'],
            'paket_id' => ['required', 'exists:paket,id'],
            'agen_id' => ['nullable', 'exists:users,id'],
            'catatan_admin' => ['nullable', 'string'],
        ]);

        $jamaah->update($validated);

        return redirect()->back()->with('success', 'Data calon nasabah berhasil diperbarui.');
    }
}
