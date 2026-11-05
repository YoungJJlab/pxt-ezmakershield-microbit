# setNeoPixelPixelColor

0부터 시작하는 픽셀 하나의 RGB 색상을 설정하고 전송합니다. 범위 밖 픽셀 번호는 무시합니다.

```sig
ezmaker.setNeoPixelPixelColor(EZMakerNeoPixelType.Ring, EZMakerDigitalPin.P8, 0, 0xff0000)
```

## 매개변수

- **npType**: 실제 모듈 크기: Single 1개·Bar 7개·Ring 12개
- **pin**: 디지털 신호 핀 P8·P12·P13·P16 중 하나
- **index**: 0부터 시작하는 번호: Single 0, Bar 0~6, Ring 0~11
- **color**: 0xRRGGBB 형식의 RGB 색상

## 반환값

반환값 없이 해당 픽셀을 변경하고 버퍼를 전송합니다.

## 연결과 동작

전원을 끄고 모듈의 신호 핀을 선택한 포트에 연결합니다. 전원·GND·신호 배선은 실제 모듈과 쉴드 설명서를 따릅니다.

다른 픽셀 색상은 유지됩니다. 링의 한 픽셀을 제어할 때도 Ring을 사용하며 Single로 바꾸지 않습니다.

시뮬레이터만으로 연결한 모듈의 전기적 동작을 확인할 수 없으므로 실제 보드에서 관찰합니다.

## 예제와 예상 결과

꺼진 링에서 시작하면 A는 0번만 빨간색으로 켜고 B는 12개 모두 끕니다.

```blocks
// 연결한 모듈에서 아래 동작을 관찰합니다.
ezmaker.setNeoPixelBrightness(EZMakerNeoPixelType.Ring, EZMakerDigitalPin.P8, 32)
input.onButtonPressed(Button.A, function () {
    ezmaker.setNeoPixelPixelColor(EZMakerNeoPixelType.Ring, EZMakerDigitalPin.P8, 0, 0xff0000)
})
input.onButtonPressed(Button.B, function () {
    ezmaker.clearNeoPixel(EZMakerNeoPixelType.Ring, EZMakerDigitalPin.P8)
})
```

## 관련 자료

- [전체 블록 도움말](https://github.com/YoungJJlab/pxt-ezmakershield-microbit/blob/main/docs/reference/_locales/ko/README.md)
- [설치와 수업자료](https://github.com/YoungJJlab/pxt-ezmakershield-microbit/blob/main/README_ko.md)

```package
pxt-ezmakershield-microbit=github:YoungJJlab/pxt-ezmakershield-microbit
```
