import * as React from "react"

export function Breadcrumb({ children }: { children: React.ReactNode }) {
    return <nav aria-label="breadcrumb">{children}</nav>
}

export function BreadcrumbList({ children }: { children: React.ReactNode }) {
    return (
        <ol className="flex flex-wrap items-center gap-1.5 break-words text-sm text-muted-foreground sm:gap-2.5">
            {children}
        </ol>
    )
}

export function BreadcrumbItem({ children, className }: { children: React.ReactNode; className?: string }) {
    return <li className={`inline-flex items-center gap-1.5 ${className || ""}`}>{children}</li>
}

export function BreadcrumbLink({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) {
    return (
        <a href={href} className={`hover:text-foreground transition-colors ${className || ""}`}>
            {children}
        </a>
    )
}

export function BreadcrumbSeparator({ children, className }: { children?: React.ReactNode; className?: string }) {
    return (
        <li role="presentation" aria-hidden="true" className={`[&>svg]:size-3.5 ${className || ""}`}>
            {children || "/"}
        </li>
    )
}

export function BreadcrumbPage({ children }: { children: React.ReactNode }) {
    return (
        <span role="link" aria-disabled="true" aria-current="page" className="font-normal text-foreground">
            {children}
        </span>
    )
}
