import React, { useEffect, useMemo, useState } from "react"
import { View, StyleSheet, useWindowDimensions, Alert, PermissionsAndroid } from "react-native"
import {
  Canvas,
  Path,
  Group,
  Circle,
  Text,
  useFont,
  Line,
  Paint,
  Rect,
  RoundedRect,
  TextAlign,
  useFonts,
  Skia,
  Paragraph,
  TextHeightBehavior,
} from "@shopify/react-native-skia"
import { ScrollView } from "react-native-gesture-handler"

import DSPModule from "@/../specs/NativeDSPModule"
import MicrophoneStreamModule from "@/../modules/microphone-stream"
import { AudioModule } from "expo-audio"
import Colors from "@/Colors"
import {
  getFrequencyFromNote,
  getNearestGuitarString,
  getNoteFromFrequency,
  getSineOfFrequency,
  GUITAR_STRING_NOTES,
} from "@/MusicalNotes"
import { getWaveformPath } from "@/Math"
import MovingGrid from "@/components/MovingGrid"

// Keep this in sync with NativeDSPModule.cpp
const BUF_SIZE_MICRO = MicrophoneStreamModule.BUFFER_SIZE
const BUF_SIZE = DSPModule.getInputBufSize()
if (BUF_SIZE !== BUF_SIZE_MICRO) {
  throw Error("Buffer sizes don't match")
}

