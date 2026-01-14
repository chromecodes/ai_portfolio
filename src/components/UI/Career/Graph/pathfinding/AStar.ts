import { GraphNode, PathResult } from '../types'
import { MinHeap } from './MinHeap'

// Options for A* search
export interface AStarOptions {
  maxHops: number
  maxNeighbors?: number      // Limit k-nearest neighbors for performance
  usedNodeIds?: Set<string>  // Prevent reusing nodes across paths
  heuristicWeight?: number   // Weight for heuristic, default = 1
}

// State in A* search
interface AStarState {
  node: GraphNode
  g: number        // Cost so far
  f: number        // Total cost (g + h)
  hops: number
  parent?: AStarState
}

// Simple Euclidean distance
function distance(a: GraphNode, b: GraphNode) {
  const dx = a.position.x - b.position.x
  const dy = a.position.y - b.position.y
  return Math.sqrt(dx * dx + dy * dy)
}

// Heuristic function (Euclidean)
function heuristic(a: GraphNode, b: GraphNode, weight = 1) {
  return distance(a, b) * weight
}

// Select nearest neighbors
function getNeighbors(node: GraphNode, nodes: GraphNode[], k: number) {
  return nodes
    .filter(n => n.id !== node.id)
    .sort((a, b) => distance(node, a) - distance(node, b))
    .slice(0, k)
}

// Reconstruct path from goal to start
function buildResult(state: AStarState): PathResult {
  const path: GraphNode[] = []
  let curr: AStarState | undefined = state

  while (curr) {
    path.push(curr.node)
    curr = curr.parent
  }

  path.reverse()

  return {
    path,
    hops: path.length - 1,
    totalCost: state.g
  }
}

// Main A* function with hop constraints
export function findPathAStarWithHops(
  start: GraphNode,
  goal: GraphNode,
  allNodes: GraphNode[],
  options: AStarOptions
): PathResult | null {

  const {
    maxHops,
    maxNeighbors = 8,
    usedNodeIds = new Set(),
    heuristicWeight = 1
  } = options

  const open = new MinHeap<AStarState>((a, b) => a.f - b.f)
  const closed = new Set<string>()

  open.push({
    node: start,
    g: 0,
    f: heuristic(start, goal, heuristicWeight),
    hops: 0
  })

  while (!open.isEmpty()) {
    const current = open.pop()!
    const stateKey = `${current.node.id}-${current.hops}`

    if (closed.has(stateKey)) continue
    closed.add(stateKey)

    // Goal reached
    if (current.node.id === goal.id) {
      return buildResult(current)
    }

    if (current.hops >= maxHops) continue

    // Limit neighbors for performance
    const neighbors = getNeighbors(current.node, allNodes, maxNeighbors)

    for (const neighbor of neighbors) {
      if (usedNodeIds.has(neighbor.id)) continue

      const g = current.g + distance(current.node, neighbor)
      const h = heuristic(neighbor, goal, heuristicWeight)

      open.push({
        node: neighbor,
        g,
        f: g + h,
        hops: current.hops + 1,
        parent: current
      })
    }
  }

  return null
}
