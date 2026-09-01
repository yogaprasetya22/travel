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
        Schema::table('tenants', function (Blueprint $table) {
            $table->dropColumn(['theme_primary', 'theme_bg']);
            $table->string('theme_name')->nullable()->default('coffee')->after('alamat');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tenants', function (Blueprint $table) {
            $table->dropColumn('theme_name');
            $table->string('theme_primary')->nullable()->after('alamat');
            $table->string('theme_bg')->nullable()->after('theme_primary');
        });
    }
};
