# %%
import numpy as np

import matplotlib.pyplot as plt

from scipy import signal
from scipy.io import wavfile

import IPython.display as ipd
from rich import progress
from numba import jit

# %%
fs, audio = wavfile.read("notebooks/1st_E.wav")

# NOTE: the diff * diff op in YIN can overflow without this normalization
audio = audio / 32768

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
    buffer[0] = 1.0
    acc = 0.0
    for tau in range(1, buffer_size):
        acc += buffer[tau]
        buffer[tau] = buffer[tau] * tau / acc

    # Step 3: Find the minimum value in the CMND function
    min_tau = -1
    for tau in range(1, buffer_size):
        # Modified (see last part of the notebook)
        # if buffer[tau] < 0.2:
        if buffer[tau] < 0.2 and buffer[tau] > buffer[tau - 1]:
            min_tau = tau
            break

    if min_tau == -1:
        return -1.0  # No pitch detected within range

    return sample_rate / min_tau


# %% [markdown]
# # Low-pass IIR filter implementation
def lowpass(audio: np.ndarray, sampleRate: float, cutoffFreq: float):
    rc = 1.0 / (2.0 * np.pi * cutoffFreq)
    alpha = 1.0 / (1.0 + (sampleRate * rc))
    filtered = audio.copy()
    # Apply first-order IIR filter four times in succession (4-pole)
    for _ in range(4):
        for i in range(1, len(filtered)):
            filtered[i] = alpha * filtered[i] + (1.0 - alpha) * filtered[i-1]
    return filtered


audio_filt = lowpass(audio, fs, 330)

# %%
t = 4.0
win_begin = int(t * fs)
win_duration = 2000

# Compare audio and audio filtered
sig_1 = audio[win_begin: win_begin + win_duration]
sig_2 = audio_filt[win_begin: win_begin + win_duration]

fig, axes = plt.subplots(nrows=2, sharex=True)
axes[0].plot(sig_1)
axes[1].plot(sig_2)

# %%
# Choose one
# NOTE: According to my results, filtered audio is not better in 6th string, worse on 1st
# test_audio = audio_filt
test_audio = audio

# %%
window_size = 2048
hop_size = 512

# Compute pitch over sliding windows
pitch_times = []
pitch_values = []
for i in progress.track(range(0, len(test_audio) - window_size, hop_size)):
    window = test_audio[i: i + window_size]
    pitch = yin_pitch_detection(window, fs)
    if pitch > 0:
        pitch_times.append(i / fs)
        pitch_values.append(pitch)

# %%
# Plot spectrogram
f, t, S = signal.spectrogram(test_audio, fs, nperseg=window_size,
                             noverlap=window_size - hop_size, mode='psd', window='hann')
S_db = 20 * np.log10(S + 1e-10)  # Avoid log(0)

plt.figure(figsize=(12, 6))
plt.pcolormesh(t, f, S_db, cmap='jet', shading='auto')
plt.ylim([0, 400])  # Focus on relevant frequencies

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


# %% [markdown]
# # Step by step YIN detection
t = .5
win_begin = int(t * fs)
window_size = 4096
audio_chunk = audio[win_begin:win_begin + window_size]

plt.figure()
plt.plot(audio_chunk)


# %%
audio_buffer = audio_chunk

buffer_size = len(audio_buffer)
buffer = np.zeros(buffer_size)

# Step 1: Compute the difference function
for tau in range(1, buffer_size):
    sum_diff = 0.0
    for j in range(buffer_size - tau):
        diff = audio_buffer[j] - audio_buffer[j + tau]
        sum_diff += diff * diff
    buffer[tau] = sum_diff
plt.figure()
plt.plot(buffer)

# %%
# Step 2: Compute the cumulative mean normalized difference function (CMND)
buffer[0] = 1.0
acc = 0.0
for tau in range(1, buffer_size):
    acc += buffer[tau]
    buffer[tau] = buffer[tau] * tau / acc

plt.figure()
plt.plot(buffer)

# %%
# Step 3: Find the minimum value in the CMND function
min_tau = -1
for tau in range(1, buffer_size):
    if buffer[tau] < 0.2:
        min_tau = tau
        break

print(f"Pitch: {fs / min_tau:.2f} | Min tau: {min_tau}")


# %%
# Step 3 modification:
# falling below threshold is very naive and produces error
# (358Hz vs. 327Hz audacity for 1st_E string)
# Modification: find valley instead of simple threshold
# Much better! Now we get 326.27Hz vs 327Hz in audacity
min_tau = -1
prev_value = 0
for tau in range(1, buffer_size):
    if buffer[tau] < 0.2 and buffer[tau] > buffer[tau - 1]:
        min_tau = tau
        break

print(f"Pitch: {fs / min_tau:.2f} | Min tau: {min_tau}")

# %%
