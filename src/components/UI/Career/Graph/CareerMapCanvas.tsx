"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { CAREER_DATA } from "./data/careerData"
import { CareerNode, Particle, Vec } from "./types"
import CareerTooltip from "./CareerTooltip"

/* ================= CONFIG ================= */

const PARTICLE_COUNT = 180
const PARTICLE_SPEED = 0.3

const NEAREST_PARTICLES = 14
const MAX_STOPS = 4

const PADDING_X = 80
const PADDING_Y = 80

const GAP_X_MIN = 120
const GAP_X_MAX = 600
const GAP_Y_MIN = 140
const GAP_Y_MAX = 600

const MAX_ROW_WIDTH_RATIO = 0.85

const TOOLTIP_OFFSET = 16
const TOOLTIP_WIDTH = 360
const TOOLTIP_HEIGHT = 160

const PATH_STYLES = [
    { color: "rgba(0,255,140,0.9)", width: 2 },
    { color: "rgba(80,160,255,0.7)", width: 1.6 },
    { color: "rgba(255,170,60,0.55)", width: 1.3 },
    { color: "rgba(255,80,200,0.45)", width: 1.1 },
]

/* ================= UTILS ================= */

const dist = (a: Vec, b: Vec) =>
    Math.hypot(a.x - b.x, a.y - b.y)

function experienceToRadius(months: number) {
    return Math.min(26, 10 + Math.sqrt(months) * 2.2)
}

function clamp(v: number, min: number, max: number) {
    return Math.max(min, Math.min(max, v))
}

/* ================= PATH FINDING ================= */

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

/* ================= LAYOUT ================= */

function layoutCareerNodes(
    data: typeof CAREER_DATA,
    canvasWidth: number,
    canvasHeight: number
): CareerNode[] {
    const nodes: CareerNode[] = []

    let x = PADDING_X
    let y = PADDING_Y
    let rowHeight = 0

    const maxRowWidth = canvasWidth * MAX_ROW_WIDTH_RATIO

    for (const item of data) {
        const radius = experienceToRadius(item.time_period)
        const diameter = radius * 2

        const gapX =
            GAP_X_MIN + Math.random() * (GAP_X_MAX - GAP_X_MIN)
        const gapY =
            GAP_Y_MIN + Math.random() * (GAP_Y_MAX - GAP_Y_MIN)

        if (x + diameter > maxRowWidth) {
            x = PADDING_X
            y += rowHeight + gapY
            rowHeight = 0
        }

        const jitterX = (Math.random() - 0.5) * 40
        const jitterY = (Math.random() - 0.5) * 40

        const cx = clamp(
            x + radius + jitterX,
            radius + 20,
            canvasWidth - radius - 20
        )

        const cy = clamp(
            y + radius + jitterY,
            radius + 20,
            canvasHeight - radius - 20
        )

        nodes.push({
            id: item.id,
            x: cx,
            y: cy,
            radius,
            data: item,
        })

        x += diameter + gapX
        rowHeight = Math.max(rowHeight, diameter)
    }

    return nodes
}

/* ================= TOOLTIP ================= */

function getTooltipPosition(
    x: number,
    y: number,
    rect: DOMRect
) {
    let left = x + TOOLTIP_OFFSET
    let top = y + TOOLTIP_OFFSET

    if (left + TOOLTIP_WIDTH > rect.width) {
        left = x - TOOLTIP_WIDTH - TOOLTIP_OFFSET
    }
    if (top + TOOLTIP_HEIGHT > rect.height) {
        top = y - TOOLTIP_HEIGHT - TOOLTIP_OFFSET
    }

    return {
        left: clamp(left, 8, rect.width - TOOLTIP_WIDTH - 8),
        top: clamp(top, 8, rect.height - TOOLTIP_HEIGHT - 8),
    }
}

/* ================= COMPONENT ================= */

