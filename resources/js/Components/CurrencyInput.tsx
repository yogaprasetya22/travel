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
        <div className="relative flex items-center rounded-xl border border-input bg-background shadow-xs transition-colors focus-within:ring-2 focus-within:ring-ring focus-within:border-ring">
            <span className="flex items-center justify-center pl-3.5 pr-1.5 text-xs font-bold text-muted-foreground select-none">
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
                className={cn(
                    'w-full bg-transparent py-2 pr-3.5 pl-1 text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-50',
                    className
                )}
            />
        </div>
    );
}
