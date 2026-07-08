"use client";

import useThemeStore from "@/lib/useThemeStore";
import { useEffect, useRef } from "react";

// --- Types (Fixes 'any' warnings) ---
interface Point { x: number; y: number; }
interface PathSegment { x1: number; y1: number; x2: number; y2: number; }
interface Direction { dx: number; dy: number; }

const THEMES = {
    dark: {
        background: "#0B0C10",
        grid: "rgba(30,30,30,OPACITY)",
        pulseCore: "rgba(255, 255, 255, 1)",
        pulseGlow: "#bfbfbfff",
        pulseFade: "rgba(192,248,255,0)",
    },
    light: {
        background: "#F7F8FA",
        grid: "rgba(245,245,245,OPACITY)",
        pulseCore: "rgba(0, 0, 0, 1)",
        pulseGlow: "#585858ff",
        pulseFade: "rgba(40,120,255,0)",
    },
};


// --- Animation Class (Moved outside to fix Next.js Compilation warning) ---
class ElectricPulse {
    gridX: number;
    gridY: number;
    path: PathSegment[] = [];
    segmentLengths: number[] = [];
    totalDistance: number = 0;
    headDist: number = 0;
    tailDist: number = 0;
    active: boolean = true;
    fading: boolean = false;
    fadeSpeed: number = 0.02;
    fadeStartFraction = 0.7; // 70% of path
    opacity: number = 1;
    finishedTravel: boolean = false;

    constructor(centerX: number, centerY: number, gridSpacing: number, width: number, height: number, maxSteps: number) {
        this.gridX = Math.round(centerX / gridSpacing);
        this.gridY = Math.round(centerY / gridSpacing);
        this.generatePath(gridSpacing, width, height, maxSteps);
    }
    generatePath(gridSpacing: number, width: number, height: number, maxSteps: number) {
        const centerGX = this.gridX;
        const centerGY = this.gridY;
        let x = this.gridX;
        let y = this.gridY;
        let lastDir: Direction | null = null;
        const distFromCenter = (gx: number, gy: number) =>
            Math.hypot(gx - centerGX, gy - centerGY);

        for (let i = 0; i < maxSteps; i++) {
            const dirs: Direction[] = [];
            const candidates: Direction[] = [
                { dx: 0, dy: -1 },
                { dx: 0, dy: 1 },
                { dx: -1, dy: 0 },
                { dx: 1, dy: 0 },
            ];

            const currentDist = distFromCenter(x, y);

            // 1️⃣ Try outward moves first
            for (const dir of candidates) {
                const nx = x + dir.dx;
                const ny = y + dir.dy;

                if (
                    nx < 0 ||
                    ny < 0 ||
                    nx > Math.floor(width / gridSpacing) ||
                    ny > Math.floor(height / gridSpacing)
                ) continue;

                if (lastDir && dir.dx === -lastDir.dx && dir.dy === -lastDir.dy) continue;

                const nextDist = distFromCenter(nx, ny);
                if (nextDist > currentDist) {
                    dirs.push(dir);
                }
            }

            // 2️⃣ Fallback: allow equal-distance moves
            if (!dirs.length) {
                for (const dir of candidates) {
                    const nx = x + dir.dx;
                    const ny = y + dir.dy;

                    if (
                        nx < 0 ||
                        ny < 0 ||
                        nx > Math.floor(width / gridSpacing) ||
                        ny > Math.floor(height / gridSpacing)
                    ) continue;

                    if (lastDir && dir.dx === -lastDir.dx && dir.dy === -lastDir.dy) continue;

                    const nextDist = distFromCenter(nx, ny);
                    if (nextDist >= currentDist) {
                        dirs.push(dir);
                    }
                }
            }

            // 3️⃣ FINAL fallback: allow any move except reverse
            if (!dirs.length) {
                for (const dir of candidates) {
                    if (lastDir && dir.dx === -lastDir.dx && dir.dy === -lastDir.dy) continue;
                    dirs.push(dir);
                }
            }

            if (!dirs.length) break;

            const dir = dirs[Math.floor(Math.random() * dirs.length)];
            const nx = x + dir.dx;
            const ny = y + dir.dy;

            const seg = {
                x1: x * gridSpacing,
                y1: y * gridSpacing,
                x2: nx * gridSpacing,
                y2: ny * gridSpacing,
            };

            this.path.push(seg);

            const len = Math.hypot(seg.x2 - seg.x1, seg.y2 - seg.y1);
            this.segmentLengths.push(len);
            this.totalDistance += len;

            x = nx;
            y = ny;
            lastDir = dir;
        }
    }
    update(pulseSpeed: number, pulseLengthPx: number) {
        if (!this.active) return;

        // If already fading
        if (this.fading) {
            this.opacity -= this.fadeSpeed;
            if (this.opacity <= 0) this.active = false;
            return;
        }

        // Head traveling forward
        if (!this.finishedTravel) {
            this.headDist += pulseSpeed;

            // 🔹 START fading early
            if (this.headDist >= this.totalDistance * this.fadeStartFraction) {
                this.fading = true;
            }

            if (this.headDist >= this.totalDistance) {
                this.headDist = this.totalDistance;
                this.finishedTravel = true;
            }

            this.tailDist = Math.max(0, this.headDist - pulseLengthPx);
            return;
        }

        // Head stopped → tail continues
        this.tailDist += pulseSpeed;

        if (this.tailDist >= this.headDist) {
            this.tailDist = this.headDist;
        }
    }


