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
            DB::statement('ALTER TABLE pembayaran DROP CONSTRAINT IF EXISTS pembayaran_tipe_pembayaran_check;');
            DB::statement("ALTER TABLE pembayaran ADD CONSTRAINT pembayaran_tipe_pembayaran_check CHECK (tipe_pembayaran::text = ANY (ARRAY['DP'::character varying, 'Cicilan'::character varying, 'Pelunasan'::character varying, 'Lunas'::character varying, 'Tambahan'::character varying]::text[]));");
        } else {
            Schema::table('pembayaran', function (Blueprint $table) {
                $table->string('tipe_pembayaran', 50)->change();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (DB::getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE pembayaran DROP CONSTRAINT IF EXISTS pembayaran_tipe_pembayaran_check;');
            DB::statement("ALTER TABLE pembayaran ADD CONSTRAINT pembayaran_tipe_pembayaran_check CHECK (tipe_pembayaran::text = ANY (ARRAY['DP'::character varying, 'Cicilan'::character varying, 'Lunas'::character varying]::text[]));");
        }
    }
};
