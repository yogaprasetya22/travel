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
        Schema::table('paket', function (Blueprint $table) {
            $table->integer('kuota')->default(45)->after('harga');
            $table->text('deskripsi')->nullable()->after('kuota');
            $table->string('brosur_image')->nullable()->after('deskripsi');
            $table->json('itinerary')->nullable()->after('brosur_image');
            $table->json('fasilitas')->nullable()->after('itinerary');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('paket', function (Blueprint $table) {
            $table->dropColumn(['kuota', 'deskripsi', 'brosur_image', 'itinerary', 'fasilitas']);
        });
    }
};
