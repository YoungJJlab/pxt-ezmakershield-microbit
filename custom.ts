/**
 * Custom blocks for EZMAKER Shield
 */

/**
 * Analog input pins (P0, P1, P2)
 */
enum EZMakerAnalogPin {
    //% block="P0"
    P0 = AnalogPin.P0,
    //% block="P1"
    P1 = AnalogPin.P1,
    //% block="P2"
    P2 = AnalogPin.P2
}

/**
 * Digital pins (P8, P12, P13, P16)
 */
enum EZMakerDigitalPin {
    //% block="P8"
    P8 = 108,  // DigitalPin.P8
    //% block="P12"
    P12 = 112, // DigitalPin.P12
    //% block="P13"
    P13 = 113, // DigitalPin.P13
    //% block="P16"
    P16 = 116  // DigitalPin.P16
}

enum EZMakerMQ2GasType {
    //% block="LPG"
    LPG = 0,
    //% block="CO"
    CO = 1,
    //% block="smoke"
    Smoke = 2,
    //% block="H2"
    H2 = 3,
    //% block="propane"
    Propane = 4
}

enum EZMakerDHT11DataType {
    //% block="temperature (°C)"
    Temperature = 0,
    //% block="humidity (%)"
    Humidity = 1
}

enum EZMakerBMP280Channel {
    //% block="0"
    Channel0 = 0,
    //% block="1"
    Channel1 = 1
}

enum EZMakerBMP280DataType {
    //% block="pressure (hPa)"
    Pressure = 0,
    //% block="relative altitude (m)"
    Altitude = 1,
    //% block="temperature (°C)"
    Temperature = 2
}

enum EZMakerNeoPixelType {
    //% block="1 LED"
    Single = 1,
    //% block="bar (7 LEDs)"
    Bar = 7,
    //% block="ring (12 LEDs)"
    Ring = 12
}

//% weight=100 color="#FF5733" icon="\uf12e" block="ezmaker"
namespace ezmaker {

    let sensorDataSerialInitialized = false;
    let bmp280AltitudeReference = [0, 0];
    let bmp280AltitudeError = [false, false];
    let bmp280AltitudeButtonChannel = -1;
    let bmp280AltitudeButtonGeneration = 0;
    let bmp280AltitudeButtonsRegistered = false;

    //% shim=ezmaker::readBMP280Native
    function readBMP280Shim(channel: number, dataType: number, reference: number): number {
        return -9999;
    }

    /**
     * Read pressure, relative altitude or temperature from the barometric pressure sensor. Returns -9999 on an invalid setting or sensor error.
     * @param channel module selector: 0 or 1, matching the module's physical channel setting
     * @param dataType measurement: pressure in hPa, relative altitude in m or temperature in °C
     * @param seaLevelPressure reference pressure in hPa before A calibration or after B restore; default 1013.25
     */
    //% help=github:pxt-ezmakershield-microbit/docs/reference/read-bmp280
    //% blockId="EZMAKER_bmp280_read"
    //% block="read barometric pressure sensor %dataType on channel %channel||reference pressure %seaLevelPressure hPa"
    //% seaLevelPressure.defl=1013.25
    //% expandableArgumentMode="toggle"
    //% weight=100
    //% color="#4527A0"
    //% subcategory="I2C"
    export function readBMP280(channel: EZMakerBMP280Channel, dataType: EZMakerBMP280DataType, seaLevelPressure: number = 1013.25): number {
        if (dataType === EZMakerBMP280DataType.Altitude
            && (channel === EZMakerBMP280Channel.Channel0 || channel === EZMakerBMP280Channel.Channel1)) {
            if (bmp280AltitudeError[channel]) return -9999;
            if (bmp280AltitudeReference[channel] > 0) seaLevelPressure = bmp280AltitudeReference[channel];
        }
        return readBMP280Shim(channel, dataType, seaLevelPressure);
    }

    /**
     * Use button A to zero the barometric pressure sensor's relative altitude and B to restore the read block's reference pressure. Reserves A/B for this feature.
     * @param channel channel controlled by A/B; calling again selects the new channel without clearing saved zero references
     */
    //% help=github:pxt-ezmakershield-microbit/docs/reference/enable-bmp280-altitude-buttons
    //% blockId="EZMAKER_bmp280_altitude_buttons"
    //% block="use barometric pressure sensor channel %channel relative altitude buttons A: zero B: restore"
    //% weight=99
    //% color="#4527A0"
    //% subcategory="I2C"
    export function enableBMP280AltitudeButtons(channel: EZMakerBMP280Channel): void {
        if (channel !== EZMakerBMP280Channel.Channel0 && channel !== EZMakerBMP280Channel.Channel1) return;
        bmp280AltitudeButtonChannel = channel;
        // A channel change or repeated setup cancels a still-running calibration.
        bmp280AltitudeButtonGeneration++;
        if (bmp280AltitudeButtonsRegistered) return;
        bmp280AltitudeButtonsRegistered = true;
        input.onButtonPressed(Button.A, function () {
            let selected = bmp280AltitudeButtonChannel;
            bmp280AltitudeButtonGeneration++;
            let generation = bmp280AltitudeButtonGeneration;
            let pressure = readBMP280Shim(selected, EZMakerBMP280DataType.Pressure, 1013.25);
            // A later B press or channel change must win over an older in-flight A read.
            if (generation !== bmp280AltitudeButtonGeneration) return;
            if (pressure >= 300 && pressure <= 1100) {
                bmp280AltitudeReference[selected] = pressure;
                bmp280AltitudeError[selected] = false;
            } else {
                bmp280AltitudeError[selected] = true;
            }
        });
        input.onButtonPressed(Button.B, function () {
            bmp280AltitudeButtonGeneration++;
            bmp280AltitudeReference[bmp280AltitudeButtonChannel] = 0;
            bmp280AltitudeError[bmp280AltitudeButtonChannel] = false;
        });
    }

