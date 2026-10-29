<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Seed Global Super Admin Master
        User::firstOrCreate(
            ['email' => 'superadmin@hajjflow.com'],
            [
                'tenant_id' => null,
                'name' => 'Super Admin Master',
                'password' => Hash::make('password'),
                'role' => 'super_admin_master',
                'jabatan' => 'Super Admin',
                'created_by' => null,
            ]
        );

        // 2. Seed Application Navigation Menus & RBAC Permissions
        $this->call(MenuSeeder::class);

        // 3. Seed Realistic Multi-Tenant Data (3 Tenants, 10,000+ Relational Records Each)
        $this->call(TenantDatasetSeeder::class);

        // 4. Seed Detailed Package Itineraries & Daily Rundowns
        $this->call(PaketRundownSeeder::class);

        // 5. Seed Katalog Penerbangan, Hotel & 100 Paket Keberangkatan (Setia Haramain Tour)
        $this->call(KeberangkatanDummySeeder::class);
    }
}
