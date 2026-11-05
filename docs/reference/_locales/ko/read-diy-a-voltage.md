# readDIYAVoltage

DIY-A ADC 값을 명목 전압 0~3.3 V로 환산하고 소수점 둘째 자리로 반올림합니다.

```sig
ezmaker.readDIYAVoltage(EZMakerAnalogPin.P0)
```

## 매개변수

- **pin**: 아날로그 신호 핀 P0·P1·P2 중 하나

## 반환값

raw × 3.3 / 1023을 소수점 둘째 자리로 반올림한 전압(V)입니다.

## 연결과 동작

전원을 끄고 모듈의 신호 핀을 선택한 포트에 연결합니다. 전원·GND·신호 배선은 실제 모듈과 쉴드 설명서를 따릅니다.

보드·모듈을 교정한 값이 아닌 명목 환산값입니다.

시뮬레이터만으로 연결한 모듈의 전기적 동작을 확인할 수 없으므로 실제 보드에서 관찰합니다.

## 예제와 예상 결과

A로 모듈 신호 전압을 표시합니다. 정확도를 확인하려면 적절한 기준값과 비교합니다.

```blocks
// 연결한 모듈에서 아래 동작을 관찰합니다.
input.onButtonPressed(Button.A, function () {
    let value = ezmaker.readDIYAVoltage(EZMakerAnalogPin.P0)
    serial.writeValue("diy_a_V", value)
    basic.showNumber(value)
})
```

## 관련 자료

- [전체 블록 도움말](https://github.com/YoungJJlab/pxt-ezmakershield-microbit/blob/main/docs/reference/_locales/ko/README.md)
- [설치와 수업자료](https://github.com/YoungJJlab/pxt-ezmakershield-microbit/blob/main/README_ko.md)

```package
pxt-ezmakershield-microbit=github:YoungJJlab/pxt-ezmakershield-microbit
```