    /**
     * Send numeric sensor values as one comma-separated text line. Sets 115200 baud on first use; ends each line with CRLF and no padding.
     * @param values sensor values in transmission order; add or remove array items to change the sensor count
     */
    //% help=github:pxt-ezmakershield-microbit/docs/reference/send-sensor-data
    //% blockId="EZMAKER_send_sensor_data"
    //% block="send sensor data %values"
    //% values.shadow="lists_create_with"
    //% weight=100
    //% color="#37474F"
    //% subcategory="Data Transmission"
    export function sendSensorData(values: number[]): void {
        if (!values) return;
        // Initialize only when this block is first used; leave later serial settings alone.
        if (!sensorDataSerialInitialized) {
            serial.setBaudRate(BaudRate.BaudRate115200);
            sensorDataSerialInitialized = true;
        }
        // One string write avoids writeLine's default 32-byte space padding.
        // Keep the user's current serial routing (USB by default).
        let line = values.join(",") + "\r\n";
        serial.writeString(line);
    }

    /**
     * Set a DIY-B digital output low (0) or high (1). An unsupported pin is ignored.
     * @param pin digital signal pin P8, P12, P13 or P16, eg: EZMakerDigitalPin.P8
     * @param value output level: 0 low or 1 high, eg: 1
     */
    //% help=github:pxt-ezmakershield-microbit/docs/reference/write-digital-pin
    //% blockId="ezmaker_write_digital"
    //% block="set DIY-B digital output on %pin to %value"
    //% pin.fieldEditor="gridpicker"
    //% pin.fieldOptions.columns=3
    //% weight=99
    //% color="#455A64"
    export function writeDigitalPin(pin: EZMakerDigitalPin, value: number): void {
        switch (<number>pin) {
            case 108: pins.digitalWritePin(DigitalPin.P8, value); break;
            case 112: pins.digitalWritePin(DigitalPin.P12, value); break;
            case 113: pins.digitalWritePin(DigitalPin.P13, value); break;
            case 116: pins.digitalWritePin(DigitalPin.P16, value); break;
        }
    }

    // =========================================================================
    // 1. DIY Sensors
    // =========================================================================

    /**
     * Read the DIY-A module's raw ADC value from 0 to 1023.
     * @param pin analog signal pin P0, P1 or P2, eg: EZMakerAnalogPin.P0
     */
    //% help=github:pxt-ezmakershield-microbit/docs/reference/read-diy-a-raw
    //% blockId="EZMAKER_diya_read_raw"
    //% block="read DIY-A sensor raw value (0-1023) on %pin"
    //% pin.fieldEditor="gridpicker" pin.fieldOptions.columns=3
    //% weight=100
    //% color="#546E7A"
    export function readDIYARaw(pin: EZMakerAnalogPin): number {
        let p: AnalogPin;
        switch(<number>pin) {
            case AnalogPin.P0: p = AnalogPin.P0; break;
            case AnalogPin.P1: p = AnalogPin.P1; break;
            case AnalogPin.P2: p = AnalogPin.P2; break;
            default: p = AnalogPin.P0;
        }
        return pins.analogReadPin(p);
    }

    /**
     * Convert a DIY-A ADC reading to nominal 0–3.3 V, rounded to two decimal places.
     * @param pin analog signal pin P0, P1 or P2, eg: EZMakerAnalogPin.P0
     */
    //% help=github:pxt-ezmakershield-microbit/docs/reference/read-diy-a-voltage
    //% blockId="EZMAKER_diya_read_voltage"
    //% block="read DIY-A sensor voltage (0-3.3V) on %pin"
    //% pin.fieldEditor="gridpicker" pin.fieldOptions.columns=3
    //% weight=99
    //% color="#546E7A"
    export function readDIYAVoltage(pin: EZMakerAnalogPin): number {
        let p: AnalogPin;
        switch(<number>pin) {
            case AnalogPin.P0: p = AnalogPin.P0; break;
            case AnalogPin.P1: p = AnalogPin.P1; break;
            case AnalogPin.P2: p = AnalogPin.P2; break;
            default: p = AnalogPin.P0;
        }
        let raw = pins.analogReadPin(p);
        let voltage = (raw * 3.3) / 1023.0;
        return Math.round(voltage * 100) / 100;
    }

    /**
     * Read the DIY-B analog module's raw ADC value from 0 to 1023.
     * @param pin analog signal pin P0, P1 or P2, eg: EZMakerAnalogPin.P1
     */
    //% help=github:pxt-ezmakershield-microbit/docs/reference/read-diy-b-analog
    //% blockId="EZMAKER_diyb_read_analog"
    //% block="read DIY-B sensor analog value (0-1023) on %pin"
    //% pin.fieldEditor="gridpicker" pin.fieldOptions.columns=3
    //% weight=95
    //% color="#455A64"
    export function readDIYBAnalog(pin: EZMakerAnalogPin): number {
        let p: AnalogPin;
        switch(<number>pin) {
            case AnalogPin.P0: p = AnalogPin.P0; break;
            case AnalogPin.P1: p = AnalogPin.P1; break;
            case AnalogPin.P2: p = AnalogPin.P2; break;
            default: p = AnalogPin.P0;
        }
        return pins.analogReadPin(p);
    }

