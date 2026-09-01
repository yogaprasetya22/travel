<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int|null $tenant_id
 * @property string $name
 * @property string $email
 * @property string $password
 * @property string $role
 * @property Carbon|null $email_verified_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Tenant|null $tenant
 */
#[Fillable(['name', 'email', 'password', 'tenant_id', 'hierarchy_level_id', 'role', 'jabatan', 'created_by'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * Get active tenant ID for current user (handles super admin active session).
     */
    public function getActiveTenantId(): int
    {
        if ($this->getRawOriginal('tenant_id')) {
            return (int) $this->getRawOriginal('tenant_id');
        }

        if (app()->bound('tenant')) {
            return (int) app('tenant')->id;
        }

        if (request()->hasSession() && request()->session()->has('tenant_id')) {
            return (int) request()->session()->get('tenant_id');
        }

        return (int) (Tenant::first()?->id ?? 1);
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function hierarchyLevel(): BelongsTo
    {
        return $this->belongsTo(HierarchyLevel::class, 'hierarchy_level_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function createdUsers(): HasMany
    {
        return $this->hasMany(User::class, 'created_by');
    }

    public function jamaah(): HasMany
    {
        return $this->hasMany(Jamaah::class, 'agen_id');
    }

    public function overrideKomisi(): HasMany
    {
        return $this->hasMany(OverrideKomisiAgen::class, 'agen_id');
    }

    public function komisi(): HasMany
    {
        return $this->hasMany(KomisiAgen::class, 'agen_id');
    }
}
