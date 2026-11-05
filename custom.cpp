#include "pxt.h"
#include "temperature.h"

using namespace pxt;

namespace {
    // Both runtimes own the pin configuration and scheduler. Nordic registers
    // provide open-drain slots without allocating a DAL DigitalIn/Out per bit.
    // No mBed GPIO types, functions, or separately allocated timers are used.
    bool temperatureBusBusy = false;

    class TemperatureBusLock {
        bool acquired;
    public:
        TemperatureBusLock() : acquired(false) {
            uint32_t start = current_time_ms();
            while (temperatureBusBusy) {
                if (uint32_t(current_time_ms() - start) >= 3000) return;
                uBit.sleep(1);
            }
            temperatureBusBusy = true;
            acquired = true;
        }
        ~TemperatureBusLock() { if (acquired) temperatureBusBusy = false; }
        bool ready() const { return acquired; }
    };

    // Preserve the caller's interrupt mask, including on early return. Only
    // individual slots / presence sampling are protected, never conversion waits.
    class SlotGuard {
        uint32_t mask;
    public:
        SlotGuard() : mask(__get_PRIMASK()) { __disable_irq(); }
        ~SlotGuard() { __set_PRIMASK(mask); }
    };

    // Read sampling must occur within 15 us of the falling edge. Fixed NOPs
    // avoid the V1 timer-read overhead of a general-purpose microsecond wait.
    // micro:bit V1: nRF51 at 16 MHz; V2: nRF52833 at 64 MHz.
    // Keep the NOP sequences out of line: GCC 5 cannot account for .rept size
    // when selecting Cortex-M0 conditional branches around an inline sequence.
    template<int us> __attribute__((noinline)) void slotWait() {
#if MICROBIT_CODAL
        __asm volatile (".rept %c0\n\tnop\n\t.endr" :: "i" (us * 64) : "memory");
#else
        __asm volatile (".rept %c0\n\tnop\n\t.endr" :: "i" (us * 16) : "memory");
#endif
    }

    class TemperatureBus {
        MicroBitPin *pin;
        NRF_GPIO_Type *gpio;
        uint32_t bit;
        unsigned index;

        void openDrain() {
            gpio->PIN_CNF[index] = (gpio->PIN_CNF[index] & ~GPIO_PIN_CNF_DRIVE_Msk)
                | (GPIO_PIN_CNF_DRIVE_S0D1 << GPIO_PIN_CNF_DRIVE_Pos);
        }
        void release() { gpio->OUTSET = bit; }
        void low() { gpio->OUTCLR = bit; }
        bool high() { return (gpio->IN & bit) != 0; }

        void writeBit(bool one, bool powerAfter) {
            SlotGuard guard;
            low();
            if (one) slotWait<6>();
            else sleep_us(65);
            release();
            if (powerAfter) {
                // Hold high during conversion (also supplies a single parasite-
                // powered sensor). Do not issue read slots until it completes.
                gpio->PIN_CNF[index] &= ~GPIO_PIN_CNF_DRIVE_Msk;
            }
            sleep_us(one ? 64 : 5);
        }

        bool readBit() {
            SlotGuard guard;
            low();
            slotWait<3>();
            release();
            slotWait<7>();
            bool value = high();
            sleep_us(60);
            return value;
        }

    public:
        explicit TemperatureBus(MicroBitPin *p) : pin(p) {
            // Initialize once through DAL/CODAL so PWM/touch ownership is
            // released. Enable a weak pull-up during this transaction below.
            pin->getDigitalValue();
            pin->setDigitalValue(1);
            index = unsigned(pin->name);
#if MICROBIT_CODAL
            gpio = index < 32 ? NRF_P0 : NRF_P1;
#else
            gpio = NRF_GPIO;
#endif
            index &= 31;
            bit = uint32_t(1) << index;
            // Connect the input buffer even while the pin is an output.
            gpio->PIN_CNF[index] = (gpio->PIN_CNF[index]
                & ~(GPIO_PIN_CNF_INPUT_Msk | GPIO_PIN_CNF_PULL_Msk))
                | (GPIO_PIN_CNF_PULL_Pullup << GPIO_PIN_CNF_PULL_Pos);
            openDrain();
            release();
            sleep_us(1000);
        }

        ~TemperatureBus() {
            release();
            openDrain();
            pin->getDigitalValue(); // return the pin to runtime-managed input
        }

        bool reset() {
            openDrain();
            release();
            sleep_us(10);
            if (!high()) return false; // short/stuck-low: never wait forever
            low();
            sleep_us(500);
            bool presence;
            {
                SlotGuard guard;
                release();
                // Sample just after the latest 60 us presence start. The V1
                // runtime's timer-call overhead must still fit before the
                // earliest possible end of the presence pulse (75 us).
                sleep_us(60);
                presence = !high();
            }
            sleep_us(440);
            return presence && high();
        }

        void writeByte(uint8_t value, bool powerAfter = false) {
            for (int i = 0; i < 8; ++i, value >>= 1)
                writeBit((value & 1) != 0, powerAfter && i == 7);
        }

        void readScratchpad(uint8_t *data) {
            for (int i = 0; i < 9; ++i) {
                data[i] = 0;
                for (int j = 0; j < 8; ++j)
                    if (readBit()) data[i] |= uint8_t(1 << j);
            }
        }

        bool select() {
            // Skip ROM preserves the existing one-sensor-per-port interface.
            for (int attempt = 0; attempt < 3; ++attempt) {
                if (reset()) {
                    writeByte(0xCC);
                    return true;
                }
            }
            return false;
        }
    };

    float readTemperature(int pin, bool thermocouple) {
        MicroBitPin *p = getPin(pin);
        if (!p) return -999.0f;
        TemperatureBusLock lock;
        if (!lock.ready()) return -999.0f;
        TemperatureBus bus(p);

        if (!thermocouple) {
            if (!bus.select()) return -999.0f;
            bus.writeByte(0x4E); // volatile scratchpad, never EEPROM
            bus.writeByte(0xFF); // retain the previous driver's alarm markers
            bus.writeByte(0x80);
            bus.writeByte(0x7F); // 12-bit DS18B20 conversion
        }
        if (!bus.select()) return -999.0f;
        bus.writeByte(0x44, true);
        // Datasheet maxima: MAX31850 100 ms; DS18B20 750 ms (12 bit).
        // Yield with interrupts enabled and add 10 ms of conversion margin.
        uBit.sleep(thermocouple ? 110 : 760);

        for (int attempt = 0; attempt < 3; ++attempt) {
            if (!bus.select()) continue;
            bus.writeByte(0xBE);
            uint8_t data[9];
            bus.readScratchpad(data);
            float temperature;
            if (ezmaker::temperature::decode(data, thermocouple, temperature))
                return temperature;
        }
        return -999.0f;
    }
}

namespace ezmaker {
    //%
    float readMax31850(int pin) { return readTemperature(pin, true); }

    //%
    float readDS18B20(int pin) { return readTemperature(pin, false); }
}
