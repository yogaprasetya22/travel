<?php

namespace Database\Seeders;

use App\Models\Menu;
use Illuminate\Database\Seeder;

class MenuSeeder extends Seeder
{
    /**
     * Seed application navigation menus and RBAC permissions.
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
            'title' => 'Tenants Management',
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
            'title' => 'Pipeline Leads (Kanban)',
            'url' => '/crm',
            'roles' => ['owner_travel', 'supervisor', 'team_leader', 'agen'],
            'urutan' => 1,
        ]);

        Menu::create([
            'parent_id' => $crmMenu->id,
            'title' => 'Distribusi Logistik',
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
            'title' => 'Progres Pelunasan Jamaah',
            'url' => '/crm/customers',
            'roles' => ['owner_travel', 'supervisor', 'team_leader', 'agen'],
            'urutan' => 1,
        ]);

        Menu::create([
            'parent_id' => $financeMenu->id,
            'title' => 'Verifikasi Mutasi Bank',
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
            'title' => 'Hierarki & Izin User',
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
            'title' => 'Pembagian Komisi',
            'url' => '/commissions',
            'roles' => ['owner_travel', 'supervisor', 'team_leader', 'agen'],
            'urutan' => 1,
        ]);

        $inventoryMenu = Menu::create([
            'title' => 'Inventaris / Logistik',
            'url' => '#',
            'icon' => 'Package',
            'roles' => ['owner_travel', 'supervisor'],
            'urutan' => 7,
        ]);

        Menu::create([
            'parent_id' => $inventoryMenu->id,
            'title' => 'Stok Perlengkapan',
            'url' => '/inventaris',
            'roles' => ['owner_travel', 'supervisor'],
            'urutan' => 1,
        ]);

        $settingsMenu = Menu::create([
            'title' => 'Settings Travel',
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
            'title' => 'Tahap CRM Stages',
            'url' => '/settings/stages',
            'roles' => ['owner_travel', 'supervisor'],
            'urutan' => 3,
        ]);

        Menu::create([
            'parent_id' => $settingsMenu->id,
            'title' => 'Paket Umroh Config',
            'url' => '/settings/packages',
            'roles' => ['owner_travel', 'supervisor'],
            'urutan' => 4,
        ]);

        Menu::create([
            'parent_id' => $settingsMenu->id,
            'title' => 'Roles & Permissions (RBAC)',
            'url' => '/settings/menus',
            'roles' => ['super_admin_master', 'owner_travel'],
            'urutan' => 5,
        ]);
    }
}
