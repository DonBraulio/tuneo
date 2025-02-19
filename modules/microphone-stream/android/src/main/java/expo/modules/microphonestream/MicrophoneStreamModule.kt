package expo.modules.microphonestream

import android.media.AudioFormat
import android.media.AudioRecord
import android.media.MediaRecorder
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.Promise
import kotlin.concurrent.thread

val BUF_PER_SEC = 15

class MicrophoneStreamModule : Module() {

    private var audioRecord: AudioRecord? = null
    private var isRecording = false
    private val sampleRate = 44100 // Default sample rate
    private val bufferSize = maxOf(
        sampleRate / BUF_PER_SEC,
        AudioRecord.getMinBufferSize(
            sampleRate,
            AudioFormat.CHANNEL_IN_MONO,
            AudioFormat.ENCODING_PCM_16BIT
        )
    )

    override fun definition() = ModuleDefinition {
        Name("MicrophoneStream")

        Events("onAudioBuffer")

        Constants(
            "BUF_PER_SEC" to BUF_PER_SEC
        )

        Function("startRecording") {
            startRecording()
        }

        Function("stopRecording") {
            stopRecording()
        }

        Function("getSampleRate") { -> 
            sampleRate.toDouble()
        }
    }

    private fun startRecording() {
        if (isRecording) return

        audioRecord = AudioRecord(
            MediaRecorder.AudioSource.MIC,
            sampleRate,
            AudioFormat.CHANNEL_IN_MONO,
            AudioFormat.ENCODING_PCM_16BIT,
            bufferSize
        )

        isRecording = true
        audioRecord?.startRecording()

        thread {
            val buffer = ShortArray(bufferSize)
            while (isRecording) {
                val read = audioRecord?.read(buffer, 0, buffer.size) ?: 0
                if (read > 0) {
                    val floatBuffer = buffer.map { it / 32768.0f }
                    sendEvent("onAudioBuffer", mapOf("samples" to floatBuffer))
                }
            }
        }
    }

    private fun stopRecording() {
        isRecording = false
        audioRecord?.stop()
        audioRecord?.release()
        audioRecord = null
    }
}