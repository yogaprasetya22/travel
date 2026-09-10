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
        Schema::table('pembayaran', function (Blueprint $table) {
            $table->string('nomor_invoice', 60)->nullable()->unique()->after('id');
        });

        // Backfill existing rows with unique secure invoice numbers
        $pembayarans = DB::table('pembayaran')->select('id', 'created_at')->get();
        foreach ($pembayarans as $p) {
            $date = $p->created_at ? new DateTime($p->created_at) : new DateTime;
            $period = $date->format('Ym');
            $paddedId = str_pad((string) $p->id, 5, '0', STR_PAD_LEFT);
            $hash = strtoupper(substr(md5($p->id.'_secure_salt_inv_'.$p->created_at), 0, 6));
            $invoiceNumber = "INV-{$period}{$paddedId}-{$hash}";

            DB::table('pembayaran')->where('id', $p->id)->update([
                'nomor_invoice' => $invoiceNumber,
            ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pembayaran', function (Blueprint $table) {
            $table->dropColumn('nomor_invoice');
        });
    }
};
