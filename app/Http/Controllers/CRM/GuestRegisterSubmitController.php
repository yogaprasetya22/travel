<?php

namespace App\Http\Controllers\CRM;

use App\Actions\CRM\RegisterJamaahAction;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class GuestRegisterSubmitController extends Controller
{
    /**
     * Handle registration submit.
     */
    public function __invoke(Request $request, RegisterJamaahAction $action): Response
    {
        $validated = $request->validate([
            'nama_lengkap' => ['required', 'string', 'max:255'],
            'nik' => ['nullable', 'string', 'max:16'],
            'no_hp' => ['required', 'string', 'max:20'],
            'email' => ['required', 'email', 'max:255'],
            'paket_id' => ['required', 'exists:paket,id'],
        ]);

        $tenantId = app('tenant')->id;

        $action->execute($validated, $tenantId);

        return Inertia::render('CRM/RegisterSuccess', [
            'tenant' => app('tenant'),
        ]);
    }
}
