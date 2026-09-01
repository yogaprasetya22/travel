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
 * @property int $inventaris_id
 * @property int|null $jamaah_id
 * @property int $qty
 * @property string $tipe
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Tenant $tenant
 * @property-read Inventaris $inventaris
 * @property-read Jamaah|null $jamaah
 */
class InventarisTransaksi extends Model
{
    use BelongsToTenant, HasFactory;

    protected $table = 'inventaris_transaksi';

    protected $fillable = [
        'tenant_id',
        'inventaris_id',
        'jamaah_id',
        'qty',
        'tipe',
        'alasan',
        'created_by',
    ];

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function inventaris(): BelongsTo
    {
        return $this->belongsTo(Inventaris::class);
    }

    public function jamaah(): BelongsTo
    {
        return $this->belongsTo(Jamaah::class);
    }
}
