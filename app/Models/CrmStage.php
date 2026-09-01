<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $tenant_id
 * @property string $nama_tahap
 * @property int $urutan
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Tenant $tenant
 */
class CrmStage extends Model
{
    use BelongsToTenant, HasFactory;

    protected $table = 'crm_stages';

    protected $fillable = [
        'tenant_id',
        'nama_tahap',
        'urutan',
        'periode_mulai',
        'periode_selesai',
        'is_active',
    ];

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function jamaah(): HasMany
    {
        return $this->hasMany(Jamaah::class, 'crm_stage_id');
    }
}
