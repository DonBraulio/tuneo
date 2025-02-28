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
import { useConfigStore, useTranslation } from "@/configHooks"
import { Chromatic, Guitar, Instrument, InstrumentString } from "@/instruments"
import { Waveform } from "@/components/Waveform"
import { Strings } from "@/components/Strings"
import { MainNote } from "@/components/MainNote"
import { TuningGauge } from "@/components/TuningGauge"
import RequireMicAccess from "@/components/RequireMicAccess"
import { useUiStore } from "@/uiStore"
import { sameNote } from "@/notes"

const TEST_MODE = false
const MIN_FREQ = 30
const MAX_FREQ = 500
const MAX_PITCH_DEV = 0.1

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
  const [, setRMS] = useState(0)
  const [rmsDecreasing, setRMSDecreasing] = useState(false)

  // Current string detection filtering
  const stringQueue = useUiStore((state) => state.stringQueue)
  const addString = useUiStore((state) => state.addString)
  const [currentString, setCurrentString] = useState<InstrumentString>()

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
        setBufferId((prevId) => prevId + 1)

        // Set signal power and whether or not it's decreasing
        setRMS((oldRMS) => {
          const newRMS = DSPModule.rms(buffer.samples)
          setRMSDecreasing(newRMS < oldRMS)
          return newRMS
        })
      }
    )
    return () => {
      subscriber.remove()
      MicrophoneStreamModule.stopRecording()
    }
  }, [micAccess])

  // Test audio buffers
  useEffect(() => {
    if (!TEST_MODE) return

    const sampleRate = 44100
    const bufSize = sampleRate / BUF_PER_SEC
    const buffer = getTestSignal(bufferId, sampleRate, bufSize)
    setSampleRate(sampleRate)
    setAudioBuffer(buffer)
    setRMS((oldRMS) => {
      const newRMS = DSPModule.rms(buffer)
      setRMSDecreasing(newRMS < oldRMS)
      return newRMS
    })

    // Trigger for next buffer
    const timeout = setTimeout(() => {
      setBufferId((id) => id + 1)
    }, 1000 / BUF_PER_SEC)
    return () => clearTimeout(timeout)
  }, [bufferId])

  // Get pitch of the audio
  useEffect(() => {
    if (!audioBuffer.length || micAccess !== "granted") return

    let sr = sampleRate
    if (!sr) {
      // Assume microphone already configured ()
      sr = MicrophoneStreamModule.getSampleRate()
      console.log(`Setting sample rate to ${sr}Hz`)

      setSampleRate(sr)
    }

    // Find pitch within previous value +/-10%, unless RMS increases
    setPitch((prevPitch) => {
      let minFreq = MIN_FREQ
      let maxFreq = MAX_FREQ
      if (prevPitch > 0 && rmsDecreasing) {
        minFreq = prevPitch * (1 - MAX_PITCH_DEV)
        maxFreq = prevPitch * (1 + MAX_PITCH_DEV)
      }
      const pitch = DSPModule.pitch(audioBuffer, sr, minFreq, maxFreq)
      return pitch
    })
  }, [audioBuffer, sampleRate, rmsDecreasing, micAccess])

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
    addString(instrument.getNearestString(pitch))
  }, [pitch, instrument, addString])

  // Change currentString (requires 3 votes)
  useEffect(() => {
    const len = stringQueue.length
    const string1 = len > 0 ? stringQueue[len - 1] : undefined
    const string2 = len > 1 ? stringQueue[len - 2] : undefined
    const string3 = len > 2 ? stringQueue[len - 3] : undefined
    console.log(
      `string1: ${string1?.note.name} string2: ${string2?.note.name} string3: ${string3?.note.name}`
    )
    // Never sets currentString to undefined
    if (sameNote(string1?.note, string2?.note) && sameNote(string1?.note, string3?.note)) {
      setCurrentString(string1)
    }
  }, [stringQueue])

  // Tuning gauge indicator
  const gaugeDeviation = useMemo(
    () =>
      pitch > 0 && currentString
        ? Math.atan((20 * (pitch - currentString.freq)) / currentString.freq) / (Math.PI / 2)
        : undefined,
    [pitch, currentString]
  )
  const gaugeWidth = 18
  const gaugeColor = Colors.getColorFromGaugeDeviation(gaugeDeviation ?? 0)

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

        <Strings
          positionY={waveformY + waveformH}
          currentNote={currentString?.note}
          height={stringsH}
          instrument={instrument}
        />
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
