<?php

namespace App\Http\Controllers\CRM;

use App\Http\Controllers\Controller;
use App\Models\Hotel;
use App\Models\Penerbangan;
use App\Traits\AuthorizesTravelCatalog;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class HotelController extends Controller
{
    use AuthorizesTravelCatalog;

    public function store(Request $request): RedirectResponse
    {
        $this->authorizeCatalog($request);

        Hotel::create($this->validated($request) + ['tenant_id' => $request->user()->getActiveTenantId()]);

        return redirect()->back()->with('success', 'Hotel berhasil ditambahkan.');
    }

    public function update(Request $request, Hotel $hotel): RedirectResponse
    {
        $this->authorizeCatalog($request, $hotel);

        $hotel->update($this->validated($request));

        return redirect()->back()->with('success', 'Hotel berhasil diperbarui.');
    }

    public function destroy(Request $request, Hotel $hotel): RedirectResponse
    {
        $this->authorizeCatalog($request, $hotel);

        if ($hotel->keberangkatan()->exists()) {
            return redirect()->back()->withErrors(['hapus' => 'Hotel masih dipakai keberangkatan, lepas dulu dari keberangkatannya.']);
        }

        $hotel->delete();

        return redirect()->back()->with('success', 'Hotel berhasil dihapus.');
    }

    /**
     * @return array<string, mixed>
     */
    private function validated(Request $request): array
    {
        return $request->validate([
            'nama' => ['required', 'string', 'max:150'],
            'kota' => ['required', 'string', 'max:50'],
            'bintang' => ['nullable', 'integer', 'between:1,5'],
            'alamat' => ['nullable', 'string', 'max:255'],
            'jarak_ke_masjid' => ['nullable', 'integer', 'min:0'],
            'harga_per_malam' => ['nullable', 'numeric', 'min:0'],
            'sumber' => ['required', Rule::in(Penerbangan::SUMBER)],
            'sumber_ref' => ['nullable', 'string', 'max:150'],
            'sumber_url' => ['nullable', 'url', 'max:500'],
        ]);
    }
}
