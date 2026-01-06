"use client";

import useThemeStore from "@/lib/useThemeStore";

export default function MainBg() {
    const { theme } = useThemeStore(); // subscribe to theme

    return (
        <div
            className={`fixed inset-0 -z-10 transition-colors duration-500 ${theme === "dark"
                ? "bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950"
                : "bg-gradient-to-r from-blue-100 via-white to-blue-100"
                }`}
        />
    );
}
