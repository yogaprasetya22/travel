import { useState, useMemo, useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Head, Link } from "@inertiajs/react";
import PageLayout from "@/Components/Layouts/PageLayout";
import { useTheme } from "@/Components/ThemeProvider";
import { ArrowLeft, ArrowRight, ExternalLink, ListFilter, LogIn, Moon, Search, Sun, X } from "lucide-react";

interface NavItem {
    title: string;
    slug: string;
    order: number;
    category: string;
    filepath: string;
}

interface HeadingItem {
    level: number;
    title: string;
    anchor: string;
}

interface ActiveDoc {
    title: string;
    slug: string;
    role: string;
    meta?: { peran?: string; kategori?: string; halaman?: string; ringkasan?: string };
    headings: HeadingItem[];
    html: string;
    raw: string;
}

type Role = "portal" | "owner" | "agent";

interface Props {
    tenant: {
        id: number;
        nama_travel: string;
        domain_atau_subdomain: string;
        logo?: string;
    } | null;
    currentRole: Role;
    currentSlug: string;
    navigation: {
        owner: NavItem[];
        agent: NavItem[];
    };
    activeDoc: ActiveDoc | null;
    isAuthenticated: boolean;
    currentUser: {
        name: string;
        email: string;
        role: string;
    } | null;
}

const roleTabs: { role: Role; label: string; href: string }[] = [
    { role: "portal", label: "Ringkasan", href: "/docs" },
    { role: "owner", label: "Owner & staf", href: "/docs/owner" },
    { role: "agent", label: "Mitra agen", href: "/docs/agent" },
];

const proseStyles = `
.docs-prose { font-size: 0.9375rem; line-height: 1.75; color: hsl(var(--foreground) / 0.88); }
.docs-prose > *:first-child { margin-top: 0; }
.docs-prose h1 { font-size: 1.875rem; line-height: 1.2; font-weight: 700; letter-spacing: -0.02em; color: hsl(var(--foreground)); margin: 0 0 0.75rem; }
.docs-prose h1 + p { font-size: 1.0625rem; line-height: 1.65; color: hsl(var(--muted-foreground)); margin-bottom: 1.5rem; }
.docs-prose h2 { font-size: 1.25rem; line-height: 1.3; font-weight: 650; letter-spacing: -0.01em; color: hsl(var(--foreground)); margin: 2.75rem 0 1rem; padding-bottom: 0.5rem; border-bottom: 1px solid hsl(var(--border)); }
.docs-prose h3 { font-size: 1rem; font-weight: 600; color: hsl(var(--foreground)); margin: 1.75rem 0 0.5rem; }
.docs-prose h2 a, .docs-prose h3 a { margin-left: 0.5rem; text-decoration: none; font-weight: 400; color: hsl(var(--muted-foreground)); }
.docs-prose p { margin: 0 0 1rem; }
.docs-prose strong { font-weight: 600; color: hsl(var(--foreground)); }
.docs-prose a { color: hsl(var(--primary)); font-weight: 500; text-decoration: underline; text-underline-offset: 3px; text-decoration-color: hsl(var(--primary) / 0.35); }
.docs-prose a:hover { text-decoration-color: currentColor; }
.docs-prose ul, .docs-prose ol { margin: 0 0 1.25rem; padding-left: 1.4rem; }
.docs-prose ul { list-style: disc; }
.docs-prose ol { list-style: decimal; }
.docs-prose li { margin: 0.35rem 0; padding-left: 0.25rem; }
.docs-prose li::marker { color: hsl(var(--muted-foreground)); }
.docs-prose blockquote { margin: 1.25rem 0; padding: 0.25rem 0 0.25rem 1rem; border-left: 2px solid hsl(var(--border)); color: hsl(var(--muted-foreground)); }
.docs-prose blockquote p { margin-bottom: 0.4rem; }
.docs-prose code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 0.8125rem; padding: 0.1rem 0.35rem; border-radius: 0.3rem; background: hsl(var(--muted)); color: hsl(var(--foreground)); }
.docs-prose pre { margin: 1.25rem 0; padding: 1rem; overflow-x: auto; border-radius: 0.5rem; border: 1px solid hsl(var(--border)); background: hsl(var(--muted)); }
.docs-prose pre code { padding: 0; background: transparent; }
.docs-prose table { width: 100%; margin: 1.25rem 0; font-size: 0.875rem; border-collapse: collapse; }
.docs-prose th { text-align: left; font-weight: 600; padding: 0.5rem 0.75rem; border-bottom: 1px solid hsl(var(--border)); color: hsl(var(--foreground)); }
.docs-prose td { padding: 0.5rem 0.75rem; border-bottom: 1px solid hsl(var(--border) / 0.6); }
.docs-prose hr { border: 0; border-top: 1px solid hsl(var(--border)); margin: 2.5rem 0; }
.docs-prose img { display: block; max-width: 100%; height: auto; margin: 1rem 0; border-radius: 0.5rem; border: 1px solid hsl(var(--border)); cursor: zoom-in; }
.docs-prose img[src*="/dark/"], .docs-prose img[src*="gh-dark-mode-only"] { display: none; }
.dark .docs-prose img[src*="/light/"], .dark .docs-prose img[src*="gh-light-mode-only"] { display: none; }
.dark .docs-prose img[src*="/dark/"], .dark .docs-prose img[src*="gh-dark-mode-only"] { display: block; }
`;

