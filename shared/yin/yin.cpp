#include "yin.h"

#include <cmath>

Yin::Yin(float sampleRate, int bufferSize)
    : sampleRate(sampleRate),
      bufferSize(bufferSize),
      buffer(bufferSize, 0.0f) {}

int Yin::getBufferSize() { return bufferSize; }

float Yin::getSampleRate() { return sampleRate; }

float Yin::getPitch(const std::vector<float>& audioBuffer) {
  int tau;
  for (tau = 1; tau < bufferSize; tau++) {
    float sum = 0.0;
    for (int j = 0; j < bufferSize - tau; j++) {
      float diff = audioBuffer[j] - audioBuffer[j + tau];
      sum += diff * diff;
    }
    buffer[tau] = sum;
  }

  // Compute the cumulative mean normalized difference function
  buffer[1] = 1.0;
  float acc = 0;  // running sum
  for (tau = 2; tau < bufferSize; tau++) {
    acc += buffer[tau];
    buffer[tau] = buffer[tau] * tau / acc;
  }

  // Find the minimum value in the cumulative mean difference function
  int minTau = -1;
  for (tau = 2; tau < bufferSize; tau++) {
    if (buffer[tau] < 0.1) {
      minTau = tau;
      break;
    }
  }

  if (minTau == -1) return -1.0;  // No pitch detected

  return sampleRate / minTau;
}