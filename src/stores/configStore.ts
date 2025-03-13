import { Platform } from "react-native"
import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { zustandStorage } from "./localStorage"
import { getLocales } from "expo-localization"

export const INSTRUMENT_IDS = ["guitar", "chromatic"] as const
export const THEME_IDS = ["dark"] as const
export const LANGUAGE_IDS = ["en", "es"] as const
export const TUNING_IDS = ["ref_440", "ref_432", "ref_444"] as const
export const GRAPHIC_MODES = ["low", "high"] as const

export type InstrumentType = (typeof INSTRUMENT_IDS)[number]
export type ThemeType = (typeof THEME_IDS)[number]
export type LanguageType = (typeof LANGUAGE_IDS)[number]
export type TuningType = (typeof TUNING_IDS)[number]
export type GraphicsMode = (typeof GRAPHIC_MODES)[number]

export interface ConfigState {
  instrument: InstrumentType
  theme: ThemeType
  language: LanguageType
  tuning: TuningType
  graphics: GraphicsMode
  manual: boolean
  setLanguage: (language: LanguageType) => void
  setInstrument: (instrument: InstrumentType) => void
  setTheme: (theme: ThemeType) => void
  setTuning: (tuning: TuningType) => void
  setGraphics: (grahpics: GraphicsMode) => void
  setManual: (manual: boolean) => void
}

/**
 * Zustand hook to use global state
 * @returns global store handler
 */
export const useConfigStore = create<ConfigState>()(
  persist(
    (set) => ({
      // Persistent values
      theme: "dark",
      language: getLocaleForDevice(),
      graphics: Platform.OS === "ios" ? "high" : "low",

      // Not persistent values below (see merge function)
      instrument: "guitar",
      tuning: "ref_440",
      manual: false,

      setLanguage: (language: LanguageType) => set({ language }),
      setTheme: (theme: ThemeType) => set({ theme }),
      setGraphics: (graphics: GraphicsMode) => set({ graphics }),
      setInstrument: (instrument: InstrumentType) => set({ instrument }),
      setTuning: (tuning: TuningType) => set({ tuning }),
      setManual: (manual) => set({ manual }),
    }),
    {
      name: "config-store",
      storage: createJSONStorage(() => zustandStorage),
      merge: (persistedState, currentState) => {
        const loadedState = { ...currentState }
        const savedState = persistedState as ConfigState

        // Load only valid configuration keys from savedState
        // NOTE omitted on purpose: instrument, tuning or manual
        if (THEME_IDS.includes(savedState.theme as any)) {
          loadedState.theme = savedState.theme
        }
        if (LANGUAGE_IDS.includes(savedState.language as any)) {
          loadedState.language = savedState.language
        }
        if (GRAPHIC_MODES.includes(savedState.graphics as any)) {
          loadedState.graphics = savedState.graphics
        }
        return loadedState
      },
    }
  )
)

/**
 * Get best available locale according to user's settings on device.
 * @returns a LanguageType that is available on the device
 */
export function getLocaleForDevice(): LanguageType {
  for (const locale in getLocales()) {
    if (LANGUAGE_IDS.includes(locale as any)) {
      return locale as LanguageType
    }
  }
  return "en" // fallback
}

export function getTuningFreq(tuning: TuningType): number {
  switch (tuning) {
    case "ref_440":
      return 440
    case "ref_432":
      return 432
    case "ref_444":
      return 444
  }
}
