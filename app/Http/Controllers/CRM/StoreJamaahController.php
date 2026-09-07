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
            'nik' => ['nullable', 'string', 'digits:16'],
            'jenis_kelamin' => ['nullable', 'string', 'in:L,P,Laki-laki,Perempuan'],
            'tempat_lahir' => ['nullable', 'string', 'max:100'],
            'tanggal_lahir' => ['nullable', 'date'],
            'nomor_paspor' => ['nullable', 'string', 'max:50'],
            'golongan_darah' => ['nullable', 'string', 'max:10'],
            'status_pernikahan' => ['nullable', 'string', 'max:30'],
            'no_hp' => ['required', 'string', 'max:25'],
            'email' => ['nullable', 'email', 'max:255'],
            'alamat_ktp' => ['nullable', 'string', 'max:500'],
            'alamat_domisili' => ['nullable', 'string', 'max:500'],
            'kontak_darurat_nama' => ['nullable', 'string', 'max:255'],
            'kontak_darurat_hp' => ['nullable', 'string', 'max:30'],
            'kontak_darurat_hubungan' => ['nullable', 'string', 'max:50'],
            'riwayat_penyakit' => ['nullable', 'string', 'max:500'],
            'paket_id' => ['required', 'exists:paket,id'],
            'agen_id' => ['nullable', 'exists:users,id'],
            'tanggal_keberangkatan' => ['nullable', 'date'],
            'catatan_admin' => ['nullable', 'string', 'max:1000'],
            // Mandatory Documents (KTP & KK)
            'file_ktp' => ['required', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:5120'],
            'file_kk' => ['required', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:5120'],
            // Optional Documents (Foto & Paspor)
            'file_foto' => ['nullable', 'file', 'mimes:jpg,jpeg,png', 'max:5120'],
            'file_paspor' => ['nullable', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:5120'],
        ]);

        $tenantId = auth()->user()->getActiveTenantId();
        $authUserId = auth()->user()->role === 'agen' ? auth()->id() : null;

        $action->execute($validated, $tenantId, $authUserId);

        return redirect()->back()->with('success', 'Calon nasabah berhasil didaftarkan.');
    }
}
