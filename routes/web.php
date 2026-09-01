<?php

use App\Http\Controllers\CRM\CustomerController;
use App\Http\Controllers\CRM\DepartureScheduleController;
use App\Http\Controllers\CRM\GuestRegisterFormController;
use App\Http\Controllers\CRM\GuestRegisterSubmitController;
use App\Http\Controllers\CRM\LogisticsDistributionController;
use App\Http\Controllers\CRM\StoreJamaahController;
use App\Http\Controllers\CRM\UpdateJamaahController;
use App\Http\Controllers\CRM\UpdateStageController;
use App\Http\Controllers\CRM\ViewKanbanController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Inventaris\InventarisController;
use App\Http\Controllers\Keagenan\MitraAgenController;
use App\Http\Controllers\Keagenan\PembagianKomisiController;
use App\Http\Controllers\Pembayaran\VerifyPembayaranController;
use App\Http\Controllers\Pembayaran\ViewPaymentController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Settings\AppSettingsController;
use App\Http\Controllers\Settings\MasterDataController;
use App\Http\Controllers\Settings\MenuController;
use App\Http\Controllers\Settings\UserHierarchyController;
use App\Http\Controllers\TenantController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => false,
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', DashboardController::class)
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Tenants Management (Super Admin Master)
    Route::get('/tenants', [TenantController::class, 'index'])->name('tenants.index');
    Route::post('/tenants', [TenantController::class, 'store'])->name('tenants.store');
    Route::put('/tenants/{tenant}', [TenantController::class, 'update'])->name('tenants.update');
    Route::delete('/tenants/{tenant}', [TenantController::class, 'destroy'])->name('tenants.destroy');
    Route::post('/tenants/{tenant}/enter', [TenantController::class, 'enterTenant'])->name('tenants.enter');
    Route::post('/tenants/switch', [TenantController::class, 'switchTenant'])->name('tenants.switch');

    // CRM & Jamaah Lifecycle Routes
    Route::get('/crm', ViewKanbanController::class)->name('crm.index');
    Route::get('/crm/stage/{stage}/leads', [ViewKanbanController::class, 'getStageLeads'])->name('crm.stage.leads');
    Route::post('/crm', StoreJamaahController::class)->name('crm.store');
    Route::put('/crm/jamaah/{jamaah}', UpdateJamaahController::class)->name('crm.jamaah.update');
    Route::patch('/crm/jamaah/{jamaah}/stage', UpdateStageController::class)->name('crm.update-stage');
    Route::get('/crm/customers', [CustomerController::class, 'index'])->name('crm.customers.index');
    Route::put('/crm/customers/{jamaah}', [CustomerController::class, 'update'])->name('crm.customers.update');
    Route::post('/crm/customers/{jamaah}/payment', [CustomerController::class, 'recordPayment'])->name('crm.customers.payment');
    Route::get('/crm/logistics', [LogisticsDistributionController::class, 'index'])->name('crm.logistics.index');
    Route::post('/crm/logistics/{jamaah}/handover', [LogisticsDistributionController::class, 'handover'])->name('crm.logistics.handover');
    Route::get('/crm/schedules', [DepartureScheduleController::class, 'index'])->name('crm.schedules.index');
    Route::post('/crm/schedules/{jamaah}/update-departure', [DepartureScheduleController::class, 'updateDeparture'])->name('crm.schedules.update-departure');

    // Finance/Payment Routes
    Route::get('/finance/payment', ViewPaymentController::class)->name('payment.index');
    Route::post('/finance/payment/{pembayaran}/verify', VerifyPembayaranController::class)->name('payment.verify');

    // Settings & App Configuration Routes
    Route::get('/settings/app', [AppSettingsController::class, 'index'])->name('settings.app.index');
    Route::get('/settings/users', [UserHierarchyController::class, 'index'])->name('settings.users.index');
    Route::post('/settings/users', [UserHierarchyController::class, 'store'])->name('settings.users.store');
    Route::put('/settings/users/{user}', [UserHierarchyController::class, 'update'])->name('settings.users.update');
    Route::delete('/settings/users/{user}', [UserHierarchyController::class, 'destroy'])->name('settings.users.destroy');
    Route::post('/settings/users/{user}/reassign', [UserHierarchyController::class, 'reassignUser'])->name('settings.users.reassign');
    Route::post('/settings/users/levels', [UserHierarchyController::class, 'storeLevel'])->name('settings.users.levels.store');
    Route::put('/settings/users/levels/{level}', [UserHierarchyController::class, 'updateLevel'])->name('settings.users.levels.update');
    Route::delete('/settings/users/levels/{level}', [UserHierarchyController::class, 'destroyLevel'])->name('settings.users.levels.destroy');
    Route::get('/settings/master', [MasterDataController::class, 'index'])->name('settings.master.index');
    Route::post('/settings/master/stage', [MasterDataController::class, 'storeStage'])->name('settings.master.store-stage');
    Route::post('/settings/master/package', [MasterDataController::class, 'storePackage'])->name('settings.master.store-package');
    Route::put('/settings/master/package/{paket}', [MasterDataController::class, 'updatePackage'])->name('settings.master.update-package');
    Route::patch('/settings/master/package/{paket}/toggle', [MasterDataController::class, 'togglePackage'])->name('settings.master.toggle-package');
    Route::delete('/settings/master/package/{paket}', [MasterDataController::class, 'destroyPackage'])->name('settings.master.destroy-package');
    Route::post('/settings/master/bank', [MasterDataController::class, 'storeBank'])->name('settings.master.store-bank');
    Route::get('/settings/banks', [MasterDataController::class, 'index'])->name('settings.banks.index');
    Route::get('/settings/stages', [MasterDataController::class, 'index'])->name('settings.stages.index');
    Route::get('/settings/packages', [MasterDataController::class, 'index'])->name('settings.packages.index');
    Route::get('/settings/menus', [MenuController::class, 'index'])->name('settings.menus.index');
    Route::put('/settings/menus/{menu}', [MenuController::class, 'update'])->name('settings.menus.update');
    Route::post('/settings/menus/batch', [MenuController::class, 'batchUpdate'])->name('settings.menus.batch');

    // Agency & Commission Routes
    Route::get('/agents', [MitraAgenController::class, 'index'])->name('keagenan.agents.index');
    Route::post('/agents', [MitraAgenController::class, 'store'])->name('keagenan.agents.store');
    Route::get('/agents/{agent}/jamaah', [MitraAgenController::class, 'getJamaah'])->name('keagenan.agents.jamaah');
    Route::put('/agents/{agent}', [MitraAgenController::class, 'update'])->name('keagenan.agents.update');
    Route::delete('/agents/{agent}', [MitraAgenController::class, 'destroy'])->name('keagenan.agents.destroy');
    Route::get('/commissions', [PembagianKomisiController::class, 'index'])->name('keagenan.commissions.index');
    Route::put('/commissions/{commission}', [PembagianKomisiController::class, 'update'])->name('keagenan.commissions.update');
    Route::post('/commissions/batch-payout', [PembagianKomisiController::class, 'batchPayout'])->name('keagenan.commissions.batch');

    // Inventory & Logistics Routes
    Route::get('/inventaris', [InventarisController::class, 'index'])->name('inventaris.index');
    Route::post('/inventaris', [InventarisController::class, 'store'])->name('inventaris.store');
    Route::put('/inventaris/{item}', [InventarisController::class, 'update'])->name('inventaris.update');
    Route::post('/inventaris/{item}/adjust', [InventarisController::class, 'adjust'])->name('inventaris.adjust');
});

// Guest B2C Registration Routes
Route::get('/register/{email}', GuestRegisterFormController::class)
    ->name('crm.guest-register-form')
    ->middleware('signed');

Route::post('/register/submit', GuestRegisterSubmitController::class)
    ->name('crm.guest-register-submit');

require __DIR__.'/auth.php';
