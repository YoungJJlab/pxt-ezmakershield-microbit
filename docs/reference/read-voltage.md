# readVoltage

Convert the voltage-module ADC reading to nominal 0–16.5 V, rounded to two decimal places.

```sig
ezmaker.readVoltage(EZMakerAnalogPin.P0)
```

## Parameters

- **pin**: analog signal pin P0, P1 or P2

## Returns

A number: round(raw × 16.5 / 1023, 2) in volts.

## Connection and behavior

With power off, connect the module signal to the selected port. Follow the actual module and shield instructions for power, GND and signal wiring.

Use a compatible voltage-divider module with its specified wiring and input limits. 16.5 V is a module conversion scale, not an allowed direct micro:bit pin voltage.

The simulator does not establish the electrical behavior of an attached module; check observations on the actual board.

## Example and expected result

A reports a nominal voltage-module reading. Compare with a known reference within the module specifications.

```blocks
// Observe the following actions on the connected module.
input.onButtonPressed(Button.A, function () {
    let value = ezmaker.readVoltage(EZMakerAnalogPin.P0)
    serial.writeValue("module_V", value)
    basic.showNumber(value)
})
```

## See also

- [All block references](https://github.com/YoungJJlab/pxt-ezmakershield-microbit/blob/main/docs/reference/README.md)
- [Setup and classroom lessons](https://github.com/YoungJJlab/pxt-ezmakershield-microbit/blob/main/README.md)

```package
pxt-ezmakershield-microbit=github:YoungJJlab/pxt-ezmakershield-microbit
```
