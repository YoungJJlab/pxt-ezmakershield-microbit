// Automatic receiver comparison: A=100 ms, B=500 ms, A+B=abort.
// Every run starts at mode 0; modes 0..3 each attempt exactly 20 data lines.
// ASCII markers are repeated twice so damaged output remains easier to group.
let diagnosticBusy = false
let diagnosticAbort = false

function diagnosticMarker(text: string) {
    serial.writeString(text + "\r\n")
    basic.pause(100)
    serial.writeString(text + "\r\n")
    basic.pause(100)
}

function runSerialDiagnostic(interval: number) {
    if (!diagnosticBusy) {
        diagnosticBusy = true
        diagnosticAbort = false
        serial.setBaudRate(BaudRate.BaudRate115200)
        diagnosticMarker("RUN_BEGIN," + interval)
        for (let mode = 0; mode < 4; mode++) {
            if (diagnosticAbort) break
            basic.showNumber(mode)
            diagnosticMarker("MODE_BEGIN," + mode + "," + interval)
            let sent = 0
            for (let row = 0; row < 20; row++) {
                if (diagnosticAbort) break
                if (mode == 0) {
                    // Baseline: run-level baud setup, fixed raw string.
                    serial.writeString("12345,67890\r\n")
                } else if (mode == 1) {
                    ezmaker.sendSensorData([12345, 67890])
                } else if (mode == 2) {
                    serial.setWriteLinePadding(0)
                    serial.writeLine("12345,67890")
                } else {
                    // Diagnostic only: default SDK space padding.
                    serial.setWriteLinePadding(32)
                    serial.writeLine("12345,67890")
                }
                sent += 1
                basic.pause(interval)
            }
            diagnosticMarker("MODE_END," + mode + "," + sent)
            basic.pause(300)
        }
        if (diagnosticAbort) {
            diagnosticMarker("RUN_ABORTED," + interval)
            basic.showIcon(IconNames.No)
        } else {
            diagnosticMarker("RUN_END," + interval + ",80")
            basic.showIcon(IconNames.Yes)
        }
        diagnosticBusy = false
    }
}

input.onButtonPressed(Button.A, function () {
    runSerialDiagnostic(100)
})
input.onButtonPressed(Button.B, function () {
    runSerialDiagnostic(500)
})
input.onButtonPressed(Button.AB, function () {
    diagnosticAbort = true
})
serial.setBaudRate(BaudRate.BaudRate115200)
basic.showString("A")