export default function CareerMapCanvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    const particles = useRef<Particle[]>([])
    const careerNodes = useRef<CareerNode[]>([])
    const hoveredNode = useRef<CareerNode | null>(null)
    const mouse = useRef<Vec>({ x: 0, y: 0 })
    const imageCache = useRef<Record<string, HTMLImageElement>>({})
    const router = useRouter()

    const [tooltip, setTooltip] = useState<any>(null)

    useEffect(() => {
        const canvas = canvasRef.current!
        const ctx = canvas.getContext("2d")!

        /* ---------- Resize ---------- */
        const resize = () => {
            const parent = canvas.parentElement!
            canvas.width = parent.clientWidth
            canvas.height = parent.clientHeight

            careerNodes.current = layoutCareerNodes(
                CAREER_DATA,
                canvas.width,
                canvas.height
            )
        }

        resize()
        window.addEventListener("resize", resize)

        /* ---------- Particles ---------- */
        particles.current = Array.from(
            { length: PARTICLE_COUNT },
            (_, i) => {
                const a = Math.random() * Math.PI * 2
                return {
                    id: `p-${i}`,
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    vx: Math.cos(a),
                    vy: Math.sin(a),
                }
            }
        )

        /* ---------- Icons ---------- */
        CAREER_DATA.forEach(c => {
            const img = new Image()
            img.src = c.icon
            imageCache.current[c.id] = img
        })

        /* ---------- Mouse ---------- */
        canvas.addEventListener("mousemove", e => {
            const r = canvas.getBoundingClientRect()
            mouse.current.x = e.clientX - r.left
            mouse.current.y = e.clientY - r.top
        })

        canvas.addEventListener("click", () => {
            if (hoveredNode.current) {
                router.push(`/career/${hoveredNode.current.id}`)
            }
        })

        /* ---------- Draw Loop ---------- */
        let raf = 0
        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height)

            /* Particles */
            particles.current.forEach(p => {
                p.x += p.vx * PARTICLE_SPEED
                p.y += p.vy * PARTICLE_SPEED

                if (p.x < 0 || p.x > canvas.width) p.vx *= -1
                if (p.y < 0 || p.y > canvas.height) p.vy *= -1
            })

            /* Paths */
            for (let i = 0; i < careerNodes.current.length - 1; i++) {
                const A = careerNodes.current[i]
                const B = careerNodes.current[i + 1]
                const used = new Set<string>()

                for (let s = 1; s <= MAX_STOPS; s++) {
                    const path = findShortestPathWithStops(
                        A,
                        B,
                        particles.current,
                        s,
                        used,
                        NEAREST_PARTICLES
                    )
                    if (!path) continue

                    path.forEach(p => used.add(p.id))
                    const style = PATH_STYLES[s - 1]

                    ctx.strokeStyle = style.color
                    ctx.lineWidth = style.width

                    ctx.beginPath()
                    ctx.moveTo(A.x, A.y)
                    path.forEach(p => ctx.lineTo(p.x, p.y))
                    ctx.lineTo(B.x, B.y)
                    ctx.stroke()
                }
            }

            /* Particles Draw */
            ctx.fillStyle = "rgba(255,255,255,0.45)"
            particles.current.forEach(p => {
                ctx.beginPath()
                ctx.arc(p.x, p.y, 1.3, 0, Math.PI * 2)
                ctx.fill()
            })

            /* Hover */
            hoveredNode.current = null
            for (const n of careerNodes.current) {
                if (dist(mouse.current, n) <= n.radius) {
                    hoveredNode.current = n
                    break
                }
            }

            /* Nodes */
            careerNodes.current.forEach(n => {
                ctx.beginPath()
                ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2)
                ctx.fillStyle =
                    hoveredNode.current?.id === n.id
                        ? "#ffffff"
                        : "#dddddd"
                ctx.fill()

                const img = imageCache.current[n.id]
                if (img?.complete) {
                    const s = n.radius * 1.2
                    ctx.drawImage(img, n.x - s / 2, n.y - s / 2, s, s)
                }
            })

            raf = requestAnimationFrame(draw)
        }

        draw()

        /* ---------- Tooltip Sync ---------- */
        const syncTooltip = () => {
            if (hoveredNode.current) {
                const rect = canvas.getBoundingClientRect()
                const pos = getTooltipPosition(
                    mouse.current.x,
                    mouse.current.y,
                    rect
                )
                setTooltip({ node: hoveredNode.current, ...pos })
            } else {
                setTooltip(null)
            }
            requestAnimationFrame(syncTooltip)
        }

        syncTooltip()

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
                    className="absolute z-50 pointer-events-none"
                    style={{ left: tooltip.left, top: tooltip.top }}
                >
                    <CareerTooltip node={tooltip.node} />
                </div>
            )}
        </>
    )
}
