<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $tenant_id
 * @property int|null $paket_id
 * @property string $kode
 * @property Carbon $tanggal_berangkat
 * @property Carbon $tanggal_pulang
 * @property string $status
 * @property int|null $kuota
 * @property string|null $muthawwif
 * @property string|null $tour_leader
 * @property string|null $transportasi
 * @property string|null $catatan
 * @property-read Paket|null $paket
 */
class Keberangkatan extends Model
{
    use BelongsToTenant, HasFactory;

    public const STATUSES = ['Draft', 'Terbuka', 'Penuh', 'Berangkat', 'Selesai'];

    protected $table = 'keberangkatan';

    protected $fillable = [
        'tenant_id',
        'paket_id',
        'kode',
        'tanggal_berangkat',
        'tanggal_pulang',
        'status',
        'kuota',
        'muthawwif',
        'tour_leader',
        'transportasi',
        'catatan',
    ];

    protected $casts = [
        'tanggal_berangkat' => 'date:Y-m-d',
        'tanggal_pulang' => 'date:Y-m-d',
        'kuota' => 'integer',
    ];

    public function paket(): BelongsTo
    {
        return $this->belongsTo(Paket::class);
    }

    public function penerbangan(): BelongsToMany
    {
        return $this->belongsToMany(Penerbangan::class, 'keberangkatan_penerbangan')->withPivot('arah');
    }

    public function hotel(): BelongsToMany
    {
        return $this->belongsToMany(Hotel::class, 'keberangkatan_hotel')->withPivot('check_in', 'check_out');
    }
}
