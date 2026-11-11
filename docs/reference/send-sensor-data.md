# sendSensorData

Send numeric sensor values as one comma-separated text line. Sets 115200 baud on first use; ends each line with CRLF and no padding.

```sig
ezmaker.sendSensorData([10, 20.5, -3])
```

## Parameters

- **values**: sensor values in transmission order; add or remove array items to change the sensor count

## Returns

No value. Sends one string record through the current serial route (USB serial by default).

## Connection and behavior

Open **ezmaker → Data Transmission**. The data input is a numeric array: use its **+ / −** controls to add or remove sensor-value slots. Place a numeric sensor block or number in each slot. There is no fixed sensor count in the API; available board memory limits the list and line length.

The first non-null call sets 115200 baud once. Later calls do not reset the baud rate. Each call sends the values in their original order, separated by `,`, followed by `\r\n`. It sends no labels, spaces, trailing comma or binary numeric payload. For `[10, 20.5, -3]`, the wire text is `10,20.5,-3\r\n`. Inputs are numbers; the transmitted record is a string. Numeric formatting follows MakeCode's number-to-text conversion, without extra rounding here. Sensor error numbers such as `-999` are transmitted as provided.

If other code changes the baud rate or redirects serial after first use, this block preserves those later settings. Set the desired baud rate explicitly with the standard serial blocks when changing connections; the receiver must match. Restarting the board resets first-use initialization.

An empty list sends one empty line. A null list supplied from text code sends nothing. The block preserves existing serial routing; it does not assign external UART pins. With default routing, use the micro:bit USB COM port at **115200, 8 data bits, no parity, 1 stop bit, no flow control**. It does not send through Bluetooth UART. Give repeated transmissions a suitable interval, for example 100 ms, and avoid unrelated serial messages if the receiver expects only data records.

When receiving in PuTTY or another terminal, finish downloading, then disconnect the board from MakeCode/Python editor WebUSB connections before opening the terminal. If characters still go missing, close all connected editor tabs and repeat the same program. A browser WebUSB connection can remain active while the USB COM port is open, so an open COM port does not prove exclusive reception. See the troubleshooting steps in the testing guide below.

## Example and expected result

Press A for three values and B for five. Each press produces exactly one CSV text line. No sensor is required for this format check. To transmit live readings, replace the numbers with numeric sensor blocks.

```blocks
input.onButtonPressed(Button.A, function () {
    ezmaker.sendSensorData([10, 20.5, -3])
})
input.onButtonPressed(Button.B, function () {
    ezmaker.sendSensorData([10, 20.5, -3, 40, 50])
})
```

## See also

- [All block references](https://github.com/YoungJJlab/pxt-ezmakershield-microbit/blob/main/docs/reference/README.md)
- [Serial format and hardware testing](https://github.com/YoungJJlab/pxt-ezmakershield-microbit/blob/main/DATA_TRANSMISSION_TESTING.md)

```package
pxt-ezmakershield-microbit=github:YoungJJlab/pxt-ezmakershield-microbit
```
