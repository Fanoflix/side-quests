import { useCycle } from "@/hooks/useCycle"
import { useInView } from "@/hooks/useInView"
import { PACKAGE_TAGLINES } from "./useCharacterFlowDemo"

export function usePackageTeaser() {
  const { ref, inView } = useInView<HTMLDivElement>()
  const tagline = useCycle(PACKAGE_TAGLINES, 2600, inView)
  return { ref, tagline }
}
