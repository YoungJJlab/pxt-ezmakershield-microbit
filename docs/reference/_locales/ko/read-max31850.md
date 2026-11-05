# readMax31850

MAX31850 온도를 소수점 첫째 자리의 °C로 읽습니다. 잘못된 포트·센서 오류는 -999입니다.

```sig
ezmaker.readMax31850(EZMakerDigitalPin.P12)
```

## 매개변수

- **port**: 디지털 신호 핀 P8·P12·P13·P16 중 하나

## 반환값

섭씨 온도이며 잘못된 포트·측정 실패 시 -999입니다.

## 연결과 동작

전원을 끄고 모듈의 신호 핀을 선택한 포트에 연결합니다. 전원·GND·신호 배선은 실제 모듈과 쉴드 설명서를 따릅니다.

포트마다 호환 MAX31850 열전대 모듈 하나를 사용하고 전원·데이터 풀업·프로브 배선 설명을 따릅니다. 아날로그 열전대 입력이 아닌 Dallas 1-Wire입니다.

시뮬레이터는 예시 온도 25.5 °C를 반환합니다.

## 예제와 예상 결과

A로 온도 또는 ERR를 표시합니다. -999가 아닌 음수 온도를 모두 오류로 처리하지 않습니다.

```blocks
// 연결한 모듈에서 아래 동작을 관찰합니다.
input.onButtonPressed(Button.A, function () {
    let value = ezmaker.readMax31850(EZMakerDigitalPin.P12)
    if (value === -999) {
        serial.writeValue("sensor_error", value)
        basic.showString("ERR")
    } else {
        serial.writeValue("MAX31850_C", value)
        basic.showNumber(value)
    }
})
```

## 관련 자료

- [전체 블록 도움말](https://github.com/YoungJJlab/pxt-ezmakershield-microbit/blob/main/docs/reference/_locales/ko/README.md)
- [설치와 수업자료](https://github.com/YoungJJlab/pxt-ezmakershield-microbit/blob/main/README_ko.md)

```package
pxt-ezmakershield-microbit=github:YoungJJlab/pxt-ezmakershield-microbit
```
