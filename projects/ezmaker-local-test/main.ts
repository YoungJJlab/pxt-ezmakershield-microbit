ezmaker.setNeoPixelColorAll(EZMakerNeoPixelType.Single, EZMakerDigitalPin.P8, 0x0000FF)
basic.forever(function () {
    basic.showNumber(ezmaker.readDIYARaw(EZMakerAnalogPin.P0))
})
