# 기압센서 상대고도 버튼

A 버튼으로 기압센서 상대고도를 0m로 설정하고 B 버튼으로 읽기 블록의 기준기압을 복원합니다. A/B 버튼은 이 기능에 사용합니다.

```sig
ezmaker.enableBMP280AltitudeButtons(EZMakerBMP280Channel.Channel0)
```

## 매개변수

- **channel**: A/B로 제어할 채널; 다시 호출하면 저장된 영점은 유지하고 제어할 채널을 바꿈

## 사용 방법과 동작

**시작하면**에 이 설정 블록을 넣고 기압센서 읽기 블록에서 **상대고도(m)**를 선택합니다. 사용자가 A/B 버튼 이벤트 코드를 작성할 필요는 없습니다. 읽기 블록만 사용하면 버튼을 연결하지 않으며, 이 설정 블록을 사용했을 때 A/B를 연결합니다.

- **A**: 선택한 모듈의 현재 기압을 영점 기준으로 저장합니다. 이후 같은 위치는 약 0m, 위로 올리면 양수, 아래로 내리면 음수입니다. 센서 잡음과 기압 변화로 정확히 0에 고정되지는 않습니다.
- **B**: 해당 채널의 영점을 해제하고 읽기 블록에 입력한 기준기압(기본 1013.25hPa)으로 복원합니다. B는 다시 0m로 만드는 것이 아니라 약 28m 등 원래의 기준값으로 돌아가는 동작입니다.
- 기압·온도 값에는 영향을 주지 않습니다. A로 설정한 영점이 있으면 읽기 블록의 추가 기준기압 입력보다 우선합니다.
- A/B는 한 번에 한 채널을 제어합니다. 설정을 반복해도 이벤트를 중복 등록하지 않습니다. 채널을 바꾸면 버튼의 제어 대상이 바뀌며, 채널 0과 1의 저장된 영점은 서로 독립적으로 유지합니다.
- A를 눌렀을 때 센서가 없거나 실패하면 상대고도는 **-9999**입니다. 센서를 연결한 뒤 A를 다시 누르거나, B로 영점 오류를 해제하고 일반 측정으로 복원합니다. 측정 도중 나중에 B를 누르거나 채널을 바꾸면 이전 A의 결과는 적용하지 않습니다.
- 영점은 RAM에만 저장하며 프로그램을 재시작하면 초기화됩니다. 플래시에 기록하지 않습니다.

같은 프로그램에 다른 A/B 버튼 이벤트 블록을 함께 넣지 않습니다. MakeCode는 같은 버튼 이벤트의 처리기를 교체하므로 A/B를 이 기능에 사용합니다. A+B는 남겨 두며 이 설정 블록은 시리얼 출력이나 화면 표시를 하지 않습니다.

## 예제와 예상 결과

A를 누르면 다음 상대고도들이 약 0m가 됩니다. 센서를 위아래로 옮겨 변화를 관찰합니다. B는 기본 기준기압의 값으로 복원합니다. 센서가 없으면 -9999가 예상 결과입니다.

```blocks
ezmaker.enableBMP280AltitudeButtons(EZMakerBMP280Channel.Channel0)
basic.forever(function () {
    basic.showNumber(ezmaker.readBMP280(EZMakerBMP280Channel.Channel0, EZMakerBMP280DataType.Altitude))
    basic.pause(500)
})
```

## 관련 문서

- [BMP280 측정](read-bmp280.md)
- [실물 시험](https://github.com/YoungJJlab/pxt-ezmakershield-microbit/blob/main/BMP280_TESTING.md)

```package
pxt-ezmakershield-microbit=github:YoungJJlab/pxt-ezmakershield-microbit
```
