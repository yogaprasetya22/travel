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
        Schema::create('document_permissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->onDelete('cascade');
            $table->string('role_name', 50); // super_admin, admin, leader, agent, staff, jamaah
            $table->string('document_type', 50); // ktp, kk, paspor, visa, tiket, asuransi, siskopatuh, vaksin, other
            $table->boolean('can_view')->default(true);
            $table->boolean('can_upload')->default(true);
            $table->boolean('can_delete')->default(false);
            $table->timestamps();

            $table->unique(['tenant_id', 'role_name', 'document_type'], 'tenant_role_doc_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('document_permissions');
    }
};
