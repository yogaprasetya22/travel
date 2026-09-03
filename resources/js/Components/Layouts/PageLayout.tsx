import { Head, Link } from '@inertiajs/react';
import { type ReactNode } from 'react';
import { AppSidebar } from '@/Components/app-sidebar';
import { Separator } from '@/Components/ui/separator';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/Components/ui/sidebar';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/Components/ui/breadcrumb';
import { motion } from 'framer-motion';
import { Sun, Moon, Palette } from 'lucide-react';
import { useTheme } from '@/Components/ThemeProvider';
import { NotificationDrawer } from '@/Components/NotificationDrawer';
import { NotificationToast } from '@/Components/NotificationToast';

interface PageLayoutProps {
    /** <title> tag value */
    title: string;
    /** Parent breadcrumb text, e.g. "Keuangan" */
    breadcrumbParent?: string;
    /** Current page breadcrumb text, e.g. "Verifikasi Pembayaran" */
    breadcrumbPage: string;
    /** Page content */
    children: ReactNode;
    /**
     * Extra class for the content wrapper.
     * Default: "p-6 md:p-8 space-y-6"
     * For kanban / full-height layouts pass "p-6 md:p-8 flex flex-col gap-6 overflow-hidden h-[calc(100vh-4rem)]"
     */
    contentClass?: string;
}

/**
 * Standard authenticated page shell.
 * Wraps every dashboard page with SidebarProvider + AppSidebar + SidebarInset + header + breadcrumb.
 * Content is full-width within SidebarInset — no artificial max-w restriction.
 */
export default function PageLayout({
    title,
    breadcrumbParent,
    breadcrumbPage,
    children,
    contentClass = 'p-6 md:p-8 space-y-6',
}: PageLayoutProps) {
    const { theme, setTheme, currentThemeDef } = useTheme();

    const toggleQuickTheme = () => {
        if (currentThemeDef?.type === 'dark') {
            setTheme('light');
        } else {
            setTheme('dark');
        }
    };

    return (
        <SidebarProvider>
            <Head title={title} />
            <AppSidebar />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
                    <div className="flex items-center gap-2 min-w-0">
                        <SidebarTrigger className="-ml-1" />
                        <Separator
                            orientation="vertical"
                            className="mr-1 data-[orientation=vertical]:h-4"
                        />
                        <Breadcrumb className="min-w-0">
                            <BreadcrumbList className="flex-nowrap">
                                {breadcrumbParent && (
                                    <>
                                        <BreadcrumbItem className="hidden sm:inline-flex">
                                            <span className="text-muted-foreground truncate max-w-[120px]">{breadcrumbParent}</span>
                                        </BreadcrumbItem>
                                        <BreadcrumbSeparator className="hidden sm:inline-flex" />
                                    </>
                                )}
                                <BreadcrumbItem className="min-w-0">
                                    <BreadcrumbPage className="truncate max-w-[130px] xs:max-w-[180px] sm:max-w-none">{breadcrumbPage}</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>

                    <div className="flex items-center gap-1.5 sm:gap-2">
                        <NotificationDrawer />
                        <Link
                            href={route('settings.app.index') + '?tab=appearance'}
                            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                            title="Pilih Tema Warna"
                        >
                            <Palette className="w-4 h-4" />
                        </Link>
                        <button
                            type="button"
                            onClick={toggleQuickTheme}
                            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors cursor-pointer"
                            title={`Ubah ke ${currentThemeDef?.type === 'dark' ? 'Light' : 'Dark'} Mode`}
                        >
                            {currentThemeDef?.type === 'dark' ? (
                                <Sun className="w-4 h-4 text-amber-400" />
                            ) : (
                                <Moon className="w-4 h-4 text-slate-700" />
                            )}
                        </button>
                    </div>
                </header>

                <motion.div 
                    className={contentClass}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                >
                    {children}
                </motion.div>

                <NotificationToast />
            </SidebarInset>
        </SidebarProvider>
    );
}
