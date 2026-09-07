<?php

namespace App\Actions\CRM;

use App\Models\CrmStage;
use App\Models\Jamaah;
use App\Models\JamaahDocument;
use Illuminate\Http\UploadedFile;
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

        $jamaah = Jamaah::create([
            'tenant_id' => $tenantId,
            'crm_stage_id' => $firstStage->id,
            'nama_lengkap' => $data['nama_lengkap'],
            'nik' => ! empty($data['nik']) ? $data['nik'] : null,
            'jenis_kelamin' => ! empty($data['jenis_kelamin']) ? $data['jenis_kelamin'] : 'L',
            'tempat_lahir' => ! empty($data['tempat_lahir']) ? $data['tempat_lahir'] : null,
            'tanggal_lahir' => ! empty($data['tanggal_lahir']) ? $data['tanggal_lahir'] : null,
            'nomor_paspor' => ! empty($data['nomor_paspor']) ? $data['nomor_paspor'] : null,
            'golongan_darah' => ! empty($data['golongan_darah']) ? $data['golongan_darah'] : null,
            'status_pernikahan' => ! empty($data['status_pernikahan']) ? $data['status_pernikahan'] : 'Menikah',
            'no_hp' => $data['no_hp'],
            'email' => ! empty($data['email']) ? $data['email'] : null,
            'alamat_ktp' => ! empty($data['alamat_ktp']) ? $data['alamat_ktp'] : null,
            'alamat_domisili' => ! empty($data['alamat_domisili']) ? $data['alamat_domisili'] : null,
            'kontak_darurat_nama' => ! empty($data['kontak_darurat_nama']) ? $data['kontak_darurat_nama'] : null,
            'kontak_darurat_hp' => ! empty($data['kontak_darurat_hp']) ? $data['kontak_darurat_hp'] : null,
            'kontak_darurat_hubungan' => ! empty($data['kontak_darurat_hubungan']) ? $data['kontak_darurat_hubungan'] : null,
            'riwayat_penyakit' => ! empty($data['riwayat_penyakit']) ? $data['riwayat_penyakit'] : null,
            'paket_id' => (int) $data['paket_id'],
            'agen_id' => ! empty($data['agen_id']) ? (int) $data['agen_id'] : $authUserId,
            'tanggal_keberangkatan' => ! empty($data['tanggal_keberangkatan']) ? $data['tanggal_keberangkatan'] : null,
            'catatan_admin' => ! empty($data['catatan_admin']) ? $data['catatan_admin'] : 'Didaftarkan oleh admin/agen di CRM.',
        ]);

        // Save uploaded documents (KTP & KK mandatory, Foto & Paspor optional)
        $docUploads = [
            'file_ktp' => 'ktp',
            'file_kk' => 'kk',
            'file_foto' => 'foto',
            'file_paspor' => 'paspor',
        ];

        foreach ($docUploads as $fileInput => $docType) {
            if (isset($data[$fileInput]) && $data[$fileInput] instanceof UploadedFile) {
                $file = $data[$fileInput];
                $filename = time()."_{$docType}_".preg_replace('/[^a-zA-Z0-9._-]/', '', $file->getClientOriginalName());
                $path = $file->storeAs("tenants/{$tenantId}/jamaah/{$jamaah->id}/documents", $filename, 'public');

                JamaahDocument::create([
                    'tenant_id' => $tenantId,
                    'jamaah_id' => $jamaah->id,
                    'type' => $docType,
                    'title' => strtoupper($docType).' - '.$jamaah->nama_lengkap,
                    'file_path' => $path,
                    'file_name' => $file->getClientOriginalName(),
                    'mime_type' => $file->getClientMimeType(),
                    'file_size' => $file->getSize(),
                    'uploaded_by' => $authUserId ?? auth()->id(),
                ]);
            }
        }

        return $jamaah;
    }
}
