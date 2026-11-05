#include "pxt.h"
#include "bmp280.h"

using namespace pxt;

namespace {
#if MICROBIT_CODAL
    typedef uint8_t *BMP280Buffer;
#else
    typedef char *BMP280Buffer;
#endif
    class BMP280Bus {
    public:
        bool read(int address, uint8_t reg, uint8_t *data, unsigned length) {
            // DAL and CODAL I2C APIs use the shifted address; public channels use 7-bit addresses.
            uint8_t pointer = reg;
            if (uBit.i2c.write(address << 1, (BMP280Buffer)&pointer, 1, true) != 0) return false;
            return uBit.i2c.read(address << 1, (BMP280Buffer)data, length, false) == 0;
        }
        bool write(int address, uint8_t reg, uint8_t value) {
            uint8_t data[2] = {reg, value};
            return uBit.i2c.write(address << 1, (BMP280Buffer)data, sizeof(data), false) == 0;
        }
        void sleep(unsigned ms) { uBit.sleep(ms); }
    };
}

namespace ezmaker {
    //%
    TNumber readBMP280Native(TNumber channel, TNumber type, TNumber reference) {
        BMP280Bus bus;
        return fromDouble(bmp280::read(bus, toDouble(channel), toDouble(type), toDouble(reference)));
    }
}
