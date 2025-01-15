import React, { useEffect, useMemo } from "react"
import {
  useSharedValue,
  useDerivedValue,
  Easing,
  withTiming,
  withRepeat,
} from "react-native-reanimated"
import {
  Canvas,
  Paint,
  Rect,
  Line,
  useCanvasRef,
  LinearGradient,
  Group,
} from "@shopify/react-native-skia"
import { useWindowDimensions } from "react-native"

const GRID_COLOR = "#505050" // Light grey
const BACKGROUND_GRADIENT_START = "#000000" // Black
const BACKGROUND_GRADIENT_END = "#1a1a1a" // Dark grey
const GRID_SPACING = 30
const GRID_SPEED = 30 // Pixels per second

const MovingGrid = () => {
  const { width, height } = useWindowDimensions()
  const boxHeight = useMemo(() => height / 2, [height])

  // Vertical offset for animating grid lines
  const translateY = useSharedValue(0)

  // Animate the verticalOffset value
  useEffect(() => {
    translateY.value = withRepeat(
      withTiming(GRID_SPACING, {
        duration: (1000 * GRID_SPACING) / GRID_SPEED,
        easing: Easing.linear,
      }),
      -1
    )
  }, [translateY])

  // Calculate grid lines dynamically
  const horizontalLines = useMemo(() => {
    const lines = []
    for (let y = -GRID_SPACING; y < boxHeight; y += GRID_SPACING) {
      lines.push({
        start: { x: 0, y },
        end: { x: width, y },
      })
    }
    return lines
  }, [])

  const transform = useDerivedValue(() => {
    return [{ translateY: translateY.value }]
  }, [translateY])

  return (
    <Group transform={[{ translateY: boxHeight }]}>
      {/* Draw background */}
      <Rect x={0} y={0} width={width} height={boxHeight} />
      <LinearGradient
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: boxHeight }}
        colors={[BACKGROUND_GRADIENT_START, BACKGROUND_GRADIENT_END]}
      />

      {/* Draw grid */}
      <Group transform={transform}>
        {horizontalLines.map((line, index) => (
          <Line
            key={`line-${index}`}
            p1={line.start}
            p2={line.end}
            strokeWidth={1}
            color={GRID_COLOR}
          />
        ))}
      </Group>
    </Group>
  )
}

export default MovingGrid
