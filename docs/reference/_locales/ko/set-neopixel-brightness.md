# setNeoPixelBrightness

이후 색상 쓰기에 적용할 밝기(0~255)를 정합니다. 기존 버퍼는 재계산하지 않으므로 색상을 다시 써야 적용됩니다.

```sig
ezmaker.setNeoPixelBrightness(EZMakerNeoPixelType.Ring, EZMakerDigitalPin.P8, 32)
```

## 매개변수

- **npType**: 실제 모듈 크기: Single 1개·Bar 7개·Ring 12개
- **pin**: 디지털 신호 핀 P8·P12·P13·P16 중 하나
- **brightness**: 이후 색상 쓰기의 밝기 0~255; 시작값 32 권장

## 반환값

반환값 없이 밝기를 저장하고 기존 바이트를 재계산하지 않은 현재 버퍼를 전송합니다.

## 연결과 동작

전원을 끄고 모듈의 신호 핀을 선택한 포트에 연결합니다. 전원·GND·신호 배선은 실제 모듈과 쉴드 설명서를 따릅니다.

초기 밝기는 128입니다. 고정 버전의 네오픽셀 라이브러리는 색상을 쓸 때 밝기를 적용하므로 밝기만 바꾸면 기존 색상이 어두워지지 않습니다. 밝기를 정한 뒤 원하는 색상을 다시 쓰고 0~255 범위를 지킵니다.

시뮬레이터만으로 연결한 모듈의 전기적 동작을 확인할 수 없으므로 실제 보드에서 관찰합니다.

## 예제와 예상 결과

A의 빨강·밝기 32와 B의 빨강·밝기 8을 비교합니다. 두 동작 모두 밝기를 정한 뒤 색상을 다시 씁니다.

```blocks
// 연결한 모듈에서 아래 동작을 관찰합니다.
input.onButtonPressed(Button.A, function () {
    ezmaker.setNeoPixelBrightness(EZMakerNeoPixelType.Ring, EZMakerDigitalPin.P8, 32)
    ezmaker.setNeoPixelColorAll(EZMakerNeoPixelType.Ring, EZMakerDigitalPin.P8, 0xff0000)
})
input.onButtonPressed(Button.B, function () {
    ezmaker.setNeoPixelBrightness(EZMakerNeoPixelType.Ring, EZMakerDigitalPin.P8, 8)
    ezmaker.setNeoPixelColorAll(EZMakerNeoPixelType.Ring, EZMakerDigitalPin.P8, 0xff0000)
})
```

## 관련 자료

- [전체 블록 도움말](https://github.com/YoungJJlab/pxt-ezmakershield-microbit/blob/main/docs/reference/_locales/ko/README.md)
- [설치와 수업자료](https://github.com/YoungJJlab/pxt-ezmakershield-microbit/blob/main/README_ko.md)

```package
pxt-ezmakershield-microbit=github:YoungJJlab/pxt-ezmakershield-microbit
```
