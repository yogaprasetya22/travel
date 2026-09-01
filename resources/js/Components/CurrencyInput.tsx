import React from 'react';
import { cn } from '@/lib/utils';

interface CurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
    value: string | number;
    onChange: (numericValue: string) => void;
    placeholder?: string;
    className?: string;
    prefix?: string;
}

/**
 * Format a raw numeric string to IDR formatted thousand separators (e.g. 1500000 -> 1.500.000)
 */
export function formatRupiah(value: string | number | null | undefined): string {
    if (value === null || value === undefined || value === '') return '';
    const cleanNumber = String(value).replace(/[^0-9]/g, '');
    if (!cleanNumber) return '';
    return new Intl.NumberFormat('id-ID').format(Number(cleanNumber));
}

/**
 * Format standard rupiah string with prefix (e.g. 1500000 -> Rp 1.500.000)
 */
export function toRupiah(value: string | number | null | undefined): string {
    if (value === null || value === undefined || value === '') return 'Rp 0';
    const num = typeof value === 'string' ? Number(value.replace(/[^0-9.-]+/g, '')) : value;
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(isNaN(num) ? 0 : num);
}

/**
 * Clean thousand-separated string back to plain numeric string (e.g. "1.500.000" -> "1500000")
 */
export function unformatRupiah(value: string): string {
    return value.replace(/[^0-9]/g, '');
}

/**
 * CurrencyInput component: renders an interactive input with automatic "Rp" badge and IDR thousand separators.
 */
export default function CurrencyInput({
    value,
    onChange,
    placeholder = '0',
    className = '',
    prefix = 'Rp',
    disabled,
    ...props
}: CurrencyInputProps) {
    const displayValue = formatRupiah(value);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = unformatRupiah(e.target.value);
        onChange(raw);
    };

    return (
        <div
            data-slot="input"
            className={cn(
                "relative flex h-8 w-full min-w-0 items-center rounded-lg border border-input bg-transparent text-base transition-colors outline-none md:text-sm dark:bg-input/30 focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50",
                disabled && "pointer-events-none cursor-not-allowed bg-input/50 opacity-50 dark:bg-input/80",
                className
            )}
        >
            <span className="flex items-center justify-center pl-2.5 pr-1 text-xs font-semibold text-muted-foreground select-none">
                {prefix}
            </span>
            <input
                {...props}
                type="text"
                inputMode="numeric"
                disabled={disabled}
                value={displayValue}
                onChange={handleChange}
                placeholder={placeholder}
                style={{
                    border: 'none',
                    outline: 'none',
                    boxShadow: 'none',
                    background: 'transparent',
                }}
                className="h-full w-full min-w-0 bg-transparent py-1 pr-2.5 pl-0 text-sm font-medium text-foreground placeholder:text-muted-foreground border-0 outline-none ring-0 shadow-none appearance-none focus:outline-none focus:ring-0 focus:border-0 focus:shadow-none disabled:cursor-not-allowed"
            />
        </div>
    );
}
