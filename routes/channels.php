<?php

use App\Models\User;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function (User $user, $id) {
    return (int) $user->id === (int) $id;
});

// Private channel for specific user within a tenant
Broadcast::channel('tenant.{tenantId}.user.{userId}', function (User $user, $tenantId, $userId) {
    if ($user->role === 'super_admin_master') {
        return true;
    }

    return (int) $user->tenant_id === (int) $tenantId && (int) $user->id === (int) $userId;
});

// Private channel for all admins and staff within a tenant
Broadcast::channel('tenant.{tenantId}.admin', function (User $user, $tenantId) {
    if ($user->role === 'super_admin_master') {
        return true;
    }

    if ((int) $user->tenant_id !== (int) $tenantId) {
        return false;
    }

    return in_array($user->role, ['tenant_owner', 'super_admin', 'admin', 'staff', 'admin_travel', 'owner']);
});

// Private channel for general announcements to all tenant members
Broadcast::channel('tenant.{tenantId}.all', function (User $user, $tenantId) {
    if ($user->role === 'super_admin_master') {
        return true;
    }

    return (int) $user->tenant_id === (int) $tenantId;
});
