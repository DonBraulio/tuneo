import React, { useEffect, useMemo, useState } from "react"
import { View, useWindowDimensions, Alert } from "react-native"
import { Canvas } from "@shopify/react-native-skia"

import DSPModule from "@/../specs/NativeDSPModule"
import MicrophoneStreamModule, { AudioBuffer } from "@/../modules/microphone-stream"
import { AudioModule } from "expo-audio"
import Colors from "@/colors"
import { getTestSignal } from "@/test"
import MovingGrid from "@/components/MovingGrid"
import ConfigButton from "@/components/ConfigButton"
import { useConfigStore } from "@/config"
import { Chromatic, Guitar, Instrument } from "@/instruments"
import { Waveform } from "@/components/Waveform"
import { Strings } from "@/components/Strings"
import { MainNote } from "@/components/MainNote"
import { TuningGauge } from "@/components/TuningGauge"

const TEST_MODE = false
const MIN_FREQ = 30
const MAX_FREQ = 500
const PITCH_NARROW_RANGE = 0.1

// This is just a preference, may be set differently
const BUF_PER_SEC = MicrophoneStreamModule.BUF_PER_SEC
console.log(`Preferred buffers per second: ${BUF_PER_SEC}`)

export const Tuneo = () => {
  const { width, height } = useWindowDimensions()
  const config = useConfigStore()

  // Audio buffer
  const [sampleRate, setSampleRate] = useState(0)
  const [audioBuffer, setAudioBuffer] = useState<number[]>([])
  const [bufferId, setBufferId] = useState(0)

  // Detected pitch
  const [pitch, setPitch] = useState(-1)
  const [, setRMS] = useState(0)
  const [rmsDecreasing, setRMSDecreasing] = useState(false)

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
    return () => subscriber.remove()
  }, [])

  // Test audio buffers
  useEffect(() => {
    if (!TEST_MODE) return

    const sampleRate = 44100
    const bufSize = sampleRate / BUF_PER_SEC
    const buffer = getTestSignal(bufferId, sampleRate, bufSize)
    setAudioBuffer(buffer)
    setRMS((oldRMS) => {
      const newRMS = DSPModule.rms(buffer)
      setRMSDecreasing(newRMS < oldRMS)
      return newRMS
    })
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

    // Find pitch within previous value +/-10%, unless RMS increases
    setPitch((prevPitch) => {
      let minFreq = MIN_FREQ
      let maxFreq = MAX_FREQ
      if (prevPitch > 0 && rmsDecreasing) {
        minFreq = prevPitch * (1 - PITCH_NARROW_RANGE)
        maxFreq = prevPitch * (1 + PITCH_NARROW_RANGE)
      }

      const pitch = DSPModule.pitch(audioBuffer, sr, minFreq, maxFreq)
      return pitch
    })
  }, [audioBuffer, sampleRate, rmsDecreasing])

  // Selected instrument
  const instrument: Instrument = useMemo(() => {
    switch (config.instrument) {
      case "guitar":
        return new Guitar(config.tuning)
      case "chromatic":
        return new Chromatic(config.tuning)
    }
  }, [config.instrument, config.tuning])

  // Nearest string (reference note)
  const nearestString = useMemo(() => instrument.getNearestString(pitch), [pitch, instrument])

  // Tuning gauge indicator
  const gaugeDeviation =
    pitch > 0 && nearestString
      ? Math.atan((20 * (pitch - nearestString.freq)) / nearestString.freq) / (Math.PI / 2)
      : undefined
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

  return (
    <View>
      <Canvas style={{ width, height, backgroundColor: Colors.bgInactive }}>
        <Waveform audioBuffer={audioBuffer} positionY={waveformY} height={waveformH} />

        {/* List of guitar strings */}
        <Strings
          positionY={waveformY + waveformH}
          currentNote={nearestString?.note}
          height={stringsH}
          instrument={instrument}
        />

        {/* Note text */}
        <MainNote
          positionY={movingGridY - gaugeWidth - 10}
          currentString={nearestString}
          pitch={pitch}
          gaugeDeviation={gaugeDeviation}
          gaugeColor={gaugeColor}
        />

        {/* Grid */}
        <MovingGrid positionY={movingGridY} pitchId={bufferId} deviation={gaugeDeviation} />

        {/* Gauge bar */}
        <TuningGauge
          positionY={movingGridY}
          gaugeColor={gaugeColor}
          gaugeDeviation={gaugeDeviation}
          gaugeWidth={gaugeWidth}
        />
      </Canvas>
      <ConfigButton
        x={width - cfgBtnMargin * cfgBtnSize}
        y={height - cfgBtnMargin * cfgBtnSize}
        size={cfgBtnSize}
      />
    </View>
  )
}
