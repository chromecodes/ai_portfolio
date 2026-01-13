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
