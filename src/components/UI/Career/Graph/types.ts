export type CareerNode = {
  id: string
  label: string
  company: string
  year: string
  x?: number
  y?: number
}

export type CareerEdge = {
  from: string
  to: string
  weight?: number
}
export type Vec2 = { x: number; y: number }

export interface GraphNode {
  id: string
  position: Vec2
  type: 'career' | 'particle'
  vx: number
  vy: number
}

export interface PathResult {
  path: GraphNode[]
  hops: number
  totalCost: number
  color?: string
}
