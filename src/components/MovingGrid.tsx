import React, { useEffect, useMemo, useState } from "react"
import { useSharedValue, useDerivedValue, Easing, cancelAnimation } from "react-native-reanimated"
import { withTiming, withRepeat } from "react-native-reanimated"
import { Rect, Line, LinearGradient, Group, vec, Points, Mask } from "@shopify/react-native-skia"
import { useWindowDimensions } from "react-native"
import Colors from "@/colors"
import { useConfigStore } from "@/configHooks"

const GRID_COLOR = Colors.bgInactive
const BACKGROUND_GRADIENT_START = Colors.bgActive
const BACKGROUND_GRADIENT_END = Colors.bgInactive
const GRID_SPACING = 30
const GRID_SPEED = 60 // Pixels per second
const MISSING_NOTE = -2

const MovingGrid = ({
  positionY,
  pitchId,
  deviation,
  pointsPerSec,
}: {
  positionY: number
  pitchId: number
  deviation?: number
  pointsPerSec: number
}) => {
  const { width, height } = useWindowDimensions()
  const graphics = useConfigStore((state) => state.graphics)
  const boxHeight = useMemo(() => height / 4, [height])
  const pointSpacing = useMemo(() => GRID_SPEED / pointsPerSec, [pointsPerSec])
  const maxHistory = useMemo(() => Math.floor(boxHeight / pointSpacing), [boxHeight, pointSpacing])

  // Circular queues to store pitch history
  const [history, setHistory] = useState(() => new Array<number>(maxHistory).fill(0))
  const [timestamps, setTimestamps] = useState(() => new Array<number>(maxHistory).fill(0))
  // Current position in the circular queues
  const currentIdx = useMemo(() => pitchId % maxHistory, [pitchId, maxHistory])
  // Number of valid entries in circular queues
  const [historyLength, setHistoryLength] = useState(0)

  // Add a new deviation to history
  useEffect(() => {
    // Add deviation value to history in currentIdx
    setHistory((h) => {
      // Copy and add deviation to history array
      const newH = [...h]
      newH[currentIdx] = deviation ?? MISSING_NOTE
      return newH
    })
    setTimestamps((t) => {
      // Copy and add timestamp
      const newT = [...t]
      newT[currentIdx] = Date.now()
      return newT
    })
    setHistoryLength((prevLength) => Math.min(prevLength + 1, maxHistory))
  }, [deviation, currentIdx, maxHistory])

  const historyPoints = useMemo(() => {
    const points = new Array(historyLength)
    let y = 0
    for (let i = 0; i < historyLength; i++) {
      // start drawing from last point (top)
      const idx = (currentIdx - 1 - i + maxHistory) % maxHistory
      // Horizontal displacement
      const x = ((1 + history[idx]) * width) / 2

      // Vertical displacement
      const next_idx = (currentIdx - i + maxHistory) % maxHistory
      const dt = i === 0 ? 0 : (timestamps[next_idx] - timestamps[idx]) / 1000
      y = y + GRID_SPEED * dt
      points[i] = vec(x, y)
      // console.log(`Point x=${x}  y=${y} dt=${dt}`)
    }
    return points
  }, [history, currentIdx, timestamps, historyLength, width, maxHistory])

  // Vertical offset for animating grid lines
  const translateY = useSharedValue(0)

  // Animate the verticalOffset value
  useEffect(() => {
    cancelAnimation(translateY)

    translateY.value = withRepeat(
      withTiming(GRID_SPACING, {
        duration: (1000 * GRID_SPACING) / GRID_SPEED,
        easing: Easing.linear,
      }),
      -1
    )
    return () => cancelAnimation(translateY)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
  }, [boxHeight, width])

  const transform = useDerivedValue(() => {
    return [{ translateY: translateY.value }]
  }, [translateY])

  /*
  Points in pitch history are colored with linear gradients.
  Since gauge colors are nonlinear with gaugeDeviation, use 4 linear gradients to
  interpolate at:
  gaugeDeviation = [-1, -0.2, 0, 0.2, 1]
  x = [0, 0.4, 0.5, 0.6, 1]  // Correspond to gaugeDeviation above
  The gauge color is very nonlinear near the center.
  */
  const tr = Math.floor
  const pitchPoints = 0.2 // Pitches corresponding to x=0.4 and x=0.6
  const pts = [0, tr(width * 0.4), tr(width * 0.5), tr(width * 0.6), width]

  return (
    <Group transform={[{ translateY: positionY }]}>
      {/* Draw background */}
      <Rect x={0} y={0} width={width} height={boxHeight} />
      <LinearGradient
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: boxHeight }}
        colors={[BACKGROUND_GRADIENT_START, BACKGROUND_GRADIENT_END]}
      />

      {/* Horizontal grid lines */}
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

      {/* Vertical grid lines */}
      <Line
        p1={{ x: width / 2, y: 0 }}
        p2={{ x: width / 2, y: boxHeight }}
        color={GRID_COLOR}
        strokeWidth={1}
        key={"v1"}
      />
      <Line
        p1={{ x: pts[1], y: 0 }}
        p2={{ x: pts[1], y: boxHeight }}
        color={GRID_COLOR}
        strokeWidth={1}
        key={"v2"}
      />
      <Line
        p1={{ x: pts[3], y: 0 }}
        p2={{ x: pts[3], y: boxHeight }}
        color={GRID_COLOR}
        strokeWidth={1}
        key={"v3"}
      />

      {/* <Path path={pitchHistoryPath} style="stroke" color={Colors.secondary} /> */}
      <Mask
        mask={
          <Points
            points={historyPoints}
            mode="points"
            color={Colors.primary}
            strokeWidth={3}
            strokeCap={"round"}
          />
        }
      >
        {graphics === "low" ? (
          <Rect
            x={pts[0]}
            y={0}
            width={width}
            height={boxHeight}
            style="fill"
            color={Colors.primary}
          />
        ) : (
          <>
            <Rect x={pts[0]} y={0} width={pts[1]} height={boxHeight}>
              <LinearGradient
                start={{ x: pts[0], y: 0 }}
                end={{ x: pts[1], y: 0 }}
                colors={[Colors.low, Colors.getColorFromGaugeDeviation(-pitchPoints)]}
              />
            </Rect>
            <Rect x={pts[1]} y={0} width={pts[2] - pts[1]} height={boxHeight}>
              <LinearGradient
                start={{ x: pts[1], y: 0 }}
                end={{ x: pts[2], y: 0 }}
                colors={[Colors.getColorFromGaugeDeviation(-pitchPoints), Colors.center]}
              />
            </Rect>
            <Rect x={pts[2]} y={0} width={pts[3] - pts[2]} height={boxHeight}>
              <LinearGradient
                start={{ x: pts[2], y: 0 }}
                end={{ x: pts[3], y: 0 }}
                colors={[Colors.center, Colors.getColorFromGaugeDeviation(pitchPoints)]}
              />
            </Rect>
            <Rect x={pts[3]} y={0} width={pts[4] - pts[3]} height={boxHeight}>
              <LinearGradient
                start={{ x: pts[3], y: 0 }}
                end={{ x: pts[4], y: 0 }}
                colors={[Colors.getColorFromGaugeDeviation(pitchPoints), Colors.high]}
              />
            </Rect>
          </>
        )}
      </Mask>
    </Group>
  )
}

export default MovingGrid
