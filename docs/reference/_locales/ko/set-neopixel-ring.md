# setNeoPixelRing

12개 픽셀의 색상을 인자 순서대로 설정하고 즉시 전송합니다.

```sig
ezmaker.setNeoPixelRing(EZMakerDigitalPin.P8, 0xff0000, 0xff3f00, 0xff7f00, 0xffff00, 0x7fff00, 0x00ff00, 0x00ff7f, 0x00ffff, 0x0000ff, 0x4b0082, 0x8a2be2, 0xff00ff)
```

## 매개변수

- **pin**: 디지털 신호 핀 P8·P12·P13·P16 중 하나
- **c1**: 0번 픽셀의 0xRRGGBB RGB 색상
- **c2**: 1번 픽셀의 0xRRGGBB RGB 색상
- **c3**: 2번 픽셀의 0xRRGGBB RGB 색상
- **c4**: 3번 픽셀의 0xRRGGBB RGB 색상
- **c5**: 4번 픽셀의 0xRRGGBB RGB 색상
- **c6**: 5번 픽셀의 0xRRGGBB RGB 색상
- **c7**: 6번 픽셀의 0xRRGGBB RGB 색상
- **c8**: 7번 픽셀의 0xRRGGBB RGB 색상
- **c9**: 8번 픽셀의 0xRRGGBB RGB 색상
- **c10**: 9번 픽셀의 0xRRGGBB RGB 색상
- **c11**: 10번 픽셀의 0xRRGGBB RGB 색상
- **c12**: 11번 픽셀의 0xRRGGBB RGB 색상

## 반환값

반환값 없이 전체 팔레트를 전송합니다.

## 연결과 동작

전원을 끄고 모듈의 신호 핀을 선택한 포트에 연결합니다. 전원·GND·신호 배선은 실제 모듈과 쉴드 설명서를 따릅니다.

c1은 0번, c12는 11번입니다. 12개 Ring 크기를 자동 선택하므로 밝기도 같은 종류로 설정합니다.

시뮬레이터만으로 연결한 모듈의 전기적 동작을 확인할 수 없으므로 실제 보드에서 관찰합니다.

## 예제와 예상 결과

A는 12개 색상을 순서대로 표시하고 B는 해당 모듈을 끕니다.

```blocks
// 연결한 모듈에서 아래 동작을 관찰합니다.
ezmaker.setNeoPixelBrightness(EZMakerNeoPixelType.Ring, EZMakerDigitalPin.P8, 32)
input.onButtonPressed(Button.A, function () {
    ezmaker.setNeoPixelRing(EZMakerDigitalPin.P8, 0xff0000, 0xff3f00, 0xff7f00, 0xffff00, 0x7fff00, 0x00ff00, 0x00ff7f, 0x00ffff, 0x0000ff, 0x4b0082, 0x8a2be2, 0xff00ff)
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
