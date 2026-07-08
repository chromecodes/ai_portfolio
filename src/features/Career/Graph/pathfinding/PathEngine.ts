import { GraphNode, PathResult } from "../types"

export interface PathEngine {
  name: string

  computePaths(
    careerNodes: GraphNode[],
    particleNodes: GraphNode[]
  ): PathResult[]
}
