"use client"

import * as React from "react"
import { Link } from "@inertiajs/react"
import { ChevronRight, type LucideIcon } from "lucide-react"

import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/Components/ui/collapsible"
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from "@/Components/ui/sidebar"

const itemClass =
    "h-10 gap-3 rounded-xl px-3 text-[13px] font-medium text-sidebar-foreground/80 [&_svg]:size-[18px] [&_svg]:text-muted-foreground transition-colors hover:text-foreground"

const itemActiveClass =
    "bg-primary text-primary-foreground font-semibold shadow-xs hover:bg-primary hover:text-primary-foreground after:hidden [&_svg]:text-primary-foreground"

const groupActiveClass =
    "font-semibold text-foreground [&_svg]:text-primary group-data-[collapsible=icon]:bg-primary/10"

const subItemClass =
    "h-8 translate-x-0 rounded-lg px-2.5 text-[13px] font-medium text-muted-foreground hover:text-foreground"

const subItemActiveClass = "bg-primary/10 font-semibold text-primary hover:bg-primary/15 hover:text-primary after:hidden"

export function NavMain({
    items,
}: {
    items: {
        title: string
        url: string
        icon?: LucideIcon
        isActive?: boolean
        items?: {
            title: string
            url: string
            isActive?: boolean
        }[]
    }[]
}) {
    // Independent multi-open state persisted across pages & reloads
    const [openMenus, setOpenMenus] = React.useState<Record<string, boolean>>(() => {
        if (typeof window !== "undefined") {
            try {
                const saved = localStorage.getItem("sidebar_open_menus")
                if (saved) {
                    return JSON.parse(saved)
                }
            } catch (e) {
                // fallback to default
            }
        }
        // Default initial open states based on active items
        const initial: Record<string, boolean> = {}
        items.forEach((item) => {
            if (item.isActive) {
                initial[item.title] = true
            }
        })
        return initial
    })

    // Automatically ensure active menu group is open when current URL matches
    React.useEffect(() => {
        items.forEach((item) => {
            if (item.isActive && !openMenus[item.title]) {
                setOpenMenus((prev) => {
                    const next = { ...prev, [item.title]: true }
                    try {
                        localStorage.setItem("sidebar_open_menus", JSON.stringify(next))
                    } catch (e) {}
                    return next
                })
            }
        })
    }, [items])

    const handleToggleMenu = (title: string, isOpen: boolean) => {
        setOpenMenus((prev) => {
            const next = { ...prev, [title]: isOpen }
            try {
                localStorage.setItem("sidebar_open_menus", JSON.stringify(next))
            } catch (e) {}
            return next
        })
    }

    return (
        <SidebarGroup>
            <SidebarGroupLabel className="mb-1 h-7 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80">Menu Utama</SidebarGroupLabel>
            <SidebarMenu className="gap-0.5">
                {items.map((item) => {
                    const hasChildren = item.items && item.items.length > 0
                    const isOpen = !!openMenus[item.title]

                    if (!hasChildren) {
                        return (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton
                                    isActive={item.isActive}
                                    tooltip={item.title}
                                    className={`${itemClass} ${item.isActive ? itemActiveClass : ""}`}
                                    render={
                                        <Link href={item.url} className="flex items-center gap-3">
                                            {item.icon && <item.icon />}
                                            <span>{item.title}</span>
                                        </Link>
                                    }
                                />
                            </SidebarMenuItem>
                        )
                    }

                    return (
                        <SidebarMenuItem key={item.title}>
                            <Collapsible
                                open={isOpen}
                                onOpenChange={(open) => handleToggleMenu(item.title, open)}
                                className="group/collapsible"
                            >
                                <CollapsibleTrigger
                                    render={
                                        <SidebarMenuButton
                                            tooltip={item.title}
                                            className={`${itemClass} ${item.isActive ? groupActiveClass : ""}`}
                                        >
                                            {item.icon && <item.icon />}
                                            <span>{item.title}</span>
                                            <ChevronRight
                                                className={`ml-auto size-4! text-muted-foreground/70 transition-transform duration-200 group-data-[collapsible=icon]:hidden ${
                                                    isOpen ? "rotate-90" : ""
                                                }`}
                                            />
                                        </SidebarMenuButton>
                                    }
                                />
                                <CollapsibleContent>
                                    <SidebarMenuSub className="mx-0 my-1 ml-[22px] translate-x-0 gap-0.5 border-sidebar-border px-0 pl-2">
                                        {item.items?.map((subItem) => (
                                            <SidebarMenuSubItem key={subItem.title}>
                                                {subItem.isActive && (
                                                    <span className="absolute -left-[9px] top-1.5 bottom-1.5 w-0.5 rounded-full bg-primary" />
                                                )}
                                                <SidebarMenuSubButton
                                                    isActive={subItem.isActive}
                                                    className={`${subItemClass} ${subItem.isActive ? subItemActiveClass : ""}`}
                                                    render={
                                                        <Link href={subItem.url}>
                                                            <span>{subItem.title}</span>
                                                        </Link>
                                                    }
                                                />
                                            </SidebarMenuSubItem>
                                        ))}
                                    </SidebarMenuSub>
                                </CollapsibleContent>
                            </Collapsible>
                        </SidebarMenuItem>
                    )
                })}
            </SidebarMenu>
        </SidebarGroup>
    )
}
