"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { CAREER_DATA } from "./data/careerData"
import { CareerNode, Particle, Vec } from "./types"
import CareerTooltip from "./CareerTooltip"


/* ---------------- Config ---------------- */

const PARTICLE_COUNT = 160
const PARTICLE_SPEED = 0.1

const NEAREST_PARTICLES = 14
const MAX_STOPS = 4


const TOOLTIP_WIDTH = 260
const TOOLTIP_HEIGHT = 160
const OFFSET = 16

const PATH_STYLES = [
    { color: "rgba(0,255,140,0.9)", width: 2 },   // 1 hop
    { color: "rgba(80,160,255,0.7)", width: 1.6 }, // 2 hops
    { color: "rgba(255,170,60,0.55)", width: 1.3 }, // 3 hops
    { color: "rgba(255,80,200,0.45)", width: 1.1 }, // 4 hops
]

/* ---------------- Utils ---------------- */

const dist = (a: Vec, b: Vec) => Math.hypot(a.x - b.x, a.y - b.y)

function experienceToRadius(months: number) {
    const MIN = 10
    const MAX = 26
    return Math.min(MAX, MIN + Math.sqrt(months) * 2.2)
}

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
        .map(p => ({ p, d: dist(A, p) + dist(p, B) }))
        .sort((a, b) => a.d - b.d)
        .slice(0, limit)
        .map(x => x.p)

    let best: Particle[] | null = null
    let bestDist = Infinity

    const dfs = (path: Particle[], remaining: Particle[]) => {
        if (path.length === stops) {
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
                remaining.filter((_, idx) => idx !== i)
            )
        }
    }

    dfs([], candidates)
    return best
}

function getTooltipPosition(
    x: number,
    y: number
) {
    const vw = window.innerWidth
    const vh = window.innerHeight

    let left = x + OFFSET
    let top = y + OFFSET

    // --- Horizontal flip ---
    if (left + TOOLTIP_WIDTH > vw) {
        left = x - TOOLTIP_WIDTH - OFFSET
    }

    // --- Vertical flip ---
    if (top + TOOLTIP_HEIGHT > vh) {
        top = y - TOOLTIP_HEIGHT - OFFSET
    }

    // --- Clamp as safety ---
    left = Math.max(8, Math.min(left, vw - TOOLTIP_WIDTH - 8))
    top = Math.max(8, Math.min(top, vh - TOOLTIP_HEIGHT - 8))

    return { left, top }
}


/* ---------------- Component ---------------- */

