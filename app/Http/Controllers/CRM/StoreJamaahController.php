<?php

namespace App\Http\Controllers\CRM;

use App\Actions\CRM\StoreJamaahAction;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class StoreJamaahController extends Controller
{
    /**
     * Handle store jamaah lead request.
     */
    public function __invoke(Request $request, StoreJamaahAction $action): RedirectResponse
    {
        $validated = $request->validate([
            'nama_lengkap' => ['required', 'string', 'max:255'],
            'nik' => ['nullable', 'string', 'length:16'],
            'no_hp' => ['required', 'string', 'max:20'],
            'email' => ['nullable', 'email', 'max:255'],
            'paket_id' => ['required', 'exists:paket,id'],
            'agen_id' => ['nullable', 'exists:users,id'],
            'catatan_admin' => ['nullable', 'string'],
        ]);

        $tenantId = auth()->user()->tenant_id;
        $authUserId = auth()->user()->role === 'agen' ? auth()->id() : null;

        $action->execute($validated, $tenantId, $authUserId);

        return redirect()->back()->with('success', 'Calon nasabah berhasil didaftarkan.');
    }
}
