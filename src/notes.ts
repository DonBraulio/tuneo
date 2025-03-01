import { TuningType } from "./configHooks"

const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"] as const
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const OCTAVE_NUMBERS = [0, 1, 2, 3, 4, 5, 6, 7, 8]

export type NoteName = (typeof NOTE_NAMES)[number]
export type OctaveNumber = (typeof OCTAVE_NUMBERS)[number]
export type Note = { name: NoteName; octave: OctaveNumber }

/**
 * Compare notes. If both are undefined, returns false.
 * @param note1 first note to compare
 * @param note2 another note to compare
 * @returns true only if both notes have the same name and octave
 */
export const sameNote = (note1?: Note, note2?: Note) =>
  note1 && note1.name === note2?.name && note1.octave === note2.octave

/**
 * Get nearest note name and octave from a given frequency.
 * @param frequency Frequency in Hz.
 * @returns name and octave of the note.
 */
export function getNoteFromFreq(frequency: number, tuning: TuningType): Note | undefined {
  if (frequency <= 0) return

  // Calculate the number of semitones from reference A4
  const a4_frequency = getReferenceFrequency(tuning)
  const semitonesFromA4 = 12 * Math.log2(frequency / a4_frequency)

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
export function getFreqFromNote(note: Note | undefined, tuning: TuningType): number {
  if (!note) return 0

  const a4_frequency = getReferenceFrequency(tuning)

  // Calculate the semitone offset from A4
  const noteDistance = NOTE_NAMES.indexOf(note.name) - NOTE_NAMES.indexOf("A")
  const semitonesFromA4 = (note.octave - 4) * 12 + noteDistance

  // freq = ref^(semitones / 12)
  return a4_frequency * Math.pow(2, semitonesFromA4 / 12)
}

/**
 * Calculate relative difference between frequencies
 * @param freq1 Frequency in Hz
 * @param freq2 Frequency in Hz
 * @returns difference normalized wrt freq1
 */
export function getRelativeDiff(freq1: number, freq2: number): number {
  return Math.abs(freq1 - freq2) / (Math.abs(freq1) + 0.001)
}

function getReferenceFrequency(tuning: TuningType): number {
  switch (tuning) {
    case "ref_440":
      return 440
    case "ref_432":
      return 432
    case "ref_444":
      return 444
  }
}
