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
        Schema::table('users', function (Blueprint $table) {
            $table->string('nik', 30)->nullable()->after('name');
            $table->text('alamat')->nullable()->after('kota');
            $table->string('status_karyawan', 30)->default('aktif')->after('role'); // aktif, non_aktif, tetap, kontrak
            $table->string('nama_bank', 50)->nullable()->after('alamat'); // BCA, Mandiri, BSI, BRI, BNI, dll
            $table->string('nomor_rekening', 50)->nullable()->after('nama_bank');
            $table->string('atas_nama_rekening', 150)->nullable()->after('nomor_rekening');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'nik',
                'alamat',
                'status_karyawan',
                'nama_bank',
                'nomor_rekening',
                'atas_nama_rekening',
            ]);
        });
    }
};
