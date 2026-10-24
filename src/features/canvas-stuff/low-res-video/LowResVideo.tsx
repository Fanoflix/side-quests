import { ToolIntro } from "@/components/layout/ToolIntro"
import { ToolStage } from "@/components/stage/ToolStage"
import { FileDropZone } from "@/components/upload/FileDropZone"
import { Controls } from "./Controls"
import { PixelScreen } from "./PixelScreen"
import { VideoTransport } from "./VideoTransport"
import { useLowResVideo } from "./useLowResVideo"

export function LowResVideo() {
  const {
    stage,
    grid,
    limits,
    screenStyle,
    glowStyle,
    look,
    preset,
    lockToVideo,
    playing,
    muted,
    volume,
    currentTime,
    duration,
    videoRef,
    dotsRef,
    glowRef,
    setCols,
    setRows,
    updateLook,
    applyPreset,
    toggleLock,
    pickFile,
    seek,
    togglePlay,
    toggleMute,
    setVolume,
  } = useLowResVideo()

  return (
    <div className="flex w-full flex-col gap-8">
      <ToolIntro
        title="Low Res Video"
        hint="Drag Columns down until it stops looking like anything. Drop in your own video to try it on that."
      >
        How few dots does a video need before you can't tell what it is?
      </ToolIntro>

      <ToolStage
        stage={stage}
        className="grid min-h-[30rem] place-items-center px-6 py-12"
        controls={
          <Controls
            grid={grid}
            limits={limits}
            look={look}
            preset={preset}
            lockToVideo={lockToVideo}
            onCols={setCols}
            onRows={setRows}
            onLook={updateLook}
            onPreset={applyPreset}
            onToggleLock={toggleLock}
            onPickFile={pickFile}
          />
        }
      >
        <FileDropZone
          accept="video/*"
          onPick={pickFile}
          empty={false}
          hint="Drop a video"
        >
          <PixelScreen
            dotsRef={dotsRef}
            glowRef={glowRef}
            screenStyle={screenStyle}
            glowStyle={glowStyle}
          >
            <VideoTransport
              playing={playing}
              onTogglePlay={togglePlay}
              currentTime={currentTime}
              duration={duration}
              onSeek={seek}
              muted={muted}
              onToggleMute={toggleMute}
              volume={volume}
              onVolumeChange={setVolume}
            />
          </PixelScreen>
        </FileDropZone>
      </ToolStage>

      <video
        ref={videoRef}
        className="pointer-events-none fixed top-0 left-0 size-px opacity-0"
        aria-hidden
        playsInline
        loop
        muted
      />
    </div>
  )
}
