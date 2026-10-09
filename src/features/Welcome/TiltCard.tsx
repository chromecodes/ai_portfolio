"use client";

import { useRef, useState, useCallback } from "react";
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from "framer-motion";

/**
 * Mouse-tracked 3D perspective tilt card with a cursor-following glare —
 * the trending Vercel/Linear-style interactive card.
 */
export default function TiltCard({
    children,
    className = "",
    maxTilt = 10,
    glare = true,
}: {
    children: React.ReactNode;
    className?: string;
    maxTilt?: number;
    glare?: boolean;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const reduced = useReducedMotion();
    const [hovering, setHovering] = useState(false);

    const px = useMotionValue(0.5);
    const py = useMotionValue(0.5);

    const rotateX = useSpring(useTransform(py, [0, 1], [maxTilt, -maxTilt]), {
        stiffness: 260,
        damping: 22,
        mass: 0.6,
    });
    const rotateY = useSpring(useTransform(px, [0, 1], [-maxTilt, maxTilt]), {
        stiffness: 260,
        damping: 22,
        mass: 0.6,
    });

    // Glare position follows the cursor
    const glareX = useTransform(px, (v) => `${v * 100}%`);
    const glareY = useTransform(py, (v) => `${v * 100}%`);
    const glareBg = useTransform(
        [glareX, glareY],
        ([x, y]: string[]) =>
            `radial-gradient(420px circle at ${x} ${y}, rgba(var(--accent), 0.10), transparent 65%)`
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
            whileHover={reduced ? undefined : { y: -6 }}
            style={
                reduced
                    ? undefined
                    : { rotateX, rotateY, transformPerspective: 1000, transformStyle: "preserve-3d" }
            }
            className={`relative h-full ${className}`}
        >
            {children}
            {glare && !reduced && (
                <motion.div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 rounded-3xl z-20"
                    style={{ background: glareBg }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: hovering ? 1 : 0 }}
                />
            )}
        </motion.div>
    );
}
