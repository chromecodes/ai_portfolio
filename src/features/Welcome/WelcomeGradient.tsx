"use client";

import {
    motion,
    useReducedMotion,
    useSpring,
    useTransform,
    useVelocity,
    type MotionValue,
} from "framer-motion";

interface IWelcomeGradientProps {
    /** 0 → 1 scroll progress of the page (from the scrolling <main>) */
    progress: MotionValue<number>;
}

/**
 * Accent aurora backdrop for the welcome page.
 *
 * Time-based layers (CSS keyframes in welcome.css):
 *   • conic flow — slow lighthouse rotation
 *   • shimmer    — light band sweeping across
 *   • blob drift — translate keyframes
 *
 * Scroll-reactive layers (this component, framer-motion):
 *   • scroll position  → extra rotation on the conic aurora
 *     (scroll down sweeps it forward, scroll up sweeps it back)
 *   • scroll velocity  → glows swell while you scroll and
 *     settle back to rest when you stop
 *
 * Scroll transforms live on wrapper elements so they compose with
 * (instead of fight) the CSS keyframe transforms on the inner layers.
 */
export default function WelcomeGradient({ progress }: IWelcomeGradientProps) {
    const reduceMotion = useReducedMotion();

    // Smoothed scroll position → scroll-linked sweep of the aurora
    const smoothProgress = useSpring(progress, {
        stiffness: 55,
        damping: 18,
        restDelta: 0.0005,
    });
    const flowRotate = useTransform(smoothProgress, [0, 1], [0, 160]);

    // Scroll velocity → "energy": 0 at rest, 1 while scrolling fast.
    // Spring-smoothed so the swell ramps in and settles gracefully.
    const velocity = useSpring(useVelocity(progress), {
        stiffness: 90,
        damping: 28,
        restDelta: 0.001,
    });
    const energy = useTransform(velocity, (v) => Math.min(Math.abs(v), 2.5) / 2.5);
    const flowScale = useTransform(energy, [0, 1], [1, 1.14]);
    const blobAScale = useTransform(energy, [0, 1], [1, 1.28]);
    const blobBScale = useTransform(energy, [0, 1], [1, 1.18]);

    return (
        <div aria-hidden className="welcome-gradient">
            {/* conic aurora — CSS time rotation inside, scroll rotation + velocity swell outside */}
            <motion.div
                className="welcome-gradient-flow-wrap"
                style={reduceMotion ? undefined : { rotate: flowRotate, scale: flowScale }}
            >
                <span className="welcome-gradient-flow" />
            </motion.div>

            {/* drifting glows — CSS translate drift inside, velocity swell outside */}
            <motion.span
                className="welcome-gradient-blob welcome-gradient-blob-a"
                style={reduceMotion ? undefined : { scale: blobAScale }}
            />
            <motion.span
                className="welcome-gradient-blob welcome-gradient-blob-b"
                style={reduceMotion ? undefined : { scale: blobBScale }}
            />

            {/* shimmer — pure time-based sweep, no scroll linkage */}
            <span className="welcome-gradient-shimmer" />
        </div>
    );
}
