import { NativeModule, requireNativeModule } from "expo"
import { EventSubscription } from "expo-modules-core"

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
}

// This call loads the native module object from the JSI.
export default requireNativeModule<MicrophoneStreamModule>("MicrophoneStream")