    /**
     * Read whether a DIY-B digital input is high. An unsupported pin returns false.
     * @param pin digital signal pin P8, P12, P13 or P16, eg: EZMakerDigitalPin.P8
     */
    //% help=github:pxt-ezmakershield-microbit/docs/reference/read-diy-b-digital
    //% blockId="EZMAKER_diyb_read_digital"
    //% block="read DIY-B sensor digital input on %pin"
    //% pin.fieldEditor="gridpicker" pin.fieldOptions.columns=3
    //% weight=94
    //% color="#455A64"
    export function readDIYBDigital(pin: EZMakerDigitalPin): boolean {
        let d: DigitalPin;
        switch (<number>pin) {
            case 108: d = DigitalPin.P8; break;
            case 112: d = DigitalPin.P12; break;
            case 113: d = DigitalPin.P13; break;
            case 116: d = DigitalPin.P16; break;
            default: return false;
        }
        return pins.digitalReadPin(d) === 1;
    }

    // =========================================================================
    // 2. Basic Sensors
    // =========================================================================

    /**
     * Calculate a nominal MQ2 ppm estimate using fixed coefficients; the sensor is not calibrated by this block.
     * @param gasType coefficient selection: LPG, CO, Smoke, H2 or Propane, eg: EZMakerMQ2GasType.LPG
     * @param pin analog signal pin P0, P1 or P2, eg: EZMakerAnalogPin.P0
     */
    //% help=github:pxt-ezmakershield-microbit/docs/reference/read-mq2
    //% blockId="EZMAKER_mq2_read"
    //% block="read MQ2 gas sensor %gasType (ppm) on %pin"
    //% pin.fieldEditor="gridpicker" pin.fieldOptions.columns=3
    //% weight=92
    //% color="#6A1B9A"
    //% subcategory="Analog"
    export function readMQ2(gasType: EZMakerMQ2GasType, pin: EZMakerAnalogPin): number {
        let p: AnalogPin;
        switch(<number>pin) {
            case AnalogPin.P0: p = AnalogPin.P0; break;
            case AnalogPin.P1: p = AnalogPin.P1; break;
            case AnalogPin.P2: p = AnalogPin.P2; break;
            default: p = AnalogPin.P0;
        }

        let raw = pins.analogReadPin(p);
        let vOut = (raw * 3.3) / 1023.0;

        // Vout limit (0.05V ~ 3.25V)
        let v = vOut;
        if (v < 0.05) {
            v = 0.05;
        } else if (v > 3.25) {
            v = 3.25;
        }

        // Rs calculation (Load resistance RL = 10kOhm, R0 = 1045.0Ohm)
        let rs = 10000.0 * (3.3 - v) / v;
        let r0 = 1045.0;
        let ratio = rs / r0;

        let ppm = 0;
        switch (gasType) {
            case EZMakerMQ2GasType.LPG:
                ppm = 574.25 * Math.pow(ratio, -2.222);
                break;
            case EZMakerMQ2GasType.CO:
                ppm = 605.18 * Math.pow(ratio, -3.937);
                break;
            case EZMakerMQ2GasType.Smoke:
                ppm = 36974.00 * Math.pow(ratio, -3.109);
                break;
            case EZMakerMQ2GasType.H2:
                ppm = 977.26 * Math.pow(ratio, -3.638);
                break;
            case EZMakerMQ2GasType.Propane:
                ppm = 658.71 * Math.pow(ratio, -2.168);
                break;
        }

        return Math.round(ppm * 100) / 100;
    }

    /**
     * Read the external light module's raw ADC value from 0 to 1023.
     * @param pin analog signal pin P0, P1 or P2, eg: EZMakerAnalogPin.P1
     */
    //% help=github:pxt-ezmakershield-microbit/docs/reference/read-light-raw
    //% blockId="EZMAKER_light_read_raw"
    //% block="read light sensor raw value (0-1023) on %pin"
    //% pin.fieldEditor="gridpicker" pin.fieldOptions.columns=3
    //% weight=85
    //% color="#9A6700"
    //% subcategory="Analog"
    export function readLightRaw(pin: EZMakerAnalogPin): number {
        let p: AnalogPin;
        switch(<number>pin) {
            case AnalogPin.P0: p = AnalogPin.P0; break;
            case AnalogPin.P1: p = AnalogPin.P1; break;
            case AnalogPin.P2: p = AnalogPin.P2; break;
            default: p = AnalogPin.P0;
        }
        return pins.analogReadPin(p);
    }

    /**
     * Scale the external light ADC reading to 0–100; this is not a calibrated physical unit.
     * @param pin analog signal pin P0, P1 or P2, eg: EZMakerAnalogPin.P1
     */
    //% help=github:pxt-ezmakershield-microbit/docs/reference/read-light-percentage
    //% blockId="EZMAKER_light_read_percentage"
    //% block="read light sensor percentage (0-100) on %pin"
    //% pin.fieldEditor="gridpicker" pin.fieldOptions.columns=3
    //% weight=84
    //% color="#9A6700"
    //% subcategory="Analog"
    export function readLightPercentage(pin: EZMakerAnalogPin): number {
        let raw = readLightRaw(pin);
        let percent = (raw * 100) / 1023.0;
        return Math.round(percent);
    }

