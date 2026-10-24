import { useRef } from "react"
import { Upload } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Panel } from "@/components/stage/Panel"
import { Range } from "@/components/stage/Range"
import type { DotShape } from "./PixelScreen"

export type ScreenSettings = {
  width: number
  height: number
  gap: number
  dotSize: number
}

const SHAPES: DotShape[] = ["circle", "square", "diamond"]

type Props = {
  settings: ScreenSettings
  onChange: (patch: Partial<ScreenSettings>) => void
  hasVideo: boolean
  lockAspect: boolean
  onToggleLockAspect: () => void
  shape: DotShape
  onShapeChange: (shape: DotShape) => void
  onPickFile: (file: File) => void
}

export function Controls({
  settings,
  onChange,
  hasVideo,
  lockAspect,
  onToggleLockAspect,
  shape,
  onShapeChange,
  onPickFile,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null)

  return (
    <Panel title="Controls">
      <div className="flex gap-2">
        <Button className="flex-1" onClick={() => fileRef.current?.click()}>
          <Upload />
          {hasVideo ? "Replace video" : "Upload video"}
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept="video/*"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) onPickFile(file)
            e.target.value = ""
          }}
        />
      </div>

      <Range
        label="Columns"
        value={settings.width}
        min={1}
        max={900}
        onChange={(width) => onChange({ width })}
      />
      <Range
        label="Rows"
        value={settings.height}
        min={1}
        max={900}
        onChange={(height) => onChange({ height })}
      />
      <Range
        label="Gap"
        value={settings.gap}
        min={0}
        max={50}
        unit="px"
        onChange={(gap) => onChange({ gap })}
      />
      <Range
        label="Dot size"
        value={settings.dotSize}
        min={1}
        max={100}
        unit="px"
        onChange={(dotSize) => onChange({ dotSize })}
      />

      <label className="flex cursor-pointer items-center justify-between gap-2 select-none">
        <span className="text-xs text-muted-foreground">Keep aspect ratio</span>
        <input
          type="checkbox"
          checked={lockAspect}
          onChange={onToggleLockAspect}
          className="size-4 accent-primary"
        />
      </label>

      <label className="flex items-center justify-between gap-2">
        <span className="text-xs text-muted-foreground">Shape</span>
        <select
          value={shape}
          onChange={(e) => onShapeChange(e.target.value as DotShape)}
          className="h-8 rounded-none border border-border bg-background px-2 text-xs capitalize outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
        >
          {SHAPES.map((s) => (
            <option key={s} value={s} className="capitalize">
              {s}
            </option>
          ))}
        </select>
      </label>
    </Panel>
  )
}
