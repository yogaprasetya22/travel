<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (DB::getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE jamaah DROP CONSTRAINT IF EXISTS jamaah_status_logistik_check');
            DB::statement('ALTER TABLE item_distributions DROP CONSTRAINT IF EXISTS item_distributions_status_check');
        }

        Schema::table('jamaah', function (Blueprint $table) {
            $table->string('status_logistik', 50)->default('Pending')->change();
            $table->string('no_resi_logistik')->nullable()->after('tanggal_serah_terima_logistik');
            $table->string('ekspedisi_logistik')->nullable()->after('no_resi_logistik');
            $table->timestamp('tanggal_kirim_logistik')->nullable()->after('ekspedisi_logistik');
        });

        Schema::table('item_distributions', function (Blueprint $table) {
            $table->string('status', 50)->default('Pending')->change();
            $table->timestamp('shipped_at')->nullable()->after('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('jamaah', function (Blueprint $table) {
            $table->dropColumn(['no_resi_logistik', 'ekspedisi_logistik', 'tanggal_kirim_logistik']);
        });

        Schema::table('item_distributions', function (Blueprint $table) {
            $table->dropColumn(['shipped_at']);
        });
    }
};
