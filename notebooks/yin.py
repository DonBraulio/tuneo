# %%
import numpy as np

import matplotlib.pyplot as plt

from scipy import signal
from scipy.io import wavfile

import IPython.display as ipd
from rich import progress
from numba import jit

# %%
fs, audio_5th = wavfile.read("notebooks/5th_A.wav")

audio = audio_5th
ipd.Audio(audio, rate=fs)


# %%
@jit
def yin_pitch_detection(audio_buffer: np.ndarray, sample_rate: float):
    buffer_size = len(audio_buffer)
    buffer = np.zeros(buffer_size)

    # Step 1: Compute the difference function
    for tau in range(1, buffer_size):
        sum_diff = 0.0
        for j in range(buffer_size - tau):
            diff = audio_buffer[j] - audio_buffer[j + tau]
            sum_diff += diff * diff
        buffer[tau] = sum_diff

    # Step 2: Compute the cumulative mean normalized difference function (CMND)
    buffer[1] = 1.0
    acc = 0.0
    for tau in range(2, buffer_size):
        acc += buffer[tau]
        buffer[tau] = buffer[tau] * tau / acc

    # Step 3: Find the minimum value in the CMND function
    min_tau = -1
    for tau in range(1, buffer_size):
        if buffer[tau] < 0.1:
            min_tau = tau
            break

    if min_tau == -1:
        return -1.0  # No pitch detected within range

    return sample_rate / min_tau


# %%
window_size = 2048
hop_size = 512

# Compute pitch over sliding windows
pitch_times = []
pitch_values = []
for i in progress.track(range(0, len(audio) - window_size, hop_size)):
    window = audio[i: i + window_size]
    pitch = yin_pitch_detection(window, fs)
    if pitch > 0:
        pitch_times.append(i / fs)
        pitch_values.append(pitch)

# %%
# Plot spectrogram
f, t, S = signal.spectrogram(audio, fs, nperseg=window_size,
                             noverlap=window_size - hop_size, mode='psd', window='hann')
S_db = 20 * np.log10(S + 1e-10)  # Avoid log(0)

plt.figure(figsize=(12, 6))
plt.pcolormesh(t, f, S_db, cmap='jet', shading='auto')
plt.yscale('log')
plt.ylim([0, fs / 2])  # Focus on relevant frequencies
plt.yticks([80, 100, 200, 300, 400, 500, 1000, 2000, 5000, 10000],
           ['80', '100', '200', '300', '400', '500', '1k', '2k', '5k', '10k'])

# Overlay detected pitch
plt.scatter(np.array(pitch_times), np.array(pitch_values), c="k", s=3, label="Detected Pitch")

# Labels and formatting
plt.ylabel("Frequency [Hz]")
plt.xlabel("Time [sec]")
plt.colorbar(label="Power (dB)")
plt.title("Spectrogram with YIN Pitch Detection")
plt.legend()
plt.tight_layout()
plt.show()

# %%
