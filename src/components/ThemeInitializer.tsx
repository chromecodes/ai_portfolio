'use client';
import useThemeStore from '@/lib/useThemeStore';
import { useEffect } from 'react';

export default function ThemeInitializer() {
    const setTheme = useThemeStore((state) => state.setTheme);

    useEffect(() => {
        // 1. Check saved theme in localStorage
        const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
        if (savedTheme) {
            setTheme(savedTheme);
            return;
        }

        // 2. Otherwise, use system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setTheme(prefersDark ? 'dark' : 'light');
    }, [setTheme]);

    return null;
}
