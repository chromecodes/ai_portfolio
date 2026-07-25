"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { getCareerGraphData } from "./data/careerData"
import { CareerData, CareerNode, Particle, Vec } from "./types"
import CareerTooltip from "./CareerTooltip"
import useThemeStore from "@/lib/useThemeStore"
import useLanguageStore from "@/utils/i18n/useLanguageStore"

/* ================= CONFIG ================= */

type PathStyle = {
    color: string
    width: number
}

type Theme = {
    particle: string
    paths: PathStyle[]
}

const THEMES: Record<string, Theme> = {
    dark: {
        particle: "rgba(255,255,255,0.45)",
        paths: [
            { color: "rgba(0,255,140,0.9)", width: 2 },
            { color: "rgba(80,160,255,0.7)", width: 1.6 },
            { color: "rgba(255,170,60,0.55)", width: 1.3 },
            { color: "rgba(255,80,200,0.45)", width: 1.1 },
        ]
    },

    light: {
        particle: "rgba(40,40,40,0.45)",
        paths: [
            { color: "rgba(0,255,140,0.6)", width: 2 },
            { color: "rgba(80,160,255,0.5)", width: 1.6 },
            { color: "rgba(255,170,60,0.45)", width: 1.3 },
            { color: "rgba(255,80,200,0.35)", width: 1.1 },
        ]
    },
}


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

const TOOLTIP_OFFSET = 8
const TOOLTIP_WIDTH = 360
const TOOLTIP_HEIGHT = 160

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
    data: CareerData[],
    canvasWidth: number,
    canvasHeight: number
): CareerNode[] {
    const nodes: CareerNode[] = []
    const count = data.length
    if (count === 0) return nodes

    const marginX = 70
    const marginY = 70
    const usableW = Math.max(100, canvasWidth - marginX * 2)
    const usableH = Math.max(100, canvasHeight - marginY * 2)

    // Step 1: Initial organic placement with random non-linear 2D scattering
    for (let i = 0; i < count; i++) {
        const item = data[i]
        const radius = experienceToRadius(item.time_period)

        // General progress spread across X with generous random variation
        const progress = count > 1 ? i / (count - 1) : 0.5
        const baseX = marginX + progress * usableW
        const randomOffsetX = (Math.random() - 0.5) * (usableW / Math.max(2, count)) * 0.9

        // Random organic Y placement using alternating wave curves + random offset
        const waveY = Math.sin(i * 2.3 + 0.5) * (usableH * 0.3)
        const randomOffsetY = (Math.random() - 0.5) * (usableH * 0.45)
        const baseY = marginY + usableH / 2 + waveY + randomOffsetY

        const cx = clamp(baseX + randomOffsetX, radius + 25, canvasWidth - radius - 25)
        const cy = clamp(baseY, radius + 25, canvasHeight - radius - 25)

        nodes.push({
            id: item.id,
            x: cx,
            y: cy,
            radius,
            data: item,
        })
    }

    // Step 2: Force-directed relaxation pass to ensure NO overlapping nodes
    const MIN_CLEARANCE = 40 // minimum border clearance between nodes
    const ITERATIONS = 120

    for (let iter = 0; iter < ITERATIONS; iter++) {
        let moved = false
        for (let i = 0; i < count; i++) {
            for (let j = i + 1; j < count; j++) {
                const n1 = nodes[i]
                const n2 = nodes[j]

                const minDist = n1.radius + n2.radius + MIN_CLEARANCE
                const d = dist(n1, n2)

                if (d < minDist) {
                    moved = true
                    const overlap = minDist - (d || 0.001)

                    // Repulsion vector direction
                    let dx = n2.x - n1.x
                    let dy = n2.y - n1.y
                    if (d === 0) {
                        dx = (Math.random() - 0.5) || 1
                        dy = (Math.random() - 0.5) || 1
                    } else {
                        dx /= d
                        dy /= d
                    }

                    // Push nodes apart equally along repulsion vector
                    const pushX = dx * overlap * 0.5
                    const pushY = dy * overlap * 0.5

                    n1.x = clamp(n1.x - pushX, n1.radius + 25, canvasWidth - n1.radius - 25)
                    n1.y = clamp(n1.y - pushY, n1.radius + 25, canvasHeight - n1.radius - 25)

                    n2.x = clamp(n2.x + pushX, n2.radius + 25, canvasWidth - n2.radius - 25)
                    n2.y = clamp(n2.y + pushY, n2.radius + 25, canvasHeight - n2.radius - 25)
                }
            }
        }
        if (!moved) break
    }

    return nodes
}

