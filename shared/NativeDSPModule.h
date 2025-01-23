#pragma once

#include <AppSpecsJSI.h>

#include <memory>
#include <string>
#include <vector>
#include "yin.h"

namespace facebook::react {

class NativeDSPModule : public NativeDSPModuleCxxSpec<NativeDSPModule> {
private:
  std::unique_ptr<Yin> yinInstance;

public:
  NativeDSPModule(std::shared_ptr<CallInvoker> jsInvoker);

  float pitch(jsi::Runtime& rt, const std::vector<float>& input, float sampleRate);
};

} // namespace facebook::react