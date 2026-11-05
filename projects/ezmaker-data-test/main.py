# Only CSV records go to serial. Open USB serial at 115200, 8N1, no flow control.
# A: 3 values. B: 5 values. A+B: live ADC values from P0/P1/P2.

def on_button_pressed_a():
    ezmaker.send_sensor_data([10, 20.5, -3])
input.on_button_pressed(Button.A, on_button_pressed_a)

def on_button_pressed_b():
    ezmaker.send_sensor_data([10, 20.5, -3, 40, 50])
input.on_button_pressed(Button.B, on_button_pressed_b)

def on_button_pressed_ab():
    ezmaker.send_sensor_data([ezmaker.read_diya_raw(EZMakerAnalogPin.P0),
            ezmaker.read_diya_raw(EZMakerAnalogPin.P1),
            ezmaker.read_diya_raw(EZMakerAnalogPin.P2)])
input.on_button_pressed(Button.AB, on_button_pressed_ab)
