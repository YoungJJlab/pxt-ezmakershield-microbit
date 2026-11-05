#include "pxt.h"
#include "dht11.h"

using namespace pxt;

namespace {
    class DHT11Bus {
        MicroBitPin *pin;
        NRF_GPIO_Type *gpio;
        uint32_t bit;
        unsigned index;
#if !MICROBIT_CODAL
        ezmaker::dht11::Counter16Clock clock;
#endif
    public:
        explicit DHT11Bus(MicroBitPin *p) : pin(p) {
            index = unsigned(pin->name);
#if MICROBIT_CODAL
            gpio = index < 32 ? NRF_P0 : NRF_P1;
#else
            gpio = NRF_GPIO;
#endif
            index &= 31;
            bit = uint32_t(1) << index;
            pin->setDigitalValue(0);
        }
        ~DHT11Bus() { pin->getDigitalValue(); }

        void release() {
            // Change ownership through DAL/CODAL, then enable the same weak
            // pull-up on either Nordic GPIO bank. No mBed API is called.
            pin->getDigitalValue();
            gpio->PIN_CNF[index] = (gpio->PIN_CNF[index] & ~GPIO_PIN_CNF_PULL_Msk)
                | (GPIO_PIN_CNF_PULL_Pullup << GPIO_PIN_CNF_PULL_Pos);
        }
        bool high() { return (gpio->IN & bit) != 0; }
        uint32_t now() {
#if MICROBIT_CODAL
            return uint32_t(system_timer_current_time_us());
#else
            // DAL's time accessor reads AND resets its software Timer; polling
            // it here loses the read-to-reset time on every edge. Instead read
            // the existing 1 MHz, 16-bit runtime counter through its capture
            // channel, while interrupts are masked. Never reconfigure/start/
            // stop that timer or consume an additional timer resource.
            NRF_TIMER1->TASKS_CAPTURE[2] = 1;
            return clock.advance(uint16_t(NRF_TIMER1->CC[2]));
#endif
        }
    };

    class DHT11FrameGuard {
        uint32_t mask;
    public:
        DHT11FrameGuard() : mask(__get_PRIMASK()) {
#if MICROBIT_CODAL
            // CODAL's time accessor uses its nested interrupt counter.
            target_disable_irq();
#else
            __disable_irq();
#endif
        }
        ~DHT11FrameGuard() {
#if MICROBIT_CODAL
            target_enable_irq();
#endif
            __set_PRIMASK(mask);
        }
    };
}

namespace ezmaker {
    //%
    int readDHT11(int pin) {
        MicroBitPin *p = getPin(pin);
        if (!p) return -1;
        DHT11Bus bus(p);
        // Interrupts remain enabled during the 18 ms start signal, yielding to
        // other fibers. The TypeScript wrapper serializes DHT11 measurements.
        uBit.sleep(18);
        DHT11FrameGuard guard;
        bus.release();
        // Protect only the roughly 4 ms receive frame (deadline: 6 ms).
        // Both the interrupt mask and input mode are restored on every return.
        return dht11::receive(bus);
    }
}
