import { create } from "zustand"

export const INSTRUMENT_IDS = ["guitar", "any"] as const
export const THEME_IDS = ["dark"] as const
export const LANGUAGE_IDS = ["en", "es"] as const

export type InstrumentType = (typeof INSTRUMENT_IDS)[number]
export type ThemeType = (typeof THEME_IDS)[number]
export type LanguageType = (typeof LANGUAGE_IDS)[number]

interface CfgState {
  instrument: InstrumentType
  theme: ThemeType
  language: LanguageType
}

export const useCfgStore = create<CfgState>((set) => ({
  instrument: "guitar",
  theme: "dark",
  language: "en",
  setLanguage: (language: LanguageType) => set({ language }),
  setInstrument: (instrument: InstrumentType) => set({ instrument }),
  setTheme: (theme: ThemeType) => set({ theme }),
}))

export function getInstrumentName(instrument: InstrumentType): string {
  switch (instrument) {
    case "guitar":
      return "Guitar"
    case "any":
      return "Any Note"
  }
}
