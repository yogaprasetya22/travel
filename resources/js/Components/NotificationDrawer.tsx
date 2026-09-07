import React, { useEffect, useState } from 'react';
import { usePage } from '@inertiajs/react';
import { PageProps } from '@/Types';
import getEcho from '@/lib/echo';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetTrigger,
} from '@/Components/ui/sheet';
import {
    Bell,
    CheckCheck,
    CreditCard,
    Sparkles,
    UserPlus,
    Trash2,
    Clock,
    Megaphone,
    ShieldAlert,
    AlertCircle,
    Info,
} from 'lucide-react';
import { BlastNotificationSheet } from '@/Components/BlastNotificationSheet';

interface AppNotification {
    id: string;
    type: string;
    category?: string;
    title: string;
    message: string;
    data?: any;
    read_at: string | null;
    created_at: string;
    time_ago: string;
}

export function NotificationDrawer() {
    const { auth } = usePage<PageProps>().props;
    const user = auth?.user;
    const canBlast = ['super_admin_master', 'super_admin', 'tenant_owner', 'owner_travel', 'admin', 'admin_travel'].includes(
        user?.role || ''
    );

    const [isOpen, setIsOpen] = useState(false);
    const [isBlastOpen, setIsBlastOpen] = useState(false);
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [filterTab, setFilterTab] = useState<'all' | 'unread'>('all');

    // 1. Fetch initial database notifications
    const fetchNotifications = async () => {
        try {
            setIsLoading(true);
            const res = await fetch(route('notifications.index'), {
                headers: {
                    Accept: 'application/json',
                },
            });
            if (res.ok) {
                const data = await res.json();
                setNotifications(data.notifications || []);
                setUnreadCount(data.unread_count || 0);
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchNotifications();
        }
    }, [isOpen]);

    useEffect(() => {
        if (!user) return;

        fetchNotifications();

        // Subtle audio chime
        const playChime = () => {
            try {
                const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(587.33, ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
                gain.gain.setValueAtTime(0.12, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start();
                osc.stop(ctx.currentTime + 0.3);
            } catch (e) {
                // AudioContext autoplay restrictions
            }
        };

        const handleIncomingNotification = (notificationData: any) => {
            const newNotif: AppNotification = {
                id: notificationData.id || Math.random().toString(),
                type: notificationData.type || 'general',
                category: notificationData.category || 'info',
                title: notificationData.title || 'Notifikasi Baru',
                message: notificationData.message || '',
                data: notificationData,
                read_at: null,
                created_at: new Date().toISOString(),
                time_ago: 'Baru saja',
            };

            setNotifications((prev) => [newNotif, ...prev]);
            setUnreadCount((prev) => prev + 1);

            // Trigger floating toast
            window.dispatchEvent(
                new CustomEvent('hajjflow:notification', {
                    detail: newNotif,
                })
            );

            playChime();
        };

        const echo = getEcho();
        if (!echo) {
            return;
        }

        const userChannel = echo.private(`App.Models.User.${user.id}`);
        userChannel.notification(handleIncomingNotification);

        let adminChannel: any = null;
        let tenantAllChannel: any = null;

        if (user.tenant_id) {
            adminChannel = echo.private(`tenant.${user.tenant_id}.admin`);
            adminChannel.listen('.Illuminate\\Notifications\\Events\\BroadcastNotificationCreated', (e: any) => {
                handleIncomingNotification(e);
            });

            tenantAllChannel = echo.private(`tenant.${user.tenant_id}.all`);
            tenantAllChannel.listen('.Illuminate\\Notifications\\Events\\BroadcastNotificationCreated', (e: any) => {
                handleIncomingNotification(e);
            });
        }

        return () => {
            userChannel.stopListening('.Illuminate\\Notifications\\Events\\BroadcastNotificationCreated');
            if (adminChannel) {
                adminChannel.stopListening('.Illuminate\\Notifications\\Events\\BroadcastNotificationCreated');
            }
            if (tenantAllChannel) {
                tenantAllChannel.stopListening('.Illuminate\\Notifications\\Events\\BroadcastNotificationCreated');
            }
        };
    }, [user?.id, user?.tenant_id]);

    const markAsRead = async (id: string) => {
        try {
            await fetch(route('notifications.read', id), {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                    Accept: 'application/json',
                },
            });

            setNotifications((prev) =>
                prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
            );
            setUnreadCount((prev) => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await fetch(route('notifications.read-all'), {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                    Accept: 'application/json',
                },
            });

            setNotifications((prev) =>
                prev.map((n) => ({ ...n, read_at: n.read_at || new Date().toISOString() }))
            );
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    };

    const deleteNotification = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        try {
            await fetch(route('notifications.destroy', id), {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                    Accept: 'application/json',
                },
            });

            setNotifications((prev) => prev.filter((n) => n.id !== id));
            setUnreadCount((prev) => {
                const deleted = notifications.find((n) => n.id === id);
                return deleted && !deleted.read_at ? Math.max(0, prev - 1) : prev;
            });
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    const filteredList = notifications.filter((n) => {
        if (filterTab === 'unread') {
            return !n.read_at;
        }
        return true;
    });

    const getIcon = (type: string, category?: string) => {
        if (type === 'announcement') {
            switch (category) {
                case 'urgent':
                    return <ShieldAlert className="w-4 h-4 text-rose-500" />;
                case 'promo':
                    return <Sparkles className="w-4 h-4 text-emerald-500" />;
                case 'system':
                    return <AlertCircle className="w-4 h-4 text-amber-500" />;
                default:
                    return <Megaphone className="w-4 h-4 text-blue-500" />;
            }
        }

        switch (type) {
            case 'jamaah_registered':
                return <UserPlus className="w-4 h-4 text-emerald-500" />;
            case 'payment_verified':
                return <CreditCard className="w-4 h-4 text-blue-500" />;
            case 'commission_earned':
                return <Sparkles className="w-4 h-4 text-amber-500" />;
            default:
                return <Bell className="w-4 h-4 text-primary" />;
        }
    };

    return (
        <>
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger
                    render={
                        <button
                            type="button"
                            className="relative p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors cursor-pointer"
                            title="Buka Drawer Notifikasi"
                        >
                            <Bell className="w-4 h-4" />
                            {unreadCount > 0 && (
                                <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-extrabold text-primary-foreground shadow-xs animate-pulse">
                                    {unreadCount > 99 ? '99+' : unreadCount}
                                </span>
                            )}
                        </button>
                    }
                />

                <SheetContent
                    side="right"
                    className="w-full sm:max-w-md md:max-w-lg bg-card border-l border-border p-0 flex flex-col h-full shadow-2xl"
                >
                    {/* Header Drawer */}
                    <SheetHeader className="p-5 border-b border-border bg-muted/20">
                        <div className="flex items-center justify-between pr-8">
                            <div className="flex items-center gap-2.5">
                                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                                    <Bell className="w-5 h-5" />
                                </div>
                                <div>
                                    <SheetTitle className="text-base font-bold text-foreground">
                                        Pusat Notifikasi
                                    </SheetTitle>
                                    <SheetDescription className="text-xs text-muted-foreground mt-0.5">
                                        Pemberitahuan aktivitas & transaksi real-time
                                    </SheetDescription>
                                </div>
                            </div>
                        </div>

                        {/* Blast Button for Super Admin / Owner */}
                        {canBlast && (
                            <div className="mt-3">
                                <button
                                    type="button"
                                    onClick={() => setIsBlastOpen(true)}
                                    className="w-full p-2.5 rounded-xl bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer shadow-2xs"
                                >
                                    <Megaphone className="w-4 h-4" />
                                    <span>Kirim Pengumuman / Broadcast</span>
                                </button>
                            </div>
                        )}

                        {/* Filter Tabs & Quick Actions */}
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/60">
                            <div className="flex items-center gap-1.5 bg-muted/60 p-1 rounded-xl">
                                <button
                                    type="button"
                                    onClick={() => setFilterTab('all')}
                                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                                        filterTab === 'all'
                                            ? 'bg-background text-foreground shadow-xs'
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    Semua ({notifications.length})
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFilterTab('unread')}
                                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                                        filterTab === 'unread'
                                            ? 'bg-background text-foreground shadow-xs'
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    Belum Dibaca ({unreadCount})
                                </button>
                            </div>

                            {unreadCount > 0 && (
                                <button
                                    type="button"
                                    onClick={markAllAsRead}
                                    className="text-xs font-bold text-primary hover:underline flex items-center gap-1.5 cursor-pointer py-1"
                                >
                                    <CheckCheck className="w-4 h-4" />
                                    <span>Tandai Dibaca</span>
                                </button>
                            )}
                        </div>
                    </SheetHeader>

                    {/* Notifications List Body */}
                    <div className="flex-1 overflow-y-auto divide-y divide-border/60 p-2 low-scrollbar">
                        {isLoading && notifications.length === 0 ? (
                            <div className="p-12 text-center text-xs text-muted-foreground">
                                Memuat notifikasi...
                            </div>
                        ) : filteredList.length === 0 ? (
                            <div className="p-12 text-center flex flex-col items-center justify-center gap-3 text-muted-foreground">
                                <div className="p-4 rounded-2xl bg-muted/50 border border-border/50">
                                    <Bell className="w-8 h-8 opacity-30" />
                                </div>
                                <h4 className="font-bold text-sm text-foreground">Tidak Ada Notifikasi</h4>
                                <p className="text-xs max-w-xs text-muted-foreground/80 leading-relaxed">
                                    {filterTab === 'unread'
                                        ? 'Semua notifikasi telah Anda baca.'
                                        : 'Aktivitas pendaftaran jamaah, pembayaran, dan pengumuman akan muncul seketika di sini.'}
                                </p>
                            </div>
                        ) : (
                            filteredList.map((notif) => {
                                const isUnread = !notif.read_at;
                                return (
                                    <div
                                        key={notif.id}
                                        onClick={() => isUnread && markAsRead(notif.id)}
                                        className={`p-4 rounded-2xl transition-all cursor-pointer mb-2 flex items-start gap-3.5 group border ${
                                            isUnread
                                                ? 'bg-primary/5 border-primary/20 hover:bg-primary/10'
                                                : 'bg-card hover:bg-muted/40 border-transparent opacity-80'
                                        }`}
                                    >
                                        <div className="p-2.5 rounded-xl bg-card border border-border shrink-0 mt-0.5 shadow-xs">
                                            {getIcon(notif.type, notif.category)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2">
                                                <h5 className="text-xs font-extrabold text-foreground truncate">
                                                    {notif.title}
                                                </h5>
                                                <div className="flex items-center gap-2">
                                                    {isUnread && (
                                                        <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-md bg-primary text-primary-foreground">
                                                            Baru
                                                        </span>
                                                    )}
                                                    <button
                                                        type="button"
                                                        onClick={(e) => deleteNotification(e, notif.id)}
                                                        className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-destructive transition-opacity rounded cursor-pointer"
                                                        title="Hapus notifikasi"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                                                {notif.message}
                                            </p>
                                            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/70 mt-2 font-medium">
                                                <Clock className="w-3 h-3" />
                                                <span>{notif.time_ago}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Footer Live Status */}
                    <div className="p-3.5 border-t border-border bg-muted/20 flex items-center justify-between text-[11px] text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            <span className="font-semibold text-foreground">WebSocket Reverb</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground">Live Streaming</span>
                    </div>
                </SheetContent>
            </Sheet>

            {/* Blast Announcement Modal / Sheet */}
            {canBlast && (
                <BlastNotificationSheet
                    open={isBlastOpen}
                    onOpenChange={setIsBlastOpen}
                    onSuccess={fetchNotifications}
                />
            )}
        </>
    );
}

export default NotificationDrawer;
