import React, { useState, useMemo, useEffect } from "react";
import { Head, Link } from "@inertiajs/react";
import {
    BookOpen,
    Search,
    ChevronRight,
    ArrowLeft,
    ArrowRight,
    LayoutDashboard,
    Layers,
    UserCheck,
    Compass,
    Menu as MenuIcon,
    X,
    Sparkles,
    ShieldCheck,
    Users,
    Briefcase,
    Home,
    Sun,
    Moon,
} from "lucide-react";
import { useTheme } from "@/Components/ThemeProvider";

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
    headings: HeadingItem[];
    html: string;
    raw: string;
}

interface Props {
    tenant: {
        id: number;
        nama_travel: string;
        domain_atau_subdomain: string;
        logo?: string;
    } | null;
    currentRole: "portal" | "owner" | "agent";
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

export default function DocsIndex({
    tenant,
    currentRole,
    currentSlug,
    navigation,
    activeDoc,
    isAuthenticated,
}: Props) {
    const [searchQuery, setSearchQuery] = useState("");
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const roleNavItems = useMemo(() => {
        if (currentRole === "portal") {
            return [];
        }
        return navigation[currentRole] || [];
    }, [currentRole, navigation]);

    // Group nav items by category
    const groupedNavItems = useMemo(() => {
        const filtered = roleNavItems.filter((item) => {
            if (!searchQuery.trim()) return true;
            return (
                item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.category.toLowerCase().includes(searchQuery.toLowerCase())
            );
        });

        const groups: Record<string, NavItem[]> = {};
        filtered.forEach((item) => {
            const cat = item.category || "Modul Panduan";
            if (!groups[cat]) {
                groups[cat] = [];
            }
            groups[cat].push(item);
        });

        return groups;
    }, [roleNavItems, searchQuery]);

    // Find Previous and Next Articles for pagination
    const { prevDoc, nextDoc } = useMemo(() => {
        const currentIndex = roleNavItems.findIndex(
            (item) => item.slug === currentSlug
        );
        if (currentIndex === -1) {
            return { prevDoc: null, nextDoc: null };
        }
        const prev = currentIndex > 0 ? roleNavItems[currentIndex - 1] : null;
        const next =
            currentIndex < roleNavItems.length - 1
                ? roleNavItems[currentIndex + 1]
                : null;
        return { prevDoc: prev, nextDoc: next };
    }, [roleNavItems, currentSlug]);

    // Handle Image Clicks inside Markdown to open Lightbox
    useEffect(() => {
        const handleDocClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (target && target.tagName === "IMG") {
                const img = target as HTMLImageElement;
                if (img.src && (img.src.includes("/docs/assets/") || img.src.includes("screenshots"))) {
                    e.preventDefault();
                    setSelectedImage(img.src);
                }
            }
        };

        const docContainer = document.getElementById("docs-body-content");
        if (docContainer) {
            docContainer.addEventListener("click", handleDocClick);
        }

        return () => {
            if (docContainer) {
                docContainer.removeEventListener("click", handleDocClick);
            }
        };
    }, [activeDoc]);

    const travelName = tenant?.nama_travel || "Hajj & Umroh Travel";
    const { theme, setTheme } = useTheme();

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col antialiased selection:bg-primary/20 selection:text-primary">
            <Head title={`${activeDoc?.title || "Buku Panduan"} - ${travelName} Docs`} />

