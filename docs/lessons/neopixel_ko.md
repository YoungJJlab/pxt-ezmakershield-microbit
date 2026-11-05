# 수업: 이벤트·색상·네오픽셀 링

[English](neopixel.md) · [확장 설치와 준비](../../README_ko.md) · [밝기 센서로 돌아가기](light_ko.md)

## 목표와 준비

약 30~40분 활동입니다. 버튼 이벤트에 따른 색상 순서를 예측하고, 다음 동작을 변수에 기억하며, RGB 색상과 밝기를 구분합니다.

micro:bit V1 또는 V2, EZMAKER 쉴드, 호환 **LED 12개 네오픽셀 링**, 연결 케이블, MakeCode를 사용할 컴퓨터를 준비합니다. 설치 안내에 따라 확장을 추가합니다.

전원을 끄고 링의 **데이터 입력을 P8**에 연결합니다. 전원과 공통 GND는 모듈 설명서를 따릅니다. 화살표·데이터 입력 방향을 확인합니다. 이 프로그램은 LED 12개에 해당하는 `Ring`을 일관되게 사용합니다. 7개 막대나 단일 LED는 실제 모듈에 맞는 종류로 바꿔야 합니다.

## 프로그램

새 프로젝트에서 이 예제만 사용합니다. 밝기는 0~255 중 32입니다. A는 빨강·초록·파랑을 순환하고 B는 모두 끈 뒤 다음 색을 빨강으로 초기화합니다.

```blocks
let nextColor = 0
// 밝기를 한 번 설정하고 모든 색상에서 같은 밝기를 사용합니다.
ezmaker.setNeoPixelBrightness(EZMakerNeoPixelType.Ring, EZMakerDigitalPin.P8, 32)
input.onButtonPressed(Button.A, function () {
    // 0xRRGGBB의 각 채널은 빨강·초록·파랑을 나타냅니다.
    if (nextColor === 0) {
        ezmaker.setNeoPixelColorAll(EZMakerNeoPixelType.Ring, EZMakerDigitalPin.P8, 0xff0000)
    } else if (nextColor === 1) {
        ezmaker.setNeoPixelColorAll(EZMakerNeoPixelType.Ring, EZMakerDigitalPin.P8, 0x00ff00)
    } else {
        ezmaker.setNeoPixelColorAll(EZMakerNeoPixelType.Ring, EZMakerDigitalPin.P8, 0x0000ff)
    }
    // 파랑 다음에는 다시 빨강부터 시작합니다.
    nextColor = (nextColor + 1) % 3
})
input.onButtonPressed(Button.B, function () {
    ezmaker.clearNeoPixel(EZMakerNeoPixelType.Ring, EZMakerDigitalPin.P8)
    nextColor = 0
})
```

## 예측·관찰·기록

1. 내려받기 전에 A를 네 번 누르면 어떤 색이 나올지 예측합니다.
2. 내려받고 A를 네 번 누르며 LED 12개의 반응을 기록합니다.
3. B를 누르면 모두 꺼지고, 다음 A는 빨간색이어야 합니다.
4. 밝기를 32에서 8로 바꾸어 다시 내려받습니다. 같은 관찰 조건에서 비교합니다.

| 동작 | 예상 | 실제 관찰 | 예상과 같은가요? |
|---|---|---|---|
| A 첫 번째 | | | |
| A 두 번째 | | | |
| A 세 번째 | | | |
| A 네 번째 | | | |
| B를 누른 뒤 A | | | |

예상 결과: 링 전체가 빨강 → 초록 → 파랑 → 빨강으로 바뀝니다. B는 모든 픽셀을 끕니다. 밝기를 낮추면 빛의 출력이 줄지만 선택한 RGB 색상은 같습니다. 색이 다르면 눈에 보이는 밝기가 같지 않을 수 있습니다.

## 질문과 확장

- `nextColor`가 필요한 이유는 무엇인가요? 0·1·2의 뜻을 설명합니다.
- `nextColor + 1`이 3이 될 때 `% 3`은 어떤 결과를 만드나요?
- `Ring`을 유지한 채 모두 끄고 `setNeoPixelPixelColor`의 번호 0과 11을 시험합니다. 0~11이므로 첫 번째와 마지막 픽셀입니다. 링의 픽셀 하나를 제어하려고 종류를 `Single`로 바꾸지 않습니다.
- 교실 상황을 나타내는 세 가지 색 신호를 설계합니다. 코드를 쓰기 전에 색마다 뜻을 정합니다.

## 예상과 다를 때

P8·데이터 입력 방향·전원·공통 GND·`Ring` 선택을 확인합니다. 일부 픽셀만 바뀌면 실제 모듈이 LED 12개인지, 모든 블록이 같은 종류를 사용하는지 확인합니다. 시뮬레이터만으로 링 실물 동작을 판단할 수 없으므로 실제 보드와 링에서 관찰합니다.

밝기·길이 회귀 시험 절차는 [NEOPIXEL_TESTING.md](../../NEOPIXEL_TESTING.md), 자동 검사 범위는 [TESTING.md](../../TESTING.md)에 있습니다.
