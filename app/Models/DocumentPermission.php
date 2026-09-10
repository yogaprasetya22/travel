<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DocumentPermission extends Model
{
    use BelongsToTenant, HasFactory;

    protected $table = 'document_permissions';

    protected $fillable = [
        'tenant_id',
        'role_name',
        'document_type',
        'is_active',
        'can_view',
        'can_upload',
        'can_delete',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'can_view' => 'boolean',
        'can_upload' => 'boolean',
        'can_delete' => 'boolean',
    ];

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }
}
