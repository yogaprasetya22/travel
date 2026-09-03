<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use App\Models\User;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
    {
        $user = $request->user();

        $isSoleOwner = false;
        if ($user->isOwner()) {
            $isSoleOwner = User::where('tenant_id', $user->tenant_id)
                ->where(function ($q) {
                    $q->where('role', 'owner_travel')
                        ->orWhereHas('hierarchyLevel', fn ($h) => $h->where('urutan', 1));
                })
                ->count() <= 1;
        }

        $isSoleSuperAdmin = false;
        if ($user->isSuperAdmin()) {
            $isSoleSuperAdmin = User::where('role', 'super_admin_master')->count() <= 1;
        }

        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $user instanceof MustVerifyEmail,
            'status' => session('status'),
            'protection' => [
                'isSoleOwner' => $isSoleOwner,
                'isSoleSuperAdmin' => $isSoleSuperAdmin,
            ],
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $data = $request->validated();

        if ($request->hasFile('avatar')) {
            // Delete old avatar if exists
            if ($request->user()->avatar && Storage::disk('public')->exists($request->user()->avatar)) {
                Storage::disk('public')->delete($request->user()->avatar);
            }
            $path = $request->file('avatar')->store('avatars', 'public');
            $data['avatar'] = $path;
        } else {
            unset($data['avatar']);
        }

        $request->user()->fill($data);

        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        $request->user()->save();

        return Redirect::back()->with('status', 'profile-updated');
    }

    /**
     * Delete the user's account with sole owner & super admin protection.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        // 1. Protection for Super Admin Master (Level 0)
        if ($user->isSuperAdmin()) {
            $superAdminCount = User::where('role', 'super_admin_master')->count();
            if ($superAdminCount <= 1) {
                throw ValidationException::withMessages([
                    'password' => 'Akun Super Admin Master terakhir tidak dapat dihapus untuk menjaga kelangsungan akses platform.',
                ]);
            }
        }

        // 2. Protection for Travel Owner (Level 1)
        if ($user->isOwner()) {
            $ownerCount = User::where('tenant_id', $user->tenant_id)
                ->where(function ($q) {
                    $q->where('role', 'owner_travel')
                        ->orWhereHas('hierarchyLevel', fn ($h) => $h->where('urutan', 1));
                })
                ->count();

            if ($ownerCount <= 1) {
                throw ValidationException::withMessages([
                    'password' => 'Anda adalah satu-satunya Owner pada travel ini. Harap tunjuk atau angkat akun Owner pengganti terlebih dahulu sebelum menghapus akun ini.',
                ]);
            }
        }

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }
}
