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
        Schema::table('inventaris', function (Blueprint $table) {
            $table->string('sku')->nullable()->after('tenant_id');
            $table->string('kategori')->default('Perlengkapan')->after('nama_barang');
            $table->string('satuan')->default('Pcs')->after('kategori');
            $table->decimal('harga_pokok', 15, 2)->default(0)->after('satuan');
            $table->string('lokasi_rak')->nullable()->after('stok_minimum');
        });

        Schema::table('inventaris_transaksi', function (Blueprint $table) {
            $table->string('alasan')->nullable()->after('tipe');
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null')->after('alasan');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('inventaris_transaksi', function (Blueprint $table) {
            $table->dropForeign(['created_by']);
            $table->dropColumn(['alasan', 'created_by']);
        });

        Schema::table('inventaris', function (Blueprint $table) {
            $table->dropColumn(['sku', 'kategori', 'satuan', 'harga_pokok', 'lokasi_rak']);
        });
    }
};
