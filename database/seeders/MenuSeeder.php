<?php

namespace Database\Seeders;

use App\Models\Menu;
use Illuminate\Database\Seeder;

class MenuSeeder extends Seeder
{
    /**
     * Seed application navigation menus and RBAC permissions with clear, friendly Indonesian naming.
     */
    public function run(): void
    {
        Menu::query()->delete();

        // 1. Dashboard
        $dashboardMenu = Menu::create([
            'title' => 'Dashboard',
            'url' => '/dashboard',
            'icon' => 'LayoutDashboard',
            'roles' => ['super_admin_master', 'owner_travel', 'supervisor', 'team_leader', 'admin_travel', 'agen'],
            'urutan' => 1,
        ]);

        // 2. Multi-Tenant Platform Management (Super Admin only)
        $tenantMenu = Menu::create([
            'title' => 'Kelola Travel (Multi-Tenant)',
            'url' => '/tenants',
            'icon' => 'Building2',
            'roles' => ['super_admin_master'],
            'urutan' => 2,
        ]);

        // 3. CRM & Jamaah
        $crmMenu = Menu::create([
            'title' => 'CRM & Jamaah',
            'url' => '#',
            'icon' => 'Kanban',
            'roles' => ['owner_travel', 'supervisor', 'team_leader', 'agen'],
            'urutan' => 3,
        ]);

        Menu::create([
            'parent_id' => $crmMenu->id,
            'title' => 'Prospek Calon Jamaah',
            'url' => '/crm',
            'roles' => ['owner_travel', 'supervisor', 'team_leader', 'agen'],
            'urutan' => 1,
        ]);

        Menu::create([
            'parent_id' => $crmMenu->id,
            'title' => 'Distribusi Koper & Barang',
            'url' => '/crm/logistics',
            'roles' => ['owner_travel', 'supervisor', 'team_leader', 'agen'],
            'urutan' => 2,
        ]);

        Menu::create([
            'parent_id' => $crmMenu->id,
            'title' => 'Jadwal Keberangkatan',
            'url' => '/crm/schedules',
            'roles' => ['owner_travel', 'supervisor', 'team_leader', 'agen'],
            'urutan' => 3,
        ]);

        // 4. Keuangan
        $financeMenu = Menu::create([
            'title' => 'Keuangan',
            'url' => '#',
            'icon' => 'CreditCard',
            'roles' => ['owner_travel', 'supervisor', 'team_leader', 'agen'],
            'urutan' => 4,
        ]);

        Menu::create([
            'parent_id' => $financeMenu->id,
            'title' => 'Daftar Jamaah & Tagihan',
            'url' => '/crm/customers',
            'roles' => ['owner_travel', 'supervisor', 'team_leader', 'agen'],
            'urutan' => 1,
        ]);

        Menu::create([
            'parent_id' => $financeMenu->id,
            'title' => 'Verifikasi Pembayaran',
            'url' => '/finance/payment',
            'roles' => ['owner_travel', 'supervisor'],
            'urutan' => 2,
        ]);

        // 5. Keagenan & Kemitraan Penjualan
        $agencyMenu = Menu::create([
            'title' => 'Keagenan & Komisi',
            'url' => '#',
            'icon' => 'Users',
            'roles' => ['owner_travel', 'supervisor', 'team_leader', 'agen'],
            'urutan' => 5,
        ]);

        Menu::create([
            'parent_id' => $agencyMenu->id,
            'title' => 'Pemantauan Tim & Omzet',
            'url' => '/monitoring',
            'roles' => ['super_admin_master', 'owner_travel', 'supervisor', 'team_leader'],
            'urutan' => 1,
        ]);

        Menu::create([
            'parent_id' => $agencyMenu->id,
            'title' => 'Daftar Mitra Agen',
            'url' => '/agents',
            'roles' => ['owner_travel', 'supervisor', 'team_leader'],
            'urutan' => 2,
        ]);

        Menu::create([
            'parent_id' => $agencyMenu->id,
            'title' => 'Komisi & Rekap Agen',
            'url' => '/commissions',
            'roles' => ['owner_travel', 'supervisor', 'team_leader', 'agen'],
            'urutan' => 3,
        ]);

        // 6. Inventaris & Logistik
        $inventoryMenu = Menu::create([
            'title' => 'Inventaris & Gudang',
            'url' => '#',
            'icon' => 'Package',
            'roles' => ['owner_travel', 'supervisor'],
            'urutan' => 6,
        ]);

        Menu::create([
            'parent_id' => $inventoryMenu->id,
            'title' => 'Stok Koper & Barang',
            'url' => '/inventaris',
            'roles' => ['owner_travel', 'supervisor'],
            'urutan' => 1,
        ]);

        // 7. Pengaturan & Struktur Travel
        $settingsMenu = Menu::create([
            'title' => 'Pengaturan Travel',
            'url' => '#',
            'icon' => 'Settings',
            'roles' => ['super_admin_master', 'owner_travel', 'supervisor', 'team_leader', 'agen'],
            'urutan' => 7,
        ]);

        Menu::create([
            'parent_id' => $settingsMenu->id,
            'title' => 'Struktur Tim & Jabatan',
            'url' => '/settings/users',
            'roles' => ['super_admin_master', 'owner_travel'],
            'urutan' => 1,
        ]);

        Menu::create([
            'parent_id' => $settingsMenu->id,
            'title' => 'Pengaturan Aplikasi',
            'url' => '/settings/app',
            'roles' => ['super_admin_master', 'owner_travel', 'supervisor', 'team_leader', 'agen'],
            'urutan' => 2,
        ]);

        Menu::create([
            'parent_id' => $settingsMenu->id,
            'title' => 'Rekening Bank',
            'url' => '/settings/banks',
            'roles' => ['owner_travel', 'supervisor'],
            'urutan' => 3,
        ]);

        Menu::create([
            'parent_id' => $settingsMenu->id,
            'title' => 'Alur Tahapan Prospek',
            'url' => '/settings/stages',
            'roles' => ['owner_travel', 'supervisor'],
            'urutan' => 4,
        ]);

        Menu::create([
            'parent_id' => $settingsMenu->id,
            'title' => 'Katalog Paket Umroh & Haji',
            'url' => '/settings/packages',
            'roles' => ['owner_travel', 'supervisor'],
            'urutan' => 5,
        ]);

        Menu::create([
            'parent_id' => $settingsMenu->id,
            'title' => 'Hak Akses Menu & Fitur',
            'url' => '/settings/menus',
            'roles' => ['super_admin_master', 'owner_travel'],
            'urutan' => 6,
        ]);
    }
}
