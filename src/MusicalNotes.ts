const A4_FREQUENCY = 440.0 // Reference frequency (A4)
const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"] as const
const OCTAVE_NUMBERS = [0, 1, 2, 3, 4, 5, 6, 7, 8]

export type NoteName = (typeof NOTE_NAMES)[number]
export type OctaveNumber = (typeof OCTAVE_NUMBERS)[number]
export type Note = { name: NoteName; octave: OctaveNumber }

/**
 * Get nearest note name and octave from a given frequency.
 * @param frequency Frequency in Hz.
 * @returns name and octave of the note.
 */
export function getNoteFromFrequency(frequency: number): Note | undefined {
  if (frequency <= 0) return

  // Calculate the number of semitones from reference A4
  const semitonesFromA4 = 12 * Math.log2(frequency / A4_FREQUENCY)

  // Octaves start in C, calculate semitones from C4
  const semitonesFromC4 = Math.round(semitonesFromA4 + 9)

  // Determine the note and octave
  const noteIndex = ((semitonesFromC4 % 12) + 12) % 12
  const octave = 4 + Math.floor(semitonesFromC4 / 12) // Adjust octave

  return { name: NOTE_NAMES[noteIndex], octave }
}

/**
 * Calculates the frequency of a note given its name and octave.
 * @param note The name and octave of the note.
 * @returns The frequency of the note in Hz.
 */
export function getFrequencyFromNote(note?: Note): number {
  if (!note) return 0

  // Calculate the semitone offset from A4
  const noteDistance = NOTE_NAMES.indexOf(note.name) - NOTE_NAMES.indexOf("A")
  const semitonesFromA4 = (note.octave - 4) * 12 + noteDistance

  // freq = ref^(semitones / 12)
  return A4_FREQUENCY * Math.pow(2, semitonesFromA4 / 12)
}

export function getSineOfFrequency(frequency: number, sampleRate: number, bufSize: number) {
  const sineWave: number[] = []
  for (let i = 0; i < bufSize; i++) {
    sineWave[i] = Math.sin((2 * Math.PI * i * frequency) / sampleRate)
  }
  return sineWave
}
