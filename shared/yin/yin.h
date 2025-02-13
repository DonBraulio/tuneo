#pragma once
#include <vector>

/*
Yin algorithm from: https://github.com/JorenSix/Pidato
*/

class Yin {
 public:
  Yin(float sampleRate, int bufferSize);
  float getPitch(const std::vector<float>& audioBuffer);
  float getSampleRate();
  int getBufferSize();

 private:
  std::vector<float> buffer;
  float sampleRate;
  int bufferSize;
};