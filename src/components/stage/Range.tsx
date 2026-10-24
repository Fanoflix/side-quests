export function Range({
  label,
  value,
  min,
  max,
  step = 1,
  unit,
  format,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  step?: number
  unit?: string
  format?: (value: number) => string
  onChange: (value: number) => void
}) {
  return (
    <label className="flex items-center gap-3">
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
        className="h-1 min-w-0 flex-1 cursor-pointer accent-primary"
      />
      <span className="w-12 shrink-0 text-right text-xs text-foreground tabular-nums">
        {format ? format(value) : value}
        {unit}
      </span>
    </label>
  )
}
