<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rekening_tenant', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->onDelete('cascade');
            $table->string('nama_bank');
            $table->string('nomor_rekening');
            $table->string('atas_nama');
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['tenant_id', 'is_active']);
        });

        Schema::create('crm_stages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->onDelete('cascade');
            $table->string('nama_tahap');
            $table->integer('urutan');
            $table->timestamps();

            $table->index(['tenant_id', 'urutan']);
        });

        Schema::create('paket', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->onDelete('cascade');
            $table->string('nama_paket');
            $table->decimal('harga', 15, 2);
            $table->decimal('komisi_flat', 15, 2)->default(0);
            $table->decimal('komisi_persentase', 5, 2)->default(0);
            $table->timestamps();

            $table->index('tenant_id');
        });

        Schema::create('inventaris', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->onDelete('cascade');
            $table->string('nama_barang');
            $table->integer('stok_tersedia')->default(0);
            $table->integer('stok_minimum')->default(0);
            $table->timestamps();

            $table->index('tenant_id');
        });

        Schema::create('paket_inventaris', function (Blueprint $table) {
            $table->id();
            $table->foreignId('paket_id')->constrained('paket')->onDelete('cascade');
            $table->foreignId('inventaris_id')->constrained('inventaris')->onDelete('cascade');
            $table->integer('qty');
            $table->timestamps();

            $table->index(['paket_id', 'inventaris_id']);
        });

        Schema::create('override_komisi_agen', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->onDelete('cascade');
            $table->foreignId('paket_id')->constrained('paket')->onDelete('cascade');
            $table->foreignId('agen_id')->constrained('users')->onDelete('cascade');
            $table->decimal('komisi_flat', 15, 2)->nullable();
            $table->decimal('komisi_persentase', 5, 2)->nullable();
            $table->timestamps();

            $table->index(['tenant_id', 'paket_id', 'agen_id'], 'override_komisi_idx');
        });

        Schema::create('jamaah', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->onDelete('cascade');
            $table->foreignId('agen_id')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('crm_stage_id')->constrained('crm_stages')->onDelete('restrict');
            $table->string('nama_lengkap');
            $table->string('nik')->nullable();
            $table->string('no_hp');
            $table->string('email')->nullable();
            $table->foreignId('paket_id')->constrained('paket')->onDelete('restrict');
            $table->text('catatan_admin')->nullable();
            $table->timestamps();

            $table->index(['tenant_id', 'crm_stage_id']);
            $table->index(['tenant_id', 'agen_id']);
        });

        Schema::create('pembayaran', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->onDelete('cascade');
            $table->foreignId('jamaah_id')->constrained('jamaah')->onDelete('cascade');
            $table->foreignId('rekening_tenant_id')->constrained('rekening_tenant')->onDelete('restrict');
            $table->enum('tipe_pembayaran', ['DP', 'Cicilan', 'Lunas']);
            $table->decimal('nominal', 15, 2);
            $table->string('bukti_transfer')->nullable();
            $table->enum('status_verifikasi', ['Pending', 'Verified', 'Rejected'])->default('Pending');
            $table->foreignId('verified_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();

            $table->index(['tenant_id', 'status_verifikasi']);
        });

        Schema::create('komisi_agen', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->onDelete('cascade');
            $table->foreignId('agen_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('jamaah_id')->constrained('jamaah')->onDelete('cascade');
            $table->decimal('nominal_komisi', 15, 2);
            $table->enum('status_pencairan', ['Pending', 'Ready_to_Pay', 'Paid'])->default('Pending');
            $table->timestamps();

            $table->index(['tenant_id', 'agen_id', 'status_pencairan'], 'komisi_agen_idx');
        });

        Schema::create('inventaris_transaksi', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->onDelete('cascade');
            $table->foreignId('inventaris_id')->constrained('inventaris')->onDelete('cascade');
            $table->foreignId('jamaah_id')->nullable()->constrained('jamaah')->onDelete('set null');
            $table->integer('qty');
            $table->enum('tipe', ['IN', 'OUT']);
            $table->timestamps();

            $table->index(['tenant_id', 'inventaris_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inventaris_transaksi');
        Schema::dropIfExists('komisi_agen');
        Schema::dropIfExists('pembayaran');
        Schema::dropIfExists('jamaah');
        Schema::dropIfExists('override_komisi_agen');
        Schema::dropIfExists('paket_inventaris');
        Schema::dropIfExists('inventaris');
        Schema::dropIfExists('paket');
        Schema::dropIfExists('crm_stages');
        Schema::dropIfExists('rekening_tenant');
    }
};
