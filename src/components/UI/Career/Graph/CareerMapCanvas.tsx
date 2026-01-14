"use client"

import React, { useRef, useEffect, useState } from "react"

// --------------------- Types ---------------------
interface Node {
    id: string
    position: { x: number; y: number }
    type: "career" | "particle"
}

interface Path {
    nodes: Node[]
    color: string
}

// --------------------- Config ---------------------
const COLORS = ["#22c55e", "#3b82f6", "#a855f7"] // 1,2,3 hop paths
const PARTICLE_COUNT = 100
const MAX_HOPS = 3

// --------------------- Helper Functions ---------------------
function pickRandomParticles(particles: Node[], count: number, used: Set<string>): Node[] {
    const available = particles.filter(p => !used.has(p.id))
    const selected: Node[] = []
    for (let i = 0; i < count && available.length > 0; i++) {
        const idx = Math.floor(Math.random() * available.length)
        selected.push(available[idx])
        available.splice(idx, 1)
    }
    return selected
}

// --------------------- Component ---------------------
const CareerMapCanvas: React.FC<{ careerNodes: Node[] }> = ({ careerNodes }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [particleNodes] = useState<Node[]>(() =>
        Array.from({ length: PARTICLE_COUNT }).map((_, i) => ({
            id: `particle-${i}`,
            position: { x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight },
            type: "particle",
            vx: (Math.random() - 0.5) * 0.3,
            vy: (Math.random() - 0.5) * 0.3,
        }))
    )

    // --------------------- Generate Paths ---------------------
    const generatePaths = (): Path[] => {
        const paths: Path[] = []
        const usedPerHop: Set<string>[] = Array.from({ length: MAX_HOPS }, () => new Set<string>())

        for (let i = 0; i < careerNodes.length - 1; i++) {
            const from = careerNodes[i]
            const to = careerNodes[i + 1]

            for (let hop = 1; hop <= MAX_HOPS; hop++) {
                const selectedParticles = pickRandomParticles(particleNodes, hop - 1, usedPerHop[hop - 1])
                const pathNodes = [from, ...selectedParticles, to]
                pathNodes.forEach(n => {
                    if (n.type === "particle") usedPerHop[hop - 1].add(n.id)
                })
                paths.push({ nodes: pathNodes, color: COLORS[hop - 1] })
            }
        }
        return paths
    }

    // --------------------- Animation ---------------------
    useEffect(() => {
        const canvas = canvasRef.current!
        const ctx = canvas.getContext("2d")!
        let width = canvas.width = canvas.offsetWidth
        let height = canvas.height = canvas.offsetHeight

        const resize = () => {
            width = canvas.width = canvas.offsetWidth
            height = canvas.height = canvas.offsetHeight
        }
        window.addEventListener("resize", resize)

        const animate = () => {
            ctx.clearRect(0, 0, width, height)

            // Move particles
            particleNodes.forEach(p => {
                // Random wandering
                p.vx += (Math.random() - 0.5) * 0.05
                p.vy += (Math.random() - 0.5) * 0.05
                // Dampen for smooth motion
                p.vx *= 0.98
                p.vy *= 0.98
                p.position.x = (p.position.x + p.vx + width) % width
                p.position.y = (p.position.y + p.vy + height) % height
            })

            // Draw career nodes
            careerNodes.forEach(node => {
                ctx.beginPath()
                ctx.arc(node.position.x, node.position.y, 12, 0, Math.PI * 2)
                ctx.fillStyle = "#fff"
                ctx.fill()
                ctx.closePath()
            })

            // Draw particle nodes
            particleNodes.forEach(p => {
                ctx.beginPath()
                ctx.arc(p.position.x, p.position.y, 4, 0, Math.PI * 2)
                ctx.fillStyle = "#888"
                ctx.fill()
                ctx.closePath()
            })

            // Draw paths
            const paths = generatePaths()
            paths.forEach(path => {
                ctx.beginPath()
                path.nodes.forEach((node, idx) => {
                    if (idx === 0) ctx.moveTo(node.position.x, node.position.y)
                    else ctx.lineTo(node.position.x, node.position.y)
                })
                ctx.strokeStyle = path.color
                ctx.lineWidth = 2
                ctx.stroke()
                ctx.closePath()
            })

            requestAnimationFrame(animate)
        }

        animate()
        return () => window.removeEventListener("resize", resize)
    }, [careerNodes, particleNodes])

    return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
}

export default CareerMapCanvas
