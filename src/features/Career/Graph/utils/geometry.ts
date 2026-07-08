import { GraphNode } from '../types'

export function distance(a: GraphNode, b: GraphNode) {
  const dx = a.position.x - b.position.x
  const dy = a.position.y - b.position.y
  return Math.sqrt(dx * dx + dy * dy)
}
