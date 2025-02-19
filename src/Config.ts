import { MenuAction } from "@react-native-menu/menu"
import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"
import { zustandStorage } from "./localStorage"
import { getLocaleForDevice, useTranslation } from "./translations"
import { Platform } from "react-native"

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

interface ConfigState {
  instrument: InstrumentType
  theme: ThemeType
  language: LanguageType
  tuning: TuningType
  graphics: GraphicsMode
  setLanguage: (language: LanguageType) => void
  setInstrument: (instrument: InstrumentType) => void
  setTheme: (theme: ThemeType) => void
  setTuning: (tuning: TuningType) => void
  setGraphics: (grahpics: GraphicsMode) => void
}

/**
 * Zustand hook to use global state
 * @returns global store handler
 */
export const useConfigStore = create<ConfigState>()(
  persist(
    (set) => ({
      instrument: "guitar",
      theme: "dark",
      language: getLocaleForDevice(),
      tuning: "ref_440",
      graphics: Platform.OS === "ios" ? "high" : "low",

      setLanguage: (language: LanguageType) => set({ language }),
      setInstrument: (instrument: InstrumentType) => set({ instrument }),
      setTheme: (theme: ThemeType) => set({ theme }),
      setTuning: (tuning: TuningType) => set({ tuning }),
      setGraphics: (graphics: GraphicsMode) => set({ graphics }),
    }),
    {
      name: "config-store",
      storage: createJSONStorage(() => zustandStorage),
      merge: (persistedState, currentState) => {
        const loadedState = { ...currentState }
        const savedState = persistedState as ConfigState

        // Load only valid configuration keys from savedState
        if (INSTRUMENT_IDS.includes(savedState.instrument as any)) {
          loadedState.instrument = savedState.instrument
        }
        if (THEME_IDS.includes(savedState.theme as any)) {
          loadedState.theme = savedState.theme
        }
        if (TUNING_IDS.includes(savedState.tuning as any)) {
          loadedState.tuning = savedState.tuning
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

export const useSettingsOptions = () => {
  const t = useTranslation()
  return {
    getInstrumentName: (instrument: InstrumentType): string => {
      switch (instrument) {
        case "guitar":
          return t("guitar")
        case "chromatic":
          return t("chromatic")
      }
    },

    getLanguageName: (language: LanguageType): string => {
      switch (language) {
        case "en":
          return "English"
        case "es":
          return "Español"
      }
    },

    getThemeName: (theme: ThemeType): string => {
      switch (theme) {
        case "dark":
          return t("dark")
      }
    },

    getTuningName: (tuning: TuningType): string => {
      switch (tuning) {
        case "ref_440":
          return t("tuning_440")
        case "ref_444":
          return t("tuning_444")
        case "ref_432":
          return t("tuning_432")
      }
    },

    getGraphicModeName: (graphics: GraphicsMode): string => {
      switch (graphics) {
        case "high":
          return t("graphics_high")
        case "low":
          return t("graphics_low")
      }
    },

    getInstruments: function () {
      return INSTRUMENT_IDS.map((id) => ({ id, title: this.getInstrumentName(id) } as MenuAction))
    },
    getLanguages: function () {
      return LANGUAGE_IDS.map((id) => ({ id, title: this.getLanguageName(id) } as MenuAction))
    },
    getThemes: function () {
      return THEME_IDS.map((id) => ({ id, title: this.getThemeName(id) } as MenuAction))
    },
    getTunings: function () {
      return TUNING_IDS.map((id) => ({ id, title: this.getTuningName(id) } as MenuAction))
    },
    getGraphics: function () {
      return GRAPHIC_MODES.map((id) => ({ id, title: this.getGraphicModeName(id) } as MenuAction))
    },
  }
}
