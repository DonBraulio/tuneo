#include "yin.h"

#include <stdlib.h>

/*
Yin algorithm from: https://github.com/JorenSix/Pidato
*/

void Yin::initialize(float yinSampleRate, int yinBufferSize) {
  bufferSize = yinBufferSize;
  sampleRate = yinSampleRate;
  halfBufferSize = bufferSize / 2;
  threshold = 0.15;
  probability = 0.0;
  // initialize array and set it to zero
  yinBuffer = (float*)malloc(sizeof(float) * halfBufferSize);
  for (int i = 0; i < halfBufferSize; i++) {
    yinBuffer[i] = 0;
  }
}

Yin::Yin() {}

Yin::Yin(float yinSampleRate, int yinBufferSize) {
  initialize(yinSampleRate, yinBufferSize);
}

int Yin::getBufferSize() { return bufferSize; }

float Yin::getSampleRate() { return sampleRate; }

float Yin::getProbability() { return probability; }

float Yin::getPitch(const float* buffer) {
  int tauEstimate = -1;
  float pitchInHertz = -1;

  // step 2
  difference(buffer);

  // step 3
  cumulativeMeanNormalizedDifference();

  // step 4
  tauEstimate = absoluteThreshold();

  // step 5
  if (tauEstimate != -1) {
    pitchInHertz = sampleRate / parabolicInterpolation(tauEstimate);
  }

  return pitchInHertz;
}

float Yin::parabolicInterpolation(int tauEstimate) {
  float betterTau;
  int x0;
  int x2;

  if (tauEstimate < 1) {
    x0 = tauEstimate;
  } else {
    x0 = tauEstimate - 1;
  }
  if (tauEstimate + 1 < halfBufferSize) {
    x2 = tauEstimate + 1;
  } else {
    x2 = tauEstimate;
  }
  if (x0 == tauEstimate) {
    if (yinBuffer[tauEstimate] <= yinBuffer[x2]) {
      betterTau = tauEstimate;
    } else {
      betterTau = x2;
    }
  } else if (x2 == tauEstimate) {
    if (yinBuffer[tauEstimate] <= yinBuffer[x0]) {
      betterTau = tauEstimate;
    } else {
      betterTau = x0;
    }
  } else {
    float s0, s1, s2;
    s0 = yinBuffer[x0];
    s1 = yinBuffer[tauEstimate];
    s2 = yinBuffer[x2];
    // fixed AUBIO implementation, thanks to Karl Helgason:
    // (2.0f * s1 - s2 - s0) was incorrectly multiplied with -1
    betterTau = tauEstimate + (s2 - s0) / (2 * (2 * s1 - s2 - s0));
  }
  return betterTau;
}

void Yin::cumulativeMeanNormalizedDifference() {
  int tau;
  yinBuffer[0] = 1;
  float runningSum = 0;
  for (tau = 1; tau < halfBufferSize; tau++) {
    runningSum += yinBuffer[tau];
    yinBuffer[tau] *= tau / runningSum;
  }
}

void Yin::difference(const float* buffer) {
  int index;
  int tau;
  float delta;
  for (tau = 0; tau < halfBufferSize; tau++) {
    yinBuffer[tau] = 0;
    for (index = 0; index < halfBufferSize; index++) {
      delta = buffer[index] - buffer[index + tau];
      yinBuffer[tau] += delta * delta;
    }
  }
}

int Yin::absoluteThreshold() {
  int tau;
  // first two positions in yinBuffer are always 1
  // So start at the third (index 2)
  for (tau = 2; tau < halfBufferSize; tau++) {
    if (yinBuffer[tau] < threshold) {
      while (tau + 1 < halfBufferSize && yinBuffer[tau + 1] < yinBuffer[tau]) {
        tau++;
      }
      // found tau, exit loop and return
      // store the probability
      // From the YIN paper: The threshold determines the list of
      // candidates admitted to the set, and can be interpreted as the
      // proportion of aperiodic power tolerated
      // within a ëëperiodicíí signal.
      //
      // Since we want the periodicity and and not aperiodicity:
      // periodicity = 1 - aperiodicity
      probability = 1 - yinBuffer[tau];
      break;
    }
  }
  // if no pitch found, tau => -1
  if (tau == halfBufferSize || yinBuffer[tau] >= threshold) {
    tau = -1;
    probability = 0;
  }
  return tau;
}