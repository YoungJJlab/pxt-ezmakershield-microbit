input.onButtonPressed(Button.A, function () {
    dhtStarted = input.runningTime()
    dhtTemperature = ezmaker.readDHT11(EZMakerDigitalPin.P16, EZMakerDHT11DataType.Temperature)
    dhtHumidity = ezmaker.readDHT11(EZMakerDigitalPin.P16, EZMakerDHT11DataType.Humidity)
    dhtElapsed = input.runningTime() - dhtStarted
    serial.writeValue("DHT11_C", dhtTemperature)
    serial.writeValue("DHT11_RH", dhtHumidity)
    serial.writeValue("DHT11_ms", dhtElapsed)
    basic.showString("T")
    basic.showNumber(dhtTemperature)
    basic.showString("H")
    basic.showNumber(dhtHumidity)
})
input.onButtonPressed(Button.B, function () {
    serial.writeValue("alive_ms", input.runningTime())
    basic.showIcon(IconNames.Yes)
})
let dhtHeartbeat = false
let dhtElapsed = 0
let dhtHumidity = 0
let dhtTemperature = 0
let dhtStarted = 0
// DHT11 module on P16, with the module's normal 3.3 V / GND connections.
// Wait for the check mark before reading. Negative values are error codes.
basic.pause(1000)
basic.showIcon(IconNames.Yes)
basic.forever(function () {
    dhtHeartbeat = !(dhtHeartbeat)
    if (dhtHeartbeat) {
        led.plot(4, 4)
    } else {
        led.unplot(4, 4)
    }
    basic.pause(250)
})
