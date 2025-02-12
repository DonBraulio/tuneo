import { TuningType } from "./config"

const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"] as const
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const OCTAVE_NUMBERS = [0, 1, 2, 3, 4, 5, 6, 7, 8]

export type NoteName = (typeof NOTE_NAMES)[number]
export type OctaveNumber = (typeof OCTAVE_NUMBERS)[number]
export type Note = { name: NoteName; octave: OctaveNumber }

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

/**
 * Get nearest note name and octave from a given frequency.
 * @param frequency Frequency in Hz.
 * @returns name and octave of the note.
 */
export function getNoteFromFrequency(frequency: number, tuning: TuningType): Note | undefined {
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

/* ----------------- Guitar-specific stuff ---------------- */
// See: https://mixbutton.com/mixing-articles/music-note-to-frequency-chart/

// First element is 6th guitar string
export const STRING_NOTES: Note[] = [
  { name: "E", octave: 2 },
  { name: "A", octave: 2 },
  { name: "D", octave: 3 },
  { name: "G", octave: 3 },
  { name: "B", octave: 3 },
  { name: "E", octave: 4 },
]

/**
 * Find the nearest guitar string for the given frequency.
 * @param frequency Frequency in Hz.
 * @param stringFreqs Array of frequencies where to look for.
 * @returns index of the string stringFreqs or undefined.
 */
export function getNearestString(frequency: number, stringFreqs: number[]) {
  if (frequency <= 0) {
    return undefined
  }
  let minDistance = Infinity
  let minIdx = 0
  for (let i = 0; i < stringFreqs.length; i++) {
    const d = Math.abs(frequency - stringFreqs[i])
    if (d < minDistance) {
      minDistance = d
      minIdx = i
    }
  }
  return minIdx
}
