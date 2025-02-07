import Colors from "@/Colors"
import { FormPicker } from "@/components/FormPicker"
import { useState } from "react"
import { StyleSheet, View } from "react-native"

const LANGUAGES = [
  {
    title: "English",
    id: "en",
  },
  {
    title: "Español",
    id: "es",
  },
]
const INSTRUMENTS = [
  {
    title: "Guitar",
    id: "gtr",
  },
  {
    title: "Free Notes",
    id: "free",
  },
]

const THEMES = [
  {
    title: "Dark",
    id: "dark",
  },
]

export function Settings() {
  const [, setLanguage] = useState("en")
  const [, setInstrument] = useState("gtr")
  const [, setTheme] = useState("dark")

  return (
    <View style={styles.container}>
      <FormPicker label="Language" actions={LANGUAGES} defaultId="en" onSelect={setLanguage} />
      <FormPicker
        label="Instrument"
        actions={INSTRUMENTS}
        defaultId="gtr"
        onSelect={setInstrument}
      />
      <FormPicker label="Theme" actions={THEMES} defaultId="dark" onSelect={setTheme} />
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