function RoleTabs({ currentRole }: { currentRole: Role }) {
    return (
        <nav aria-label="Pilih panduan" className="flex gap-6 border-b border-border">
            {roleTabs.map((tab) => {
                const active = tab.role === currentRole;
                return (
                    <Link
                        key={tab.role}
                        href={tab.href}
                        aria-current={active ? "page" : undefined}
                        className={`-mb-px border-b-2 pb-3 text-sm font-medium transition-colors ${
                            active
                                ? "border-foreground text-foreground"
                                : "border-transparent text-muted-foreground hover:text-foreground"
                        }`}
                    >
                        {tab.label}
                    </Link>
                );
            })}
        </nav>
    );
}

function PageNav({
    groups,
    role,
    currentSlug,
    search,
    onSearch,
}: {
    groups: Record<string, NavItem[]>;
    role: Role;
    currentSlug: string;
    search: string;
    onSearch: (value: string) => void;
}) {
    const entries = Object.entries(groups);

    return (
        <div className="space-y-5">
            <label className="relative block">
                <span className="sr-only">Cari halaman panduan</span>
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                    type="search"
                    value={search}
                    onChange={(e) => onSearch(e.target.value)}
                    placeholder="Cari halaman"
                    className="h-9 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm outline-none transition focus:border-foreground/40 focus:ring-2 focus:ring-ring/20"
                />
            </label>

            {entries.length === 0 && <p className="px-1 text-sm text-muted-foreground">Tidak ada halaman yang cocok.</p>}

            {entries.map(([category, items]) => (
                <div key={category}>
                    <div className="mb-1.5 px-2 text-xs font-medium text-muted-foreground">{category}</div>
                    <ul className="space-y-0.5">
                        {items.map((item) => {
                            const active = item.slug === currentSlug;
                            return (
                                <li key={item.slug}>
                                    <Link
                                        href={`/docs/${role}/${item.slug}`}
                                        aria-current={active ? "page" : undefined}
                                        className={`flex items-baseline gap-2.5 rounded-md px-2.5 py-1.5 text-sm leading-snug transition-colors ${
                                            active
                                                ? "bg-background font-semibold text-primary shadow-2xs border border-border/60"
                                                : "text-muted-foreground hover:bg-background/80 hover:text-foreground"
                                        }`}
                                    >
                                        <span className="w-5 shrink-0 text-right font-mono text-[11px] tabular-nums opacity-60">
                                            {item.order > 0 ? String(item.order).padStart(2, "0") : ""}
                                        </span>
                                        <span>{item.title}</span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            ))}
        </div>
    );
}

function TableOfContents({ headings }: { headings: HeadingItem[] }) {
    const [activeAnchor, setActiveAnchor] = useState("");

    useEffect(() => {
        if (!headings.length) return;

        const observer = new IntersectionObserver(
            (entries) => entries.forEach((entry) => entry.isIntersecting && setActiveAnchor(entry.target.id)),
            { rootMargin: "-80px 0px -65% 0px", threshold: 0.1 }
        );
        headings.forEach((h) => {
            const el = document.getElementById(h.anchor);
            if (el) observer.observe(el);
        });

        return () => observer.disconnect();
    }, [headings]);

    if (headings.length < 2) return null;

    return (
        <nav aria-label="Isi halaman" className="text-sm">
            <div className="mb-2 text-xs font-medium text-muted-foreground">Di halaman ini</div>
            <ul className="space-y-1 border-l border-border">
                {headings.map((h) => (
                    <li key={h.anchor}>
                        <a
                            href={`#${h.anchor}`}
                            className={`-ml-px block border-l py-1 leading-snug transition-colors ${
                                h.level === 3 ? "pl-6 text-[13px]" : "pl-3"
                            } ${
                                activeAnchor === h.anchor
                                    ? "border-foreground font-medium text-foreground"
                                    : "border-transparent text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            {h.title}
                        </a>
                    </li>
                ))}
            </ul>
        </nav>
    );
}

function Pager({ role, prev, next }: { role: Role; prev: NavItem | null; next: NavItem | null }) {
    if (!prev && !next) return null;

    return (
        <div className="mt-14 grid gap-3 border-t border-border pt-6 sm:grid-cols-2">
            {prev ? (
                <Link
                    href={`/docs/${role}/${prev.slug}`}
                    className="rounded-lg border border-border p-4 transition-colors hover:bg-muted/50"
                >
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <ArrowLeft className="size-3" /> Sebelumnya
                    </span>
                    <span className="mt-1 block text-sm font-medium">{prev.title}</span>
                </Link>
            ) : (
                <span />
            )}
            {next && (
                <Link
                    href={`/docs/${role}/${next.slug}`}
                    className="rounded-lg border border-border p-4 text-right transition-colors hover:bg-muted/50 sm:col-start-2"
                >
                    <span className="flex items-center justify-end gap-1 text-xs text-muted-foreground">
                        Berikutnya <ArrowRight className="size-3" />
                    </span>
                    <span className="mt-1 block text-sm font-medium">{next.title}</span>
                </Link>
            )}
        </div>
    );
}

function Lightbox({ src, onClose }: { src: string; onClose: () => void }) {
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose]);

    return createPortal(
        <div
            role="dialog"
            aria-modal="true"
            aria-label="Pratinjau gambar"
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-4 bg-black/85 p-4"
            onClick={onClose}
        >
            <div className="flex w-full max-w-6xl justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                <a
                    href={src}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-md bg-white/10 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/20"
                >
                    <ExternalLink className="size-3.5" /> Buka gambar asli
                </a>
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Tutup"
                    className="rounded-md bg-white/10 p-1.5 text-white hover:bg-white/20"
                >
                    <X className="size-4" />
                </button>
            </div>
            <img
                src={src}
                alt="Tangkapan layar diperbesar"
                onClick={(e) => e.stopPropagation()}
                className="max-h-[82vh] max-w-full rounded-lg border border-white/10 object-contain"
            />
        </div>,
        document.body
    );
}

function GuestShell({ travelName, children }: { travelName: string; children: ReactNode }) {
    const { setTheme, currentThemeDef } = useTheme();
    const isDark = currentThemeDef?.type === "dark";

    return (
        <div className="min-h-screen bg-background text-foreground">
            <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur">
                <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
                    <Link href="/docs" className="flex items-baseline gap-2">
                        <span className="text-sm font-semibold">{travelName}</span>
                        <span className="text-sm text-muted-foreground">Buku Panduan</span>
                    </Link>
                    <div className="flex items-center gap-1">
                        <button
                            type="button"
                            onClick={() => setTheme(isDark ? "caramellatte" : "luxury")}
                            aria-label="Ganti tema terang atau gelap"
                            className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        >
                            {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
                        </button>
                        <Link
                            href="/login"
                            className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted"
                        >
                            <LogIn className="size-4" /> Masuk
                        </Link>
                    </div>
                </div>
            </header>
            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">{children}</main>
        </div>
    );
}

export default function DocsIndex({ tenant, currentRole, currentSlug, navigation, activeDoc, isAuthenticated }: Props) {
    const [search, setSearch] = useState("");
    const [navOpen, setNavOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const travelName = tenant?.nama_travel || "Travel";
    const pageTitle = activeDoc?.title ?? "Buku Panduan";

    const roleItems = useMemo(() => (currentRole === "portal" ? [] : navigation[currentRole] ?? []), [currentRole, navigation]);

    const groups = useMemo(() => {
        const q = search.trim().toLowerCase();
        const result: Record<string, NavItem[]> = {};
        roleItems
            .filter((item) => !q || `${item.title} ${item.category}`.toLowerCase().includes(q))
            .forEach((item) => {
                (result[item.category || "Lainnya"] ??= []).push(item);
            });
        return result;
    }, [roleItems, search]);

    const { prevDoc, nextDoc } = useMemo(() => {
        const index = roleItems.findIndex((item) => item.slug === currentSlug);
        return {
            prevDoc: index > 0 ? roleItems[index - 1] : null,
            nextDoc: index >= 0 && index < roleItems.length - 1 ? roleItems[index + 1] : null,
        };
    }, [roleItems, currentSlug]);

    useEffect(() => {
        const container = document.getElementById("docs-body-content");
        if (!container) return;

        const onClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (target.tagName === "IMG") {
                e.preventDefault();
                setSelectedImage((target as HTMLImageElement).src);
            }
        };
        container.addEventListener("click", onClick);
        return () => container.removeEventListener("click", onClick);
    }, [activeDoc]);

    useEffect(() => {
        setNavOpen(false);
    }, [currentRole, currentSlug]);

    const meta = activeDoc?.meta;

    const portalNav = (
        <ul className="space-y-0.5">
            {[
                { href: "/docs/owner", title: "Panduan owner & staf", count: navigation.owner.length },
                { href: "/docs/agent", title: "Panduan mitra agen", count: navigation.agent.length },
            ].map((entry) => (
                <li key={entry.href}>
                    <Link
                        href={entry.href}
                        className="flex items-baseline justify-between rounded-md px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-background/80 hover:text-foreground"
                    >
                        <span>{entry.title}</span>
                        <span className="text-xs tabular-nums opacity-60">{entry.count} halaman</span>
                    </Link>
                </li>
            ))}
        </ul>
    );

    const content = (
        <div className="space-y-8">
            <style>{proseStyles}</style>
            <RoleTabs currentRole={currentRole} />

            <div className="grid gap-8 lg:grid-cols-[17rem_minmax(0,1fr)] xl:grid-cols-[17rem_minmax(0,1fr)_14rem]">
                <aside className="rounded-xl border border-border/80 bg-muted/40 p-4 shadow-2xs low-scrollbar dark:bg-card/50 lg:sticky lg:top-20 lg:max-h-[calc(100vh-7rem)] lg:self-start lg:overflow-y-auto">
                    <button
                        type="button"
                        onClick={() => setNavOpen((open) => !open)}
                        aria-expanded={navOpen}
                        className="mb-3 flex w-full items-center justify-between rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium lg:hidden"
                    >
                        <span>Daftar halaman</span>
                        <ListFilter className="size-4 text-muted-foreground" />
                    </button>
                    <div className={`${navOpen ? "block" : "hidden"} lg:block`}>
                        {currentRole === "portal" ? (
                            portalNav
                        ) : (
                            <PageNav groups={groups} role={currentRole} currentSlug={currentSlug} search={search} onSearch={setSearch} />
                        )}
                    </div>
                </aside>

                <article className="min-w-0 max-w-3xl">
                    {activeDoc ? (
                        <>
                            {(meta?.peran || meta?.kategori || meta?.halaman) && (
                                <div className="mb-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                                    {[meta?.peran, meta?.kategori].filter(Boolean).join(" / ")}
                                    {meta?.halaman && <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-foreground">{meta.halaman}</code>}
                                </div>
                            )}
                            <div id="docs-body-content" className="docs-prose" dangerouslySetInnerHTML={{ __html: activeDoc.html }} />
                            <Pager role={currentRole} prev={prevDoc} next={nextDoc} />
                        </>
                    ) : (
                        <div className="py-16">
                            <h1 className="text-xl font-semibold">Halaman tidak ditemukan</h1>
                            <p className="mt-2 text-sm text-muted-foreground">Pilih halaman dari daftar di samping.</p>
                        </div>
                    )}
                </article>

                {activeDoc && (
                    <aside className="hidden xl:sticky xl:top-20 xl:block xl:self-start">
                        <TableOfContents headings={activeDoc.headings.filter((h) => h.level <= 3)} />
                    </aside>
                )}
            </div>

            {selectedImage && <Lightbox src={selectedImage} onClose={() => setSelectedImage(null)} />}
        </div>
    );

    if (!isAuthenticated) {
        return (
            <GuestShell travelName={travelName}>
                <Head title={`${pageTitle} - Buku Panduan ${travelName}`} />
                {content}
            </GuestShell>
        );
    }

    return (
        <PageLayout
            title={`${pageTitle} - Buku Panduan`}
            breadcrumbParent="Buku Panduan"
            breadcrumbPage={roleTabs.find((t) => t.role === currentRole)?.label ?? "Panduan"}
            contentClass="p-4 sm:p-6 md:p-8"
        >
            {content}
        </PageLayout>
    );
}
