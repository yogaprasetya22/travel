<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $tenant_id
 * @property int $paket_id
 * @property int $agen_id
 * @property float|null $komisi_flat
 * @property float|null $komisi_persentase
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Tenant $tenant
 * @property-read Paket $paket
 * @property-read User $agen
 */
class OverrideKomisiAgen extends Model
{
    use BelongsToTenant, HasFactory;

    protected $table = 'override_komisi_agen';

    protected $fillable = [
        'tenant_id',
        'paket_id',
        'agen_id',
        'komisi_flat',
        'komisi_persentase',
    ];

    protected $casts = [
        'komisi_flat' => 'float',
        'komisi_persentase' => 'float',
    ];

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function paket(): BelongsTo
    {
        return $this->belongsTo(Paket::class);
    }

    public function agen(): BelongsTo
    {
        return $this->belongsTo(User::class, 'agen_id');
    }
}
