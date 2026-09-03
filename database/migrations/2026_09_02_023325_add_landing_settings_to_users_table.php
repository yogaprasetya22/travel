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
            $table->string('avatar')->nullable()->after('email');
            $table->string('no_hp')->nullable()->after('jabatan');
            $table->string('kota')->nullable()->after('no_hp');
            $table->json('landing_links')->nullable()->after('bio');
            $table->json('social_links')->nullable()->after('landing_links');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['avatar', 'no_hp', 'kota', 'landing_links', 'social_links']);
        });
    }
};
