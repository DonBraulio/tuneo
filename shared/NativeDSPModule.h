#pragma once

#include <AppSpecsJSI.h>

#include <memory>
#include <string>
#include <vector>

#define BUF_SIZE 1024

namespace facebook::react {

class NativeDSPModule : public NativeDSPModuleCxxSpec<NativeDSPModule> {
public:
  NativeDSPModule(std::shared_ptr<CallInvoker> jsInvoker);

  std::string reverseString(jsi::Runtime& rt, std::string input);

  std::vector<float> fft(jsi::Runtime& rt, const std::vector<float>& input);

};

} // namespace facebook::react