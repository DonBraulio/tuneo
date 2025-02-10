import { MenuAction } from "@react-native-menu/menu"
import { create } from "zustand"
import { persist } from "zustand/middleware"

export const INSTRUMENT_IDS = ["guitar", "any"] as const
export const THEME_IDS = ["dark"] as const
export const LANGUAGE_IDS = ["en", "es"] as const

export type InstrumentType = (typeof INSTRUMENT_IDS)[number]
export type ThemeType = (typeof THEME_IDS)[number]
export type LanguageType = (typeof LANGUAGE_IDS)[number]

interface ConfigState {
  instrument: InstrumentType
  theme: ThemeType
  language: LanguageType
  setLanguage: (language: LanguageType) => void
  setInstrument: (instrument: InstrumentType) => void
  setTheme: (theme: ThemeType) => void
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
      language: "en",
      setLanguage: (language: LanguageType) => set({ language }),
      setInstrument: (instrument: InstrumentType) => set({ instrument }),
      setTheme: (theme: ThemeType) => set({ theme }),
    }),
    { name: "config-store" }
  )
)

export function getInstrumentName(instrument: InstrumentType): string {
  switch (instrument) {
    case "guitar":
      return "Guitar"
    case "any":
      return "Any Note"
  }
}

export function getLanguageName(language: LanguageType): string {
  switch (language) {
    case "en":
      return "English"
    case "es":
      return "Español"
  }
}

export function getThemeName(theme: ThemeType): string {
  switch (theme) {
    case "dark":
      return "Dark"
  }
}

export const getInstruments = () =>
  INSTRUMENT_IDS.map((id) => ({ id, title: getInstrumentName(id) } as MenuAction))
export const getLanguages = () =>
  LANGUAGE_IDS.map((id) => ({ id, title: getLanguageName(id) } as MenuAction))
export const getThemes = () =>
  THEME_IDS.map((id) => ({ id, title: getThemeName(id) } as MenuAction))
