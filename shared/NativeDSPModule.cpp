#include <cmath>
#include <vector>
#include <stdexcept>
#include <iostream>
#include "NativeDSPModule.h"
#include "kiss_fft.h"


namespace facebook::react {


NativeDSPModule::NativeDSPModule(std::shared_ptr<CallInvoker> jsInvoker)
    : NativeDSPModuleCxxSpec(std::move(jsInvoker)) {}

std::string NativeDSPModule::reverseString(jsi::Runtime& rt, std::string input) {

  return std::string(input.rbegin(), input.rend());
}

std::vector<float> NativeDSPModule::fft(jsi::Runtime& rt, const std::vector<float>& input) {
    // TODO: initialize kissfft separately with given buffer size
    // TODO: Use kissfft for real signals
    std::cout << "Calling fft";
    kiss_fft_cfg cfg = kiss_fft_alloc(BUF_SIZE, 0, nullptr, nullptr);
    if (!cfg) {
        throw std::runtime_error("Module is not initialized. Call initialize() first.");
    }

    kiss_fft_cpx fin[BUF_SIZE];
    kiss_fft_cpx fout[BUF_SIZE];
    
    // Copy input signal into real part
    for (int i = 0; i < BUF_SIZE; i++) {
        fin[i].r = input[i];  // Real part
        fin[i].i = 0;  // Imaginary part
    }

    // // Perform FFT
    kiss_fft(cfg, fin, fout);
    kiss_fft_free(cfg);

    // // Get module of fft
    std::vector<float> output(BUF_SIZE);
    for(int i = 0; i < BUF_SIZE; i++){
       output[i] = std::sqrt(std::pow(fout[i].r, 2) + std::pow(fout[i].i, 2));
    }
    return output;
}

} // namespace facebook::react