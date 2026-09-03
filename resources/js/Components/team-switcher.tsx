"use client"

import * as React from "react"
import { router } from "@inertiajs/react"
import { ChevronsUpDown, Building2, Command, Check, Plus } from "lucide-react"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu"
import {
    SidebarMenu,
    SidebarMenuItem,
    useSidebar,
} from "@/Components/ui/sidebar"
import ApplicationLogo from "@/Components/ApplicationLogo"
import { Tenant, User } from "@/Types"

interface TeamSwitcherProps {
    user: User
    activeTenant?: Tenant | null
    tenants?: Tenant[]
}

export function TeamSwitcher({ user, activeTenant, tenants = [] }: TeamSwitcherProps) {
    const { isMobile } = useSidebar()
    const isSuperAdmin = user.role === "super_admin_master"

    const displayName = isSuperAdmin
        ? (activeTenant?.nama_travel || "Platform Master")
        : (user.tenant?.nama_travel || "Travel Agency")

    const displaySub = isSuperAdmin
        ? (activeTenant ? (activeTenant.domain_atau_subdomain || "SaaS Tenant") : "Global SaaS Master")
        : (user.tenant?.domain_atau_subdomain || "SaaS Tenant")

    const handleSwitchTenant = (tenantId: number) => {
        if (!isSuperAdmin) return
        router.post(
            route("tenants.switch"),
            { tenant_id: tenantId },
            {
                preserveScroll: true,
            }
        )
    }

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger
                        className="peer/menu-button group/menu-button flex w-full items-center gap-2.5 overflow-hidden rounded-xl text-left text-sm ring-sidebar-ring outline-hidden transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground h-12 leading-tight data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-0!"
                    >
                        <div className="flex aspect-square size-8 items-center justify-center shrink-0">
                            <ApplicationLogo className="w-8 h-8 group-data-[collapsible=icon]:w-7 group-data-[collapsible=icon]:h-7" />
                        </div>
                        <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                            <span className="truncate font-bold text-foreground">{displayName}</span>
                            <span className="truncate text-xs text-muted-foreground">{displaySub}</span>
                        </div>
                        {isSuperAdmin && tenants.length > 0 && (
                            <ChevronsUpDown className="ml-auto size-4 text-muted-foreground shrink-0 group-data-[collapsible=icon]:hidden" />
                        )}
                    </DropdownMenuTrigger>
                    {isSuperAdmin && (
                        <DropdownMenuContent
                            className="w-(--radix-dropdown-menu-trigger-width) min-w-64 rounded-xl shadow-lg border border-border/80"
                            align="start"
                            side={isMobile ? "bottom" : "right"}
                            sideOffset={4}
                        >
                            <DropdownMenuGroup>
                                <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 py-1.5">
                                    Pilih Tenant / Travel
                                </DropdownMenuLabel>
                            </DropdownMenuGroup>
                            {tenants.map((t) => {
                                const isActive = activeTenant?.id === t.id
                                return (
                                    <DropdownMenuItem
                                        key={t.id}
                                        onClick={() => handleSwitchTenant(t.id)}
                                        className={`gap-3 p-2.5 rounded-lg cursor-pointer transition ${isActive
                                            ? "bg-primary/10 text-primary font-bold"
                                            : "hover:bg-muted text-foreground"
                                            }`}
                                    >
                                        <div className="flex size-7 items-center justify-center rounded-md border border-border bg-card shrink-0">
                                            <Building2 className="size-3.5 text-primary" />
                                        </div>
                                        <div className="flex flex-col flex-1 min-w-0">
                                            <span className="truncate text-xs font-bold leading-tight">{t.nama_travel}</span>
                                            <span className="truncate text-[10px] text-muted-foreground leading-tight">
                                                {t.domain_atau_subdomain || "Tenant Active"}
                                            </span>
                                        </div>
                                        {isActive && (
                                            <Check className="size-4 text-primary ml-auto shrink-0" />
                                        )}
                                    </DropdownMenuItem>
                                )
                            })}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => router.get(route("tenants.index"))}
                                className="gap-2 p-2 cursor-pointer text-muted-foreground hover:text-foreground text-xs"
                            >
                                <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                                    <Plus className="size-3.5" />
                                </div>
                                <span className="font-semibold">Kelola Seluruh Tenant</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    )}
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}
