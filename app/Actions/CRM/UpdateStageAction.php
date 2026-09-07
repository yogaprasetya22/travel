<?php

namespace App\Actions\CRM;

use App\Models\CrmStage;
use App\Models\CrmStageLog;
use App\Models\Jamaah;
use Illuminate\Validation\ValidationException;

class UpdateStageAction
{
    /**
     * Execute stage update and record audit log.
     */
    public function execute(Jamaah $jamaah, int $crmStageId, ?string $catatan = null): void
    {
        $stageExists = CrmStage::where('id', $crmStageId)
            ->where('tenant_id', $jamaah->tenant_id)
            ->exists();

        if (! $stageExists) {
            throw ValidationException::withMessages([
                'crm_stage_id' => 'Tahap CRM tidak valid untuk tenant ini.',
            ]);
        }

        $fromStageId = $jamaah->crm_stage_id;

        // Record Stage Transition Log
        CrmStageLog::create([
            'tenant_id' => $jamaah->tenant_id,
            'jamaah_id' => $jamaah->id,
            'user_id' => auth()->id(),
            'from_stage_id' => $fromStageId,
            'to_stage_id' => $crmStageId,
            'catatan' => $catatan,
        ]);

        $updateData = [
            'crm_stage_id' => $crmStageId,
            'updated_at' => now(),
        ];

        if (! empty($catatan)) {
            $updateData['catatan_admin'] = $catatan;
        }

        $jamaah->update($updateData);
        $jamaah->touch();
    }
}
