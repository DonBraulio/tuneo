import React, { Profiler, useEffect, useMemo, useState } from "react"
import { View, useWindowDimensions, Alert } from "react-native"
import { Canvas } from "@shopify/react-native-skia"

import DSPModule from "@/../specs/NativeDSPModule"
import MicrophoneStreamModule, { AudioBuffer } from "@/../modules/microphone-stream"
import { AudioModule } from "expo-audio"
import Colors from "@/colors"
import { getTestSignal } from "@/test"
import MovingGrid from "@/components/MovingGrid"
import ConfigButton from "@/components/ConfigButton"
import { useTranslation } from "@/configHooks"
import { useConfigStore } from "@/stores/configStore"
import { Chromatic, Guitar, Instrument } from "@/instruments"
import { Waveform } from "@/components/Waveform"
import { Strings } from "@/components/Strings"
import { MainNote } from "@/components/MainNote"
import { TuningGauge } from "@/components/TuningGauge"
import RequireMicAccess from "@/components/RequireMicAccess"
import { useUiStore } from "@/stores/uiStore"
import { getRelativeDiff, sameNote } from "@/notes"
import { RightButtons } from "@/components/RightButtons"

const TEST_MODE = false

// See python notebook to tweak these params
const MIN_FREQ = 30
const MAX_FREQ = 500
const MAX_PITCH_DEV = 0.2
const THRESHOLD_DEFAULT = 0.15
const THRESHOLD_NOISY = 0.6
const RMS_GAP = 1.1
const ENABLE_FILTER = true

// This is just a preference, may be set differently
const BUF_PER_SEC = MicrophoneStreamModule.BUF_PER_SEC
console.log(`Preferred buffers per second: ${BUF_PER_SEC}`)

type MicrophoneAccess = "pending" | "granted" | "denied"

