// Derived from Microsoft pxt-microbit libs/core/sendbuffer.s.
// The MIT License (MIT)
// Copyright (c) Microsoft Corporation. All rights reserved.
// Copyright (c) 2026 EZMAKER-lab
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

.syntax unified
.thumb
.section .text.ezmaker_neopixel_send_v1
.global ezmaker_neopixel_send_v1
.type ezmaker_neopixel_send_v1, %function
.thumb_func
ezmaker_neopixel_send_v1:
    // r0=data, r1=byte count, r2=pin mask, r3=&GPIO.OUTSET
    cmp r1, #0
    ble .empty
    push {r4,r5,r6,r7,lr}
    mov r4, r0
    mov r5, r1
    mov r1, r2
    mov r2, r3
    adds r2, #4 // GPIO.OUTCLR immediately follows OUTSET
    b .start

.nextbit:
    str r1, [r3, #0]
    tst r6, r0
    bne .islate
    str r1, [r2, #0]
.islate:
    lsrs r6, r6, #1
    bne .justbit
    adds r4, #1
    subs r5, #1
    // Stop at zero, before loading any byte beyond the declared buffer.
    // BEQ has the same not-taken timing as the original BCC instruction.
    beq .stop
.start:
    movs r6, #0x80
    nop
.common:
    str r1, [r2, #0]
    ldrb r0, [r4, #0]
    b .nextbit
.justbit:
    b .common
.stop:
    str r1, [r2, #0]
    pop {r4,r5,r6,r7,pc}
.empty:
    bx lr
.size ezmaker_neopixel_send_v1, .-ezmaker_neopixel_send_v1
