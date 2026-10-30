import { INSTALL, depthDustSnippet } from "./snippet"
import type { SnippetInput } from "./snippet"

/**
 * The "use it in your app" card: the install line and a snippet of the
 * component as currently tuned. Both copy themselves (`InstallCommand`,
 * `CodeBlock`), so all this works out is what they show.
 */
export function useInstallCard(input: SnippetInput) {
  return { install: INSTALL, snippet: depthDustSnippet(input) }
}
