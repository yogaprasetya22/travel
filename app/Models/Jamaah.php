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
 * @property int|null $agen_id
 * @property int $crm_stage_id
 * @property string $nama_lengkap
 * @property string|null $nik
 * @property string $no_hp
 * @property string|null $email
 * @property int $paket_id
 * @property string|null $catatan_admin
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Tenant $tenant
 * @property-read User|null $agen
 * @property-read CrmStage $crmStage
 * @property-read Paket $paket
 */
class Jamaah extends Model
{
    use BelongsToTenant, HasFactory;

    protected $table = 'jamaah';

    protected $fillable = [
        'tenant_id',
        'agen_id',
        'crm_stage_id',
        'nama_lengkap',
        'nik',
        'nomor_paspor',
        'no_hp',
        'email',
        'paket_id',
        'tanggal_keberangkatan',
        'status_logistik',
        'tanggal_serah_terima_logistik',
        'catatan_admin',
    ];

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function agen(): BelongsTo
    {
        return $this->belongsTo(User::class, 'agen_id');
    }

    public function crmStage(): BelongsTo
    {
        return $this->belongsTo(CrmStage::class, 'crm_stage_id');
    }

    public function paket(): BelongsTo
    {
        return $this->belongsTo(Paket::class);
    }

    public function pembayaran(): HasMany
    {
        return $this->hasMany(Pembayaran::class);
    }

    public function komisiAgen(): HasMany
    {
        return $this->hasMany(KomisiAgen::class);
    }

    public function inventarisTransaksi(): HasMany
    {
        return $this->hasMany(InventarisTransaksi::class);
    }
}
