# readBMP280

Read BMP280 pressure, relative altitude or temperature. Returns -9999 on an invalid setting or sensor error.

```sig
ezmaker.readBMP280(EZMakerBMP280Channel.Channel0, EZMakerBMP280DataType.Pressure)
```

## Parameters

- **channel**: module selector: channel 0 uses 0x77; channel 1 uses 0x76
- **dataType**: measurement: pressure in hPa, relative altitude in m or temperature in °C
- **seaLevelPressure**: reference pressure in hPa before A calibration or after B restore; default 1013.25

## Connection and behavior

Open **ezmaker → Sensors**. Connect the module to the shield's I2C connector: P19=SCL, P20=SDA, 3.3 V and GND. Match the channel dropdown to the module's physical selector. These channels select the device address on the same I2C bus; they are not separate signal pins. Two modules may share the bus when one is on each address. Power off before changing wiring or the selector.

Choose pressure (hPa), relative altitude (m) or temperature (°C). Each result is rounded to two decimal places; displayed resolution does not imply that accuracy. Each call reads calibration from the selected chip and performs a new forced measurement (temperature ×1, pressure ×4, filter off). It waits at least 15 ms for conversion; busy checks have bounded timeouts. Sequential calls are separate measurements. Do not control the same device with another driver concurrently.

Relative altitude is calculated as `44330 × (1 − (pressure / referencePressure)^0.1903)`. Before zeroing, the default reference is 1013.25 hPa; this gives standard pressure altitude, not a zero at startup. Expand the optional input to change the reference. Add [the A/B setup block](enable-bmp280-altitude-buttons.md) in on start to let A set the current pressure as 0 m and B restore the optional reference. The original TypeScript parameter and enum member names remain compatible. Weather changes affect the estimate. A weather service's sea-level-corrected pressure differs from the sensor's local absolute pressure. The temperature is the sensor's own temperature and may be affected by circuit heat.

The return value **-9999** means invalid channel/type/reference, missing or incorrect chip ID (BMP280 ID must be 0x58), I2C write failure, invalid calibration/raw data, a busy timeout or a reading outside the BMP280 ranges (300–1100 hPa and −40–85 °C). Do not treat it as a measurement. Unconnected simulator I2C hardware returns the same error; no artificial weather value is generated. BMP180 and BME280 are not supported by this block.

## Example and expected result

Press A to read channel 0 pressure. A connected BMP280 should return a plausible local pressure; an absent module shows ERR. Compare a reference instrument at the same location, rather than a weather application's sea-level pressure.

```blocks
input.onButtonPressed(Button.A, function () {
    let pressure = ezmaker.readBMP280(EZMakerBMP280Channel.Channel0, EZMakerBMP280DataType.Pressure)
    if (pressure == -9999) {
        basic.showString("ERR")
    } else {
        basic.showNumber(pressure)
    }
})
```

## See also

- [BMP280 hardware tests](https://github.com/YoungJJlab/pxt-ezmakershield-microbit/blob/main/BMP280_TESTING.md)
- [Bosch BMP280 datasheet](https://www.bosch-sensortec.com/media/boschsensortec/downloads/datasheets/bst-bmp280-ds001.pdf)
- [All block references](README.md)

```package
pxt-ezmakershield-microbit=github:YoungJJlab/pxt-ezmakershield-microbit
```
