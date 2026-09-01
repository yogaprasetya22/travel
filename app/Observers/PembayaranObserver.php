<?php

namespace App\Observers;

use App\Models\CrmStage;
use App\Models\InventarisTransaksi;
use App\Models\KomisiAgen;
use App\Models\OverrideKomisiAgen;
use App\Models\Pembayaran;

class PembayaranObserver
{
    /**
     * Handle the Pembayaran "updated" event.
     */
    public function updated(Pembayaran $pembayaran): void
    {
        // Check if verification status changed to Verified
        if ($pembayaran->isDirty('status_verifikasi') && $pembayaran->status_verifikasi === 'Verified') {
            $jamaah = $pembayaran->jamaah;
            if (! $jamaah) {
                return;
            }

            // 1. AUTO-DEDUCT INVENTORY
            // Check if inventory has already been deducted for this jamaah
            $alreadyDeducted = InventarisTransaksi::where('jamaah_id', $jamaah->id)
                ->where('tipe', 'OUT')
                ->exists();

            if (! $alreadyDeducted) {
                $paket = $jamaah->paket;
                if ($paket) {
                    foreach ($paket->inventaris as $item) {
                        $qtyToDeduct = $item->pivot->qty;

                        // Deduct stock available
                        $item->decrement('stok_tersedia', $qtyToDeduct);

                        // Log transaction OUT
                        InventarisTransaksi::create([
                            'tenant_id' => $pembayaran->tenant_id,
                            'inventaris_id' => $item->id,
                            'jamaah_id' => $jamaah->id,
                            'qty' => $qtyToDeduct,
                            'tipe' => 'OUT',
                        ]);
                    }

                    $jamaah->update([
                        'status_logistik' => 'Ready_to_Pickup',
                    ]);
                }
            }

            // 2. AUTO-COMMISSION FOR AGENTS
            if ($jamaah->agen_id) {
                // Check if commission was already created
                $commissionExists = KomisiAgen::where('jamaah_id', $jamaah->id)->exists();

                if (! $commissionExists) {
                    $paket = $jamaah->paket;
                    $commissionAmount = 0;

                    // Check for override commission first
                    $override = OverrideKomisiAgen::where('tenant_id', $pembayaran->tenant_id)
                        ->where('paket_id', $jamaah->paket_id)
                        ->where('agen_id', $jamaah->agen_id)
                        ->first();

                    if ($override) {
                        if ($override->komisi_flat !== null && $override->komisi_flat > 0) {
                            $commissionAmount = $override->komisi_flat;
                        } elseif ($override->komisi_persentase !== null && $override->komisi_persentase > 0) {
                            $commissionAmount = $paket->harga * ($override->komisi_persentase / 100);
                        }
                    } else {
                        // Fallback to package standard commission
                        if ($paket->komisi_flat > 0) {
                            $commissionAmount = $paket->komisi_flat;
                        } elseif ($paket->komisi_persentase > 0) {
                            $commissionAmount = $paket->harga * ($paket->komisi_persentase / 100);
                        }
                    }

                    if ($commissionAmount > 0) {
                        KomisiAgen::create([
                            'tenant_id' => $pembayaran->tenant_id,
                            'agen_id' => $jamaah->agen_id,
                            'jamaah_id' => $jamaah->id,
                            'nominal_komisi' => $commissionAmount,
                            'status_pencairan' => 'Ready_to_Pay',
                        ]);
                    }
                }
            }

            // 3. AUTO-UPDATE CRM STAGE
            // Move stage to the stage containing 'Closing' or 'DP Paid' or the highest sequence stage.
            $targetStage = CrmStage::where('tenant_id', $pembayaran->tenant_id)
                ->where(function ($q) {
                    $q->where('nama_tahap', 'like', '%Closing%')
                        ->orWhere('nama_tahap', 'like', '%DP Paid%');
                })->first();

            if (! $targetStage) {
                $targetStage = CrmStage::where('tenant_id', $pembayaran->tenant_id)
                    ->orderBy('urutan', 'desc')
                    ->first();
            }

            if ($targetStage) {
                $jamaah->update([
                    'crm_stage_id' => $targetStage->id,
                ]);
            }
        }
    }
}
