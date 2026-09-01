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
        Schema::table('crm_stages', function (Blueprint $table) {
            $table->date('periode_mulai')->nullable()->after('urutan');
            $table->date('periode_selesai')->nullable()->after('periode_mulai');
            $table->boolean('is_active')->default(true)->after('periode_selesai');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('crm_stages', function (Blueprint $table) {
            $table->dropColumn(['periode_mulai', 'periode_selesai', 'is_active']);
        });
    }
};
