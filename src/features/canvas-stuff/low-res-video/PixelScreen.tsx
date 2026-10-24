import type { CSSProperties, ReactNode, RefObject } from "react"

type Props = {
  dotsRef: RefObject<HTMLCanvasElement | null>
  glowRef: RefObject<HTMLCanvasElement | null>
  screenStyle: CSSProperties
  glowStyle: CSSProperties
  children?: ReactNode
}

export function PixelScreen({
  dotsRef,
  glowRef,
  screenStyle,
  glowStyle,
  children,
}: Props) {
  return (
    <div
      className="group relative overflow-hidden bg-[#060708] shadow-2xl ring-1 ring-border"
      style={screenStyle}
    >
      <canvas
        ref={glowRef}
        aria-hidden
        className="absolute inset-0 size-full transition-opacity duration-175 ease-snap"
        style={glowStyle}
      />
      <canvas
        ref={dotsRef}
        role="img"
        aria-label="The video, drawn as a grid of dots"
        className="relative block size-full"
      />
      {children}
    </div>
  )
}
