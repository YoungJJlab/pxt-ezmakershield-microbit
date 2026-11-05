# showNeoPixelBarGraph

값의 크기를 양수 최댓값에 대한 막대로 표시합니다. 0·최댓값 0 이하는 표시 픽셀이 남으므로 끄려면 명시적으로 지웁니다.

```sig
ezmaker.showNeoPixelBarGraph(EZMakerNeoPixelType.Ring, EZMakerDigitalPin.P8, 128, 255)
```

## 매개변수

- **npType**: 실제 모듈 크기: Single 1개·Bar 7개·Ring 12개
- **pin**: 디지털 신호 핀 P8·P12·P13·P16 중 하나
- **value**: 표시할 값; 라이브러리는 절댓값을 사용
- **high**: 고정 눈금의 양수 최댓값; 기본 255

## 반환값

반환값 없이 그래프 색상을 덮어쓰고 전송합니다.

## 연결과 동작

전원을 끄고 모듈의 신호 핀을 선택한 포트에 연결합니다. 전원·GND·신호 배선은 실제 모듈과 쉴드 설명서를 따릅니다.

고정 버전 라이브러리에서 high가 0 이하면 자동 눈금 대신 첫 픽셀을 노란색으로 표시합니다. high가 양수일 때 floor(abs(value) × 픽셀 수 / high)로 범위를 정합니다. 범위 0은 첫 픽셀에 어두운 표시가 남고, 그 외에는 모듈 길이 안에서 0번부터 범위 번호까지 색칠합니다. 완전히 끄려면 clearNeoPixel을 사용합니다.

시뮬레이터만으로 연결한 모듈의 전기적 동작을 확인할 수 없으므로 실제 보드에서 관찰합니다.

## 예제와 예상 결과

A는 일부가 채워진 그래프, B는 모든 픽셀 끄기입니다. 같은 양수 최댓값으로 여러 값을 비교합니다.

```blocks
// 연결한 모듈에서 아래 동작을 관찰합니다.
ezmaker.setNeoPixelBrightness(EZMakerNeoPixelType.Ring, EZMakerDigitalPin.P8, 32)
input.onButtonPressed(Button.A, function () {
    ezmaker.showNeoPixelBarGraph(EZMakerNeoPixelType.Ring, EZMakerDigitalPin.P8, 128, 255)
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
