<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

/**
 * @property int $id
 * @property string|null $kode_pendaftaran
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
        'kode_pendaftaran',
        'tenant_id',
        'agen_id',
        'crm_stage_id',
        'nama_lengkap',
        'jenis_kelamin',
        'tempat_lahir',
        'tanggal_lahir',
        'nik',
        'alamat_ktp',
        'alamat_domisili',
        'golongan_darah',
        'status_pernikahan',
        'riwayat_penyakit',
        'kontak_darurat_nama',
        'kontak_darurat_hp',
        'kontak_darurat_hubungan',
        'nomor_paspor',
        'no_hp',
        'email',
        'paket_id',
        'tanggal_keberangkatan',
        'status_logistik',
        'tanggal_serah_terima_logistik',
        'no_resi_logistik',
        'ekspedisi_logistik',
        'tanggal_kirim_logistik',
        'catatan_admin',
    ];

    protected $casts = [
        'tanggal_lahir' => 'date',
        'tanggal_keberangkatan' => 'date',
        'tanggal_serah_terima_logistik' => 'datetime',
        'tanggal_kirim_logistik' => 'datetime',
    ];

    protected static function booted(): void
    {
        static::creating(function (Jamaah $jamaah) {
            if (empty($jamaah->kode_pendaftaran)) {
                $period = now()->format('Ym');
                $randomSuffix = strtoupper(Str::random(6));
                $randomDigits = str_pad((string) mt_rand(1, 99999), 5, '0', STR_PAD_LEFT);
                $jamaah->kode_pendaftaran = "REG-{$period}{$randomDigits}-{$randomSuffix}";
            }
        });
    }

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

    public function documents(): HasMany
    {
        return $this->hasMany(JamaahDocument::class);
    }

    public function itemDistributions(): HasMany
    {
        return $this->hasMany(ItemDistribution::class);
    }

    public function komisiAgen(): HasMany
    {
        return $this->hasMany(KomisiAgen::class);
    }

    public function inventarisTransaksi(): HasMany
    {
        return $this->hasMany(InventarisTransaksi::class);
    }

    public function stageLogs(): HasMany
    {
        return $this->hasMany(CrmStageLog::class)->orderBy('created_at', 'desc');
    }

    public function scopeFilterDateRange($query, ?string $field, ?string $startDate, ?string $endDate)
    {
        if (! $field || (! $startDate && ! $endDate)) {
            return $query;
        }

        $column = match ($field) {
            'keberangkatan' => 'tanggal_keberangkatan',
            default => 'created_at',
        };

        if ($startDate && $endDate) {
            return $query->whereBetween($column, [$startDate.' 00:00:00', $endDate.' 23:59:59']);
        } elseif ($startDate) {
            return $query->where($column, '>=', $startDate.' 00:00:00');
        } elseif ($endDate) {
            return $query->where($column, '<=', $endDate.' 23:59:59');
        }

        return $query;
    }

    public function scopeFilterPaymentProgress($query, ?string $progress)
    {
        if (! $progress || $progress === 'all') {
            return $query;
        }

        return match ($progress) {
            'unpaid' => $query->whereDoesntHave('pembayaran', fn ($q) => $q->where('status_verifikasi', 'Verified')),
            'dp' => $query->whereHas('pembayaran', fn ($q) => $q->where('status_verifikasi', 'Verified')->where('tipe_pembayaran', 'DP'))
                ->whereDoesntHave('pembayaran', fn ($q) => $q->where('status_verifikasi', 'Verified')->whereIn('tipe_pembayaran', ['Cicilan', 'Lunas'])),
            'installment' => $query->whereHas('pembayaran', fn ($q) => $q->where('status_verifikasi', 'Verified')->where('tipe_pembayaran', 'Cicilan')),
            'paid' => $query->whereHas('pembayaran', fn ($q) => $q->where('status_verifikasi', 'Verified')->where('tipe_pembayaran', 'Lunas')),
            default => $query,
        };
    }
}
