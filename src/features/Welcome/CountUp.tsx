"use client";

import { useEffect, useRef } from "react";
import { animate, useInView, useReducedMotion } from "framer-motion";

/**
 * Animated count-up number — counts from 0 to `value` when scrolled into view.
 */
export default function CountUp({
    value,
    suffix = "",
    duration = 1.8,
    className = "",
}: {
    value: number;
    suffix?: string;
    duration?: number;
    className?: string;
}) {
    const ref = useRef<HTMLSpanElement>(null);
    const inView = useInView(ref, { once: true, margin: "-40px" });
    const reduced = useReducedMotion();

    useEffect(() => {
        if (!inView || !ref.current) return;
        if (reduced) {
            ref.current.textContent = `${Math.round(value)}${suffix}`;
            return;
        }
        const controls = animate(0, value, {
            duration,
            ease: [0.16, 1, 0.3, 1],
            onUpdate: (v) => {
                if (ref.current) ref.current.textContent = `${Math.round(v)}${suffix}`;
            },
        });
        return () => controls.stop();
    }, [inView, value, suffix, duration, reduced]);

    return (
        <span ref={ref} className={className}>
            0{suffix}
        </span>
    );
}
