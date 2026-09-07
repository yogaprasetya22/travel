<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ItemDistribution extends Model
{
    use BelongsToTenant, HasFactory;

    protected $table = 'item_distributions';

    protected $fillable = [
        'tenant_id',
        'jamaah_id',
        'inventaris_id',
        'qty',
        'status',
        'delivered_at',
        'receiver_name',
        'handed_over_by',
        'notes',
    ];

    protected $casts = [
        'qty' => 'integer',
        'delivered_at' => 'datetime',
    ];

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function jamaah(): BelongsTo
    {
        return $this->belongsTo(Jamaah::class);
    }

    public function inventaris(): BelongsTo
    {
        return $this->belongsTo(Inventaris::class);
    }

    public function staff(): BelongsTo
    {
        return $this->belongsTo(User::class, 'handed_over_by');
    }
}
