# Lesson: events, colors and a NeoPixel ring

[한국어](neopixel_ko.md) · [Extension and setup](../../README.md) · [Back to light sensing](light.md)

## Learning goals and preparation

Allow about 30–40 minutes. Learners will predict an event-driven color sequence, use a variable to remember the next action, and distinguish RGB color from brightness.

Prepare a micro:bit V1 or V2, EZMAKER Shield, compatible **12-LED NeoPixel ring**, matching cable and a computer with MakeCode. Add the extension from the setup guide.

With power off, connect the ring's **data input to P8**, with power and common GND according to the module instructions. The arrow/data-input marking matters. This program uses `Ring` consistently because that type represents 12 LEDs. A 7-LED bar or single LED needs its matching type instead.

## Program

Create a new project and use this example on its own. Brightness is 32 on a 0–255 scale. A cycles red, green, blue; B clears the ring and resets the next color to red.

```blocks
let nextColor = 0
// Set brightness once; each color below uses the same brightness.
ezmaker.setNeoPixelBrightness(EZMakerNeoPixelType.Ring, EZMakerDigitalPin.P8, 32)
input.onButtonPressed(Button.A, function () {
    // Each hexadecimal value has red, green and blue channels: 0xRRGGBB.
    if (nextColor === 0) {
        ezmaker.setNeoPixelColorAll(EZMakerNeoPixelType.Ring, EZMakerDigitalPin.P8, 0xff0000)
    } else if (nextColor === 1) {
        ezmaker.setNeoPixelColorAll(EZMakerNeoPixelType.Ring, EZMakerDigitalPin.P8, 0x00ff00)
    } else {
        ezmaker.setNeoPixelColorAll(EZMakerNeoPixelType.Ring, EZMakerDigitalPin.P8, 0x0000ff)
    }
    // After blue, the next press starts at red again.
    nextColor = (nextColor + 1) % 3
})
input.onButtonPressed(Button.B, function () {
    ezmaker.clearNeoPixel(EZMakerNeoPixelType.Ring, EZMakerDigitalPin.P8)
    nextColor = 0
})
```

## Predict, observe and record

1. Before downloading, predict the colors of the first four A presses.
2. Download and press A four times, recording what all 12 LEDs do.
3. Press B. All LEDs should switch off; the next A should be red.
4. Change brightness from 32 to 8, download again and repeat the comparison under the same viewing conditions.

| Action | Prediction | Observation | Does it match? |
|---|---|---|---|
| A, first press | | | |
| A, second press | | | |
| A, third press | | | |
| A, fourth press | | | |
| B, then A | | | |

Expected: red → green → blue → red, with all 12 pixels changing together. B leaves every pixel off. Lowering brightness should reduce light output; it does not change the chosen RGB color. Different colors need not look equally bright to the eye.

## Discuss and extend

- Why does the program need `nextColor`? Explain the values 0, 1 and 2.
- What does `% 3` do when `nextColor + 1` reaches 3?
- Keep `Ring` selected, clear it, then try `setNeoPixelPixelColor` with index 0 and index 11. Indices run from 0 to 11, so these are the first and last pixels. Do not change to `Single` to address one pixel of a ring.
- Design a three-color signal for a classroom situation. Describe what each color means before writing the sequence.

## If observations do not match

Check P8, the ring's data-input direction, power, common GND and selected `Ring` type. If fewer pixels change, confirm that the module really has 12 LEDs and that every block uses the same type. The simulator does not establish physical ring behavior; test with the actual board and ring.

See [NEOPIXEL_TESTING.md](../../NEOPIXEL_TESTING.md) for brightness/length regression procedures and [TESTING.md](../../TESTING.md) for automated coverage.
