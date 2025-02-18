import Colors from "@/colors"
import { InstrumentString } from "@/instruments"
import { useParagraphBuilder } from "@/paragraphs"
import { useTranslation } from "@/translations"
import { Group, Paragraph, RoundedRect } from "@shopify/react-native-skia"
import { useMemo } from "react"
import { useWindowDimensions } from "react-native"

export const MainNote = ({
  positionY,
  currentString,
  pitch,
  gaugeDeviation,
  gaugeColor,
}: {
  positionY: number
  currentString: InstrumentString | undefined
  pitch: number
  gaugeDeviation: number | undefined
  gaugeColor: string
}) => {
  const paragraphs = useParagraphBuilder()
  const screen = useWindowDimensions()
  const t = useTranslation()

  // Box size for string note text at the center
  const width = 80
  const height = 90
  const sideTxtWidth = 85
  const noteFontSize = 54

  const stringText = currentString?.freq.toFixed(1)
  const pitchText = pitch.toFixed(1)

  // Show << or >> characters next to frequency read
  const freqDiffTxt = useMemo(() => {
    if (!currentString || stringText === pitchText) return null

    let text = ""
    if (gaugeDeviation) {
      let prevText = " "
      let postText = " "
      if (Math.abs(gaugeDeviation) > 0.75) return ""
      if (gaugeDeviation > 0) prevText += "<"
      if (gaugeDeviation > 0.2) prevText += "<"
      if (gaugeDeviation < 0) postText += ">"
      if (gaugeDeviation < -0.2) postText += ">"
      const diffTxt = Math.abs(pitch - currentString.freq).toFixed(1)
      text = `${prevText} ${gaugeDeviation > 0 ? "+" : "-"}${diffTxt}Hz ${postText}`
    }
    return text
  }, [currentString, stringText, pitchText, gaugeDeviation, pitch])

  return (
    <Group transform={[{ translateY: positionY - height }]}>
      <RoundedRect
        x={screen.width / 2 - width / 2}
        y={0}
        height={height}
        width={width}
        r={10}
        color={Colors.secondary}
      />
      <Paragraph
        paragraph={paragraphs.centered(
          currentString?.note.name ?? "-",
          noteFontSize,
          600,
          Colors.primary
        )}
        x={screen.width / 2 - width / 2}
        y={10}
        width={width}
      />
      <Paragraph
        paragraph={paragraphs.centered(
          stringText ? `${stringText}Hz` : t("no_tone"),
          14,
          500,
          Colors.primary
        )}
        x={screen.width / 2 - width / 2}
        y={height - 20}
        width={width}
      />
      {freqDiffTxt && (
        <Paragraph
          paragraph={paragraphs.centered(freqDiffTxt, 12, 100, gaugeColor)}
          x={
            (gaugeDeviation ?? 0) > 0
              ? screen.width / 2 + sideTxtWidth / 2
              : screen.width / 2 - (3 * sideTxtWidth) / 2
          }
          y={height - 20}
          width={sideTxtWidth}
        />
      )}
    </Group>
  )
}
