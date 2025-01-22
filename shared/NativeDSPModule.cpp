#include <cmath>
#include <vector>
#include <stdexcept>
#include <iostream>
#include "NativeDSPModule.h"
#include "yin.h"


namespace facebook::react {


NativeDSPModule::NativeDSPModule(std::shared_ptr<CallInvoker> jsInvoker)
    : NativeDSPModuleCxxSpec(std::move(jsInvoker)) {}

float NativeDSPModule::pitch(jsi::Runtime& rt, const std::vector<float>& input, float sampleRate) {
  Yin yin(sampleRate, IN_BUF_SIZE);
  return yin.getPitch(input.data());
}

int NativeDSPModule::getInputBufSize(jsi::Runtime& rt) {
  return IN_BUF_SIZE;
}

int NativeDSPModule::getOutputBufSize(jsi::Runtime& rt) {
  return OUT_BUF_SIZE;
}

} // namespace facebook::react