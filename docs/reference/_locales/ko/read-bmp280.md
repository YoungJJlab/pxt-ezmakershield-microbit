# readBMP280

BMP280의 기압·상대고도·온도를 읽습니다. 잘못된 설정이나 센서 오류는 -9999를 반환합니다.

```sig
ezmaker.readBMP280(EZMakerBMP280Channel.Channel0, EZMakerBMP280DataType.Pressure)
```

## 매개변수

- **channel**: 모듈 채널 선택: 채널 0은 0x77, 채널 1은 0x76
- **dataType**: 측정값 선택: 기압 hPa·상대고도 m·온도 °C
- **seaLevelPressure**: A 영점 설정 전 또는 B 복원 후 사용하는 기준기압 hPa; 기본 1013.25

## 연결과 동작

**이지메이커 → I2C**에서 사용합니다. 쉴드의 I2C 커넥터에 P19=SCL, P20=SDA, 3.3V, GND를 맞춰 연결합니다. 모듈의 실제 채널 선택과 블록의 채널을 일치시킵니다. 두 채널은 같은 I2C 버스의 주소 선택이며 별도 신호 핀을 의미하지 않습니다. 모듈 두 개를 연결할 때는 서로 다른 주소로 설정합니다. 배선이나 채널 선택을 바꾸기 전에는 전원을 끕니다.

기압(hPa)·상대고도(m)·온도(°C) 중 선택합니다. 결과는 소수 둘째 자리로 반올림하며 표시 자릿수가 정확도를 의미하지는 않습니다. 호출할 때마다 선택한 센서의 보정값을 읽고 새 강제 측정(온도 ×1, 기압 ×4, 필터 끔)을 수행합니다. 변환을 최소 15ms 기다리고 상태 대기는 제한 시간 내에 종료합니다. 세 값을 연속으로 읽으면 각각 별도 측정입니다. 다른 드라이버로 같은 센서를 동시에 제어하지 않습니다.

상대고도는 `44330 × (1 − (기압 / 기준기압)^0.1903)`으로 추정합니다. 영점 설정 전에는 기본 기준기압 1013.25hPa를 사용하므로 시작값이 자동으로 0m가 되지는 않습니다. 추가 입력에서 기준기압을 바꿀 수 있습니다. **시작하면**에 [A/B 설정 블록](enable-bmp280-altitude-buttons.md)을 넣으면 A로 현재 기압을 0m 기준으로 잡고 B로 원래 기준기압을 복원합니다. 기존 TypeScript 매개변수와 enum 이름은 호환성을 위해 유지합니다. 날씨에 따라 추정값이 달라집니다. 기상 서비스의 해면기압과 현지 절대기압은 서로 다릅니다. 온도는 센서 자체 온도로 회로 발열의 영향을 받을 수 있습니다.

**-9999**는 잘못된 채널·측정 종류·해면기압, 센서 미연결·칩 ID 불일치(BMP280은 0x58), I2C 쓰기 실패, 보정값·원시값 이상, 상태 대기 시간 초과 또는 BMP280 범위(300~1100hPa, −40~85°C) 밖의 측정값을 의미합니다. 측정값으로 사용하지 않습니다. 시뮬레이터의 미연결 I2C 센서도 같은 오류를 반환하며 가상의 날씨 값을 만들지 않습니다. BMP180·BME280은 이 블록의 지원 대상이 아닙니다.

## 예제와 예상 결과

A를 누르면 채널 0의 기압을 읽습니다. 연결된 BMP280은 현지 기압을 반환하고, 센서가 없으면 ERR을 표시합니다. 정확도를 비교하려면 기상 앱의 해면기압 대신 같은 위치의 기준 기압계를 사용합니다.

```blocks
input.onButtonPressed(Button.A, function () {
    let pressure = ezmaker.readBMP280(EZMakerBMP280Channel.Channel0, EZMakerBMP280DataType.Pressure)
    if (pressure == -9999) {
        basic.showString("ERR")
    } else {
        basic.showNumber(pressure)
    }
})
```

## 관련 문서

- [BMP280 실물 시험](https://github.com/YoungJJlab/pxt-ezmakershield-microbit/blob/main/BMP280_TESTING.md)
- [Bosch BMP280 데이터시트](https://www.bosch-sensortec.com/media/boschsensortec/downloads/datasheets/bst-bmp280-ds001.pdf)
- [전체 블록 도움말](README.md)

```package
pxt-ezmakershield-microbit=github:YoungJJlab/pxt-ezmakershield-microbit
```
