#include <cmath>
#include <vector>
#include <stdexcept>
#include <iostream>
#include "NativeDSPModule.h"


namespace facebook::react {

NativeDSPModule::NativeDSPModule(std::shared_ptr<CallInvoker> jsInvoker)
    : NativeDSPModuleCxxSpec(std::move(jsInvoker)), yinInstance(nullptr) {}

void NativeDSPModule::initialize(jsi::Runtime& rt, float sampleRate, int bufferSize) {
  yinInstance = std::make_unique<Yin>(sampleRate, bufferSize);
}

float NativeDSPModule::pitch(jsi::Runtime& rt, const std::vector<float>& input) {
  if (!yinInstance) {
    throw std::runtime_error("DSPModule not initialized.");
  }

  return yinInstance->getPitch(input.data());
}

} // namespace facebook::react