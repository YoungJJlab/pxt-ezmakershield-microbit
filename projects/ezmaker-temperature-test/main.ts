// One sensor per port, with the module's normal 3.3 V / GND connections.
// A: MAX31850 module on P12. B: DS18B20 module on P13.
// A displayed -999 is a measurement failure, never a temperature.
input.onButtonPressed(Button.A, function () {
    let maxStarted = input.runningTime();
    let maxTemperature = ezmaker.readMax31850(EZMakerDigitalPin.P12);
    let maxElapsed = input.runningTime() - maxStarted;
    serial.writeValue("MAX31850_C", maxTemperature);
    serial.writeValue("MAX31850_ms", maxElapsed);
    basic.showNumber(maxTemperature);
});
input.onButtonPressed(Button.B, function () {
    let dsStarted = input.runningTime();
    let dsTemperature = ezmaker.readDS18B20(EZMakerDigitalPin.P13);
    let dsElapsed = input.runningTime() - dsStarted;
    serial.writeValue("DS18B20_C", dsTemperature);
    serial.writeValue("DS18B20_ms", dsElapsed);
    basic.showNumber(dsTemperature);
});
basic.showIcon(IconNames.Yes);
