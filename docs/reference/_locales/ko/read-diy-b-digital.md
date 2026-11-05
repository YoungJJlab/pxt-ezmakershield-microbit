# readDIYBDigital

DIY-B 디지털 입력이 High인지 읽습니다. 지원하지 않는 핀은 false를 반환합니다.

```sig
ezmaker.readDIYBDigital(EZMakerDigitalPin.P8)
```

## 매개변수

- **pin**: 디지털 신호 핀 P8·P12·P13·P16 중 하나

## 반환값

입력이 High이면 true, 그 외에는 false입니다.

## 연결과 동작

전원을 끄고 모듈의 신호 핀을 선택한 포트에 연결합니다. 전원·GND·신호 배선은 실제 모듈과 쉴드 설명서를 따릅니다.

모듈의 아날로그 출력이 아닌 디지털 출력을 연결합니다. High·Low의 의미는 모듈에 따라 다릅니다.

시뮬레이터만으로 연결한 모듈의 전기적 동작을 확인할 수 없으므로 실제 보드에서 관찰합니다.

## 예제와 예상 결과

A는 High에서 1, Low에서 0을 표시합니다. 모듈 입력을 바꾸고 반복합니다.

```blocks
// 연결한 모듈에서 아래 동작을 관찰합니다.
input.onButtonPressed(Button.A, function () {
    if (ezmaker.readDIYBDigital(EZMakerDigitalPin.P8)) {
        basic.showNumber(1)
    } else {
        basic.showNumber(0)
    }
})
```

## 관련 자료

- [전체 블록 도움말](https://github.com/YoungJJlab/pxt-ezmakershield-microbit/blob/main/docs/reference/_locales/ko/README.md)
- [설치와 수업자료](https://github.com/YoungJJlab/pxt-ezmakershield-microbit/blob/main/README_ko.md)

```package
pxt-ezmakershield-microbit=github:YoungJJlab/pxt-ezmakershield-microbit
```
