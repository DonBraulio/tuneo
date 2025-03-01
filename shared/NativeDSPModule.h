#pragma once

#include <AppSpecsJSI.h>
#include <jsi/jsi.h>

#include <memory>
#include <string>
#include <vector>

#include "util.h"
#include "yin.h"

namespace facebook::react {

class NativeDSPModule : public NativeDSPModuleCxxSpec<NativeDSPModule> {
 private:
  std::unique_ptr<Yin> yinInstance;

 public:
  NativeDSPModule(std::shared_ptr<CallInvoker> jsInvoker);

  float pitch(jsi::Runtime& rt, const std::vector<float>& input,
              float sampleRate, float minFreq, float maxFreq, float threshold);

  float rms(jsi::Runtime& rt, const std::vector<float>& input);
};

}  // namespace facebook::react