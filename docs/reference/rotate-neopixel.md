# rotateNeoPixel

Move pixel colors by a signed offset, wrapping at the ends, and send the buffer.

```sig
ezmaker.rotateNeoPixel(EZMakerNeoPixelType.Ring, EZMakerDigitalPin.P8, 1)
```

## Parameters

- **npType**: actual module size: Single=1, Bar=7 or Ring=12 pixels
- **pin**: digital signal pin P8, P12, P13 or P16
- **offset**: pixel offset: positive towards higher indices, negative towards lower; default 1

## Returns

No value; updates and sends the existing colors.

## Connection and behavior

With power off, connect the module signal to the selected port. Follow the actual module and shield instructions for power, GND and signal wiring.

Colors wrap around; none are discarded. Repeating an offset of 1 for the module length restores the pattern.

The simulator does not establish the electrical behavior of an attached module; check observations on the actual board.

## Example and expected result

A moves the red pixel to the next index; after 12 presses it returns to index 0.

```blocks
// Observe the following actions on the connected module.
ezmaker.setNeoPixelBrightness(EZMakerNeoPixelType.Ring, EZMakerDigitalPin.P8, 32)
ezmaker.clearNeoPixel(EZMakerNeoPixelType.Ring, EZMakerDigitalPin.P8)
ezmaker.setNeoPixelPixelColor(EZMakerNeoPixelType.Ring, EZMakerDigitalPin.P8, 0, 0xff0000)
input.onButtonPressed(Button.A, function () {
    ezmaker.rotateNeoPixel(EZMakerNeoPixelType.Ring, EZMakerDigitalPin.P8, 1)
})
```

## See also

- [All block references](https://github.com/YoungJJlab/pxt-ezmakershield-microbit/blob/main/docs/reference/README.md)
- [Setup and classroom lessons](https://github.com/YoungJJlab/pxt-ezmakershield-microbit/blob/main/README.md)

```package
pxt-ezmakershield-microbit=github:YoungJJlab/pxt-ezmakershield-microbit
```
