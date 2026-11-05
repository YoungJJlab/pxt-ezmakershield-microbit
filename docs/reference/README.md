# Block reference

Connection, parameters, returns and examples for all 27 blocks. MakeCode selects the bundled Korean page when the editor language is Korean, with English as fallback.

| API | Description |
|---|---|
| [enableBMP280AltitudeButtons](enable-bmp280-altitude-buttons.md) | Set up A: zero relative altitude / B: restore reference, without writing button event code. |
| [readBMP280](read-bmp280.md) | Read BMP280 pressure, relative altitude or temperature; select channel 0 (0x77) or 1 (0x76). |
| [sendSensorData](send-sensor-data.md) | Send numeric sensor values as one comma-separated text line at 115200 baud, ending with CRLF and no padding. |
| [writeDigitalPin](write-digital-pin.md) | Set a digital output low (0) or high (1). An unsupported pin is ignored. |
| [readDIYARaw](read-diy-a-raw.md) | Read the DIY-A module's raw ADC value from 0 to 1023. |
| [readDIYBAnalog](read-diy-b-analog.md) | Read the DIY-B analog module's raw ADC value from 0 to 1023. |
| [readLightRaw](read-light-raw.md) | Read the external light module's raw ADC value from 0 to 1023. |
| [readSoundRaw](read-sound-raw.md) | Read the external sound module's raw ADC value from 0 to 1023. |
| [readDIYAVoltage](read-diy-a-voltage.md) | Convert a DIY-A ADC reading to nominal 0–3.3 V, rounded to two decimal places. |
| [readDIYBDigital](read-diy-b-digital.md) | Read whether a DIY-B digital input is high. An unsupported pin returns false. |
| [readLightPercentage](read-light-percentage.md) | Scale the external light ADC reading to 0–100; this is not a calibrated physical unit. |
| [readSoundPercentage](read-sound-percentage.md) | Scale the external sound ADC reading to 0–100; this is not a calibrated physical unit. |
| [readVoltage](read-voltage.md) | Convert the voltage-module ADC reading to nominal 0–16.5 V, rounded to two decimal places. |
| [readMQ2](read-mq2.md) | Calculate a nominal MQ2 ppm estimate using fixed coefficients; the sensor is not calibrated by this block. |
| [readMax31850](read-max31850.md) | Read MAX31850 temperature in °C, rounded to one decimal place; -999 indicates an invalid port or sensor fault. |
| [readDS18B20](read-ds18b20.md) | Read DS18B20 temperature in °C with a 1-second cache. Invalid port: -273; sensor failure: -999. |
| [readDHT11](read-dht11.md) | Read DHT11 temperature (°C) or humidity (%), cached for 1 second. Errors: -1 invalid port; -4 no response; -5/-6 timeout; -7 empty frame; -8 checksum; -9 busy. |
| [setNeoPixelColorAll](set-neopixel-color-all.md) | Set every pixel in the selected module to one RGB color and send it immediately. |
| [setNeoPixelPixelColor](set-neopixel-pixel-color.md) | Set one zero-based pixel to an RGB color and send the buffer. Out-of-range pixel indices are ignored. |
| [setNeoPixelBrightness](set-neopixel-brightness.md) | Set brightness (0–255) for subsequent color writes. Existing buffered colors are not rescaled; rewrite the color to apply it. |
| [clearNeoPixel](clear-neopixel.md) | Set all pixels in the selected module to black and send the buffer; brightness is retained. |
| [setNeoPixelBar](set-neopixel-bar.md) | Set and immediately send all 7 pixel colors in argument order. |
| [setNeoPixelRing](set-neopixel-ring.md) | Set and immediately send all 12 pixel colors in argument order. |
| [showNeoPixelRainbow](show-neopixel-rainbow.md) | Fill and send a static hue gradient; this block does not animate it over time. |
| [shiftNeoPixel](shift-neopixel.md) | Move pixel colors by a signed offset, fill vacated pixels with black, and send the buffer. |
| [rotateNeoPixel](rotate-neopixel.md) | Move pixel colors by a signed offset, wrapping at the ends, and send the buffer. |
| [showNeoPixelBarGraph](show-neopixel-bar-graph.md) | Show the magnitude of a value against a positive maximum. Zero and nonpositive maxima use marker pixels; clear explicitly to switch off. |

[Setup and classroom lessons](../../README.md)
