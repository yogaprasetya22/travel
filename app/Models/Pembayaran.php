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
 * @property string|null $nomor_invoice
 * @property int $tenant_id
 * @property int $jamaah_id
 * @property int $rekening_tenant_id
 * @property string $tipe_pembayaran
 * @property float $nominal
 * @property string|null $bukti_transfer
 * @property string $status_verifikasi
 * @property int|null $verified_by
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Tenant $tenant
 * @property-read Jamaah $jamaah
 * @property-read RekeningTenant $rekeningTenant
 * @property-read User|null $verifiedBy
 */
class Pembayaran extends Model
{
    use BelongsToTenant, HasFactory;

    protected $table = 'pembayaran';

    protected $fillable = [
        'nomor_invoice',
        'tenant_id',
        'jamaah_id',
        'rekening_tenant_id',
        'tipe_pembayaran',
        'nominal',
        'bukti_transfer',
        'status_verifikasi',
        'verified_by',
    ];

    protected $casts = [
        'nominal' => 'float',
    ];

    protected static function booted(): void
    {
        static::creating(function (Pembayaran $pembayaran) {
            if (empty($pembayaran->nomor_invoice)) {
                $period = now()->format('Ym');
                $randomSuffix = strtoupper(Str::random(6));
                $randomDigits = str_pad((string) mt_rand(1, 99999), 5, '0', STR_PAD_LEFT);
                $pembayaran->nomor_invoice = "INV-{$period}{$randomDigits}-{$randomSuffix}";
            }
        });
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function jamaah(): BelongsTo
    {
        return $this->belongsTo(Jamaah::class);
    }

    public function rekeningTenant(): BelongsTo
    {
        return $this->belongsTo(RekeningTenant::class, 'rekening_tenant_id');
    }

    public function verifiedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by');
    }
}
