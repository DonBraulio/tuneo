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

import { PADDING, COLORS, getGraph, arrayToPath } from "@/Model"
import { getYForX } from "@/Math"
import { Cursor } from "@/components/Cursor"
import { Selection } from "@/components/Selection"
import { Label } from "@/components/Label"
import { useGraphTouchHandler } from "@/components/useGraphTouchHandler"

import DSPModule from "@/../specs/NativeDSPModule"

const touchableCursorSize = 80

// Keep this in sync with NativeDSPModule.cpp
const BUF_SIZE = 1024

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

  const test = useMemo(() => {
    const CYCLES = 500
    const sineWave: number[] = []
    for (let i = 0; i < BUF_SIZE; i++) {
      sineWave[i] = Math.sin((2 * Math.PI * CYCLES * i) / BUF_SIZE)
    }
    return sineWave
  }, [])

  const fourier = useMemo(() => {
    console.log("Calling fft")
    try {
      const fft = DSPModule.fft(test)
      console.log("Finished fft")
      return fft
    } catch (e: unknown) {
      console.log(`Exception caught: ${e}`)
      return []
    }
  }, [test])

  // animation value to transition from one graph to the next
  const transition = useSharedValue(0)

  // indicices of the current and next graphs
  const state = useSharedValue({
    next: 0,
    current: 0,
  })

  // path to display
  const path0 = useMemo(() => arrayToPath(test, width, height), [test])
  const path1 = useMemo(() => arrayToPath(fourier, width, height), [fourier])
  const path = useDerivedValue(() => {
    const { current, next } = state.value
    const start = current == 0 ? path0 : path1
    const end = next == 0 ? path0 : path1
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
  const dt = 1000 // ms
  const inter = setInterval(() => {
    // Toggle from 0 to 1
    const next = state.value.current === 0 ? 1 : 0
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
          <Label text={DSPModule.reverseString("Em")} width={width} height={height} />
          <Group transform={[{ translateY }]}>
            <Path style="stroke" path={path} strokeWidth={4} strokeJoin="round" strokeCap="round">
              <LinearGradient start={vec(0, 0)} end={vec(width, 0)} colors={COLORS} />
            </Path>
            <Cursor x={x} y={y} width={width} />
          </Group>
        </Canvas>
        <Selection graphs={graphs} state={state} transition={transition} />
        <GestureDetector gesture={gesture}>
          <Animated.View style={style} />
        </GestureDetector>
      </View>
    </ScrollView>
  )
}
