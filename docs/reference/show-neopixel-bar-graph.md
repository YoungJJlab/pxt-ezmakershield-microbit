# showNeoPixelBarGraph

Show the magnitude of a value against a positive maximum. Zero and nonpositive maxima use marker pixels; clear explicitly to switch off.

```sig
ezmaker.showNeoPixelBarGraph(EZMakerNeoPixelType.Ring, EZMakerDigitalPin.P8, 128, 255)
```

## Parameters

- **npType**: actual module size: Single=1, Bar=7 or Ring=12 pixels
- **pin**: digital signal pin P8, P12, P13 or P16
- **value**: value to plot; the library uses its absolute magnitude
- **high**: positive maximum for the fixed scale; default 255

## Returns

No value; overwrites and sends the graph colors.

## Connection and behavior

With power off, connect the module signal to the selected port. Follow the actual module and shield instructions for power, GND and signal wiring.

With the pinned library, high <= 0 shows a yellow first pixel, not automatic scaling. For positive high, floor(abs(value) × pixelCount / high) sets the extent: extent 0 shows a dim first-pixel marker; otherwise indices 0 through extent are colored, limited by the module length. Use clearNeoPixel for a fully black output.

The simulator does not establish the electrical behavior of an attached module; check observations on the actual board.

## Example and expected result

A displays a partially filled graph; B clears all pixels. Compare values with the same positive maximum.

```blocks
// Observe the following actions on the connected module.
ezmaker.setNeoPixelBrightness(EZMakerNeoPixelType.Ring, EZMakerDigitalPin.P8, 32)
input.onButtonPressed(Button.A, function () {
    ezmaker.showNeoPixelBarGraph(EZMakerNeoPixelType.Ring, EZMakerDigitalPin.P8, 128, 255)
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
