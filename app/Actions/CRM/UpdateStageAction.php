<?php

namespace App\Actions\CRM;

use App\Models\CrmStage;
use App\Models\Jamaah;
use Illuminate\Validation\ValidationException;

class UpdateStageAction
{
    /**
     * Execute stage update.
     */
    public function execute(Jamaah $jamaah, int $crmStageId): void
    {
        $stageExists = CrmStage::where('id', $crmStageId)
            ->where('tenant_id', $jamaah->tenant_id)
            ->exists();

        if (! $stageExists) {
            throw ValidationException::withMessages([
                'crm_stage_id' => 'Tahap CRM tidak valid untuk tenant ini.',
            ]);
        }

        $jamaah->update([
            'crm_stage_id' => $crmStageId,
        ]);
    }
}
