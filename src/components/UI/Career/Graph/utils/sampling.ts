import { Vec2 } from '../types'

export function poissonSample(
  width: number,
  height: number,
  minDist: number,
  count: number
): Vec2[] {
  const points: Vec2[] = []

  while (points.length < count) {
    const p = {
      x: Math.random() * width,
      y: Math.random() * height
    }

    if (
      points.every(
        q => Math.hypot(p.x - q.x, p.y - q.y) >= minDist
      )
    ) {
      points.push(p)
    }
  }

  return points
}
