<?php

namespace App\Actions\CRM;

use App\Models\CrmStage;
use App\Models\Jamaah;
use Illuminate\Validation\ValidationException;

class StoreJamaahAction
{
    /**
     * Store new jamaah lead.
     */
    public function execute(array $data, int $tenantId, ?int $authUserId): Jamaah
    {
        $firstStage = CrmStage::where('tenant_id', $tenantId)
            ->orderBy('urutan')
            ->first();

        if (! $firstStage) {
            throw ValidationException::withMessages([
                'crm_stage' => 'Belum ada tahap CRM yang didefinisikan untuk tenant ini.',
            ]);
        }

        return Jamaah::create([
            'tenant_id' => $tenantId,
            'crm_stage_id' => $firstStage->id,
            'nama_lengkap' => $data['nama_lengkap'],
            'nik' => $data['nik'] ?? null,
            'no_hp' => $data['no_hp'],
            'email' => $data['email'] ?? null,
            'paket_id' => $data['paket_id'],
            'agen_id' => $data['agen_id'] ?? $authUserId,
            'tanggal_keberangkatan' => $data['tanggal_keberangkatan'] ?? null,
            'catatan_admin' => $data['catatan_admin'] ?? 'Didaftarkan oleh admin/agen di CRM.',
        ]);
    }
}
