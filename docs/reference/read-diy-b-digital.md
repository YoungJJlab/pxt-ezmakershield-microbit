# readDIYBDigital

Read whether a DIY-B digital input is high. An unsupported pin returns false.

```sig
ezmaker.readDIYBDigital(EZMakerDigitalPin.P8)
```

## Parameters

- **pin**: digital signal pin P8, P12, P13 or P16

## Returns

true for a high input, false otherwise.

## Connection and behavior

With power off, connect the module signal to the selected port. Follow the actual module and shield instructions for power, GND and signal wiring.

Connect the module digital output, not its analog output. The module determines what high and low mean.

The simulator does not establish the electrical behavior of an attached module; check observations on the actual board.

## Example and expected result

A shows 1 for high and 0 for low. Change the module input and repeat.

```blocks
// Observe the following actions on the connected module.
input.onButtonPressed(Button.A, function () {
    if (ezmaker.readDIYBDigital(EZMakerDigitalPin.P8)) {
        basic.showNumber(1)
    } else {
        basic.showNumber(0)
    }
})
```

## See also

- [All block references](https://github.com/YoungJJlab/pxt-ezmakershield-microbit/blob/main/docs/reference/README.md)
- [Setup and classroom lessons](https://github.com/YoungJJlab/pxt-ezmakershield-microbit/blob/main/README.md)

```package
pxt-ezmakershield-microbit=github:YoungJJlab/pxt-ezmakershield-microbit
```
