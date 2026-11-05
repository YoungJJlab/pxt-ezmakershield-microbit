# readMax31850

Read MAX31850 temperature in °C, rounded to one decimal place; -999 indicates an invalid port or sensor fault.

```sig
ezmaker.readMax31850(EZMakerDigitalPin.P12)
```

## Parameters

- **port**: digital signal pin P8, P12, P13 or P16

## Returns

Temperature in °C, or -999 for invalid port/measurement failure.

## Connection and behavior

With power off, connect the module signal to the selected port. Follow the actual module and shield instructions for power, GND and signal wiring.

Use one compatible MAX31850 thermocouple module per port with its documented power, data pull-up and probe wiring. This is Dallas 1-Wire, not an analog thermocouple input.

The simulator returns example temperature 25.5 °C.

## Example and expected result

A shows temperature or ERR. Negative temperatures other than -999 are not automatically errors.

```blocks
// Observe the following actions on the connected module.
input.onButtonPressed(Button.A, function () {
    let value = ezmaker.readMax31850(EZMakerDigitalPin.P12)
    if (value === -999) {
        serial.writeValue("sensor_error", value)
        basic.showString("ERR")
    } else {
        serial.writeValue("MAX31850_C", value)
        basic.showNumber(value)
    }
})
```

## See also

- [All block references](https://github.com/YoungJJlab/pxt-ezmakershield-microbit/blob/main/docs/reference/README.md)
- [Setup and classroom lessons](https://github.com/YoungJJlab/pxt-ezmakershield-microbit/blob/main/README.md)

```package
pxt-ezmakershield-microbit=github:YoungJJlab/pxt-ezmakershield-microbit
```
