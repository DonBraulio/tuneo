import Colors from "@/colors"
import { Group, Path, SkPath, usePathInterpolation } from "@shopify/react-native-skia"
import { useEffect, useMemo, useState } from "react"
import { useWindowDimensions } from "react-native"
import { Skia } from "@shopify/react-native-skia"
import { cancelAnimation, useSharedValue, withTiming } from "react-native-reanimated"

const MAX_WAVEFORM_GAIN = 10
const WAVEFORM_SUBSAMPLE = 12
const MIN_SUBSAMPLE_SIZE = 10
const PLACEHOLDER_PATH1 = Skia.Path.MakeFromSVGString("M 0 0 L 0 0 Z")!
const PLACEHOLDER_PATH2 = Skia.Path.MakeFromSVGString("M 0 0 L 0 0 Z")!

const REFRESH_FRAMES = 1

export const Waveform = ({
  audioBuffer,
  positionY,
  height,
  bufferId,
  bufPerSec,
}: {
  audioBuffer: number[]
  positionY: number
  height: number
  bufferId: number
  bufPerSec: number
}) => {
  const { width } = useWindowDimensions()

  // Only refresh alignedAudio once every REFRESH_FRAMES
  const refresh = useMemo(() => Math.floor(bufferId / REFRESH_FRAMES), [bufferId])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const alignedAudio = useMemo(() => getAlignedAudio(audioBuffer, 2048), [refresh])

  const [waveform1, setWaveform1] = useState<SkPath>()
  const [waveform2, setWaveform2] = useState<SkPath>()
  const [toggle, setToggle] = useState(false)

  useEffect(() => {
    setToggle((toggle) => {
      if (toggle) setWaveform1(getWaveformPath(alignedAudio, width, height))
      else setWaveform2(getWaveformPath(alignedAudio, width, height))
      return !toggle
    })
  }, [alignedAudio, width, height])

  const progress = useSharedValue(0)
  useEffect(() => {
    progress.value = 0
    progress.value = withTiming(1, { duration: (1000 * REFRESH_FRAMES) / bufPerSec })

    return () => cancelAnimation(progress)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bufPerSec, toggle])

  const waveform = usePathInterpolation(
    progress,
    [0, 1],
    !waveform1 || !waveform2 || waveform1.isEmpty() || waveform2.isEmpty()
      ? [PLACEHOLDER_PATH1, PLACEHOLDER_PATH2]
      : toggle
      ? [waveform1, waveform2]
      : [waveform2, waveform1]
  )

  return (
    waveform && (
      <Group transform={[{ translateY: positionY }]}>
        <Path
          style="stroke"
          path={waveform}
          strokeWidth={2}
          strokeJoin="round"
          strokeCap="round"
          color={Colors.secondary}
        />
      </Group>
    )
  )
}

const getWaveformPath = (samples: number[], width: number, height: number) => {
  "worklet"

  // Determine gain level to fit the signal in -1,1
  let maxAmplitude = 0
  samples.forEach((sample) => {
    if (Math.abs(sample) > maxAmplitude) {
      maxAmplitude = Math.abs(sample)
    }
  })
  const gain = Math.min(1 / maxAmplitude, MAX_WAVEFORM_GAIN)

  // X and Y scales for each sample
  const amplitude = (gain * height) / 2
  const dx = width / samples.length
  const zeroY = height / 2 // vertical axis 0

  // Create waveform path
  const path = Skia.Path.Make()
  const subsample = samples.length > MIN_SUBSAMPLE_SIZE ? WAVEFORM_SUBSAMPLE : 1

  samples.forEach((sample, idx) => {
    if (idx % subsample !== 0) return
    const x = idx * dx
    const y = zeroY - sample * amplitude

    if (idx === 0) {
      path.moveTo(x, y)
    } else {
      path.lineTo(x, y)
    }
  })

  return path
}

/**
 * Cuts a slice of the audio signal such that it has a peak at x=0.
 * @param audioBuffer the array with audio samples to align.
 * @returns a slice of the audioBuffer such that it has a peak at x=0.
 */
function getAlignedAudio(audioBuffer: number[], maxSize: number) {
  if (!audioBuffer.length) return []

  // Find highest peak within 1/4 of the signal.
  const searchLength = Math.floor(audioBuffer.length / 4)
  let maxValue = 0
  let maxIdx = 0
  for (let idx = 0; idx < searchLength; idx++) {
    if (audioBuffer[idx] > maxValue) {
      maxValue = audioBuffer[idx]
      maxIdx = idx
    }
  }
  // Return new signal starting at the peak
  const beginIdx = maxIdx
  const endIdx = maxIdx + Math.min(maxSize, audioBuffer.length - searchLength)
  return audioBuffer.slice(beginIdx, endIdx)
}
