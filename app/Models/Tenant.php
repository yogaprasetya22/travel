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
 * @property string|null $no_telepon
 * @property string|null $theme_name
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read string $public_url
 * @property-read Collection|User[] $users
 */
class Tenant extends Model
{
    use HasFactory;

    protected $fillable = [
        'nama_travel',
        'domain_atau_subdomain',
        'logo',
        'no_telepon',
        'theme_name',
        'is_docs_enabled',
        'landing_config',
    ];

    protected $casts = [
        'is_docs_enabled' => 'boolean',
        'landing_config' => 'array',
    ];

    protected $appends = ['public_url'];

    /**
     * Label host yang berarti "host dasar", bukan nama tenant.
     *
     * @var array<int, string>
     */
    private const RESERVED_LABELS = ['localhost', 'travel', 'app', 'www', '127'];

    /**
     * Host dasar (tanpa subdomain tenant) milik aplikasi, dari APP_URL.
     */
    public static function baseHost(): string
    {
        return parse_url((string) config('app.url'), PHP_URL_HOST) ?: 'localhost';
    }

    /**
     * Apakah host ini host dasar atau alamat IP, yaitu tidak menunjuk tenant tertentu.
     */
    public static function isBaseHost(string $host): bool
    {
        return in_array(explode('.', $host)[0], self::RESERVED_LABELS, true)
            || filter_var($host, FILTER_VALIDATE_IP) !== false
            || $host === self::baseHost();
    }

    /**
     * Tenant yang ditunjuk subdomain pada host, atau null bila host dasar / tidak dikenal.
     */
    public static function fromHost(string $host): ?self
    {
        if (self::isBaseHost($host)) {
            return null;
        }

        return static::where('domain_atau_subdomain', explode('.', $host)[0])->first();
    }

    /**
     * Tenant default untuk host dasar.
     */
    public static function default(): ?self
    {
        return static::where('domain_atau_subdomain', config('app.default_tenant'))->first()
            ?? static::oldest('id')->first();
    }

    /**
     * URL publik tenant: host dasar untuk tenant default, selain itu {subdomain}.{host dasar}.
     */
    public function getPublicUrlAttribute(): string
    {
        $parts = parse_url((string) config('app.url')) + ['scheme' => 'http', 'host' => 'localhost'];
        $port = isset($parts['port']) ? ':'.$parts['port'] : '';

        if ($this->domain_atau_subdomain === config('app.default_tenant')) {
            return "{$parts['scheme']}://{$parts['host']}{$port}";
        }

        return "{$parts['scheme']}://{$this->domain_atau_subdomain}.{$parts['host']}{$port}";
    }

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
