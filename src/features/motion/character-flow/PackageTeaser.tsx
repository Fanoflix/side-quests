import { PackagePanel } from "@/components/package/PackagePanel"

const USAGE = `import { CharacterFlow } from "side-quests-lab"

<CharacterFlow value={status} />`

export function PackageTeaser() {
  return (
    <PackagePanel
      title="Use Character Flow in your app"
      command="npm i side-quests-lab motion"
      usage={USAGE}
    >
      Change <code className="font-mono">value</code> and it rolls to the new
      word. It takes its font, size and colour from wherever you put it.
    </PackagePanel>
  )
}