    /**
     * Read the external sound module's raw ADC value from 0 to 1023.
     * @param pin analog signal pin P0, P1 or P2, eg: EZMakerAnalogPin.P2
     */
    //% help=github:pxt-ezmakershield-microbit/docs/reference/read-sound-raw
    //% blockId="EZMAKER_sound_read_raw"
    //% block="read sound sensor raw value (0-1023) on %pin"
    //% pin.fieldEditor="gridpicker" pin.fieldOptions.columns=3
    //% weight=82
    //% color="#1565C0"
    //% subcategory="Analog"
    export function readSoundRaw(pin: EZMakerAnalogPin): number {
        let p: AnalogPin;
        switch(<number>pin) {
            case AnalogPin.P0: p = AnalogPin.P0; break;
            case AnalogPin.P1: p = AnalogPin.P1; break;
            case AnalogPin.P2: p = AnalogPin.P2; break;
            default: p = AnalogPin.P0;
        }
        return pins.analogReadPin(p);
    }

    /**
     * Scale the external sound ADC reading to 0–100; this is not a calibrated physical unit.
     * @param pin analog signal pin P0, P1 or P2, eg: EZMakerAnalogPin.P2
     */
    //% help=github:pxt-ezmakershield-microbit/docs/reference/read-sound-percentage
    //% blockId="EZMAKER_sound_read_percentage"
    //% block="read sound sensor percentage (0-100) on %pin"
    //% pin.fieldEditor="gridpicker" pin.fieldOptions.columns=3
    //% weight=81
    //% color="#1565C0"
    //% subcategory="Analog"
    export function readSoundPercentage(pin: EZMakerAnalogPin): number {
        let raw = readSoundRaw(pin);
        let percent = (raw * 100) / 1023.0;
        return Math.round(percent);
    }

    /**
     * Convert the voltage-module ADC reading to nominal 0–16.5 V, rounded to two decimal places.
     * @param pin analog signal pin P0, P1 or P2, eg: EZMakerAnalogPin.P2
     */
    //% help=github:pxt-ezmakershield-microbit/docs/reference/read-voltage
    //% blockId="EZMAKER_voltage_read"
    //% block="read voltage sensor (0-16.5V) on %pin"
    //% pin.fieldEditor="gridpicker" pin.fieldOptions.columns=3
    //% weight=60
    //% color="#2E7D32"
    //% subcategory="Analog"
    export function readVoltage(pin: EZMakerAnalogPin): number {
        let p: AnalogPin;
        switch(<number>pin) {
            case AnalogPin.P0: p = AnalogPin.P0; break;
            case AnalogPin.P1: p = AnalogPin.P1; break;
            case AnalogPin.P2: p = AnalogPin.P2; break;
            default: p = AnalogPin.P0;
        }
        let raw = pins.analogReadPin(p);
        let voltage = (raw * 16.5) / 1023.0;
        return Math.round(voltage * 100) / 100;
    }

    // =========================================================================
    // 3. Temp & Humidity
    // =========================================================================

    //% shim=ezmaker::readMax31850
    function readMax31850Shim(pin: number): number {
        return 25.5;
    }

    /**
     * Read MAX31850 temperature in °C, rounded to one decimal place; -999 indicates an invalid port or sensor fault.
     * @param port digital signal pin P8, P12, P13 or P16, eg: EZMakerDigitalPin.P12
     */
    //% help=github:pxt-ezmakershield-microbit/docs/reference/read-max31850
    //% blockId="EZMAKER_max31850_read"
    //% block="read high temp sensor temperature (°C) on %port"
    //% port.fieldEditor="gridpicker" port.fieldOptions.columns=3
    //% weight=91
    //% hiddenParts="temperature"
    //% color="#B71C1C"
    //% subcategory="Digital"
    export function readMax31850(port: EZMakerDigitalPin): number {
        let p: DigitalPin;
        switch (<number>port) {
            case 108: p = DigitalPin.P8; break;
            case 112: p = DigitalPin.P12; break;
            case 113: p = DigitalPin.P13; break;
            case 116: p = DigitalPin.P16; break;
            default: return -999;
        }
        let temp = readMax31850Shim(p);
        if (temp === -999) return -999;
        return Math.round(temp * 10) / 10;
    }

    let lastDS18B20Time = -2000;
    let lastDS18B20Temp = -273;
    let lastDS18B20Port = -1;

    //% shim=ezmaker::readDS18B20
    function readDS18B20Shim(pin: number): number {
        return 32.6;
    }

