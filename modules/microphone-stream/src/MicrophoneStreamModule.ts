import { NativeModule, requireNativeModule } from "expo"

import { MicrophoneStreamModuleEvents } from "./MicrophoneStream.types"

declare class MicrophoneStreamModule extends NativeModule<MicrophoneStreamModuleEvents> {
  stopRecording(): void
  startRecording(callback: (buffer: number[]) => void): void
  getSampleRate(): number
}

// This call loads the native module object from the JSI.
export default requireNativeModule<MicrophoneStreamModule>("MicrophoneStream")
