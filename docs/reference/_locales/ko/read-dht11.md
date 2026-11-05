# readDHT11

DHT11 온도(°C)·습도(%)를 읽고 1초 캐시합니다. 오류: -1 포트, -4 무응답, -5·-6 시간 초과, -7 빈 데이터, -8 체크섬, -9 측정 중.

```sig
ezmaker.readDHT11(EZMakerDigitalPin.P16, EZMakerDHT11DataType.Temperature)
```

## 매개변수

- **port**: 디지털 신호 핀 P8·P12·P13·P16 중 하나
- **dataType**: Temperature는 섭씨 온도, Humidity는 상대습도(%)

## 반환값

선택한 값 또는 음수 오류값입니다. -1 포트, -4 무응답, -5·-6 응답·데이터 시간 초과, -7 빈 프레임, -8 체크섬 오류, -9 다른 측정 진행 중입니다.

## 연결과 동작

전원을 끄고 모듈의 신호 핀을 선택한 포트에 연결합니다. 전원·GND·신호 배선은 실제 모듈과 쉴드 설명서를 따릅니다.

온도·습도는 같은 프레임 또는 오류를 1초 동안 공유합니다. 두 값을 연속으로 읽고 새 측정 전 1초 이상 기다립니다. Dallas 1-Wire와 다른 단일 신호선 프로토콜입니다.

시뮬레이터에는 DHT11 신호가 없어 -4를 반환합니다.

## 예제와 예상 결과

A로 같은 프레임의 두 값을 기록하거나 ERR를 표시합니다. 시뮬레이터에는 DHT11 신호가 없어 -4를 반환합니다.

```blocks
// 연결한 모듈에서 아래 동작을 관찰합니다.
input.onButtonPressed(Button.A, function () {
    let temperature = ezmaker.readDHT11(EZMakerDigitalPin.P16, EZMakerDHT11DataType.Temperature)
    let humidity = ezmaker.readDHT11(EZMakerDigitalPin.P16, EZMakerDHT11DataType.Humidity)
    if (temperature < 0 || humidity < 0) {
        serial.writeValue("dht11_error", temperature)
        basic.showString("ERR")
    } else {
        serial.writeValue("temperature_C", temperature)
        serial.writeValue("humidity_percent", humidity)
        basic.showNumber(temperature)
        basic.showNumber(humidity)
    }
})
```

## 관련 자료

- [전체 블록 도움말](https://github.com/YoungJJlab/pxt-ezmakershield-microbit/blob/main/docs/reference/_locales/ko/README.md)
- [설치와 수업자료](https://github.com/YoungJJlab/pxt-ezmakershield-microbit/blob/main/README_ko.md)

```package
pxt-ezmakershield-microbit=github:YoungJJlab/pxt-ezmakershield-microbit
```
