# setNeoPixelBar

Set and immediately send all 7 pixel colors in argument order.

```sig
ezmaker.setNeoPixelBar(EZMakerDigitalPin.P8, 0xff0000, 0xff3f00, 0xff7f00, 0xffff00, 0x7fff00, 0x00ff00, 0x00ff7f)
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

## Returns

No value; sends the complete palette.

## Connection and behavior

With power off, connect the module signal to the selected port. Follow the actual module and shield instructions for power, GND and signal wiring.

c1 is index 0 and c7 is index 6. This block selects the 7-pixel Bar size automatically; set brightness using the same type.

The simulator does not establish the electrical behavior of an attached module; check observations on the actual board.

## Example and expected result

A shows 7 ordered colors; B clears the matching module.

```blocks
// Observe the following actions on the connected module.
ezmaker.setNeoPixelBrightness(EZMakerNeoPixelType.Bar, EZMakerDigitalPin.P8, 32)
input.onButtonPressed(Button.A, function () {
    ezmaker.setNeoPixelBar(EZMakerDigitalPin.P8, 0xff0000, 0xff3f00, 0xff7f00, 0xffff00, 0x7fff00, 0x00ff00, 0x00ff7f)
})
input.onButtonPressed(Button.B, function () {
    ezmaker.clearNeoPixel(EZMakerNeoPixelType.Bar, EZMakerDigitalPin.P8)
})
```

## See also

- [All block references](https://github.com/YoungJJlab/pxt-ezmakershield-microbit/blob/main/docs/reference/README.md)
- [Setup and classroom lessons](https://github.com/YoungJJlab/pxt-ezmakershield-microbit/blob/main/README.md)

```package
pxt-ezmakershield-microbit=github:YoungJJlab/pxt-ezmakershield-microbit
```
