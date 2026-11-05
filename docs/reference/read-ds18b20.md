# readDS18B20

Read DS18B20 temperature in °C with a 1-second cache. Invalid port: -273; sensor failure: -999.

```sig
ezmaker.readDS18B20(EZMakerDigitalPin.P13)
```

## Parameters

- **port**: digital signal pin P8, P12, P13 or P16

## Returns

Temperature rounded to two decimal places, -273 for an invalid port, or -999 for a sensor failure.

## Connection and behavior

With power off, connect the module signal to the selected port. Follow the actual module and shield instructions for power, GND and signal wiring.

Use one normally powered DS18B20 module per port with the required data pull-up. The last port reading, including its sensor error, is cached for one second. Switching valid ports causes a new read; invalid ports leave the valid cache intact. Wait at least two seconds for a disconnection/recovery observation.

The simulator returns example temperature 32.6 °C, not a physical measurement.

## Example and expected result

A shows temperature or ERR. Below-zero temperatures can be valid; test the exact error codes.

```blocks
// Observe the following actions on the connected module.
input.onButtonPressed(Button.A, function () {
    let value = ezmaker.readDS18B20(EZMakerDigitalPin.P13)
    if (value === -999 || value === -273) {
        serial.writeValue("sensor_error", value)
        basic.showString("ERR")
    } else {
        serial.writeValue("DS18B20_C", value)
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
