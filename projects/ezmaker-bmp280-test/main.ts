// CSV order: pressure hPa, relative altitude m, temperature C.
// A=zero selected channel, B=restore reference, A+B=switch channel. Streams every 500 ms plus measurement time.
let bmp280Channel = 0
function reportBMP280() {
    let pressure = 0
    let altitude = 0
    let temperature = 0
    if (bmp280Channel == 0) {
        pressure = ezmaker.readBMP280(EZMakerBMP280Channel.Channel0, EZMakerBMP280DataType.Pressure)
        altitude = ezmaker.readBMP280(EZMakerBMP280Channel.Channel0, EZMakerBMP280DataType.Altitude, 1013.25)
        temperature = ezmaker.readBMP280(EZMakerBMP280Channel.Channel0, EZMakerBMP280DataType.Temperature)
    } else {
        pressure = ezmaker.readBMP280(EZMakerBMP280Channel.Channel1, EZMakerBMP280DataType.Pressure)
        altitude = ezmaker.readBMP280(EZMakerBMP280Channel.Channel1, EZMakerBMP280DataType.Altitude, 1013.25)
        temperature = ezmaker.readBMP280(EZMakerBMP280Channel.Channel1, EZMakerBMP280DataType.Temperature)
    }
    ezmaker.sendSensorData([pressure, altitude, temperature])
    if (pressure == -9999 || altitude == -9999 || temperature == -9999) {
        basic.showIcon(IconNames.No)
    } else {
        basic.showNumber(bmp280Channel)
    }
}
// A/B handling lives entirely in this setup block.
ezmaker.enableBMP280AltitudeButtons(EZMakerBMP280Channel.Channel0)
input.onButtonPressed(Button.AB, function () {
    if (bmp280Channel == 0) {
        bmp280Channel = 1
        ezmaker.enableBMP280AltitudeButtons(EZMakerBMP280Channel.Channel1)
    } else {
        bmp280Channel = 0
        ezmaker.enableBMP280AltitudeButtons(EZMakerBMP280Channel.Channel0)
    }
})
basic.forever(function () {
    reportBMP280()
    basic.pause(500)
})
basic.showNumber(0)