            {/* EMBEDDED CUSTOM MARKDOWN STYLES */}
            <style>{`
                .docs-rendered-markdown h1 {
                    font-size: 1.75rem;
                    font-weight: 800;
                    letter-spacing: -0.025em;
                    color: var(--foreground);
                    padding-bottom: 0.75rem;
                    margin-bottom: 1.5rem;
                    border-bottom: 1px solid var(--border);
                }
                .docs-rendered-markdown h2 {
                    font-size: 1.35rem;
                    font-weight: 700;
                    letter-spacing: -0.02em;
                    color: var(--foreground);
                    margin-top: 2.25rem;
                    margin-bottom: 0.85rem;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }
                .docs-rendered-markdown h3 {
                    font-size: 1.05rem;
                    font-weight: 600;
                    color: var(--foreground);
                    margin-top: 1.5rem;
                    margin-bottom: 0.6rem;
                }
                .docs-rendered-markdown p {
                    font-size: 0.875rem;
                    line-height: 1.75;
                    color: var(--muted-foreground);
                    margin-bottom: 1rem;
                }
                .docs-rendered-markdown blockquote {
                    border-left: 4px solid var(--primary);
                    background: rgba(var(--primary-rgb, 111, 78, 55), 0.08);
                    border-radius: 0 0.75rem 0.75rem 0;
                    padding: 0.85rem 1.25rem;
                    margin: 1.25rem 0;
                    color: var(--foreground);
                    font-size: 0.85rem;
                }
                .docs-rendered-markdown blockquote p {
                    margin-bottom: 0.35rem;
                    color: var(--foreground);
                }
                .docs-rendered-markdown blockquote p:last-child {
                    margin-bottom: 0;
                }
                .docs-rendered-markdown ul {
                    list-style-type: disc;
                    padding-left: 1.4rem;
                    margin: 0.85rem 0;
                    font-size: 0.875rem;
                    color: var(--muted-foreground);
                }
                .docs-rendered-markdown ol {
                    list-style-type: decimal;
                    padding-left: 1.4rem;
                    margin: 0.85rem 0;
                    font-size: 0.875rem;
                    color: var(--muted-foreground);
                }
                .docs-rendered-markdown li {
                    margin-bottom: 0.4rem;
                    line-height: 1.6;
                }
                .docs-rendered-markdown code {
                    background: var(--muted);
                    color: var(--foreground);
                    padding: 0.15rem 0.4rem;
                    border-radius: 0.375rem;
                    font-size: 0.8rem;
                    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
                    border: 1px solid var(--border);
                }
                .docs-rendered-markdown pre {
                    background: var(--muted);
                    padding: 1rem;
                    border-radius: 0.75rem;
                    overflow-x: auto;
                    margin: 1.25rem 0;
                    border: 1px solid var(--border);
                }
                .docs-rendered-markdown table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 1.5rem 0;
                    font-size: 0.8rem;
                    border-radius: 0.75rem;
                    overflow: hidden;
                    border: 1px solid var(--border);
                }
                .docs-rendered-markdown th {
                    background: var(--muted);
                    font-weight: 700;
                    text-align: left;
                    padding: 0.75rem 1rem;
                    border: 1px solid var(--border);
                    color: var(--foreground);
                }
                .docs-rendered-markdown td {
                    padding: 0.75rem 1rem;
                    border: 1px solid var(--border);
                    color: var(--muted-foreground);
                }
                .docs-rendered-markdown tr:hover td {
                    background: rgba(var(--primary-rgb, 111, 78, 55), 0.03);
                }
                .docs-rendered-markdown img {
                    border-radius: 1rem;
                    border: 1px solid var(--border);
                    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
                    margin: 1.5rem 0;
                    max-width: 100%;
                    cursor: zoom-in;
                    transition: transform 0.2s ease;
                }
                .docs-rendered-markdown img:hover {
                    transform: scale(1.005);
                }
                .docs-rendered-markdown hr {
                    border: 0;
                    border-top: 1px solid var(--border);
                    margin: 2rem 0;
                }
                .docs-rendered-markdown a {
                    color: var(--primary);
                    font-weight: 600;
                    text-decoration: underline;
                    text-underline-offset: 3px;
                }
                .docs-rendered-markdown a:hover {
                    opacity: 0.85;
                }
            `}</style>

            {/* TOP HEADER */}
            <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur-md">
                <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
                    {/* Brand & Mobile Toggle */}
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="lg:hidden p-2 rounded-xl border border-border bg-card hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                            aria-label="Toggle Menu"
                        >
                            {mobileMenuOpen ? (
                                <X className="w-5 h-5" />
                            ) : (
                                <MenuIcon className="w-5 h-5" />
                            )}
                        </button>

                        <Link
                            href="/docs"
                            className="flex items-center gap-2.5 group"
                        >
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-amber-500 flex items-center justify-center text-primary-foreground shadow-md shadow-primary/20 group-hover:scale-105 transition-transform">
                                <BookOpen className="w-5 h-5" />
                            </div>
                            <div className="flex flex-col">
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-sm sm:text-base tracking-tight text-foreground">
                                        {travelName}
                                    </span>
                                    <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                                        Docs
                                    </span>
                                </div>
                                <span className="text-[11px] text-muted-foreground hidden sm:inline-block">
                                    Buku Panduan & Dokumentasi Resmi
                                </span>
                            </div>
                        </Link>
                    </div>

