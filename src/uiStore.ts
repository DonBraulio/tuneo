import { create } from "zustand"
import { InstrumentString } from "./instruments"

interface uiState {
  stringQueue: (InstrumentString | undefined)[]
  addString: (string?: InstrumentString) => void
}

const STRING_QUEUE_LIMIT = 20

export const useUiStore = create<uiState>()((set, get) => ({
  stringQueue: [],
  addString: (string) => {
    // Copy and remove first if full
    const removeOne = get().stringQueue.length >= STRING_QUEUE_LIMIT ? 1 : 0
    const newQueue = get().stringQueue.toSpliced(0, removeOne)

    // Append latest string
    newQueue.push(string)

    set({ stringQueue: newQueue })
  },
}))
