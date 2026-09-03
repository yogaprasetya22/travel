<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Notifications\BroadcastAnnouncementNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * Get recent notifications for authenticated user.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $notifications = $user->notifications()
            ->limit(30)
            ->get()
            ->map(function ($notification) {
                return [
                    'id' => $notification->id,
                    'type' => $notification->data['type'] ?? 'general',
                    'category' => $notification->data['category'] ?? 'info',
                    'title' => $notification->data['title'] ?? 'Notifikasi',
                    'message' => $notification->data['message'] ?? '',
                    'data' => $notification->data,
                    'read_at' => $notification->read_at,
                    'created_at' => $notification->created_at->toISOString(),
                    'time_ago' => $notification->created_at->diffForHumans(),
                ];
            });

        $unreadCount = $user->unreadNotifications()->count();

        return response()->json([
            'notifications' => $notifications,
            'unread_count' => $unreadCount,
        ]);
    }

    /**
     * Send blast / broadcast announcement notification.
     */
    public function sendBlast(Request $request): JsonResponse
    {
        $currentUser = $request->user();

        // 1. Authorize sender
        $allowedRoles = ['super_admin_master', 'super_admin', 'tenant_owner', 'owner_travel', 'admin', 'admin_travel'];
        if (! in_array($currentUser->role, $allowedRoles)) {
            return response()->json(['message' => 'Anda tidak memiliki akses untuk mengirim broadcast.'], 403);
        }

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:150'],
            'message' => ['required', 'string', 'max:1000'],
            'category' => ['required', 'in:info,urgent,promo,system'],
            'target_scope' => ['required', 'in:all_tenants,specific_tenant,current_tenant'],
            'target_tenant_id' => ['nullable', 'exists:tenants,id'],
            'target_role' => ['required', 'in:all,staff_admin,agents'],
        ]);

        $isSuperAdmin = $currentUser->role === 'super_admin_master';

        // 2. Build target users query
        $query = User::query();

        if ($isSuperAdmin) {
            if ($validated['target_scope'] === 'specific_tenant' && ! empty($validated['target_tenant_id'])) {
                $query->where('tenant_id', $validated['target_tenant_id']);
            }
        } else {
            // Tenant Owner / Admin Travel is locked to their tenant
            $query->where('tenant_id', $currentUser->tenant_id);
        }

        // Apply role filters if specified
        if ($validated['target_role'] === 'staff_admin') {
            $query->whereIn('role', ['tenant_owner', 'super_admin', 'admin', 'staff', 'owner_travel', 'admin_travel']);
        } elseif ($validated['target_role'] === 'agents') {
            $query->where('role', 'agent');
        }

        $targetUsers = $query->get();

        if ($targetUsers->isEmpty()) {
            return response()->json([
                'message' => 'Tidak ditemukan pengguna pada target penerima yang dipilih.',
                'sent_count' => 0,
            ], 422);
        }

        $notification = new BroadcastAnnouncementNotification(
            title: $validated['title'],
            message: $validated['message'],
            category: $validated['category'],
            senderName: $currentUser->name,
            tenantId: $currentUser->tenant_id
        );

        foreach ($targetUsers as $user) {
            $user->notify($notification);
        }

        // Also save copy to sender's own inbox
        if (! $targetUsers->contains('id', $currentUser->id)) {
            $currentUser->notify($notification);
        }

        return response()->json([
            'success' => true,
            'message' => "Pengumuman berhasil dikirim ke {$targetUsers->count()} pengguna.",
            'sent_count' => $targetUsers->count(),
        ]);
    }

    /**
     * Mark a specific notification as read.
     */
    public function markAsRead(Request $request, string $id): JsonResponse
    {
        $notification = $request->user()->notifications()->find($id);

        if ($notification) {
            $notification->markAsRead();
        }

        return response()->json([
            'success' => true,
            'unread_count' => $request->user()->unreadNotifications()->count(),
        ]);
    }

    /**
     * Mark all notifications as read.
     */
    public function markAllAsRead(Request $request): JsonResponse
    {
        $request->user()->unreadNotifications->markAsRead();

        return response()->json([
            'success' => true,
            'unread_count' => 0,
        ]);
    }

    /**
     * Delete a notification.
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        $notification = $request->user()->notifications()->find($id);

        if ($notification) {
            $notification->delete();
        }

        return response()->json([
            'success' => true,
            'unread_count' => $request->user()->unreadNotifications()->count(),
        ]);
    }
}
