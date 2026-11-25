"use client";

import {
    motion,
    useAnimationFrame,
    useMotionValue,
    useReducedMotion,
    useVelocity,
    type MotionValue,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";

/**
 * Electric circuit backdrop — a PROCEDURALLY GENERATED endless schematic,
 * unique on every page load. A 4-rail network carries randomly routed rungs,
 * bridges, drop stubs, 45° diagonals, chips, resistors, capacitors, an
 * inductor, vias, grounds and solder nodes. Time-based current circulates
 * through every trace, and bright pulses wander the whole network, picking a
 * random direction at every junction and surging with scroll velocity.
 * Generated client-side after mount (SSR-safe). Static under reduced motion.
 */

const CIRCUIT_H = 6400; // viewBox height — the page-length schematic

type Pt = [number, number];
type ChipSpec = { x: number; y: number; w: number; h: number; pins: "tb" | "right" };
type Edge = { a: Pt; b: Pt; d: string; len: number };
type Adjacency = Map<string, Array<{ edge: number; other: Pt }>>;

type Layout = {
    tracePaths: string[];
    compPaths: string[];
    chips: ChipSpec[];
    graph: Pt[][];
    edges: Edge[];
    adjacency: Adjacency;
    nodes: Pt[];
    vias: Pt[];
    liveNodes: Pt[];
    sparks: Pt[];
    flows: Array<{ d: string; duration: string; delay: string; reverse: boolean }>;
};

const rnd = (min: number, max: number) => min + Math.random() * (max - min);
const irnd = (min: number, max: number) => Math.floor(rnd(min, max + 1));
const pick = <T,>(arr: T[]): T => arr[(Math.random() * arr.length) | 0];
const ptKey = (p: Pt) => `${p[0]},${p[1]}`;
const samePt = (p: Pt, q: Pt) => p[0] === q[0] && p[1] === q[1];
const ptsToD = (pts: Pt[]) => `M ${pts.map((p) => `${p[0]} ${p[1]}`).join(" L ")}`;

const COMP_GAP = { resistor: 66, cap: 26, chip: 112, inductor: 100 } as const;
type CompKind = keyof typeof COMP_GAP;

/* ------------------------------------------------------------------ */
/* Procedural generator — a fresh circuit every reload                */
/* ------------------------------------------------------------------ */

function generateLayout(): Layout {
    const H = CIRCUIT_H;

    // --- rails (randomized positions & spans) ---
    const rails = [
        { x: Math.round(rnd(110, 175)), top: -20, bot: H + 20 },
        { x: Math.round(rnd(1025, 1090)), top: -20, bot: H + 20 },
        { x: Math.round(rnd(390, 560)), top: Math.round(rnd(550, 1050)), bot: H + 20 },
        { x: Math.round(rnd(730, 900)), top: Math.round(rnd(1250, 1950)), bot: Math.round(rnd(H - 1500, H - 700)) },
    ];

    const tracePaths: string[] = [];
    const compPaths: string[] = [];
    const chips: ChipSpec[] = [];
    const graph: Pt[][] = [];
    const nodeMap = new Map<string, Pt>();

    const addPoly = (pts: Pt[]) => {
        graph.push(pts);
        tracePaths.push(ptsToD(pts));
        for (const p of pts) nodeMap.set(ptKey(p), p);
    };

    // rail taps — every connection point on a rail; rails are split there so
    // the traversal graph actually connects through them
    const railTaps: number[][] = [[], [], [], []];
    const tapRail = (ri: number, y: number) => railTaps[ri].push(Math.round(y));

    // --- rung heights (jittered cascade down the page) ---
    const rungYs: number[] = [];
    let ry = rnd(120, 220);
    while (ry < H - 380) {
        rungYs.push(Math.round(ry));
        ry += rnd(540, 800);
    }

    // --- rung shapes: step / 45° diag / double-step ---
    const rungShape = (y: number): Pt[] => {
        const dy = Math.round(rnd(-45, 45));
        const m1 = Math.round(rnd(rails[0].x + 140, (rails[0].x + rails[1].x) / 2 - 60));
        const kind = pick(["step", "diag", "zig", "step"] as const);
        if (kind === "diag" && Math.abs(dy) >= 12) {
            return [[rails[0].x, y], [m1, y], [m1 + Math.abs(dy), y + dy], [rails[1].x, y + dy]];
        }
        if (kind === "zig") {
            const m2 = Math.round(rnd(m1 + 140, rails[1].x - 100));
            const mid = y + Math.round(dy / 2);
            return [[rails[0].x, y], [m1, y], [m1, mid], [m2, mid], [m2, y + dy], [rails[1].x, y + dy]];
        }
        return [[rails[0].x, y], [m1, y], [m1, y + dy], [rails[1].x, y + dy]];
    };

    // junction where a rung crosses V3/V4 (within their live span)
    const insertCrossings = (pts: Pt[]): Pt[] => {
        let out = pts;
        for (let ri = 2; ri < rails.length; ri++) {
            const rail = rails[ri];
            let inserted = false;
            for (let i = 0; i < out.length - 1 && !inserted; i++) {
                const [ax, ay] = out[i];
                const [bx, by] = out[i + 1];
                if (ax === bx) continue;
                if ((rail.x - ax) * (bx - rail.x) > 0) {
                    const t = (rail.x - ax) / (bx - ax);
                    const cy = Math.round(ay + t * (by - ay));
                    if (cy > rail.top && cy < rail.bot) {
                        out = [...out.slice(0, i + 1), [rail.x, cy], ...out.slice(i + 1)];
                        tapRail(ri, cy);
                        inserted = true;
                    }
                }
            }
        }
        return out;
    };

    // place a component symbol inside a gap on a horizontal rung segment
    const tryPlaceComp = (polys: Pt[][], kind: CompKind): boolean => {
        const gap = COMP_GAP[kind];
        const segs: Array<{ poly: number; i: number; x1: number; y: number; x2: number }> = [];
        polys.forEach((pts, poly) => {
            for (let i = 0; i < pts.length - 1; i++) {
                const [ax, ay] = pts[i];
                const [bx, by] = pts[i + 1];
                if (ay === by && bx - ax >= gap + 70) segs.push({ poly, i, x1: ax, y: ay, x2: bx });
            }
        });
        if (!segs.length) return false;
        const seg = pick(segs);
        const gx = Math.round(rnd(seg.x1 + 30, seg.x2 - gap - 30));
        const gy = seg.y;
        const poly = polys[seg.poly];
        polys.splice(
            seg.poly,
            1,
            [...poly.slice(0, seg.i + 1), [gx, gy]],
            [[gx + gap, gy], ...poly.slice(seg.i + 1)]
        );
        if (kind === "resistor") {
            compPaths.push(`M ${gx} ${gy} l 8 -10 l 10 20 l 10 -20 l 10 20 l 10 -20 l 10 20 l 8 -10`);
        } else if (kind === "cap") {
            compPaths.push(`M ${gx + 9} ${gy - 14} V ${gy + 14} M ${gx + 17} ${gy - 14} V ${gy + 14}`);
        } else if (kind === "inductor") {
            compPaths.push(
                `M ${gx} ${gy} a 12.5 12.5 0 0 1 25 0 a 12.5 12.5 0 0 1 25 0 a 12.5 12.5 0 0 1 25 0 a 12.5 12.5 0 0 1 25 0`
            );
        } else {
            chips.push({ x: gx, y: gy - 35, w: gap, h: 70, pins: "tb" });
        }
        return true;
    };

    // --- rungs (with 0-2 random components each, then rail crossings) ---
    for (const y of rungYs) {
        const polys: Pt[][] = [rungShape(y)];
        const compCount = irnd(0, 2);
        for (let c = 0; c < compCount; c++) {
            tryPlaceComp(polys, pick(["resistor", "chip", "cap", "inductor"] as const));
        }
        const last = polys[polys.length - 1];
        tapRail(0, y);
        tapRail(1, last[last.length - 1][1]);
        polys.map(insertCrossings).forEach(addPoly);
    }

    // --- bridges between adjacent rails ---
    for (let b = 0, n = irnd(5, 7); b < n; b++) {
        const ri = irnd(0, rails.length - 2);
        const a = rails[ri];
        const c = rails[ri + 1];
        const top = Math.max(a.top, c.top) + 80;
        const bot = Math.min(a.bot, c.bot) - 80;
        if (bot - top < 160) continue;
        const y = Math.round(rnd(top, bot));
        const mx = Math.round(rnd(a.x + 60, c.x - 60));
        const s = pick([0, 0, 40, -40]);
        const straight = s === 0 || y + s > c.bot - 40 || y + s < c.top + 40;
        const endY = straight ? y : y + s;
        tapRail(ri, y);
        tapRail(ri + 1, endY);
        if (straight) {
            addPoly([[a.x, y], [mx, y], [c.x, y]]);
        } else {
            addPoly([[a.x, y], [mx, y], [mx, endY], [c.x, endY]]);
        }
    }

    // --- drop stubs off rung bends ---
    for (let i = 0, n = irnd(4, 6); i < n; i++) {
        const poly = pick(graph.filter((p) => p.length > 1));
        const [px, py] = pick(poly);
        if (rails.some((r) => r.x === px) || py > H - 300) continue;
        addPoly([[px, py], [px, py + Math.round(rnd(90, 220))]]);
    }

    // --- 45° diagonals between adjacent rails ---
    for (let i = 0, n = irnd(2, 3); i < n; i++) {
        const ri = irnd(0, rails.length - 2);
        const a = rails[ri];
        const c = rails[ri + 1];
        const span = Math.abs(c.x - a.x);
        const top = Math.max(a.top, c.top) + 100;
        const bot = Math.min(a.bot, c.bot) - 100;
        if (bot - top < span + 120) continue;
        const y = Math.round(rnd(top + span / 2, bot - span / 2));
        const y2 = y + pick([-1, 1]) * span;
        tapRail(ri, y);
        tapRail(ri + 1, y2);
        addPoly([[a.x, y], [c.x, y2]]);
    }

    // --- edge stubs ---
    for (let i = 0; i < 4; i++) {
        const ri = irnd(0, rails.length - 1);
        const rail = rails[ri];
        const y = Math.round(rnd(Math.max(80, rail.top + 40), Math.min(H - 80, rail.bot - 40)));
        const side = rail.x < 600 ? -1 : rail.x > 800 ? 1 : pick([-1, 1]);
        tapRail(ri, y);
        addPoly([[rail.x, y], [rail.x + side * Math.round(rnd(60, 100)), y]]);
    }

    // --- grounds ---
    for (let i = 0; i < 2; i++) {
        const ri = irnd(0, rails.length - 1);
        const rail = rails[ri];
        const y = Math.round(rnd(Math.max(100, rail.top + 60), Math.min(H - 200, rail.bot - 120)));
        tapRail(ri, y);
        addPoly([[rail.x, y], [rail.x, y + 60]]);
        compPaths.push(
            `M ${rail.x - 20} ${y + 60} H ${rail.x + 20} M ${rail.x - 13} ${y + 68} H ${rail.x + 13} M ${rail.x - 6} ${y + 76} H ${rail.x + 6}`
        );
    }

    // --- chips hanging off rails ---
    for (let i = 0, n = irnd(1, 2); i < n; i++) {
        const ri = irnd(0, rails.length - 1);
        const rail = rails[ri];
        const y = Math.round(rnd(Math.max(140, rail.top + 90), Math.min(H - 240, rail.bot - 120)));
        const w = 90;
        const h = 60;
        const cx = rail.x - 10 - w; // always on the left of the rail
        if (cx < 30) continue;
        chips.push({ x: cx, y: y - h / 2, w, h, pins: "right" });
        tapRail(ri, y);
        addPoly([[rail.x, y], [cx + w, y]]);
    }

    // --- dangling capacitors off rung points ---
    for (let i = 0, n = irnd(1, 2); i < n; i++) {
        const poly = pick(graph.filter((p) => p.length > 1));
        const [px, py] = pick(poly);
        if (rails.some((r) => r.x === px) || py > H - 350) continue;
        const gy = py + 30;
        addPoly([[px, py], [px, gy + 44]]);
        compPaths.push(`M ${px - 12} ${gy} H ${px + 12} M ${px - 12} ${gy + 14} H ${px + 12}`);
    }

    // --- rails (split at every tap so the traversal graph connects) ---
    railTaps.forEach((taps, ri) => {
        const rail = rails[ri];
        const ys = Array.from(new Set(taps))
            .filter((y) => y > rail.top && y < rail.bot)
            .sort((p, q) => p - q);
        addPoly([
            [rail.x, rail.top],
            ...ys.map((y) => [rail.x, y] as Pt),
            [rail.x, rail.bot],
        ]);
    });

    // --- traversal graph ---
    const edges: Edge[] = [];
    const adjacency: Adjacency = new Map();
    graph.forEach((pts) => {
        for (let i = 0; i < pts.length - 1; i++) {
            const a = pts[i];
            const b = pts[i + 1];
            const len = Math.max(Math.hypot(b[0] - a[0], b[1] - a[1]), 1);
            const idx = edges.length;
            edges.push({ a, b, d: `M ${a[0]} ${a[1]} L ${b[0]} ${b[1]}`, len });
            for (const [p, other] of [
                [a, b],
                [b, a],
            ] as Array<[Pt, Pt]>) {
                const k = ptKey(p);
                if (!adjacency.has(k)) adjacency.set(k, []);
                adjacency.get(k)!.push({ edge: idx, other });
            }
        }
    });

    // --- decorations ---
    const nodes = Array.from(nodeMap.values());
    const candidates = nodes.filter((p) => p[0] > 80 && p[0] < 1120 && p[1] > 100 && p[1] < H - 140);
    const shuffled = [...candidates].sort(() => Math.random() - 0.5);
    const vias = shuffled.slice(0, 7);
    const liveNodes = shuffled.slice(7, 12);
    const sparks: Pt[] = Array.from({ length: 8 }, () => [irnd(80, 1120), irnd(100, H - 140)]);

    // --- flows: every trace carries circulating current ---
    const flows = tracePaths.map((d) => ({
        d,
        duration: `${rnd(7, 16).toFixed(1)}s`,
        delay: `${rnd(0, 3).toFixed(1)}s`,
        reverse: Math.random() < 0.5,
    }));

    return {
        tracePaths,
        compPaths,
        chips,
        graph,
        edges,
        adjacency,
        nodes,
        vias,
        liveNodes,
        sparks,
        flows,
    };
}

/* ------------------------------------------------------------------ */
/* Wandering pulses — random walk through the generated network       */
/* ------------------------------------------------------------------ */

const PULSE_COUNT = 9;
const PULSE_SPEED = 240; // user-units per second

const pickNext = (adjacency: Adjacency, node: Pt, from: number): number => {
    const options = (adjacency.get(ptKey(node)) ?? []).filter((e) => e.edge !== from);
    if (!options.length) return -1;
    const down = options.filter((e) => e.other[1] > node[1]);
    const up = options.filter((e) => e.other[1] <= node[1]);
    const pool = down.length && up.length ? (Math.random() < 0.6 ? down : up) : options;
    return pool[(Math.random() * pool.length) | 0].edge;
};

function Pulse({
    velocity,
    seed,
    edges,
    adjacency,
}: {
    velocity: MotionValue<number>;
    seed: number;
    edges: Edge[];
    adjacency: Adjacency;
}) {
    const initial = seed % edges.length;
    const initialT = (seed % 5) / 5; // deterministic start position (SSR-safe)
    const edgeRef = useRef(initial);
    const st = useRef({ t: initialT, dir: seed % 2 ? 1 : -1 });
    const [d, setD] = useState(edges[initial].d);
    const offset = useMotionValue(-(initialT * 93));

    useAnimationFrame((_, deltaMs) => {
        const dt = Math.min(deltaMs, 50) / 1000;
        const boost = 1 + Math.min(Math.abs(velocity.get()) * 0.6, 5);
        let edge = edges[edgeRef.current];
        st.current.t += (st.current.dir * PULSE_SPEED * boost * dt) / edge.len;

        if (st.current.t >= 1 || st.current.t <= 0) {
            const node = st.current.t >= 1 ? edge.b : edge.a;
            st.current.t = Math.max(0, Math.min(1, st.current.t));
            const next = pickNext(adjacency, node, edgeRef.current);
            if (next === -1) {
                st.current.dir = -st.current.dir; // dead end — reflect
            } else {
                edgeRef.current = next;
                edge = edges[next];
                st.current.dir = samePt(edge.a, node) ? 1 : -1;
                st.current.t = st.current.dir === 1 ? 0 : 1;
                setD(edge.d); // hop to the next trace
            }
        }
        offset.set(-(st.current.t * 93));
    });

    return (
        <motion.path
            className="circuit-pulse"
            style={{
                strokeDashoffset: offset,
                filter: "drop-shadow(0 0 6px var(--color-secondary-accent-color))",
            }}
            pathLength={100}
            vectorEffect="non-scaling-stroke"
            d={d}
        />
    );
}

/* ------------------------------------------------------------------ */

export default function CircuitBackground({ progress }: { progress: MotionValue<number> }) {
    const reduced = useReducedMotion();
    const velocity = useVelocity(progress);

    // The layout is generated client-side after mount → unique every reload,
    // no SSR/CSR mismatch (the backdrop starts as haze-only).
    const [layout, setLayout] = useState<Layout | null>(null);
    useEffect(() => {
        const id = requestAnimationFrame(() => setLayout(generateLayout()));
        return () => cancelAnimationFrame(id);
    }, []);

    return (
        <div
            className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
            aria-hidden="true"
        >
            <svg
                className={`h-full w-full ${layout ? "animate-in fade-in duration-1000" : ""}`}
                viewBox={`0 0 1200 ${CIRCUIT_H}`}
                preserveAspectRatio="none"
            >
                <defs>
                    <radialGradient id="circuit-haze" cx="50%" cy="8%" r="45%">
                        <stop offset="0%" stopColor="var(--color-accent-color)" stopOpacity="0.10" />
                        <stop offset="100%" stopColor="var(--color-accent-color)" stopOpacity="0" />
                    </radialGradient>
                    <radialGradient id="circuit-haze-corner" cx="10%" cy="94%" r="40%">
                        <stop offset="0%" stopColor="var(--color-secondary-accent-color)" stopOpacity="0.07" />
                        <stop offset="100%" stopColor="var(--color-secondary-accent-color)" stopOpacity="0" />
                    </radialGradient>
                </defs>

                {/* voltage haze (always present) */}
                <rect width="1200" height={CIRCUIT_H} fill="url(#circuit-haze)" />
                <rect width="1200" height={CIRCUIT_H} fill="url(#circuit-haze-corner)" />

                {layout && (
                    <>
                        {/* all traces */}
                        <g
                            fill="none"
                            stroke="var(--color-accent-color)"
                            strokeOpacity="0.14"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            {layout.tracePaths.map((d, i) => (
                                <path key={`t-${i}`} vectorEffect="non-scaling-stroke" d={d} />
                            ))}
                            {layout.compPaths.map((d, i) => (
                                <path key={`c-${i}`} vectorEffect="non-scaling-stroke" d={d} />
                            ))}
                        </g>

                        {/* infinite circulation — every trace carries current */}
                        <g
                            fill="none"
                            stroke="var(--color-accent-color)"
                            strokeOpacity="0.5"
                            strokeWidth="1.75"
                            strokeLinecap="round"
                        >
                            {layout.flows.map((f, i) => (
                                <path
                                    key={`flow-${i}`}
                                    className="circuit-flow"
                                    style={{
                                        animationDuration: f.duration,
                                        animationDelay: f.delay,
                                        animationDirection: f.reverse ? "reverse" : "normal",
                                    }}
                                    vectorEffect="non-scaling-stroke"
                                    pathLength={100}
                                    d={f.d}
                                />
                            ))}
                        </g>

                        {/* IC chips + pins */}
                        <g
                            fill="none"
                            stroke="var(--color-accent-color)"
                            strokeOpacity="0.16"
                            strokeWidth="1.5"
                            strokeLinejoin="round"
                        >
                            {layout.chips.map((c, i) => {
                                const pinPaths =
                                    c.pins === "right"
                                        ? [
                                              [c.y + 15, c.y + 30, c.y + 45]
                                                  .map((py) => `M ${c.x + c.w} ${py} H ${c.x + c.w + 10}`)
                                                  .join(" "),
                                          ]
                                        : [
                                              [c.x + 20, c.x + c.w * 0.4, c.x + c.w * 0.6, c.x + c.w - 20]
                                                  .map((px) => `M ${px} ${c.y} V ${c.y - 12}`)
                                                  .join(" "),
                                              [c.x + 20, c.x + c.w * 0.4, c.x + c.w * 0.6, c.x + c.w - 20]
                                                  .map((px) => `M ${px} ${c.y + c.h} V ${c.y + c.h + 12}`)
                                                  .join(" "),
                                          ];
                                return (
                                    <g key={`chip-${i}`}>
                                        <rect
                                            vectorEffect="non-scaling-stroke"
                                            x={c.x}
                                            y={c.y}
                                            width={c.w}
                                            height={c.h}
                                            rx="8"
                                        />
                                        {pinPaths.map((d, j) => (
                                            <path key={j} vectorEffect="non-scaling-stroke" d={d} />
                                        ))}
                                    </g>
                                );
                            })}
                        </g>

                        {/* solder nodes */}
                        <g fill="var(--color-accent-color)" fillOpacity="0.35">
                            {layout.nodes.map(([cx, cy]) => (
                                <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="3" />
                            ))}
                        </g>

                        {/* vias — ringed junctions */}
                        <g
                            fill="none"
                            stroke="var(--color-secondary-accent-color)"
                            strokeOpacity="0.4"
                            strokeWidth="1.5"
                        >
                            {layout.vias.map(([cx, cy]) => (
                                <circle key={`via-${cx}-${cy}`} cx={cx} cy={cy} r="5.5" />
                            ))}
                        </g>

                        {/* live nodes — breathing */}
                        <g fill="var(--color-secondary-accent-color)">
                            {layout.liveNodes.map(([cx, cy], i) => (
                                <circle
                                    key={`live-${cx}-${cy}`}
                                    className="circuit-node-live"
                                    style={{ animationDelay: `${i * 1.3}s` }}
                                    cx={cx}
                                    cy={cy}
                                    r="3.5"
                                />
                            ))}
                        </g>

                        {/* scattered spark marks */}
                        <g
                            stroke="var(--color-secondary-accent-color)"
                            strokeOpacity="0.12"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                        >
                            {layout.sparks.map(([x, y], i) => (
                                <path
                                    key={`spark-${i}`}
                                    vectorEffect="non-scaling-stroke"
                                    d={`M ${x - 6} ${y} H ${x + 6} M ${x} ${y - 6} V ${y + 6}`}
                                />
                            ))}
                        </g>

                        {/* wandering pulses — current traveling throughout the network */}
                        <g
                            fill="none"
                            stroke="var(--color-secondary-accent-color)"
                            strokeWidth="3"
                            strokeLinecap="round"
                        >
                            {!reduced &&
                                Array.from({ length: PULSE_COUNT }, (_, i) => (
                                    <Pulse
                                        key={`pulse-${i}`}
                                        velocity={velocity}
                                        seed={i * 7 + 3}
                                        edges={layout.edges}
                                        adjacency={layout.adjacency}
                                    />
                                ))}
                        </g>
                    </>
                )}
            </svg>
        </div>
    );
}