    /**
     * Read DS18B20 temperature in °C with a 1-second cache. Invalid port: -273; sensor failure: -999.
     * @param port digital signal pin P8, P12, P13 or P16, eg: EZMakerDigitalPin.P13
     */
    //% help=github:pxt-ezmakershield-microbit/docs/reference/read-ds18b20
    //% blockId="EZMAKER_ds18b20_read"
    //% block="read DS18B20 temperature sensor (°C) on %port"
    //% port.fieldEditor="gridpicker" port.fieldOptions.columns=3
    //% weight=80
    //% hiddenParts="temperature"
    //% color="#00695C"
    //% subcategory="Digital"
    export function readDS18B20(port: EZMakerDigitalPin): number {
        // Reject invalid ports before inspecting or changing the last valid cache.
        let p: DigitalPin;
        switch (<number>port) {
            case 108: p = DigitalPin.P8; break;
            case 112: p = DigitalPin.P12; break;
            case 113: p = DigitalPin.P13; break;
            case 116: p = DigitalPin.P16; break;
            default: return -273;
        }

        let currentTime = input.runningTime();
        if (currentTime - lastDS18B20Time < 1000 && lastDS18B20Port === <number>port) {
            if (lastDS18B20Temp !== -273) {
                return lastDS18B20Temp;
            }
        }

        lastDS18B20Time = currentTime;
        lastDS18B20Port = <number>port;

        let temp = readDS18B20Shim(p);

        if (temp < -100) {
            lastDS18B20Temp = -999;
            return lastDS18B20Temp;
        }

        lastDS18B20Temp = Math.round(temp * 100) / 100;
        return lastDS18B20Temp;
    }

    let lastDHT11Time = -2000;
    let lastTemperature = -1;
    let lastHumidity = -1;
    let lastDHT11Port = -1;
    let lastErrorCode = -1;
    let dht11Busy = false;

    //% shim=ezmaker::readDHT11
    function readDHT11Shim(pin: number): number {
        // The simulator has no DHT11 waveform: report an absent sensor.
        return -4;
    }

    /**
     * Read DHT11 temperature (°C) or humidity (%), cached for 1 second. Errors: -1 invalid port; -4 no response; -5/-6 timeout; -7 empty frame; -8 checksum; -9 busy.
     * @param port digital signal pin P8, P12, P13 or P16, eg: EZMakerDigitalPin.P16
     * @param dataType Temperature in °C or Humidity in percent
     */
    //% help=github:pxt-ezmakershield-microbit/docs/reference/read-dht11
    //% blockId="EZMAKER_dht11_read"
    //% block="read DHT11 %dataType on %port"
    //% port.fieldEditor="gridpicker" port.fieldOptions.columns=3
    //% weight=70
    //% color="#AD1457"
    //% subcategory="Digital"
    export function readDHT11(port: EZMakerDigitalPin, dataType: EZMakerDHT11DataType): number {
        let d: DigitalPin;
        switch (<number>port) {
            case 108: d = DigitalPin.P8; break;
            case 112: d = DigitalPin.P12; break;
            case 113: d = DigitalPin.P13; break;
            case 116: d = DigitalPin.P16; break;
            default: return -1;
        }

        if (dht11Busy) return -9;
        let currentTime = input.runningTime();
        let age = currentTime - lastDHT11Time;
        if (age >= 0 && age < 1000 && lastDHT11Port === <number>port) {
            if (lastErrorCode !== 0) return lastErrorCode;
            return dataType === EZMakerDHT11DataType.Temperature ? lastTemperature : lastHumidity;
        }

        // Invalidate both values before the native start signal yields. An
        // error must never expose a previous successful reading as fresh data.
        dht11Busy = true;
        lastDHT11Time = currentTime;
        lastDHT11Port = <number>port;
        lastTemperature = -1;
        lastHumidity = -1;
        lastErrorCode = -4;
        let reading = readDHT11Shim(d);
        dht11Busy = false;
        if (reading < 0) {
            lastErrorCode = reading;
            return lastErrorCode;
        }

        lastHumidity = Math.idiv(reading, 4096) / 10;
        lastTemperature = (reading & 4095) / 10;
        lastErrorCode = 0;
        
        return dataType === EZMakerDHT11DataType.Temperature ? lastTemperature : lastHumidity;
    }

    // =========================================================================
    // 4. NeoPixel
    // =========================================================================

    let neopixelStrips: neopixel.Strip[] = [];

    //% shim=ezmaker::sendNeoPixelBuffer
    function sendNeoPixelBuffer(buffer: Buffer, pin: DigitalPin): void {
        ws2812b.sendBuffer(buffer, pin);
    }

    // Keep the upstream effects and color/brightness calculations. Only the
    // physical transmission changes, including show() calls inside effects.
    class EZMakerNeoPixelStrip extends neopixel.Strip {
        show(): void {
            sendNeoPixelBuffer(this.buf, this.pin);
        }
    }

    function createNeoPixelStrip(pin: DigitalPin, length: number): neopixel.Strip {
        let strip = new EZMakerNeoPixelStrip();
        strip.buf = pins.createBuffer(length * 3);
        strip.start = 0;
        strip._length = length;
        strip._mode = NeoPixelMode.RGB;
        strip._matrixWidth = 0;
        strip.setBrightness(128);
        strip.setPin(pin);
        return strip;
    }

