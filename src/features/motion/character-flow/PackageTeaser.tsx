import { PackagePanel } from "@/components/package/PackagePanel"

export function PackageTeaser() {
  return (
    <PackagePanel
      title="Use Character Flow in your app"
      command="npm i side-quests-lab motion"
    >
      Then{" "}
      <code className="font-mono text-foreground">{`import { CharacterFlow } from "side-quests-lab"`}</code>{" "}
      and give it a <code className="font-mono text-foreground">value</code>. It
      takes its font, size and colour from wherever you put it.
    </PackagePanel>
  )
}
