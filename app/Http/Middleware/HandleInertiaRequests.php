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
            'tenant' => function () use ($request) {
                if (app()->bound('tenant')) {
                    return app('tenant');
                }
                $host = $request->getHost();
                $subdomain = explode('.', $host)[0];
                if (! in_array($subdomain, ['localhost', 'travel', 'app', 'www', '127']) && ! filter_var($host, FILTER_VALIDATE_IP)) {
                    $t = Tenant::where('domain_atau_subdomain', $subdomain)->first();
                    if ($t) {
                        return $t;
                    }
                }

                return Tenant::oldest('id')->first();
            },
            'auth' => [
                'user' => $request->user() ? $request->user()->load('tenant') : null,
                'active_tenant' => function () use ($request) {
                    $user = $request->user();
                    if (! $user) {
                        if (app()->bound('tenant')) {
                            return app('tenant');
                        }
                        $host = $request->getHost();
                        $subdomain = explode('.', $host)[0];
                        if (! in_array($subdomain, ['localhost', 'travel', 'app', 'www', '127']) && ! filter_var($host, FILTER_VALIDATE_IP)) {
                            $t = Tenant::where('domain_atau_subdomain', $subdomain)->first();
                            if ($t) {
                                return $t;
                            }
                        }

                        return Tenant::oldest('id')->first();
                    }
                    if ($user->role === 'super_admin_master') {
                        $tenantId = $request->session()->get('tenant_id', Tenant::oldest('id')->first()?->id);

                        return Tenant::find($tenantId) ?? Tenant::oldest('id')->first();
                    }

                    return $user->tenant ?? (app()->bound('tenant') ? app('tenant') : Tenant::oldest('id')->first());
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

                $activeTenant = $user->role === 'super_admin_master'
                    ? (Tenant::find($request->session()->get('tenant_id')) ?? Tenant::oldest('id')->first())
                    : $user->tenant;

                $menus = Menu::whereNull('parent_id')
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

                if ($activeTenant && $activeTenant->is_docs_enabled === false && $user->role !== 'super_admin_master') {
                    $menus = $menus->filter(fn ($m) => $m->url !== '/docs')->values();
                }

                return $menus;
            },
        ];
    }
}
