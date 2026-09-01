<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('jamaah', function (Blueprint $table) {
            $table->date('tanggal_keberangkatan')->nullable()->after('paket_id');
            $table->string('nomor_paspor')->nullable()->after('nik');
            $table->enum('status_logistik', ['Pending', 'Ready_to_Pickup', 'Handed_Over'])->default('Pending')->after('catatan_admin');
            $table->timestamp('tanggal_serah_terima_logistik')->nullable()->after('status_logistik');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('jamaah', function (Blueprint $table) {
            $table->dropColumn([
                'tanggal_keberangkatan',
                'nomor_paspor',
                'status_logistik',
                'tanggal_serah_terima_logistik',
            ]);
        });
    }
};
