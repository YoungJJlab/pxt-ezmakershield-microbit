# 블록별 도움말

27개 블록의 연결·매개변수·반환값·예제를 설명합니다. MakeCode 언어를 한국어로 설정하면 블록의 도움말에서 한국어 페이지를 우선 읽습니다.

| API | 설명 |
|---|---|
| [enableBMP280AltitudeButtons](enable-bmp280-altitude-buttons.md) | 버튼 이벤트 코드 없이 A 영점·B 기준 복원을 설정합니다. |
| [readBMP280](read-bmp280.md) | BMP280 기압·상대고도·온도; 채널 0(0x77)·1(0x76) 선택. |
| [sendSensorData](send-sensor-data.md) | 숫자형 센서 값을 쉼표로 구분한 문자열 한 줄로 전송합니다. 최초 사용 시 115200bps를 설정하고, 각 줄은 공백 추가 없이 CRLF로 끝냅니다. |
| [writeDigitalPin](write-digital-pin.md) | DIY-B 디지털 출력을 0 또는 1로 설정합니다. 지원하지 않는 핀은 무시합니다. |
| [readDIYARaw](read-diy-a-raw.md) | DIY-A 모듈의 ADC 원시값 0~1023을 읽습니다. |
| [readDIYBAnalog](read-diy-b-analog.md) | DIY-B 아날로그 모듈의 ADC 원시값 0~1023을 읽습니다. |
| [readLightRaw](read-light-raw.md) | 외부 밝기 모듈의 ADC 원시값 0~1023을 읽습니다. |
| [readSoundRaw](read-sound-raw.md) | 외부 소리 모듈의 ADC 원시값 0~1023을 읽습니다. |
| [readDIYAVoltage](read-diy-a-voltage.md) | DIY-A ADC 값을 명목 전압 0~3.3 V로 환산하고 소수점 둘째 자리로 반올림합니다. |
| [readDIYBDigital](read-diy-b-digital.md) | DIY-B 디지털 입력이 High인지 읽습니다. 지원하지 않는 핀은 false를 반환합니다. |
| [readLightPercentage](read-light-percentage.md) | 외부 밝기 ADC 값을 0~100으로 환산합니다. 교정된 물리 단위가 아닙니다. |
| [readSoundPercentage](read-sound-percentage.md) | 외부 소리 ADC 값을 0~100으로 환산합니다. 교정된 물리 단위가 아닙니다. |
| [readVoltage](read-voltage.md) | 전압 모듈 ADC 값을 명목 전압 0~16.5 V로 환산하고 소수점 둘째 자리로 반올림합니다. |
| [readMQ2](read-mq2.md) | 고정 계수로 MQ2의 명목 ppm 추정값을 계산합니다. 이 블록은 센서를 교정하지 않습니다. |
| [readMax31850](read-max31850.md) | MAX31850 온도를 소수점 첫째 자리의 °C로 읽습니다. 잘못된 포트·센서 오류는 -999입니다. |
| [readDS18B20](read-ds18b20.md) | DS18B20 온도를 °C로 읽고 1초 캐시합니다. 잘못된 포트는 -273, 센서 실패는 -999입니다. |
| [readDHT11](read-dht11.md) | DHT11 온도(°C)·습도(%)를 읽고 1초 캐시합니다. 오류: -1 포트, -4 무응답, -5·-6 시간 초과, -7 빈 데이터, -8 체크섬, -9 측정 중. |
| [setNeoPixelColorAll](set-neopixel-color-all.md) | 선택한 모듈의 모든 픽셀을 같은 RGB 색상으로 설정하고 즉시 전송합니다. |
| [setNeoPixelPixelColor](set-neopixel-pixel-color.md) | 0부터 시작하는 픽셀 하나의 RGB 색상을 설정하고 전송합니다. 범위 밖 픽셀 번호는 무시합니다. |
| [setNeoPixelBrightness](set-neopixel-brightness.md) | 이후 색상 쓰기에 적용할 밝기(0~255)를 정합니다. 기존 버퍼는 재계산하지 않으므로 색상을 다시 써야 적용됩니다. |
| [clearNeoPixel](clear-neopixel.md) | 선택한 모듈의 모든 픽셀을 검정으로 설정·전송합니다. 밝기 설정은 유지합니다. |
| [setNeoPixelBar](set-neopixel-bar.md) | 7개 픽셀의 색상을 인자 순서대로 설정하고 즉시 전송합니다. |
| [setNeoPixelRing](set-neopixel-ring.md) | 12개 픽셀의 색상을 인자 순서대로 설정하고 즉시 전송합니다. |
| [showNeoPixelRainbow](show-neopixel-rainbow.md) | 정적인 색상 그라데이션을 채우고 전송합니다. 시간에 따라 자동으로 움직이지 않습니다. |
| [shiftNeoPixel](shift-neopixel.md) | 지정한 방향·칸 수로 색상을 이동하고 빈 자리를 검정으로 채워 전송합니다. |
| [rotateNeoPixel](rotate-neopixel.md) | 지정한 방향·칸 수로 색상을 회전하고 끝에서 이어 붙여 전송합니다. |
| [showNeoPixelBarGraph](show-neopixel-bar-graph.md) | 값의 크기를 양수 최댓값에 대한 막대로 표시합니다. 0·최댓값 0 이하는 표시 픽셀이 남으므로 끄려면 명시적으로 지웁니다. |

[확장 설치와 수업자료](../../../../README_ko.md)
