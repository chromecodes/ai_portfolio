"use client"

import { useEffect, useRef } from "react"
import { careerEdges, careerNodes } from "./Graph/data/careerData"
import { buildGraph } from "./Graph/algorithms/graph"
import { dijkstra } from "./Graph/algorithms/dijkstra"

export default function CareerMapCanvas() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext("2d")
        if (!ctx) return

        const DPR = window.devicePixelRatio || 1
        const width = canvas.clientWidth
        const height = canvas.clientHeight

        canvas.width = width * DPR
        canvas.height = height * DPR
        ctx.scale(DPR, DPR)

        // ---- Failsafe cursor position ----
        const centerX = width / 2
        const centerY = height / 2

        // ---- Position nodes in a winding vertical path ----
        const nodes = careerNodes.map((node, i) => ({
            ...node,
            x: centerX + Math.sin(i) * 140,
            y: 120 + i * 160,
        }))

        const graph = buildGraph(nodes, careerEdges)
        const path = dijkstra(graph as any, "start", "fs")

        let progress = 0

        function draw() {
            ctx.clearRect(0, 0, width, height)

            // Background
            ctx.fillStyle = "#0B0C10"
            ctx.fillRect(0, 0, width, height)

            // Draw edges
            ctx.strokeStyle = "#2E2F38"
            ctx.lineWidth = 2

            careerEdges.forEach(({ from, to }) => {
                const a = nodes.find((n) => n.id === from)!
                const b = nodes.find((n) => n.id === to)!

                ctx.beginPath()
                ctx.moveTo(a.x!, a.y!)
                ctx.lineTo(b.x!, b.y!)
                ctx.stroke()
            })

            // Animated path highlight
            ctx.strokeStyle = "#ffffff"
            ctx.lineWidth = 3

            ctx.beginPath()
            path.slice(0, progress).forEach((id, i) => {
                const node = nodes.find((n) => n.id === id)!
                if (i === 0) ctx.moveTo(node.x!, node.y!)
                else ctx.lineTo(node.x!, node.y!)
            })
            ctx.stroke()

            // Draw nodes
            nodes.forEach((node) => {
                ctx.beginPath()
                ctx.arc(node.x!, node.y!, 10, 0, Math.PI * 2)
                ctx.fillStyle = path.includes(node.id) ? "#ffffff" : "#666"
                ctx.fill()
            })

            if (progress < path.length) {
                progress += 0.02
                requestAnimationFrame(draw)
            }
        }

        draw()
    }, [])

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 h-full w-full"
        />
    )
}
