<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

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
        'nomor_referensi',
        'metode_pembayaran',
        'catatan_pencairan',
        'tanggal_pencairan',
    ];

    protected $casts = [
        'nominal_komisi' => 'float',
        'tanggal_pencairan' => 'datetime',
    ];

    protected static function booted(): void
    {
        static::creating(function (KomisiAgen $komisi) {
            if (empty($komisi->nomor_referensi)) {
                $period = now()->format('Ym');
                $randomSuffix = strtoupper(Str::random(6));
                $randomDigits = str_pad((string) mt_rand(1, 99999), 5, '0', STR_PAD_LEFT);
                $komisi->nomor_referensi = "COMM-{$period}{$randomDigits}-{$randomSuffix}";
            }
        });
    }

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
