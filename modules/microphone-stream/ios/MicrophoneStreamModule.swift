import AVFoundation
import ExpoModulesCore

public class MicrophoneStreamModule: Module {

  private let audioSession = AVAudioSession.sharedInstance()
  private let audioEngine = AVAudioEngine()
  private var audioBufferHandler: (([Float]) -> Void)?

  // Each module class must implement the definition function. The definition consists of components
  // that describes the module's functionality and behavior.
  // See https://docs.expo.dev/modules/module-api for more details about available components.
  public func definition() -> ModuleDefinition {
    // Sets the name of the module that JavaScript code will use to refer to the module. Takes a string as an argument.
    // Can be inferred from module's class name, but it's recommended to set it explicitly for clarity.
    // The module will be accessible from `requireNativeModule('MicrophoneStream')` in JavaScript.
    Name("MicrophoneStream")

    // Defines event names that the module can send to JavaScript.
    Events("onChange")

    Function("startRecording") {(callback: JavaScriptFunction<Void>) -> Void in
      // audioBufferHandler = handler

      // Request microphone permission
      self.audioSession.requestRecordPermission { granted in
          guard granted else {
              print("Microphone permission not granted.")
              return
          }

          print("Configuring audioSession")
          DispatchQueue.main.async {
              do {
                  try self.audioSession.setCategory(.record, mode: .measurement, options: [])
                  try self.audioSession.setActive(true)

                  let inputNode = self.audioEngine.inputNode
                  let hwFormat = inputNode.inputFormat(forBus: 0)
                  let bufferSize = AVAudioFrameCount(self.audioSession.sampleRate / 10)

                  inputNode.installTap(onBus: 0, bufferSize: bufferSize, format: hwFormat) { buffer, _ in
                      guard let channelData = buffer.floatChannelData else { return }
                      let frameLength = Int(buffer.frameLength)
                      let samples = Array(UnsafeBufferPointer(start: channelData[0], count: frameLength))
                      do{
                        print("Calling callback")
                        try callback.call(samples)
                      } catch {
                          print("Error handling the callback")
                      }
                  }

                  try self.audioEngine.start()
              } catch {
                  print("Error configuring audio engine: \(error.localizedDescription)")
              }
          }
      }
    }

    Function("stopRecording") {
      self.stopRecording()
    }

    Function("getSampleRate") { () -> Double in
      return self.audioSession.sampleRate
    }
  }

  private func stopRecording() {
    audioEngine.inputNode.removeTap(onBus: 0)
    audioEngine.stop()
    try? AVAudioSession.sharedInstance().setActive(false)
    audioBufferHandler = nil
  }
}
