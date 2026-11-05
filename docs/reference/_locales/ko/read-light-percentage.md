# readLightPercentage

외부 밝기 ADC 값을 0~100으로 환산합니다. 교정된 물리 단위가 아닙니다.

```sig
ezmaker.readLightPercentage(EZMakerAnalogPin.P0)
```

## 매개변수

- **pin**: 아날로그 신호 핀 P0·P1·P2 중 하나

## 반환값

raw × 100 / 1023을 반올림한 정수입니다.

## 연결과 동작

전원을 끄고 모듈의 신호 핀을 선택한 포트에 연결합니다. 전원·GND·신호 배선은 실제 모듈과 쉴드 설명서를 따릅니다.

백분율은 ADC 비율이며 lux가 아닙니다. 밝아질 때 증가하는지는 모듈에서 관찰합니다.

시뮬레이터만으로 연결한 모듈의 전기적 동작을 확인할 수 없으므로 실제 보드에서 관찰합니다.

## 예제와 예상 결과

A로 0~100의 값을 표시하고 입력 조건을 바꾸어 비교합니다.

```blocks
// 연결한 모듈에서 아래 동작을 관찰합니다.
input.onButtonPressed(Button.A, function () {
    let value = ezmaker.readLightPercentage(EZMakerAnalogPin.P0)
    serial.writeValue("light_percent", value)
    basic.showNumber(value)
})
```

## 관련 자료

- [전체 블록 도움말](https://github.com/YoungJJlab/pxt-ezmakershield-microbit/blob/main/docs/reference/_locales/ko/README.md)
- [설치와 수업자료](https://github.com/YoungJJlab/pxt-ezmakershield-microbit/blob/main/README_ko.md)

```package
pxt-ezmakershield-microbit=github:YoungJJlab/pxt-ezmakershield-microbit
```
