import Colors from "@/colors"
import { Instrument } from "@/instruments"
import { Note } from "@/notes"
import { useMemo } from "react"
import { Pressable, Text, View } from "react-native"

export const Strings = ({
  positionY,
  currentNote,
  height,
  instrument,
}: {
  positionY: number
  currentNote: Note | undefined
  height: number
  instrument: Instrument
}) => {
  const stringNotes = useMemo(() => instrument.getStrings(), [instrument])
  const nStrings = stringNotes.length

  const stringBoxH = height / (1.5 * nStrings)
  const fontHeight = stringBoxH / 2.2
  const fontSize = fontHeight / 1.3
  const stringBoxW = 50
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
            style={{
              marginLeft: stringBoxSpacing,
              height: stringBoxH - 2 * stringBoxBorder,
              width: stringBoxW,
              borderRadius: 10,
              backgroundColor: active ? Colors.secondary : Colors.bgActive,
              borderColor: active ? Colors.primary : Colors.secondary,
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
