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
        Schema::create('penerbangan', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->string('maskapai');
            $table->string('nomor_penerbangan');
            $table->string('bandara_asal');
            $table->string('bandara_tujuan');
            $table->dateTime('waktu_berangkat')->nullable();
            $table->dateTime('waktu_tiba')->nullable();
            $table->decimal('harga', 15, 2)->nullable();
            $table->string('sumber')->default('manual');
            $table->string('sumber_ref')->nullable();
            $table->string('sumber_url')->nullable();
            $table->timestamps();

            $table->unique(['tenant_id', 'sumber', 'sumber_ref']);
        });

        Schema::create('hotel', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->string('nama');
            $table->string('kota');
            $table->unsignedTinyInteger('bintang')->nullable();
            $table->string('alamat')->nullable();
            $table->unsignedInteger('jarak_ke_masjid')->nullable();
            $table->decimal('harga_per_malam', 15, 2)->nullable();
            $table->string('sumber')->default('manual');
            $table->string('sumber_ref')->nullable();
            $table->string('sumber_url')->nullable();
            $table->timestamps();

            $table->unique(['tenant_id', 'sumber', 'sumber_ref']);
        });

        Schema::create('keberangkatan', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignId('paket_id')->nullable()->constrained('paket')->nullOnDelete();
            $table->string('kode');
            $table->date('tanggal_berangkat');
            $table->date('tanggal_pulang');
            $table->string('status')->default('Draft');
            $table->unsignedInteger('kuota')->nullable();
            $table->string('muthawwif')->nullable();
            $table->string('tour_leader')->nullable();
            $table->string('transportasi')->nullable();
            $table->text('catatan')->nullable();
            $table->timestamps();

            $table->unique(['tenant_id', 'kode']);
        });

        Schema::create('keberangkatan_penerbangan', function (Blueprint $table) {
            $table->id();
            $table->foreignId('keberangkatan_id')->constrained('keberangkatan')->cascadeOnDelete();
            $table->foreignId('penerbangan_id')->constrained('penerbangan')->cascadeOnDelete();
            $table->string('arah')->default('pergi');
            $table->unique(['keberangkatan_id', 'penerbangan_id']);
        });

        Schema::create('keberangkatan_hotel', function (Blueprint $table) {
            $table->id();
            $table->foreignId('keberangkatan_id')->constrained('keberangkatan')->cascadeOnDelete();
            $table->foreignId('hotel_id')->constrained('hotel')->cascadeOnDelete();
            $table->date('check_in')->nullable();
            $table->date('check_out')->nullable();
            $table->unique(['keberangkatan_id', 'hotel_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('keberangkatan_hotel');
        Schema::dropIfExists('keberangkatan_penerbangan');
        Schema::dropIfExists('keberangkatan');
        Schema::dropIfExists('hotel');
        Schema::dropIfExists('penerbangan');
    }
};
