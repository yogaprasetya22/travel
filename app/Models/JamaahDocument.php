<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class JamaahDocument extends Model
{
    use BelongsToTenant, HasFactory;

    protected $table = 'jamaah_documents';

    protected $fillable = [
        'tenant_id',
        'jamaah_id',
        'type',
        'title',
        'file_path',
        'file_name',
        'mime_type',
        'file_size',
        'notes',
        'uploaded_by',
    ];

    protected $appends = ['url', 'is_image', 'is_pdf'];

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function jamaah(): BelongsTo
    {
        return $this->belongsTo(Jamaah::class);
    }

    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    public function getUrlAttribute(): ?string
    {
        if (! $this->file_path) {
            return null;
        }

        if (str_starts_with($this->file_path, 'http')) {
            return $this->file_path;
        }

        return Storage::url($this->file_path);
    }

    public function getIsImageAttribute(): bool
    {
        return str_starts_with($this->mime_type ?? '', 'image/')
            || in_array(strtolower(pathinfo($this->file_name ?? '', PATHINFO_EXTENSION)), ['jpg', 'jpeg', 'png', 'webp', 'gif']);
    }

    public function getIsPdfAttribute(): bool
    {
        return $this->mime_type === 'application/pdf'
            || strtolower(pathinfo($this->file_name ?? '', PATHINFO_EXTENSION)) === 'pdf';
    }
}
