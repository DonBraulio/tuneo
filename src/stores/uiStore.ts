import { create } from "zustand"
import { InstrumentString } from "../instruments"

interface uiState {
  pitchHistory: number[]
  addPitch: (pitch: number) => void
  rmsHistory: number[]
  addRMS: (rms: number) => void
  idHistory: number[]
  addId: (id: number) => void
  stringHistory: (InstrumentString | undefined)[]
  addString: (string?: InstrumentString) => void
}

const PITCH_HISTORY = 3
const RMS_HISTORY = 3
const STRING_HISTORY = 3
const ID_HISTORY = 3

export const useUiStore = create<uiState>()((set, get) => ({
  pitchHistory: new Array(PITCH_HISTORY).fill(-1),
  addPitch: (pitch) => {
    const pitchHistory = get().pitchHistory.toSpliced(0, 1)
    pitchHistory.push(pitch)
    set({ pitchHistory })
  },
  rmsHistory: new Array(RMS_HISTORY).fill(0),
  addRMS: (rms) => {
    const rmsHistory = get().rmsHistory.toSpliced(0, 1)
    rmsHistory.push(rms)
    set({ rmsHistory })
  },
  idHistory: new Array(ID_HISTORY).fill(0),
  addId: (id) => {
    const idHistory = get().idHistory.toSpliced(0, 1)
    idHistory.push(id)
    set({ idHistory })
  },
  stringHistory: new Array<InstrumentString | undefined>(STRING_HISTORY).fill(undefined),
  addString: (string) => {
    const stringQueue = get().stringHistory.toSpliced(0, 1)
    stringQueue.push(string)
    set({ stringHistory: stringQueue })
  },
}))
