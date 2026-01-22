export type Vec =  {
    x: number
    y: number
}

export type Particle =  {
    id: string
    x: number
    y: number
    vx: number
    vy: number
}
export type CareerNode = {
  id: string
  x: number
  y: number
  radius: number
  data: CareerData
}

export type CareerData = {
  id: string
  company_name: string
  time_period: number // months
  icon: string
  description: string
  projects: string[]
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
