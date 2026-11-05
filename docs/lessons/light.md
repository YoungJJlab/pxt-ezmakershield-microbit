# Lesson: observe an external light sensor

[한국어](light_ko.md) · [Extension and setup](../../README.md) · [Next: temperature](temperature.md)

## Learning goals and preparation

Allow about 30–40 minutes, adapting questions to the class. Learners will sample an analog signal, use a fixed graph scale and support a statement with repeated observations. No sensor calibration is required for this comparison activity.

Prepare a micro:bit V1 or V2, EZMAKER Shield, compatible analog light module, matching cable and a computer with MakeCode. Add the extension using the repository URL in the setup guide.

With power off, connect the module's **analog output to P0** and its power/GND as specified by the module and shield. The code reads an external sensor, not the micro:bit's built-in light sensing. Check the connector labels to identify the module's analog signal.

## Program

Create a new project and use this example on its own. A sample is taken every half second, apart from program overhead.

```blocks
basic.forever(function () {
    // Sample the light module connected to analog input P0.
    let light = ezmaker.readLightRaw(EZMakerAnalogPin.P0)
    // Record the number and show it against the same scale each time.
    serial.writeValue("light_raw", light)
    led.plotBarGraph(light, 1023)
    basic.pause(500)
})
```

## Observe and record

1. Download to the board. Observe the LED bar; use MakeCode's connected serial console to read `light_raw`.
2. Keep the sensor still and record three readings under room light.
3. Cover it without moving the cable and record three readings.
4. Uncover it, change the illumination, and record another three readings.
5. Compare the groups. Does this particular module's output rise or fall as illumination increases?

| Condition | Reading 1 | Reading 2 | Reading 3 | Observation |
|---|---|---|---|---|
| Room light | | | | |
| Covered | | | | |
| Changed illumination | | | | |

Expected: each value is between 0 and 1023, and a working, correctly wired module responds to illumination changes. The bar grows with the numerical value. Do not assume the electrical output increases with brightness until you observe your module. These numbers are ADC readings, not lux.

## Discuss and extend

- Why collect three readings rather than one? What changed besides illumination?
- Keep the graph maximum fixed at 1023. How would changing the maximum affect comparisons?
- Replace `readLightRaw` with `readLightPercentage` and the graph maximum with 100. The percentage is a rescaled ADC reading, not a calibrated light measurement.
- Choose a threshold from the class's recorded readings and design a light/dark indicator. Explain how you chose the comparison direction.

## If observations do not match

If values are constant, check the selected P0 signal, cable, power and GND against the module instructions. If values fluctuate, compare the light source, sensor position and connections before drawing conclusions. A simulator input does not reproduce the external sensor: perform the observation on the physical board.

For developer verification rather than a lesson, see [TESTING.md](../../TESTING.md).
