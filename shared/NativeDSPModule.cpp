#include "NativeDSPModule.h"

namespace facebook::react {

NativeDSPModule::NativeDSPModule(std::shared_ptr<CallInvoker> jsInvoker)
    : NativeDSPModuleCxxSpec(std::move(jsInvoker)), yinInstance(nullptr) {}

float NativeDSPModule::pitch(jsi::Runtime& rt, const std::vector<float>& input,
                             float sampleRate) {
    // (re)initialize yinInstance
  if (!yinInstance || yinInstance->getBufferSize() != input.size() ||
      sampleRate != yinInstance->getSampleRate()) {
    yinInstance = std::make_unique<Yin>(sampleRate, input.size());

    // Log on each initialization
    std::string message = string_format(
        "Creating YIN instance @%.2fHz | buffer size: %d",
        yinInstance->getSampleRate(), yinInstance->getBufferSize());
    log(rt, message);
  }

  return yinInstance->getPitch(input.data());
}

}  // namespace facebook::react