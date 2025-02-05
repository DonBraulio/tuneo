// Reexport the native module. On web, it will be resolved to MicrophoneStreamModule.web.ts
// and on native platforms to MicrophoneStreamModule.ts
export { default } from "./src/MicrophoneStreamModule"
export * from "./src/MicrophoneStreamModule"
