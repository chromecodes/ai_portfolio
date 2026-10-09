"use client";

import { useEffect, useRef } from "react";
import type { RefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, Line, Sparkles } from "@react-three/drei";
import {
    CanvasTexture,
    CatmullRomCurve3,
    Mesh,
    Sprite,
    Vector3,
} from "three";
import type { Line2 } from "three-stdlib";
import type { MotionValue } from "framer-motion";
import { useReducedMotion, useScroll } from "framer-motion";
import useThemeStore from "@/lib/useThemeStore";

/**
 * Neural Constellation — the career graph as a flyable 3D universe.
 * The camera rides a curve through the graph: each career stop is a glowing
 * node (sized by tenure, labeled with company + time, flaring as you pass),
 * project satellites branch off each node, and edges carry flowing energy
 * that trails bright behind the camera. Ends at the "future" portal.
 */

export type ConstellationNode = {
    id: string;
    label: string;
    time: number; // months
    projects: string[];
};

type ColorKey = "accent" | "secondary" | "soft";

// --- Layout: nodes along a winding path; spacing grows with tenure ---
type NodeLayout = {
    id: string;
    label: string;
    time: number;
    pos: Vector3;
    size: number;
    satellites: Vector3[];
    t: number; // journey progress at which this node is reached
};

function buildLayout(nodes: ConstellationNode[]) {
    const N = nodes.length;
    const layouts: NodeLayout[] = nodes.map((n, i) => {
        const pos = new Vector3(
            i === 0 ? 0 : (i % 2 ? 1 : -1) * (1.8 + (i % 3) * 0.5),
            i === 0 ? 0 : Math.cos(i * 1.3) * 1.2,
            i === 0 ? 0 : -(6 + (i - 1) * 9)
        );
        // project satellites — one per real project, capped at 3
        const count = Math.min(n.projects.length, 3) || 1;
        const satellites: Vector3[] = [];
        for (let j = 0; j < count; j++) {
            const a = (j * Math.PI * 2) / count + i * 1.3;
            satellites.push(new Vector3(Math.cos(a) * 1.6, Math.sin(a) * 1.1, 0.4));
        }
        return {
            id: n.id,
            label: n.label,
            time: n.time,
            pos,
            size: i === N - 1 ? 0.85 : 0.55 + Math.min(n.time, 40) * 0.006,
            satellites,
            t: N > 1 ? i / (N - 1) : 0,
        };
    });

    const pathPoints = layouts.map((l) => l.pos);
    const cameraCurve = new CatmullRomCurve3(
        pathPoints.map((p) => p.clone().add(new Vector3(0, 1.3, 3.2))),
        false,
        "catmullrom",
        0.5
    );

    return { layouts, cameraCurve };
}

// --- Soft radial glow texture (shared, tinted via material color) ---
let glowTex: CanvasTexture | null = null;

