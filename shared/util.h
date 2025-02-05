#pragma once

#include <AppSpecsJSI.h>
#include <string>

using namespace facebook;

std::string string_format(const char* format, ...);

void log(jsi::Runtime &runtime, std::string& message);