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

export default function ToolBar() {
    const { theme, toggleTheme } = useThemeStore();
    const { language, setLanguage } = useLanguageStore();

    return (
        <div className="flex items-center gap-4">
            <Select
                value={language}
                onValueChange={(v) => setLanguage(v as Lang)}
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
