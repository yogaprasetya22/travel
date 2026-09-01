<?php

namespace App\Http\Middleware;

use App\Models\Menu;
use App\Models\Tenant;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user() ? $request->user()->load('tenant') : null,
                'active_tenant' => function () use ($request) {
                    $user = $request->user();
                    if (! $user) {
                        return null;
                    }
                    if ($user->role === 'super_admin_master') {
                        $tenantId = $request->session()->get('tenant_id', Tenant::first()?->id);

                        return Tenant::find($tenantId) ?? Tenant::first();
                    }

                    return $user->tenant;
                },
                'tenants' => function () use ($request) {
                    $user = $request->user();
                    if (! $user || $user->role !== 'super_admin_master') {
                        return [];
                    }

                    return Tenant::orderBy('nama_travel')->get(['id', 'nama_travel', 'domain_atau_subdomain', 'logo']);
                },
            ],
            'menus' => function () use ($request) {
                $user = $request->user();
                if (! $user) {
                    return [];
                }

                if ($user->role === 'super_admin_master') {
                    return Menu::whereNull('parent_id')
                        ->with(['children' => fn ($query) => $query->orderBy('urutan')])
                        ->orderBy('urutan')
                        ->get();
                }

                $userLevelKeys = [
                    'level_'.$user->level,
                    'level_'.$user->level.':view',
                    'level_'.$user->level.':full',
                ];

                if ($user->hierarchy_level_id) {
                    $userLevelKeys[] = 'level_'.$user->hierarchy_level_id;
                    $userLevelKeys[] = 'level_'.$user->hierarchy_level_id.':view';
                    $userLevelKeys[] = 'level_'.$user->hierarchy_level_id.':full';
                }

                if ($user->jabatan) {
                    $jKey = strtolower(str_replace(' ', '_', $user->jabatan));
                    $userLevelKeys[] = $jKey;
                    $userLevelKeys[] = $jKey.':view';
                    $userLevelKeys[] = $jKey.':full';
                }

                if ($user->role) {
                    $userLevelKeys[] = $user->role;
                    $userLevelKeys[] = $user->role.':view';
                    $userLevelKeys[] = $user->role.':full';
                }

                return Menu::whereNull('parent_id')
                    ->where(function ($q) use ($userLevelKeys) {
                        foreach ($userLevelKeys as $key) {
                            $q->orWhereJsonContains('roles', $key);
                        }
                    })
                    ->with(['children' => function ($query) use ($userLevelKeys) {
                        $query->where(function ($q) use ($userLevelKeys) {
                            foreach ($userLevelKeys as $key) {
                                $q->orWhereJsonContains('roles', $key);
                            }
                        })->orderBy('urutan');
                    }])
                    ->orderBy('urutan')
                    ->get();
            },
        ];
    }
}