export default function CareerMapCanvas() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null)
    const particles = useRef<Particle[]>([])
    const careerNodes = useRef<CareerNode[]>([])
    const hoveredNode = useRef<CareerNode | null>(null)
    const mouse = useRef<Vec>({ x: 0, y: 0 })
    const imageCache = useRef<Record<string, HTMLImageElement>>({})

    const router = useRouter()

    const [tooltip, setTooltip] = useState<{
        node: CareerNode
        x: number
        y: number
    } | null>(null)

    useEffect(() => {
        const canvas = canvasRef.current!
        const ctx = canvas.getContext("2d")!

        /* ---------- Resize ---------- */
        const resize = () => {
            const parent = canvas.parentElement!
            canvas.width = parent.clientWidth
            canvas.height = parent.clientHeight
        }
        resize()
        window.addEventListener("resize", resize)

        /* ---------- Init particles ---------- */
        particles.current = Array.from({ length: PARTICLE_COUNT }, (_, i) => {
            const a = Math.random() * Math.PI * 2
            return {
                id: `p-${i}`,
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: Math.cos(a),
                vy: Math.sin(a),
            }
        })

        /* ---------- Init career nodes (Poisson-like) ---------- */
        const nodes: CareerNode[] = []

        for (const data of CAREER_DATA) {
            const radius = experienceToRadius(data.time_period)

            let placed = false
            while (!placed) {
                const candidate: CareerNode = {
                    id: data.id,
                    x: Math.random() * (canvas.width - 200) + 100,
                    y: Math.random() * (canvas.height - 200) + 100,
                    radius,
                    data,
                }

                if (
                    nodes.every(
                        n => dist(n, candidate) > n.radius + candidate.radius + 80
                    )
                ) {
                    nodes.push(candidate)
                    placed = true
                }
            }
        }

        nodes.sort((a, b) => a.x - b.x)
        careerNodes.current = nodes

        /* ---------- Preload icons ---------- */
        CAREER_DATA.forEach(c => {
            const img = new Image()
            img.src = c.icon
            img.onerror = () => console.warn("Icon failed to load:", c.icon)
            imageCache.current[c.id] = img
        })

        /* ---------- Mouse events ---------- */
        canvas.addEventListener("mousemove", e => {
            const rect = canvas.getBoundingClientRect()
            mouse.current.x = e.clientX - rect.left
            mouse.current.y = e.clientY - rect.top
        })

        canvas.addEventListener("click", () => {
            if (hoveredNode.current) {
                router.push(`/career/${hoveredNode.current.id}`)
            }
        })

        /* ---------- Animation ---------- */
        let raf = 0

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height)

            /* Move particles */
            particles.current.forEach(p => {
                p.x += p.vx * PARTICLE_SPEED
                p.y += p.vy * PARTICLE_SPEED

                if (p.x < 0 || p.x > canvas.width) p.vx *= -1
                if (p.y < 0 || p.y > canvas.height) p.vy *= -1
            })

            /* Draw paths */
            for (let i = 0; i < careerNodes.current.length - 1; i++) {
                const A = careerNodes.current[i]
                const B = careerNodes.current[i + 1]
                const used = new Set<string>()

                for (let stops = 1; stops <= MAX_STOPS; stops++) {
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

                    const style = PATH_STYLES[stops - 1]
                    ctx.strokeStyle = style.color
                    ctx.lineWidth = style.width

                    ctx.beginPath()
                    ctx.moveTo(A.x, A.y)
                    path.forEach(p => ctx.lineTo(p.x, p.y))
                    ctx.lineTo(B.x, B.y)
                    ctx.stroke()
                }
            }

            /* Draw particles */
            ctx.fillStyle = "rgba(255,255,255,0.45)"
            particles.current.forEach(p => {
                ctx.beginPath()
                ctx.arc(p.x, p.y, 1.3, 0, Math.PI * 2)
                ctx.fill()
            })

            /* Hover detection */
            // hoveredNode.current = null
            // careerNodes.current.forEach(n => {
            //     if (dist(mouse.current, n) <= n.radius) {
            //         hoveredNode.current = n
            //     }
            // })
            let found: CareerNode | null = null

            careerNodes.current.forEach(n => {
                if (dist(mouse.current, n) <= n.radius) {
                    found = n
                }
            })

            hoveredNode.current = found

            const pos = getTooltipPosition(mouse.current.x, mouse.current.y,)

            if (found) {
                setTooltip({
                    node: found,
                    x: pos.left,
                    y: pos.top,
                })
            } else {
                setTooltip(null)
            }


            /* Draw career nodes */
            careerNodes.current.forEach(n => {
                ctx.beginPath()
                ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2)
                ctx.fillStyle =
                    hoveredNode.current?.id === n.id ? "#ffffff" : "#dddddd"
                ctx.fill()

                const img = imageCache.current[n.id]
                if (img && img.complete && img.naturalWidth > 0) {
                    const size = n.radius * 1.2
                    ctx.drawImage(
                        img,
                        n.x - size / 2,
                        n.y - size / 2,
                        size,
                        size
                    )
                }
            })

            raf = requestAnimationFrame(draw)
        }

        draw()

        return () => {
            cancelAnimationFrame(raf)
            window.removeEventListener("resize", resize)
        }
    }, [router])



    return (
        <>
            <canvas ref={canvasRef} className="flex flex-1 grow" />

            {tooltip && (
                <div
                    className="pointer-events-none absolute z-50"
                    style={{
                        left: tooltip.x + 8,
                        top: tooltip.y + 8,
                    }}
                >
                    <CareerTooltip node={tooltip.node} />
                </div>
            )}
        </>
    )

}
