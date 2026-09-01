<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CrmStageLog extends Model
{
    use HasFactory;

    protected $table = 'crm_stage_logs';

    protected $fillable = [
        'tenant_id',
        'jamaah_id',
        'user_id',
        'from_stage_id',
        'to_stage_id',
        'catatan',
    ];

    /**
     * Get the tenant that owns the log.
     */
    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    /**
     * Get the jamaah that this log belongs to.
     */
    public function jamaah(): BelongsTo
    {
        return $this->belongsTo(Jamaah::class);
    }

    /**
     * Get the user who made the stage transition.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the source stage.
     */
    public function fromStage(): BelongsTo
    {
        return $this->belongsTo(CrmStage::class, 'from_stage_id');
    }

    /**
     * Get the target stage.
     */
    public function toStage(): BelongsTo
    {
        return $this->belongsTo(CrmStage::class, 'to_stage_id');
    }
}
