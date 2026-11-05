# readLightRaw

외부 밝기 모듈의 ADC 원시값 0~1023을 읽습니다.

```sig
ezmaker.readLightRaw(EZMakerAnalogPin.P0)
```

## 매개변수

- **pin**: 아날로그 신호 핀 P0·P1·P2 중 하나

## 반환값

0~1023 범위의 정수 ADC 값입니다.

## 연결과 동작

전원을 끄고 모듈의 신호 핀을 선택한 포트에 연결합니다. 전원·GND·신호 배선은 실제 모듈과 쉴드 설명서를 따릅니다.

내장 센서가 아닌 외부 모듈을 읽습니다. 조도(lux)가 아니며 밝아질 때 값이 커지는지 작아지는지 모듈에서 관찰합니다.

시뮬레이터만으로 연결한 모듈의 전기적 동작을 확인할 수 없으므로 실제 보드에서 관찰합니다.

## 예제와 예상 결과

A로 값을 표시·기록합니다. 모듈의 입력 조건을 바꾸어 비교합니다.

```blocks
// 연결한 모듈에서 아래 동작을 관찰합니다.
input.onButtonPressed(Button.A, function () {
    let value = ezmaker.readLightRaw(EZMakerAnalogPin.P0)
    serial.writeValue("read_light_raw", value)
    basic.showNumber(value)
})
```

## 관련 자료

- [전체 블록 도움말](https://github.com/YoungJJlab/pxt-ezmakershield-microbit/blob/main/docs/reference/_locales/ko/README.md)
- [설치와 수업자료](https://github.com/YoungJJlab/pxt-ezmakershield-microbit/blob/main/README_ko.md)

```package
pxt-ezmakershield-microbit=github:YoungJJlab/pxt-ezmakershield-microbit
```
