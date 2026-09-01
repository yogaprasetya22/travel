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
            <SidebarGroupLabel>Platform</SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => {
                    const hasChildren = item.items && item.items.length > 0
                    const isOpen = !!openMenus[item.title]

                    if (!hasChildren) {
                        return (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton
                                    isActive={item.isActive}
                                    tooltip={item.title}
                                    render={
                                        <Link href={item.url} className="flex items-center gap-2">
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
                                        <SidebarMenuButton tooltip={item.title} isActive={item.isActive}>
                                            {item.icon && <item.icon />}
                                            <span>{item.title}</span>
                                            <ChevronRight
                                                className={`ml-auto transition-transform duration-200 ${
                                                    isOpen ? "rotate-90" : ""
                                                }`}
                                            />
                                        </SidebarMenuButton>
                                    }
                                />
                                <CollapsibleContent>
                                    <SidebarMenuSub>
                                        {item.items?.map((subItem) => (
                                            <SidebarMenuSubItem key={subItem.title}>
                                                <SidebarMenuSubButton
                                                    isActive={subItem.isActive}
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
