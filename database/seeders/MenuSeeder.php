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

        $dashboardMenu = Menu::create([
            'title' => 'Dashboard',
            'url' => '/dashboard',
            'icon' => 'LayoutDashboard',
            'roles' => ['super_admin_master', 'owner_travel', 'supervisor', 'team_leader', 'admin_travel', 'agen'],
            'urutan' => 1,
        ]);

        $tenantMenu = Menu::create([
            'title' => 'Kelola Travel (Multi-Tenant)',
            'url' => '/tenants',
            'icon' => 'Building2',
            'roles' => ['super_admin_master'],
            'urutan' => 2,
        ]);

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

        $userMgmtMenu = Menu::create([
            'title' => 'Manajemen Pengguna',
            'url' => '#',
            'icon' => 'Users',
            'roles' => ['super_admin_master', 'owner_travel', 'supervisor', 'team_leader'],
            'urutan' => 5,
        ]);

        Menu::create([
            'parent_id' => $userMgmtMenu->id,
            'title' => 'Struktur Tim & Jabatan',
            'url' => '/settings/users',
            'roles' => ['super_admin_master', 'owner_travel', 'supervisor', 'team_leader'],
            'urutan' => 1,
        ]);

        Menu::create([
            'parent_id' => $userMgmtMenu->id,
            'title' => 'Daftar Mitra Agen',
            'url' => '/agents',
            'roles' => ['super_admin_master', 'owner_travel', 'supervisor', 'team_leader'],
            'urutan' => 2,
        ]);

        $agencyMenu = Menu::create([
            'title' => 'Keagenan & Komisi',
            'url' => '#',
            'icon' => 'CreditCard',
            'roles' => ['owner_travel', 'supervisor', 'team_leader', 'agen'],
            'urutan' => 6,
        ]);

        Menu::create([
            'parent_id' => $agencyMenu->id,
            'title' => 'Komisi & Rekap Agen',
            'url' => '/commissions',
            'roles' => ['owner_travel', 'supervisor', 'team_leader', 'agen'],
            'urutan' => 1,
        ]);

        $inventoryMenu = Menu::create([
            'title' => 'Inventaris & Gudang',
            'url' => '#',
            'icon' => 'Package',
            'roles' => ['owner_travel', 'supervisor'],
            'urutan' => 7,
        ]);

        Menu::create([
            'parent_id' => $inventoryMenu->id,
            'title' => 'Stok Koper & Barang',
            'url' => '/inventaris',
            'roles' => ['owner_travel', 'supervisor'],
            'urutan' => 1,
        ]);

        $settingsMenu = Menu::create([
            'title' => 'Pengaturan Travel',
            'url' => '#',
            'icon' => 'Settings',
            'roles' => ['super_admin_master', 'owner_travel', 'supervisor', 'team_leader', 'agen'],
            'urutan' => 8,
        ]);

        Menu::create([
            'parent_id' => $settingsMenu->id,
            'title' => 'Pengaturan Aplikasi',
            'url' => '/settings/app',
            'roles' => ['super_admin_master', 'owner_travel', 'supervisor', 'team_leader', 'agen'],
            'urutan' => 1,
        ]);

        Menu::create([
            'parent_id' => $settingsMenu->id,
            'title' => 'Rekening Bank',
            'url' => '/settings/banks',
            'roles' => ['owner_travel', 'supervisor'],
            'urutan' => 2,
        ]);

        Menu::create([
            'parent_id' => $settingsMenu->id,
            'title' => 'Alur Tahapan Prospek',
            'url' => '/settings/stages',
            'roles' => ['owner_travel', 'supervisor'],
            'urutan' => 3,
        ]);

        Menu::create([
            'parent_id' => $settingsMenu->id,
            'title' => 'Katalog Paket Umroh & Haji',
            'url' => '/settings/packages',
            'roles' => ['owner_travel', 'supervisor'],
            'urutan' => 4,
        ]);

        Menu::create([
            'parent_id' => $settingsMenu->id,
            'title' => 'Hak Akses Menu & Fitur',
            'url' => '/settings/menus',
            'roles' => ['super_admin_master', 'owner_travel'],
            'urutan' => 5,
        ]);
    }
}
