<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $paket_id
 * @property int $inventaris_id
 * @property int $qty
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
class PaketInventaris extends Pivot
{
    protected $table = 'paket_inventaris';

    public $incrementing = true;

    protected $fillable = [
        'paket_id',
        'inventaris_id',
        'qty',
    ];
}
