import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bell,
    CreditCard,
    Sparkles,
    UserPlus,
    X,
    Megaphone,
    ShieldAlert,
    AlertCircle,
    Info,
} from 'lucide-react';

export interface ToastNotification {
    id: string;
    type: string;
    category?: string;
    title: string;
    message: string;
    created_at?: string;
}

export function NotificationToast() {
    const [toasts, setToasts] = useState<ToastNotification[]>([]);

    useEffect(() => {
        const handleNewNotification = (e: CustomEvent<ToastNotification>) => {
            const newToast = { ...e.detail, id: e.detail.id || Math.random().toString() };
            setToasts((prev) => [newToast, ...prev.slice(0, 3)]); // Keep max 4 toasts

            // Auto dismiss after 6 seconds
            setTimeout(() => {
                setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
            }, 6000);
        };

        window.addEventListener('hajjflow:notification' as any, handleNewNotification);
        return () => {
            window.removeEventListener('hajjflow:notification' as any, handleNewNotification);
        };
    }, []);

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    const getIcon = (type: string, category?: string) => {
        if (type === 'announcement') {
            switch (category) {
                case 'urgent':
                    return <ShieldAlert className="w-5 h-5 text-rose-500" />;
                case 'promo':
                    return <Sparkles className="w-5 h-5 text-emerald-500" />;
                case 'system':
                    return <AlertCircle className="w-5 h-5 text-amber-500" />;
                default:
                    return <Megaphone className="w-5 h-5 text-blue-500" />;
            }
        }

        switch (type) {
            case 'jamaah_registered':
                return <UserPlus className="w-5 h-5 text-emerald-500" />;
            case 'payment_verified':
                return <CreditCard className="w-5 h-5 text-blue-500" />;
            case 'commission_earned':
                return <Sparkles className="w-5 h-5 text-amber-500" />;
            default:
                return <Bell className="w-5 h-5 text-primary" />;
        }
    };

    const getAccentColor = (type: string, category?: string) => {
        if (type === 'announcement') {
            switch (category) {
                case 'urgent':
                    return 'bg-rose-500';
                case 'promo':
                    return 'bg-emerald-500';
                case 'system':
                    return 'bg-amber-500';
                default:
                    return 'bg-blue-500';
            }
        }
        return 'bg-primary';
    };

    return (
        <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
            <AnimatePresence>
                {toasts.map((toast) => (
                    <motion.div
                        key={toast.id}
                        initial={{ opacity: 0, y: 30, scale: 0.92 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 50, scale: 0.9 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                        className="pointer-events-auto bg-card/95 backdrop-blur-md text-card-foreground border border-border/80 shadow-2xl rounded-2xl p-4 flex items-start gap-3.5 relative overflow-hidden group"
                    >
                        {/* Accent Bar */}
                        <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${getAccentColor(toast.type, toast.category)}`} />

                        {/* Icon Container */}
                        <div className="p-2 rounded-xl bg-muted/60 border border-border shrink-0">
                            {getIcon(toast.type, toast.category)}
                        </div>

                        {/* Text Details */}
                        <div className="flex-1 min-w-0 pr-2">
                            <h4 className="text-xs font-bold text-foreground leading-snug truncate">
                                {toast.title}
                            </h4>
                            <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed line-clamp-2">
                                {toast.message}
                            </p>
                        </div>

                        {/* Dismiss Button */}
                        <button
                            type="button"
                            onClick={() => removeToast(toast.id)}
                            className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted transition-colors shrink-0 cursor-pointer"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}

export default NotificationToast;
