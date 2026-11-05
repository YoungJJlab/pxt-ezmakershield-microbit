# readSoundRaw

Read the external sound module's raw ADC value from 0 to 1023.

```sig
ezmaker.readSoundRaw(EZMakerAnalogPin.P0)
```

## Parameters

- **pin**: analog signal pin P0, P1 or P2

## Returns

An integer ADC reading from 0 to 1023.

## Connection and behavior

With power off, connect the module signal to the selected port. Follow the actual module and shield instructions for power, GND and signal wiring.

This is a sampled module output, not decibels or calibrated sound pressure.

The simulator does not establish the electrical behavior of an attached module; check observations on the actual board.

## Example and expected result

A displays and records the input. Change the module stimulus and compare readings.

```blocks
// Observe the following actions on the connected module.
input.onButtonPressed(Button.A, function () {
    let value = ezmaker.readSoundRaw(EZMakerAnalogPin.P0)
    serial.writeValue("read_sound_raw", value)
    basic.showNumber(value)
})
```

## See also

- [All block references](https://github.com/YoungJJlab/pxt-ezmakershield-microbit/blob/main/docs/reference/README.md)
- [Setup and classroom lessons](https://github.com/YoungJJlab/pxt-ezmakershield-microbit/blob/main/README.md)

```package
pxt-ezmakershield-microbit=github:YoungJJlab/pxt-ezmakershield-microbit
```
