"use client";

import { useRef, useState, useCallback } from "react";
import { motion, useMotionValue, useTransform, useReducedMotion } from "framer-motion";

/**
 * Cursor-following spotlight card — pure 2D. A soft accent glow tracks the
 * cursor across the card surface, with a gentle hover lift. No 3D transforms,
 * no WebGL — cheap to render and calm to look at.
 */
export default function SpotlightCard({
    children,
    className = "",
}: {
    children: React.ReactNode;
    className?: string;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const reduced = useReducedMotion();
    const [hovering, setHovering] = useState(false);

    const px = useMotionValue(0.5);
    const py = useMotionValue(0.5);

    // Spotlight position follows the cursor
    const spotX = useTransform(px, (v) => `${v * 100}%`);
    const spotY = useTransform(py, (v) => `${v * 100}%`);
    const spotBg = useTransform(
        [spotX, spotY],
        ([x, y]: string[]) =>
            `radial-gradient(420px circle at ${x} ${y}, rgba(var(--accent), 0.09), transparent 65%)`
    );

    const onMouseMove = useCallback(
        (e: React.MouseEvent) => {
            if (reduced || !ref.current) return;
            const rect = ref.current.getBoundingClientRect();
            px.set((e.clientX - rect.left) / rect.width);
            py.set((e.clientY - rect.top) / rect.height);
        },
        [px, py, reduced]
    );

    const onMouseEnter = useCallback(() => setHovering(true), []);
    const onMouseLeave = useCallback(() => {
        setHovering(false);
        px.set(0.5);
        py.set(0.5);
    }, [px, py]);

    return (
        <motion.div
            ref={ref}
            onMouseMove={onMouseMove}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            whileHover={reduced ? undefined : { y: -5 }}
            className={`relative h-full ${className}`}
        >
            {children}
            {!reduced && (
                <motion.div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 rounded-3xl z-20"
                    style={{ background: spotBg }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: hovering ? 1 : 0 }}
                />
            )}
        </motion.div>
    );
}
