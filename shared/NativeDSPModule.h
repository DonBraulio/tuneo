#pragma once

#include <AppSpecsJSI.h>

#include <memory>
#include <string>
#include <vector>

#define IN_BUF_SIZE 4096
#define OUT_BUF_SIZE (IN_BUF_SIZE/2 + 1)

namespace facebook::react {

class NativeDSPModule : public NativeDSPModuleCxxSpec<NativeDSPModule> {
public:
  NativeDSPModule(std::shared_ptr<CallInvoker> jsInvoker);

  int getInputBufSize(jsi::Runtime& rt);
  int getOutputBufSize(jsi::Runtime& rt);

  std::vector<float> fft(jsi::Runtime& rt, const std::vector<float>& input);

  float pitch(jsi::Runtime& rt, const std::vector<float>& input, const float sampleRate);

};

} // namespace facebook::react