function getGlowTexture(): CanvasTexture {
    if (glowTex) return glowTex;
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("2d context unavailable");
    const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    g.addColorStop(0, "rgba(255,255,255,0.85)");
    g.addColorStop(0.35, "rgba(255,255,255,0.28)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 256);
    glowTex = new CanvasTexture(canvas);
    return glowTex;
}

// --- Node label sprites (canvas-generated, zero network, cached) ---
const labelCache = new Map<string, CanvasTexture>();

function getLabelTexture(label: string, time: number): CanvasTexture {
    const key = `${label}|${time}`;
    const cached = labelCache.get(key);
    if (cached) return cached;

    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("2d context unavailable");

    // translucent pill marker
    ctx.fillStyle = "rgba(8, 8, 18, 0.55)";
    ctx.beginPath();
    ctx.roundRect(16, 34, 480, 60, 30);
    ctx.fill();

    // accent dot
    ctx.fillStyle = "#a78bfa";
    ctx.beginPath();
    ctx.arc(54, 64, 9, 0, Math.PI * 2);
    ctx.fill();

    // label text
    ctx.fillStyle = "#ffffff";
    ctx.font = "600 30px Inter, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const text = label.toUpperCase() + (time ? `  ·  ${time} MO` : "");
    ctx.fillText(text, 270, 65, 410);

    const tex = new CanvasTexture(canvas);
    labelCache.set(key, tex);
    return tex;
}

// --- Camera rig: rides the graph curve with scroll, mouse drift on top ---
function CameraRig({
    curve,
    progress,
    reduced,
}: {
    curve: CatmullRomCurve3;
    progress: MotionValue<number>;
    reduced: boolean;
}) {
    const pointer = useRef({ x: 0, y: 0 });
    const pos = useRef(new Vector3(0, 1.3, 3.2));
    const look = useRef(new Vector3(0, 1.3, -4));
    const target = useRef(new Vector3());
    const lookTarget = useRef(new Vector3());

    useEffect(() => {
        if (reduced) return;
        const onMove = (e: PointerEvent) => {
            pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
            pointer.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
        };
        window.addEventListener("pointermove", onMove);
        return () => window.removeEventListener("pointermove", onMove);
    }, [reduced]);

    useFrame((state, delta) => {
        const t = reduced ? 0 : Math.min(Math.max(progress.get(), 0), 1);
        const k = Math.min(1, delta * 3);

        // Dolly along the graph + gentle mouse drift
        curve.getPoint(t, target.current);
        target.current.x += pointer.current.x * 0.4;
        target.current.y += pointer.current.y * 0.25;
        pos.current.lerp(target.current, k);

        // Look ahead along the path — cinematic heading
        curve.getPoint(Math.min(1, t + 0.07), lookTarget.current);
        lookTarget.current.x += pointer.current.x * 0.4;
        lookTarget.current.y += pointer.current.y * 0.25;
        look.current.lerp(lookTarget.current, k);

        state.camera.position.copy(pos.current);
        state.camera.lookAt(look.current);
    });
    return null;
}

// --- Graph edge: faint base + flowing dashed energy that trails bright ---
function PathEdge({
    a,
    b,
    color,
    progress,
    passT,
    reduced,
}: {
    a: Vector3;
    b: Vector3;
    color: string;
    progress: MotionValue<number>;
    passT: number;
    reduced: boolean;
}) {
    const flow = useRef<Line2 | null>(null);

    useFrame((state) => {
        const mat = flow.current?.material;
        if (!mat) return;
        if (!reduced) mat.dashOffset = -state.clock.elapsedTime * 1.6;
        const passed = progress.get() >= passT;
        mat.opacity += ((passed ? 0.95 : 0.3) - mat.opacity) * 0.08;
    });

    return (
        <group>
            <Line points={[a, b]} color={color} lineWidth={1} transparent opacity={0.16} />
            <Line
                ref={flow}
                points={[a, b]}
                color={color}
                lineWidth={2.4}
                transparent
                opacity={0.3}
                dashed
                dashSize={0.55}
                gapSize={0.5}
            />
        </group>
    );
}

// --- Career node: glowing core + pulse + flare-on-pass + label + satellites ---
function CareerNode({
    node,
    palette,
    progress,
    reduced,
    isLast,
}: {
    node: NodeLayout;
    palette: Record<ColorKey, string>;
    progress: MotionValue<number>;
    reduced: boolean;
    isLast: boolean;
}) {
    const core = useRef<Mesh>(null);
    const glow = useRef<Sprite | null>(null);
    const flare = useRef(0);
    const labelTexture = getLabelTexture(node.label, node.time);
    const glowTexture = getGlowTexture();

    useFrame((state) => {
        const time = state.clock.elapsedTime;
        const passed = progress.get() >= node.t - 0.04;
        flare.current += ((passed ? 1 : 0) - flare.current) * 0.06;
        const pulse = reduced ? 0 : Math.sin(time * 2 + node.pos.x * 2) * 0.06;

        if (core.current) {
            core.current.scale.setScalar(node.size * (1 + pulse + flare.current * 0.2));
            core.current.rotation.y = reduced ? 0 : time * 0.25;
            core.current.rotation.x = reduced ? 0 : time * 0.12;
        }
        if (glow.current) {
            const s = node.size * (3.4 + pulse * 2.4 + flare.current * 1.2);
            glow.current.scale.set(s, s, 1);
        }
    });

    return (
        <group position={node.pos}>
            {/* core */}
            <mesh ref={core}>
                <icosahedronGeometry args={[1, 2]} />
                <meshStandardMaterial
                    color={palette.accent}
                    emissive={palette.accent}
                    emissiveIntensity={0.6}
                    roughness={0.3}
                    metalness={0.35}
                />
            </mesh>
            {/* soft glow */}
            <sprite ref={glow}>
                <spriteMaterial
                    map={glowTexture}
                    color={palette.accent}
                    transparent
                    opacity={0.3}
                    depthWrite={false}
                />
            </sprite>
            {/* label marker */}
            <sprite position={[0, 1.9, 0]} scale={[2.3, 0.58, 1]}>
                <spriteMaterial map={labelTexture} transparent depthWrite={false} />
            </sprite>

            {/* project satellites branching off */}
            {node.satellites.map((s, j) => (
                <group key={j}>
                    <Line points={[[0, 0, 0], s]} color={palette.secondary} lineWidth={1} transparent opacity={0.26} />
                    <Float speed={1.5} rotationIntensity={1.5} floatIntensity={1.4}>
                        <mesh position={s} scale={0.15 + (j % 2) * 0.06}>
                            <octahedronGeometry args={[1, 0]} />
                            <meshStandardMaterial
                                color={j % 2 ? palette.secondary : palette.soft}
                                emissive={j % 2 ? palette.secondary : palette.soft}
                                emissiveIntensity={0.35}
                                roughness={0.3}
                                metalness={0.4}
                            />
                        </mesh>
                    </Float>
                </group>
            ))}

            {/* future portal ring */}
            {isLast && (
                <mesh rotation={[Math.PI / 2.4, 0.4, 0]}>
                    <torusGeometry args={[1.9, 0.03, 8, 100]} />
                    <meshBasicMaterial color={palette.secondary} transparent opacity={0.6} />
                </mesh>
            )}
        </group>
    );
}

// --- Depth debris drifting far from the path ---
function DebrisPiece({
    pos,
    scale,
    color,
    wire,
}: {
    pos: [number, number, number];
    scale: number;
    color: string;
    wire?: boolean;
}) {
    return (
        <Float speed={1.2} rotationIntensity={1.4} floatIntensity={1.6}>
            <mesh position={pos} scale={scale}>
                {wire ? <icosahedronGeometry args={[1, 0]} /> : <boxGeometry args={[1.2, 1.2, 1.2]} />}
                {wire ? (
                    <meshBasicMaterial color={color} wireframe transparent opacity={0.45} />
                ) : (
                    <meshStandardMaterial color={color} roughness={0.3} metalness={0.4} />
                )}
            </mesh>
        </Float>
    );
}

function ConstellationWorld({
    progress,
    reduced,
    nodes,
}: {
    progress: MotionValue<number>;
    reduced: boolean;
    nodes: ConstellationNode[];
}) {
    const { theme } = useThemeStore();
    const { size } = useThree();
    const compact = size.width < 640;

    const accent = theme === "dark" ? "#a78bfa" : "#7c3aed"; // violet
    const secondary = theme === "dark" ? "#22d3ee" : "#0891b2"; // cyan
    const soft = theme === "dark" ? "#34d399" : "#10b981"; // emerald
    const sparkle = theme === "dark" ? "#c4b5fd" : "#7c3aed";
    const bg = theme === "dark" ? "#0a0a0a" : "#fafafa";
    const palette: Record<ColorKey, string> = { accent, secondary, soft };

    const { layouts, cameraCurve } = buildLayout(nodes);

    const depthDebris: { pos: [number, number, number]; scale: number; color: ColorKey; wire?: boolean }[] = [
        { pos: [4.6, 2.6, -8], scale: 0.4, color: "secondary", wire: true },
        { pos: [-4.8, -2.4, -13], scale: 0.34, color: "soft" },
        { pos: [4.4, -2.7, -19], scale: 0.38, color: "accent", wire: true },
        { pos: [-4.6, 2.5, -25], scale: 0.36, color: "soft", wire: true },
    ];

    return (
        <>
            {/* Cinematic depth — nodes fade in as you approach */}
            <fog attach="fog" args={[bg, 5, 30]} />

            {/* Lighting — pure lights, no external HDR fetches */}
            <ambientLight intensity={theme === "dark" ? 0.5 : 0.8} />
            <directionalLight position={[4, 8, 6]} intensity={theme === "dark" ? 1.2 : 1.0} color="#ffffff" />
            <pointLight position={[0, 2, -4]} intensity={26} color={secondary} distance={18} />
            <pointLight position={[0, 2, -16]} intensity={26} color={accent} distance={20} />
            <pointLight position={[0, 2, -26]} intensity={34} color={accent} distance={18} />

            <CameraRig curve={cameraCurve} progress={progress} reduced={reduced} />

            {/* graph edges — energy flows, trail brightens behind you */}
            {layouts.slice(0, -1).map((n, i) => (
                <PathEdge
                    key={n.id}
                    a={n.pos}
                    b={layouts[i + 1].pos}
                    color={i % 2 ? secondary : accent}
                    progress={progress}
                    passT={layouts[i + 1].t}
                    reduced={reduced}
                />
            ))}

            {/* career nodes */}
            {layouts.map((n, i) => (
                <CareerNode
                    key={n.id}
                    node={n}
                    palette={palette}
                    progress={progress}
                    reduced={reduced}
                    isLast={i === layouts.length - 1}
                />
            ))}

            {/* depth debris */}
            {!compact &&
                depthDebris.map((d, i) => (
                    <DebrisPiece key={i} pos={d.pos} scale={d.scale} color={palette[d.color]} wire={d.wire} />
                ))}

            {/* starfield throughout the graph */}
            <Sparkles
                count={compact ? 80 : 170}
                scale={[34, 20, 48]}
                position={[0, 0, -14]}
                size={2}
                speed={reduced ? 0.1 : 0.4}
                color={sparkle}
                opacity={theme === "dark" ? 0.7 : 0.5}
            />
        </>
    );
}

export default function PageScene({
    scrollContainerRef,
    careerNodes,
}: {
    scrollContainerRef: RefObject<HTMLElement | null>;
    careerNodes: ConstellationNode[];
}) {
    const reduced = useReducedMotion() ?? false;
    const { scrollYProgress } = useScroll({ container: scrollContainerRef });

    return (
        <div className="fixed inset-0 -z-10 pointer-events-none" aria-hidden>
            <Canvas
                dpr={[1, 1.75]}
                camera={{ position: [0, 1.3, 3.2], fov: 50 }}
                gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
            >
                <ConstellationWorld progress={scrollYProgress} reduced={reduced} nodes={careerNodes} />
            </Canvas>
            {/* Cinematic vignette */}
            <div
                className="fixed inset-0 pointer-events-none"
                style={{ background: "radial-gradient(ellipse at center, transparent 62%, rgba(0,0,0,0.08) 100%)" }}
            />
        </div>
    );
}
