# readDS18B20

DS18B20 온도를 °C로 읽고 1초 캐시합니다. 잘못된 포트는 -273, 센서 실패는 -999입니다.

```sig
ezmaker.readDS18B20(EZMakerDigitalPin.P13)
```

## 매개변수

- **port**: 디지털 신호 핀 P8·P12·P13·P16 중 하나

## 반환값

소수점 둘째 자리 온도이며 잘못된 포트는 -273, 센서 실패는 -999입니다.

## 연결과 동작

전원을 끄고 모듈의 신호 핀을 선택한 포트에 연결합니다. 전원·GND·신호 배선은 실제 모듈과 쉴드 설명서를 따릅니다.

포트마다 일반 전원 방식 DS18B20 모듈 하나와 필요한 데이터 풀업을 사용합니다. 마지막 포트의 읽기 결과와 센서 오류를 1초 캐시합니다. 유효한 포트를 바꾸면 다시 측정하며 잘못된 포트는 정상 캐시를 바꾸지 않습니다. 분리·회복 관찰 시 2초 이상 기다립니다.

시뮬레이터는 실물 측정이 아닌 예시 온도 32.6 °C를 반환합니다.

## 예제와 예상 결과

A로 온도 또는 ERR를 표시합니다. 영하도 정상 온도일 수 있으므로 정확한 오류값을 검사합니다.

```blocks
// 연결한 모듈에서 아래 동작을 관찰합니다.
input.onButtonPressed(Button.A, function () {
    let value = ezmaker.readDS18B20(EZMakerDigitalPin.P13)
    if (value === -999 || value === -273) {
        serial.writeValue("sensor_error", value)
        basic.showString("ERR")
    } else {
        serial.writeValue("DS18B20_C", value)
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
