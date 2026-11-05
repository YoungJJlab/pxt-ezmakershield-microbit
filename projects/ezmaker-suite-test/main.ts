// EZMAKER extension smoke suite: all 27 supported public APIs, finite execution.
// Simulator: no external hardware is required. See TESTING.md for expected results.
// Hardware: DISCONNECT ALL EXTERNAL MODULES before running this suite.
// Sensor error values are expected without sensors; they must not cause a panic.
// Exact conversions, waveforms and physical sensor behavior have separate tests.

let ezmakerTestChecks = 0;
function ezmakerTestCheck(condition: boolean): void {
    ezmakerTestChecks += 1;
    control.assert(condition, "EZMAKER test");
}
function ezmakerTestRange(value: number, minimum: number, maximum: number): void {
    ezmakerTestCheck(value >= minimum && value <= maximum);
}
function ezmakerTestDhtError(value: number): boolean {
    return value === -4 || value === -5 || value === -6 || value === -7 || value === -8 || value === -9;
}

serial.writeLine("EZMAKER TEST START");
let ezmakerTestAnalogPorts = [EZMakerAnalogPin.P0, EZMakerAnalogPin.P1, EZMakerAnalogPin.P2];
let ezmakerTestGases = [EZMakerMQ2GasType.LPG, EZMakerMQ2GasType.CO, EZMakerMQ2GasType.Smoke,
    EZMakerMQ2GasType.H2, EZMakerMQ2GasType.Propane];
for (let port of ezmakerTestAnalogPorts) {
    ezmakerTestRange(ezmaker.readDIYARaw(port), 0, 1023) /* DIY-A raw */;
    ezmakerTestRange(ezmaker.readDIYAVoltage(port), 0, 3.3) /* DIY-A voltage */;
    ezmakerTestRange(ezmaker.readDIYBAnalog(port), 0, 1023) /* DIY-B analog */;
    ezmakerTestRange(ezmaker.readLightRaw(port), 0, 1023) /* light raw */;
    ezmakerTestRange(ezmaker.readLightPercentage(port), 0, 100) /* light percentage */;
    ezmakerTestRange(ezmaker.readSoundRaw(port), 0, 1023) /* sound raw */;
    ezmakerTestRange(ezmaker.readSoundPercentage(port), 0, 100) /* sound percentage */;
    ezmakerTestRange(ezmaker.readVoltage(port), 0, 16.5) /* voltage module */;
    for (let gas of ezmakerTestGases) {
        // A numerical regression check, not a gas calibration/accuracy test.
        ezmakerTestRange(ezmaker.readMQ2(gas, port), 0, 1000000000) /* MQ2 finite nonnegative result */;
    }
}

let ezmakerTestDigitalPorts = [EZMakerDigitalPin.P8, EZMakerDigitalPin.P12,
    EZMakerDigitalPin.P13, EZMakerDigitalPin.P16];
for (let port of ezmakerTestDigitalPorts) {
    ezmaker.writeDigitalPin(port, 1);
    ezmaker.writeDigitalPin(port, 0);
    let digital = ezmaker.readDIYBDigital(port);
    ezmakerTestCheck(digital === true || digital === false) /* digital input boolean */;
    let maxTemperature = ezmaker.readMax31850(port);
    ezmakerTestCheck(maxTemperature === -999 || (maxTemperature >= -270 && maxTemperature <= 2048)) /* MAX31850 value/error */;
    let dsTemperature = ezmaker.readDS18B20(port);
    ezmakerTestCheck(dsTemperature === -999 || (dsTemperature >= -55 && dsTemperature <= 125)) /* DS18B20 value/error */;
    let dhtTemperature = ezmaker.readDHT11(port, EZMakerDHT11DataType.Temperature);
    let dhtHumidity = ezmaker.readDHT11(port, EZMakerDHT11DataType.Humidity);
    if (dhtTemperature < 0) {
        ezmakerTestCheck(ezmakerTestDhtError(dhtTemperature)) /* DHT11 known error */;
        ezmakerTestCheck(dhtHumidity === dhtTemperature) /* DHT11 shares failed measurement */;
    } else {
        ezmakerTestRange(dhtTemperature, 0, 80) /* DHT11 temperature */;
        ezmakerTestRange(dhtHumidity, 0, 100) /* DHT11 humidity */;
    }
}

let ezmakerTestPixelTypes = [EZMakerNeoPixelType.Single, EZMakerNeoPixelType.Bar, EZMakerNeoPixelType.Ring];
for (let port of ezmakerTestDigitalPorts) {
    for (let pixelType of ezmakerTestPixelTypes) {
        ezmaker.setNeoPixelBrightness(pixelType, port, 8);
        ezmaker.setNeoPixelColorAll(pixelType, port, 0x102030);
        ezmaker.setNeoPixelPixelColor(pixelType, port, <number>pixelType - 1, 0x001020);
        ezmaker.showNeoPixelRainbow(pixelType, port, 1, 300);
        ezmaker.shiftNeoPixel(pixelType, port, 1);
        ezmaker.rotateNeoPixel(pixelType, port, -1);
        ezmaker.showNeoPixelBarGraph(pixelType, port, 50, 100);
        ezmaker.clearNeoPixel(pixelType, port);
    }
    ezmaker.setNeoPixelBar(port, 0x100000, 0x001000, 0x000010, 0x101000, 0x100010, 0x001010, 0x101010);
    ezmaker.setNeoPixelRing(port, 0x100000, 0x001000, 0x000010, 0x101000, 0x100010, 0x001010,
        0x101010, 0x080000, 0x000800, 0x000008, 0x080800, 0x080008);
    // Include shrinking after a brightness change; leave all 12 physical pixels off.
    ezmaker.setNeoPixelBrightness(EZMakerNeoPixelType.Ring, port, 32);
    ezmaker.setNeoPixelColorAll(EZMakerNeoPixelType.Single, port, 0x100000);
    ezmaker.clearNeoPixel(EZMakerNeoPixelType.Ring, port);
    ezmaker.writeDigitalPin(port, 0);
}

// BMP280 is not simulated; absent modules must return the documented error.
for (let channel of [EZMakerBMP280Channel.Channel0, EZMakerBMP280Channel.Channel1]) {
    for (let dataType of [EZMakerBMP280DataType.Pressure, EZMakerBMP280DataType.Altitude, EZMakerBMP280DataType.Temperature]) {
        ezmakerTestCheck(ezmaker.readBMP280(channel, dataType) === -9999) /* BMP280 absent sensor */;
    }
}

// Configure only; button events have their own calibration/state tests.
ezmaker.enableBMP280AltitudeButtons(EZMakerBMP280Channel.Channel0);

let ezmakerTestData = [0, 1, -2.5];
ezmaker.sendSensorData(ezmakerTestData);
ezmakerTestCheck(ezmakerTestData.length === 3 && ezmakerTestData[0] === 0 && ezmakerTestData[1] === 1 && ezmakerTestData[2] === -2.5) /* data transmission preserves inputs */;
serial.writeValue("checks", ezmakerTestChecks);
serial.writeLine("EZMAKER TEST PASS");
// Static check image avoids retaining the entire icon selector in the V1 smoke HEX.
basic.showLeds(`
. . . . .
. . . . #
. . . # .
# . # . .
. # . . .
`);
