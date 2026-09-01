import React from 'react';
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/Components/ui/pagination';

export interface PaginationLinkItem {
    url: string | null;
    label: string;
    active: boolean;
}

export interface PaginatedData<T> {
    data: T[];
    current_page: number;
    first_page_url: string;
    from: number | null;
    last_page: number;
    last_page_url: string;
    links: PaginationLinkItem[];
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number | null;
    total: number;
}

interface DataTablePaginationProps {
    links: PaginationLinkItem[];
    from?: number | null;
    to?: number | null;
    total?: number;
    currentPage: number;
    lastPage: number;
    onPageChange?: (page: number) => void;
}

export default function DataTablePagination({
    links = [],
    from = 0,
    to = 0,
    total = 0,
    currentPage,
    lastPage,
    onPageChange,
}: DataTablePaginationProps) {
    if (lastPage <= 1 && total <= 10) return null;

    const handleLinkClick = (e: React.MouseEvent, url: string | null) => {
        if (!url) {
            e.preventDefault();
            return;
        }

        if (onPageChange) {
            e.preventDefault();
            try {
                const parsedUrl = new URL(url, window.location.origin);
                const pageParam = parsedUrl.searchParams.get('page');
                if (pageParam) {
                    onPageChange(parseInt(pageParam, 10));
                }
            } catch (err) {
                // fallback
            }
        }
    };

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 py-4 select-none">
            {/* Range info */}
            <div className="text-xs text-muted-foreground">
                Menampilkan <strong className="text-foreground">{from ?? 0}</strong> - <strong className="text-foreground">{to ?? 0}</strong> dari <strong className="text-foreground">{total}</strong> data
            </div>

            {/* Pagination Controls */}
            <Pagination className="mx-0 w-auto">
                <PaginationContent className="gap-1">
                    {links.map((link, idx) => {
                        const isPrev = idx === 0 || link.label.includes('&laquo;') || link.label.toLowerCase().includes('prev');
                        const isNext = idx === links.length - 1 || link.label.includes('&raquo;') || link.label.toLowerCase().includes('next');
                        const isEllipsis = link.label === '...';

                        if (isEllipsis) {
                            return (
                                <PaginationItem key={idx}>
                                    <PaginationEllipsis />
                                </PaginationItem>
                            );
                        }

                        if (isPrev) {
                            return (
                                <PaginationItem key={idx}>
                                    <PaginationPrevious
                                        href={link.url || '#'}
                                        onClick={(e) => handleLinkClick(e, link.url)}
                                        className={!link.url ? 'pointer-events-none opacity-40' : 'cursor-pointer'}
                                    />
                                </PaginationItem>
                            );
                        }

                        if (isNext) {
                            return (
                                <PaginationItem key={idx}>
                                    <PaginationNext
                                        href={link.url || '#'}
                                        onClick={(e) => handleLinkClick(e, link.url)}
                                        className={!link.url ? 'pointer-events-none opacity-40' : 'cursor-pointer'}
                                    />
                                </PaginationItem>
                            );
                        }

                        return (
                            <PaginationItem key={idx}>
                                <PaginationLink
                                    href={link.url || '#'}
                                    isActive={link.active}
                                    onClick={(e) => handleLinkClick(e, link.url)}
                                    className={`cursor-pointer ${link.active ? 'font-bold' : ''}`}
                                >
                                    {link.label}
                                </PaginationLink>
                            </PaginationItem>
                        );
                    })}
                </PaginationContent>
            </Pagination>
        </div>
    );
}
