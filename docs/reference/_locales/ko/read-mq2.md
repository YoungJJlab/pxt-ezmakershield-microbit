# readMQ2

고정 계수로 MQ2의 명목 ppm 추정값을 계산합니다. 이 블록은 센서를 교정하지 않습니다.

```sig
ezmaker.readMQ2(EZMakerMQ2GasType.LPG, EZMakerAnalogPin.P0)
```

## 매개변수

- **gasType**: 계수 선택: LPG·CO·Smoke·H2·Propane
- **pin**: 아날로그 신호 핀 P0·P1·P2 중 하나

## 반환값

소수점 둘째 자리로 반올림한 명목 ppm 추정값이며 검증된 농도가 아닙니다.

## 연결과 동작

전원을 끄고 모듈의 신호 핀을 선택한 포트에 연결합니다. 전원·GND·신호 배선은 실제 모듈과 쉴드 설명서를 따릅니다.

현재 계산은 부하 10 kΩ, 고정 R0=1045 Ω, 0.05~3.25 V로 제한한 신호를 사용합니다. 농도를 해석하기 전에 실제 모듈·예열·교정을 확인합니다. 가스 선택은 계산 계수를 바꾸며 혼합 기체를 선택적으로 식별하지 않습니다.

시뮬레이터만으로 연결한 모듈의 전기적 동작을 확인할 수 없으므로 실제 보드에서 관찰합니다.

## 예제와 예상 결과

A로 LPG 명목 계산값을 기록합니다. 값이 변한다는 사실만으로 농도 정확도가 검증되지는 않습니다.

```blocks
// 연결한 모듈에서 아래 동작을 관찰합니다.
input.onButtonPressed(Button.A, function () {
    let value = ezmaker.readMQ2(EZMakerMQ2GasType.LPG, EZMakerAnalogPin.P0)
    serial.writeValue("mq2_nominal_ppm", value)
    basic.showNumber(value)
})
```

## 관련 자료

- [전체 블록 도움말](https://github.com/YoungJJlab/pxt-ezmakershield-microbit/blob/main/docs/reference/_locales/ko/README.md)
- [설치와 수업자료](https://github.com/YoungJJlab/pxt-ezmakershield-microbit/blob/main/README_ko.md)

```package
pxt-ezmakershield-microbit=github:YoungJJlab/pxt-ezmakershield-microbit
```
