#include "yin.h"

#include <cmath>
#include <numeric>

Yin::Yin(float sampleRate, int bufferSize) {}

float Yin::getPitch(const std::vector<float>& audioBuffer, float sampleRate) {
  int bufferSize = audioBuffer.size();
  std::vector<float> difference(bufferSize, 0.0);
  std::vector<float> cumulativeMeanDifference(bufferSize, 0.0);

  int tau;
  for (tau = 1; tau < bufferSize; tau++) {
    float sum = 0.0;
    for (int j = 0; j < bufferSize - tau; j++) {
      float diff = audioBuffer[j] - audioBuffer[j + tau];
      sum += diff * diff;
    }
    difference[tau] = sum;
  }

  // Compute the cumulative mean normalized difference function
  cumulativeMeanDifference[1] = 1.0;
  for (tau = 2; tau < bufferSize; tau++) {
    cumulativeMeanDifference[tau] =
        difference[tau] /
        ((1.0 / tau) *
         std::accumulate(difference.begin(), difference.begin() + tau, 0.0));
  }

  // Find the minimum value in the cumulative mean difference function
  int minTau = -1;
  for (tau = 2; tau < bufferSize; tau++) {
    if (cumulativeMeanDifference[tau] < 0.1) {
      minTau = tau;
      break;
    }
  }

  if (minTau == -1) return -1.0;  // No pitch detected

  return sampleRate / minTau;
}