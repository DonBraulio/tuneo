#include "yin.h"

#include <cmath>

#include "util.h"

using namespace facebook;

Yin::Yin(float sampleRate, int bufferSize)
    : sampleRate(sampleRate),
      bufferSize(bufferSize),
      buffer(bufferSize, 0.0f),
      threshold(0.15) {}

int Yin::getBufferSize() { return bufferSize; }

float Yin::getSampleRate() { return sampleRate; }

float Yin::getPitch(const std::vector<float>& audioBuffer, jsi::Runtime& rt) {
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
  buffer[0] = 1.0;
  float acc = 0;  // running sum
  for (tau = 1; tau < bufferSize; tau++) {
    acc += buffer[tau];
    buffer[tau] = buffer[tau] * tau / acc;
  }

  // Find the minimum value in the cumulative mean difference function
  int minTau = -1;
  for (tau = 1; tau < bufferSize; tau++) {
    if (buffer[tau] < threshold) {
      minTau = tau;
      break;
    }
  }

#if DEBUG_VERBOSE
  // Show value found
  std::string message = string_format("tau=%d", minTau);
  log(rt, message);
#endif

  if (minTau == -1) return -1.0;  // No pitch detected

  return sampleRate / minTau;
}