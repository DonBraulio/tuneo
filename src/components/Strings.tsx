import Colors from "@/colors"
import { Instrument } from "@/instruments"
import { Note } from "@/notes"
import { useParagraphBuilder } from "@/paragraphs"
import { Group, Paint, Paragraph, RoundedRect } from "@shopify/react-native-skia"
import { useMemo } from "react"

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
  const paragraphs = useParagraphBuilder()
  const stringNotes = useMemo(() => instrument.getStrings(), [instrument])
  const nStrings = stringNotes.length

  const stringBoxH = 32
  const stringBoxW = 50
  const stringBoxBorder = 1
  const stringBoxSpacing = (height - nStrings * stringBoxH) / (nStrings + 1)

  return (
    <Group transform={[{ translateY: positionY + stringBoxSpacing }]}>
      {stringNotes.map((note, idx) => {
        const active = note.name === currentNote?.name && note.octave === currentNote?.octave
        const posX = stringBoxSpacing
        const posY = idx * (stringBoxH + stringBoxSpacing)
        return (
          <Group key={idx}>
            <RoundedRect
              x={posX}
              y={posY}
              height={stringBoxH - 2 * stringBoxBorder}
              width={stringBoxW}
              r={10}
            >
              <Paint style="fill" color={active ? Colors.secondary : Colors.bgActive} />
              <Paint
                style="stroke"
                color={active ? Colors.primary : Colors.secondary}
                strokeWidth={stringBoxBorder}
              />
            </RoundedRect>
            <Paragraph
              paragraph={paragraphs.centered(
                `${nStrings - idx} • ${note.name}`,
                16,
                active ? 600 : 300,
                Colors.primary
              )}
              x={posX}
              y={posY + 6}
              width={stringBoxW}
            />
          </Group>
        )
      })}
    </Group>
  )
}
