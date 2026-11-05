# Lesson: temperature and missing data

[한국어](temperature_ko.md) · [Extension and setup](../../README.md) · [Next: NeoPixel](neopixel.md)

## Learning goals and preparation

Allow about 30–40 minutes. Learners will record a changing measurement, distinguish valid data from error codes, and explain an `if` condition. Introduce units and below-zero temperatures before the activity.

Prepare a micro:bit V1 or V2, EZMAKER Shield, a compatible **DS18B20 module**, its matching cable and a computer with MakeCode. Add the extension from the setup guide. Use the module's normal powered wiring and required data pull-up; a bare sensor needs the appropriate external wiring.

With power off, connect the module's **data signal to P13** and power/GND according to its instructions. Use one sensor on this port for this lesson. Keep the electronics dry; gently warming the probe by hand is sufficient for the observation.

## Program

Create a new project and use this example on its own. A requests a reading; the display takes time to scroll numbers.

```blocks
input.onButtonPressed(Button.A, function () {
    let temperature = ezmaker.readDS18B20(EZMakerDigitalPin.P13)
    // Test exact error codes, not temperature < 0: below-zero readings are valid.
    if (temperature === -999 || temperature === -273) {
        serial.writeValue("sensor_error", temperature)
        basic.showString("ERR")
    } else {
        serial.writeValue("temperature_C", temperature)
        basic.showNumber(temperature)
    }
})
```

`-999` means a sensor communication/measurement failure; `-273` means an unsupported port argument. Neither is a measured temperature. Valid readings are rounded to two decimal places; this display precision is not a statement of sensor accuracy. The wrapper caches a reading, including sensor errors, for one second.

## Observe and record

1. Download to the board and press A. Record the room-temperature reading in °C.
2. Gently warm the probe by hand, wait, and measure again. Repeat at least three times, allowing two seconds or more between requests.
3. Let the probe return towards room conditions and record its response.
4. With board power off, disconnect the module. Restore power and press A: expect `ERR` and serial `sensor_error` of `-999`.
5. Power off, reconnect the module, restore power and measure again. Expect a valid reading to return.

| Condition | Reading or error code | Unit/status | Observation |
|---|---|---|---|
| Room conditions | | | |
| Warmed probe | | | |
| Cooling probe | | | |
| Module disconnected | | | |
| Module reconnected | | | |

The serial console separates `temperature_C` from `sensor_error`. Record the error as missing data, not as a very low temperature. Exact room values depend on the environment and probe.

## Discuss and extend

- Why would `temperature < 0` be an incorrect error test?
- Why does the display change more slowly than a button press? Distinguish sensor conversion, one-second caching and display time.
- Compare three readings under the same conditions. What might explain differences?
- Design a threshold indicator that displays a warning only after checking for an error. State the units and the reason for your chosen threshold.

## If observations do not match

For persistent `-999`, check the sensor model, P13 signal, power, GND and module pull-up arrangement. Wait for the number to finish scrolling before pressing A again. The simulator always provides an example 32.6 °C for DS18B20; it cannot perform the warm/disconnect activity. Use the physical board.

See [TEMPERATURE_TESTING.md](../../TEMPERATURE_TESTING.md) for V1/V2 driver verification and [TESTING.md](../../TESTING.md) for error/caching regressions.
