#include "NativeDSPModule.h"
#include "kiss_fft.h"

namespace facebook::react {

NativeDSPModule::NativeDSPModule(std::shared_ptr<CallInvoker> jsInvoker)
    : NativeDSPModuleCxxSpec(std::move(jsInvoker)) {}

std::string NativeDSPModule::reverseString(jsi::Runtime& rt, std::string input) {
    kiss_fft_cfg cfg = kiss_fft_alloc(1024, 0, nullptr, nullptr);
    if (!cfg) {
        return "error";
    }

    kiss_fft_cpx fin[1024];
    kiss_fft_cpx fout[1024];
    
    // Fill input with data (example)
    for (int i = 0; i < 1024; i++) {
        fin[i].r = i;  // Real part
        fin[i].i = 0;  // Imaginary part
    }

    // Perform FFT
    kiss_fft(cfg, fin, fout);
    kiss_fft_free(cfg);

  return std::string(input.rbegin(), input.rend());
}

} // namespace facebook::react