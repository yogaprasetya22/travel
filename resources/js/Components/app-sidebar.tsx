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

    // 2. Map database menus to sidebar format
    const navMain = React.useMemo(() => {
        return (menus || []).map((menu) => {
            const hasActiveChild = (menu.children || []).some(
                (child) => child.url === window.location.pathname
            )
            return {
                title: menu.title,
                url: menu.url,
                icon: menu.icon ? (iconMap[menu.icon] as any) : undefined,
                isActive: menu.url === window.location.pathname || hasActiveChild,
                items: (menu.children || []).map((child) => ({
                    title: child.title,
                    url: child.url,
                    isActive: child.url === window.location.pathname,
                })),
            }
        })
    }, [menus])

    const userData = React.useMemo(() => {
        return {
            name: user.name,
            email: user.email,
            avatar: "", // handled via user initials inside NavUser fallback
        }
    }, [user])

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <TeamSwitcher teams={teams} />
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
