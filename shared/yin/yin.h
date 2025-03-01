#pragma once
#include <AppSpecsJSI.h>

#include <vector>

#define DEBUG_VERBOSE 0

using namespace facebook;

/*
Yin algorithm from: https://github.com/JorenSix/Pidato
*/

class Yin {
 public:
  Yin(float sampleRate, int bufferSize);
  float getPitch(const std::vector<float>& audioBuffer, jsi::Runtime& rt,
                 float minFreq, float maxFreq, float threshold);
  float getSampleRate();
  int getBufferSize();

 private:
  float parabolaInterp(int n, float yl, float yc, float yr);
  float sampleRate;
  int bufferSize;
  std::vector<float> buffer;
};