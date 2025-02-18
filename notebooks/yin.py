# %%
import numpy as np

import matplotlib.pyplot as plt

from scipy import signal
from scipy.io import wavfile

import IPython.display as ipd
from rich import progress
from numba import jit

# %%
fs, audio = wavfile.read("notebooks/6th_E_steel.wav")

# NOTE: the diff * diff op in YIN can overflow without this normalization
audio = audio / 32768

ipd.Audio(audio, rate=fs)


# %%
# Step 3 modification:
# Find min of parabola, assuming we've 3 points and buffer[x_min] is smallest
@jit
def parabola_interp(x_min: int, y_left: float, y_center: float, y_right: float):
    nom: float = -4*x_min*y_center + (2 * x_min - 1) * y_right + (2 * x_min + 1) * y_left
    denom: float = 2 * (y_left - 2 * y_center + y_right)
    if denom == 0:
        return x_min
    estimator: float = nom / denom
    if estimator < x_min - 1 or estimator > x_min + 1:
        return x_min
    return nom / denom


@jit
def yin_pitch_detection(audio_buffer: np.ndarray, sample_rate: float, min_freq: float, max_freq: float):
    tau_min = int(sample_rate / max_freq)
    tau_max = int(sample_rate / min_freq)
    buffer_size = len(audio_buffer)
    buffer = np.zeros(buffer_size)

    # Step 1: Compute the difference function
    for tau in range(tau_min, tau_max):
        sum_diff = 0.0
        for j in range(buffer_size - tau):
            diff = audio_buffer[j] - audio_buffer[j + tau]
            sum_diff += diff * diff
        buffer[tau] = sum_diff

    # Step 2: Compute the cumulative mean normalized difference function (CMND)
    acc = 0.0
    for tau in range(tau_min, tau_max):
        acc += buffer[tau]
        buffer[tau] = buffer[tau] * (tau + 1 - tau_min) / acc

    # Step 3: Find the minimum value in the CMND function
    min_tau = -1
    for tau in range(tau_min + 1, tau_max - 1):
        # Modified (see last part of the notebook)
        # if buffer[tau] < 0.2:
        if buffer[tau] < 0.1 and buffer[tau] < buffer[tau + 1]:
            # min_tau = tau
            min_tau = parabola_interp(tau, buffer[tau - 1], buffer[tau], buffer[tau+1])
            break

    if min_tau == -1:
        return -1.0  # No pitch detected within range

    return sample_rate / min_tau


# %%
# Choose one
# NOTE: According to my results, filtered audio is not better in 6th string, worse on 1st
# test_audio = audio_filt
test_audio = audio

# %%
window_size = 4096
hop_size = 512

freq_min = 60
freq_max = 400

# Compute pitch over sliding windows
pitch_times = []
pitch_values = []
for i in progress.track(range(0, len(test_audio) - window_size, hop_size)):
    window = test_audio[i: i + window_size]
    pitch = yin_pitch_detection(window, fs, freq_min, freq_max)
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

tau_min = int(fs / freq_max)
tau_max = int(fs / freq_min)
buffer_size = len(audio_buffer)
buffer = np.zeros(buffer_size)

# Step 1: Compute the difference function
for tau in range(tau_min, tau_max):
    sum_diff = 0.0
    for j in range(buffer_size - tau):
        diff = audio_buffer[j] - audio_buffer[j + tau]
        sum_diff += diff * diff
    buffer[tau] = sum_diff
plt.figure()
plt.plot(buffer)

# %%
# Step 2: Compute the cumulative mean normalized difference function (CMND)
acc = 0.0
for tau in range(tau_min, tau_max):
    acc += buffer[tau]
    buffer[tau] = buffer[tau] * (tau + 1 - tau_min) / acc

plt.figure()
plt.plot(buffer)

# %%
# Step 3: Find the minimum value in the CMND function
min_tau = -1
for tau in range(tau_min, tau_max):
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
    if buffer[tau] < 0.1 and buffer[tau] < buffer[tau + 1]:
        min_tau = tau
        break

print(f"Pitch: {fs / min_tau:.2f} | Min tau: {min_tau}")


# %%
min_tau = -1
prev_value = 0
for tau in range(1, buffer_size):
    if buffer[tau] < 0.1 and buffer[tau] < buffer[tau + 1]:
        min_tau = parabola_interp(tau, buffer[tau-1], buffer[tau], buffer[tau+1])
        break

print(f"Pitch: {fs / min_tau:.2f} | Min tau: {min_tau}")

# %%
