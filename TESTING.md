# EZMAKER extension tests

The published PXT test suite is `test.ts`, registered in `pxt.json.testFiles`. It calls every one of the 27 public APIs, checks results, completes without an infinite loop, and accepts documented sensor errors when hardware is absent.

The local runner copies this file into `projects/ezmaker-suite-test/main.ts` before compilation. Edit root `test.ts`; the generated runner is refreshed on the next suite check/build. Existing example projects are preserved.

## Run the automated checks

Use the pinned Node/PXT environment described in [LOCAL_DEVELOPMENT.md](LOCAL_DEVELOPMENT.md). Docker Desktop must run Linux containers for native C++ host tests and V1/V2 firmware builds. Run native builds sequentially.

For a new checkout, run `npm ci` and `npm run dev:setup` first. The NeoPixel historical negative controls use the small checked-in `scripts/tests/neopixel-legacy-fixtures.json`, so the same checks run without private `.dev` backups. Generated firmware is produced by the build commands below, rather than downloaded from private local links.

```powershell
npm.cmd test
npm.cmd run build:suite:v1
npm.cmd run build:suite:v2
```

`npm test` stops with a nonzero exit status on the first failed step. A complete pass currently comprises 3,492 checks/assertions:

| Layer | Checks | What it establishes |
|---|---:|---|
| Publication manifest | 389 | `public: true`, exact file names/case/extensions, test.ts, unique paths and bilingual toolbox labels |
| BMP280 | 1,130 | 72 actual relative-altitude/button/state checks, 54 wrapper/simulator checks and 1,004 production native checks: register model, independent integer/64-bit compensation oracle, both addresses, units, errors, hot replacement, bounded waits and locks |
| Data transmission | 47 | First-use 115200 initialization, no reconfiguration on repeat sends, later user settings/routing, restart, CSV/CRLF/no padding and variable length |
| Basic APIs | 287 | ADC routing/endpoints/rounding, nominal MQ2 coefficients, digital routing |
| Temperature decoder | 160 | Signed/fractional/zero values, DS18B20 limits/configuration, CRC corruption and MAX31850 faults |
| DS18B20 TypeScript wrapper | 247 | Repeated invalid ports never expose a previous temperature or replace a valid cache; all port mappings, 999/1000 ms cache boundary, errors/recovery and production simulator fallback |
| DHT11 wrapper | 53 | Success/error caching, recovery, port switching, concurrent reads, clock rollback and simulator fallback |
| DHT11 receiver | 242 | Actual C++ receiver with valid, truncated, stuck and corrupted waveforms, edge/frame/poll limits and timer rollover |
| NeoPixel API/program | 293 | Actual extension, upstream effects/buffers, all sizes/ports, brightness retention, tail clearing and A/B regression sequence |
| V1 sender instructions | 248 | Actual assembly source control flow, GPIO pulse/byte model, exact lengths and read boundaries; legacy extra-byte regression |
| Compiled micro:bit simulator | 396 | 66 assertions in each of six runs: V1/V2 board models at ADC 0/512/1023 |

The compiled-simulator check uses the real PXT runtime and micro:bit `DalBoard`, with an observer at public function entry. Every run must execute all 27 APIs and reach the PASS marker within 10 seconds. Sensor protocol fallbacks remain unchanged. It is a headless simulator run, without SVG rendering.

Models and host tests do not measure electrical waveforms, real sensor accuracy or physical LEDs. Those are checked separately below. MQ2 vectors protect the current nominal calculation; they do not validate gas calibration.

## `test.ts` expected results

On the simulator, run to completion with no external hardware. Expected sensor fallbacks are MAX31850 `25.5`, DS18B20 `32.6`, DHT11 `-4` and BMP280 `-9999`. 

On V1/V2 hardware, **disconnect all external modules before running this automated smoke suite**. It drives all four supported digital ports and transmits NeoPixel patterns. No loopback wires are required. Floating analog/digital inputs may vary, and absent sensor results are allowed.

