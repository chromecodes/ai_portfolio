import { PathEngine } from "./PathEngine"

export class HeuristicPathEngine implements PathEngine {
  name = 'heuristic'

  computePaths(careers: any[], particles: any[]): any[] {
    const paths: any[] = []

    // your existing nearest-neighbor + hop logic
    return paths
  }
}
