#include <util.h>

#include <jsi/jsi.h>
#include <string>

using namespace facebook;

std::string string_format(const char* format, ...) {
    va_list args;
    va_start(args, format);

    // Get required buffer size
    int size = std::vsnprintf(nullptr, 0, format, args) + 1;
    va_end(args);

    if (size <= 0) return "";

    // Allocate a dynamically sized buffer
    std::string buffer(size, '\0');

    va_start(args, format);
    std::vsnprintf(&buffer[0], size, format, args);
    va_end(args);

    // Remove null terminator
    buffer.pop_back();

    return buffer;
}

void log(jsi::Runtime &runtime, std::string& message) {
    auto global = runtime.global();
    auto console = global.getPropertyAsObject(runtime, "console");
    auto log = console.getPropertyAsFunction(runtime, "log");
    log.call(runtime, jsi::String::createFromUtf8(runtime, "[CPP] " + message));
}
