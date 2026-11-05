#include "dht11.h"
#include <vector>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

static int checks = 0;
static void expect(bool condition, const char *message) {
    ++checks;
    if (!condition) { fprintf(stderr, "FAIL: %s\n", message); exit(1); }
}

struct Edge { uint32_t at; bool high; };
struct WaveBus {
    std::vector<Edge> edges;
    uint32_t time, step, origin;
    unsigned reads;
    bool frozen;
    WaveBus(unsigned tick = 1, uint32_t base = 0)
        : time(0), step(tick), origin(base), reads(0), frozen(false) {}
    uint32_t now() { if (!frozen) time += step; return origin + time; }
    bool high() {
        ++reads;
        bool level = true;
        for (unsigned i = 0; i < edges.size() && edges[i].at <= time; ++i)
            level = edges[i].high;
        return level;
    }
};

static WaveBus frame(const uint8_t *data, unsigned tick = 1,
                     unsigned zero = 27, unsigned one = 70, unsigned low = 50,
                     uint32_t base = 0) {
    WaveBus bus(tick, base);
    bus.edges.push_back({30, false});
    bus.edges.push_back({110, true});
    uint32_t t = 190;
    bus.edges.push_back({t, false});
    for (int i = 0; i < 40; ++i) {
        t += low;
        bus.edges.push_back({t, true});
        t += (data[i / 8] & (1 << (7 - i % 8))) ? one : zero;
        bus.edges.push_back({t, false});
    }
    bus.edges.push_back({t + 50, true});
    return bus;
}

int main() {
    using namespace ezmaker::dht11;
    const uint8_t good[5] = {60, 1, 23, 5, 89};
    const int packed = (601 << 12) | 235;
    expect(decode(good) == packed, "fractional humidity and temperature packing");
    const uint8_t empty[5] = {0,0,0,0,0};
    expect(decode(empty) == EMPTY_DATA, "empty data rejected");
    const uint8_t wrapped[5] = {255,255,255,255,252};
    expect(decode(wrapped) == ((2805 << 12) | 2805), "legacy checksum modulo 256 and full bytes");
    Counter16Clock clock;
    expect(clock.advance(65530) == 0, "16-bit clock origin");
    expect(clock.advance(65535) == 5, "16-bit clock advance");
    expect(clock.advance(2) == 8, "16-bit runtime timer rollover");
    expect(clock.advance(100) == 106, "16-bit clock continues after rollover");

    for (unsigned tick = 1; tick <= 4; ++tick) {
        for (unsigned zero = 26; zero <= 28; ++zero) {
            WaveBus bus = frame(good, tick, zero);
            expect(receive(bus) == packed, "valid waveform at different poll costs / zero widths");
            expect(bus.time < FRAME_TIMEOUT_US, "valid frame within deadline");
        }
        WaveBus bus = frame(good, tick, 27, 70, 50, 0xfffff800);
        expect(receive(bus) == packed, "32-bit microsecond clock rollover");
    }
    for (int bit = 0; bit < 40; ++bit) {
        uint8_t damaged[5]; memcpy(damaged, good, 5);
        damaged[bit / 8] ^= 1 << (7 - bit % 8);
        WaveBus bus = frame(damaged);
        expect(receive(bus) == CHECKSUM_ERROR, "single-bit corruption including checksum");
    }
    WaveBus zeros = frame(empty);
    expect(receive(zeros) == EMPTY_DATA, "all-zero waveform");
    WaveBus high;
    expect(receive(high) == NO_RESPONSE && high.time < 200, "absent / stuck-high response is bounded");
    WaveBus low; low.edges.push_back({0, false});
    expect(receive(low) == RESPONSE_TIMEOUT && low.time < 200, "stuck-low response is bounded");
    WaveBus responseHigh; responseHigh.edges.push_back({30,false}); responseHigh.edges.push_back({110,true});
    expect(receive(responseHigh) == RESPONSE_TIMEOUT && responseHigh.time < 300, "response high timeout");
    // Cut the sensor stream at every data edge, leaving either state stuck.
    WaveBus complete = frame(good);
    for (unsigned edge = 3; edge + 1 < complete.edges.size(); ++edge) {
        WaveBus broken = complete;
        broken.edges.resize(edge + 1);
        expect(receive(broken) == DATA_TIMEOUT, "every truncated data pulse returns timeout");
        expect(broken.time < FRAME_TIMEOUT_US + 10, "truncated frame deadline");
    }
    WaveBus slow = frame(good, 1, 110, 110, 110);
    expect(receive(slow) == DATA_TIMEOUT, "total-frame deadline even when every edge is within its timeout");
    expect(slow.time < FRAME_TIMEOUT_US + 10, "total-frame deadline bounds time");
    WaveBus frozen; frozen.frozen = true; frozen.edges.push_back({0,false});
    expect(receive(frozen) == RESPONSE_TIMEOUT && frozen.reads < 4100, "stopped clock still terminates via poll limit");
    printf("PASS: %d native DHT11 waveform/timeout/checksum/clock checks. Physical GPIO timing still needs V1/V2 tests.\n", checks);
}
