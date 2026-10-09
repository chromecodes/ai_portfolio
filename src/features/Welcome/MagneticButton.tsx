"use client";

import { useRef, useCallback } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "framer-motion";

/**
 * Magnetic wrapper — children are gently pulled toward the cursor while
 * hovering, then spring back on leave. The trending "magnetic button".
 */
export default function MagneticButton({
    children,
    strength = 0.28,
    className = "",
}: {
    children: React.ReactNode;
    strength?: number;
    className?: string;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const reduced = useReducedMotion();

    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const sx = useSpring(x, { stiffness: 200, damping: 16, mass: 0.5 });
    const sy = useSpring(y, { stiffness: 200, damping: 16, mass: 0.5 });

    const onMouseMove = useCallback(
        (e: React.MouseEvent) => {
            if (reduced || !ref.current) return;
            const rect = ref.current.getBoundingClientRect();
            x.set((e.clientX - (rect.left + rect.width / 2)) * strength);
            y.set((e.clientY - (rect.top + rect.height / 2)) * strength);
        },
        [x, y, strength, reduced]
    );

    const onMouseLeave = useCallback(() => {
        x.set(0);
        y.set(0);
    }, [x, y]);

    return (
        <motion.div
            ref={ref}
            onMouseMove={onMouseMove}
            onMouseLeave={onMouseLeave}
            style={reduced ? undefined : { x: sx, y: sy, display: "inline-block" }}
            className={className}
        >
            {children}
        </motion.div>
    );
}
