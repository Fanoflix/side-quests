import { useRef } from "react"
import { Upload } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Panel } from "@/components/stage/Panel"
import { Range } from "@/components/stage/Range"
import { CharacterFlow } from "@/features/motion/character-flow/CharacterFlow"
import { formatDots } from "./screen"
import type { Grid, Look } from "./screen"
import { PRESETS, SHAPES } from "./useLowResVideo"
import type { PresetKey } from "./useLowResVideo"

type Props = {
  grid: Grid
  limits: { maxCols: number; maxRows: number }
  look: Look
  preset: PresetKey | null
  lockToVideo: boolean
  onCols: (cols: number) => void
  onRows: (rows: number) => void
  onLook: (patch: Partial<Look>) => void
  onPreset: (key: PresetKey) => void
  onToggleLock: () => void
  onPickFile: (file: File) => void
}

const percent = (value: number) => `${Math.round(value * 100)}%`

export function Controls({
  grid,
  limits,
  look,
  preset,
  lockToVideo,
  onCols,
  onRows,
  onLook,
  onPreset,
  onToggleLock,
  onPickFile,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null)

  return (
    <>
      <Panel title="Video">
        <Button
          variant="outline"
          className="w-full"
          onClick={() => fileRef.current?.click()}
        >
          <Upload />
          Use your own video
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
      </Panel>

      <Panel
        title="Grid"
        action={
          <CharacterFlow
            value={formatDots(grid)}
            className="text-xs text-muted-foreground tabular-nums"
          />
        }
      >
        <Range
          label="Columns"
          value={grid.cols}
          min={4}
          max={limits.maxCols}
          onChange={onCols}
        />
        <Range
          label="Rows"
          value={grid.rows}
          min={4}
          max={limits.maxRows}
          onChange={onRows}
          disabled={lockToVideo}
        />
        <label className="flex cursor-pointer items-center justify-between gap-2 text-xs text-muted-foreground select-none">
          Keep the video's shape
          <input
            type="checkbox"
            checked={lockToVideo}
            onChange={onToggleLock}
            className="size-3.5 accent-primary"
          />
        </label>
      </Panel>

      <Panel title="Look">
        <div className="grid grid-cols-2 gap-1.5">
          {PRESETS.map(({ key, label }) => (
            <Button
              key={key}
              size="sm"
              variant={preset === key ? "default" : "outline"}
              aria-pressed={preset === key}
              onClick={() => onPreset(key)}
            >
              {label}
            </Button>
          ))}
        </div>
        <div className="flex gap-1">
          {SHAPES.map(({ value, label }) => (
            <Button
              key={value}
              size="sm"
              className="flex-1"
              variant={look.shape === value ? "default" : "outline"}
              aria-pressed={look.shape === value}
              onClick={() => onLook({ shape: value })}
            >
              {label}
            </Button>
          ))}
        </div>
        <Range
          label="Dot size"
          value={look.fill}
          min={0.2}
          max={1}
          step={0.02}
          format={percent}
          onChange={(fill) => onLook({ fill })}
        />
        <label className="flex cursor-pointer items-center justify-between gap-2 text-xs text-muted-foreground select-none">
          Glow
          <input
            type="checkbox"
            checked={look.glow}
            onChange={() => onLook({ glow: !look.glow })}
            className="size-3.5 accent-primary"
          />
        </label>
      </Panel>
    </>
  )
}
