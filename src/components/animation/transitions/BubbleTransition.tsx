"use client";

import { useCursor } from "@/lib/useCursor";
import useThemeStore from "@/lib/useThemeStore";
import { motion } from "framer-motion";

export default function BubbleTransition({ active }: { active: boolean }) {
    const { x, y } = useCursor();
    const theme = useThemeStore((state) => state.theme);

    if (!active) return null;

    const safeX = x ?? window.innerWidth / 2;
    const safeY = y ?? window.innerHeight / 2;

    const origin = `${safeX}px ${safeY}px`;

    const firstBubbleColor = theme === "dark" ? "#131313ff" : "#efefefff";
    const secondBubbleColor = theme === "dark" ? "#202020cb" : "#e0e0e0cb";
    const finalBubbleColor = theme === "dark" ? "#000000b5" : "#ffffffb5";

    return (
        <div className="fixed inset-0 z-[9999] pointer-events-none">

            {/* 1️⃣ Black bubble */}
            <motion.div
                className="absolute inset-0"
                style={{ background: firstBubbleColor, clipPath: `circle(0px at ${origin})` }}
                animate={{
                    clipPath: `circle(150% at ${origin})`,
                }}
                transition={{ duration: 0.1, ease: "easeOut" }}
            />

            {/* 2️⃣ white bubble */}
            <motion.div
                className="absolute inset-0"
                style={{ background: secondBubbleColor, clipPath: `circle(0px at ${origin})` }}
                animate={{
                    clipPath: `circle(150% at ${origin})`,
                }}
                transition={{ delay: 0.1, duration: 0.1, ease: "easeOut" }}
            />

            {/* 3️⃣ Final black bubble */}
            <motion.div
                className="absolute inset-0"
                style={{ background: finalBubbleColor, clipPath: `circle(0px at ${origin})` }}
                animate={{
                    clipPath: `circle(150% at ${origin})`,
                    opacity: [1, 1, 0],
                }}
                transition={{
                    delay: 0.2,
                    duration: 0.2,
                    ease: "easeInOut",
                }}
            />
        </div>
    );
}
