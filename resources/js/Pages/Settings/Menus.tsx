import React from "react"
import { router } from "@inertiajs/react"
import PageLayout from "@/Components/Layouts/PageLayout"
import Checkbox from "@/Components/Checkbox"
import { ShieldCheck, Lock, Check } from "lucide-react"

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
    name: string
    role_key: string
    key: string
    level_key: string
}

interface Props {
    menus: DBMenu[]
    availableLevels: LevelItem[]
}

export default function Menus({ menus, availableLevels = [] }: Props) {
    const handleRoleToggle = (menu: DBMenu, level: LevelItem, isChecked: boolean) => {
        let updatedRoles = [...menu.roles]
        const keysToToggle = [level.key, level.level_key]

        if (isChecked) {
            keysToToggle.forEach((k) => {
                if (!updatedRoles.includes(k)) {
                    updatedRoles.push(k)
                }
            })
        } else {
            updatedRoles = updatedRoles.filter((r) => !keysToToggle.includes(r))
        }

        router.put(
            route("settings.menus.update", menu.id),
            { roles: updatedRoles },
            {
                preserveScroll: true,
            }
        )
    }

    const isLevelChecked = (menu: DBMenu, level: LevelItem) => {
        return menu.roles.includes(level.key) || menu.roles.includes(level.level_key)
    }

    return (
        <PageLayout
            title="Hak Akses Menu (RBAC)"
            breadcrumbParent="Settings Travel"
            breadcrumbPage="Roles & Permissions"
            contentClass="p-6 md:p-8 flex flex-col gap-6 w-full max-w-none"
        >
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card/60 backdrop-blur-md p-6 rounded-2xl border border-border/80 shadow-xs">
                <div>
                    <div className="flex items-center gap-2.5">
                        <div className="h-8 w-1.5 rounded-full bg-primary" />
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                            Manajemen Hak Akses & Menu (RBAC)
                        </h1>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 ml-4">
                        Tentukan menu, sub-menu, dan modul apa saja yang dapat diakses oleh masing-masing tingkatan jabatan hierarki tenant Anda.
                    </p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
                    <Check className="w-4 h-4" />
                    <span>Perubahan Tersimpan Otomatis</span>
                </div>
            </div>

            {/* Table Card (Full Width) */}
            <div className="overflow-hidden rounded-2xl border border-border/80 bg-card/70 backdrop-blur-md shadow-xs">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-border/80 bg-muted/50">
                                <th className="px-6 py-4 text-sm font-bold text-foreground">
                                    Modul / Menu Sistem
                                </th>
                                {availableLevels.map((level) => (
                                    <th
                                        key={level.id}
                                        className="px-6 py-4 text-center text-sm font-bold text-foreground"
                                    >
                                        <div className="flex flex-col items-center">
                                            <span>{level.name}</span>
                                            <span className="text-[10px] font-normal text-muted-foreground uppercase tracking-wider">
                                                {level.role_key}
                                            </span>
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60">
                            {menus.map((menu) => (
                                <React.Fragment key={menu.id}>
                                    {/* Parent Menu Row */}
                                    <tr className="hover:bg-muted/40 transition-colors bg-card/30">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 font-bold text-sm text-foreground">
                                                <span>{menu.title}</span>
                                                <span className="text-xs font-mono font-normal text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-md border border-border/40">
                                                    {menu.url}
                                                </span>
                                            </div>
                                        </td>
                                        {availableLevels.map((level) => (
                                            <td key={level.id} className="px-6 py-4 text-center">
                                                <div className="flex justify-center">
                                                    <Checkbox
                                                        checked={isLevelChecked(menu, level)}
                                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                                            handleRoleToggle(
                                                                menu,
                                                                level,
                                                                e.target.checked
                                                            )
                                                        }
                                                    />
                                                </div>
                                            </td>
                                        ))}
                                    </tr>

                                    {/* Sub-Menu Rows */}
                                    {menu.children &&
                                        menu.children.map((child) => (
                                            <tr
                                                key={child.id}
                                                className="hover:bg-muted/30 bg-muted/15 transition-colors"
                                            >
                                                <td className="px-6 py-3 pl-12">
                                                    <div className="flex items-center gap-2 text-sm text-foreground/90">
                                                        <span className="text-muted-foreground text-xs">
                                                            ↳
                                                        </span>
                                                        <span className="font-semibold">
                                                            {child.title}
                                                        </span>
                                                        <span className="text-[11px] font-mono text-muted-foreground">
                                                            ({child.url})
                                                        </span>
                                                    </div>
                                                </td>
                                                {availableLevels.map((level) => (
                                                    <td
                                                        key={level.id}
                                                        className="px-6 py-3 text-center"
                                                    >
                                                        <div className="flex justify-center">
                                                            <Checkbox
                                                                checked={isLevelChecked(child, level)}
                                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                                                    handleRoleToggle(
                                                                        child,
                                                                        level,
                                                                        e.target.checked
                                                                    )
                                                                }
                                                            />
                                                        </div>
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </PageLayout>
    )
}
