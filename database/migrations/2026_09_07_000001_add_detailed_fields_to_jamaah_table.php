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
            $table->string('jenis_kelamin', 20)->nullable()->after('nama_lengkap');
            $table->string('tempat_lahir')->nullable()->after('jenis_kelamin');
            $table->date('tanggal_lahir')->nullable()->after('tempat_lahir');
            $table->text('alamat_ktp')->nullable()->after('nik');
            $table->text('alamat_domisili')->nullable()->after('alamat_ktp');
            $table->string('golongan_darah', 10)->nullable()->after('alamat_domisili');
            $table->string('status_pernikahan', 30)->nullable()->after('golongan_darah');
            $table->text('riwayat_penyakit')->nullable()->after('status_pernikahan');
            $table->string('kontak_darurat_nama')->nullable()->after('riwayat_penyakit');
            $table->string('kontak_darurat_hp', 30)->nullable()->after('kontak_darurat_nama');
            $table->string('kontak_darurat_hubungan', 50)->nullable()->after('kontak_darurat_hp');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('jamaah', function (Blueprint $table) {
            $table->dropColumn([
                'jenis_kelamin',
                'tempat_lahir',
                'tanggal_lahir',
                'alamat_ktp',
                'alamat_domisili',
                'golongan_darah',
                'status_pernikahan',
                'riwayat_penyakit',
                'kontak_darurat_nama',
                'kontak_darurat_hp',
                'kontak_darurat_hubungan',
            ]);
        });
    }
};
