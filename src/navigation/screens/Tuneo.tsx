import React, { useCallback, useEffect, useMemo, useState } from "react"
import { View, useWindowDimensions, Alert } from "react-native"
import { Canvas, Path, Group, Circle, Line, Paint } from "@shopify/react-native-skia"
import { RoundedRect, TextAlign, useFonts, Skia, Paragraph } from "@shopify/react-native-skia"

import DSPModule from "@/../specs/NativeDSPModule"
import MicrophoneStreamModule, { AudioBuffer } from "@/../modules/microphone-stream"
import { AudioModule } from "expo-audio"
import Colors from "@/colors"
import { getFreqFromNote, getNearestString } from "@/fretboard"
import { getNoteFromFrequency, STRING_NOTES } from "@/fretboard"
import { getAlignedAudio, getTestSignal, getWaveformPath } from "@/waveform"
import MovingGrid from "@/components/MovingGrid"
import ConfigButton from "@/components/ConfigButton"
import { useTranslation } from "@/translations"
import { useConfigStore } from "@/config"

const TEST_MODE = false

// This is just a preference, may be set differently
const BUF_PER_SEC = MicrophoneStreamModule.BUF_PER_SEC
console.log(`Preferred buffers per second: ${BUF_PER_SEC}`)

export const Tuneo = () => {
  const fontMgr = useFonts({
    Roboto: [
      require("@/../assets/Roboto-Regular.ttf"),
      require("@/../assets/Roboto-Medium.ttf"),
      require("@/../assets/Roboto-Bold.ttf"),
      require("@/../assets/Roboto-Italic.ttf"),
    ],
  })
  const window = useWindowDimensions()
  const { width, height } = window
  const config = useConfigStore()

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

  // Nearest guitar string (reference)
  const stringFreqs = useMemo(
    () => STRING_NOTES.map((note) => getFreqFromNote(note, config.tuning)),
    [config]
  )
  const refStringIdx = useMemo(() => getNearestString(pitch, stringFreqs), [pitch, stringFreqs])
  const refStringNote = refStringIdx ? STRING_NOTES[refStringIdx] : undefined
  const refStringFreq = refStringIdx ? stringFreqs[refStringIdx] : 0

  const gaugeRadius = 12
  const pitchDeviation =
    pitch > 0
      ? Math.atan((20 * (pitch - refStringFreq)) / refStringFreq) / (Math.PI / 2)
      : undefined
  const gaugeX = (width / 2) * (1 + (pitchDeviation ?? 0))
  const gaugeColor = Colors.getColorFromPitchDeviation(pitchDeviation ?? 0)
  const barWidth = 2 * gaugeRadius - 2
  // Box size for string note text at the center
  const boxWidth = 80
  const boxHeight = 90
  const sideTxtWidth = 85
  const noteFontSize = 64
  const waveformY = 60
  const waveformH = height / 8
  const movingGridY = height * 0.55

  // 6 buttons equally spaced vertically (waveform to gauge)
  const stringBoxH = 32
  const stringBoxW = 50
  const stringBoxBorder = 1
  const stringBoxSpacing = (movingGridY - barWidth - waveformH - waveformY - 6 * stringBoxH) / 7

  // Config button
  const cfgBtnSize = 1.5
  const cfgBtnMargin = 50

  // Waveform drawing
  const alignedAudio = useMemo(() => getAlignedAudio(audioBuffer, 2048), [audioBuffer])
  const waveformPath = useMemo(
    () => getWaveformPath(alignedAudio, width, waveformH),
    [alignedAudio, width, waveformH]
  )

  const noteText = useMemo(() => {
    if (!fontMgr) return null

    const text = refStringNote?.name ?? "-"
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
  }, [fontMgr, refStringNote])

  const refText = refStringFreq.toFixed(1)
  const pitchText = pitch.toFixed(1)

  const refFreqText = useMemo(() => {
    if (!fontMgr) return null

    const text = refStringFreq ? `${refText}Hz` : t("no_tone")
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
  }, [fontMgr, refText, refStringFreq, t])

  const freqText = useMemo(() => {
    if (!fontMgr || !refStringFreq || refText === pitchText) return null

    // Show << or >> characters next to frequency read
    let text = ""
    if (pitchDeviation) {
      let prevText = " "
      let postText = " "
      if (pitchDeviation > 0) prevText += "<"
      if (pitchDeviation > 0.2) prevText += "<"
      if (pitchDeviation < 0) postText += ">"
      if (pitchDeviation < -0.2) postText += ">"
      const diffTxt = Math.abs(pitch - refStringFreq).toFixed(1)
      text = `${prevText} ${pitchDeviation > 0 ? "+" : "-"}${diffTxt}Hz ${postText}`
    }

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
  }, [fontMgr, refStringFreq, refText, pitchText, pitchDeviation, gaugeColor, pitch])

  const stringsText = useCallback(
    (text: string, active: boolean) => {
      if (!fontMgr) return null

      const textStyle = {
        fontFamilies: ["Roboto"],
        fontSize: 16,
        fontStyle: { weight: active ? 600 : 300 },
        color: Skia.Color(Colors.primary),
      }
      return Skia.ParagraphBuilder.Make({ textAlign: TextAlign.Center }, fontMgr)
        .pushStyle(textStyle)
        .addText(text)
        .pop()
        .build()
    },
    [fontMgr]
  )

  return (
    <View>
      <Canvas style={{ width, height, backgroundColor: Colors.bgInactive }}>
        {/* Waveform */}
        <Group transform={[{ translateY: waveformY }]}>
          <Path
            style="stroke"
            path={waveformPath}
            strokeWidth={2}
            strokeJoin="round"
            strokeCap="round"
            color={Colors.secondary}
          />
        </Group>

        {/* Strings list */}
        <Group transform={[{ translateY: waveformY + waveformH + stringBoxSpacing }]}>
          {STRING_NOTES.map((note, idx) => {
            const active = idx === refStringIdx
            const posX = stringBoxSpacing
            const posY = idx * (stringBoxH + stringBoxSpacing)
            return (
              <Group key={idx}>
                <RoundedRect
                  x={posX}
                  y={posY}
                  height={stringBoxH - 2 * stringBoxBorder}
                  width={stringBoxW}
                  r={10}
                >
                  <Paint style="fill" color={active ? Colors.secondary : Colors.bgActive} />
                  <Paint
                    style="stroke"
                    color={active ? Colors.primary : Colors.secondary}
                    strokeWidth={stringBoxBorder}
                  />
                </RoundedRect>
                <Paragraph
                  paragraph={stringsText(`${6 - idx} • ${note.name}`, active)}
                  x={posX}
                  y={posY + 6}
                  width={stringBoxW}
                />
              </Group>
            )
          })}
        </Group>

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
          {pitchText !== refText && (
            <Paragraph
              paragraph={freqText}
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
