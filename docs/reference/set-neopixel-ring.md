# setNeoPixelRing

Set and immediately send all 12 pixel colors in argument order.

```sig
ezmaker.setNeoPixelRing(EZMakerDigitalPin.P8, 0xff0000, 0xff3f00, 0xff7f00, 0xffff00, 0x7fff00, 0x00ff00, 0x00ff7f, 0x00ffff, 0x0000ff, 0x4b0082, 0x8a2be2, 0xff00ff)
```

## Parameters

- **pin**: digital signal pin P8, P12, P13 or P16
- **c1**: RGB 0xRRGGBB color for pixel index 0
- **c2**: RGB 0xRRGGBB color for pixel index 1
- **c3**: RGB 0xRRGGBB color for pixel index 2
- **c4**: RGB 0xRRGGBB color for pixel index 3
- **c5**: RGB 0xRRGGBB color for pixel index 4
- **c6**: RGB 0xRRGGBB color for pixel index 5
- **c7**: RGB 0xRRGGBB color for pixel index 6
- **c8**: RGB 0xRRGGBB color for pixel index 7
- **c9**: RGB 0xRRGGBB color for pixel index 8
- **c10**: RGB 0xRRGGBB color for pixel index 9
- **c11**: RGB 0xRRGGBB color for pixel index 10
- **c12**: RGB 0xRRGGBB color for pixel index 11

## Returns

No value; sends the complete palette.

## Connection and behavior

With power off, connect the module signal to the selected port. Follow the actual module and shield instructions for power, GND and signal wiring.

c1 is index 0 and c12 is index 11. This block selects the 12-pixel Ring size automatically; set brightness using the same type.

The simulator does not establish the electrical behavior of an attached module; check observations on the actual board.

## Example and expected result

A shows 12 ordered colors; B clears the matching module.

```blocks
// Observe the following actions on the connected module.
ezmaker.setNeoPixelBrightness(EZMakerNeoPixelType.Ring, EZMakerDigitalPin.P8, 32)
input.onButtonPressed(Button.A, function () {
    ezmaker.setNeoPixelRing(EZMakerDigitalPin.P8, 0xff0000, 0xff3f00, 0xff7f00, 0xffff00, 0x7fff00, 0x00ff00, 0x00ff7f, 0x00ffff, 0x0000ff, 0x4b0082, 0x8a2be2, 0xff00ff)
})
input.onButtonPressed(Button.B, function () {
    ezmaker.clearNeoPixel(EZMakerNeoPixelType.Ring, EZMakerDigitalPin.P8)
})
```

## See also

- [All block references](https://github.com/YoungJJlab/pxt-ezmakershield-microbit/blob/main/docs/reference/README.md)
- [Setup and classroom lessons](https://github.com/YoungJJlab/pxt-ezmakershield-microbit/blob/main/README.md)

```package
pxt-ezmakershield-microbit=github:YoungJJlab/pxt-ezmakershield-microbit
```
