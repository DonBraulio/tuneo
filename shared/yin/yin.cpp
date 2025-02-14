#include "yin.h"

#include <cmath>

#include "util.h"

using namespace facebook;

Yin::Yin(float sampleRate, int bufferSize)
    : sampleRate(sampleRate),
      bufferSize(bufferSize),
      buffer(bufferSize, 0.0f),
      threshold(0.2) {}

int Yin::getBufferSize() { return bufferSize; }

float Yin::getSampleRate() { return sampleRate; }

float Yin::parabolaInterp(int n, float yl, float yc, float yr) {
  /* Assume 3 points: n-1, n, n+1 with values yl, yc, yr respectively.
   * Find the minimum of a parabola that fits the 3 points.
   */
  float nom = -4 * n * yc + (2 * n - 1) * yr + (2 * n + 1) * yl;
  float denom = 2 * (yl - 2 * yc + yr);
  // Aligned points
  if (denom == 0) {
    return n;
  }
  float nBetter = nom / denom;
  // Safeguard
  if (nBetter < n - 1 || nBetter > n + 1) {
    return n;
  }
  return nBetter;
}

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

  // Cumulative mean normalized difference function
  buffer[0] = 1.0;
  float acc = 0;  // running sum
  for (tau = 1; tau < bufferSize; tau++) {
    acc += buffer[tau];
    buffer[tau] = buffer[tau] * tau / acc;
  }

  // Find first valley below threshold
  float minTau = -1.0f;
  for (tau = 1; tau < bufferSize - 1; tau++) {
    // Condition for valley: curve is going up again
    if (buffer[tau] < threshold && buffer[tau] < buffer[tau + 1]) {
      minTau = Yin::parabolaInterp(tau, buffer[tau - 1], buffer[tau],
                                   buffer[tau + 1]);
      break;
    }
  }

#if DEBUG_VERBOSE
  // Show value found
  std::string message = string_format("tau=%d", minTau);
  log(rt, message);
#endif

  if (minTau < 0) return -1.0;  // No pitch detected

  return sampleRate / minTau;
}