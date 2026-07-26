"use client";

import { Switch } from "@/components/ui/switch";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import useThemeStore from "@/lib/useThemeStore";
import useLanguageStore, { Lang } from "@/utils/i18n/useLanguageStore";
import { usePathname } from "next/navigation";

export default function ToolBar() {
    const { theme, toggleTheme } = useThemeStore();
    const { language, setLanguage } = useLanguageStore();
    const pathname = usePathname();

    const handleLanguageChange = (v: string) => {
        setLanguage(v as Lang);
        
        // Dispatch telemetry
        if (typeof window !== 'undefined') {
            const sessionId = localStorage.getItem('portfolio_analytics_sid');
            if (sessionId) {
                const payload = {
                    sessionId,
                    type: 'language_change',
                    routePath: pathname,
                    selectedText: v.toUpperCase(),
                };
                if (navigator.sendBeacon) {
                    navigator.sendBeacon('/api/analytics/track', new Blob([JSON.stringify(payload)], { type: 'application/json' }));
                } else {
                    fetch('/api/analytics/track', {
                        method: 'POST',
                        body: JSON.stringify(payload),
                        keepalive: true
                    }).catch(() => {});
                }
            }
        }
    };

    return (
        <div className="flex items-center gap-4">
            <Select
                value={language}
                onValueChange={handleLanguageChange}
            >
                <SelectTrigger className="px-3 py-1 rounded text-sm">
                    <SelectValue>{language.toUpperCase()}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="en">EN</SelectItem>
                    <SelectItem value="es">ES</SelectItem>
                    <SelectItem value="ar">AR</SelectItem>
                </SelectContent>
            </Select>

            <Switch checked={theme === "dark"} onCheckedChange={toggleTheme} />
        </div>
    );
}
