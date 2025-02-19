import Colors from "@/colors"
import { Group, Path } from "@shopify/react-native-skia"
import { useMemo } from "react"
import { useWindowDimensions } from "react-native"
import { Skia } from "@shopify/react-native-skia"

const MAX_WAVEFORM_GAIN = 20

export const Waveform = ({
  audioBuffer,
  positionY,
  height,
}: {
  audioBuffer: number[]
  positionY: number
  height: number
}) => {
  const { width } = useWindowDimensions()
  const alignedAudio = useMemo(() => getAlignedAudio(audioBuffer, 2048), [audioBuffer])
  const waveformPath = useMemo(
    () => getWaveformPath(alignedAudio, width, height),
    [alignedAudio, width, height]
  )

  return (
    <Group transform={[{ translateY: positionY }]}>
      <Path
        style="stroke"
        path={waveformPath}
        strokeWidth={2}
        strokeJoin="round"
        strokeCap="round"
        color={Colors.secondary}
      />
    </Group>
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
  const subsample = 12
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
