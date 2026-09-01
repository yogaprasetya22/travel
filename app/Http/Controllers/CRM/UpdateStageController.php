<?php

namespace App\Http\Controllers\CRM;

use App\Actions\CRM\UpdateStageAction;
use App\Http\Controllers\Controller;
use App\Models\Jamaah;
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
        ]);

        $action->execute($jamaah, (int) $validated['crm_stage_id']);

        return redirect()->back();
    }
}
