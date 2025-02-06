import { Skia } from "@shopify/react-native-skia"

const MAX_WAVEFORM_GAIN = 20

export const getWaveformPath = (samples: number[], width: number, height: number) => {
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

/**
 * Cuts a slice of the audio signal such that it has a peak at x=0.
 * @param audioBuffer the array with audio samples to align.
 * @returns a slice of the audioBuffer such that it has a peak at x=0.
 */
export function getAlignedAudio(audioBuffer: number[]) {
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
  return audioBuffer.slice(maxIdx, audioBuffer.length - searchLength + maxIdx)
}

/**
 * Gets a test signal with varying frequency.
 * @param testId incremental counter that indicates the current test step.
 * @param sampleRate sample rate for the audio.
 * @param bufSize buffer size to return.
 * @returns a signal that can be used as an audio buffer.
 */
export function getTestSignal(testId: number, sampleRate: number, bufSize: number = 4410) {
  // Test frequency is a sawtooth with sinusoidal ripple
  const TEST_LOWEST = 80
  const TEST_HIGHEST = 500
  const progress = (testId % 2000) / 2000 // linear increase frequency
  const center_freq = TEST_LOWEST + (TEST_HIGHEST - TEST_LOWEST) * progress
  const amp_freq = (TEST_HIGHEST - TEST_LOWEST) / 200
  const freq = center_freq + amp_freq * Math.sin((2 * Math.PI * testId) / 50)

  // Generate sine of freq
  return getSineOfFrequency(freq, sampleRate, bufSize)
}

function getSineOfFrequency(frequency: number, sampleRate: number, bufSize: number) {
  const sineWave: number[] = []
  for (let i = 0; i < bufSize; i++) {
    sineWave[i] = Math.sin((2 * Math.PI * i * frequency) / sampleRate)
  }
  return sineWave
}