    function getNeoPixelStrip(pin: EZMakerDigitalPin, type: EZMakerNeoPixelType): neopixel.Strip {
        let p = <number>pin;
        if (!neopixelStrips[p] || neopixelStrips[p].length() !== <number>type) {
            let brightness = 128;
            if (neopixelStrips[p]) {
                brightness = neopixelStrips[p].brightness;
                // Send a full-length black frame before shrinking. Otherwise
                // LEDs beyond the new length retain their previous colors.
                neopixelStrips[p].clear();
                neopixelStrips[p].show();
            }
            switch (pin) {
                case EZMakerDigitalPin.P8:
                    neopixelStrips[p] = createNeoPixelStrip(DigitalPin.P8, <number>type);
                    break;
                case EZMakerDigitalPin.P12:
                    neopixelStrips[p] = createNeoPixelStrip(DigitalPin.P12, <number>type);
                    break;
                case EZMakerDigitalPin.P13:
                    neopixelStrips[p] = createNeoPixelStrip(DigitalPin.P13, <number>type);
                    break;
                case EZMakerDigitalPin.P16:
                    neopixelStrips[p] = createNeoPixelStrip(DigitalPin.P16, <number>type);
                    break;
                default:
                    neopixelStrips[p] = createNeoPixelStrip(DigitalPin.P8, <number>type);
            }
            neopixelStrips[p].setBrightness(brightness);
        }
        return neopixelStrips[p];
    }

    /**
     * Set every pixel in the selected module to one RGB color and send it immediately.
     * @param npType actual module size: Single=1, Bar=7 or Ring=12 pixels, eg: EZMakerNeoPixelType.Single
     * @param pin digital signal pin P8, P12, P13 or P16, eg: EZMakerDigitalPin.P8
     * @param color RGB color in 0xRRGGBB format
     */
    //% help=github:pxt-ezmakershield-microbit/docs/reference/set-neopixel-color-all
    //% blockId="EZMAKER_neopixel_set_color_all"
    //% block="set %npType neopixel on %pin to %color"
    //% color.shadow="colorNumberPicker" color.defl=0x0000FF
    //% pin.fieldEditor="gridpicker"
    //% pin.fieldOptions.columns=3
    //% weight=90
    //% hiddenParts="neopixel"
    //% color="#00838F"
    //% subcategory="NeoPixel"
    export function setNeoPixelColorAll(npType: EZMakerNeoPixelType, pin: EZMakerDigitalPin, color: number): void {
        let strip = getNeoPixelStrip(pin, npType);
        strip.showColor(color);
    }

    /**
     * Set one zero-based pixel to an RGB color and send the buffer. Out-of-range pixel indices are ignored.
     * @param npType actual module size: Single=1, Bar=7 or Ring=12 pixels, eg: EZMakerNeoPixelType.Single
     * @param pin digital signal pin P8, P12, P13 or P16, eg: EZMakerDigitalPin.P8
     * @param index zero-based index: Single 0, Bar 0–6, Ring 0–11, eg: 0
     * @param color RGB color in 0xRRGGBB format
     */
    //% help=github:pxt-ezmakershield-microbit/docs/reference/set-neopixel-pixel-color
    //% blockId="EZMAKER_neopixel_set_pixel_color"
    //% block="set %npType neopixel on %pin pixel at %index to %color"
    //% color.shadow="colorNumberPicker" color.defl=0x0000FF
    //% pin.fieldEditor="gridpicker"
    //% pin.fieldOptions.columns=3
    //% weight=89
    //% hiddenParts="neopixel"
    //% color="#00838F"
    //% subcategory="NeoPixel"
    export function setNeoPixelPixelColor(npType: EZMakerNeoPixelType, pin: EZMakerDigitalPin, index: number, color: number): void {
        let strip = getNeoPixelStrip(pin, npType);
        strip.setPixelColor(index, color);
        strip.show();
    }

    /**
     * Set brightness (0–255) for subsequent color writes. Existing buffered colors are not rescaled; rewrite the color to apply it.
     * @param npType actual module size: Single=1, Bar=7 or Ring=12 pixels, eg: EZMakerNeoPixelType.Single
     * @param pin digital signal pin P8, P12, P13 or P16, eg: EZMakerDigitalPin.P8
     * @param brightness brightness for later color writes, 0–255; use 32 to start, eg: 128
     */
    //% help=github:pxt-ezmakershield-microbit/docs/reference/set-neopixel-brightness
    //% blockId="EZMAKER_neopixel_set_brightness"
    //% block="set %npType neopixel on %pin brightness to %brightness"
    //% brightness.min=0 brightness.max=255
    //% pin.fieldEditor="gridpicker"
    //% pin.fieldOptions.columns=3
    //% weight=88
    //% hiddenParts="neopixel"
    //% color="#00838F"
    //% subcategory="NeoPixel"
    export function setNeoPixelBrightness(npType: EZMakerNeoPixelType, pin: EZMakerDigitalPin, brightness: number): void {
        let strip = getNeoPixelStrip(pin, npType);
        strip.setBrightness(brightness);
        strip.show();
    }

    /**
     * Set all pixels in the selected module to black and send the buffer; brightness is retained.
     * @param npType actual module size: Single=1, Bar=7 or Ring=12 pixels, eg: EZMakerNeoPixelType.Single
     * @param pin digital signal pin P8, P12, P13 or P16, eg: EZMakerDigitalPin.P8
     */
    //% help=github:pxt-ezmakershield-microbit/docs/reference/clear-neopixel
    //% blockId="EZMAKER_neopixel_clear"
    //% block="clear %npType neopixel on %pin"
    //% pin.fieldEditor="gridpicker"
    //% pin.fieldOptions.columns=3
    //% weight=87
    //% hiddenParts="neopixel"
    //% color="#00838F"
    //% subcategory="NeoPixel"
    export function clearNeoPixel(npType: EZMakerNeoPixelType, pin: EZMakerDigitalPin): void {
        let strip = getNeoPixelStrip(pin, npType);
        strip.clear();
        strip.show();
    }

