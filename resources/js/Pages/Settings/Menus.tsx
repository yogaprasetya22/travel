import React, { useState, useMemo } from "react"
import { router } from "@inertiajs/react"
import PageLayout from "@/Components/Layouts/PageLayout"
import { Button } from "@/Components/ui/button"
import { Input } from "@/Components/ui/input"
import { Badge } from "@/Components/ui/badge"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/Components/ui/card"
import {
    ShieldCheck,
    Lock,
    Check,
    Search,
    ChevronDown,
    ChevronRight,
    Zap,
    Eye,
    Ban,
    Sparkles,
    Filter,
    Shield,
    Layers,
    Users,
} from "lucide-react"

interface DBMenu {
    id: number
    parent_id: number | null
    title: string
    url: string
    icon: string | null
    roles: string[]
    children?: DBMenu[]
}

interface LevelItem {
    id: number
    level_number?: number
    name: string
    role_key: string
    key: string
    rank_key?: string
    level_key: string
}

interface TenantItem {
    id: number
    nama_travel: string
    domain_atau_subdomain?: string
}

interface Props {
    menus: DBMenu[]
    availableLevels: LevelItem[]
    tenants?: TenantItem[]
    selectedTenantId?: number
}

type AccessLevel = "none" | "view" | "full"

export default function Menus({
    menus,
    availableLevels = [],
    tenants = [],
    selectedTenantId,
}: Props) {
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedCategory, setSelectedCategory] = useState<string>("all")
    const [expandedMenuIds, setExpandedMenuIds] = useState<number[]>(() =>
        menus.map((m) => m.id)
    )

    // Helper: Determine access level for a specific level on a menu
    const getAccessLevel = (menu: DBMenu, level: LevelItem): AccessLevel => {
        const roles = menu.roles || []
        const rankKey = level.rank_key || `level_${level.level_number || level.id}`
        const viewKeys = [`${level.key}:view`, `${level.level_key}:view`, `${rankKey}:view`]
        const fullKeys = [
            level.key,
            level.level_key,
            rankKey,
            `${level.key}:full`,
            `${level.level_key}:full`,
            `${rankKey}:full`,
        ]

        if (fullKeys.some((k) => roles.includes(k))) {
            return "full"
        }
        if (viewKeys.some((k) => roles.includes(k))) {
            return "view"
        }
        return "none"
    }

    // Single menu access change
    const handleSetAccess = (
        menu: DBMenu,
        level: LevelItem,
        newAccess: AccessLevel
    ) => {
        const rankKey = level.rank_key || `level_${level.level_number || level.id}`
        let updatedRoles = (menu.roles || []).filter((r) => {
            return (
                r !== level.key &&
                r !== level.level_key &&
                r !== rankKey &&
                r !== `${level.key}:view` &&
                r !== `${level.level_key}:view` &&
                r !== `${rankKey}:view` &&
                r !== `${level.key}:full` &&
                r !== `${level.level_key}:full` &&
                r !== `${rankKey}:full`
            )
        })

        if (newAccess === "full") {
            updatedRoles.push(level.key, level.level_key, rankKey)
        } else if (newAccess === "view") {
            updatedRoles.push(`${level.key}:view`, `${level.level_key}:view`, `${rankKey}:view`)
        }

        router.put(
            route("settings.menus.update", menu.id),
            { roles: updatedRoles },
            {
                preserveScroll: true,
            }
        )
    }

    // Bulk set access for an entire role/level column
    const handleBulkRoleAccess = (level: LevelItem, newAccess: AccessLevel) => {
        const rankKey = level.rank_key || `level_${level.level_number || level.id}`
        const allMenusList: DBMenu[] = []
        menus.forEach((m) => {
            allMenusList.push(m)
            if (m.children) {
                m.children.forEach((c) => allMenusList.push(c))
            }
        })

        const updates = allMenusList.map((m) => {
            let updatedRoles = (m.roles || []).filter((r) => {
                return (
                    r !== level.key &&
                    r !== level.level_key &&
                    r !== rankKey &&
                    r !== `${level.key}:view` &&
                    r !== `${level.level_key}:view` &&
                    r !== `${rankKey}:view` &&
                    r !== `${level.key}:full` &&
                    r !== `${level.level_key}:full` &&
                    r !== `${rankKey}:full`
                )
            })

            if (newAccess === "full") {
                updatedRoles.push(level.key, level.level_key, rankKey)
            } else if (newAccess === "view") {
                updatedRoles.push(`${level.key}:view`, `${level.level_key}:view`, `${rankKey}:view`)
            }

            return {
                id: m.id,
                roles: updatedRoles,
            }
        })

        router.post(
            route("settings.menus.batch"),
            { updates },
            {
                preserveScroll: true,
            }
        )
    }

    // Toggle menu expansion
    const toggleExpand = (menuId: number) => {
        setExpandedMenuIds((prev) =>
            prev.includes(menuId)
                ? prev.filter((id) => id !== menuId)
                : [...prev, menuId]
        )
    }

    const expandAll = () => setExpandedMenuIds(menus.map((m) => m.id))
    const collapseAll = () => setExpandedMenuIds([])

    // Filter menus based on search
    const filteredMenus = useMemo(() => {
        if (!searchQuery.trim()) return menus

        const q = searchQuery.toLowerCase()
        return menus
            .map((m) => {
                const titleMatch = m.title.toLowerCase().includes(q)
                const urlMatch = m.url.toLowerCase().includes(q)
                const matchingChildren = (m.children || []).filter(
                    (c) =>
                        c.title.toLowerCase().includes(q) ||
                        c.url.toLowerCase().includes(q)
                )

                if (titleMatch || urlMatch || matchingChildren.length > 0) {
                    return {
                        ...m,
                        children:
                            titleMatch || urlMatch ? m.children : matchingChildren,
                    }
                }
                return null
            })
            .filter(Boolean) as DBMenu[]
    }, [menus, searchQuery])

    // Total sub-items count
    const totalSubMenus = useMemo(() => {
        return menus.reduce((acc, m) => acc + (m.children?.length || 0), 0)
    }, [menus])

    return (
        <PageLayout
            title="Hak Akses Menu (RBAC)"
            breadcrumbParent="Pengaturan Travel"
            breadcrumbPage="Roles & Permissions"
            contentClass="p-6 md:p-8 flex flex-col gap-6 w-full max-w-none"
        >
            {/* Header Banner with Metrics & RBAC Explanations */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-card/60 backdrop-blur-md p-6 rounded-2xl border border-border/80 shadow-xs">
                <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-primary/10 text-primary">
                            <Shield className="w-5 h-5" />
                        </div>
                        <h1 className="text-xl font-bold tracking-tight text-foreground">
                            Manajemen Hak Akses &amp; RBAC Industri
                        </h1>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed max-w-3xl ml-10">
                        Kelola hak akses tiap menu &amp; modul secara presisi. Setiap jabatan dapat diberikan akses <strong>Akses Penuh</strong> (melihat &amp; mengubah data), <strong>Lihat Saja</strong> (mode baca/view-only), atau <strong>Tutup Akses</strong> (disembunyikan dari navigasi).
                    </p>
                </div>

                {/* Status Legend Pills */}
                <div className="flex flex-wrap items-center gap-2 bg-background/60 p-2 rounded-2xl border border-border/70 self-stretch lg:self-auto">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
                        <Zap className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>Akses Penuh</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-semibold">
                        <Eye className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                        <span>Lihat Saja</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-muted/60 border border-border text-muted-foreground text-xs font-semibold">
                        <Ban className="w-3.5 h-3.5 text-muted-foreground" />
                        <span>Tutup Akses</span>
                    </div>
                </div>
            </div>

            {/* Super Admin Master Tenant Selector */}
            {tenants && tenants.length > 0 && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-primary/5 border border-primary/20 rounded-2xl">
                    <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-primary" />
                        <span className="text-xs font-bold text-foreground">
                            Pilih Tenant Travel yang Dikonfigurasi (Super Admin):
                        </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        {tenants.map((t) => (
                            <button
                                key={t.id}
                                onClick={() => router.post(route("tenants.switch"), { tenant_id: t.id })}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                    selectedTenantId === t.id
                                        ? "bg-primary text-primary-foreground shadow-xs"
                                        : "bg-background/80 hover:bg-muted text-muted-foreground border border-border"
                                }`}
                            >
                                {t.nama_travel}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Filter, Search & Bulk Actions Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 bg-card/40 p-4 rounded-2xl border border-border/80">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder="Cari modul atau sub-menu sistem..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 text-xs rounded-xl h-9 bg-background"
                    />
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={expandAll}
                        className="text-xs rounded-xl h-8 text-muted-foreground hover:text-foreground"
                    >
                        Buka Semua
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={collapseAll}
                        className="text-xs rounded-xl h-8 text-muted-foreground hover:text-foreground"
                    >
                        Tutup Semua
                    </Button>
                </div>
            </div>

            {/* RBAC Matrix Table (Full Responsive Grid) */}
            <div className="overflow-hidden rounded-2xl border border-border/80 bg-card/70 backdrop-blur-md shadow-xs">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-border/80 bg-muted/40">
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-foreground min-w-[280px]">
                                    Modul / Menu Sistem
                                </th>
                                {availableLevels.map((level) => (
                                    <th
                                        key={level.id}
                                        className="px-4 py-4 text-center text-xs font-bold text-foreground min-w-[220px]"
                                    >
                                        <div className="flex flex-col items-center gap-1.5">
                                            <div className="flex items-center gap-1.5">
                                                <Badge
                                                    variant="secondary"
                                                    className={`text-[10px] px-2 py-0.5 font-extrabold tracking-tight border ${
                                                        level.level_number === 1
                                                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                                            : level.level_number === 2
                                                            ? "bg-sky-500/10 text-sky-600 border-sky-500/20"
                                                            : level.level_number === 3
                                                            ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                                                            : "bg-purple-500/10 text-purple-600 border-purple-500/20"
                                                    }`}
                                                >
                                                    Level {level.level_number || level.id}
                                                </Badge>
                                                <span className="font-extrabold text-xs text-foreground">
                                                    {level.name}
                                                </span>
                                            </div>

                                            {/* Column Bulk Quick Presets */}
                                            <div className="flex items-center gap-1 mt-1 p-0.5 bg-background/80 rounded-lg border border-border/60">
                                                <button
                                                    onClick={() => handleBulkRoleAccess(level, "full")}
                                                    title="Beri Semua Akses Penuh"
                                                    className="px-2 py-0.5 text-[10px] font-bold rounded-md hover:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 transition-colors"
                                                >
                                                    Semua Full
                                                </button>
                                                <span className="text-border">|</span>
                                                <button
                                                    onClick={() => handleBulkRoleAccess(level, "view")}
                                                    title="Beri Semua Akses Lihat Saja"
                                                    className="px-2 py-0.5 text-[10px] font-bold rounded-md hover:bg-amber-500/15 text-amber-600 dark:text-amber-400 transition-colors"
                                                >
                                                    Semua View
                                                </button>
                                                <span className="text-border">|</span>
                                                <button
                                                    onClick={() => handleBulkRoleAccess(level, "none")}
                                                    title="Tutup Semua Akses"
                                                    className="px-2 py-0.5 text-[10px] font-bold rounded-md hover:bg-destructive/15 text-destructive transition-colors"
                                                >
                                                    Tutup
                                                </button>
                                            </div>
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60">
                            {filteredMenus.map((menu) => {
                                const hasChildren = menu.children && menu.children.length > 0
                                const isExpanded = expandedMenuIds.includes(menu.id)

                                return (
                                    <React.Fragment key={menu.id}>
                                        {/* Parent Menu Row */}
                                        <tr className="hover:bg-muted/30 transition-colors bg-card/40">
                                            <td className="px-6 py-3.5">
                                                <div className="flex items-center gap-2.5">
                                                    {hasChildren ? (
                                                        <button
                                                            onClick={() => toggleExpand(menu.id)}
                                                            className="p-1 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
                                                        >
                                                            {isExpanded ? (
                                                                <ChevronDown className="w-4 h-4 text-primary" />
                                                            ) : (
                                                                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                                            )}
                                                        </button>
                                                    ) : (
                                                        <div className="w-6" />
                                                    )}

                                                    <div className="flex flex-col">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-bold text-xs text-foreground">
                                                                {menu.title}
                                                            </span>
                                                            {hasChildren && (
                                                                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-primary/10 text-primary border border-primary/20">
                                                                    {menu.children?.length} sub-menu
                                                                </span>
                                                            )}
                                                        </div>
                                                        <span className="text-[10px] font-mono text-muted-foreground mt-0.5">
                                                            {menu.url}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Segmented Controls for Parent Menu */}
                                            {availableLevels.map((level) => {
                                                const currentAccess = getAccessLevel(menu, level)

                                                return (
                                                    <td key={level.id} className="px-4 py-3.5 text-center">
                                                        <div className="inline-flex items-center p-1 bg-background/90 rounded-xl border border-border/80 shadow-xs">
                                                            {/* 1. None Option */}
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleSetAccess(menu, level, "none")
                                                                }
                                                                className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
                                                                    currentAccess === "none"
                                                                        ? "bg-muted text-muted-foreground ring-1 ring-border shadow-xs"
                                                                        : "text-muted-foreground/70 hover:text-foreground"
                                                                }`}
                                                            >
                                                                <Ban className="w-3 h-3" />
                                                                <span>Tutup</span>
                                                            </button>

                                                            {/* 2. View Only Option */}
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleSetAccess(menu, level, "view")
                                                                }
                                                                className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
                                                                    currentAccess === "view"
                                                                        ? "bg-amber-500 text-white dark:bg-amber-600 font-extrabold shadow-xs"
                                                                        : "text-muted-foreground/70 hover:text-amber-600 dark:hover:text-amber-400"
                                                                }`}
                                                            >
                                                                <Eye className="w-3 h-3" />
                                                                <span>View</span>
                                                            </button>

                                                            {/* 3. Full Access Option */}
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleSetAccess(menu, level, "full")
                                                                }
                                                                className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
                                                                    currentAccess === "full"
                                                                        ? "bg-emerald-600 text-white dark:bg-emerald-600 font-extrabold shadow-xs"
                                                                        : "text-muted-foreground/70 hover:text-emerald-600 dark:hover:text-emerald-400"
                                                                }`}
                                                            >
                                                                <Zap className="w-3 h-3" />
                                                                <span>Full</span>
                                                            </button>
                                                        </div>
                                                    </td>
                                                )
                                            })}
                                        </tr>

                                        {/* Sub-Menu Rows */}
                                        {hasChildren &&
                                            isExpanded &&
                                            menu.children!.map((child) => (
                                                <tr
                                                    key={child.id}
                                                    className="hover:bg-muted/20 bg-muted/10 transition-colors"
                                                >
                                                    <td className="px-6 py-2.5 pl-14">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-muted-foreground text-xs font-mono">
                                                                ↳
                                                            </span>
                                                            <div className="flex flex-col">
                                                                <span className="font-semibold text-xs text-foreground/90">
                                                                    {child.title}
                                                                </span>
                                                                <span className="text-[10px] font-mono text-muted-foreground">
                                                                    {child.url}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* Segmented Controls for Sub-Menu */}
                                                    {availableLevels.map((level) => {
                                                        const currentAccess = getAccessLevel(child, level)

                                                        return (
                                                            <td
                                                                key={level.id}
                                                                className="px-4 py-2.5 text-center"
                                                            >
                                                                <div className="inline-flex items-center p-0.5 bg-background/80 rounded-lg border border-border/70 shadow-2xs scale-95">
                                                                    {/* 1. None Option */}
                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            handleSetAccess(
                                                                                child,
                                                                                level,
                                                                                "none"
                                                                            )
                                                                        }
                                                                        className={`flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-md transition-all ${
                                                                            currentAccess === "none"
                                                                                ? "bg-muted text-muted-foreground ring-1 ring-border shadow-2xs"
                                                                                : "text-muted-foreground/60 hover:text-foreground"
                                                                        }`}
                                                                    >
                                                                        <Ban className="w-2.5 h-2.5" />
                                                                        <span>Tutup</span>
                                                                    </button>

                                                                    {/* 2. View Only Option */}
                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            handleSetAccess(
                                                                                child,
                                                                                level,
                                                                                "view"
                                                                            )
                                                                        }
                                                                        className={`flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-md transition-all ${
                                                                            currentAccess === "view"
                                                                                ? "bg-amber-500 text-white dark:bg-amber-600 font-extrabold shadow-2xs"
                                                                                : "text-muted-foreground/60 hover:text-amber-600 dark:hover:text-amber-400"
                                                                        }`}
                                                                    >
                                                                        <Eye className="w-2.5 h-2.5" />
                                                                        <span>View</span>
                                                                    </button>

                                                                    {/* 3. Full Access Option */}
                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            handleSetAccess(
                                                                                child,
                                                                                level,
                                                                                "full"
                                                                            )
                                                                        }
                                                                        className={`flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-md transition-all ${
                                                                            currentAccess === "full"
                                                                                ? "bg-emerald-600 text-white dark:bg-emerald-600 font-extrabold shadow-2xs"
                                                                                : "text-muted-foreground/60 hover:text-emerald-600 dark:hover:text-emerald-400"
                                                                        }`}
                                                                    >
                                                                        <Zap className="w-2.5 h-2.5" />
                                                                        <span>Full</span>
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        )
                                                    })}
                                                </tr>
                                            ))}
                                    </React.Fragment>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </PageLayout>
    )
}
