import { CareerEdge, CareerNode } from "../types"

export const careerNodes: CareerNode[] = [
  { id: "start", label: "Start", company: "Self Learning", year: "2020" },
  { id: "intern", label: "Intern", company: "Startup X", year: "2021" },
  { id: "fe", label: "Frontend Engineer", company: "Company A", year: "2022" },
  { id: "fs", label: "Full Stack Engineer", company: "Company B", year: "2024" },
]

export const careerEdges: CareerEdge[] = [
  { from: "start", to: "intern" },
  { from: "intern", to: "fe" },
  { from: "fe", to: "fs" },
]
