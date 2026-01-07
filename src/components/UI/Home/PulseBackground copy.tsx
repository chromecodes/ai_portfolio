"use client";

import { useEffect, useRef } from "react";

export default function PulseBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const prefersReducedMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;

        let width = 0;
        let height = 0;

        let gridSpacing = 90;
        let gridLines = { horizontal: [], vertical: [] };
        let pulses: any[] = [];
        let lastPulseTime = 0;

        let centerX = 0;
        let centerY = 0;

        const pulseSpeed = 1;
        const pulseLengthPx = 150;
        const maxSteps = 10;

        class ElectricPulse {
            gridX: number;
            gridY: number;
            path: any[];
            segmentLengths: number[];
            totalDistance: number;
            headDist: number;
            tailDist: number;
            active: boolean;
            fading: boolean;
            fadeSpeed: number;
            opacity: number;
            finishedTravel: boolean;

            constructor() {
                this.gridX = Math.round(centerX / gridSpacing);
                this.gridY = Math.round(centerY / gridSpacing);
                this.path = [];
                this.segmentLengths = [];
                this.totalDistance = 0;
                this.headDist = 0;
                this.tailDist = 0;
                this.active = true;
                this.fading = false;
                this.fadeSpeed = 0.02;
                this.opacity = 1;
                this.finishedTravel = false;
                this.generatePath();
            }

            generatePath() {
                let x = this.gridX;
                let y = this.gridY;
                let lastDir: any = null;

                for (let i = 0; i < maxSteps; i++) {
                    const dirs: any[] = [];
                    if (y > 0 && !(lastDir && lastDir.dy === 1)) dirs.push({ dx: 0, dy: -1 });
                    if (y < Math.floor(height / gridSpacing) && !(lastDir && lastDir.dy === -1))
                        dirs.push({ dx: 0, dy: 1 });
                    if (x > 0 && !(lastDir && lastDir.dx === 1)) dirs.push({ dx: -1, dy: 0 });
                    if (x < Math.floor(width / gridSpacing) && !(lastDir && lastDir.dx === -1))
                        dirs.push({ dx: 1, dy: 0 });

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

            update() {
                if (!this.active) return;
                if (this.fading) {
                    this.opacity -= this.fadeSpeed;
                    if (this.opacity <= 0) this.active = false;
                    return;
                }
                if (!this.finishedTravel) {
                    this.headDist += pulseSpeed;
                    if (this.headDist >= this.totalDistance) {
                        this.headDist = this.totalDistance;
                        this.finishedTravel = true;
                    }
                    this.tailDist = Math.max(0, this.headDist - pulseLengthPx);
                    return;
                }
                this.tailDist += pulseSpeed;
                if (this.tailDist >= this.headDist) {
                    this.tailDist = this.headDist;
                    this.fading = true;
                }
            }

            getPointAt(dist: number) {
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

            draw() {
                if (!this.active || !ctx) return;

                const tailDist = Math.max(0, this.headDist - pulseLengthPx);
                const headPt = this.getPointAt(this.headDist);
                const tailPt = this.getPointAt(tailDist);
                if (!headPt || !tailPt) return;

                ctx.save();
                ctx.lineWidth = 2;
                ctx.lineCap = "round";
                ctx.lineJoin = "miter";

                const gradient = ctx.createLinearGradient(tailPt.x, tailPt.y, headPt.x, headPt.y);
                gradient.addColorStop(0, "rgba(192,248,255,0)");
                gradient.addColorStop(0.4, "rgba(192,248,255,0.4)");
                gradient.addColorStop(1, "rgba(192,248,255,1)");

                ctx.strokeStyle = gradient;
                ctx.shadowColor = "#2EE6FF";
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
                    let x = seg.x1 + (seg.x2 - seg.x1) * startT;
                    let y = seg.y1 + (seg.y2 - seg.y1) * startT;
                    ctx.lineTo(x, y);
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

        function generateGrid() {
            gridLines.horizontal = [];
            gridLines.vertical = [];
            for (let y = 0; y <= height; y += gridSpacing) gridLines.horizontal.push({ y });
            for (let x = 0; x <= width; x += gridSpacing) gridLines.vertical.push({ x });
        }

        function drawGrid() {
            if (!ctx) return;
            gridLines.horizontal.forEach((line) => {
                const dist = Math.abs(line.y - centerY);
                const fade = Math.max(0.3, 1 - dist / (height / 2));
                ctx.strokeStyle = `rgba(31,36,44,${0.2 * fade})`;
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(0, line.y);
                ctx.lineTo(width, line.y);
                ctx.stroke();
            });

            gridLines.vertical.forEach((line) => {
                const dist = Math.abs(line.x - centerX);
                const fade = Math.max(0.3, 1 - dist / (width / 2));
                ctx.strokeStyle = `rgba(31,36,44,${0.2 * fade})`;
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(line.x, 0);
                ctx.lineTo(line.x, height);
                ctx.stroke();
            });
        }

        function createPulse() {
            pulses.push(new ElectricPulse());
        }

        function resizeCanvas() {
            if (!canvas) return;
            width = canvas.parentElement?.offsetWidth || 0;
            height = canvas.parentElement?.offsetHeight || 0;
            canvas.width = width;
            canvas.height = height;
            centerX = width / 2;
            centerY = height / 2;
            generateGrid();
        }

        function animate(timestamp?: number) {
            if (prefersReducedMotion) return;
            if (!ctx) return;

            ctx.clearRect(0, 0, width, height);

            drawGrid();
            pulses = pulses.filter((p) => p.active);
            pulses.forEach((p) => {
                p.update();
                p.draw();
            });

            if (timestamp && timestamp - lastPulseTime > 5000 + Math.random() * 3000) {
                if (pulses.length < 3) {
                    createPulse();
                    lastPulseTime = timestamp;
                }
            }

            requestAnimationFrame(animate);
        }

        resizeCanvas();
        window.addEventListener("resize", resizeCanvas);
        if (!prefersReducedMotion) {
            setTimeout(() => createPulse(), 800);
            requestAnimationFrame(animate);
        }
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="absolute top-0 left-0 w-full h-full pointer-events-none"
        />
    );
}
