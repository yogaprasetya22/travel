<?php

namespace App\Models;

use App\Enums\HierarchyRank;
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
 * @property int|null $hierarchy_level_id
 * @property string $name
 * @property string $email
 * @property string $password
 * @property string $role
 * @property string|null $jabatan
 * @property int|null $created_by
 * @property Carbon|null $email_verified_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read int $level
 * @property-read string $level_label
 * @property-read string $level_badge
 * @property-read Tenant|null $tenant
 * @property-read HierarchyLevel|null $hierarchyLevel
 */
#[Fillable(['name', 'email', 'password', 'tenant_id', 'hierarchy_level_id', 'role', 'jabatan', 'created_by'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The accessors to append to the model's array form.
     *
     * @var array<int, string>
     */
    protected $appends = [
        'level',
        'level_label',
        'level_badge',
    ];

    /**
     * Accessor for Integer Hierarchy Level (Rank 0 = Super Admin, 1 = Owner, 2 = Supervisor, 3 = Team Leader, 4 = Staff/Agen).
     */
    public function getLevelAttribute(): int
    {
        if ($this->role === 'super_admin_master') {
            return HierarchyRank::SUPER_ADMIN->value; // 0
        }

        if ($this->hierarchy_level_id && $this->relationLoaded('hierarchyLevel') && $this->hierarchyLevel) {
            return (int) $this->hierarchyLevel->urutan;
        }

        if ($this->hierarchy_level_id) {
            $lvl = HierarchyLevel::find($this->hierarchy_level_id);
            if ($lvl) {
                return (int) $lvl->urutan;
            }
        }

        // Fallback mapping based on legacy role
        return match ($this->role) {
            'owner_travel' => HierarchyRank::OWNER->value,
            'admin_travel' => match ($this->jabatan) {
                'Team Leader' => HierarchyRank::TEAM_LEADER->value,
                default => HierarchyRank::SUPERVISOR->value,
            },
            default => HierarchyRank::STAFF_AGEN->value,
        };
    }

    /**
     * Accessor for Human-Readable Level Label.
     */
    public function getLevelLabelAttribute(): string
    {
        if ($this->level === 0) {
            return 'Level 0 (Super Admin Master)';
        }

        $jabatanName = $this->jabatan ?: $this->hierarchyLevel?->nama_level;
        if (! $jabatanName) {
            $jabatanName = HierarchyRank::fromLevel($this->level)->label();
        }

        return "Level {$this->level} ({$jabatanName})";
    }

    /**
     * Accessor for Level Badge Styling.
     */
    public function getLevelBadgeAttribute(): string
    {
        return HierarchyRank::fromLevel($this->level)->badgeClass();
    }

    /**
     * Check if user is Super Admin Master (Level 0).
     */
    public function isSuperAdmin(): bool
    {
        return $this->level === HierarchyRank::SUPER_ADMIN->value;
    }

    /**
     * Check if user is Travel Owner (Level 1).
     */
    public function isOwner(): bool
    {
        return $this->level === HierarchyRank::OWNER->value;
    }

    /**
     * Cumulative hierarchical check: Returns true if user's level rank is at least the given rank.
     * (e.g. Level 0 and Level 1 are both at least Level 2 Supervisor).
     */
    public function isAtLeast(int|HierarchyRank $rank): bool
    {
        $targetRank = $rank instanceof HierarchyRank ? $rank->value : $rank;

        return $this->level <= $targetRank;
    }

    /**
     * Check if user has administrative rights to manage the tenant.
     */
    public function canManageTenant(): bool
    {
        return $this->level <= HierarchyRank::OWNER->value;
    }

    /**
     * Hierarchical user management check: User can only manage/edit subordinates (higher level integer).
     */
    public function canManageUser(self $targetUser): bool
    {
        if ($this->isSuperAdmin()) {
            return true;
        }

        if ($this->tenant_id !== $targetUser->tenant_id) {
            return false;
        }

        return $this->level < $targetUser->level;
    }

    /**
     * Get all downline user IDs recursively (bawah-bawahannya).
     * Level 0: All users in system.
     * Level 1: All users in current tenant (excluding self).
     * Level 2+: All users recursively under this user's lineage (excluding superiors/peers).
     *
     * @return array<int>
     */
    public function getDownlineUserIds(): array
    {
        if ($this->isSuperAdmin()) {
            return self::pluck('id')->toArray();
        }

        if ($this->isOwner()) {
            return self::where('tenant_id', $this->tenant_id)
                ->where('id', '!=', $this->id)
                ->pluck('id')
                ->toArray();
        }

        // Recursive tree descent via created_by
        $allDownlineIds = [];
        $currentParentIds = [$this->id];

        while (! empty($currentParentIds)) {
            $nextLevelIds = self::whereIn('created_by', $currentParentIds)
                ->where('tenant_id', $this->tenant_id)
                ->pluck('id')
                ->toArray();

            $newIds = array_diff($nextLevelIds, $allDownlineIds);
            if (empty($newIds)) {
                break;
            }

            $allDownlineIds = array_merge($allDownlineIds, $newIds);
            $currentParentIds = $newIds;
        }

        // If tree is not strictly linked by created_by, fallback to all users in tenant with strictly lower rank (higher level number)
        if (empty($allDownlineIds)) {
            $allDownlineIds = self::where('tenant_id', $this->tenant_id)
                ->where('id', '!=', $this->id)
                ->where(function ($q) {
                    $q->whereHas('hierarchyLevel', fn ($h) => $h->where('urutan', '>', $this->level));
                })
                ->pluck('id')
                ->toArray();
        }

        return array_values(array_unique($allDownlineIds));
    }

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
