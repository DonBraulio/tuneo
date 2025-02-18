/**
 * Gets a test signal with varying frequency.
 * @param testId incremental counter that indicates the current test step.
 * @param sampleRate sample rate for the audio.
 * @param bufSize buffer size to return.
 * @returns a signal that can be used as an audio buffer.
 */
export function getTestSignal(testId: number, sampleRate: number, bufSize: number) {
  // Test frequency is a sawtooth with sinusoidal ripple
  const TEST_LOWEST = 50
  const TEST_HIGHEST = 400
  const progress = (testId % 100) / 100 // linear increase frequency
  const center_freq = TEST_LOWEST + (TEST_HIGHEST - TEST_LOWEST) * progress
  const amp_freq = (TEST_HIGHEST - TEST_LOWEST) / 200
  const freq = center_freq + amp_freq * Math.sin((2 * Math.PI * testId) / 10)

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
