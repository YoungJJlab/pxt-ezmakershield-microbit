/**
 * Connect a 12-pixel ring to P8. Smaller logical lengths exercise tail clearing
 */
/**
 * without rewiring. The same firmware can also test a 1- or 7-pixel module.
 */
input.onButtonPressed(Button.A, function () {
    if (neoStep == 0) {
        neoLength = 1
        neoColor = 16711680
        ezmaker.setNeoPixelColorAll(EZMakerNeoPixelType.Single, EZMakerDigitalPin.P8, neoColor)
    } else if (neoStep == 1) {
        neoLength = 7
        neoColor = 65280
        ezmaker.setNeoPixelColorAll(EZMakerNeoPixelType.Bar, EZMakerDigitalPin.P8, neoColor)
    } else {
        neoLength = 12
        neoColor = 255
        ezmaker.setNeoPixelColorAll(EZMakerNeoPixelType.Ring, EZMakerDigitalPin.P8, neoColor)
    }
    neoStep = (neoStep + 1) % 3
    serial.writeValue("pixels", neoLength)
    serial.writeValue("brightness", neoBrightness)
    basic.showNumber(neoLength)
})
input.onButtonPressed(Button.AB, function () {
    neoLength = 12
    neoColor = 0
    neoStep = 0
    ezmaker.clearNeoPixel(EZMakerNeoPixelType.Ring, EZMakerDigitalPin.P8)
    serial.writeValue("pixels", 0)
    basic.showIcon(IconNames.No)
})
input.onButtonPressed(Button.B, function () {
    if (neoBrightness == 32) {
        neoBrightness = 8
    } else {
        neoBrightness = 32
    }
    if (neoLength == 1) {
        ezmaker.setNeoPixelBrightness(EZMakerNeoPixelType.Single, EZMakerDigitalPin.P8, neoBrightness)
        ezmaker.setNeoPixelColorAll(EZMakerNeoPixelType.Single, EZMakerDigitalPin.P8, neoColor)
    } else if (neoLength == 7) {
        ezmaker.setNeoPixelBrightness(EZMakerNeoPixelType.Bar, EZMakerDigitalPin.P8, neoBrightness)
        ezmaker.setNeoPixelColorAll(EZMakerNeoPixelType.Bar, EZMakerDigitalPin.P8, neoColor)
    } else {
        ezmaker.setNeoPixelBrightness(EZMakerNeoPixelType.Ring, EZMakerDigitalPin.P8, neoBrightness)
        ezmaker.setNeoPixelColorAll(EZMakerNeoPixelType.Ring, EZMakerDigitalPin.P8, neoColor)
    }
    serial.writeValue("brightness", neoBrightness)
    basic.showNumber(neoBrightness)
})
let neoColor = 0
let neoStep = 0
let neoBrightness = 0
let neoLength = 0
neoLength = 12
neoBrightness = 32
ezmaker.setNeoPixelBrightness(EZMakerNeoPixelType.Ring, EZMakerDigitalPin.P8, neoBrightness)
ezmaker.clearNeoPixel(EZMakerNeoPixelType.Ring, EZMakerDigitalPin.P8)
basic.showIcon(IconNames.Yes)
