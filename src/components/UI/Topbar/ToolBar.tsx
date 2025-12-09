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
import useLanguageStore from "@/utils/i18n/useLanguageStore";

export default function ToolBar() {
    const { theme, toggleTheme } = useThemeStore();
    const { language, setLanguage } = useLanguageStore();

    return (
        <div className="flex items-center gap-4">
            <Select
                value={language}
                onValueChange={(v) => setLanguage(v as "en" | "es")}
            >
                <SelectTrigger className="bg-card px-3 py-1 rounded text-sm">
                    <SelectValue>{language.toUpperCase()}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="en">EN</SelectItem>
                    <SelectItem value="es">ES</SelectItem>
                </SelectContent>
            </Select>

            <Switch checked={theme === "dark"} onCheckedChange={toggleTheme} />
        </div>
    );
}
