import React, { createContext, useContext, useEffect, useState } from 'react';
import themeData from '@/lib/theme-colors.json';

export interface ThemeDefinition {
    name: string;
    label: string;
    type: 'light' | 'dark';
    preview: string[];
    variables: Record<string, string>;
}

export type ThemeKey = string;

interface ThemeContextType {
    theme: ThemeKey;
    setTheme: (theme: ThemeKey) => void;
    themes: Record<string, ThemeDefinition>;
    currentThemeDef?: ThemeDefinition;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const allThemes = (themeData.themes || {}) as Record<string, ThemeDefinition>;

    const [theme, setThemeState] = useState<ThemeKey>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('theme_preference');
            if (saved && (saved === 'system' || allThemes[saved])) {
                return saved;
            }
        }
        return 'luxury';
    });

    const applyTheme = (t: ThemeKey) => {
        const root = document.documentElement;
        let activeKey = t;

        if (t === 'system') {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            activeKey = prefersDark ? 'luxury' : 'caramellatte';
        } else if (t === 'dark') {
            activeKey = 'luxury';
        } else if (t === 'light') {
            activeKey = 'caramellatte';
        }

        const themeDef = allThemes[activeKey] || allThemes['luxury'] || allThemes['caramellatte'];

        if (themeDef) {
            // Apply all CSS variables defined for the theme
            Object.entries(themeDef.variables).forEach(([prop, val]) => {
                root.style.setProperty(prop, val);
            });

            // Set dark/light class on root
            if (themeDef.type === 'dark') {
                root.classList.add('dark');
                root.classList.remove('light');
            } else {
                root.classList.remove('dark');
                root.classList.add('light');
            }
        }
    };

    const setTheme = (newTheme: ThemeKey) => {
        setThemeState(newTheme);
        localStorage.setItem('theme_preference', newTheme);
        applyTheme(newTheme);
    };

    useEffect(() => {
        applyTheme(theme);

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => {
            const currentPref = localStorage.getItem('theme_preference');
            if (currentPref === 'system') {
                applyTheme('system');
            }
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [theme]);

    const activeThemeKey = theme === 'system' 
        ? (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') 
        : theme;
    const currentThemeDef = allThemes[activeThemeKey] || allThemes['dark'];

    return (
        <ThemeContext.Provider value={{ theme, setTheme, themes: allThemes, currentThemeDef }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
