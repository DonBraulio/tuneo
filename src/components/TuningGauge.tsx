import Colors from "@/colors"
import { Circle, Group, Line, Paint } from "@shopify/react-native-skia"
import { useEffect } from "react"
import { useWindowDimensions } from "react-native"
import {
  cancelAnimation,
  useSharedValue,
  withTiming,
  useDerivedValue,
} from "react-native-reanimated"

export const TuningGauge = ({
  positionY,
  gaugeDeviation,
  gaugeColor,
  gaugeWidth,
  framesPerSec,
}: {
  positionY: number
  gaugeDeviation: number | undefined
  gaugeColor: string
  gaugeWidth: number
  framesPerSec: number
}) => {
  const { width } = useWindowDimensions()
  const gaugeRadius = gaugeWidth / 2 + 2

  const gaugeX = useSharedValue(0)

  useEffect(() => {
    const newVal = (width / 2) * (1 + (gaugeDeviation ?? 0))
    gaugeX.value = withTiming(newVal, { duration: 1000 / framesPerSec })

    return () => cancelAnimation(gaugeX)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gaugeDeviation, framesPerSec, width])

  const gaugeXY = useDerivedValue(() => {
    return { x: gaugeX.value, y: 0 }
  }, [gaugeX])

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
        p2={gaugeXY}
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
