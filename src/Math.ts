import { Skia } from "@shopify/react-native-skia"

export const getWaveformPath = (
  samples: number[],
  width: number,
  height: number,
  maxGain: number
) => {
  "worklet"

  // Determine gain level to fit the signal in -1,1
  let maxAmplitude = 0
  samples.forEach((sample) => {
    if (Math.abs(sample) > maxAmplitude) {
      maxAmplitude = Math.abs(sample)
    }
  })
  const gain = Math.min(1 / maxAmplitude, maxGain)

  // X and Y scales for each sample
  const amplitude = (gain * height) / 2
  const dx = width / samples.length
  const zeroY = height / 2 // vertical axis 0

  // Create waveform path
  const path = Skia.Path.Make()
  let prevX = 0
  let prevY = 0
  samples.forEach((sample, idx) => {
    const x = idx * dx
    const y = zeroY - sample * amplitude

    if (idx === 0) {
      path.moveTo(x, y)
    } else {
      // use midpoint as control point
      const cpX = (prevX + x) / 2
      const cpY = (prevY + y) / 2
      path.quadTo(cpX, cpY, x, y)
    }
    prevX = x
    prevY = y
  })

  return path
}
