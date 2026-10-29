<?php

namespace App\Traits;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;

trait AuthorizesTravelCatalog
{
    /**
     * @var array<int, string>
     */
    private const CATALOG_ROLES = ['super_admin_master', 'owner_travel', 'admin_travel', 'supervisor'];

    protected function authorizeCatalog(Request $request, ?Model $record = null): void
    {
        $user = $request->user();

        abort_unless(in_array($user->role, self::CATALOG_ROLES, true), 403, 'Aksi tidak diizinkan.');

        if ($record && $user->role !== 'super_admin_master') {
            abort_unless($record->tenant_id === $user->getActiveTenantId(), 403, 'Aksi tidak diizinkan.');
        }
    }
}