    getPointAt(dist: number): Point | null {
        let d = dist;
        for (let i = 0; i < this.path.length; i++) {
            const len = this.segmentLengths[i];
            const seg = this.path[i];
            if (d <= len) {
                const t = d / len;
                return { x: seg.x1 + (seg.x2 - seg.x1) * t, y: seg.y1 + (seg.y2 - seg.y1) * t };
            }
            d -= len;
        }
        return null;
    }


    draw(ctx: CanvasRenderingContext2D, pulseLengthPx: number, colors: typeof THEMES.dark) {
        if (!this.active) return;

        // const tailDist = this.tailDist;
        const tailDist = Math.max(0, this.headDist - pulseLengthPx);
        const headPt = this.getPointAt(this.headDist);
        const tailPt = this.getPointAt(tailDist);
        if (!headPt || !tailPt) return;

        const gradient = ctx.createLinearGradient(tailPt.x, tailPt.y, headPt.x, headPt.y);
        gradient.addColorStop(0, "rgba(192,248,255,0)");
        gradient.addColorStop(0.4, colors.pulseGlow);
        gradient.addColorStop(1, colors.pulseCore);

        ctx.save();
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.lineJoin = "miter";



        ctx.strokeStyle = gradient;
        ctx.shadowColor = colors.pulseGlow;
        ctx.shadowBlur = 18;
        ctx.globalAlpha = this.opacity;

        ctx.beginPath();
        ctx.moveTo(tailPt.x, tailPt.y);

        let d = tailDist;

        for (let i = 0; i < this.path.length; i++) {
            const seg = this.path[i];
            const len = this.segmentLengths[i];

            if (d > len) {
                d -= len;
                continue;
            }

            const startT = Math.max(0, d) / len;
            ctx.lineTo(
                seg.x1 + (seg.x2 - seg.x1) * startT,
                seg.y1 + (seg.y2 - seg.y1) * startT
            );

            const segmentEndDistance =
                this.segmentLengths.slice(0, i).reduce((a, b) => a + b, 0) + len;

            if (this.headDist <= segmentEndDistance) {
                ctx.lineTo(headPt.x, headPt.y);
                break;
            }

            ctx.lineTo(seg.x2, seg.y2);
            d = 0;
        }

        ctx.stroke();
        ctx.restore();
    }

}

export default function PulseBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { theme } = useThemeStore(); // subscribe to theme

    useEffect(() => {
        const colors = THEMES[theme];
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let width = 0;
        let height = 0;
        const gridSpacing = 90;
        let pulses: ElectricPulse[] = [];
        let lastPulseTime = 0;
        let animationFrameId: number;

        const pulseSpeed = 1;
        const pulseLengthPx = 100;
        const maxSteps = 16;

        const resizeCanvas = () => {
            if (!canvas.parentElement) return;
            width = canvas.parentElement.offsetWidth;
            height = canvas.parentElement.offsetHeight;
            canvas.width = width;
            canvas.height = height;
        };

        const drawGrid = () => {
            const centerX = width / 2;
            const centerY = height / 2;

            ctx.lineWidth = 1.5;
            for (let y = 0; y <= height; y += gridSpacing) {
                const dist = Math.abs(y - centerY);
                const fade = Math.max(0.3, 1 - dist / (height / 2));
                // ctx.strokeStyle = `rgba(31,36,44,${0.4 * fade})`;
                ctx.strokeStyle = colors.grid.replace("OPACITY", String(0.4 * fade));
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(width, y);
                ctx.stroke();
            }

            for (let x = 0; x <= width; x += gridSpacing) {
                const dist = Math.abs(x - centerX);
                const fade = Math.max(0.3, 1 - dist / (width / 2));
                // ctx.strokeStyle = `rgba(31,36,44,${0.4 * fade})`;
                ctx.strokeStyle = colors.grid.replace("OPACITY", String(0.4 * fade));
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, height);
                ctx.stroke();
            }
        };

        const animate = (timestamp: number) => {
            // ctx.fillStyle = colors.background;
            ctx.clearRect(0, 0, width, height);
            // ctx.fillRect(0, 0, width, height);
            drawGrid();

            pulses = pulses.filter((p) => p.active);
            pulses.forEach((p) => {
                p.update(pulseSpeed, pulseLengthPx);
                p.draw(ctx, pulseLengthPx, colors);
            });

            if (timestamp - lastPulseTime > 5000 + Math.random() * 3000) {
                if (pulses.length < 3) {
                    pulses.push(new ElectricPulse(width / 2, height / 2, gridSpacing, width, height, maxSteps));
                    lastPulseTime = timestamp;
                }
            }
            animationFrameId = requestAnimationFrame(animate);
        };

        resizeCanvas();
        window.addEventListener("resize", resizeCanvas);

        // Initial Pulse
        setTimeout(() => {
            pulses.push(new ElectricPulse(width / 2, height / 2, gridSpacing, width, height, maxSteps));
        }, 800);

        animationFrameId = requestAnimationFrame(animate);

        return () => {
            window.removeEventListener("resize", resizeCanvas);
            cancelAnimationFrame(animationFrameId);
        };
    }, [theme]);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none"
        />
    );
}