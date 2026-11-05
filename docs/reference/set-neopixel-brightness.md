# setNeoPixelBrightness

Set brightness (0–255) for subsequent color writes. Existing buffered colors are not rescaled; rewrite the color to apply it.

```sig
ezmaker.setNeoPixelBrightness(EZMakerNeoPixelType.Ring, EZMakerDigitalPin.P8, 32)
```

## Parameters

- **npType**: actual module size: Single=1, Bar=7 or Ring=12 pixels
- **pin**: digital signal pin P8, P12, P13 or P16
- **brightness**: brightness for later color writes, 0–255; use 32 to start

## Returns

No value; stores brightness and sends the current buffer without rescaling its existing bytes.

## Connection and behavior

With power off, connect the module signal to the selected port. Follow the actual module and shield instructions for power, GND and signal wiring.

Initial brightness is 128. The pinned NeoPixel library scales colors when writing them, so changing brightness alone does not dim already buffered colors. Set brightness, then write the desired color. Stay within 0–255.

The simulator does not establish the electrical behavior of an attached module; check observations on the actual board.

## Example and expected result

Compare A (red at 32) and B (red at 8). Both handlers rewrite the color after setting brightness.

```blocks
// Observe the following actions on the connected module.
input.onButtonPressed(Button.A, function () {
    ezmaker.setNeoPixelBrightness(EZMakerNeoPixelType.Ring, EZMakerDigitalPin.P8, 32)
    ezmaker.setNeoPixelColorAll(EZMakerNeoPixelType.Ring, EZMakerDigitalPin.P8, 0xff0000)
})
input.onButtonPressed(Button.B, function () {
    ezmaker.setNeoPixelBrightness(EZMakerNeoPixelType.Ring, EZMakerDigitalPin.P8, 8)
    ezmaker.setNeoPixelColorAll(EZMakerNeoPixelType.Ring, EZMakerDigitalPin.P8, 0xff0000)
})
```

## See also

- [All block references](https://github.com/YoungJJlab/pxt-ezmakershield-microbit/blob/main/docs/reference/README.md)
- [Setup and classroom lessons](https://github.com/YoungJJlab/pxt-ezmakershield-microbit/blob/main/README.md)

```package
pxt-ezmakershield-microbit=github:YoungJJlab/pxt-ezmakershield-microbit
```
