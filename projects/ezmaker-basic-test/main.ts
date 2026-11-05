/**
 * Test one module at a time. A selects a group, B measures or toggles output.
 */
/**
 * Analog modules: P0. Digital input/output: P8.
 */
input.onButtonPressed(Button.A, function () {
    if (basicGroup == 6) {
        ezmaker.writeDigitalPin(EZMakerDigitalPin.P8, 0)
        basicOutput = 0
    }
    basicGroup = (basicGroup + 1) % 7
    serial.writeValue("group", basicGroup)
    basic.showNumber(basicGroup)
})
input.onButtonPressed(Button.B, function () {
    basicStarted = input.runningTime()
    if (basicGroup == 0) {
        serial.writeValue("DIYA_raw", ezmaker.readDIYARaw(EZMakerAnalogPin.P0))
        diyaVoltage = ezmaker.readDIYAVoltage(EZMakerAnalogPin.P0)
        serial.writeValue("DIYA_V", diyaVoltage)
        basic.showNumber(diyaVoltage)
    } else if (basicGroup == 1) {
        serial.writeValue("DIYB_analog", ezmaker.readDIYBAnalog(EZMakerAnalogPin.P0))
        if (ezmaker.readDIYBDigital(EZMakerDigitalPin.P8)) {
            diyDigital = 1
        } else {
            diyDigital = 0
        }
        serial.writeValue("DIYB_digital", diyDigital)
        basic.showNumber(diyDigital)
    } else if (basicGroup == 2) {
        serial.writeValue("light_raw", ezmaker.readLightRaw(EZMakerAnalogPin.P0))
        lightPercent = ezmaker.readLightPercentage(EZMakerAnalogPin.P0)
        serial.writeValue("light_percent", lightPercent)
        basic.showNumber(lightPercent)
    } else if (basicGroup == 3) {
        serial.writeValue("sound_raw", ezmaker.readSoundRaw(EZMakerAnalogPin.P0))
        soundPercent = ezmaker.readSoundPercentage(EZMakerAnalogPin.P0)
        serial.writeValue("sound_percent", soundPercent)
        basic.showNumber(soundPercent)
    } else if (basicGroup == 4) {
        moduleVoltage = ezmaker.readVoltage(EZMakerAnalogPin.P0)
        serial.writeValue("voltage_V", moduleVoltage)
        basic.showNumber(moduleVoltage)
    } else if (basicGroup == 5) {
        mqLpg = ezmaker.readMQ2(EZMakerMQ2GasType.LPG, EZMakerAnalogPin.P0)
        serial.writeValue("MQ2_LPG", mqLpg)
        serial.writeValue("MQ2_CO", ezmaker.readMQ2(EZMakerMQ2GasType.CO, EZMakerAnalogPin.P0))
        serial.writeValue("MQ2_smoke", ezmaker.readMQ2(EZMakerMQ2GasType.Smoke, EZMakerAnalogPin.P0))
        serial.writeValue("MQ2_H2", ezmaker.readMQ2(EZMakerMQ2GasType.H2, EZMakerAnalogPin.P0))
        serial.writeValue("MQ2_propane", ezmaker.readMQ2(EZMakerMQ2GasType.Propane, EZMakerAnalogPin.P0))
        basic.showNumber(mqLpg)
    } else {
        basicOutput = 1 - basicOutput
        ezmaker.writeDigitalPin(EZMakerDigitalPin.P8, basicOutput)
        serial.writeValue("digital_output", basicOutput)
        basic.showNumber(basicOutput)
    }
    serial.writeValue("handler_ms_including_display", input.runningTime() - basicStarted)
})
let mqLpg = 0
let moduleVoltage = 0
let soundPercent = 0
let lightPercent = 0
let diyDigital = 0
let diyaVoltage = 0
let basicStarted = 0
let basicOutput = 0
let basicGroup = 0
basic.showNumber(basicGroup)
