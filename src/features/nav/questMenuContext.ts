import { createContext, use } from "react"

export const QuestMenuContext = createContext<() => void>(() => {})

export function useOpenQuestMenu() {
  return use(QuestMenuContext)
}
