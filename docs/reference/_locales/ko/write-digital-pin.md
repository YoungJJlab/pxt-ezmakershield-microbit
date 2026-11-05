# writeDigitalPin

디지털 출력을 0 또는 1로 설정합니다. 지원하지 않는 핀은 무시합니다.

```sig
ezmaker.writeDigitalPin(EZMakerDigitalPin.P8, 1)
```

## 매개변수

- **pin**: 디지털 신호 핀 P8·P12·P13·P16 중 하나
- **value**: 출력 상태: 0은 Low, 1은 High

## 반환값

반환값 없이 선택한 출력을 변경합니다.

## 연결과 동작

전원을 끄고 모듈의 신호 핀을 선택한 포트에 연결합니다. 전원·GND·신호 배선은 실제 모듈과 쉴드 설명서를 따릅니다.

호환 디지털 출력 모듈에 사용합니다. 서보·PWM 명령이 아닙니다. 전원·GND는 모듈 설명서를 따릅니다.

시뮬레이터만으로 연결한 모듈의 전기적 동작을 확인할 수 없으므로 실제 보드에서 관찰합니다.

## 예제와 예상 결과

A는 P8을 1, B는 0으로 설정합니다. 연결한 호환 표시 모듈의 반응을 관찰합니다.

```blocks
// 연결한 모듈에서 아래 동작을 관찰합니다.
ezmaker.writeDigitalPin(EZMakerDigitalPin.P8, 0)
input.onButtonPressed(Button.A, function () {
    ezmaker.writeDigitalPin(EZMakerDigitalPin.P8, 1)
})
input.onButtonPressed(Button.B, function () {
    ezmaker.writeDigitalPin(EZMakerDigitalPin.P8, 0)
})
```

## 관련 자료

- [전체 블록 도움말](https://github.com/YoungJJlab/pxt-ezmakershield-microbit/blob/main/docs/reference/_locales/ko/README.md)
- [설치와 수업자료](https://github.com/YoungJJlab/pxt-ezmakershield-microbit/blob/main/README_ko.md)

```package
pxt-ezmakershield-microbit=github:YoungJJlab/pxt-ezmakershield-microbit
```
