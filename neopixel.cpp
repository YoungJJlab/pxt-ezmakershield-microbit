#include "pxt.h"

using namespace pxt;

#if MICROBIT_CODAL
namespace light {
    void sendWS2812Buffer(Buffer buf, int pin);
}
#else
extern "C" void ezmaker_neopixel_send_v1(const uint8_t *data, int length,
                                        uint32_t mask, volatile uint32_t *outset);
#endif

namespace ezmaker {
    //%
    void sendNeoPixelBuffer(Buffer buffer, int pin) {
        if (!buffer || buffer->length == 0) return;
#if MICROBIT_CODAL
        // CODAL's sender already stops when its byte count reaches zero.
        light::sendWS2812Buffer(buffer, pin);
#else
        MicroBitPin *p = getPin(pin);
        if (!p) return;
        p->setDigitalValue(0);
        sleep_us(300); // latch the preceding frame before starting a new one
        uint32_t mask = uint32_t(1) << unsigned(p->name);
        uint32_t interruptMask = __get_PRIMASK();
        __disable_irq();
        ezmaker_neopixel_send_v1(buffer->data, buffer->length, mask, &NRF_GPIO->OUTSET);
        __set_PRIMASK(interruptMask);
#endif
    }
}
