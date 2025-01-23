import { TurboModule, TurboModuleRegistry } from "react-native"

export interface Spec extends TurboModule {
  readonly initialize: (sampleRate: number, bufferSize: number) => void
  readonly pitch: (input: number[]) => number
}

export default TurboModuleRegistry.getEnforcing<Spec>("NativeDSPModule")
