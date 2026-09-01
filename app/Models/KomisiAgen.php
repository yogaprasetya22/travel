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
 * @property int $agen_id
 * @property int $jamaah_id
 * @property float $nominal_komisi
 * @property string $status_pencairan
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Tenant $tenant
 * @property-read User $agen
 * @property-read Jamaah $jamaah
 */
class KomisiAgen extends Model
{
    use BelongsToTenant, HasFactory;

    protected $table = 'komisi_agen';

    protected $fillable = [
        'tenant_id',
        'agen_id',
        'jamaah_id',
        'nominal_komisi',
        'status_pencairan',
    ];

    protected $casts = [
        'nominal_komisi' => 'float',
    ];

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function agen(): BelongsTo
    {
        return $this->belongsTo(User::class, 'agen_id');
    }

    public function jamaah(): BelongsTo
    {
        return $this->belongsTo(Jamaah::class);
    }
}
