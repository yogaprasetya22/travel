<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $tenant_id
 * @property string $nama_paket
 * @property float $harga
 * @property float $komisi_flat
 * @property float $komisi_persentase
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Tenant $tenant
 */
class Paket extends Model
{
    use BelongsToTenant, HasFactory;

    protected $table = 'paket';

    protected $fillable = [
        'tenant_id',
        'nama_paket',
        'harga',
        'komisi_flat',
        'komisi_persentase',
        'periode_mulai',
        'periode_selesai',
        'is_active',
    ];

    protected $casts = [
        'harga' => 'float',
        'komisi_flat' => 'float',
        'komisi_persentase' => 'float',
        'is_active' => 'boolean',
    ];

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function inventaris(): BelongsToMany
    {
        return $this->belongsToMany(Inventaris::class, 'paket_inventaris')
            ->withPivot('qty')
            ->withTimestamps();
    }

    public function overrideKomisi(): HasMany
    {
        return $this->hasMany(OverrideKomisiAgen::class);
    }

    public function jamaah(): HasMany
    {
        return $this->hasMany(Jamaah::class);
    }
}
