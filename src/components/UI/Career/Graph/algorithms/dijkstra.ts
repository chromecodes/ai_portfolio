export function dijkstra(
  graph: Map<string, { neighbors: string[] }>,
  start: string,
  end: string
) {
  const distances: Record<string, number> = {}
  const previous: Record<string, string | null> = {}
  const unvisited = new Set<string>()

  graph.forEach((_, key) => {
    distances[key] = Infinity
    previous[key] = null
    unvisited.add(key)
  })

  distances[start] = 0

  while (unvisited.size) {
    const current = [...unvisited].reduce((a, b) =>
      distances[a] < distances[b] ? a : b
    )

    unvisited.delete(current)

    if (current === end) break

    graph.get(current)?.neighbors.forEach((neighbor) => {
      const alt = distances[current] + 1
      if (alt < distances[neighbor]) {
        distances[neighbor] = alt
        previous[neighbor] = current
      }
    })
  }

  const path: string[] = []
  let curr: string | null = end

  while (curr) {
    path.unshift(curr)
    curr = previous[curr]
  }

  return path
}
