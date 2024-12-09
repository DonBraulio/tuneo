import { TurboModule, TurboModuleRegistry } from "react-native"

export interface Spec extends TurboModule {
  readonly reverseString: (input: string) => string
  readonly fft: (input: number[]) => number[]
}

export default TurboModuleRegistry.getEnforcing<Spec>("NativeDSPModule")