    /**
     * Set and immediately send all 7 pixel colors in argument order.
     * @param pin digital signal pin P8, P12, P13 or P16, eg: EZMakerDigitalPin.P8
     * @param c1 RGB 0xRRGGBB color for pixel index 0
     * @param c2 RGB 0xRRGGBB color for pixel index 1
     * @param c3 RGB 0xRRGGBB color for pixel index 2
     * @param c4 RGB 0xRRGGBB color for pixel index 3
     * @param c5 RGB 0xRRGGBB color for pixel index 4
     * @param c6 RGB 0xRRGGBB color for pixel index 5
     * @param c7 RGB 0xRRGGBB color for pixel index 6
     */
    //% help=github:pxt-ezmakershield-microbit/docs/reference/set-neopixel-bar
    //% blockId="EZMAKER_neopixel_set_bar"
    //% block="bar neopixel on %pin : %c1 %c2 %c3 %c4 %c5 %c6 %c7"
    //% inlineInputMode=inline
    //% c1.shadow="colorNumberPicker" c1.defl=0xFF0000
    //% c2.shadow="colorNumberPicker" c2.defl=0xFFA500
    //% c3.shadow="colorNumberPicker" c3.defl=0xFFFF00
    //% c4.shadow="colorNumberPicker" c4.defl=0x00FF00
    //% c5.shadow="colorNumberPicker" c5.defl=0x0000FF
    //% c6.shadow="colorNumberPicker" c6.defl=0x4b0082
    //% c7.shadow="colorNumberPicker" c7.defl=0x8a2be2
    //% pin.fieldEditor="gridpicker" pin.fieldOptions.columns=3
    //% weight=86
    //% hiddenParts="neopixel"
    //% color="#00838F"
    //% subcategory="NeoPixel"
    export function setNeoPixelBar(pin: EZMakerDigitalPin, c1: number, c2: number, c3: number, c4: number, c5: number, c6: number, c7: number): void {
        let strip = getNeoPixelStrip(pin, EZMakerNeoPixelType.Bar);
        strip.setPixelColor(0, c1);
        strip.setPixelColor(1, c2);
        strip.setPixelColor(2, c3);
        strip.setPixelColor(3, c4);
        strip.setPixelColor(4, c5);
        strip.setPixelColor(5, c6);
        strip.setPixelColor(6, c7);
        strip.show();
    }

    /**
     * Set and immediately send all 12 pixel colors in argument order.
     * @param pin digital signal pin P8, P12, P13 or P16, eg: EZMakerDigitalPin.P8
     * @param c1 RGB 0xRRGGBB color for pixel index 0
     * @param c2 RGB 0xRRGGBB color for pixel index 1
     * @param c3 RGB 0xRRGGBB color for pixel index 2
     * @param c4 RGB 0xRRGGBB color for pixel index 3
     * @param c5 RGB 0xRRGGBB color for pixel index 4
     * @param c6 RGB 0xRRGGBB color for pixel index 5
     * @param c7 RGB 0xRRGGBB color for pixel index 6
     * @param c8 RGB 0xRRGGBB color for pixel index 7
     * @param c9 RGB 0xRRGGBB color for pixel index 8
     * @param c10 RGB 0xRRGGBB color for pixel index 9
     * @param c11 RGB 0xRRGGBB color for pixel index 10
     * @param c12 RGB 0xRRGGBB color for pixel index 11
     */
    //% help=github:pxt-ezmakershield-microbit/docs/reference/set-neopixel-ring
    //% blockId="EZMAKER_neopixel_set_ring"
    //% block="ring neopixel on %pin : %c1 %c2 %c3 %c4 %c5 %c6 %c7 %c8 %c9 %c10 %c11 %c12"
    //% inlineInputMode=inline
    //% c1.shadow="colorNumberPicker" c1.defl=0xFF0000
    //% c2.shadow="colorNumberPicker" c2.defl=0xFF3F00
    //% c3.shadow="colorNumberPicker" c3.defl=0xFF7F00
    //% c4.shadow="colorNumberPicker" c4.defl=0xFFFF00
    //% c5.shadow="colorNumberPicker" c5.defl=0x7FFF00
    //% c6.shadow="colorNumberPicker" c6.defl=0x00FF00
    //% c7.shadow="colorNumberPicker" c7.defl=0x00FF7F
    //% c8.shadow="colorNumberPicker" c8.defl=0x00FFFF
    //% c9.shadow="colorNumberPicker" c9.defl=0x0000FF
    //% c10.shadow="colorNumberPicker" c10.defl=0x4B0082
    //% c11.shadow="colorNumberPicker" c11.defl=0x8A2BE2
    //% c12.shadow="colorNumberPicker" c12.defl=0xFF00FF
    //% pin.fieldEditor="gridpicker" pin.fieldOptions.columns=3
    //% weight=85
    //% hiddenParts="neopixel"
    //% color="#00838F"
    //% subcategory="NeoPixel"
    export function setNeoPixelRing(pin: EZMakerDigitalPin, c1: number, c2: number, c3: number, c4: number, c5: number, c6: number, c7: number, c8: number, c9: number, c10: number, c11: number, c12: number): void {
        let strip = getNeoPixelStrip(pin, EZMakerNeoPixelType.Ring);
        strip.setPixelColor(0, c1);
        strip.setPixelColor(1, c2);
        strip.setPixelColor(2, c3);
        strip.setPixelColor(3, c4);
        strip.setPixelColor(4, c5);
        strip.setPixelColor(5, c6);
        strip.setPixelColor(6, c7);
        strip.setPixelColor(7, c8);
        strip.setPixelColor(8, c9);
        strip.setPixelColor(9, c10);
        strip.setPixelColor(10, c11);
        strip.setPixelColor(11, c12);
        strip.show();
    }

