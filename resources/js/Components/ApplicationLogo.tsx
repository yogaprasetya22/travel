import { SVGAttributes } from 'react';

export default function ApplicationLogo({
    className = 'w-10 h-10',
    ...props
}: SVGAttributes<SVGElement>) {
    return (
        <svg
            viewBox="0 0 200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            {...props}
        >
            <defs>
                {/* Theme-Adaptive Primary Gradient */}
                <linearGradient id="logo-theme-primary" x1="20" y1="20" x2="180" y2="180" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="hsl(var(--primary, 24 95% 53%))" />
                    <stop offset="100%" stopColor="hsl(var(--primary, 24 95% 53%))" stopOpacity="0.75" />
                </linearGradient>

                {/* Theme-Adaptive Accent / Ribbon Gradient */}
                <linearGradient id="logo-theme-accent" x1="40" y1="40" x2="160" y2="160" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="hsl(var(--primary, 24 95% 53%))" />
                    <stop offset="50%" stopColor="hsl(var(--primary-foreground, 0 0% 100%))" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="hsl(var(--primary, 24 95% 53%))" />
                </linearGradient>

                {/* Soft Shadow Filter */}
                <filter id="logo-theme-glow" x="-10%" y="-10%" width="120%" height="120%" filterUnits="userSpaceOnUse">
                    <feDropShadow dx="0" dy="3" stdDeviation="5" floodOpacity="0.15" />
                </filter>
            </defs>

            {/* Background Shield / Container */}
            <rect
                x="14"
                y="14"
                width="172"
                height="172"
                rx="42"
                fill="hsl(var(--primary, 24 95% 53%))"
                fillOpacity="0.12"
                stroke="hsl(var(--primary, 24 95% 53%))"
                strokeOpacity="0.25"
                strokeWidth="2"
            />

            {/* Outer Orbit / Crescent Flow Arc */}
            <path
                d="M 52 148 C 30 115 36 68 70 42 C 104 16 154 24 176 58 C 182 67 184 78 184 88 C 184 74 177 60 166 50 C 144 28 102 24 72 46 C 42 68 36 108 52 148 Z"
                fill="url(#logo-theme-primary)"
            />

            {/* Inner Modern Kaaba Geometric Monolith */}
            <g filter="url(#logo-theme-glow)">
                {/* Left Facet */}
                <path
                    d="M 100 64 L 62 84 L 62 136 L 100 156 Z"
                    fill="hsl(var(--foreground, 0 0% 98%))"
                    fillOpacity="0.88"
                />
                {/* Right Facet */}
                <path
                    d="M 100 64 L 138 84 L 138 136 L 100 156 Z"
                    fill="hsl(var(--foreground, 0 0% 98%))"
                    fillOpacity="0.72"
                />
                {/* Top Roof Facet */}
                <path
                    d="M 100 64 L 138 84 L 100 102 L 62 84 Z"
                    fill="hsl(var(--foreground, 0 0% 98%))"
                    fillOpacity="0.96"
                />

                {/* Kiswah Belt (Left) */}
                <path
                    d="M 62 96 L 100 114 L 100 120 L 62 102 Z"
                    fill="url(#logo-theme-primary)"
                />
                {/* Kiswah Belt (Right) */}
                <path
                    d="M 100 114 L 138 96 L 138 102 L 100 120 Z"
                    fill="url(#logo-theme-primary)"
                />

                {/* Door / Bab Al-Kaaba */}
                <path
                    d="M 112 116 L 126 109 L 126 138 L 112 145 Z"
                    fill="url(#logo-theme-primary)"
                />
            </g>

            {/* Star Sparkle at Top Right */}
            <path
                d="M 152 36 C 152 44 158 50 166 50 C 158 50 152 56 152 64 C 152 56 146 50 138 50 C 146 50 152 44 152 36 Z"
                fill="url(#logo-theme-primary)"
            />
            <circle cx="152" cy="50" r="2.5" fill="hsl(var(--primary-foreground, 0 0% 100%))" />
        </svg>
    );
}
