import React, { useEffect, useMemo, useState } from "react"
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
  Path,
  Circle,
  vec,
  Points,
} from "@shopify/react-native-skia"
import { useWindowDimensions } from "react-native"
import { pitchPath } from "@/Math"
import Colors from "@/Colors"

const GRID_COLOR = "#505050" // Light grey
const BACKGROUND_GRADIENT_START = "#000000" // Black
const BACKGROUND_GRADIENT_END = "#3a3a3a" // Dark grey
const GRID_SPACING = 30
const GRID_SPEED = 30 // Pixels per second
const MAX_HISTORY = 900

const MovingGrid = ({ pitch }: { pitch: number }) => {
  const { width, height } = useWindowDimensions()
  const boxHeight = useMemo(() => height / 2, [height])
  const [pitchHistory, setPitchHistory] = useState(new Array<number>(MAX_HISTORY).fill(0))
  const [timestamps, setTimestamps] = useState(new Array<number>(MAX_HISTORY).fill(0))
  const [pitchIdx, setPitchIdx] = useState(0)
  const [historyLength, setHistoryLength] = useState(0)

  // Add a new pitch to pitchHistory
  useEffect(() => {
    // Writes the new pitch in pitchIdx
    const newHistory = [...pitchHistory]
    newHistory[pitchIdx] = pitch
    setPitchHistory(newHistory)
    const newTimestamps = [...timestamps]
    newTimestamps[pitchIdx] = Date.now()
    setTimestamps(newTimestamps)
    setPitchIdx((pitchIdx + 1) % MAX_HISTORY)
    setHistoryLength(Math.min(historyLength + 1, MAX_HISTORY))
  }, [pitch])

  // const pitchHistoryPath = useMemo(
  //   () => pitchPath(pitchHistory, pitchIdx, historyLength, width, boxHeight, MAX_HISTORY),
  //   [pitchHistory, pitchIdx, historyLength]
  // )
  const pitchPoints = useMemo(() => {
    const points = new Array(historyLength)
    let y = 0
    for (let i = 0; i < historyLength; i++) {
      // start drawing from last point (top)
      const idx = (pitchIdx - 1 - i + MAX_HISTORY) % MAX_HISTORY
      // Horizontal displacement
      const x = ((1 + pitchHistory[idx]) * width) / 2

      // Vertical displacement
      const next_idx = (pitchIdx - i + MAX_HISTORY) % MAX_HISTORY
      const dt = i == 0 ? 0 : (timestamps[next_idx] - timestamps[idx]) / 1000
      y = y + GRID_SPEED * dt
      points[i] = vec(x, y)
      // console.log(`Point x=${x}  y=${y} dt=${dt}`)
    }
    return points
  }, [pitchHistory, pitchIdx, timestamps, historyLength])

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
    for (let y = 0; y < boxHeight; y += GRID_SPACING) {
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

      {/* <Path path={pitchHistoryPath} style="stroke" color={Colors.secondary} /> */}
      <Points points={pitchPoints} mode="points" color={Colors.primary} strokeWidth={1} />
    </Group>
  )
}

export default MovingGrid
