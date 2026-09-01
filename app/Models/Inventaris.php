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
 * @property string $nama_barang
 * @property int $stok_tersedia
 * @property int $stok_minimum
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Tenant $tenant
 */
class Inventaris extends Model
{
    use BelongsToTenant, HasFactory;

    protected $table = 'inventaris';

    protected $fillable = [
        'tenant_id',
        'sku',
        'nama_barang',
        'kategori',
        'satuan',
        'harga_pokok',
        'stok_tersedia',
        'stok_minimum',
        'lokasi_rak',
    ];

    protected $casts = [
        'harga_pokok' => 'float',
        'stok_tersedia' => 'integer',
        'stok_minimum' => 'integer',
    ];

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function paket(): BelongsToMany
    {
        return $this->belongsToMany(Paket::class, 'paket_inventaris')
            ->withPivot('qty')
            ->withTimestamps();
    }

    public function transaksi(): HasMany
    {
        return $this->hasMany(InventarisTransaksi::class, 'inventaris_id');
    }
}
