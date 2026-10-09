"use client";

import { useEffect, useMemo, useRef } from "react";
import type { RefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import { Group, Mesh } from "three";
import type { MotionValue } from "framer-motion";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import useThemeStore from "@/lib/useThemeStore";

/**
 * Scroll-driven intro — professional, minimal, clean.
 *
 * The page starts blank. As you scroll, a single violet cube flies up from
 * the bottom, then fans out into a tidy 4×3 grid of floating cards with a
 * gentle idle float and subtle mouse parallax. Past the hero the whole
 * scene fades out and hands over to the page content.
 */

// --- Timeline (fractions of hero scroll progress 0→1) ---
const CUBE_RISE: [number, number] = [0.05, 0.3]; // cube flies up from the bottom
const GRID_BUILD: [number, number] = [0.3, 0.72]; // cube fans out into the grid
const GRID_COLS = 4;
const GRID_ROWS = 3;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
/** progress of `v` within the [a, b] window, clamped to 0..1 */
const within = (v: number, [a, b]: [number, number]) => clamp01((v - a) / (b - a));
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

// --- Grid slot positions (grid centered on the origin, lifted slightly) ---
function slotFor(i: number): [number, number, number] {
    const col = i % GRID_COLS;
    const row = Math.floor(i / GRID_COLS);
    return [
        (col - (GRID_COLS - 1) / 2) * 1.8,
        (row - (GRID_ROWS - 1) / 2) * 1.2 + 0.45,
        0,
    ];
}

type Palette = {
    cube: string; // the accent cube that seeds the grid
    card: string; // neutral card surface
    rim: string; // accent rim light behind the grid
};

// --- Hero cube: flies up from the bottom, then dissolves as the grid builds ---
function HeroCube({ progress, palette }: { progress: MotionValue<number>; palette: Palette }) {
    const ref = useRef<Mesh>(null);

    useFrame(() => {
        const m = ref.current;
        if (!m) return;
        const p = progress.get();

        const rise = easeOut(within(p, CUBE_RISE));
        const build = within(p, GRID_BUILD);

        // fly up from below with a gentle arcing tumble
        m.position.y = -5.2 + rise * 5.75;
        m.position.x = Math.sin(rise * Math.PI) * 0.55;
        m.rotation.z = (1 - rise) * 0.85;
        m.rotation.y = (1 - rise) * 0.6;

        // dissolve into the grid as the cards fan out
        const s = build > 0 ? Math.max(0, 1 - build * 2.2) : 1;
        m.scale.setScalar(Math.max(s, 0.001));
        m.visible = s > 0.001;
    });

    return (
        <RoundedBox
            ref={ref}
            args={[1.1, 1.1, 1.1]}
            radius={0.12}
            smoothness={4}
            position={[0, -5.2, 0.6]}
            visible={false}
        >
            <meshStandardMaterial
                color={palette.cube}
                emissive={palette.cube}
                emissiveIntensity={0.35}
                roughness={0.35}
                metalness={0.2}
            />
        </RoundedBox>
    );
}

// --- Grid card: flies out of the cube's position into its tidy slot ---
function GridCard({
    index,
    count,
    progress,
    palette,
}: {
    index: number;
    count: number;
    progress: MotionValue<number>;
    palette: Palette;
}) {
    const ref = useRef<Mesh>(null);
    const slot = useMemo(() => slotFor(index), [index]);
    // stagger across the build window: cards emerge one after another
    const start = GRID_BUILD[0] + (index / count) * 0.22;
    const DURATION = 0.2;
    const FROM: [number, number, number] = [0, 0.55, 0.6]; // the cube's final position

    useFrame(() => {
        const m = ref.current;
        if (!m) return;
        const t = easeOut(within(progress.get(), [start, start + DURATION]));

        m.position.set(
            FROM[0] + (slot[0] - FROM[0]) * t,
            FROM[1] + (slot[1] - FROM[1]) * t,
            FROM[2] + (slot[2] - FROM[2]) * t
        );
        m.scale.setScalar(Math.max(t, 0.001));
        m.rotation.y = (1 - t) * 0.8;
        m.rotation.x = (1 - t) * -0.5;
        m.visible = t > 0.001;
    });

    return (
        <RoundedBox
            ref={ref}
            args={[1.35, 0.85, 0.07]}
            radius={0.07}
            smoothness={4}
            position={FROM}
            visible={false}
        >
            <meshStandardMaterial color={palette.card} roughness={0.45} metalness={0.1} />
        </RoundedBox>
    );
}

// --- The grid: idle float + gentle mouse parallax once built ---
function CardGrid({
    progress,
    reduced,
    palette,
}: {
    progress: MotionValue<number>;
    reduced: boolean;
    palette: Palette;
}) {
    const group = useRef<Group>(null);
    const pointer = useRef({ x: 0, y: 0 });

    useEffect(() => {
        if (reduced) return;
        const onMove = (e: PointerEvent) => {
            pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
            pointer.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
        };
        window.addEventListener("pointermove", onMove);
        return () => window.removeEventListener("pointermove", onMove);
    }, [reduced]);

    useFrame((state) => {
        const g = group.current;
        if (!g) return;
        const built = within(progress.get(), GRID_BUILD);
        const time = state.clock.elapsedTime;

        // idle float, only once the grid exists
        g.position.y = reduced ? 0 : Math.sin(time * 0.8) * 0.045 * built;

        // subtle tilt-back for depth + gentle mouse parallax
        const targetX = reduced ? -0.12 : -0.12 + pointer.current.y * 0.05;
        const targetY = reduced ? 0 : pointer.current.x * 0.07;
        g.rotation.x += (targetX - g.rotation.x) * 0.06;
        g.rotation.y += (targetY - g.rotation.y) * 0.06;
    });

    const cards = GRID_COLS * GRID_ROWS;

    return (
        <group ref={group}>
            {Array.from({ length: cards }, (_, i) => (
                <GridCard key={i} index={i} count={cards} progress={progress} palette={palette} />
            ))}
        </group>
    );
}

// --- Scale the whole intro to fit the viewport (small screens shrink it) ---
function IntroWorld({
    progress,
    reduced,
    palette,
}: {
    progress: MotionValue<number>;
    reduced: boolean;
    palette: Palette;
}) {
    const { size } = useThree();
    const gridW = (GRID_COLS - 1) * 1.8 + 1.35;
    const gridH = (GRID_ROWS - 1) * 1.2 + 0.85;
    const visibleH = 2 * 7.2 * Math.tan((42 * Math.PI) / 360);
    const fit = Math.min(
        1,
        (visibleH * (size.width / size.height) * 0.88) / gridW,
        (visibleH * 0.82) / gridH
    );

    return (
        <group scale={fit}>
            <HeroCube progress={progress} palette={palette} />
            <CardGrid progress={progress} reduced={reduced} palette={palette} />
        </group>
    );
}

export default function PageScene({
    scrollContainerRef,
    heroRef,
}: {
    scrollContainerRef: RefObject<HTMLElement | null>;
    heroRef: RefObject<HTMLElement | null>;
}) {
    const reduced = useReducedMotion() ?? false;
    const { theme } = useThemeStore();
    const dark = theme === "dark";

    const palette: Palette = dark
        ? { cube: "#a78bfa", card: "#232329", rim: "#7c3aed" } // violet cube, dark cards
        : { cube: "#7c3aed", card: "#ffffff", rim: "#a78bfa" }; // violet cube, white cards

    // progress across the hero drives the build; past it the scene fades away
    const { scrollYProgress } = useScroll({
        container: scrollContainerRef,
        target: heroRef,
        offset: ["start start", "end start"],
    });
    const sceneOpacity = useTransform(scrollYProgress, [0.86, 0.99], [1, 0]);

    return (
        <motion.div
            style={{ opacity: sceneOpacity }}
            className="fixed inset-0 -z-10 pointer-events-none"
            aria-hidden
        >
            <Canvas
                dpr={[1, 1.75]}
                camera={{ position: [0, 0.4, 7.6], fov: 42 }}
                gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
            >
                {/* minimal lighting — soft, no external fetches */}
                <ambientLight intensity={dark ? 0.65 : 0.95} />
                <directionalLight position={[3, 6, 8]} intensity={dark ? 1.1 : 1.4} />
                <pointLight position={[0, 1.5, -3]} intensity={18} color={palette.rim} distance={16} />

                <IntroWorld progress={scrollYProgress} reduced={reduced} palette={palette} />
            </Canvas>
        </motion.div>
    );
}
