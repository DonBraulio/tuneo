import { getLocales } from "expo-localization"
import { LANGUAGE_IDS, LanguageType, useConfigStore } from "./config"

export interface Translation {
  guitar: string
  any_note: string
  instrument: string
  more_settings: string
  no_tone: string
  language: string
  theme: string
  dark: string
  close: string
  settings: string
  reference_a4: string
  tuning_440: string
  tuning_432: string
  tuning_444: string
}

export const en: Translation = {
  guitar: "Guitar",
  any_note: "Free notes",
  instrument: "Instrument",
  more_settings: "Settings...",
  no_tone: "No tone",
  language: "Language",
  theme: "Theme",
  dark: "Dark",
  close: "Close",
  settings: "Settings",
  reference_a4: "Reference (A4)",
  tuning_440: "440Hz (standard)",
  tuning_432: "432Hz (Verdi)",
  tuning_444: "444Hz (high pitch)",
}

export const es: Translation = {
  guitar: "Guitarra",
  any_note: "Notas libres",
  instrument: "Instrumento",
  more_settings: "Configuración...",
  no_tone: "Sin tono",
  language: "Idioma",
  theme: "Tema",
  dark: "Oscuro",
  close: "Cerrar",
  settings: "Configuración",
  reference_a4: "Referencia (A4)",
  tuning_440: "440Hz (estándar)",
  tuning_432: "432Hz (Verdi)",
  tuning_444: "444Hz (tono alto)",
}

/**
 * React hook that provides the proper translation function
 * according to the device's preferences or app settings.
 * @returns a function to use as t('key'), where 'key' keyof Translation.
 */
export const useTranslation = () => {
  const config = useConfigStore()
  return (key: keyof Translation) => {
    switch (config.language) {
      case "en":
        return en[key]
      case "es":
        return es[key]
    }
  }
}

/**
 * Get best available locale according to user's settings on device.
 * @returns a LanguageType that is available on the device
 */
export const getLocaleForDevice = (): LanguageType => {
  for (const locale in getLocales()) {
    if (LANGUAGE_IDS.includes(locale as any)) {
      return locale as LanguageType
    }
  }
  return "en" // fallback
}
