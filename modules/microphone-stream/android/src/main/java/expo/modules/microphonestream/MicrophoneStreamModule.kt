package expo.modules.microphonestream

import android.Manifest
import android.content.pm.PackageManager
import android.media.AudioFormat
import android.media.AudioRecord
import android.media.MediaRecorder
import android.os.Handler
import android.os.Looper
import androidx.core.app.ActivityCompat
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.Promise
import java.nio.ByteBuffer
import kotlin.concurrent.thread

class MicrophoneStreamModule : Module() {
  private val bufferSize = AudioRecord.getMinBufferSize(
    44100,
    AudioFormat.CHANNEL_IN_MONO,
    AudioFormat.ENCODING_PCM_FLOAT
  )
  private var audioRecord: AudioRecord? = null
  private var recordingThread: Thread? = null
  private var isRecording = false

  override fun definition() = ModuleDefinition {
    Name("MicrophoneStream")

    Constants(
        "BUFFER_SIZE" to bufferSize
    )

    Function("startRecording") {
      /*val context = appContext.reactContext ?: throw RuntimeException("React context is not available.")

      if (ActivityCompat.checkSelfPermission(context, Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED) {
        throw RuntimeException("Microphone permission not granted.")
      }

      audioRecord = AudioRecord(
        MediaRecorder.AudioSource.MIC,
        44100,
        AudioFormat.CHANNEL_IN_MONO,
        AudioFormat.ENCODING_PCM_FLOAT,
        bufferSize
      )

      audioRecord?.startRecording()
      isRecording = true

      recordingThread = thread(start = true) {
        val buffer = FloatArray(bufferSize / 4) // Float takes 4 bytes
        while (isRecording && audioRecord != null) {
          val result = audioRecord!!.read(buffer, 0, buffer.size, AudioRecord.READ_BLOCKING)
          if (result > 0) {
            try {
              // TODO: send event
            } catch (e: Exception) {
              e.printStackTrace()
            }
          }
        }
      }*/
    }

    Function("stopRecording") {
      try {
        isRecording = false
        recordingThread?.join()
        recordingThread = null

        audioRecord?.stop()
        audioRecord?.release()
        audioRecord = null
      } catch (e: Exception) {
        // Log error if needed
      }
    }
  }
}