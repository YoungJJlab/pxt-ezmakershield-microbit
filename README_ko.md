# EZMAKER 마이크로비트 쉴드 확장

micro:bit V1·V2와 EZMAKER 쉴드에 연결한 센서·네오픽셀을 사용하는 MakeCode 확장입니다. 입력, 측정, 조건 판단, 출력을 배우는 수업에 사용할 **공개 블록 API 27개**를 제공합니다. API 수와 지원 센서 모델 수는 다릅니다.

**HAICT Inc.의 브랜드는 EZMAKER**입니다. 아래 자료는 대한민국 초·중·고 학교 수업 등을 위해 구성했으며, 학습자 수준에 맞게 질문과 활동을 조정할 수 있습니다.

- [제품 상세 안내](https://ezmaker.co.kr/eng/page/?pid=product_view&it_id=1785899937)
- [제품 구매·현재 가격](https://mall.ezmaker.co.kr/user/product_detail?product_no=202608-1101)
- [English documentation](README.md)

## 확장 추가

1. [MakeCode for micro:bit](https://makecode.microbit.org/)에서 새 프로젝트를 만듭니다.
2. **확장** 메뉴에서 `https://github.com/YoungJJlab/pxt-ezmakershield-microbit`를 검색합니다.
3. 확장을 추가하고 **이지메이커**를 엽니다. 영어 설정에서는 **ezmaker**로 표시됩니다.

MakeCode 공식 갤러리 승인은 대기 중입니다. 저장소 URL로 확장을 추가하세요. 현재 작업 폴더의 수정 내용은 GitHub에 공개한 뒤 해당 URL에 반영됩니다. 즉시 로컬에서 시험하는 방법은 [로컬 개발 안내](LOCAL_DEVELOPMENT_ko.md)에 있습니다.

## 도구상자 구성

센서는 연결 방식에 따라 **아날로그**(6개), **디지털**(3개), **I2C**(2개)로 구분합니다. **네오픽셀**(10개)과 **데이터전송**(1개)은 별도 기능 분류로 유지합니다. DIY-A·DIY-B 읽기와 DIY-B 디지털 출력 5개는 **이지메이커** 바로 아래에 있습니다. 영어 명칭은 **Analog**, **Digital**, **I2C**입니다. 같은 센서의 블록은 같은 색을 사용하고 이름도 함께 표시합니다. 기존 블록 ID와 TypeScript API는 유지합니다. UART 센서 분류와 드라이버는 포함하지 않으며, 쉴드의 UART 커넥터 자체가 없어진다는 뜻은 아닙니다.

## 실제 제공 기능과 핀

| 기능 | API 수 | 현재 구현 | 선택 가능한 신호 핀 |
|---|---:|---|---|
| 기압센서 | 2 | BMP280 기압(hPa)·상대고도(m)·온도(°C) | I2C P19/P20; 채널 0=0x77, 채널 1=0x76 |
| 데이터전송 | 1 | 숫자형 센서 목록을 115200bps CSV 문자열 한 줄로 전송; 배열 항목 수 조절 | 현재 시리얼 경로(기본 USB) |
| 디지털 출력 | 1 | 출력 0/1 설정 | P8, P12, P13, P16 |
| DIY 센서 | 4 | DIY-A 원시값·전압, DIY-B 아날로그·디지털 입력 | 아날로그: P0, P1, P2 / 디지털: P8, P12, P13, P16 |
| 기본 센서 | 6 | MQ2 명목 계산값, 밝기·소리 원시값과 백분율, 전압 모듈 환산 | P0, P1, P2 |
| 온도 및 습도 | 3 | MAX31850, DS18B20, DHT11 통신·측정 | P8, P12, P13, P16 |
| 네오픽셀 | 10 | 전체·개별 색상, 밝기, 끄기, 팔레트, 무지개, 이동·회전, 막대그래프 | P8, P12, P13, P16 |

MAX31850과 DS18B20은 Dallas 1-Wire를 사용합니다. DHT11은 이와 다른 단일 신호선 통신을 사용합니다. 네오픽셀은 **Single 1개, Bar 7개, Ring 12개** 중 실제 모듈과 일치하는 종류를 선택합니다.

P0·P1·P2는 이 확장이 아날로그 입력으로 제공하는 핀이며 마이크로비트 핀 자체가 아날로그 전용이라는 뜻은 아닙니다. 쉴드의 I2C 연결(P19=SCL, P20=SDA)은 BMP280 드라이버에서 사용합니다. 다른 커넥터 배선은 확장 드라이버 지원과 구분해야 합니다. 현재 확장에는 SCD40·ICM-20948·INA219·LCD·PMS7003·HX711·서보 전용 드라이버가 없습니다. 이러한 모듈은 별도의 호환 소프트웨어와 배선이 필요합니다.

모듈 설명서에 따라 신호·전원·GND를 연결하고 실제 출력 신호가 연결된 핀을 코드에서 선택하세요. 모든 모듈이 커넥터의 모든 접점을 사용하는 것은 아닙니다. 전압 블록의 0~16.5 V는 **전압 모듈을 통한 명목 환산 범위**이며 마이크로비트 핀의 직접 입력 허용 범위가 아닙니다. 밝기·소리 백분율은 ADC 비율이며 조도(lux)·소음(dB) 측정값이 아닙니다. MQ2 계산에는 고정 계수가 사용되며 실제 가스 센서 교정은 수행하지 않습니다.

## 수업용 예제

각 예제는 별도 프로젝트에 사용합니다. 확장을 추가하고 전원을 끈 상태에서 지정한 모듈을 연결한 뒤 모듈의 전원·GND 설명을 따르세요. 예제는 편집 가능한 TypeScript이며 블록으로도 볼 수 있습니다.

### 1. 외부 밝기 센서 관찰

밝기 모듈의 아날로그 신호를 **P0**에 연결합니다. 가리거나 빛을 비추면서 값을 비교합니다. 숫자가 커질수록 LED 막대가 커지며, 밝아질 때 수치가 커지는지 작아지는지는 모듈에 따라 관찰합니다.

```blocks
basic.forever(function () {
    // 내장 센서가 아닌 외부 밝기 센서의 값을 읽습니다.
    let light = ezmaker.readLightRaw(EZMakerAnalogPin.P0)
    serial.writeValue("light_raw", light)
    // ADC 범위 0~1023을 막대그래프의 고정 눈금으로 사용합니다.
    led.plotBarGraph(light, 1023)
    basic.pause(500)
})
```

예상 결과: 값은 0~1023 범위에 있고 빛의 변화에 반응합니다. 기록표·질문·문제 해결은 [밝기 센서 수업](docs/lessons/light_ko.md)에 있습니다.

### 2. 온도 측정과 센서 분리 처리

**DS18B20을 P13**에 연결하고 A 버튼으로 측정합니다. 오류값과 정상값을 구분하며 영하 온도를 오류로 처리하지 않는 조건문을 배웁니다.

```blocks
input.onButtonPressed(Button.A, function () {
    let temperature = ezmaker.readDS18B20(EZMakerDigitalPin.P13)
    // 정해진 오류값만 검사합니다. 영하의 정상 온도도 허용합니다.
    if (temperature === -999 || temperature === -273) {
        serial.writeValue("sensor_error", temperature)
        basic.showString("ERR")
    } else {
        serial.writeValue("temperature_C", temperature)
        basic.showNumber(temperature)
    }
})
```

예상 결과: 센서가 연결되면 섭씨 온도를 표시합니다. 센서 통신 실패는 `-999`, 지원하지 않는 포트 인자는 `-273`을 반환합니다. 측정값은 1초 동안 캐시합니다. 분리·회복·반복 측정 활동은 [온도 센서 수업](docs/lessons/temperature_ko.md)을 따릅니다.

### 3. LED 12개 링 제어

링의 데이터 입력을 **P8**에 연결합니다. A는 LED 12개를 빨간색으로 켜고 B는 끕니다. 색상과 밝기의 차이를 관찰합니다.

```blocks
// 실제 모듈과 같은 12개 링을 선택하고 낮은 밝기로 시작합니다.
ezmaker.setNeoPixelBrightness(EZMakerNeoPixelType.Ring, EZMakerDigitalPin.P8, 32)
input.onButtonPressed(Button.A, function () {
    // 0xRRGGBB 형식은 빨강·초록·파랑 채널을 나타냅니다.
    ezmaker.setNeoPixelColorAll(EZMakerNeoPixelType.Ring, EZMakerDigitalPin.P8, 0xff0000)
})
input.onButtonPressed(Button.B, function () {
    ezmaker.clearNeoPixel(EZMakerNeoPixelType.Ring, EZMakerDigitalPin.P8)
})
```

예상 결과: A를 누르면 링 전체가 빨간색으로 켜지고 B를 누르면 모두 꺼집니다. 색상 순환과 개별 픽셀 활동은 [네오픽셀 수업](docs/lessons/neopixel_ko.md)에 있습니다.

## 교육자료와 튜토리얼

각 수업에는 준비물·배선·주석 코드·예상 관찰·기록 활동·확장 질문이 있습니다. 교사는 학습자 수준에 따라 시간과 질문을 조정할 수 있습니다.

| 수업 | 학습 내용 | 한국어 | English |
|---|---|---|---|
| 외부 밝기 센서 | 반복 측정, ADC 눈금, 관찰 | [수업 자료](docs/lessons/light_ko.md) | [Lesson](docs/lessons/light.md) |
| DS18B20 온도 | 측정, 조건문, 누락 데이터 | [수업 자료](docs/lessons/temperature_ko.md) | [Lesson](docs/lessons/temperature.md) |
| 네오픽셀 링 | 이벤트, 순서, RGB, 픽셀 번호 | [수업 자료](docs/lessons/neopixel_ko.md) | [Lesson](docs/lessons/neopixel.md) |

## 언어·시뮬레이터·검증

영어를 기본 언어로 사용하며 한국어 설정에서는 블록과 상위·하위 카테고리 이름이 한국어로 표시됩니다. `ezmaker.readDS18B20` 같은 API 이름은 언어에 관계없이 같습니다.

블록을 오른쪽 클릭해 **도움말**을 열면 매개변수·반환값·연결 설명·예제를 확인할 수 있습니다. 한국어 설정에서는 한국어 도움말과 툴팁을 우선 사용하며 번역이 없는 언어는 영어를 사용합니다. 전체 목록은 [한국어 블록 도움말](docs/reference/_locales/ko/README.md)과 [English block references](docs/reference/README.md)에 있습니다.

시뮬레이터는 연결한 외부 모듈을 재현하지 않습니다. MAX31850과 DS18B20은 각각 예시 온도 25.5 °C와 32.6 °C, DHT11은 센서 부재 오류를 반환합니다. 시뮬레이터의 밝기 입력이나 LED 출력만으로 외부 센서·네오픽셀의 실물 동작을 판단할 수 없습니다. V1 또는 V2 보드에 내려받아 확인하세요.

[TESTING_ko.md](TESTING_ko.md)에 실물 시험 목록이 있고, [TESTING.md](TESTING.md)에 전체 27개 API의 검사·예상 결과·합격 기준이 있습니다. 일부 실물 모듈 시험은 아직 대기 중이며 확인된 항목과 미검증 항목을 구분해 기록합니다. 새 학습자료와 예제는 저장소에 공개한 뒤 승인 회신에서 링크로 안내합니다.

## 라이선스

MIT. [LICENSE](LICENSE)와 소스에 유지된 외부 코드의 저작권 고지를 참조하세요.

## 다음 버전 적용 시 호환성 안내

기존 판매 제품의 회로를 유지하기 위해 초음파 센서를 이 확장의 지원 대상에서 제외했습니다. 현행 CS100A 1핀 회로로 V1·V2의 신뢰할 수 있는 동작을 확보하지 못해 초음파 블록과 `ezmaker.ultrasonicDistance` API를 제거했습니다. 기존 프로젝트에서 해당 블록·함수 호출을 사용했다면 확장 업데이트 전에 삭제해야 합니다. 이번 변경으로 나머지 지원 기능을 사용하기 위해 저항을 교체할 필요는 없습니다.

## 센서 데이터 전송

**이지메이커 → 데이터전송**의 데이터 배열에서 + / −로 센서 값 칸을 늘리거나 줄입니다. `ezmaker.sendSensorData([10, 20.5, -3])`은 115200bps에서 `10,20.5,-3\r\n` 문자열을 보냅니다. null이 아닌 목록으로 처음 호출할 때만 115200bps를 설정하고 이후 시리얼 설정은 유지합니다. 숫자 자리에 센서 블록을 넣으면 실제 측정값을 전송합니다. [전송 형식과 시험 절차](DATA_TRANSMISSION_TESTING.md)를 참고하세요.

BMP280 기압센서에서는 채널 0=0x77·채널 1=0x76과 기압·상대고도·온도를 선택합니다. 영점 전 기준기압은 기본 1013.25hPa입니다. A 영점·B 복원을 포함한 정상 동작은 V1·V2 사용자 확인을 마쳤습니다. 채널별·오류 복구 세부 기록은 [BMP280 시험 절차](BMP280_TESTING.md)에 구분합니다.

시작하면에 **BMP280 상대고도 버튼 사용** 블록을 넣으면 A는 현재 위치 영점, B는 읽기 블록의 원래 기준기압 복원으로 동작합니다. 별도의 A/B 이벤트 블록 없이 사용할 수 있으며 [A/B 설정 도움말](docs/reference/_locales/ko/enable-bmp280-altitude-buttons.md)을 따릅니다.

기존 TypeScript 프로그램은 승인 검토 요청에 맞춰 통일한 enum 이름으로 변경해야 합니다. 확장 업데이트 후 이전 블록의 드롭다운이 유효하지 않으면 현재 선택지를 다시 선택합니다.

| 이전 enum | 현재 enum |
|---|---|
| EZAnalogPin | EZMakerAnalogPin |
| EZDigitalPin | EZMakerDigitalPin |
| MQ2GasType | EZMakerMQ2GasType |
| DHT11DataType | EZMakerDHT11DataType |
| NeoPixelType | EZMakerNeoPixelType |
