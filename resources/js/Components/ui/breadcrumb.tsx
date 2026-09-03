import * as React from "react"
import { cn } from "@/lib/utils"

export function Breadcrumb({ children, className }: { children: React.ReactNode; className?: string }) {
    return <nav aria-label="breadcrumb" className={className}>{children}</nav>
}

export function BreadcrumbList({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <ol className={cn("flex flex-wrap items-center gap-1.5 break-words text-sm text-muted-foreground sm:gap-2.5", className)}>
            {children}
        </ol>
    )
}

export function BreadcrumbItem({ children, className }: { children: React.ReactNode; className?: string }) {
    return <li className={cn("inline-flex items-center gap-1.5", className)}>{children}</li>
}

export function BreadcrumbLink({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) {
    return (
        <a href={href} className={cn("hover:text-foreground transition-colors", className)}>
            {children}
        </a>
    )
}

export function BreadcrumbSeparator({ children, className }: { children?: React.ReactNode; className?: string }) {
    return (
        <li role="presentation" aria-hidden="true" className={cn("[&>svg]:size-3.5", className)}>
            {children || "/"}
        </li>
    )
}

export function BreadcrumbPage({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <span role="link" aria-disabled="true" aria-current="page" className={cn("font-normal text-foreground", className)}>
            {children}
        </span>
    )
}