/* ================= TOOLTIP ================= */

function canvasToDom(
    canvas: HTMLCanvasElement,
    x: number,
    y: number
) {
    const rect = canvas.getBoundingClientRect()

    const scaleX = rect.width / canvas.width
    const scaleY = rect.height / canvas.height

    return {
        x: rect.left + x * scaleX,
        y: rect.top + y * scaleY,
    }
}

function getTooltipPositionDom(
    domX: number,
    domY: number,
    radius: number,
    rect: DOMRect
) {
    const offset = 12
    const tooltipWidth = 256 // matches w-64 (16rem = 256px)
    const tooltipHeight = 140 // approximate tooltip height

    const screenWidth = window.innerWidth
    const screenHeight = window.innerHeight

    // Determine horizontal alignment based on screen space
    const spaceRight = screenWidth - (domX + radius)
    const placeRight = spaceRight >= tooltipWidth + offset || domX < screenWidth / 2

    let left = placeRight
        ? domX + radius + offset
        : domX - radius - offset - tooltipWidth

    // Clamp horizontal position strictly inside viewport with 12px margin
    left = clamp(left, 12, screenWidth - tooltipWidth - 12)

    // Vertically center relative to node
    let top = domY - tooltipHeight / 2

    // Clamp vertical position within viewport bounds with 12px margin
    top = clamp(top, 12, screenHeight - tooltipHeight - 12)

    return { left, top }
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
    const { theme } = useThemeStore();
    const lang = useLanguageStore((state) => state.language);

    useEffect(() => {
        const canvas = canvasRef.current!
        const ctx = canvas.getContext("2d")!
        const careerData = getCareerGraphData(lang);

        /* ---------- Resize ---------- */
        const resize = () => {
            const parent = canvas.parentElement!
            canvas.width = parent.clientWidth
            canvas.height = parent.clientHeight

            careerNodes.current = layoutCareerNodes(
                careerData,
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
        careerData.forEach(c => {
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
                    const style = THEMES[theme].paths[s - 1]

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
            ctx.fillStyle = THEMES[theme].particle
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
                    hoveredNode.current === n
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
        let tooltipRaf = 0

        const syncTooltip = () => {
            const canvas = canvasRef.current
            if (!canvas) return

            if (hoveredNode.current) {
                const rect = canvas.getBoundingClientRect()

                const domPos = canvasToDom(
                    canvas,
                    hoveredNode.current.x,
                    hoveredNode.current.y
                )

                const pos = getTooltipPositionDom(
                    domPos.x,
                    domPos.y,
                    hoveredNode.current.radius,
                    rect
                )

                setTooltip({ node: hoveredNode.current, ...pos })
            } else {
                setTooltip(null)
            }

            tooltipRaf = requestAnimationFrame(syncTooltip)
        }

        syncTooltip()

        return () => {
            cancelAnimationFrame(raf)
            cancelAnimationFrame(tooltipRaf)
            window.removeEventListener("resize", resize)
        }
    }, [router, theme, lang])

    return (
        <>
            <canvas ref={canvasRef} className="flex flex-1 grow" />
            {tooltip && (
                <div
                    className="fixed z-50 pointer-events-none"
                    style={{ left: tooltip.left, top: tooltip.top }}
                >
                    <CareerTooltip node={tooltip.node} />
                </div>
            )}
        </>
    )
}
