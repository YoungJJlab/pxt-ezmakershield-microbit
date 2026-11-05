# clearNeoPixel

선택한 모듈의 모든 픽셀을 검정으로 설정·전송합니다. 밝기 설정은 유지합니다.

```sig
ezmaker.clearNeoPixel(EZMakerNeoPixelType.Ring, EZMakerDigitalPin.P8)
```

## 매개변수

- **npType**: 실제 모듈 크기: Single 1개·Bar 7개·Ring 12개
- **pin**: 디지털 신호 핀 P8·P12·P13·P16 중 하나

## 반환값

반환값 없이 선택한 픽셀을 모두 끕니다.

## 연결과 동작

전원을 끄고 모듈의 신호 핀을 선택한 포트에 연결합니다. 전원·GND·신호 배선은 실제 모듈과 쉴드 설명서를 따릅니다.

12개 링 전체는 Ring처럼 실제 전체 크기를 선택해 끕니다. 색상을 바꾸며 저장된 밝기는 유지합니다.

시뮬레이터만으로 연결한 모듈의 전기적 동작을 확인할 수 없으므로 실제 보드에서 관찰합니다.

## 예제와 예상 결과

링은 빨간색으로 시작하고 A를 누르면 12개 모두 꺼집니다.

```blocks
// 연결한 모듈에서 아래 동작을 관찰합니다.
ezmaker.setNeoPixelBrightness(EZMakerNeoPixelType.Ring, EZMakerDigitalPin.P8, 32)
ezmaker.setNeoPixelColorAll(EZMakerNeoPixelType.Ring, EZMakerDigitalPin.P8, 0xff0000)
input.onButtonPressed(Button.A, function () {
    ezmaker.clearNeoPixel(EZMakerNeoPixelType.Ring, EZMakerDigitalPin.P8)
})
```

## 관련 자료

- [전체 블록 도움말](https://github.com/YoungJJlab/pxt-ezmakershield-microbit/blob/main/docs/reference/_locales/ko/README.md)
- [설치와 수업자료](https://github.com/YoungJJlab/pxt-ezmakershield-microbit/blob/main/README_ko.md)

```package
pxt-ezmakershield-microbit=github:YoungJJlab/pxt-ezmakershield-microbit
```