    /**
     * Fill and send a static hue gradient; this block does not animate it over time.
     * @param npType actual module size: Single=1, Bar=7 or Ring=12 pixels, eg: EZMakerNeoPixelType.Bar
     * @param pin digital signal pin P8, P12, P13 or P16, eg: EZMakerDigitalPin.P8
     * @param startHue starting hue 1–360; default 1, eg: 1
     * @param endHue ending hue 1–360; default 360, eg: 360
     */
    //% help=github:pxt-ezmakershield-microbit/docs/reference/show-neopixel-rainbow
    //% blockId="EZMAKER_neopixel_show_rainbow"
    //% block="show rainbow on %npType neopixel on %pin from %startHue to %endHue"
    //% startHue.min=1 startHue.max=360 startHue.defl=1
    //% endHue.min=1 endHue.max=360 endHue.defl=360
    //% pin.fieldEditor="gridpicker"
    //% pin.fieldOptions.columns=3
    //% weight=84
    //% hiddenParts="neopixel"
    //% color="#00838F"
    //% subcategory="NeoPixel"
    export function showNeoPixelRainbow(npType: EZMakerNeoPixelType, pin: EZMakerDigitalPin, startHue: number = 1, endHue: number = 360): void {
        let strip = getNeoPixelStrip(pin, npType);
        strip.showRainbow(startHue, endHue);
        strip.show();
    }

    /**
     * Move pixel colors by a signed offset, fill vacated pixels with black, and send the buffer.
     * @param npType actual module size: Single=1, Bar=7 or Ring=12 pixels, eg: EZMakerNeoPixelType.Bar
     * @param pin digital signal pin P8, P12, P13 or P16, eg: EZMakerDigitalPin.P8
     * @param offset pixel offset: positive towards higher indices, negative towards lower; default 1, eg: 1
     */
    //% help=github:pxt-ezmakershield-microbit/docs/reference/shift-neopixel
    //% blockId="EZMAKER_neopixel_shift"
    //% block="shift %npType neopixel on %pin by %offset"
    //% offset.defl=1
    //% pin.fieldEditor="gridpicker"
    //% pin.fieldOptions.columns=3
    //% weight=83
    //% hiddenParts="neopixel"
    //% color="#00838F"
    //% subcategory="NeoPixel"
    export function shiftNeoPixel(npType: EZMakerNeoPixelType, pin: EZMakerDigitalPin, offset: number = 1): void {
        let strip = getNeoPixelStrip(pin, npType);
        strip.shift(offset);
        strip.show();
    }

    /**
     * Move pixel colors by a signed offset, wrapping at the ends, and send the buffer.
     * @param npType actual module size: Single=1, Bar=7 or Ring=12 pixels, eg: EZMakerNeoPixelType.Bar
     * @param pin digital signal pin P8, P12, P13 or P16, eg: EZMakerDigitalPin.P8
     * @param offset pixel offset: positive towards higher indices, negative towards lower; default 1, eg: 1
     */
    //% help=github:pxt-ezmakershield-microbit/docs/reference/rotate-neopixel
    //% blockId="EZMAKER_neopixel_rotate"
    //% block="rotate %npType neopixel on %pin by %offset"
    //% offset.defl=1
    //% pin.fieldEditor="gridpicker"
    //% pin.fieldOptions.columns=3
    //% weight=82
    //% hiddenParts="neopixel"
    //% color="#00838F"
    //% subcategory="NeoPixel"
    export function rotateNeoPixel(npType: EZMakerNeoPixelType, pin: EZMakerDigitalPin, offset: number = 1): void {
        let strip = getNeoPixelStrip(pin, npType);
        strip.rotate(offset);
        strip.show();
    }

    /**
     * Show the magnitude of a value against a positive maximum. Zero and nonpositive maxima use marker pixels; clear explicitly to switch off.
     * @param npType actual module size: Single=1, Bar=7 or Ring=12 pixels, eg: EZMakerNeoPixelType.Bar
     * @param pin digital signal pin P8, P12, P13 or P16, eg: EZMakerDigitalPin.P8
     * @param value value to plot; the library uses its absolute magnitude
     * @param high positive maximum for the fixed scale; default 255, eg: 255
     */
    //% help=github:pxt-ezmakershield-microbit/docs/reference/show-neopixel-bar-graph
    //% blockId="EZMAKER_neopixel_show_bar_graph"
    //% block="show bar graph on %npType neopixel on %pin of %value up to %high"
    //% high.defl=255
    //% pin.fieldEditor="gridpicker"
    //% pin.fieldOptions.columns=3
    //% weight=81
    //% hiddenParts="neopixel"
    //% color="#00838F"
    //% subcategory="NeoPixel"
    export function showNeoPixelBarGraph(npType: EZMakerNeoPixelType, pin: EZMakerDigitalPin, value: number, high: number = 255): void {
        let strip = getNeoPixelStrip(pin, npType);
        strip.showBarGraph(value, high);
    }
}
