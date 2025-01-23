#include "NativeDSPModule.h"


namespace facebook::react {

NativeDSPModule::NativeDSPModule(std::shared_ptr<CallInvoker> jsInvoker)
    : NativeDSPModuleCxxSpec(std::move(jsInvoker)), yinInstance(nullptr) {}


float NativeDSPModule::pitch(jsi::Runtime& rt, const std::vector<float>& input, float sampleRate) {
  if (!yinInstance || yinInstance->getBufferSize() != input.size() || sampleRate != yinInstance->getSampleRate()) {
    yinInstance = std::make_unique<Yin>(sampleRate, input.size());
  }

  return yinInstance->getPitch(input.data());
}

} // namespace facebook::react