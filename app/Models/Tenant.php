<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $nama_travel
 * @property string $domain_atau_subdomain
 * @property string|null $logo
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Collection|User[] $users
 */
class Tenant extends Model
{
    use HasFactory;

    protected $fillable = [
        'nama_travel',
        'domain_atau_subdomain',
        'logo',
        'theme_name',
    ];

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function rekeningTenants(): HasMany
    {
        return $this->hasMany(RekeningTenant::class)->withoutGlobalScope('tenant');
    }

    public function crmStages(): HasMany
    {
        return $this->hasMany(CrmStage::class)->withoutGlobalScope('tenant');
    }

    public function paket(): HasMany
    {
        return $this->hasMany(Paket::class)->withoutGlobalScope('tenant');
    }

    public function inventaris(): HasMany
    {
        return $this->hasMany(Inventaris::class)->withoutGlobalScope('tenant');
    }

    public function overrideKomisi(): HasMany
    {
        return $this->hasMany(OverrideKomisiAgen::class)->withoutGlobalScope('tenant');
    }

    public function jamaah(): HasMany
    {
        return $this->hasMany(Jamaah::class)->withoutGlobalScope('tenant');
    }

    public function pembayaran(): HasMany
    {
        return $this->hasMany(Pembayaran::class)->withoutGlobalScope('tenant');
    }

    public function komisiAgen(): HasMany
    {
        return $this->hasMany(KomisiAgen::class)->withoutGlobalScope('tenant');
    }

    public function inventarisTransaksi(): HasMany
    {
        return $this->hasMany(InventarisTransaksi::class)->withoutGlobalScope('tenant');
    }
}
