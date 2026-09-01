<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property int $tenant_id
 * @property int|null $parent_id
 * @property string $nama_level
 * @property string $role_key
 * @property string|null $deskripsi
 * @property string|null $wewenang_note
 * @property int $urutan
 * @property-read Tenant $tenant
 * @property-read HierarchyLevel|null $parent
 * @property-read Collection<HierarchyLevel> $children
 * @property-read Collection<User> $users
 */
class HierarchyLevel extends Model
{
    use BelongsToTenant, HasFactory;

    protected $table = 'hierarchy_levels';

    protected $fillable = [
        'tenant_id',
        'parent_id',
        'nama_level',
        'role_key',
        'deskripsi',
        'wewenang_note',
        'urutan',
    ];

    protected $casts = [
        'urutan' => 'integer',
    ];

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(HierarchyLevel::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(HierarchyLevel::class, 'parent_id')->orderBy('urutan');
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class, 'hierarchy_level_id');
    }
}
