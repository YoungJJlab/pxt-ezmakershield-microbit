# Barometric pressure sensor altitude buttons

Use button A to zero the barometric pressure sensor's relative altitude and B to restore the read block's reference pressure. Reserves A/B for this feature.

```sig
ezmaker.enableBMP280AltitudeButtons(EZMakerBMP280Channel.Channel0)
```

## Parameters

- **channel**: channel controlled by A/B; calling again selects the new channel without clearing saved zero references

## Behavior

Place this block in **on start**, then read **relative altitude (m)** with the barometric pressure sensor reading block. You do not need to write A/B button event code. Reading a sensor alone does not claim any buttons; this setup block opts in to A/B handling.

- **A** samples the selected module's current pressure and uses it as the zero reference. Subsequent relative-altitude readings are near 0 m at that position, positive when raised and negative when lowered. Sensor noise and air-pressure changes prevent a perfectly fixed zero.
- **B** removes that channel's zero reference and restores the reference pressure supplied to the reading block (1013.25 hPa by default). B restores the original reading, such as approximately 28 m, rather than setting another zero.
- Pressure and temperature readings are unaffected. While A zeroing is active, its reference overrides the optional pressure input of the reading block.
- Setup applies to one selected channel at a time. Repeating setup does not register duplicate handlers. Changing channel selects the new A/B target; stored zero references remain separate for channels 0 and 1.
- A missing/failed sensor during A zeroing makes relative altitude return **-9999**. Retry A after reconnecting, or use B to clear the zero-setting error and restore ordinary reading. A later B press or channel change cancels an older pending A sample.
- References are stored in RAM and clear when the program restarts. No flash setting is written.

Use A/B for this feature rather than adding other A/B event blocks in the same program: MakeCode replaces handlers for the same button event. A+B is left available. This block does not print serial messages or control the display.

## Example and expected result

A makes the next readings near zero; move the sensor vertically to observe the change. B restores the default pressure-based reading. Without a sensor, -9999 is expected.

```blocks
ezmaker.enableBMP280AltitudeButtons(EZMakerBMP280Channel.Channel0)
basic.forever(function () {
    basic.showNumber(ezmaker.readBMP280(EZMakerBMP280Channel.Channel0, EZMakerBMP280DataType.Altitude))
    basic.pause(500)
})
```

## See also

- [BMP280 readings](read-bmp280.md)
- [Hardware tests](https://github.com/YoungJJlab/pxt-ezmakershield-microbit/blob/main/BMP280_TESTING.md)

```package
pxt-ezmakershield-microbit=github:YoungJJlab/pxt-ezmakershield-microbit
```