const TEST_MODE = false

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
  const [frameIdx, setFrameIdx] = useState(0)

  // TODO: get from hw
  const sampleRate = 44100

  // Microphone audio buffer, initialized with 0
  const [audio, setAudio] = useState<number[]>(new Array<number>(BUF_SIZE).fill(0))

  const fontMgr = useFonts({
    Roboto: [
      require("@/../assets/Roboto-Regular.ttf"),
      require("@/../assets/Roboto-Medium.ttf"),
      require("@/../assets/Roboto-Bold.ttf"),
      require("@/../assets/Roboto-Italic.ttf"),
    ],
  })

  const noteFontSize = 64

  // For test mode
  const [testIdx, setTestIdx] = useState(0)

  // Request recording permission
  useEffect(() => {
    console.log(`Buffer size: ${BUF_SIZE}`)
    ;(async () => {
      const status = await AudioModule.requestRecordingPermissionsAsync()
      if (!status.granted) {
        Alert.alert("Permission to access microphone was denied")
      }
    })()
  }, [])

  // Audio readings from microphone or test signals
  useEffect(() => {
    if (TEST_MODE) {
      // Test frequency is a sawtooth with sinusoidal ripple
      const progress = (testIdx % 2000) / 2000 // linear increase frequency
      const center_freq = TEST_LOWEST + (TEST_HIGHEST - TEST_LOWEST) * progress
      const amp_freq = (TEST_HIGHEST - TEST_LOWEST) / 200
      const freq = center_freq + amp_freq * Math.sin((2 * Math.PI * testIdx) / 50)
      setAudio(getSineOfFrequency(freq, sampleRate, BUF_SIZE))
      const timeout = setTimeout(() => {
        setTestIdx(testIdx + 1)
      }, 30)
      return () => clearTimeout(timeout)
    } else {
      console.log(`Start microphone buffer (BUFFER: ${BUF_SIZE})`)
      MicrophoneStreamModule.startRecording((samples) => {
        setAudio(samples)
      })
    }
  }, [testIdx])

  // frameIdx forces grid to move even if pitch didn't change
  useEffect(() => {
    setFrameIdx(frameIdx + 1)
  }, [audio])

  const alignedAudio = useMemo(() => {
    /* Triggering algorithm:
      Purpose: align the audio segments similar to an oscilloscope.
      How: find highest peak within 1/4 of the signal and set that as x=0.
    */
    const searchLength = Math.floor(BUF_SIZE / 4)

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

  // Nearest guitar string
  const stringIdx = useMemo(() => getNearestGuitarString(pitch), [pitch])
  const nearestString = useMemo(() => GUITAR_STRING_NOTES[stringIdx], [stringIdx])

  // Frequency of the nearest guitar string
  const refFreq = useMemo(() => getFrequencyFromNote(nearestString), [nearestString])

  // Waveform drawing
  const waveform = useMemo(
    () => getWaveformPath(alignedAudio, width, height / 5, 100),
    [alignedAudio]
  )

  const gaugeRadius = 12
  const pitchDeviation = Math.atan((20 * (pitch - refFreq)) / refFreq) / (Math.PI / 2)
  const gaugeX = (width / 2) * (1 + pitchDeviation)
  const gaugeColor = Colors.getColorFromPitchDeviation(pitchDeviation)
  const barWidth = 2 * gaugeRadius - 2
  // Box size for string note text
  const boxWidth = 80
  const boxHeight = 90
  const sideTxtWidth = 85

  const noteText = useMemo(() => {
    if (!fontMgr) return null

    const text = pitch > 0 && note ? nearestString.name : "-"
    const textStyle = {
      fontFamilies: ["Roboto"],
      fontSize: noteFontSize,
      fontStyle: { weight: 600 },
      color: Skia.Color(Colors.primary),
    }
    return Skia.ParagraphBuilder.Make({ textAlign: TextAlign.Center }, fontMgr)
      .pushStyle(textStyle)
      .addText(text)
      .pop()
      .build()
  }, [fontMgr, pitch, note, nearestString])

  const refText = refFreq.toFixed(1)
  const readText = pitch.toFixed(1)

  const refFreqText = useMemo(() => {
    if (!fontMgr) return null

    const text = refFreq ? `${refText}Hz` : `No tone`
    const textStyle = {
      fontFamilies: ["Roboto"],
      fontSize: 14,
      fontStyle: { weight: 500 },
      color: Skia.Color(Colors.primary),
    }
    return Skia.ParagraphBuilder.Make({ textAlign: TextAlign.Center }, fontMgr)
      .pushStyle(textStyle)
      .addText(text)
      .pop()
      .build()
  }, [fontMgr, refText, refFreq])

  const freqText = useMemo(() => {
    if (!fontMgr || !refFreq || refText === readText) return null

    // Show << or >> characters next to frequency read
    let prevText = " "
    let postText = " "
    if (pitchDeviation > 0) prevText += "<"
    if (pitchDeviation > 0.2) prevText += "<"
    if (pitchDeviation < 0) postText += ">"
    if (pitchDeviation < -0.2) postText += ">"
    const diffTxt = Math.abs(pitch - refFreq).toFixed(1)
    const text = `${prevText} ${pitchDeviation > 0 ? "+" : "-"}${diffTxt}Hz ${postText}`

    const textStyle = {
      fontFamilies: ["Roboto"],
      fontSize: 14,
      fontStyle: { weight: 500 },
      color: Skia.Color(gaugeColor),
    }
    return Skia.ParagraphBuilder.Make({ textAlign: TextAlign.Center }, fontMgr)
      .pushStyle(textStyle)
      .addText(text)
      .pop()
      .build()
  }, [fontMgr, refFreq, refText, readText, pitchDeviation])

  const movingGridY = height * 0.55

  return (
    <ScrollView style={styles.container}>
      <View>
        <Canvas style={{ width, height }}>
          {/* Waveform */}
          <Group transform={[{ translateY: height / 6 }]}>
            <Path
              style="stroke"
              path={waveform}
              strokeWidth={2}
              strokeJoin="round"
              strokeCap="round"
              color={Colors.secondary}
            />
          </Group>

          {/* Debug text 
          <Group transform={[{ translateY: height / 3 }]}>
            <Text
              text={
                pitch > 0 && note
                  ? `${6 - stringIdx}-th ${nearestString.name}${
                      nearestString.octave
                    } (${refFreq.toFixed(0)}Hz) ${pitch.toFixed(0)}Hz`
                  : "No tone"
              }
              color={Colors.primary}
              font={pitchFont}
              x={width / 10}
            />
          </Group> */}

          {/* Note text */}
          <Group transform={[{ translateY: movingGridY - boxHeight - barWidth - 10 }]}>
            <RoundedRect
              x={width / 2 - boxWidth / 2}
              y={0}
              height={boxHeight}
              width={boxWidth}
              r={10}
              color={Colors.secondary}
            />
            <Paragraph paragraph={noteText} x={width / 2 - boxWidth / 2} y={0} width={boxWidth} />
            <Paragraph
              paragraph={refFreqText}
              x={width / 2 - boxWidth / 2}
              y={boxHeight - 18}
              width={boxWidth}
            />
            {readText !== refText && (
              <Paragraph
                paragraph={freqText}
                x={
                  pitchDeviation > 0
                    ? width / 2 + sideTxtWidth / 2
                    : width / 2 - (3 * sideTxtWidth) / 2
                }
                y={boxHeight - 18}
                width={sideTxtWidth}
              />
            )}
          </Group>

          {/* Grid */}
          <Group transform={[{ translateY: movingGridY }]}>
            <MovingGrid frameIdx={frameIdx} deviation={pitchDeviation} note={note} />
          </Group>

          {/* Gauge bar */}
          <Group transform={[{ translateY: movingGridY - gaugeRadius }]}>
            {/* Grey background line */}
            <Line
              p1={{ x: 0, y: 0 }}
              p2={{ x: width, y: 0 }}
              style="stroke"
              strokeWidth={barWidth}
              color={Colors.secondary}
            />
            {/* Moving colored bar */}
            <Line
              p1={{ x: width / 2, y: 0 }}
              p2={{ x: gaugeX, y: 0 }}
              style="stroke"
              strokeWidth={barWidth}
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
        </Canvas>
      </View>
    </ScrollView>
  )
}
