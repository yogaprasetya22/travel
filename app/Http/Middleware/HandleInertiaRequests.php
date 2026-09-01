<?php

namespace App\Http\Middleware;

use App\Models\Menu;
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
            ],
            'menus' => function () use ($request) {
                $user = $request->user();
                if (! $user) {
                    return [];
                }

                $userRoles = [$user->role];
                if ($user->jabatan) {
                    $userRoles[] = strtolower(str_replace(' ', '_', $user->jabatan));
                }
                // Also map supervisor & team_leader to admin_travel and vice versa
                if (in_array($user->role, ['admin_travel'])) {
                    if ($user->jabatan === 'Supervisor') {
                        $userRoles[] = 'supervisor';
                    } elseif ($user->jabatan === 'Team Leader') {
                        $userRoles[] = 'team_leader';
                    }
                }

                return Menu::whereNull('parent_id')
                    ->where(function ($q) use ($userRoles) {
                        foreach ($userRoles as $role) {
                            $q->orWhereJsonContains('roles', $role);
                        }
                    })
                    ->with(['children' => function ($query) use ($userRoles) {
                        $query->where(function ($q) use ($userRoles) {
                            foreach ($userRoles as $role) {
                                $q->orWhereJsonContains('roles', $role);
                            }
                        })->orderBy('urutan');
                    }])
                    ->orderBy('urutan')
                    ->get();
            },
        ];
    }
}
