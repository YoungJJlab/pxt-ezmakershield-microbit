# writeDigitalPin

Set a DIY-B digital output low (0) or high (1). An unsupported pin is ignored.

```sig
ezmaker.writeDigitalPin(EZMakerDigitalPin.P8, 1)
```

## Parameters

- **pin**: digital signal pin P8, P12, P13 or P16
- **value**: output level: 0 low or 1 high

## Returns

No value. The selected output is updated.

## Connection and behavior

With power off, connect the module signal to the selected port. Follow the actual module and shield instructions for power, GND and signal wiring.

Use a compatible digital output module, not a servo/PWM command. Connect power and GND as specified by the module.

The simulator does not establish the electrical behavior of an attached module; check observations on the actual board.

## Example and expected result

A sets P8 high; B sets it low. Observe a connected compatible indicator module.

```blocks
// Observe the following actions on the connected module.
ezmaker.writeDigitalPin(EZMakerDigitalPin.P8, 0)
input.onButtonPressed(Button.A, function () {
    ezmaker.writeDigitalPin(EZMakerDigitalPin.P8, 1)
})
input.onButtonPressed(Button.B, function () {
    ezmaker.writeDigitalPin(EZMakerDigitalPin.P8, 0)
})
```

## See also

- [All block references](https://github.com/YoungJJlab/pxt-ezmakershield-microbit/blob/main/docs/reference/README.md)
- [Setup and classroom lessons](https://github.com/YoungJJlab/pxt-ezmakershield-microbit/blob/main/README.md)

```package
pxt-ezmakershield-microbit=github:YoungJJlab/pxt-ezmakershield-microbit
```
