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
        Schema::table('jamaah', function (Blueprint $table) {
            $table->string('kode_pendaftaran', 60)->nullable()->unique()->after('id');
        });

        // Backfill existing rows with unique booking registration tokens
        $jamaahs = DB::table('jamaah')->select('id', 'created_at')->get();
        foreach ($jamaahs as $j) {
            $date = $j->created_at ? new DateTime($j->created_at) : new DateTime;
            $period = $date->format('Ym');
            $paddedId = str_pad((string) $j->id, 5, '0', STR_PAD_LEFT);
            $hash = strtoupper(substr(md5($j->id.'_secure_salt_jamaah_'.$j->created_at), 0, 6));
            $bookingCode = "REG-{$period}{$paddedId}-{$hash}";

            DB::table('jamaah')->where('id', $j->id)->update([
                'kode_pendaftaran' => $bookingCode,
            ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('jamaah', function (Blueprint $table) {
            $table->dropColumn('kode_pendaftaran');
        });
    }
};
