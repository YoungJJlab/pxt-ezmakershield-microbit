# showNeoPixelRainbow

정적인 색상 그라데이션을 채우고 전송합니다. 시간에 따라 자동으로 움직이지 않습니다.

```sig
ezmaker.showNeoPixelRainbow(EZMakerNeoPixelType.Ring, EZMakerDigitalPin.P8, 1, 360)
```

## 매개변수

- **npType**: 실제 모듈 크기: Single 1개·Bar 7개·Ring 12개
- **pin**: 디지털 신호 핀 P8·P12·P13·P16 중 하나
- **startHue**: 시작 색상각 1~360; 기본 1
- **endHue**: 끝 색상각 1~360; 기본 360

## 반환값

반환값 없이 그라데이션을 채우고 전송합니다.

## 연결과 동작

전원을 끄고 모듈의 신호 핀을 선택한 포트에 연결합니다. 전원·GND·신호 배선은 실제 모듈과 쉴드 설명서를 따릅니다.

움직임에는 회전 또는 반복 갱신을 사용합니다. 단일 픽셀은 추출한 색상 하나만 표시합니다.

시뮬레이터만으로 연결한 모듈의 전기적 동작을 확인할 수 없으므로 실제 보드에서 관찰합니다.

## 예제와 예상 결과

A는 링에 정적인 무지개를 표시하고 B는 끕니다.

```blocks
// 연결한 모듈에서 아래 동작을 관찰합니다.
ezmaker.setNeoPixelBrightness(EZMakerNeoPixelType.Ring, EZMakerDigitalPin.P8, 32)
input.onButtonPressed(Button.A, function () {
    ezmaker.showNeoPixelRainbow(EZMakerNeoPixelType.Ring, EZMakerDigitalPin.P8, 1, 360)
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
