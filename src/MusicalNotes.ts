const A4_FREQUENCY = 440.0 // Reference frequency for A4
const NOTE_NAMES = ["A", "A#", "B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#"] as const
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

  // Calculate the number of semitones from A4
  const semitonesFromA4 = 12 * Math.log2(frequency / A4_FREQUENCY)

  // Round to the nearest semitone
  const semitoneIndex = Math.round(semitonesFromA4)

  // Determine the note and octave
  const noteIndex = ((semitoneIndex % 12) + 12) % 12 // Ensure index is positive
  const octave = 4 + Math.floor((semitoneIndex + 3) / 12) // Adjust octave

  return { name: NOTE_NAMES[noteIndex], octave }
}

/**
 * Calculates the frequency of a note given its name and octave.
 * @param note The name and octave of the note.
 * @returns The frequency of the note in Hz.
 */
export function getFrequencyFromNote(note?: Note): number {
  if (!note) return 0

  // Find the index of the note name in the NOTE_NAMES array
  const noteIndex = NOTE_NAMES.indexOf(note.name)

  // Calculate the semitone offset from A4
  const semitonesFromA4 = (note.octave - 4) * 12 + noteIndex

  // Calculate the frequency using the semitone formula
  return A4_FREQUENCY * Math.pow(2, semitonesFromA4 / 12)
}
