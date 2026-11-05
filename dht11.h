#ifndef EZMAKER_DHT11_H
#define EZMAKER_DHT11_H

#include <stdint.h>

namespace ezmaker {
namespace dht11 {
    // Keep the existing public error values. Add bounded response/data waits.
    const int NO_RESPONSE = -4;
    const int RESPONSE_TIMEOUT = -5;
    const int DATA_TIMEOUT = -6;
    const int EMPTY_DATA = -7;
    const int CHECKSUM_ERROR = -8;
    const uint32_t EDGE_TIMEOUT_US = 120;
    const uint32_t FRAME_TIMEOUT_US = 6000;

    class Counter16Clock {
        bool started;
        uint16_t previous;
        uint32_t elapsed;
    public:
        Counter16Clock() : started(false), previous(0), elapsed(0) {}
        uint32_t advance(uint16_t tick) {
            if (started) elapsed += uint16_t(tick - previous);
            previous = tick;
            started = true;
            return elapsed;
        }
    };

    // Both decimal components retain the previous bytes[n] / 10 convention.
    // Each value fits in 12 bits even for a full byte (255 * 10 + 255).
    inline int decode(const uint8_t *data) {
        if (!(data[0] || data[1] || data[2] || data[3])) return EMPTY_DATA;
        if (uint8_t(data[0] + data[1] + data[2] + data[3]) != data[4])
            return CHECKSUM_ERROR;
        return ((data[0] * 10 + data[1]) << 12) | (data[2] * 10 + data[3]);
    }

    template<typename Bus>
    bool waitFor(Bus &bus, bool level, uint32_t frameStart, uint32_t &edgeTime) {
        uint32_t start = bus.now();
        // The clock deadlines are primary; the poll limit also guarantees
        // termination if a platform timer unexpectedly stops advancing.
        for (unsigned polls = 0; polls < 4096; ++polls) {
            bool value = bus.high();
            uint32_t now = bus.now();
            if (uint32_t(now - start) >= EDGE_TIMEOUT_US
                || uint32_t(now - frameStart) >= FRAME_TIMEOUT_US) return false;
            if (value == level) {
                edgeTime = now;
                return true;
            }
        }
        return false;
    }

    // Bus supplies the real GPIO level and a monotonically advancing us clock.
    // The same receiver is exercised with recorded-shape waveforms in tests.
    template<typename Bus>
    int receive(Bus &bus) {
        uint32_t start = bus.now(), edge = start;
        if (!waitFor(bus, false, start, edge)) return NO_RESPONSE;
        if (!waitFor(bus, true, start, edge)) return RESPONSE_TIMEOUT;
        if (!waitFor(bus, false, start, edge)) return RESPONSE_TIMEOUT;

        uint8_t data[5] = {0, 0, 0, 0, 0};
        for (int i = 0; i < 40; ++i) {
            uint32_t highStart;
            if (!waitFor(bus, true, start, highStart)) return DATA_TIMEOUT;
            if (!waitFor(bus, false, start, edge)) return DATA_TIMEOUT;
            // Nominal high widths are 26-28 us for 0 and 70 us for 1.
            if (uint32_t(edge - highStart) > 50)
                data[i / 8] |= uint8_t(1 << (7 - (i % 8)));
        }
        if (!waitFor(bus, true, start, edge)) return DATA_TIMEOUT;
        return decode(data);
    }
}
}
#endif
