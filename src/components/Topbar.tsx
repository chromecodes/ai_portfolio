'use client';

import { Sun, Moon } from 'lucide-react';
import useThemeStore from '@/lib/useThemeStore';
import useLanguageStore from '@/utils/i18n/useLanguageStore';

const languages = [
    { code: 'en', label: 'English' },
    { code: 'es', label: 'Español' },
];

export default function Topbar() {
    const { theme, toggleTheme } = useThemeStore();
    const { language, setLanguage, strings } = useLanguageStore();

    return (
        <header className="w-full p-4 flex justify-between items-center border-b border-border">
            <div className="text-lg font-bold">{strings.home}</div>

            <div className="flex items-center gap-4">
                <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as any)}
                    className="p-1 border rounded-md bg-background text-foreground"
                >
                    {languages.map((lang) => (
                        <option key={lang.code} value={lang.code}>
                            {lang.label}
                        </option>
                    ))}
                </select>

                <button
                    onClick={toggleTheme}
                    className="p-2 rounded-md border border-border bg-background text-foreground"
                >
                    {theme === 'dark' ? <Sun /> : <Moon />}
                </button>
            </div>
        </header>
    );
}
