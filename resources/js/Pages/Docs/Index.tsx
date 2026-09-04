import React, { useState, useMemo, useEffect } from "react";
import { Head, Link } from "@inertiajs/react";
import PageLayout from "@/Components/Layouts/PageLayout";
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

export default function DocsIndex({
    currentRole,
    currentSlug,
    navigation,
    activeDoc,
}: Props) {
    const [searchQuery, setSearchQuery] = useState("");
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

    const pageTitle = activeDoc ? activeDoc.title : "Buku Panduan";
    const roleLabel =
        currentRole === "owner"
            ? "Owner Travel (Level 1)"
            : currentRole === "agent"
            ? "Mitra Agen (Level 2/3)"
            : "Portal Dokumentasi";

    return (
        <PageLayout
            title={`${pageTitle} - Buku Panduan`}
            breadcrumbParent="Buku Panduan"
            breadcrumbPage={roleLabel}
            contentClass="p-4 sm:p-6 md:p-8 space-y-6"
        >
            {/* EMBEDDED CUSTOM MARKDOWN STYLES */}
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

            {/* TOP ROLE SWITCHER TABS */}
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

                {/* Role Tabs */}
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

            {/* 3-COLUMN DOCS LAYOUT */}
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
                        <div className="space-y-5 max-h-[calc(100vh-16rem)] overflow-y-auto pr-1">
                            {Object.entries(groupedNavItems).map(
                                ([category, items]) => (
                                    <div key={category} className="space-y-1">
                                        <div className="flex items-center gap-1.5 px-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
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

                {/* RIGHT SIDEBAR: TABLE OF CONTENTS (Desktop) */}
                {activeDoc && activeDoc.headings.length > 0 && (
                    <div className="hidden 2xl:block w-64 shrink-0 sticky top-4 space-y-4">
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
                                <span>Pusat Bantuan</span>
                            </div>
                            <p className="text-[11px] text-muted-foreground leading-relaxed">
                                Butuh panduan teknis lebih lanjut? Hubungi administrator atau supervisor travel.
                            </p>
                        </div>
                    </div>
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
        </PageLayout>
    );
}
