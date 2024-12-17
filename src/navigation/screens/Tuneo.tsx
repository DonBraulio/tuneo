import React, { useEffect, useMemo, useState } from "react"
import { View, StyleSheet, useWindowDimensions, Alert, PermissionsAndroid } from "react-native"
import {
  Canvas,
  Path,
  Group,
  LinearGradient,
  vec,
  Circle,
  Paint,
  Text,
  useFont,
} from "@shopify/react-native-skia"
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
import MicrophoneStreamModule from "@/../modules/microphone-stream"
import { AudioModule } from "expo-audio"
import Colors from "@/Colors"

const touchableCursorSize = 80

const sfMono = require("@/assets/SF-Mono-Medium.otf")

// Keep this in sync with NativeDSPModule.cpp
const BUF_SIZE = MicrophoneStreamModule.BUFFER_SIZE
const FFT_IN_SIZE = DSPModule.getInputBufSize()
const FFT_OUT_SIZE = DSPModule.getInputBufSize()

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.bgInactive,
  },
})

export const Tuneo = () => {
  const window = useWindowDimensions()
  const { width, height } = window

  // Microphone audio buffer, initialized with 0
  const [audio, setAudio] = useState<number[]>(new Array<number>(BUF_SIZE).fill(0))

  useEffect(() => {
    console.log(`Microphone buffer: ${BUF_SIZE}`)
    console.log(`DSP buffers: IN[${FFT_IN_SIZE}] -> OUT[${FFT_OUT_SIZE}]`)
    console.log("Checking recording permissions")
    ;(async () => {
      const status = await AudioModule.requestRecordingPermissionsAsync()
      if (!status.granted) {
        Alert.alert("Permission to access microphone was denied")
      }
    })()
  }, [])

  useEffect(() => {
    console.log(`Start microphone buffer (BUFFER: ${BUF_SIZE})`)
    MicrophoneStreamModule.startRecording((samples) => {
      setAudio(samples)
    })
  }, [])

  // setInterval(() => {
  //   console.log(`Max. audio sample: ${Math.max(...audio)}`)
  // }, 1000)

  //const graphs = useMemo(() => getGraph(width, height), [width, height])

  // const test = useMemo(() => {
  //   const CYCLES = 500
  //   const sineWave: number[] = []
  //   for (let i = 0; i < BUF_SIZE; i++) {
  //     sineWave[i] = Math.sin((2 * Math.PI * CYCLES * i) / BUF_SIZE)
  //   }
  //   return sineWave
  // }, [])

  // const fourier = useMemo(() => {
  //   try {
  //     const fft = DSPModule.fft(audio)
  //     return fft
  //   } catch (e: unknown) {
  //     console.log(`Exception caught: ${e}`)
  //     return []
  //   }
  // }, [audio])

  const pitch = useMemo(() => {
    // TODO: FIX SAMPLE RATE DEPENDING ON HW
    return DSPModule.pitch(audio, 44100)
  }, [audio])

  // animation value to transition from one graph to the next
  const transition = useSharedValue(0)

  // indicices of the current and next graphs
  const state = useSharedValue({
    next: 0,
    current: 0,
  })

  // path to display
  // const path0 = useMemo(() => arrayToPath(test, width, height), [test])
  // const path1 = useMemo(() => arrayToPath(fourier, width, height), [fourier])
  // const path = useDerivedValue(() => {
  //   const { current, next } = state.value
  //   const start = current == 0 ? path0 : path1
  //   const end = next == 0 ? path0 : path1
  //   return end.interpolate(start, transition.value)!
  // })

  const path = useMemo(() => arrayToPath(audio, width, height), [audio])
  // const path = useMemo(() => arrayToPath(fourier, width, height), [fourier])
  // const path = useMemo(() => arrayToPath(test, width, height), [test])

  // x and y values of the cursor
  // const x = useSharedValue(0)
  // const y = useDerivedValue(() => getYForX(path.value.toCmds(), x.value))
  // const gesture = useGraphTouchHandler(x, width)
  // const style = useAnimatedStyle(() => {
  //   return {
  //     position: "absolute",
  //     width: touchableCursorSize,
  //     height: touchableCursorSize,
  //     left: x.value - touchableCursorSize / 2,
  //     top: translateY + y.value - touchableCursorSize / 2,
  //   }
  // })

  // // Animate plots automatically
  // const dt = 1000 // ms
  // const inter = setInterval(() => {
  //   // Toggle from 0 to 1
  //   const next = state.value.current === 0 ? 1 : 0
  //   state.value = { current: state.value.next, next }
  //   transition.value = 0
  //   transition.value = withTiming(1, {
  //     duration: dt,
  //     easing: Easing.inOut(Easing.quad),
  //   })
  // }, dt)
  // // Stop animation after 10 secs
  // setTimeout(() => {
  //   clearInterval(inter)
  // }, 10000)
  const centerY = height * 0.75
  const centerX = width / 2
  const radius = height

  // TODO: auto detect strings
  const refTone = 110 // Frequency of A4
  const angleRads = Math.atan((100 * (pitch - refTone)) / refTone) / 4
  const gaugeX = centerX - radius * Math.sin(angleRads)
  const gaugeY = centerY - radius * Math.cos(angleRads)
  const fontSize = 32
  const pitchFont = useFont(sfMono, 32)

  return (
    <ScrollView style={styles.container}>
      <View>
        <Canvas style={{ width, height }}>
          <Group transform={[{ translateY: height / 8 }]}>
            <Text
              text={pitch > 0 ? `${pitch.toFixed(0)}Hz` : "No tone"}
              color={Colors.primary}
              font={pitchFont}
              x={width / 2}
            />
            <Path
              style="stroke"
              path={path}
              strokeWidth={2}
              strokeJoin="round"
              strokeCap="round"
              color={Colors.secondary}
              end={0.95}
            />
          </Group>
          <Group transform={[{ translateY: height / 2 }]}>
            <Circle cy={centerY} cx={centerX} r={radius}>
              <Paint style="stroke" strokeWidth={4} color={Colors.secondary} />
              <Paint color={Colors.bgActive} />
            </Circle>
            <Path
              path={`M ${centerX} ${centerY} L ${gaugeX} ${gaugeY} Z`}
              style="stroke"
              strokeWidth={2}
              strokeJoin="round"
              color={Colors.primary}
            />
          </Group>
        </Canvas>
        {/*<Selection graphs={graphs} state={state} transition={transition} />
        <GestureDetector gesture={gesture}>
          <Animated.View style={style} />
        </GestureDetector>
        */}
      </View>
    </ScrollView>
  )
}
