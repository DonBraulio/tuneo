import { TurboModule, TurboModuleRegistry } from "react-native"

export interface Spec extends TurboModule {
  readonly pitch: (input: number[], sampleRate: number) => number
  readonly fft: (input: number[]) => number[]
  readonly getInputBufSize: () => number
  readonly getOutputBufSize: () => number
}

export default TurboModuleRegistry.getEnforcing<Spec>("NativeDSPModule")
