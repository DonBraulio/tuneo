import { TurboModule, TurboModuleRegistry } from "react-native"

export interface Spec extends TurboModule {
  readonly pitch: (input: number[], sampleRate: number) => number
}

export default TurboModuleRegistry.getEnforcing<Spec>("NativeDSPModule")
