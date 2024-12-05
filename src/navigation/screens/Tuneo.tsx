import React, { useMemo } from "react"
import { View, StyleSheet, useWindowDimensions } from "react-native"
import { Canvas, Path, Group, LinearGradient, vec } from "@shopify/react-native-skia"
import Animated, {
  Easing,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated"
import { GestureDetector, ScrollView } from "react-native-gesture-handler"

import { PADDING, COLORS, getGraph } from "@/Model"
import { getYForX } from "@/Math"
import { Cursor } from "@/components/Cursor"
import { Selection } from "@/components/Selection"
import { List } from "@/components/List"
import { Label } from "@/components/Label"
import { useGraphTouchHandler } from "@/components/useGraphTouchHandler"

const touchableCursorSize = 80

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#1F1D2B",
  },
})

export const Tuneo = () => {
  const window = useWindowDimensions()
  const { width } = window
  const height = Math.min(window.width, window.height) / 2
  const translateY = height + PADDING
  const graphs = useMemo(() => getGraph(width, height), [width, height])
  // animation value to transition from one graph to the next
  const transition = useSharedValue(0)
  // indicices of the current and next graphs
  const state = useSharedValue({
    next: 0,
    current: 0,
  })
  // path to display
  const path = useDerivedValue(() => {
    const { current, next } = state.value
    const start = graphs[current].data.path
    const end = graphs[next].data.path
    return end.interpolate(start, transition.value)!
  })
  // x and y values of the cursor
  const x = useSharedValue(0)
  const y = useDerivedValue(() => getYForX(path.value.toCmds(), x.value))
  const gesture = useGraphTouchHandler(x, width)
  const style = useAnimatedStyle(() => {
    return {
      position: "absolute",
      width: touchableCursorSize,
      height: touchableCursorSize,
      left: x.value - touchableCursorSize / 2,
      top: translateY + y.value - touchableCursorSize / 2,
    }
  })

  // Animate plots automatically
  const dt = 50 // ms
  const inter = setInterval(() => {
    const next = (state.value.current + 1) % graphs.length
    state.value = { current: state.value.next, next }
    transition.value = 0
    transition.value = withTiming(1, {
      duration: dt,
      easing: Easing.inOut(Easing.quad),
    })
  }, dt)
  // Stop animation after 10 secs
  setTimeout(() => {
    clearInterval(inter)
  }, 10000)

  return (
    <ScrollView style={styles.container}>
      <View>
        <Canvas style={{ width, height: 2 * height + 30 }}>
          <Label state={state} y={y} graphs={graphs} width={width} height={height} />
          <Group transform={[{ translateY }]}>
            <Path style="stroke" path={path} strokeWidth={4} strokeJoin="round" strokeCap="round">
              <LinearGradient start={vec(0, 0)} end={vec(width, 0)} colors={COLORS} />
            </Path>
            <Cursor x={x} y={y} width={width} />
          </Group>
        </Canvas>
        <GestureDetector gesture={gesture}>
          <Animated.View style={style} />
        </GestureDetector>
      </View>
      <Selection state={state} transition={transition} graphs={graphs} />
      <List />
    </ScrollView>
  )
}
