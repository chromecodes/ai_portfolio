"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import LogoViewer from "./LogoViewer";
import Navbar from "./Navbar";
import ToolBar from "./ToolBar";
import useLanguageStore from "@/utils/i18n/useLanguageStore";
import { Menu, X } from "lucide-react";

export default function Topbar() {
    const pages = ["home", "career", "projects", "about"];
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const pathname = usePathname();
    const router = useRouter();
    const strings = useLanguageStore((state) => state.strings);

    const derivedIndex = useMemo(() => {
        const segment = pathname.split("/")[1] || "home";
        const index = pages.indexOf(segment);
        return index === -1 ? 0 : index;
    }, [pathname]);

    const handleNavigate = (page: string) => {
        setIsMenuOpen(false);
        router.push(`/${page}`);
    };

    return (
        <header className="relative flex items-center justify-between border-b border-borderColor px-4 sm:px-6 py-3 bg-primary-background z-50">
            <div className="flex items-center gap-3">
                <LogoViewer />
            </div>

            {/* Desktop Navbar */}
            <div className="hidden md:block">
                <Navbar
                    pages={pages}
                    height={28}
                    onNavigate={(page) => {
                        router.push(`/${page}`);
                    }}
                    index={derivedIndex}
                />
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
                <ToolBar />
                
                {/* Mobile Menu Trigger */}
                <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="md:hidden p-2 rounded-lg text-primary-foreground hover:bg-secondary-background/80 transition-colors"
                    aria-label="Toggle navigation menu"
                >
                    {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Mobile Dropdown Navigation Drawer */}
            {isMenuOpen && (
                <div className="absolute top-full left-0 w-full bg-primary-background/95 backdrop-blur-md border-b border-borderColor shadow-lg md:hidden flex flex-col p-4 gap-2 transition-all">
                    {pages.map((page, idx) => {
                        const isActive = idx === derivedIndex;
                        return (
                            <button
                                key={page}
                                onClick={() => handleNavigate(page)}
                                className={`w-full text-left px-4 py-3 rounded-lg text-base font-medium transition-all ${
                                    isActive
                                        ? "bg-secondary-background text-accent font-semibold"
                                        : "text-primary-foreground/80 hover:bg-secondary-background/50 hover:text-primary-foreground"
                                }`}
                            >
                                {strings[page as keyof typeof strings] || page}
                            </button>
                        );
                    })}
                </div>
            )}
        </header>
    );
}
