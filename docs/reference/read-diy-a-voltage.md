# readDIYAVoltage

Convert a DIY-A ADC reading to nominal 0–3.3 V, rounded to two decimal places.

```sig
ezmaker.readDIYAVoltage(EZMakerAnalogPin.P0)
```

## Parameters

- **pin**: analog signal pin P0, P1 or P2

## Returns

A number: round(raw × 3.3 / 1023, 2) in volts.

## Connection and behavior

With power off, connect the module signal to the selected port. Follow the actual module and shield instructions for power, GND and signal wiring.

This is a nominal conversion, not calibration of the board or module.

The simulator does not establish the electrical behavior of an attached module; check observations on the actual board.

## Example and expected result

A reports the module signal voltage; compare against a suitable reference if measuring accuracy.

```blocks
// Observe the following actions on the connected module.
input.onButtonPressed(Button.A, function () {
    let value = ezmaker.readDIYAVoltage(EZMakerAnalogPin.P0)
    serial.writeValue("diy_a_V", value)
    basic.showNumber(value)
})
```

## See also

- [All block references](https://github.com/YoungJJlab/pxt-ezmakershield-microbit/blob/main/docs/reference/README.md)
- [Setup and classroom lessons](https://github.com/YoungJJlab/pxt-ezmakershield-microbit/blob/main/README.md)

```package
pxt-ezmakershield-microbit=github:YoungJJlab/pxt-ezmakershield-microbit
```
