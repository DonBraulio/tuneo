#pragma once

#include <AppSpecsJSI.h>

#include <memory>
#include <string>
#include <vector>
#include "yin.h"

#define IN_BUF_SIZE 4096
#define OUT_BUF_SIZE (IN_BUF_SIZE/2 + 1)

namespace facebook::react {

class NativeDSPModule : public NativeDSPModuleCxxSpec<NativeDSPModule> {
private:
  std::unique_ptr<Yin> yinInstance;

public:
  NativeDSPModule(std::shared_ptr<CallInvoker> jsInvoker);

  void initialize(jsi::Runtime& rt, float sampleRate, int bufferSize);

  float pitch(jsi::Runtime& rt, const std::vector<float>& input);
};

} // namespace facebook::react