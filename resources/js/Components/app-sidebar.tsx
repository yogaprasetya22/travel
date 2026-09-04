"use client"

import * as React from "react"
import { usePage } from "@inertiajs/react"
import { PageProps } from "@/Types"
import {
    LayoutDashboard,
    Building2,
    Kanban,
    CreditCard,
    Users,
    Package,
    Settings,
    Command,
    AudioWaveform,
} from "lucide-react"

import { NavMain } from "@/Components/nav-main"
import { NavUser } from "@/Components/nav-user"
import { TeamSwitcher } from "@/Components/team-switcher"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarRail,
} from "@/Components/ui/sidebar"

// Lightweight Lucide icon mapping to minimize bundle size (Ponytail Style)
const iconMap: Record<string, React.ComponentType<any>> = {
    LayoutDashboard,
    Building2,
    Kanban,
    CreditCard,
    Users,
    Package,
    Settings,
}

interface DBMenu {
    id: number
    parent_id: number | null
    title: string
    url: string
    icon: string | null
    children?: DBMenu[]
}

interface CustomPageProps extends PageProps {
    menus: DBMenu[]
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { auth, menus } = usePage<CustomPageProps>().props
    const user = auth.user

    // 1. Dynamic Team / Branding based on Tenant
    const teams = React.useMemo(() => {
        if (user.role === "super_admin_master") {
            return [
                {
                    name: "Platform Master",
                    logo: Command,
                    plan: "SaaS Control",
                },
            ]
        }
        return [
            {
                name: user.tenant?.nama_travel || "Travel Agency",
                logo: AudioWaveform,
                plan: "SaaS Tenant",
            },
        ]
    }, [user])

    const currentUrl = usePage().url;

    // 2. Map database menus to sidebar format with robust active path matching
    const navMain = React.useMemo(() => {
        const cleanPath = currentUrl.split('?')[0].split('#')[0];

        // Collect all distinct valid URLs from all menus and children
        const allUrls: string[] = [];
        (menus || []).forEach((m) => {
            if (m.url && m.url !== '#') {
                allUrls.push(m.url.split('?')[0].split('#')[0]);
            }
            (m.children || []).forEach((c) => {
                if (c.url && c.url !== '#') {
                    allUrls.push(c.url.split('?')[0].split('#')[0]);
                }
            });
        });

        // Find matching URLs (exact match or parent path match)
        const matchingUrls = allUrls.filter((url) => {
            if (url === cleanPath) return true;
            if (url !== '/' && cleanPath.startsWith(url + '/')) return true;
            return false;
        });

        // The active item is the most specific (longest) matching target URL
        const bestMatchUrl = matchingUrls.sort((a, b) => b.length - a.length)[0] || null;

        const isItemActive = (targetUrl: string) => {
            if (!targetUrl || targetUrl === '#' || !bestMatchUrl) return false;
            const cleanTarget = targetUrl.split('?')[0].split('#')[0];
            return cleanTarget === bestMatchUrl;
        };

        return (menus || []).map((menu) => {
            const isMenuDirectMatch = isItemActive(menu.url);
            const activeChildren = (menu.children || []).map((child) => ({
                title: child.title,
                url: child.url,
                isActive: isItemActive(child.url),
            }));
            const hasActiveChild = activeChildren.some((child) => child.isActive);

            return {
                title: menu.title,
                url: menu.url,
                icon: menu.icon ? (iconMap[menu.icon] as any) : undefined,
                isActive: isMenuDirectMatch || hasActiveChild,
                items: activeChildren,
            };
        });
    }, [menus, currentUrl]);

    const userData = React.useMemo(() => {
        return {
            name: user.name,
            email: user.email,
            avatar: user.avatar_url || (user.avatar ? `/storage/${user.avatar}` : ''),
        }
    }, [user])

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <TeamSwitcher
                    user={user}
                    activeTenant={auth.active_tenant}
                    tenants={auth.tenants}
                />
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={navMain} />
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={userData} />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
