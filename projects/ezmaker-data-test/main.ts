// Only CSV records go to serial. Open USB serial at 115200, 8N1, no flow control.
// A: 3 values. B: 5 values. A+B: live ADC values from P0/P1/P2.
input.onButtonPressed(Button.A, function () {
    ezmaker.sendSensorData([10, 20.5, -3])
})
input.onButtonPressed(Button.B, function () {
    ezmaker.sendSensorData([10, 20.5, -3, 40, 50])
})
input.onButtonPressed(Button.AB, function () {
    ezmaker.sendSensorData([
        ezmaker.readDIYARaw(EZMakerAnalogPin.P0),
        ezmaker.readDIYARaw(EZMakerAnalogPin.P1),
        ezmaker.readDIYARaw(EZMakerAnalogPin.P2)
    ])
})
