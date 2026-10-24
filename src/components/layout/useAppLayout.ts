import { useState } from "react"

import { useQuestMenu } from "@/features/nav/useQuestMenu"
import { useToolNav, useToolShortcuts } from "@/features/nav/useToolNav"

export function useAppLayout() {
  useToolShortcuts()
  const menu = useQuestMenu()
  const [rail, setRail] = useState<HTMLElement | null>(null)
  return { nav: useToolNav(), menu, openMenu: menu.show, rail, setRail }
}
