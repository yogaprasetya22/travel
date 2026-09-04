import React, { useState, useMemo, useEffect } from "react";
import { Head, Link, router } from "@inertiajs/react";
import {
    BookOpen,
    Search,
    ChevronRight,
    ArrowLeft,
    ArrowRight,
    LayoutDashboard,
    Layers,
    UserCheck,
    CheckCircle2,
    Compass,
    Menu as MenuIcon,
    X,
    ExternalLink,
    Maximize2,
    Sparkles,
    ShieldCheck,
    Users,
    Briefcase,
    Home,
    Sun,
    Moon,
    Palette,
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
    currentUser,
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
                if (img.src && img.src.includes("/docs/assets/")) {
                    e.preventDefault();
                    setSelectedImage(img.src);
                }
            }
        };

        const docContainer = document.getElementById("markdown-content");
        if (docContainer) {
            docContainer.addEventListener("click", handleDocClick);
        }

        return () => {
            if (docContainer) {
                docContainer.removeEventListener("click", handleDocClick);
            }
        };
    }, [activeDoc]);

    const travelName = tenant?.nama_travel || "Hajj & Umroh System";

    const { theme, setTheme } = useTheme();

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col antialiased selection:bg-primary/20 selection:text-primary">
            <Head title={`${activeDoc?.title || "Buku Panduan"} - ${travelName} Docs`} />

            {/* TOP HEADER */}
            <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/90 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
                    {/* Brand & Mobile Toggle */}
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="lg:hidden p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
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
                            onClick={() => setTheme(theme === 'luxury' || theme === 'dark' ? 'caramellatte' : 'luxury')}
                            className="p-2 rounded-xl border border-border bg-card hover:bg-accent text-foreground transition-colors"
                            title="Ganti Tema Warna"
                        >
                            {theme === 'caramellatte' || theme === 'light' ? (
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

            {/* MAIN CONTENT WRAPPER */}
            <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 flex gap-8 py-6">
                {/* LEFT SIDEBAR (Desktop & Mobile Drawer) */}
                <aside
                    className={`fixed inset-y-0 left-0 z-50 w-72 bg-background border-r border-border p-5 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:z-0 lg:p-0 lg:border-r-0 lg:bg-transparent ${
                        mobileMenuOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
                    }`}
                >
                    <div className="flex items-center justify-between pb-4 lg:hidden border-b border-border mb-4">
                        <span className="font-bold text-sm">Daftar Modul Panduan</span>
                        <button
                            type="button"
                            onClick={() => setMobileMenuOpen(false)}
                            className="p-1 rounded-lg hover:bg-accent text-muted-foreground"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto pr-2 space-y-6">
                        {/* Search in Nav */}
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

                        {/* Navigation List Grouped */}
                        {currentRole === "portal" ? (
                            <div className="space-y-3">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-2">
                                    Pilihan Panduan Peran
                                </span>
                                <div className="space-y-1">
                                    <Link
                                        href="/docs/owner"
                                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-xl bg-card hover:bg-accent text-foreground border border-border transition-all group"
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
                                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-xl bg-card hover:bg-accent text-foreground border border-border transition-all group"
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
                            <div className="space-y-6">
                                {Object.entries(groupedNavItems).map(
                                    ([category, items]) => (
                                        <div key={category} className="space-y-1.5">
                                            <div className="flex items-center gap-1.5 px-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
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
                                                                    ? "bg-primary/10 text-primary font-bold border-l-2 border-primary"
                                                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                                            }`}
                                                        >
                                                            <span
                                                                className={`w-5 h-5 flex items-center justify-center rounded text-[10px] font-mono shrink-0 ${
                                                                    isActive
                                                                        ? "bg-primary text-primary-foreground font-bold"
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

                {/* BACKDROP OVERLAY FOR MOBILE */}
                {mobileMenuOpen && (
                    <div
                        className="fixed inset-0 z-40 bg-black/50 lg:hidden backdrop-blur-sm"
                        onClick={() => setMobileMenuOpen(false)}
                    />
                )}

                {/* CENTER ARTICLE CONTENT */}
                <main className="flex-1 min-w-0">
                    {/* Breadcrumbs */}
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4 pb-2 border-b border-border/60">
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
                                <span className="text-foreground font-semibold truncate max-w-[200px] sm:max-w-none">
                                    {activeDoc.title}
                                </span>
                            </>
                        )}
                    </div>

                    {/* ARTICLE BODY */}
                    {activeDoc ? (
                        <div className="space-y-6">
                            <article
                                id="markdown-content"
                                className="prose prose-slate dark:prose-invert max-w-none
                                prose-headings:font-bold prose-headings:tracking-tight
                                prose-h1:text-2xl sm:prose-h1:text-3xl prose-h1:border-b prose-h1:border-border prose-h1:pb-3 prose-h1:text-foreground
                                prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-3 prose-h2:text-foreground
                                prose-h3:text-base prose-h3:mt-5 prose-h3:mb-2 prose-h3:text-foreground
                                prose-p:text-sm prose-p:leading-relaxed prose-p:text-muted-foreground
                                prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:bg-muted/40 prose-blockquote:p-4 prose-blockquote:rounded-r-xl prose-blockquote:not-italic prose-blockquote:text-xs prose-blockquote:text-foreground
                                prose-ul:my-2 prose-ul:text-xs prose-ul:text-muted-foreground prose-li:my-1
                                prose-table:w-full prose-table:text-xs prose-th:p-2.5 prose-th:bg-muted prose-th:border prose-th:border-border prose-td:p-2.5 prose-td:border prose-td:border-border
                                prose-img:rounded-2xl prose-img:border prose-img:border-border prose-img:shadow-lg prose-img:cursor-zoom-in prose-img:transition-transform hover:prose-img:scale-[1.01]"
                                dangerouslySetInnerHTML={{ __html: activeDoc.html }}
                            />

                            {/* PREV & NEXT ARTICLE PAGINATION */}
                            <div className="pt-8 mt-8 border-t border-border flex items-center justify-between gap-4">
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
