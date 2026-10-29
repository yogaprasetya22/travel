<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Carbon;

/**
 * Penerbangan katalog. `sumber`, `sumber_ref`, `sumber_url` menyiapkan impor dari web lain (Traveloka, Agoda, dll).
 *
 * @property int $id
 * @property int $tenant_id
 * @property string $maskapai
 * @property string $nomor_penerbangan
 * @property string $bandara_asal
 * @property string $bandara_tujuan
 * @property Carbon|null $waktu_berangkat
 * @property Carbon|null $waktu_tiba
 * @property float|null $harga
 * @property string $sumber
 * @property string|null $sumber_ref
 * @property string|null $sumber_url
 */
class Penerbangan extends Model
{
    use BelongsToTenant, HasFactory;

    public const SUMBER = ['manual', 'traveloka', 'agoda', 'tiket_com', 'lainnya'];

    protected $table = 'penerbangan';

    protected $fillable = [
        'tenant_id', 'maskapai', 'nomor_penerbangan', 'bandara_asal', 'bandara_tujuan',
        'waktu_berangkat', 'waktu_tiba', 'harga', 'sumber', 'sumber_ref', 'sumber_url',
    ];

    protected $casts = [
        'waktu_berangkat' => 'datetime:Y-m-d\TH:i',
        'waktu_tiba' => 'datetime:Y-m-d\TH:i',
        'harga' => 'float',
    ];

    public function keberangkatan(): BelongsToMany
    {
        return $this->belongsToMany(Keberangkatan::class, 'keberangkatan_penerbangan');
    }
}
