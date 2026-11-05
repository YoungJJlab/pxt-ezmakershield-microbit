#ifndef EZMAKER_TEMPERATURE_H
#define EZMAKER_TEMPERATURE_H

#include <stdint.h>
#include <math.h>

namespace ezmaker {
namespace temperature {
    // Dallas/Maxim CRC-8: x^8 + x^5 + x^4 + 1, least-significant bit first.
    inline bool validScratchpad(const uint8_t *data) {
        uint8_t crc = 0;
        bool allZero = true, allOne = true;
        for (int i = 0; i < 9; ++i) {
            allZero = allZero && data[i] == 0;
            allOne = allOne && data[i] == 0xFF;
            uint8_t value = data[i];
            for (int j = 0; j < 8; ++j, value >>= 1) {
                bool mix = (crc ^ value) & 1;
                crc >>= 1;
                if (mix) crc ^= 0x8C;
            }
        }
        return !allZero && !allOne && crc == 0;
    }

    inline bool decode(const uint8_t *data, bool thermocouple, float &temperature) {
        if (!validScratchpad(data)) return false;
        int16_t raw = int16_t((uint16_t(data[1]) << 8) | data[0]);
        if (thermocouple) {
            if (data[0] & 1) return false; // open/shorted thermocouple fault
            raw = int16_t(uint16_t(raw) & 0xFFFC);
            temperature = roundf((raw / 16.0f) * 10.0f) / 10.0f;
        } else {
            // Confirm that our configuration write reached the intended sensor.
            if (data[2] != 0xFF || data[3] != 0x80 || data[4] != 0x7F) return false;
            temperature = raw / 16.0f;
            if (temperature < -55.0f || temperature > 125.0f) return false;
        }
        return true;
    }
}
}
#endif
