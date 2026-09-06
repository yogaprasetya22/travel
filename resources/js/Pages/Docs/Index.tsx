import React, { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import { Head, Link } from "@inertiajs/react";
import PageLayout from "@/Components/Layouts/PageLayout";
import {
    SidebarProvider,
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarFooter,
    SidebarRail,
    SidebarInset,
    SidebarTrigger,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
} from "@/Components/ui/sidebar";
import { Separator } from "@/Components/ui/separator";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/Components/ui/breadcrumb";
import { useTheme } from "@/Components/ThemeProvider";
import {
    BookOpen,
    Search,
    ChevronRight,
    ArrowLeft,
    ArrowRight,
    Layers,
    Compass,
    X,
    Sparkles,
    ShieldCheck,
    Users,
    Briefcase,
    LogIn,
    Sun,
    Moon,
    Hash,
    CheckCircle2,
    ListTree,
    ExternalLink,
} from "lucide-react";

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

interface SectionGroup {
    h2: HeadingItem;
    children: HeadingItem[];
}

// Table of Contents Section Component
function TableOfContents({ headings }: { headings: HeadingItem[] }) {
    const [activeAnchor, setActiveAnchor] = useState<string>("");

    // Group headings into structured sections (H2 with its H3 children)
    const sections = useMemo(() => {
        const result: SectionGroup[] = [];
        let currentGroup: SectionGroup | null = null;

        headings.forEach((h) => {
            if (h.level === 2) {
                currentGroup = { h2: h, children: [] };
                result.push(currentGroup);
            } else if (h.level === 3) {
                if (currentGroup) {
                    currentGroup.children.push(h);
                } else {
                    // Orphan H3
                    result.push({ h2: h, children: [] });
                }
            }
        });

        return result;
    }, [headings]);

    // Scrollspy to detect currently visible heading
    useEffect(() => {
        if (!headings.length) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveAnchor(entry.target.id);
                    }
                });
            },
            {
                rootMargin: "-80px 0px -60% 0px",
                threshold: 0.1,
            }
        );

        headings.forEach((h) => {
            const el = document.getElementById(h.anchor);
            if (el) observer.observe(el);
        });

        return () => observer.disconnect();
    }, [headings]);

    const scrollToAnchor = (anchor: string) => {
        const el = document.getElementById(anchor);
        if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "start" });
            setActiveAnchor(anchor);
            history.replaceState(null, "", `#${anchor}`);
        }
    };

    if (!headings.length) return null;

    return (
        <div className="space-y-4">
            {/* Header Card */}
            <div className="p-4 rounded-2xl bg-card border border-border shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                        <ListTree className="w-4 h-4 text-primary" />
                        Daftar Isi Halaman
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-primary/10 text-primary border border-primary/20">
                        {sections.length} Bagian
                    </span>
                </div>

                <div className="space-y-2 pt-1">
                    {sections.map((sec, idx) => {
                        const isH2Active = activeAnchor === sec.h2.anchor;
                        const hasActiveChild = sec.children.some(
                            (c) => c.anchor === activeAnchor
                        );
                        const isSectionActive = isH2Active || hasActiveChild;

                        return (
                            <div
                                key={sec.h2.anchor || idx}
                                className={`rounded-xl border transition-all p-2.5 space-y-1.5 ${
                                    isSectionActive
                                        ? "bg-primary/5 border-primary/30 shadow-xs"
                                        : "bg-muted/30 border-transparent hover:bg-muted/60 hover:border-border"
                                }`}
                            >
                                {/* Main H2 Header */}
                                <button
                                    type="button"
                                    onClick={() => scrollToAnchor(sec.h2.anchor)}
                                    className={`w-full text-left flex items-start gap-2 text-xs font-semibold transition-colors ${
                                        isH2Active
                                            ? "text-primary font-bold"
                                            : "text-foreground hover:text-primary"
                                    }`}
                                >
                                    <span
                                        className={`flex items-center justify-center size-4 rounded text-[9px] font-mono shrink-0 mt-0.5 ${
                                            isH2Active
                                                ? "bg-primary text-primary-foreground font-bold"
                                                : "bg-muted text-muted-foreground"
                                        }`}
                                    >
                                        {idx + 1}
                                    </span>
                                    <span className="line-clamp-2 leading-tight">
                                        {sec.h2.title}
                                    </span>
                                </button>

                                {/* Nested H3 Subsections */}
                                {sec.children.length > 0 && (
                                    <div className="pl-6 space-y-1 pt-1 border-l border-border/80 ml-2">
                                        {sec.children.map((child) => {
                                            const isChildActive =
                                                activeAnchor === child.anchor;

                                            return (
                                                <button
                                                    key={child.anchor}
                                                    type="button"
                                                    onClick={() =>
                                                        scrollToAnchor(child.anchor)
                                                    }
                                                    className={`w-full text-left block text-[11px] py-0.5 truncate transition-all ${
                                                        isChildActive
                                                            ? "text-primary font-bold translate-x-1"
                                                            : "text-muted-foreground hover:text-foreground hover:translate-x-0.5"
                                                    }`}
                                                >
                                                    • {child.title}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Help Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/10 via-amber-500/5 to-transparent border border-primary/20 space-y-2">
                <div className="flex items-center gap-2 text-primary font-bold text-xs">
                    <Briefcase className="w-4 h-4" />
                    <span>Pusat Bantuan Travel</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Butuh panduan teknis operasional lebih lanjut? Hubungi administrator atau supervisor travel Anda.
                </p>
            </div>
        </div>
    );
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
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const { theme, setTheme, currentThemeDef } = useTheme();

    const toggleQuickTheme = () => {
        if (currentThemeDef?.type === "dark") {
            setTheme("caramellatte");
        } else {
            setTheme("luxury");
        }
    };

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
                if (
                    img.src &&
                    (img.src.includes("/docs/assets/") || img.src.includes("screenshots"))
                ) {
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
    const pageTitle = activeDoc ? activeDoc.title : "Buku Panduan";
    const roleLabel =
        currentRole === "owner"
            ? "Owner Travel (Level 1)"
            : currentRole === "agent"
            ? "Mitra Agen (Level 2/3)"
            : "Portal Dokumentasi";

    // Custom CSS for Markdown rendering
    const markdownStyles = (
        <style>{`
            .docs-rendered-markdown h1 {
                font-size: 1.65rem;
                font-weight: 800;
                letter-spacing: -0.025em;
                color: var(--foreground);
                padding-bottom: 0.75rem;
                margin-bottom: 1.25rem;
                border-bottom: 1px solid var(--border);
            }
            .docs-rendered-markdown h2 {
                font-size: 1.25rem;
                font-weight: 700;
                letter-spacing: -0.02em;
                color: var(--foreground);
                margin-top: 2rem;
                margin-bottom: 0.75rem;
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }
            .docs-rendered-markdown h3 {
                font-size: 1rem;
                font-weight: 600;
                color: var(--foreground);
                margin-top: 1.25rem;
                margin-bottom: 0.5rem;
            }
            .docs-rendered-markdown p {
                font-size: 0.875rem;
                line-height: 1.7;
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
    );

    // Close Lightbox on ESC
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setSelectedImage(null);
            }
        };
        if (selectedImage) {
            window.addEventListener("keydown", handleKeyDown);
        }
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [selectedImage]);

    // Lightbox modal component (Clean Modern Fullscreen Lightbox via Portal)
    const lightboxModal = selectedImage && typeof document !== "undefined"
        ? createPortal(
            <div
                className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-sm flex flex-col items-center justify-between p-4 sm:p-6 select-none animate-in fade-in duration-200"
                onClick={() => setSelectedImage(null)}
            >
                {/* Top Bar Actions */}
                <div
                    className="w-full flex items-center justify-between z-10 max-w-7xl px-2 py-1"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="text-xs text-neutral-400 font-medium flex items-center gap-2">
                        <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span>Pratinjau Gambar Dokumentasi</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <a
                            href={selectedImage}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-md transition flex items-center gap-1.5"
                        >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Buka Resolusi Penuh</span>
                        </a>
                        <button
                            type="button"
                            onClick={() => setSelectedImage(null)}
                            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white hover:text-rose-400 transition"
                            title="Tutup (Esc)"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Main Image Container */}
                <div
                    className="flex-1 w-full flex items-center justify-center p-2 min-h-0"
                    onClick={(e) => e.stopPropagation()}
                >
                    <img
                        src={selectedImage}
                        alt="Screenshot Zoom"
                        className="max-h-[85vh] max-w-[95vw] w-auto h-auto object-contain rounded-xl shadow-2xl border border-white/10"
                    />
                </div>

                {/* Bottom Helper */}
                <div className="text-[11px] text-neutral-400/80 tracking-wide">
                    Klik area luar atau tekan <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono text-[10px]">Esc</kbd> untuk menutup
                </div>
            </div>,
            document.body
        )
        : null;

    // Common Role Header Banner
    const roleBanner = (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-card border border-border shadow-xs">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-amber-500 flex items-center justify-center text-primary-foreground shadow-md shadow-primary/20">
                    <BookOpen className="w-5 h-5" />
                </div>
                <div>
                    <h2 className="text-base font-bold text-foreground">
                        Pusat Panduan & Dokumentasi
                    </h2>
                    <p className="text-xs text-muted-foreground">
                        Petunjuk operasional sistem travel umroh & haji lengkap dengan CRUD matrix
                    </p>
                </div>
            </div>

            {/* Role Switcher Tabs */}
            <div className="flex items-center p-1 bg-muted/60 rounded-xl border border-border/60 self-start sm:self-auto overflow-x-auto max-w-full">
                <Link
                    href="/docs"
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
                        currentRole === "portal"
                            ? "bg-background text-foreground shadow-xs font-bold"
                            : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                    <Compass className="w-3.5 h-3.5" />
                    Portal Ringkasan
                </Link>
                <Link
                    href="/docs/owner"
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
                        currentRole === "owner"
                            ? "bg-background text-foreground shadow-xs font-bold"
                            : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                    Owner Travel (Level 1)
                </Link>
                <Link
                    href="/docs/agent"
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
                        currentRole === "agent"
                            ? "bg-background text-foreground shadow-xs font-bold"
                            : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                    <Users className="w-3.5 h-3.5 text-emerald-500" />
                    Mitra Agen (Level 2/3)
                </Link>
            </div>
        </div>
    );

    // ==========================================
    // 1. GUEST MODE (BELUM LOGIN)
    // Sidebar utama langsung memuat Navigasi Modul!
    // ==========================================
    if (!isAuthenticated) {
        return (
            <SidebarProvider>
                <Head title={`${pageTitle} - ${travelName} Docs`} />
                {markdownStyles}

                {/* GUEST DOCS SIDEBAR */}
                <Sidebar collapsible="icon">
                    <SidebarHeader className="border-b border-sidebar-border px-4 py-3">
                        <Link href="/docs" className="flex items-center gap-2.5">
                            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                <BookOpen className="size-4" />
                            </div>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-semibold">{travelName}</span>
                                <span className="truncate text-xs text-muted-foreground">
                                    Portal Panduan Resmi
                                </span>
                            </div>
                        </Link>
                    </SidebarHeader>

                    <SidebarContent className="px-2 py-3 space-y-4">
                        {/* Search Filter in Sidebar */}
                        <div className="relative px-2">
                            <Search className="absolute left-4 top-2.5 w-3.5 h-3.5 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Cari modul..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-8 pr-2.5 py-1.5 text-xs rounded-lg bg-sidebar-accent/50 border border-sidebar-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-muted-foreground/60"
                            />
                        </div>

                        {/* Navigation Menu */}
                        {currentRole === "portal" ? (
                            <SidebarGroup>
                                <SidebarGroupLabel>Pilih Peran Panduan</SidebarGroupLabel>
                                <SidebarMenu>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton
                                            render={
                                                <Link href="/docs/owner" className="flex items-center gap-2">
                                                    <ShieldCheck className="size-4 text-amber-500" />
                                                    <span>Panduan Owner (Level 1)</span>
                                                </Link>
                                            }
                                        />
                                    </SidebarMenuItem>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton
                                            render={
                                                <Link href="/docs/agent" className="flex items-center gap-2">
                                                    <Users className="size-4 text-emerald-500" />
                                                    <span>Panduan Agen (Level 2/3)</span>
                                                </Link>
                                            }
                                        />
                                    </SidebarMenuItem>
                                </SidebarMenu>
                            </SidebarGroup>
                        ) : (
                            Object.entries(groupedNavItems).map(([category, items]) => (
                                <SidebarGroup key={category} className="p-0">
                                    <SidebarGroupLabel className="text-[10px] font-bold uppercase tracking-wider">
                                        {category}
                                    </SidebarGroupLabel>
                                    <SidebarMenu>
                                        {items.map((item) => {
                                            const isActive = item.slug === currentSlug;
                                            const orderStr =
                                                item.order > 0
                                                    ? String(item.order).padStart(2, "0")
                                                    : "★";

                                            return (
                                                <SidebarMenuItem key={item.slug}>
                                                    <SidebarMenuButton
                                                        isActive={isActive}
                                                        tooltip={item.title}
                                                        render={
                                                            <Link
                                                                href={`/docs/${currentRole}/${item.slug}`}
                                                                className="flex items-center gap-2"
                                                            >
                                                                <span
                                                                    className={`w-4 h-4 flex items-center justify-center rounded text-[12px] font-mono shrink-0 ${
                                                                        isActive
                                                                            ? "bg-primary text-primary-foreground font-bold"
                                                                            : "bg-muted text-muted-foreground"
                                                                    }`}
                                                                >
                                                                    {orderStr}
                                                                </span>
                                                            </Link>
                                                        }
                                                    />
                                                </SidebarMenuItem>
                                            );
                                        })}
                                    </SidebarMenu>
                                </SidebarGroup>
                            ))
                        )}
                    </SidebarContent>

                    <SidebarFooter className="border-t border-sidebar-border p-3">
                        <Link
                            href="/login"
                            className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-xl bg-primary text-primary-foreground font-semibold text-xs hover:bg-primary/90 shadow-sm transition-all"
                        >
                            <LogIn className="w-4 h-4" />
                            <span>Login ke Sistem</span>
                        </Link>
                    </SidebarFooter>
                    <SidebarRail />
                </Sidebar>

                {/* GUEST INSET & HEADER */}
                <SidebarInset>
                    <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b px-4 transition-[width,height] ease-linear">
                        <div className="flex items-center gap-2 min-w-0">
                            <SidebarTrigger className="-ml-1" />
                            <Separator
                                orientation="vertical"
                                className="mr-1 data-[orientation=vertical]:h-4"
                            />
                            <Breadcrumb className="min-w-0">
                                <BreadcrumbList className="flex-nowrap">
                                    <BreadcrumbItem className="hidden sm:inline-flex">
                                        <Link href="/docs" className="text-muted-foreground hover:text-foreground">
                                            Buku Panduan
                                        </Link>
                                    </BreadcrumbItem>
                                    <BreadcrumbSeparator className="hidden sm:inline-flex" />
                                    <BreadcrumbItem className="min-w-0">
                                        <BreadcrumbPage className="truncate max-w-[130px] xs:max-w-[180px] sm:max-w-none">
                                            {roleLabel}
                                        </BreadcrumbPage>
                                    </BreadcrumbItem>
                                </BreadcrumbList>
                            </Breadcrumb>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={toggleQuickTheme}
                                className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors cursor-pointer"
                                title="Ganti Tema"
                            >
                                {currentThemeDef?.type === "dark" ? (
                                    <Sun className="w-4 h-4 text-amber-400" />
                                ) : (
                                    <Moon className="w-4 h-4 text-amber-500" />
                                )}
                            </button>
                            <Link
                                href="/login"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm transition-all"
                            >
                                <LogIn className="w-3.5 h-3.5" />
                                <span>Login</span>
                            </Link>
                        </div>
                    </header>

                    {/* MAIN ARTICLE AREA FOR GUEST */}
                    <div className="p-4 sm:p-6 md:p-8 space-y-6 mx-auto w-full">
                        {roleBanner}

                        <div className="flex flex-col lg:flex-row gap-6 items-start">
                            {/* Center Article Content */}
                            <div className="flex-1 min-w-0 bg-card border border-border rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
                                {activeDoc ? (
                                    <div className="space-y-6">
                                        <article
                                            id="docs-body-content"
                                            className="docs-rendered-markdown"
                                            dangerouslySetInnerHTML={{ __html: activeDoc.html }}
                                        />

                                        {/* Next / Prev Navigation */}
                                        <div className="pt-8 mt-10 border-t border-border flex items-center justify-between gap-4">
                                            {prevDoc ? (
                                                <Link
                                                    href={`/docs/${currentRole}/${prevDoc.slug}`}
                                                    className="flex flex-col gap-1 p-3.5 rounded-xl border border-border hover:border-primary hover:bg-muted/40 transition-all max-w-[45%]"
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
                                                    className="flex flex-col items-end gap-1 p-3.5 rounded-xl border border-border hover:border-primary hover:bg-muted/40 transition-all max-w-[45%] text-right"
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
                                    <div className="p-12 text-center space-y-3">
                                        <BookOpen className="w-12 h-12 text-muted-foreground mx-auto" />
                                        <h3 className="font-bold text-base">Dokumentasi Tidak Ditemukan</h3>
                                        <p className="text-xs text-muted-foreground max-w-md mx-auto">
                                            Halaman panduan yang Anda cari tidak tersedia.
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Enhanced Right Table of Contents (Sections) */}
                            {activeDoc && activeDoc.headings.length > 0 && (
                                <div className="hidden xl:block w-72 shrink-0 sticky top-4">
                                    <TableOfContents headings={activeDoc.headings} />
                                </div>
                            )}
                        </div>
                    </div>
                </SidebarInset>

                {lightboxModal}
            </SidebarProvider>
        );
    }

    // ==========================================
    // 2. AUTHENTICATED MODE (SUDAH LOGIN)
    // Menggunakan PageLayout Dashboard Lengkap!
    // ==========================================
    return (
        <PageLayout
            title={`${pageTitle} - Buku Panduan`}
            breadcrumbParent="Buku Panduan"
            breadcrumbPage={roleLabel}
            contentClass="p-4 sm:p-6 md:p-8 space-y-6"
        >
            {markdownStyles}
            {roleBanner}

            {/* 3-COLUMN DOCS LAYOUT INSIDE AUTHENTICATED DASHBOARD */}
            <div className="flex flex-col lg:flex-row gap-6 items-start">
                {/* INNER LEFT SUB-SIDEBAR: MODULES LIST */}
                <div className="w-full lg:w-72 shrink-0 bg-card border border-border rounded-2xl p-4 space-y-5 shadow-xs sticky top-4">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Cari modul atau topik..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-muted-foreground/60"
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

                    {/* Navigation Groups */}
                    {currentRole === "portal" ? (
                        <div className="space-y-3">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-1">
                                Pilihan Panduan Peran
                            </span>
                            <div className="space-y-1.5">
                                <Link
                                    href="/docs/owner"
                                    className="flex items-center gap-2.5 px-3 py-2.5 text-xs font-semibold rounded-xl bg-background hover:bg-muted text-foreground border border-border transition-all group"
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
                                    className="flex items-center gap-2.5 px-3 py-2.5 text-xs font-semibold rounded-xl bg-background hover:bg-muted text-foreground border border-border transition-all group"
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
                        <div className="space-y-5 max-h-[calc(100vh-20rem)] overflow-y-auto pr-1 no-scrollbar">
                            {Object.entries(groupedNavItems).map(([category, items]) => (
                                <div key={category} className="space-y-1">
                                    <div className="flex items-center gap-1.5 px-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                        <Layers className="w-3 h-3 text-primary" />
                                        <span>{category}</span>
                                    </div>
                                    <div className="space-y-0.5">
                                        {items.map((item) => {
                                            const isActive = item.slug === currentSlug;
                                            const orderStr =
                                                item.order > 0
                                                    ? String(item.order).padStart(2, "0")
                                                    : "★";

                                            return (
                                                <Link
                                                    key={item.slug}
                                                    href={`/docs/${currentRole}/${item.slug}`}
                                                    className={`flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-lg transition-all group ${
                                                        isActive
                                                            ? "bg-primary text-primary-foreground font-bold shadow-xs"
                                                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                                    }`}
                                                >
                                                    <span
                                                        className={`w-4 h-4 flex items-center justify-center rounded text-[12px] font-mono shrink-0 ${isActive
                                                                ? "bg-primary text-primary-foreground font-bold"
                                                                : "bg-muted text-muted-foreground"
                                                            }`}
                                                    >
                                                        {orderStr}
                                                    </span>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* CENTER ARTICLE CONTAINER */}
                <div className="flex-1 min-w-0 bg-card border border-border rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
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
                                        className="flex flex-col gap-1 p-3.5 rounded-xl border border-border hover:border-primary hover:bg-muted/40 transition-all max-w-[45%]"
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
                                        className="flex flex-col items-end gap-1 p-3.5 rounded-xl border border-border hover:border-primary hover:bg-muted/40 transition-all max-w-[45%] text-right"
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
                        <div className="p-12 text-center space-y-3">
                            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto" />
                            <h3 className="font-bold text-base">Dokumentasi Tidak Ditemukan</h3>
                            <p className="text-xs text-muted-foreground max-w-md mx-auto">
                                Halaman panduan yang Anda cari tidak tersedia. Silakan pilih modul dari menu di sebelah kiri.
                            </p>
                        </div>
                    )}
                </div>

                {/* ENHANCED RIGHT SIDEBAR: TABLE OF CONTENTS (SECTIONS) */}
                {activeDoc && activeDoc.headings.length > 0 && (
                    <div className="hidden 2xl:block w-72 shrink-0 sticky top-4">
                        <TableOfContents headings={activeDoc.headings} />
                    </div>
                )}
            </div>

            {lightboxModal}
        </PageLayout>
    );
}