                    {/* Role Switcher Tabs (Desktop) */}
                    <div className="hidden md:flex items-center p-1 bg-muted/60 rounded-xl border border-border/60">
                        <Link
                            href="/docs"
                            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                                currentRole === "portal"
                                    ? "bg-background text-foreground shadow-sm font-bold"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            <Compass className="w-3.5 h-3.5" />
                            Portal Ringkasan
                        </Link>
                        <Link
                            href="/docs/owner"
                            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                                currentRole === "owner"
                                    ? "bg-background text-foreground shadow-sm font-bold"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                            Owner Travel (Level 1)
                        </Link>
                        <Link
                            href="/docs/agent"
                            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                                currentRole === "agent"
                                    ? "bg-background text-foreground shadow-sm font-bold"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            <Users className="w-3.5 h-3.5 text-emerald-500" />
                            Mitra Agen (Level 2/3)
                        </Link>
                    </div>

                    {/* Right Action Buttons */}
                    <div className="flex items-center gap-2.5">
                        <button
                            type="button"
                            onClick={() =>
                                setTheme(
                                    theme === "luxury" || theme === "dark"
                                        ? "caramellatte"
                                        : "luxury"
                                )
                            }
                            className="p-2 rounded-xl border border-border bg-card hover:bg-accent text-foreground transition-colors"
                            title="Ganti Tema Warna"
                        >
                            {theme === "caramellatte" || theme === "light" ? (
                                <Moon className="w-4 h-4 text-amber-500" />
                            ) : (
                                <Sun className="w-4 h-4 text-amber-400" />
                            )}
                        </button>

                        {isAuthenticated ? (
                            <Link
                                href="/dashboard"
                                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm transition-all"
                            >
                                <LayoutDashboard className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Masuk ke</span> Dashboard
                            </Link>
                        ) : (
                            <Link
                                href="/login"
                                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm transition-all"
                            >
                                <UserCheck className="w-3.5 h-3.5" />
                                Login Sistem
                            </Link>
                        )}
                    </div>
                </div>

                {/* Mobile Role Switcher (Under Header on small screens) */}
                <div className="flex md:hidden border-t border-border px-4 py-2 bg-muted/30 overflow-x-auto gap-2">
                    <Link
                        href="/docs"
                        className={`px-3 py-1 text-xs whitespace-nowrap rounded-lg border font-medium ${
                            currentRole === "portal"
                                ? "bg-primary text-primary-foreground border-primary font-bold"
                                : "bg-card text-muted-foreground border-border"
                        }`}
                    >
                        Portal
                    </Link>
                    <Link
                        href="/docs/owner"
                        className={`px-3 py-1 text-xs whitespace-nowrap rounded-lg border font-medium ${
                            currentRole === "owner"
                                ? "bg-primary text-primary-foreground border-primary font-bold"
                                : "bg-card text-muted-foreground border-border"
                        }`}
                    >
                        🏢 Panduan Owner
                    </Link>
                    <Link
                        href="/docs/agent"
                        className={`px-3 py-1 text-xs whitespace-nowrap rounded-lg border font-medium ${
                            currentRole === "agent"
                                ? "bg-primary text-primary-foreground border-primary font-bold"
                                : "bg-card text-muted-foreground border-border"
                        }`}
                    >
                        🤝 Panduan Agen
                    </Link>
                </div>
            </header>

            {/* MAIN CONTENT LAYOUT */}
            <div className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 flex gap-8 py-6">
                {/* LEFT SIDEBAR (Desktop Column & Mobile Drawer) */}
                <aside
                    className={`
                        fixed inset-y-0 left-0 z-50 w-72 bg-background border-r border-border p-5
                        transform transition-transform duration-300 ease-in-out
                        lg:static lg:translate-x-0 lg:z-auto lg:p-0 lg:border-r-0 lg:bg-transparent lg:shrink-0
                        ${mobileMenuOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full lg:translate-x-0"}
                    `}
                >
                    <div className="flex items-center justify-between pb-4 lg:hidden border-b border-border mb-4">
                        <span className="font-bold text-sm">Daftar Modul Panduan</span>
                        <button
                            type="button"
                            onClick={() => setMobileMenuOpen(false)}
                            className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto pr-3 space-y-6">
                        {/* Search Filter */}
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Cari topik atau fitur..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-card border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-muted-foreground/60"
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={() => setSearchQuery("")}
                                    className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground text-xs"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>