- Pass: serial output includes `checks:66` and `EZMAKER TEST PASS`; the LED matrix displays a check mark. The suite finishes, and all four digital outputs are left low.
- Fail: an assertion/panic, runtime exception, missing PASS marker or failure to complete within 10 seconds. `control.assert` reports "EZMAKER test" and panic code 98; source comments identify each condition.
- An absent MAX31850/DS18B20 may return `-999`; DHT11 may return `-4` to `-9`. These are expected transport outcomes, not a failed smoke test.

Firmware: `.dev/firmware/ezmaker-suite-v1.hex` and `ezmaker-suite-v2.hex`. Passing these disconnected-board tests does not certify attached modules.

## Public API coverage

All rows are called by `test.ts`; the detailed regressions complement its range/error/no-crash checks.

| Public API | Detailed automatic expectation | Physical check |
|---|---|---|
| `enableBMP280AltitudeButtons` | 72 opt-in/event/state/error/recovery/cancellation checks; setup does not sample or claim A+B | A/B normal operation user-confirmed on V1/V2; detailed scenarios in BMP280_TESTING.md |
| `readBMP280` | 1,130 wrapper/native/button compensation/transport/address/error checks; missing hardware returns -9999 in both channel selections | Normal readings user-confirmed on V1/V2; per-address/recovery details in BMP280_TESTING.md |
| `sendSensorData` | Exact CSV string and 115200 before each write; 0/1/3/5/64/128 values, negatives/decimals and list resizing | V1/V2 sensor transmission user-confirmed; see DATA_TRANSMISSION_TESTING.md for array/UI checks |
| `writeDigitalPin` | High/low routed to P8/P12/P13/P16; invalid pin ignored | Basic group 6, LED/output module changes state |
| `readDIYARaw` | Exact 0–1023 fixtures on P0/P1/P2 | Basic group 0, change analog input |
| `readDIYAVoltage` | Rounded 0–3.3 V nominal conversion | Basic group 0, compare a known input/reference |
| `readDIYBAnalog` | Exact ADC fixtures and routing | Basic group 1, analog response |
| `readDIYBDigital` | Boolean high/low and invalid-port fallback | Basic group 1, change digital input |
| `readMQ2` | All five gas selections, clamps and fixed numeric vectors | Basic group 5, record output; calibration is separate |
| `readLightRaw` | Exact ADC fixtures | Basic group 2, cover/uncover sensor |
| `readLightPercentage` | Endpoint/midpoint rounding to 0–100 | Basic group 2, record raw/percentage |
| `readSoundRaw` | Exact ADC fixtures | Basic group 3, compare quiet/sound input |
| `readSoundPercentage` | Endpoint/midpoint rounding to 0–100 | Basic group 3, record raw/percentage |
| `readVoltage` | Rounded nominal 0–16.5 V module conversion | Basic group 4, use voltage module instructions and a reference |
| `readMax31850` | Decoder/CRC/fault tests plus simulator call | [Temperature procedure](TEMPERATURE_TESTING.md) |
| `readDS18B20` | Decoder/CRC/configuration plus actual wrapper invalid-port/cache/error/recovery and simulator tests | [Temperature procedure](TEMPERATURE_TESTING.md) |
| `readDHT11` | Both data types, cache, errors and receiver limits | [DHT11 procedure](DHT11_TESTING.md) |
| `setNeoPixelColorAll` | Exact GRB data, all sizes and brightness | NeoPixel A sequence |
| `setNeoPixelPixelColor` | Last pixel and out-of-range indices | Pixel positions; detailed buffer regression |
| `setNeoPixelBrightness` | 0/1/64/128/255 and 8/32 transition regression | NeoPixel B, retained brightness |
| `clearNeoPixel` | Black frames and tail clearing | NeoPixel A+B |
| `setNeoPixelBar` | Seven distinct pixel values | Seven-pixel palette |
| `setNeoPixelRing` | Twelve distinct pixel values | Twelve-pixel palette |
| `showNeoPixelRainbow` | Nonblack buffer of correct size; inherited show dispatch | Rainbow visible over selected length |
| `shiftNeoPixel` | Exact shifted bytes, vacated pixels zero | Color pattern shifts and edge clears |
| `rotateNeoPixel` | Exact wraparound bytes | Color pattern wraps |
| `showNeoPixelBarGraph` | Correct frame length/nonzero graph; inherited show dispatch | Graph responds to changing input |

