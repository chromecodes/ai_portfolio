"use client";

import { useEffect, useRef } from "react";

export default function EnergyCanvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current!;
        const ctx = canvas.getContext("2d")!;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        let t = 0;

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const cx = canvas.width / 2;
            const cy = canvas.height / 2;

            for (let i = 0; i < 120; i++) {
                const angle = Math.random() * Math.PI * 2;
                const radius = t * 6 + Math.random() * 50;

                ctx.strokeStyle = `rgba(0, 229, 255, ${Math.random()})`;
                ctx.lineWidth = 2;

                ctx.beginPath();
                ctx.moveTo(cx, cy);
                ctx.lineTo(
                    cx + Math.cos(angle) * radius,
                    cy + Math.sin(angle) * radius
                );
                ctx.stroke();
            }

            t++;
            if (t < 60) requestAnimationFrame(draw);
        };

        draw();
    }, []);

    return <canvas ref={canvasRef} className="w-full h-full" />;
}
