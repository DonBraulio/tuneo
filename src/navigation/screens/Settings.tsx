import Colors from "@/colors"
import { FormPicker } from "@/components/FormPicker"
import { getLanguages, getThemes, LanguageType, ThemeType, useConfigStore } from "@/config"
import { useMemo } from "react"
import { StyleSheet, View } from "react-native"

export function Settings() {
  const config = useConfigStore()
  const languages = useMemo(getLanguages, [])
  const themes = useMemo(getThemes, [])

  return (
    <View style={styles.container}>
      <FormPicker
        label="Language"
        actions={languages}
        defaultId={languages[0].id ?? ""}
        onSelect={(lang) => config.setLanguage(lang as LanguageType)}
      />
      <FormPicker
        label="Theme"
        actions={themes}
        defaultId={themes[0].id ?? ""}
        onSelect={(theme) => config.setTheme(theme as ThemeType)}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.bgInactive,
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "flex-start",
    gap: 20,
    padding: 20,
  },
})
