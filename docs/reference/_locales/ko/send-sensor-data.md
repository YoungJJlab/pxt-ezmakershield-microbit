# sendSensorData

숫자형 센서 값을 쉼표로 구분한 문자열 한 줄로 전송합니다. 최초 사용 시 115200bps를 설정하고, 각 줄은 공백 추가 없이 CRLF로 끝냅니다.

```sig
ezmaker.sendSensorData([10, 20.5, -3])
```

## 매개변수

- **values**: 전송 순서대로 넣은 센서 값 목록; 배열 항목을 추가하거나 제거해 센서 개수를 변경

## 반환값

반환값 없이 현재 시리얼 경로로 문자열 한 줄을 전송합니다. 기본 경로는 USB 시리얼입니다.

## 사용 방법과 동작

**이지메이커 → 데이터전송**에서 블록을 꺼냅니다. 데이터 입력의 숫자 배열에서 **+ / −**로 센서 값 칸을 추가하거나 삭제합니다. 각 칸에 숫자형 센서 블록이나 숫자를 넣습니다. API에 고정된 센서 개수 제한은 없으며 보드의 메모리에 따라 목록과 문자열 길이가 제한됩니다.

null이 아닌 목록으로 처음 호출할 때만 115200bps를 설정합니다. 이후에는 속도를 다시 설정하지 않고 값을 순서대로 `,`로 구분하여 `\r\n`으로 끝냅니다. 이름·공백·마지막 쉼표·숫자 바이너리 데이터는 붙이지 않습니다. `[10, 20.5, -3]`의 실제 전송 문자열은 `10,20.5,-3\r\n`입니다. 입력은 숫자 목록이고 전송 결과는 문자열입니다. MakeCode의 숫자→문자열 변환을 사용하며 별도로 반올림하지 않습니다. `-999` 같은 센서 오류값도 전달받은 그대로 보냅니다.

최초 사용 이후 다른 코드에서 속도나 시리얼 경로를 바꾸면 그 설정을 유지합니다. 연결을 변경할 때는 기본 시리얼 설정 블록으로 필요한 속도를 직접 지정하고 수신 측 속도도 맞춥니다. 보드를 다시 시작하면 최초 설정 상태도 초기화됩니다.

빈 배열은 빈 줄 하나를 보냅니다. 텍스트 코드에서 null을 전달하면 전송하지 않습니다. 기존 시리얼 경로는 유지하며 외부 UART 핀을 지정하지 않습니다. 기본 경로에서는 micro:bit USB COM 포트와 **115200, 8비트, 패리티 없음, 정지 1비트, 흐름 제어 없음**을 사용합니다. Bluetooth UART 전송은 아닙니다. 반복 전송에는 100ms 등 적절한 간격을 두고, 수신 측이 데이터 줄만 기대한다면 다른 시리얼 메시지를 섞지 않습니다.

PuTTY 등 별도 터미널에서 수신할 때는 다운로드를 마친 뒤 MakeCode·Python 웹 편집기의 WebUSB 연결을 끊고 터미널을 엽니다. 그래도 문자가 누락되면 연결된 편집기 탭을 모두 닫고 같은 프로그램으로 다시 확인합니다. 브라우저의 WebUSB 연결은 USB COM 포트가 열린 상태에서도 유지될 수 있으므로, COM 포트가 열렸다는 것만으로 단독 수신이라고 판단하지 않습니다. 아래 시험 안내의 문제 해결 순서를 참고하세요.

## 예제와 예상 결과

A는 3개, B는 5개 값을 한 줄씩 보냅니다. 센서 없이 전송 형식을 확인할 수 있습니다. 실제 센서 데이터를 보내려면 숫자 자리에 숫자형 센서 블록을 넣습니다.

```blocks
input.onButtonPressed(Button.A, function () {
    ezmaker.sendSensorData([10, 20.5, -3])
})
input.onButtonPressed(Button.B, function () {
    ezmaker.sendSensorData([10, 20.5, -3, 40, 50])
})
```

## 관련 자료

- [전체 블록 도움말](https://github.com/YoungJJlab/pxt-ezmakershield-microbit/blob/main/docs/reference/_locales/ko/README.md)
- [전송 형식과 실물 시험](https://github.com/YoungJJlab/pxt-ezmakershield-microbit/blob/main/DATA_TRANSMISSION_TESTING.md)

```package
pxt-ezmakershield-microbit=github:YoungJJlab/pxt-ezmakershield-microbit
```
