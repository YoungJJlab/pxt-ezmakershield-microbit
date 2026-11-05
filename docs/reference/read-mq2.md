# readMQ2

Calculate a nominal MQ2 ppm estimate using fixed coefficients; the sensor is not calibrated by this block.

```sig
ezmaker.readMQ2(EZMakerMQ2GasType.LPG, EZMakerAnalogPin.P0)
```

## Parameters

- **gasType**: coefficient selection: LPG, CO, Smoke, H2 or Propane
- **pin**: analog signal pin P0, P1 or P2

## Returns

A nominal ppm estimate rounded to two decimal places, not a validated concentration.

## Connection and behavior

With power off, connect the module signal to the selected port. Follow the actual module and shield instructions for power, GND and signal wiring.

The current formula uses a 10 kΩ load, fixed R0=1045 Ω and a clamped 0.05–3.25 V signal. Match the actual module, warm-up and calibration before interpreting concentration. Gas selection changes a calculation; it does not selectively identify gases in a mixture.

The simulator does not establish the electrical behavior of an attached module; check observations on the actual board.

## Example and expected result

A records the nominal LPG calculation. A changing value alone does not validate gas concentration.

```blocks
// Observe the following actions on the connected module.
input.onButtonPressed(Button.A, function () {
    let value = ezmaker.readMQ2(EZMakerMQ2GasType.LPG, EZMakerAnalogPin.P0)
    serial.writeValue("mq2_nominal_ppm", value)
    basic.showNumber(value)
})
```

## See also

- [All block references](https://github.com/YoungJJlab/pxt-ezmakershield-microbit/blob/main/docs/reference/README.md)
- [Setup and classroom lessons](https://github.com/YoungJJlab/pxt-ezmakershield-microbit/blob/main/README.md)

```package
pxt-ezmakershield-microbit=github:YoungJJlab/pxt-ezmakershield-microbit
```
