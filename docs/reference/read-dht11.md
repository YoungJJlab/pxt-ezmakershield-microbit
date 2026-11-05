# readDHT11

Read DHT11 temperature (°C) or humidity (%), cached for 1 second. Errors: -1 invalid port; -4 no response; -5/-6 timeout; -7 empty frame; -8 checksum; -9 busy.

```sig
ezmaker.readDHT11(EZMakerDigitalPin.P16, EZMakerDHT11DataType.Temperature)
```

## Parameters

- **port**: digital signal pin P8, P12, P13 or P16
- **dataType**: Temperature in °C or Humidity in percent

## Returns

Selected value, or a negative error code: -1 invalid port, -4 no response, -5/-6 handshake/data timeout, -7 empty frame, -8 bad checksum, -9 another read in progress.

## Connection and behavior

With power off, connect the module signal to the selected port. Follow the actual module and shield instructions for power, GND and signal wiring.

Temperature and humidity share one cached frame or error for a second. Read both consecutively, then wait at least one second before requesting a fresh frame. DHT11 uses its own single-wire protocol, not Dallas 1-Wire.

The simulator reports -4 because no DHT11 waveform is available.

## Example and expected result

A records both values from the shared frame or displays ERR. The simulator returns -4 because it has no DHT11 waveform.

```blocks
// Observe the following actions on the connected module.
input.onButtonPressed(Button.A, function () {
    let temperature = ezmaker.readDHT11(EZMakerDigitalPin.P16, EZMakerDHT11DataType.Temperature)
    let humidity = ezmaker.readDHT11(EZMakerDigitalPin.P16, EZMakerDHT11DataType.Humidity)
    if (temperature < 0 || humidity < 0) {
        serial.writeValue("dht11_error", temperature)
        basic.showString("ERR")
    } else {
        serial.writeValue("temperature_C", temperature)
        serial.writeValue("humidity_percent", humidity)
        basic.showNumber(temperature)
        basic.showNumber(humidity)
    }
})
```

## See also

- [All block references](https://github.com/YoungJJlab/pxt-ezmakershield-microbit/blob/main/docs/reference/README.md)
- [Setup and classroom lessons](https://github.com/YoungJJlab/pxt-ezmakershield-microbit/blob/main/README.md)

```package
pxt-ezmakershield-microbit=github:YoungJJlab/pxt-ezmakershield-microbit
```
