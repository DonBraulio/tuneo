#include <cmath>
#include <vector>
#include <stdexcept>
#include <iostream>
#include "NativeDSPModule.h"
#include "kiss_fft.h"
#include "kiss_fftr.h"
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

std::vector<float> NativeDSPModule::fft(jsi::Runtime& rt, const std::vector<float>& input) {
    // TODO: initialize kissfft separately with given buffer size
    std::cout << "Calling fft";
    kiss_fftr_cfg cfg = kiss_fftr_alloc(IN_BUF_SIZE, 0, nullptr, nullptr);
    if (!cfg) {
        throw std::runtime_error("Module is not initialized. Call initialize() first.");
    }

    // Perform FFT
    kiss_fft_cpx fout[OUT_BUF_SIZE];
    const kiss_fft_scalar* fin = input.data();
    kiss_fftr(cfg, fin, fout);
    kiss_fftr_free(cfg);

    // Get module of fft
    std::vector<float> output(OUT_BUF_SIZE);
    for(int i = 0; i < OUT_BUF_SIZE; i++){
       output[i] = std::sqrt(std::pow(fout[i].r, 2) + std::pow(fout[i].i, 2));
    }
    return output;
}

} // namespace facebook::react