import React from 'react';
import { router } from '@inertiajs/react';

interface PerPageSelectorProps {
    value: number;
    options?: number[];
    onChange?: (perPage: number) => void;
    paramName?: string;
}

export default function PerPageSelector({
    value = 15,
    options = [5, 10, 15, 20, 50],
    onChange,
    paramName = 'per_page',
}: PerPageSelectorProps) {
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newValue = parseInt(e.target.value, 10);
        if (onChange) {
            onChange(newValue);
        } else {
            // Default Inertia router reload with new per_page parameter
            const currentUrl = new URL(window.location.href);
            currentUrl.searchParams.set(paramName, newValue.toString());
            currentUrl.searchParams.set('page', '1'); // reset to page 1 on per_page change
            router.get(currentUrl.pathname + currentUrl.search, {}, {
                preserveState: true,
                preserveScroll: true,
            });
        }
    };

    return (
        <div className="flex items-center gap-2 text-xs text-muted-foreground select-none">
            <span className="shrink-0 font-medium">Tampilkan:</span>
            <select
                value={value}
                onChange={handleChange}
                className="h-8 rounded-lg border border-border bg-background px-2.5 py-1 text-xs font-semibold text-foreground shadow-2xs focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20 cursor-pointer"
            >
                {options.map((opt) => (
                    <option key={opt} value={opt}>
                        {opt} data / hal
                    </option>
                ))}
            </select>
        </div>
    );
}
