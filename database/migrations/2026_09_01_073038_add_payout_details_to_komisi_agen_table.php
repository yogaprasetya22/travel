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
        Schema::table('komisi_agen', function (Blueprint $table) {
            $table->string('nomor_referensi')->nullable()->after('status_pencairan');
            $table->string('metode_pembayaran')->nullable()->after('nomor_referensi');
            $table->text('catatan_pencairan')->nullable()->after('metode_pembayaran');
            $table->timestamp('tanggal_pencairan')->nullable()->after('catatan_pencairan');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('komisi_agen', function (Blueprint $table) {
            $table->dropColumn(['nomor_referensi', 'metode_pembayaran', 'catatan_pencairan', 'tanggal_pencairan']);
        });
    }
};
