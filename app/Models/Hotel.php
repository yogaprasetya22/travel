<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

/**
 * Hotel katalog. `sumber`, `sumber_ref`, `sumber_url` menyiapkan impor dari web lain (Traveloka, Agoda, dll).
 *
 * @property int $id
 * @property int $tenant_id
 * @property string $nama
 * @property string $kota
 * @property int|null $bintang
 * @property string|null $alamat
 * @property int|null $jarak_ke_masjid
 * @property float|null $harga_per_malam
 * @property string $sumber
 * @property string|null $sumber_ref
 * @property string|null $sumber_url
 */
class Hotel extends Model
{
    use BelongsToTenant, HasFactory;

    protected $table = 'hotel';

    protected $fillable = [
        'tenant_id', 'nama', 'kota', 'bintang', 'alamat', 'jarak_ke_masjid',
        'harga_per_malam', 'sumber', 'sumber_ref', 'sumber_url',
    ];

    protected $casts = [
        'bintang' => 'integer',
        'jarak_ke_masjid' => 'integer',
        'harga_per_malam' => 'float',
    ];

    public function keberangkatan(): BelongsToMany
    {
        return $this->belongsToMany(Keberangkatan::class, 'keberangkatan_hotel');
    }
}
