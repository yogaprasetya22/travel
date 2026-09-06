<?php

namespace App\Http\Controllers\CRM;

use App\Actions\CRM\UpdateStageAction;
use App\Http\Controllers\Controller;
use App\Models\Jamaah;
use App\Models\Pembayaran;
use App\Models\RekeningTenant;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class UpdateStageController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request, Jamaah $jamaah, UpdateStageAction $action): RedirectResponse
    {
        $validated = $request->validate([
            'crm_stage_id' => ['required', 'integer'],
            'catatan' => ['nullable', 'string', 'max:1000'],
            'nominal_dp' => ['nullable', 'numeric', 'min:0'],
            'rekening_tenant_id' => ['nullable', 'exists:rekening_tenant,id'],
            'bukti_transfer' => ['nullable', 'file', 'image', 'max:4096'],
        ]);

        $action->execute($jamaah, (int) $validated['crm_stage_id'], $validated['catatan'] ?? null);

        // Record DP payment if provided
        if (! empty($validated['nominal_dp']) && $validated['nominal_dp'] > 0) {
            $buktiPath = null;
            if ($request->hasFile('bukti_transfer')) {
                $buktiPath = $request->file('bukti_transfer')->store('bukti_transfer', 'public');
            }

            // Default to the first active tenant bank if not explicitly provided
            $rekeningId = $validated['rekening_tenant_id'] ?? null;
            if (! $rekeningId) {
                $defaultRekening = RekeningTenant::where('tenant_id', $jamaah->tenant_id)
                    ->where('is_active', true)
                    ->first();
                $rekeningId = $defaultRekening?->id;
            }

            Pembayaran::create([
                'tenant_id' => $jamaah->tenant_id,
                'jamaah_id' => $jamaah->id,
                'rekening_tenant_id' => $rekeningId,
                'tipe_pembayaran' => 'DP',
                'nominal' => $validated['nominal_dp'],
                'bukti_transfer' => $buktiPath,
                'status_verifikasi' => 'Pending',
            ]);
        }

        return redirect()->back();
    }
}
