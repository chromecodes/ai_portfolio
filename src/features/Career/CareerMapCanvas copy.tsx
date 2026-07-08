"use client"

import { useEffect, useRef } from "react"

/* ---------------- Types ---------------- */

type Vec = { x: number; y: number }

type Particle = Vec & {
    id: string
    vx: number
    vy: number
}

type CareerNode = Vec & {
    id: string
    radius: number
}

/* ---------------- Config ---------------- */

const PARTICLE_COUNT = 160
const CAREER_NODE_COUNT = 5
const NODE_RADIUS = 10
const NODE_MIN_DISTANCE = 140

const NEAREST_PARTICLES = 14
const MAX_STOPS = 4 // 0=direct, 1=one stop, 2=two stops

const PATH_STYLES = [
    { color: "rgba(0,255,140,0.9)", width: 1.9 }, // 0 stop
    { color: "rgba(80,160,255,0.7)", width: 1.6 }, // 1 stop
    { color: "rgba(255,170,60,0.5)", width: 1.3 }, // 2 stops
    { color: "rgba(255,80,200,0.45)", width: 1.1 }, // 3 stops
    { color: "rgba(200,200,200,0.35)", width: 0.9 }, // 4 stops
    { color: "rgba(126, 60, 60, 0.8)", width: 0.7 }, // 5 stops
    { color: "rgba(223, 47, 47, 0.7)", width: 0.5 }, // 6 stops
    { color: "rgba(238, 26, 26, 0.7)", width: 0.5 }, // 7 stops
    { color: "rgba(255, 0, 0, 1)", width: 0.5 }, // 8 stops


]

/* ---------------- Utils ---------------- */

const dist = (a: Vec, b: Vec) => Math.hypot(a.x - b.x, a.y - b.y)

function findShortestPathWithStops(
    A: Vec,
    B: Vec,
    particles: Particle[],
    stops: number,
    blocked: Set<string>,
    limit: number
): Particle[] | null {
    const candidates = particles
        .filter(p => !blocked.has(p.id))
        .map(p => ({
            p,
            d: dist(A, p) + dist(p, B),
        }))
        .sort((a, b) => a.d - b.d)
        .slice(0, limit)
        .map(x => x.p)

    let best: Particle[] | null = null
    let bestDist = Infinity

    const dfs = (
        path: Particle[],
        remaining: Particle[],
        depth: number
    ) => {
        if (depth === stops) {
            let d = dist(A, path[0])
            for (let i = 0; i < path.length - 1; i++) {
                d += dist(path[i], path[i + 1])
            }
            d += dist(path[path.length - 1], B)

            if (d < bestDist) {
                bestDist = d
                best = [...path]
            }
            return
        }

        for (let i = 0; i < remaining.length; i++) {
            dfs(
                [...path, remaining[i]],
                remaining.filter((_, idx) => idx !== i),
                depth + 1
            )
        }
    }

    dfs([], candidates, 0)
    return best
}


/* ---------------- Component ---------------- */

export default function CareerMapCanvas() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null)
    const particles = useRef<Particle[]>([])
    const careerNodes = useRef<CareerNode[]>([])

    useEffect(() => {
        const canvas = canvasRef.current!
        const ctx = canvas.getContext("2d")!

        const resize = () => {
            const p = canvas.parentElement!
            canvas.width = p.clientWidth
            canvas.height = p.clientHeight
        }
        resize()
        window.addEventListener("resize", resize)

        /* ---------- Particles ---------- */
        particles.current = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
            id: `p${i}`,
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
        }))

        /* ---------- Career Nodes ---------- */
        const nodes: CareerNode[] = []
        while (nodes.length < CAREER_NODE_COUNT) {
            const c = {
                id: `career-${nodes.length}`,
                x: Math.random() * (canvas.width - 200) + 100,
                y: Math.random() * (canvas.height - 200) + 100,
                radius: NODE_RADIUS,
            }
            if (nodes.every(n => dist(n, c) > NODE_MIN_DISTANCE)) nodes.push(c)
        }
        nodes.sort((a, b) => a.x - b.x)
        careerNodes.current = nodes

        /* ---------- Animation ---------- */
        let raf: number

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height)

            /* Move particles */
            particles.current.forEach(p => {
                p.x += p.vx
                p.y += p.vy
                if (p.x < 0 || p.x > canvas.width) p.vx *= -1
                if (p.y < 0 || p.y > canvas.height) p.vy *= -1
            })

            /* Draw paths */
            for (let i = 0; i < careerNodes.current.length - 1; i++) {
                const A = careerNodes.current[i]
                const B = careerNodes.current[i + 1]

                const used = new Set<string>()

                for (let stops = 0; stops <= MAX_STOPS; stops++) {
                    if (stops === 0) {
                        // direct
                        // ctx.strokeStyle = PATH_STYLES[0].color
                        // ctx.lineWidth = PATH_STYLES[0].width
                        // ctx.beginPath()
                        // ctx.moveTo(A.x, A.y)
                        // ctx.lineTo(B.x, B.y)
                        // ctx.stroke()
                        continue
                    }

                    const path = findShortestPathWithStops(
                        A,
                        B,
                        particles.current,
                        stops,
                        used,
                        NEAREST_PARTICLES
                    )

                    if (!path) continue

                    path.forEach(p => used.add(p.id))

                    const style = PATH_STYLES[stops]
                    ctx.strokeStyle = style.color
                    ctx.lineWidth = style.width

                    ctx.beginPath()
                    ctx.moveTo(A.x, A.y)
                    path.forEach(p => ctx.lineTo(p.x, p.y))
                    ctx.lineTo(B.x, B.y)
                    ctx.stroke()
                }

            }

            /* Particles */
            ctx.fillStyle = "rgba(255,255,255,0.4)"
            particles.current.forEach(p => {
                ctx.beginPath()
                ctx.arc(p.x, p.y, 1.2, 0, Math.PI * 2)
                ctx.fill()
            })

            /* Career Nodes */
            careerNodes.current.forEach(n => {
                ctx.beginPath()
                ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2)
                ctx.fillStyle = "#fff"
                ctx.fill()
            })

            raf = requestAnimationFrame(draw)
        }

        draw()

        return () => {
            cancelAnimationFrame(raf)
            window.removeEventListener("resize", resize)
        }
    }, [])

    return <canvas ref={canvasRef} className="" />
}
