<?php

use App\Models\Tenant;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('hierarchy_levels', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->onDelete('cascade');
            $table->foreignId('parent_id')->nullable()->constrained('hierarchy_levels')->onDelete('set null');
            $table->string('nama_level');
            $table->string('role_key')->default('agen'); // 'owner_travel' | 'admin_travel' | 'agen'
            $table->text('deskripsi')->nullable();
            $table->text('wewenang_note')->nullable();
            $table->integer('urutan')->default(1);
            $table->timestamps();

            $table->index(['tenant_id', 'parent_id']);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('hierarchy_level_id')->nullable()->after('tenant_id')->constrained('hierarchy_levels')->onDelete('set null');
        });

        // Populate initial default hierarchy levels for all existing tenants and link users
        $tenants = DB::table('tenants')->get();
        foreach ($tenants as $tenant) {
            $ownerLevelId = DB::table('hierarchy_levels')->insertGetId([
                'tenant_id' => $tenant->id,
                'parent_id' => null,
                'nama_level' => 'Owner',
                'role_key' => 'owner_travel',
                'deskripsi' => 'Pimpinan & Pemilik Tenant Travel',
                'wewenang_note' => 'Memiliki otoritas penuh atas seluruh manajemen tenant, keuangan, dan seluruh cabang struktur organisasi.',
                'urutan' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $spvLevelId = DB::table('hierarchy_levels')->insertGetId([
                'tenant_id' => $tenant->id,
                'parent_id' => $ownerLevelId,
                'nama_level' => 'Supervisor',
                'role_key' => 'admin_travel',
                'deskripsi' => 'Supervisor Pembina Mitra & Operasional',
                'wewenang_note' => 'Membina team leader dan memonitor target penjualan serta evaluasi tim lapangan.',
                'urutan' => 2,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $leaderLevelId = DB::table('hierarchy_levels')->insertGetId([
                'tenant_id' => $tenant->id,
                'parent_id' => $spvLevelId,
                'nama_level' => 'Team Leader',
                'role_key' => 'admin_travel',
                'deskripsi' => 'Ketua Tim Lapangan & Pembina Agen',
                'wewenang_note' => 'Membimbing staff agen dalam follow-up calon jamaah dan penyuluhan manasik.',
                'urutan' => 3,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $staffLevelId = DB::table('hierarchy_levels')->insertGetId([
                'tenant_id' => $tenant->id,
                'parent_id' => $leaderLevelId,
                'nama_level' => 'Staff',
                'role_key' => 'agen',
                'deskripsi' => 'Mitra Sales Agen Lapangan (Direct Sales)',
                'wewenang_note' => 'Merekrut dan melakukan pendekatan langsung dengan calon jamaah serta berhak atas komisi closing.',
                'urutan' => 4,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // Link existing users of this tenant to the corresponding levels
            DB::table('users')->where('tenant_id', $tenant->id)->where(function ($q) {
                $q->where('jabatan', 'Owner')->orWhere('role', 'owner_travel');
            })->update(['hierarchy_level_id' => $ownerLevelId]);

            DB::table('users')->where('tenant_id', $tenant->id)->where(function ($q) {
                $q->where('jabatan', 'Supervisor');
            })->update(['hierarchy_level_id' => $spvLevelId]);

            DB::table('users')->where('tenant_id', $tenant->id)->where(function ($q) {
                $q->where('jabatan', 'Team Leader');
            })->update(['hierarchy_level_id' => $leaderLevelId]);

            DB::table('users')->where('tenant_id', $tenant->id)->where(function ($q) {
                $q->where('jabatan', 'Staff')->orWhere('role', 'agen')->orWhereNull('hierarchy_level_id');
            })->update(['hierarchy_level_id' => $staffLevelId]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['hierarchy_level_id']);
            $table->dropColumn('hierarchy_level_id');
        });

        Schema::dropIfExists('hierarchy_levels');
    }
};