export const Tuneo = () => {
  const { width, height } = useWindowDimensions()
  const config = useConfigStore()
  const t = useTranslation()

  // Audio buffer
  const [sampleRate, setSampleRate] = useState(0)
  const [audioBuffer, setAudioBuffer] = useState<number[]>([])
  const [bufferId, setBufferId] = useState(0)

  // Flag for microphone access granted
  const [micAccess, setMicAccess] = useState<MicrophoneAccess>("pending")

  // Detected pitch
  const [pitch, setPitch] = useState(-1)

  // Pitch and RMS history
  const pitchQ = useUiStore((state) => state.pitchHistory)
  const rmsQ = useUiStore((state) => state.rmsHistory)
  const idQ = useUiStore((state) => state.idHistory)
  const addPitch = useUiStore((state) => state.addPitch)
  const addRMS = useUiStore((state) => state.addRMS)
  const addId = useUiStore((state) => state.addId)

  // Current string detection filtering
  const stringHistory = useUiStore((state) => state.stringHistory)
  const addString = useUiStore((state) => state.addString)
  const currentString = useUiStore((state) => state.currentString)
  const setCurrentString = useUiStore((state) => state.setCurrentString)

  // Request recording permission
  useEffect(() => {
    ;(async () => {
      const status = await AudioModule.requestRecordingPermissionsAsync()
      if (status.granted) {
        console.log("Granted microphone permission")
        setMicAccess("granted")
      } else {
        setMicAccess("denied")
        Alert.alert(t("error_mic_access"))
      }
    })()
  }, [t])

  const onRenderCallback = (id: string, phase: string, actualDuration: number) => {
    // console.log(`Component ${id} took ${actualDuration} ms to render (${phase} phase)`)
  }

  // Start microphone recording
  useEffect(() => {
    if (TEST_MODE || micAccess !== "granted") return

    // Start microphone
    MicrophoneStreamModule.startRecording()
    console.log("Start recording")

    // Suscribe to microphone buffer
    const subscriber = MicrophoneStreamModule.addListener(
      "onAudioBuffer",
      (buffer: AudioBuffer) => {
        // Set audio buffer
        setAudioBuffer(buffer.samples)

        // Calculate signal RMS
        addRMS(DSPModule.rms(buffer.samples))
        setBufferId((prevId) => prevId + 1)
      }
    )
    return () => {
      subscriber.remove()
      MicrophoneStreamModule.stopRecording()
    }
  }, [micAccess, addRMS])

  // Test audio buffers
  useEffect(() => {
    if (!TEST_MODE) return

    const sampleRate = 44100
    const bufSize = sampleRate / BUF_PER_SEC
    const buffer = getTestSignal(bufferId, sampleRate, bufSize)
    setSampleRate(sampleRate)
    setAudioBuffer(buffer)

    // Trigger for next buffer
    const timeout = setTimeout(() => {
      setBufferId((id) => id + 1)
    }, 1000 / BUF_PER_SEC)
    return () => clearTimeout(timeout)
  }, [bufferId, addRMS])

  // Get pitch of the audio
  useEffect(() => {
    if (!audioBuffer.length || micAccess !== "granted") return

    // Process each bufferId only once
    if (bufferId === idQ[idQ.length - 1]) return
    addId(bufferId)

    // Set sampleRate after first audio buffer
    let sr = sampleRate
    if (!sr) {
      // Assume microphone already configured ()
      sr = MicrophoneStreamModule.getSampleRate()
      console.log(`Setting sample rate to ${sr}Hz`)
      setSampleRate(sr)
    }

    // Set parameters for pitch estimation
    let minFreq = MIN_FREQ
    let maxFreq = MAX_FREQ
    let threshold = THRESHOLD_DEFAULT

    // Previous RMS and pitch values
    const rms_1 = rmsQ[rmsQ.length - 1]
    const rms_2 = rmsQ[rmsQ.length - 2]
    const pitch_1 = pitchQ[pitchQ.length - 1]
    const pitch_2 = pitchQ[pitchQ.length - 2]

    // Check conditions to restrict pitch search range
    let restrictRange = ENABLE_FILTER
    restrictRange &&= pitch_1 > 0 // Previous pitch detected
    restrictRange &&= rms_1 < rms_2 * RMS_GAP // Decreasing RMS
    restrictRange &&= getRelativeDiff(pitch_1, pitch_2) <= MAX_PITCH_DEV // Stable pitch
    if (restrictRange) {
      minFreq = pitch_1 * (1 - MAX_PITCH_DEV)
      maxFreq = pitch_1 * (1 + MAX_PITCH_DEV)
      threshold = THRESHOLD_NOISY
    }

    // Estimate pitch
    const pitch = DSPModule.pitch(audioBuffer, sr, minFreq, maxFreq, threshold)
    // console.log(`Pitch: ${pitch.toFixed(1)}Hz  [${minFreq.toFixed(1)}Hz-${maxFreq.toFixed(1)}Hz]`)
    setPitch(pitch)

    // Add values to history
    addPitch(pitch)
  }, [audioBuffer, sampleRate, micAccess, addId, addPitch, rmsQ, pitchQ, idQ, bufferId])

  // Selected instrument
  const instrument: Instrument = useMemo(() => {
    switch (config.instrument) {
      case "guitar":
        return new Guitar(config.tuning)
      case "chromatic":
        return new Chromatic(config.tuning)
    }
  }, [config.instrument, config.tuning])

  // Add latest string to history
  useEffect(() => {
    if (config.manual) return
    const string = instrument.getNearestString(pitch)
    addString(string)
  }, [pitch, instrument, addString, config.manual])

  // Change currentString (requires 3 votes)
  useEffect(() => {
    if (config.manual) return

    const len = stringHistory.length
    const string1 = len > 0 ? stringHistory[len - 1] : undefined
    const string2 = len > 1 ? stringHistory[len - 2] : undefined
    const string3 = len > 2 ? stringHistory[len - 3] : undefined
    // Never sets currentString to undefined
    if (sameNote(string1?.note, string2?.note) && sameNote(string1?.note, string3?.note)) {
      setCurrentString(string1)
    }
  }, [stringHistory, setCurrentString, config.manual])

  // Tuning gauge indicator
  const gaugeDeviation = useMemo(
    () =>
      pitch > 0 && currentString
        ? Math.atan((10 * (pitch - currentString.freq)) / currentString.freq) / (Math.PI / 2)
        : undefined,
    [pitch, currentString]
  )
  const gaugeWidth = 10
  const gaugeColor = Colors.getColorFromGaugeDeviation(gaugeDeviation)

  // Component sizes and positions
  const waveformY = 60
  const waveformH = height / 8
  const movingGridY = height * 0.55
  const movingGridH = height - movingGridY
  const stringsH = height - waveformY - waveformH - movingGridH - gaugeWidth / 2

  // Config button
  const cfgBtnSize = 1.5
  const cfgBtnMargin = 50

  return micAccess === "granted" ? (
    <View style={{ flex: 1, backgroundColor: Colors.bgInactive }}>
      <Canvas style={{ flex: 1 }}>
        <Profiler id="Waveform" onRender={onRenderCallback}>
          <Waveform
            audioBuffer={audioBuffer}
            positionY={waveformY}
            height={waveformH}
            bufferId={bufferId}
            bufPerSec={BUF_PER_SEC}
          />
        </Profiler>

        <MainNote
          positionY={movingGridY - gaugeWidth - 10}
          currentString={currentString}
          pitch={pitch}
          gaugeDeviation={gaugeDeviation}
          gaugeColor={gaugeColor}
        />

        <MovingGrid
          positionY={movingGridY}
          pitchId={bufferId}
          deviation={gaugeDeviation}
          pointsPerSec={BUF_PER_SEC}
        />

        <TuningGauge
          positionY={movingGridY}
          gaugeColor={gaugeColor}
          gaugeDeviation={gaugeDeviation}
          gaugeWidth={gaugeWidth}
          framesPerSec={BUF_PER_SEC}
        />
      </Canvas>
      <Strings positionY={waveformY + waveformH} height={stringsH} instrument={instrument} />
      <RightButtons positionY={waveformY + waveformH} instrument={instrument} />
      <ConfigButton
        x={width - cfgBtnMargin * cfgBtnSize}
        y={height - cfgBtnMargin * cfgBtnSize}
        size={cfgBtnSize}
      />
    </View>
  ) : micAccess === "denied" ? (
    <RequireMicAccess />
  ) : undefined // micAccess "pending"
}
