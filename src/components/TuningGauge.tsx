import Colors from "@/colors"
import { Circle, Group, Line, Paint } from "@shopify/react-native-skia"
import { useWindowDimensions } from "react-native"

export const TuningGauge = ({
  positionY,
  gaugeDeviation,
  gaugeColor,
  gaugeWidth,
}: {
  positionY: number
  gaugeDeviation: number | undefined
  gaugeColor: string
  gaugeWidth: number
}) => {
  const { width } = useWindowDimensions()
  const gaugeRadius = gaugeWidth / 2 + 2
  const gaugeX = (width / 2) * (1 + (gaugeDeviation ?? 0))

  return (
    <Group transform={[{ translateY: positionY }]}>
      {/* Grey background line */}
      <Line
        p1={{ x: gaugeWidth / 2, y: 0 }}
        p2={{ x: width - gaugeWidth / 2, y: 0 }}
        style="stroke"
        strokeWidth={gaugeWidth}
        color={Colors.secondary}
        strokeCap={"round"}
      />
      {/* Moving colored bar */}
      <Line
        p1={{ x: width / 2, y: 0 }}
        p2={{ x: gaugeX, y: 0 }}
        style="stroke"
        strokeWidth={gaugeWidth}
        color={gaugeColor}
        strokeCap={"butt"}
      />
      {/* Moving circle */}
      <Circle cx={gaugeX} cy={0} r={gaugeRadius}>
        <Paint style="fill" color={gaugeColor} />
        <Paint style="stroke" color={Colors.primary} strokeWidth={3} />
      </Circle>
      {/* Center reference line */}
      <Line
        p1={{ x: width / 2, y: -gaugeRadius }}
        p2={{ x: width / 2, y: gaugeRadius }}
        style="stroke"
        strokeWidth={1}
        color={Colors.primary}
      />
    </Group>
  )
}
