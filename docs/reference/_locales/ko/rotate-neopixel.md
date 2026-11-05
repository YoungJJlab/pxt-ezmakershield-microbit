# rotateNeoPixel

지정한 방향·칸 수로 색상을 회전하고 끝에서 이어 붙여 전송합니다.

```sig
ezmaker.rotateNeoPixel(EZMakerNeoPixelType.Ring, EZMakerDigitalPin.P8, 1)
```

## 매개변수

- **npType**: 실제 모듈 크기: Single 1개·Bar 7개·Ring 12개
- **pin**: 디지털 신호 핀 P8·P12·P13·P16 중 하나
- **offset**: 이동 칸 수: 양수는 큰 번호 방향, 음수는 작은 번호 방향; 기본 1

## 반환값

반환값 없이 기존 색상을 변경·전송합니다.

## 연결과 동작

전원을 끄고 모듈의 신호 핀을 선택한 포트에 연결합니다. 전원·GND·신호 배선은 실제 모듈과 쉴드 설명서를 따릅니다.

끝을 넘은 색상이 반대쪽으로 이어집니다. 모듈 픽셀 수만큼 1칸 회전하면 원래 배열로 돌아옵니다.

시뮬레이터만으로 연결한 모듈의 전기적 동작을 확인할 수 없으므로 실제 보드에서 관찰합니다.

## 예제와 예상 결과

A마다 빨간색이 다음 번호로 이동하며 12번 누르면 0번으로 돌아옵니다.

```blocks
// 연결한 모듈에서 아래 동작을 관찰합니다.
ezmaker.setNeoPixelBrightness(EZMakerNeoPixelType.Ring, EZMakerDigitalPin.P8, 32)
ezmaker.clearNeoPixel(EZMakerNeoPixelType.Ring, EZMakerDigitalPin.P8)
ezmaker.setNeoPixelPixelColor(EZMakerNeoPixelType.Ring, EZMakerDigitalPin.P8, 0, 0xff0000)
input.onButtonPressed(Button.A, function () {
    ezmaker.rotateNeoPixel(EZMakerNeoPixelType.Ring, EZMakerDigitalPin.P8, 1)
})
```

## 관련 자료

- [전체 블록 도움말](https://github.com/YoungJJlab/pxt-ezmakershield-microbit/blob/main/docs/reference/_locales/ko/README.md)
- [설치와 수업자료](https://github.com/YoungJJlab/pxt-ezmakershield-microbit/blob/main/README_ko.md)

```package
pxt-ezmakershield-microbit=github:YoungJJlab/pxt-ezmakershield-microbit
```
