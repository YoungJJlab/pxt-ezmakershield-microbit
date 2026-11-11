# EZMAKER Shield for micro:bit

MakeCode blocks for sensors and NeoPixel modules connected to the EZMAKER Shield with micro:bit V1 or V2. The extension provides **27 public block APIs** for classroom activities involving inputs, measurements, decisions and outputs. This is an API count, not a count of supported sensor models.

EZMAKER is the brand of **HAICT Inc.** The materials below are intended for school lessons, including primary and secondary education in South Korea.

- [Product details](https://ezmaker.co.kr/eng/page/?pid=product_view&it_id=1785899937)
- [Purchase and current pricing](https://mall.ezmaker.co.kr/user/product_detail?product_no=202608-1101)
- [한국어 설명서](README_ko.md)

## Add the extension

1. Open [MakeCode for micro:bit](https://makecode.microbit.org/) and create a project.
2. Open **Extensions** and search for `https://github.com/YoungJJlab/pxt-ezmakershield-microbit`.
3. Select the extension and open **ezmaker**. With Korean selected in the editor, the category is **이지메이커**.

MakeCode gallery approval is pending. Use the repository URL to add the extension. Changes in this working folder become available through that URL after publication to GitHub. For immediate local testing, see [LOCAL_DEVELOPMENT.md](LOCAL_DEVELOPMENT.md).

## Toolbox organization

The toolbox has three subcategories: **Sensors** (15 blocks), **NeoPixel** (10 blocks) and **Data Transmission** (1 block). Digital output remains directly under **ezmaker**. Sensor subcategories from v0.0.38 are combined; existing block IDs and TypeScript APIs are unchanged. Korean labels are **센서**, **네오픽셀** and **데이터전송**.

## Implemented blocks and ports

| Family | APIs | Current implementation | Selectable signal pins |
|---|---:|---|---|
| Barometric Pressure | 2 | BMP280 pressure (hPa), relative altitude (m), temperature (°C) | I2C P19/P20; channel 0=0x77, channel 1=0x76 |
| Data Transmission | 1 | Numeric sensor list as one CSV string line at 115200 baud; adjustable list length | Current serial route (USB by default) |
| Digital output | 1 | Set an output low or high | P8, P12, P13, P16 |
| DIY sensors | 4 | DIY-A raw/voltage; DIY-B analog/digital input | Analog: P0, P1, P2; digital: P8, P12, P13, P16 |
| Basic sensors | 6 | MQ2 nominal calculation; light/sound raw and percentage; voltage-module conversion | P0, P1, P2 |
| Temperature and humidity | 3 | MAX31850, DS18B20 and DHT11 protocol reads | P8, P12, P13, P16 |
| NeoPixel | 10 | Color, individual pixels, brightness, clear, palettes, rainbow, shift, rotate and bar graph | P8, P12, P13, P16 |

MAX31850 and DS18B20 use Dallas 1-Wire. DHT11 uses a different single-wire protocol. NeoPixel sizes are **Single (1 LED), Bar (7 LEDs), Ring (12 LEDs)**; select the size matching the connected module.

P0/P1/P2 are the analog inputs offered by these blocks, not analog-only micro:bit pins. The shield's I2C connection (P19=SCL, P20=SDA) supports the BMP280 driver described above; other connector wiring does not by itself imply driver support. This extension has no dedicated SCD40, ICM-20948, INA219, LCD, PMS7003, HX711 or servo driver. Such modules need their own compatible software and wiring.

Follow the module's documented signal, power and GND connections. Select the pin carrying its output; not every connector contact is used by every module. The voltage block applies a nominal 0–16.5 V **voltage-module** conversion; this is not a bare micro:bit pin's permissible input range. Light/sound percentages scale the ADC value and are not lux or decibels. MQ2 uses fixed nominal coefficients and does not calibrate a gas sensor.

## Classroom examples

Use each example in a separate project. Add the extension first, connect the specified module with power off, and follow its power/GND instructions. The code is editable TypeScript and can be viewed as blocks.

### 1. Observe an external light sensor

Connect the module's analog signal to **P0**. Cover and uncover it, then compare readings. A larger number makes a larger LED bar; the direction of the sensor's response depends on the module.

```blocks
basic.forever(function () {
    // Read the external sensor, not the micro:bit's built-in light sensor.
    let light = ezmaker.readLightRaw(EZMakerAnalogPin.P0)
    serial.writeValue("light_raw", light)
    // Use the fixed ADC range, 0–1023, for the graph scale.
    led.plotBarGraph(light, 1023)
    basic.pause(500)
})
```

Expected: values remain within 0–1023 and respond to changing illumination. See the [light-sensor lesson](docs/lessons/light.md) for recording prompts and troubleshooting.

### 2. Measure temperature and handle a missing sensor

Connect a **DS18B20 to P13**. Press A to measure. Learners distinguish valid data from errors without treating below-zero temperatures as errors.

```blocks
input.onButtonPressed(Button.A, function () {
    let temperature = ezmaker.readDS18B20(EZMakerDigitalPin.P13)
    // Only these sentinels indicate errors; negative temperatures can be valid.
    if (temperature === -999 || temperature === -273) {
        serial.writeValue("sensor_error", temperature)
        basic.showString("ERR")
    } else {
        serial.writeValue("temperature_C", temperature)
        basic.showNumber(temperature)
    }
})
```

Expected: a connected sensor reports °C. A sensor communication failure returns `-999`; an unsupported port argument returns `-273`. Results are cached for one second. See the [temperature lesson](docs/lessons/temperature.md) for disconnection/recovery and repeated measurements.

### 3. Control a 12-LED ring

Connect the ring's data input to **P8**. A turns all 12 pixels red; B switches them off. Compare a color value with brightness.

```blocks
// Select the actual 12-LED ring and start at modest brightness.
ezmaker.setNeoPixelBrightness(EZMakerNeoPixelType.Ring, EZMakerDigitalPin.P8, 32)
input.onButtonPressed(Button.A, function () {
    // 0xRRGGBB specifies the red, green and blue channels.
    ezmaker.setNeoPixelColorAll(EZMakerNeoPixelType.Ring, EZMakerDigitalPin.P8, 0xff0000)
})
input.onButtonPressed(Button.B, function () {
    ezmaker.clearNeoPixel(EZMakerNeoPixelType.Ring, EZMakerDigitalPin.P8)
})
```

Expected: A lights the entire ring red; B clears it. See the [NeoPixel lesson](docs/lessons/neopixel.md) to cycle colors and address individual pixels.

## Educational materials

Each lesson includes preparation, wiring, commented code, expected observations, recording prompts and follow-up questions. Teachers can adapt the duration and questions to their learners.

| Lesson | Concepts | English | 한국어 |
|---|---|---|---|
| External light sensor | Sampling, ADC scale, observations | [Lesson](docs/lessons/light.md) | [수업 자료](docs/lessons/light_ko.md) |
| DS18B20 temperature | Measurement, conditions, missing data | [Lesson](docs/lessons/temperature.md) | [수업 자료](docs/lessons/temperature_ko.md) |
| NeoPixel ring | Events, sequence, RGB and pixel indices | [Lesson](docs/lessons/neopixel.md) | [수업 자료](docs/lessons/neopixel_ko.md) |

## Language, simulator and verification

English is the base language. Korean localization covers blocks and main/subcategory labels; API names such as `ezmaker.readDS18B20` remain unchanged.

Right-click an extension block and choose **Help** for its parameters, return values, connection notes and example. Korean editor settings select the Korean reference page and tooltips; English is the fallback. Browse all [English block references](docs/reference/README.md) or [한국어 블록 도움말](docs/reference/_locales/ko/README.md).

The simulator does not model attached modules. MAX31850 and DS18B20 return example temperatures of 25.5 and 32.6 °C; DHT11 reports an absent-sensor error. Simulated light inputs or LEDs do not establish external-module behavior. Download to a V1 or V2 board to observe physical sensors and LEDs.

[TESTING.md](TESTING.md) covers all 27 APIs, automated checks, expected results and hardware pass/fail procedures. [TESTING_ko.md](TESTING_ko.md) contains the Korean hardware checklist. Some physical module checks remain pending; confirmed and untested cases are distinguished. Publish the updated repository before supplying new lesson links in an approval reply.

## License

MIT. See [LICENSE](LICENSE) and retained third-party notices in the source.

## Compatibility and migration

Ultrasonic sensors are excluded from this extension. Reliable V1/V2 operation was not established for the existing single-wire CS100A hardware without changing sold units. The ultrasonic block and `ezmaker.ultrasonicDistance` API have been removed. Remove calls/blocks that use it before updating an existing project. This change does not require resistor replacement for the other supported APIs.

The global enum names have also changed to use the common EZMaker prefix requested during approval review. Update these names in existing TypeScript programs. If an older block has an invalid dropdown after updating, reselect its current option.

| Previous enum | Current enum |
|---|---|
| EZAnalogPin | EZMakerAnalogPin |
| EZDigitalPin | EZMakerDigitalPin |
| MQ2GasType | EZMakerMQ2GasType |
| DHT11DataType | EZMakerDHT11DataType |
| NeoPixelType | EZMakerNeoPixelType |

## Transmit sensor readings

Use **ezmaker → Data Transmission** and add/remove numeric-array items with + / −. `ezmaker.sendSensorData([10, 20.5, -3])` sends exactly `10,20.5,-3\r\n` as a string at 115200 baud. The first non-null call selects 115200 baud once; later calls preserve the current serial settings. Replace numbers with sensor blocks to send live values. See [format and testing](DATA_TRANSMISSION_TESTING.md).

BMP280 supports channel 0=0x77 and channel 1=0x76, with pressure/relative-altitude/temperature selection. Before zeroing, the reference defaults to 1013.25 hPa. Normal operation, including A zero/B restore, has been user-confirmed on V1 and V2. Per-channel and error-recovery details are recorded separately in [BMP280 tests](BMP280_TESTING.md).

For button-controlled relative altitude, place `enableBMP280AltitudeButtons` in on start: A zeros the current location and B restores the read block's original reference. See [A/B setup](docs/reference/enable-bmp280-altitude-buttons.md). Use A/B for this feature without separate A/B event blocks.
