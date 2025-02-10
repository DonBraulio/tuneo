import { NativeModule, requireNativeModule } from "expo"

export type MicrophoneStreamModuleEvents = {
  onAudioBuffer: (params: AudioBuffer) => void
}

export type AudioBuffer = {
  samples: number[]
}

declare class MicrophoneStreamModule extends NativeModule<MicrophoneStreamModuleEvents> {
  stopRecording(): void
  startRecording(): void
  getSampleRate(): number
  BUF_PER_SEC: number
}

// This call loads the native module object from the JSI.
export default requireNativeModule<MicrophoneStreamModule>("MicrophoneStream")
