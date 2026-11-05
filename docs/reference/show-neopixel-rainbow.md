# showNeoPixelRainbow

Fill and send a static hue gradient; this block does not animate it over time.

```sig
ezmaker.showNeoPixelRainbow(EZMakerNeoPixelType.Ring, EZMakerDigitalPin.P8, 1, 360)
```

## Parameters

- **npType**: actual module size: Single=1, Bar=7 or Ring=12 pixels
- **pin**: digital signal pin P8, P12, P13 or P16
- **startHue**: starting hue 1–360; default 1
- **endHue**: ending hue 1–360; default 360

## Returns

No value; fills and sends the gradient.

## Connection and behavior

With power off, connect the module signal to the selected port. Follow the actual module and shield instructions for power, GND and signal wiring.

Use rotate or repeated updates for movement. A one-pixel module can display only one sampled color.

The simulator does not establish the electrical behavior of an attached module; check observations on the actual board.

## Example and expected result

A displays a static rainbow across the ring; B clears it.

```blocks
// Observe the following actions on the connected module.
ezmaker.setNeoPixelBrightness(EZMakerNeoPixelType.Ring, EZMakerDigitalPin.P8, 32)
input.onButtonPressed(Button.A, function () {
    ezmaker.showNeoPixelRainbow(EZMakerNeoPixelType.Ring, EZMakerDigitalPin.P8, 1, 360)
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