## Attached-module validation

Use one matching module at a time with its documented power and signal wiring. The basic test project starts with group 0, A cycles groups 0–6, and B reads the selected module or toggles group 6 output. Analog tests use P0; digital tests use P8. The display shows one result; serial output includes the named measurements. `handler_ms_including_display` includes display time.

| Group | Module/action | Expected observation |
|---:|---|---|
| 0 | DIY-A analog | Raw 0–1023, voltage 0–3.3; both respond to input |
| 1 | DIY-B analog P0 / digital P8 | Analog response and digital 0/1 response; test the applicable output separately |
| 2 | Light | Raw and percentage change with illumination |
| 3 | Sound | Raw and percentage respond to the module's sound output |
| 4 | Voltage sensor module | Reading follows the module input/reference within the product's specified tolerance |
| 5 | MQ2 | Finite, nonnegative nominal readings for five selections; record warm-up state and calibration status |
| 6 | Digital output indicator | B alternates output 1/0; leaving group 6 resets it to 0 |

Build with `build:basic:v1` / `build:basic:v2`. Test each available module on both board versions. Record the exact module, port, stimulus/reference, observed values and pass/fail. Mark unavailable modules **not tested**, rather than pass. Follow the voltage module's connection/input specifications. Physical gas/voltage accuracy needs the relevant reference and product tolerance.

For NeoPixel palette/effect observations beyond the supplied A/B program, use the corresponding blocks in a local project, then rebuild for each board. A pixel index is zero-based; bar/ring palette colors follow the argument order. Use the automated frame checks for exact bytes and the physical test for actual color/order/motion.

## Evidence and current status

- Naming, MAX31850/DS18B20, DHT11, and corrected NeoPixel stages have user-confirmed V1/V2 operation. Their procedure files retain the scope and unreported details.
- On 2026-11-05, DS18B20 port validation was moved before cache access to fix stale values on repeated invalid ports. The added 247 wrapper checks and all 2,048 checks passed. The user confirmed normal operation after receiving the updated V1/V2 temperature firmware. Individual measured values and additional-port results were not supplied. Native driver code was unchanged.
- Stage 4 automatic checks and firmware generation are recorded under `.dev/`; disconnected suite and remaining basic-module hardware results are pending.
- Record format: date, board V1/V2, firmware filename/hash, module, port, test/stimulus, expected, actual, pass/fail, notes.
- Test infrastructure includes the actual NeoPixel base class in the DHT11 harness so the complete extension can load.
- Release versions are recorded in pxt.json. Publishing a release and obtaining gallery approval are separate steps.

See [TESTING_ko.md](TESTING_ko.md) for the next hands-on steps in Korean.

Ultrasonic support was removed by user decision on 2026-11-05 to retain compatibility with sold hardware without resistor replacement. It is excluded from the current API, firmware and test scope. Existing projects using its removed block/API must remove it before upgrading. The current suite covers all 27 supported APIs; historical stage counts above refer to their original scope.

The current supported API count is 27, including data transmission and BMP280 relative-altitude buttons; ultrasonic remains excluded. See [serial CSV tests](DATA_TRANSMISSION_TESTING.md) for V1/V2 user-confirmed reception and remaining array/UI checks. Simulator runs also verify the exact `0,1,-2.5\r\n` record.

BMP280 normal readings and A zero/B restore have been user-confirmed on V1/V2. Separate per-address and error-recovery records are not inferred from that general confirmation; see [BMP280 tests](BMP280_TESTING.md).
