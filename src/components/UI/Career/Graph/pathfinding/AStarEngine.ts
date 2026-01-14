import { PathEngine } from './PathEngine'
import { GraphNode, PathResult } from '../types'
import { findPathAStarWithHops } from './AStar'

const COLORS = ['#22c55e', '#3b82f6', '#a855f7'] // 1,2,3 hops

export class AStarPathEngine implements PathEngine {
  name = 'astar'

  computePaths(
    careers: GraphNode[],
    particles: GraphNode[],
    maxHops: number = 3
  ): PathResult[] {
    const paths: PathResult[] = []
    const allNodes = [...careers, ...particles]

    // Optional: track used particles per hop to avoid reuse in same hop
    const usedPerHop: Set<string>[] = Array.from({ length: maxHops }, () => new Set<string>())

    // Connect every pair of career nodes
        for (let i = 0; i < careers.length - 1; i++) {
        const from = careers[i]
        const to = careers[i + 1]

        for (let hops = 1; hops <= maxHops; hops++) {
            const result = findPathAStarWithHops(from, to, [...careers, ...particles], {
            maxHops: hops,
            usedNodeIds: usedPerHop[hops - 1]
            })

            if (result) {
            result.color = COLORS[hops - 1]
            // mark particles in this hop as used
            result.path.forEach(n => usedPerHop[hops - 1].add(n.id))
            paths.push(result)
            }
        }
        }


    return paths
  }
}
