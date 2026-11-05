#include "temperature.h"
#include <stdio.h>
#include <string.h>
#include <stdlib.h>

static int checks = 0;
static void expect(bool condition, const char *message) {
    ++checks;
    if (!condition) { fprintf(stderr, "FAIL: %s\n", message); exit(1); }
}

int main() {
    using namespace ezmaker::temperature;
    // Datasheet-format scratchpads with fixed CRC bytes (not calculated by the
    // implementation under test). DS markers match the driver's 12-bit config.
    const uint8_t dsPositive[9] = {0x91,0x01,0xff,0x80,0x7f,0xff,0x0c,0x10,0x15};
    const uint8_t dsNegative[9] = {0x5e,0xff,0xff,0x80,0x7f,0xff,0x0c,0x10,0x0f};
    const uint8_t dsZero[9] = {0,0,0xff,0x80,0x7f,0xff,0x0c,0x10,0xad};
    const uint8_t dsMinimum[9] = {0x90,0xfc,0xff,0x80,0x7f,0xff,0x0c,0x10,0x2a};
    const uint8_t dsMaximum[9] = {0xd0,7,0xff,0x80,0x7f,0xff,0x0c,0x10,0x91};
    const uint8_t dsOutOfRange[9] = {0xe0,7,0xff,0x80,0x7f,0xff,0x0c,0x10,0x6d};
    const uint8_t dsWrongConfig[9] = {0x91,1,0xff,0x80,0x1f,0xff,0x0c,0x10,0x85};
    const uint8_t maxPositive[9] = {0x94,1,0,0,0,0xff,0xff,0xff,0x88};
    const uint8_t maxNegative[9] = {0x6c,0xff,0,0,0,0xff,0xff,0xff,0xbe};
    const uint8_t maxZero[9] = {0,0,0,0,0,0xff,0xff,0xff,0x66};
    const uint8_t maxFault[9] = {0x95,1,0,0,0,0xff,0xff,0xff,0xcb};
    const uint8_t reference[9] = {0x50,5,0x4b,0x46,0x7f,0xff,0x0c,0x10,0x1c};
    float value;
    expect(validScratchpad(reference), "DS18B20 standard +85 C CRC vector");
    expect(decode(dsPositive, false, value) && value == 25.0625f, "DS positive fractional temperature");
    expect(decode(dsNegative, false, value) && value == -10.125f, "DS sign extension");
    expect(decode(dsZero, false, value) && value == 0, "DS valid zero is not a missing sensor");
    expect(decode(dsMinimum, false, value) && value == -55, "DS lower limit");
    expect(decode(dsMaximum, false, value) && value == 125, "DS upper limit");
    expect(validScratchpad(dsOutOfRange) && !decode(dsOutOfRange, false, value), "DS out-of-range data");
    expect(validScratchpad(dsWrongConfig) && !decode(dsWrongConfig, false, value), "DS config mismatch with valid CRC");
    expect(decode(maxPositive, true, value) && fabsf(value - 25.3f) < 0.001f, "MAX positive rounding");
    expect(decode(maxNegative, true, value) && fabsf(value + 9.3f) < 0.001f, "MAX negative rounding");
    expect(decode(maxZero, true, value) && value == 0, "MAX valid zero");
    expect(validScratchpad(maxFault) && !decode(maxFault, true, value), "MAX thermocouple fault with valid CRC");
    uint8_t damaged[9];
    for (int sensor = 0; sensor < 2; ++sensor) {
        const uint8_t *good = sensor ? maxPositive : dsPositive;
        for (int bit = 0; bit < 72; ++bit) {
            memcpy(damaged, good, 9);
            damaged[bit / 8] ^= 1 << (bit % 8);
            expect(!decode(damaged, sensor != 0, value), "single-bit corruption, including CRC byte");
        }
        memset(damaged, 0, 9);
        expect(!decode(damaged, sensor != 0, value), "stuck-low/all-zero scratchpad");
        memset(damaged, 0xff, 9);
        expect(!decode(damaged, sensor != 0, value), "disconnected/all-one scratchpad");
    }
    printf("PASS: %d native CRC/temperature/fault checks. Physical timing still needs V1/V2 sensor tests.\n", checks);
}
