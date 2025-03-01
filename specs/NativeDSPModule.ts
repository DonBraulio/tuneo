import { TurboModule, TurboModuleRegistry } from "react-native"

export interface Spec extends TurboModule {
  readonly pitch: (
    input: number[],
    sampleRate: number,
    minFreq: number,
    maxFreq: number,
    threshold: number
  ) => number
  readonly rms: (input: number[]) => number
}

export default TurboModuleRegistry.getEnforcing<Spec>("NativeDSPModule")
