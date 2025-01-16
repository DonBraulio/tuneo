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
  Line,
} from "@shopify/react-native-skia"
import Animated, {
  Easing,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated"
import { ScrollView } from "react-native-gesture-handler"

import { arrayToPath } from "@/Model"
import DSPModule from "@/../specs/NativeDSPModule"
// import MicrophoneStreamModule from "@/../modules/microphone-stream"
// import { AudioModule } from "expo-audio"
import Colors from "@/Colors"
import { getFrequencyFromNote, getNoteFromFrequency, getSineOfFrequency } from "@/MusicalNotes"
import { waveformPath } from "@/Math"
import MovingGrid from "@/components/MovingGrid"

const sfMono = require("@/assets/SF-Mono-Medium.otf")

// Keep this in sync with NativeDSPModule.cpp
// const BUF_SIZE = MicrophoneStreamModule.BUFFER_SIZE
const BUF_SIZE = DSPModule.getInputBufSize()
// const FFT_IN_SIZE = DSPModule.getInputBufSize()
// const FFT_OUT_SIZE = DSPModule.getInputBufSize()

const TEST_MODE = true

// See: https://mixbutton.com/mixing-articles/music-note-to-frequency-chart/
const TEST_TONES: Array<{ title: string; freq: number }> = [
  { title: "A0", freq: 27.5 }, // Piano lowest
  { title: "B0", freq: 30.87 }, // 5 string bass lowest
  { title: "E1", freq: 41.2 }, // 4 string bass lowest
  { title: "E1+5%", freq: 41.2 * 1.05 },
  { title: "E1-5%", freq: 41.2 * 0.95 },
  { title: "E2", freq: 82.41 }, // Guitar lowest
  { title: "A3", freq: 220.0 },
  { title: "G3", freq: 196.0 }, // Violin's lowest
  { title: "C4", freq: 261.63 }, // Piano middle C
  { title: "G4", freq: 392.0 },
  { title: "A4", freq: 440.0 },
  { title: "A5", freq: 880.0 },
  { title: "C8", freq: 4186.01 }, // Piano's highest
]

const TEST_LOWEST = 80
const TEST_HIGHEST = 500

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.bgInactive,
  },
})

export const Tuneo = () => {
  const window = useWindowDimensions()
  const { width, height } = window

  // TODO: get from hw
  const sampleRate = 44100

  // Microphone audio buffer, initialized with 0
  const [audio, setAudio] = useState<number[]>(new Array<number>(BUF_SIZE).fill(0))

  // For test mode
  const [testIdx, setTestIdx] = useState(0)

  // Request recording permission
  /*
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
  */

  // Audio readings from microphone or test signals
  useEffect(() => {
    if (TEST_MODE) {
      // Test frequency is a sawtooth with sinusoidal ripple
      const progress = (testIdx % 2000) / 2000 // linear increase frequency
      const center_freq = TEST_LOWEST + (TEST_HIGHEST - TEST_LOWEST) * progress
      const amp_freq = (TEST_HIGHEST - TEST_LOWEST) / 100
      const freq = center_freq + amp_freq * Math.sin((2 * Math.PI * testIdx) / 50)
      setAudio(getSineOfFrequency(freq, sampleRate, BUF_SIZE))
      const timeout = setTimeout(() => {
        setTestIdx(testIdx + 1)
      }, 30)
      return () => clearTimeout(timeout)
    } else {
      console.log(`Start microphone buffer (BUFFER: ${BUF_SIZE})`)
      // MicrophoneStreamModule.startRecording((samples) => {
      //   setAudio(samples)
      // })
    }
  }, [testIdx])

  const alignedAudio = useMemo(() => {
    /* Triggering algorithm:
      Purpose: align the audio segments similar to an oscilloscope.
      How: find highest peak within 1/4 of the signal and set that as x=0.
    */
    const searchLength = Math.floor(BUF_SIZE / 4)
    const newLength = BUF_SIZE - searchLength

    // Find peak within 0-searchLength
    let maxValue = 0
    let maxIdx = 0
    for (let idx = 0; idx < searchLength; idx++) {
      if (audio[idx] > maxValue) {
        maxValue = audio[idx]
        maxIdx = idx
      }
    }
    // Return new signal starting at the peak
    return audio.slice(maxIdx, audio.length - searchLength + maxIdx)
  }, [audio])

  // Get frequency of the sound
  const pitch = useMemo(() => {
    // TODO: FIX SAMPLE RATE DEPENDING ON HW
    return DSPModule.pitch(audio, sampleRate)
  }, [audio])

  // Nearest note name and octave
  const note = useMemo(() => getNoteFromFrequency(pitch), [pitch])

  // Frequency of the nearest note
  const refFreq = useMemo(() => getFrequencyFromNote(note), [note])

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

  const path = useMemo(() => waveformPath(alignedAudio, width, height / 5, 100), [alignedAudio])
  // const path = useMemo(() => arrayToPath(audio, width, height), [audio])
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

  const gaugeRadius = 12
  const pitchDeviation = Math.atan((120 * (pitch - refFreq)) / refFreq) / (Math.PI / 2)
  const gaugeX = (width / 2) * (1 + pitchDeviation)
  const pitchFont = useFont(sfMono, 32)

  return (
    <ScrollView style={styles.container}>
      <View>
        <Canvas style={{ width, height }}>
          <Group transform={[{ translateY: height / 8 }]}>
            <Text
              text={
                pitch > 0 && note
                  ? `${note.name}${note.octave} (${refFreq.toFixed(0)}Hz) ${pitch.toFixed(0)}Hz`
                  : "No tone"
              }
              color={Colors.primary}
              font={pitchFont}
              x={width / 10}
            />

            {/* Waveform */}
            <Path
              style="stroke"
              path={path}
              strokeWidth={2}
              strokeJoin="round"
              strokeCap="round"
              color={Colors.secondary}
            />
          </Group>
          <MovingGrid deviation={pitchDeviation} note={note} />
          {/* Gauge */}
          <Group transform={[{ translateY: height * 0.5 - gaugeRadius }]}>
            <Line
              p1={{ x: 0, y: 0 }}
              p2={{ x: width, y: 0 }}
              style="stroke"
              strokeWidth={2 * gaugeRadius - 4}
              color={Colors.secondary}
            />
            <Circle
              cx={gaugeX}
              cy={0}
              r={gaugeRadius}
              style="stroke"
              color={Colors.primary}
              strokeWidth={3}
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
