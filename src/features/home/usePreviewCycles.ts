import { useCycle } from "@/hooks/useCycle"
import { useInView } from "@/hooks/useInView"

export const FLOW_WORDS = [
  "departures",
  "delayed",
  "boarding",
  "now",
  "Bonjour",
]

export function useFlowPreview() {
  const { ref, inView } = useInView<HTMLDivElement>()
  const word = useCycle(FLOW_WORDS, 1700, inView)
  return { ref, word }
}

const STYLE_TOKENS = [1, 2, 3, 4]

export function useStylePreview() {
  const { ref, inView } = useInView<HTMLDivElement>()
  const token = useCycle(STYLE_TOKENS, 5600, inView)
  return { ref, token, inView }
}

export const TABLE_ROWS = [
  ["SQ 101", "Lisbon"],
  ["SQ 207", "Kyoto"],
  ["SQ 342", "Oslo"],
] as const

const STATUS_SETS = [
  ["On time", "Boarding", "Delayed"],
  ["Boarding", "Gate shut", "On time"],
  ["Departed", "Delayed", "Boarding"],
]

export function useTablePreview() {
  const { ref, inView } = useInView<HTMLDivElement>()
  const statuses = useCycle(STATUS_SETS, 2200, inView)
  return { ref, statuses }
}

export const RUNGS = [
  { label: "useState + fetch", requests: "6 requests" },
  { label: "TanStack Query", requests: "2 requests" },
  { label: "TanStack DB", requests: "1 request" },
]

const RUNG_INDEXES = [0, 1, 2]

export function useTanstackPreview() {
  const { ref, inView } = useInView<HTMLDivElement>()
  const active = useCycle(RUNG_INDEXES, 1600, inView)
  return { ref, active }
}
