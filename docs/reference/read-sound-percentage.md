# readSoundPercentage

Scale the external sound ADC reading to 0–100; this is not a calibrated physical unit.

```sig
ezmaker.readSoundPercentage(EZMakerAnalogPin.P0)
```

## Parameters

- **pin**: analog signal pin P0, P1 or P2

## Returns

An integer: round(raw × 100 / 1023).

## Connection and behavior

With power off, connect the module signal to the selected port. Follow the actual module and shield instructions for power, GND and signal wiring.

Percentage is the ADC proportion, not decibels.

The simulator does not establish the electrical behavior of an attached module; check observations on the actual board.

## Example and expected result

A shows a value from 0 to 100. Compare different input conditions.

```blocks
// Observe the following actions on the connected module.
input.onButtonPressed(Button.A, function () {
    let value = ezmaker.readSoundPercentage(EZMakerAnalogPin.P0)
    serial.writeValue("sound_percent", value)
    basic.showNumber(value)
})
```

## See also

- [All block references](https://github.com/YoungJJlab/pxt-ezmakershield-microbit/blob/main/docs/reference/README.md)
- [Setup and classroom lessons](https://github.com/YoungJJlab/pxt-ezmakershield-microbit/blob/main/README.md)

```package
pxt-ezmakershield-microbit=github:YoungJJlab/pxt-ezmakershield-microbit
```