                        {/* Navigation Items */}
                        {currentRole === "portal" ? (
                            <div className="space-y-3">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-2">
                                    Pilihan Panduan Peran
                                </span>
                                <div className="space-y-1.5">
                                    <Link
                                        href="/docs/owner"
                                        className="flex items-center gap-2.5 px-3 py-2.5 text-xs font-semibold rounded-xl bg-card hover:bg-accent text-foreground border border-border transition-all group"
                                    >
                                        <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
                                            1
                                        </div>
                                        <div>
                                            <div className="font-bold">Panduan Owner Travel</div>
                                            <div className="text-[10px] text-muted-foreground">
                                                12 Modul Operasional & Finansial
                                            </div>
                                        </div>
                                        <ChevronRight className="w-4 h-4 ml-auto text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                                    </Link>
                                    <Link
                                        href="/docs/agent"
                                        className="flex items-center gap-2.5 px-3 py-2.5 text-xs font-semibold rounded-xl bg-card hover:bg-accent text-foreground border border-border transition-all group"
                                    >
                                        <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
                                            2
                                        </div>
                                        <div>
                                            <div className="font-bold">Panduan Mitra Agen</div>
                                            <div className="text-[10px] text-muted-foreground">
                                                6 Modul Penjualan & Bio Link
                                            </div>
                                        </div>
                                        <ChevronRight className="w-4 h-4 ml-auto text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-5">
                                {Object.entries(groupedNavItems).map(
                                    ([category, items]) => (
                                        <div key={category} className="space-y-1">
                                            <div className="flex items-center gap-1.5 px-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
                                                <Layers className="w-3 h-3 text-primary" />
                                                <span>{category}</span>
                                            </div>
                                            <div className="space-y-0.5">
                                                {items.map((item) => {
                                                    const isActive =
                                                        item.slug === currentSlug;
                                                    const orderStr =
                                                        item.order > 0
                                                            ? String(item.order).padStart(2, "0")
                                                            : "★";

                                                    return (
                                                        <Link
                                                            key={item.slug}
                                                            href={`/docs/${currentRole}/${item.slug}`}
                                                            onClick={() =>
                                                                setMobileMenuOpen(false)
                                                            }
                                                            className={`flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-lg transition-all group ${
                                                                isActive
                                                                    ? "bg-primary text-primary-foreground font-bold shadow-xs"
                                                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                                            }`}
                                                        >
                                                            <span
                                                                className={`w-5 h-5 flex items-center justify-center rounded text-[10px] font-mono shrink-0 ${
                                                                    isActive
                                                                        ? "bg-white/20 text-white font-bold"
                                                                        : "bg-muted text-muted-foreground group-hover:bg-card"
                                                                }`}
                                                            >
                                                                {orderStr}
                                                            </span>
                                                            <span className="truncate">
                                                                {item.title}
                                                            </span>
                                                        </Link>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )
                                )}
                            </div>
                        )}
                    </div>
                </aside>

                {/* MOBILE OVERLAY */}
                {mobileMenuOpen && (
                    <div
                        className="fixed inset-0 z-40 bg-black/60 lg:hidden backdrop-blur-xs"
                        onClick={() => setMobileMenuOpen(false)}
                    />
                )}

                {/* CENTER CONTENT */}
                <main className="flex-1 min-w-0 max-w-4xl">
                    {/* Breadcrumbs */}
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-6 pb-2 border-b border-border/60">
                        <Link
                            href="/docs"
                            className="hover:text-foreground flex items-center gap-1"
                        >
                            <Home className="w-3 h-3" /> Docs
                        </Link>
                        <ChevronRight className="w-3 h-3 text-muted-foreground/60" />
                        <Link
                            href={`/docs/${currentRole}`}
                            className="hover:text-foreground capitalize font-medium"
                        >
                            {currentRole === "owner"
                                ? "Owner Travel"
                                : currentRole === "agent"
                                ? "Mitra Agen"
                                : "Portal"}
                        </Link>
                        {activeDoc && activeDoc.slug !== "overview" && (
                            <>
                                <ChevronRight className="w-3 h-3 text-muted-foreground/60" />
                                <span className="text-foreground font-semibold truncate max-w-[240px] sm:max-w-none">
                                    {activeDoc.title}
                                </span>
                            </>
                        )}
                    </div>

                    {/* DOCS ARTICLE BODY */}
                    {activeDoc ? (
                        <div className="space-y-6">
                            <article
                                id="docs-body-content"
                                className="docs-rendered-markdown"
                                dangerouslySetInnerHTML={{ __html: activeDoc.html }}
                            />

                            {/* PREV & NEXT BUTTONS */}
                            <div className="pt-8 mt-10 border-t border-border flex items-center justify-between gap-4">
                                {prevDoc ? (
                                    <Link
                                        href={`/docs/${currentRole}/${prevDoc.slug}`}
                                        className="flex flex-col gap-1 p-3.5 rounded-xl border border-border hover:border-primary hover:bg-card transition-all max-w-[45%]"
                                    >
                                        <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                                            <ArrowLeft className="w-3 h-3" /> Sebelumnya
                                        </span>
                                        <span className="text-xs font-bold text-foreground truncate">
                                            {prevDoc.title}
                                        </span>
                                    </Link>
                                ) : (
                                    <div />
                                )}

                                {nextDoc && (
                                    <Link
                                        href={`/docs/${currentRole}/${nextDoc.slug}`}
                                        className="flex flex-col items-end gap-1 p-3.5 rounded-xl border border-border hover:border-primary hover:bg-card transition-all max-w-[45%] text-right"
                                    >
                                        <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                                            Selanjutnya <ArrowRight className="w-3 h-3" />
                                        </span>
                                        <span className="text-xs font-bold text-foreground truncate">
                                            {nextDoc.title}
                                        </span>
                                    </Link>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="p-12 text-center border rounded-2xl bg-card border-border space-y-3">
                            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto" />
                            <h3 className="font-bold text-base">Dokumentasi Tidak Ditemukan</h3>
                            <p className="text-xs text-muted-foreground max-w-md mx-auto">
                                Halaman panduan yang Anda cari tidak tersedia. Silakan pilih modul dari menu di sebelah kiri.
                            </p>
                        </div>
                    )}
                </main>

                {/* RIGHT SIDEBAR (Table of Contents - Desktop) */}
                {activeDoc && activeDoc.headings.length > 0 && (
                    <aside className="hidden xl:block w-64 shrink-0">
                        <div className="sticky top-24 space-y-4">
                            <div className="p-4 rounded-2xl bg-card border border-border shadow-xs space-y-3">
                                <span className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                                    <Sparkles className="w-3.5 h-3.5 text-primary" />
                                    Daftar Isi Halaman
                                </span>
                                <nav className="space-y-1 text-xs">
                                    {activeDoc.headings.map((h, i) => (
                                        <a
                                            key={i}
                                            href={`#${h.anchor}`}
                                            className={`block py-1 text-muted-foreground hover:text-foreground transition-colors truncate ${
                                                h.level === 3 ? "pl-3 text-[11px]" : "font-medium"
                                            }`}
                                        >
                                            {h.title}
                                        </a>
                                    ))}
                                </nav>
                            </div>

                            <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/10 via-amber-500/5 to-transparent border border-primary/20 space-y-2">
                                <div className="flex items-center gap-2 text-primary font-bold text-xs">
                                    <Briefcase className="w-4 h-4" />
                                    <span>Butuh Bantuan?</span>
                                </div>
                                <p className="text-[11px] text-muted-foreground leading-relaxed">
                                    Hubungi tim teknis atau administrator travel jika ada modul yang belum dipahami.
                                </p>
                            </div>
                        </div>
                    </aside>
                )}
            </div>

            {/* LIGHTBOX MODAL FOR SCREENSHOTS */}
            {selectedImage && (
                <div
                    className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
                    onClick={() => setSelectedImage(null)}
                >
                    <div className="relative max-w-5xl max-h-[90vh] bg-card rounded-2xl overflow-hidden border border-border shadow-2xl p-2">
                        <button
                            type="button"
                            onClick={() => setSelectedImage(null)}
                            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/60 text-white hover:bg-black transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <img
                            src={selectedImage}
                            alt="Screenshot Zoom"
                            className="max-h-[85vh] w-auto mx-auto object-contain rounded-xl"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
