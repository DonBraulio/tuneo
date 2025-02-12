import React, { useCallback, useEffect, useMemo, useState } from "react"
import { View, useWindowDimensions, Alert } from "react-native"
import { Canvas, Group, Circle, Line, Paint } from "@shopify/react-native-skia"
import { RoundedRect, TextAlign, useFonts, Skia, Paragraph } from "@shopify/react-native-skia"

import DSPModule from "@/../specs/NativeDSPModule"
import MicrophoneStreamModule, { AudioBuffer } from "@/../modules/microphone-stream"
import { AudioModule } from "expo-audio"
import Colors from "@/colors"
import { getTestSignal } from "@/test"
import MovingGrid from "@/components/MovingGrid"
import ConfigButton from "@/components/ConfigButton"
import { useTranslation } from "@/translations"
import { useConfigStore } from "@/config"
import { Chromatic, Guitar, Instrument } from "@/instruments"
import { Waveform } from "@/components/Waveform"
import { Strings } from "@/components/Strings"
import { useParagraphBuilder } from "@/paragraphs"

const TEST_MODE = true

// This is just a preference, may be set differently
const BUF_PER_SEC = MicrophoneStreamModule.BUF_PER_SEC
console.log(`Preferred buffers per second: ${BUF_PER_SEC}`)

export const Tuneo = () => {
  const { width, height } = useWindowDimensions()
  const config = useConfigStore()
  const paragraphs = useParagraphBuilder()

  // Audio buffer
  const [sampleRate, setSampleRate] = useState(0)
  const [audioBuffer, setAudioBuffer] = useState<number[]>([])
  const [bufferId, setBufferId] = useState(0)

  // Get locale texts
  const t = useTranslation()

  // Detected pitch
  const [pitch, setPitch] = useState(-1)

  // Request recording permission
  useEffect(() => {
    ;(async () => {
      const status = await AudioModule.requestRecordingPermissionsAsync()
      if (!status.granted) {
        Alert.alert("Permission to access microphone was denied")
      }
    })()
  }, [])

  // Start microphone recording
  useEffect(() => {
    if (TEST_MODE) return

    // Start microphone
    MicrophoneStreamModule.startRecording()

    // Suscribe to microphone buffer
    const subscriber = MicrophoneStreamModule.addListener(
      "onAudioBuffer",
      (buffer: AudioBuffer) => {
        setAudioBuffer(buffer.samples)
        setBufferId((prevId) => prevId + 1)
      }
    )
    return () => subscriber.remove()
  }, [])

  // Test audio buffers
  useEffect(() => {
    if (!TEST_MODE) return

    const sampleRate = 44100
    const bufSize = sampleRate / BUF_PER_SEC
    setAudioBuffer(getTestSignal(bufferId, sampleRate, bufSize))
    setSampleRate(sampleRate)

    // Trigger for next buffer
    const timeout = setTimeout(() => {
      setBufferId((id) => id + 1)
    }, 1000 / BUF_PER_SEC)
    return () => clearTimeout(timeout)
  }, [bufferId])

  // Get pitch of the audio
  useEffect(() => {
    if (!audioBuffer.length) return

    let sr = sampleRate
    if (!sr) {
      // Assume microphone already configured ()
      sr = MicrophoneStreamModule.getSampleRate()
      console.log(`Setting sample rate to ${sr}Hz`)

      setSampleRate(sr)
    }

    // Set pitch value
    setPitch(DSPModule.pitch(audioBuffer, sr))
  }, [audioBuffer, sampleRate])

  // Selected instrument
  const instrument: Instrument = useMemo(() => {
    switch (config.instrument) {
      case "guitar":
        return new Guitar(config.tuning)
      case "chromatic":
        return new Chromatic(config.tuning)
    }
  }, [config.instrument, config.tuning])

  // Nearest string (reference)
  const nearestString = useMemo(() => instrument.getNearestString(pitch), [pitch, instrument])

  const gaugeRadius = 12
  const pitchDeviation =
    pitch > 0 && nearestString
      ? Math.atan((20 * (pitch - nearestString.freq)) / nearestString.freq) / (Math.PI / 2)
      : undefined
  const gaugeX = (width / 2) * (1 + (pitchDeviation ?? 0))
  const gaugeColor = Colors.getColorFromPitchDeviation(pitchDeviation ?? 0)
  const barWidth = 2 * gaugeRadius - 2
  // Box size for string note text at the center
  const boxWidth = 80
  const boxHeight = 90
  const sideTxtWidth = 85
  const noteFontSize = 54
  const waveformY = 60
  const waveformH = height / 8
  const movingGridY = height * 0.55

  // 6 buttons equally spaced vertically (waveform to gauge)
  const stringsHeight = movingGridY - barWidth - waveformH - waveformY

  // Config button
  const cfgBtnSize = 1.5
  const cfgBtnMargin = 50

  const stringText = nearestString?.freq.toFixed(1)
  const pitchText = pitch.toFixed(1)

  // Show << or >> characters next to frequency read
  const freqDiffTxt = useMemo(() => {
    if (!nearestString || stringText === pitchText) return null

    let text = ""
    if (pitchDeviation) {
      let prevText = " "
      let postText = " "
      if (pitchDeviation > 0) prevText += "<"
      if (pitchDeviation > 0.2) prevText += "<"
      if (pitchDeviation < 0) postText += ">"
      if (pitchDeviation < -0.2) postText += ">"
      const diffTxt = Math.abs(pitch - nearestString.freq).toFixed(1)
      text = `${prevText} ${pitchDeviation > 0 ? "+" : "-"}${diffTxt}Hz ${postText}`
    }
    return text
  }, [nearestString, stringText, pitchText, pitchDeviation, pitch])

  return (
    <View>
      <Canvas style={{ width, height, backgroundColor: Colors.bgInactive }}>
        <Waveform audioBuffer={audioBuffer} positionY={waveformY} height={waveformH} />

        <Strings
          positionY={waveformY + waveformH}
          currentNote={nearestString?.note}
          height={stringsHeight}
          instrument={instrument}
        />

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
          <Paragraph
            paragraph={paragraphs.centered(
              nearestString?.note?.name ?? "-",
              noteFontSize,
              600,
              Colors.primary
            )}
            x={width / 2 - boxWidth / 2}
            y={0}
            width={boxWidth}
          />
          <Paragraph
            paragraph={paragraphs.centered(
              stringText ? `${stringText}Hz` : t("no_tone"),
              14,
              500,
              Colors.primary
            )}
            x={width / 2 - boxWidth / 2}
            y={boxHeight - 18}
            width={boxWidth}
          />
          {freqDiffTxt && (
            <Paragraph
              paragraph={paragraphs.centered(freqDiffTxt, 12, 100, gaugeColor)}
              x={
                (pitchDeviation ?? 0) > 0
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
          <MovingGrid pitchId={bufferId} deviation={pitchDeviation} />
        </Group>

        {/* Gauge bar */}
        <Group transform={[{ translateY: movingGridY - gaugeRadius / 2 }]}>
          {/* Grey background line */}
          <Line
            p1={{ x: barWidth / 2, y: 0 }}
            p2={{ x: width - barWidth / 2, y: 0 }}
            style="stroke"
            strokeWidth={barWidth}
            color={Colors.secondary}
            strokeCap={"round"}
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
      <ConfigButton
        x={width - cfgBtnMargin * cfgBtnSize}
        y={height - cfgBtnMargin * cfgBtnSize}
        size={cfgBtnSize}
      />
    </View>
  )
}
