import Colors from "@/colors"
import { Instrument } from "@/instruments"
import { getFreqFromNote, Note } from "@/notes"
import { useConfigStore } from "@/stores/configStore"
import { useUiStore } from "@/stores/uiStore"
import { useMemo } from "react"
import { Pressable, Text, useWindowDimensions, View } from "react-native"

export const Strings = ({
  positionY,
  height,
  instrument,
}: {
  positionY: number
  height: number
  instrument: Instrument
}) => {
  const { width } = useWindowDimensions()
  const tuning = useConfigStore((state) => state.tuning)
  const setManual = useConfigStore((state) => state.setManual)
  const setCurrentString = useUiStore((state) => state.setCurrentString)
  const currentString = useUiStore((state) => state.currentString)
  const currentNote = currentString?.note
  const stringNotes = useMemo(() => instrument.getStrings(), [instrument])
  const nStrings = stringNotes.length

  const stringBoxH = height / (1.5 * nStrings)
  const fontHeight = stringBoxH / 2.2
  const fontSize = fontHeight / 1.3
  const stringBoxW = width / 8
  const stringBoxBorder = 1
  const stringBoxSpacing = (height - nStrings * stringBoxH) / (nStrings + 1)

  return (
    <View
      style={{
        position: "absolute",
        top: positionY + stringBoxSpacing,
        left: 0,
        gap: stringBoxSpacing,
      }}
    >
      {stringNotes.map((note, idx) => {
        const active = note.name === currentNote?.name && note.octave === currentNote?.octave
        const text = `${nStrings - idx} • ${note.name}`
        return (
          <Pressable
            onPress={() => {
              setManual(true)
              setCurrentString({ note: note, freq: getFreqFromNote(note, tuning) })
            }}
            style={{
              marginLeft: stringBoxSpacing,
              height: stringBoxH - 2 * stringBoxBorder,
              width: stringBoxW,
              borderRadius: 10,
              backgroundColor: active ? Colors.secondary : Colors.bgActive,
              borderColor: active ? Colors.accent : Colors.secondary,
              borderWidth: stringBoxBorder,
              justifyContent: "center",
            }}
            key={idx}
          >
            <Text
              style={{
                color: Colors.primary,
                fontWeight: active ? "600" : "300",
                fontSize: fontSize,
                textAlign: "center",
              }}
            >
              {text}
            </Text>
          </Pressable>
        )
      })}
    </View>
  )
}
