"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import useThemeStore from "@/lib/useThemeStore"; // adjust path
import DiagonalSlash from "./transitions/DiagonalSlash";
import BubbleTransition from "./transitions/BubbleTransition";
import { useCursor } from "@/lib/useCursor";

export default function RouteTransitionController() {
    const pathname = usePathname();
    const prevPath = useRef(pathname);
    const [active, setActive] = useState(false);

    const theme = useThemeStore((state) => state.theme);

    useEffect(() => {
        const move = (e: MouseEvent) => {
            useCursor.getState().set(e.clientX, e.clientY);
        };

        window.addEventListener("mousemove", move);
        return () => window.removeEventListener("mousemove", move);
    }, []);

    useEffect(() => {
        if (prevPath.current !== pathname) {
            prevPath.current = pathname;

            // // ONLY in dark mode
            // if (theme !== "dark") return;

            setActive(true);
            const t = setTimeout(() => setActive(false), 300);
            return () => clearTimeout(t);
        }
    }, [pathname, theme]);

    if (!active) return null;

    // return <DiagonalSlash />;
    return <BubbleTransition active={active} />;

    if (!active) return null;

    return (
        <div className="fixed inset-0 z-[9999] bg-red-500">
            TEST TRANSITION
        </div>
    );
}
