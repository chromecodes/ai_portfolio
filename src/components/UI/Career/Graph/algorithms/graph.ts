import { CareerEdge, CareerNode } from "../types";

export function buildGraph(
  nodes: CareerNode[],
  edges: CareerEdge[]
) {
  const graph = new Map<string, { node: CareerNode; neighbors: string[] }>()

  nodes.forEach((node) => {
    graph.set(node.id, { node, neighbors: [] })
  })

  edges.forEach(({ from, to }) => {
    graph.get(from)?.neighbors.push(to)
  })

  return graph
}
