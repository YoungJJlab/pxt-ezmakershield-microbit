#ifndef EZMAKER_BMP280_H
#define EZMAKER_BMP280_H

#include <stdint.h>
#include <math.h>

namespace ezmaker { namespace bmp280 {
    const double Error = -9999.0;
    inline bool *busyChannels() { static bool busy[2] = {false, false}; return busy; }

    template<class Bus> class Lock {
        bool acquired;
        int channel;
    public:
        Lock(Bus &bus, int ch) : acquired(false), channel(ch) {
            unsigned attempts = 0;
            while (busyChannels()[ch] && attempts < 1000) { bus.sleep(1); ++attempts; }
            if (!busyChannels()[ch]) { busyChannels()[ch] = true; acquired = true; }
        }
        ~Lock() { if (acquired) busyChannels()[channel] = false; }
        bool ready() const { return acquired; }
    };

    inline int coefficient(const uint8_t *data, unsigned offset, bool isSigned) {
        int value = data[offset] + int(data[offset + 1]) * 256;
        return isSigned && value >= 32768 ? value - 65536 : value;
    }

    template<class Bus> bool waitReady(Bus &bus, int address) {
        for (unsigned attempt = 0; attempt <= 20; ++attempt) {
            uint8_t status = 0;
            if (!bus.read(address, 0xF3, &status, 1)) return false;
            if ((status & 0x09) == 0) return true;
            if (attempt < 20) bus.sleep(5);
        }
        return false;
    }

    struct Sample { double pressure, temperature; };

    inline bool compensate(const uint8_t *cal, int32_t adcP, int32_t adcT, Sample &sample) {
        // Bosch BMP280 datasheet appendix 8.1. t_fine belongs to this sample only.
        double a = (adcT / 16384.0 - coefficient(cal, 0, false) / 1024.0) * coefficient(cal, 2, true);
        double delta = adcT / 131072.0 - coefficient(cal, 0, false) / 8192.0;
        double sum = a + delta * delta * coefficient(cal, 4, true);
        sample.temperature = sum / 5120.0;
        int32_t fine = int32_t(sum);
        double v1 = fine / 2.0 - 64000.0;
        double v2 = v1 * v1 * coefficient(cal, 16, true) / 32768.0;
        v2 += v1 * coefficient(cal, 14, true) * 2.0;
        v2 = v2 / 4.0 + coefficient(cal, 12, true) * 65536.0;
        v1 = (coefficient(cal, 10, true) * v1 * v1 / 524288.0 + coefficient(cal, 8, true) * v1) / 524288.0;
        v1 = (1.0 + v1 / 32768.0) * coefficient(cal, 6, false);
        if (v1 == 0) return false;
        double p = (1048576.0 - adcP - v2 / 4096.0) * 6250.0 / v1;
        v1 = coefficient(cal, 22, true) * p * p / 2147483648.0;
        v2 = p * coefficient(cal, 20, true) / 32768.0;
        sample.pressure = (p + (v1 + v2 + coefficient(cal, 18, true)) / 16.0) / 100.0;
        return sample.temperature >= -40 && sample.temperature <= 85
            && sample.pressure >= 300 && sample.pressure <= 1100;
    }

    template<class Bus> bool measure(Bus &bus, int address, Sample &sample) {
        uint8_t id = 0;
        if (!bus.read(address, 0xD0, &id, 1) || id != 0x58) return false;
        if (!waitReady(bus, address)) return false;
        // Sleep first: configuration changes are guaranteed to apply in sleep mode.
        if (!bus.write(address, 0xF4, 0x2C) || !waitReady(bus, address)) return false;
        uint8_t cal[24];
        if (!bus.read(address, 0x88, cal, sizeof(cal))) return false;
        bool allOnes = true;
        for (unsigned i = 0; i < sizeof(cal); ++i) if (cal[i] != 255) allOnes = false;
        if (allOnes || coefficient(cal, 6, false) == 0) return false;
        if (!bus.write(address, 0xF5, 0)) return false;
        // Temperature x1, pressure x4, forced mode; maximum conversion 13.3 ms.
        if (!bus.write(address, 0xF4, 0x2D)) return false;
        bus.sleep(15);
        if (!waitReady(bus, address)) return false;
        uint8_t raw[6];
        if (!bus.read(address, 0xF7, raw, sizeof(raw))) return false;
        int32_t adcP = int32_t(raw[0]) * 4096 + int32_t(raw[1]) * 16 + (raw[2] >> 4);
        int32_t adcT = int32_t(raw[3]) * 4096 + int32_t(raw[4]) * 16 + (raw[5] >> 4);
        if (adcP == 0x80000 || adcT == 0x80000 || adcP == 0xFFFFF || adcT == 0xFFFFF) return false;
        return compensate(cal, adcP, adcT, sample);
    }

    template<class Bus> double read(Bus &bus, double channel, double type, double reference) {
        if ((channel != 0 && channel != 1) || (type != 0 && type != 1 && type != 2)) return Error;
        if (type == 1 && !(reference > 0 && isfinite(reference))) return Error;
        Lock<Bus> lock(bus, channel == 0 ? 0 : 1);
        if (!lock.ready()) return Error;
        Sample sample;
        if (!measure(bus, channel == 0 ? 0x77 : 0x76, sample)) return Error;
        double value = type == 2 ? sample.temperature : sample.pressure;
        // Same exp/log identity used by PXT Math.pow on V1: avoid linking an extra 4 KB pow.
        if (type == 1) value = 44330.0 * (1.0 - exp(0.1903 * log(sample.pressure / reference)));
        if (!isfinite(value)) return Error;
        // Match MakeCode Math.round, including negative values at half steps.
        return floor(value * 100.0 + 0.5) / 100.0;
    }
} }
#endif
