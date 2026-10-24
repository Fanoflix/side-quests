import { cn } from "@/lib/utils"

export function Range({
  label,
  value,
  min,
  max,
  step = 1,
  unit,
  format,
  onChange,
  disabled,
}: {
  label: string
  value: number
  min: number
  max: number
  step?: number
  unit?: string
  format?: (value: number) => string
  onChange: (value: number) => void
  disabled?: boolean
}) {
  return (
    <label
      className={cn(
        "flex items-center gap-3",
        disabled && "pointer-events-none opacity-45"
      )}
    >
      <span className="w-20 shrink-0 text-xs text-muted-foreground">
        {label}
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(e.target.valueAsNumber)}
        disabled={disabled}
        className="h-1 min-w-0 flex-1 cursor-pointer accent-primary"
      />
      <span className="w-12 shrink-0 text-right text-xs text-foreground tabular-nums">
        {format ? format(value) : value}
        {unit}
      </span>
    </label>
  )
}
