# EZMAKER MakeCode 로컬 개발 환경

[English](LOCAL_DEVELOPMENT.md)

로컬 편집기는 현재 폴더의 소스를 읽으므로 GitHub 반영을 기다리지 않고 수정·시험할 수 있습니다. 제품·수업자료는 [README_ko.md](README_ko.md), 실물 시험 목록은 [TESTING_ko.md](TESTING_ko.md)를 따릅니다.

## 다른 PC에서 처음 설치

Node.js와 npm을 설치하고 터미널·VS Code를 다시 열어 `node`, `npm`을 PATH에서 사용할 수 있게 합니다. 검증한 Node.js 버전은 **24.22.0**입니다. 네이티브 검사와 HEX 빌드에는 Git 및 **Linux 컨테이너 엔진으로 실행 중인 Docker Desktop**도 필요합니다. 최초 확장 설치와 TypeScript·블록 검사에는 Docker가 필요하지 않습니다.

프로젝트 루트에서 순서대로 실행합니다.

```powershell
npm.cmd ci --cache .dev/npm-cache --no-audit --no-fund
npm.cmd run dev:setup
npm.cmd run check:blocks
npm.cmd run dev
```

`npm.cmd`가 아닌 `npm` 명령을 쓰는 환경에서는 같은 스크립트에 `npm`을 사용합니다. 실행 도구는 Windows에서는 junction, 다른 운영체제에서는 디렉터리 심볼릭 링크를 사용하며, 이 프로젝트의 전체 환경 검증은 Windows 기준입니다.

`npm ci`는 `package-lock.json`의 고정 버전으로 SDK를 설치합니다. `dev:setup`은 고정 SDK의 공식 `pxt install`로 다음 의존성을 설치한 뒤 로컬 프로젝트 연결을 준비합니다.

| 의존성 | 설치 기준 |
|---|---|
| pxt-microbit | npm 잠금 파일 8.1.19 |
| pxt-core | npm 잠금 파일 12.3.14 |
| core | 고정 micro:bit 타깃에 포함된 소스 |
| neopixel | 확장 의존성 v0.7.3 |
| ws2812b | neopixel 의존성 v0.1.1 |

최초 다운로드에는 인터넷이 필요합니다. 전역 `pxt` 설치나 공개 의존성을 받기 위한 GitHub 로그인은 필요하지 않습니다. 새 체크아웃 복원 또는 PXT 의존성 변경 후에는 `dev:setup`을 실행합니다. 기존 `main.ts`·`main.blocks` 프로그램을 덮어쓰지 않습니다. `npm ci`는 `node_modules`를 교체하므로 실행 중인 로컬 편집기는 먼저 종료합니다.

`npm ci`를 마친 Windows 환경에서는 **Setup Local MakeCode.cmd**, **Start Local MakeCode.cmd**를 순서대로 실행할 수도 있습니다. VS Code 작업에는 **MakeCode: Set up extension dependencies**와 기존 검사·빌드 작업이 있습니다.

## 로컬 편집기 접속

서버가 실행되면 생성된 `.dev/Open Local MakeCode.url`을 열고 **EZMAKER local test**를 선택합니다. 주소에는 `/index.html?ws=fs`와 로컬 인증 토큰이 포함됩니다. 기본 HTTP 포트는 3232, 웹소켓은 3233입니다. 첫 접속은 생성된 바로가기 또는 콘솔의 Filesystem editor URL을 사용합니다. 단순 localhost 주소에는 인증 토큰이 없습니다.

- `npm.cmd run dev`: 서버 시작 또는 기존 관리 서버 확인
- `npm.cmd run dev:stop`: 서버 종료. 터미널에서 Ctrl+C로도 종료 가능
- `EZMAKER_DEV_PORT`: 시작 전에 설정하면 HTTP 포트를 변경하며 웹소켓 포트는 그보다 1 큼
- `.dev`: 인증 정보가 있는 바로가기·상태 파일을 포함하므로 개인 환경에 보관

소스·번역·도움말 Markdown을 저장한 뒤 편집기를 새로고침하면 현재 파일을 읽습니다. `pxt.json`을 바꿨을 때도 새로고침합니다. 블록 오른쪽 클릭 → 도움말은 편집기 언어에 맞는 패키지 내 문서를 사용합니다.

## Windows의 Node 경로

일반 Node.js 설치로 PATH가 준비되면 경로를 편집할 필요가 없습니다. 시작 파일과 Windows VS Code 작업은 다음 순서로 Node를 찾습니다.

1. 명시적으로 설정한 `EZMAKER_NODE`의 `node.exe` 전체 경로
2. `.dev/node-path.txt` 한 줄에 저장한 개인 경로
3. PATH의 `node`

개인 경로가 있는 `.dev`는 저장소에 올리지 않습니다. 포터블 Node에서 `npm.cmd` 명령까지 쓰려면 해당 폴더를 터미널 PATH에 추가합니다. 다음은 현재 PowerShell 세션에만 적용하는 예입니다.

```powershell
$env:PATH = 'C:\Tools\node-v24.22.0-win-x64;' + $env:PATH
npm.cmd ci --cache .dev/npm-cache --no-audit --no-fund
npm.cmd run dev:setup
```

## 소스와 시험 프로젝트

`projects/ezmaker-extension`은 프로젝트 루트를 가리킵니다. `ezmaker-core`, `ezmaker-neopixel`, `ezmaker-ws2812b`는 설치한 PXT 의존성을 가리킵니다. 원본은 루트의 파일이며 연결 아래의 복사본을 따로 관리하지 않습니다. 이전 `dstemp` 의존성은 사용하지 않습니다.

| 프로젝트 | 용도 |
|---|---|
| ezmaker-local-test | P8 단일 네오픽셀, P0 DIY-A |
| ezmaker-bmp280-test | BMP280 channel 0=0x77 / channel 1=0x76 |
| ezmaker-temperature-test | MAX31850 P12 / DS18B20 P13 |
| ezmaker-dht11-test | DHT11 P16 |
| ezmaker-neopixel-test | P8 네오픽셀 길이·밝기 회귀 |
| ezmaker-suite-test | 루트 test.ts에서 생성하는 전체 검사; 외부 모듈 분리 |
| ezmaker-basic-test | 기본 모듈 대화형 검사 |

설치 도구는 설정·연결을 관리하고 편집 가능한 프로그램은 보존합니다. 전체 검사 프로젝트는 예외로 `check --suite`·`build --suite` 때 루트 `test.ts`를 해당 `main.ts`로 복사합니다.

## 검사와 HEX 생성

```powershell
npm.cmd run dev:doctor
npm.cmd run dev:check
npm.cmd run check:blocks
npm.cmd test
```

`dev:doctor`는 도구·의존성 버전을 표시합니다. `dev:check`는 실행 중인 로컬 서버를 대상으로 도움말을 포함한 확장의 모든 manifest 파일이 디스크와 같은지 검사합니다. `check:blocks`는 PXT 컴파일·블록 변환입니다. `npm test`는 Docker가 필요하며 **3,091개** 회귀·시뮬레이터 검사를 수행합니다. 실물 관찰을 대신하지는 않습니다.

과거 네오픽셀 오류를 재현하는 작은 함수 데이터는 `scripts/tests/neopixel-legacy-fixtures.json`에 공개 원본으로 포함합니다. `.dev`의 개인 백업 없이 같은 검사가 실행됩니다.

네이티브 프로젝트가 SDK 빌드 캐시를 공유하므로 다음 명령은 동시에 실행하지 않고 순서대로 진행합니다.

```powershell
npm.cmd run build:v1
npm.cmd run build:v2
npm.cmd run build:suite:v1
npm.cmd run build:suite:v2
npm.cmd run build:basic:v1
npm.cmd run build:basic:v2
```

출력은 `.dev/firmware/ezmaker-v1.hex`, `ezmaker-v2.hex`, `ezmaker-suite-v1.hex`, `ezmaker-suite-v2.hex`, `ezmaker-basic-v1.hex`, `ezmaker-basic-v2.hex`입니다. 빌드 성공을 확인하고 보드에 맞는 파일을 MICROBIT 드라이브에 복사합니다. 빌드가 실패하면 이전 HEX가 남을 수 있으므로 오래된 파일을 새 결과로 사용하지 않습니다.

첫 네이티브 빌드는 공개 DAL/CODAL 의존성과 Docker 이미지를 받습니다. V1은 `pext/yotta:gcc5`, V2는 기존 이미지 대신 현재 Docker에서 사용할 수 있는 `pext/yotta:update-yotta3`를 사용합니다. 제품 C++는 로컬 컨테이너에서 컴파일하며 이후 캐시를 재사용합니다.

성공한 빌드는 로컬 편집기의 런타임 HEX 캐시에도 반영됩니다. 실물 검증은 명령줄에서 생성한 HEX를 기준으로 합니다. 브라우저 Download는 런타임 캐시가 없으면 클라우드 컴파일을 요청할 수 있으며, 위 빌드 명령은 로컬 빌드를 지정합니다.

## 문제 해결

- SDK 없음: 프로젝트 루트에서 `npm ci` 실행
- `pxt_modules/core`·`neopixel`·`ws2812b` 없음: 서버·검사 실행 전에 `npm run dev:setup` 실행
- Node 없음: 설치 후 VS Code 재시작 또는 위의 개인 Node 경로 설정
- Docker 사용 불가: Linux 엔진 실행 후 같은 터미널에서 `docker info` 확인
- 이전 코드·번역 표시: 로컬 주소인지 확인하고 새로고침한 뒤 `dev:check` 실행. GitHub에서 가져온 클라우드 프로젝트와 파일시스템 프로젝트는 별개
- 포트 사용 중: 기존 관리 서버 종료 또는 다른 `EZMAKER_DEV_PORT` 사용

생성된 HEX와 로컬 캐시는 시험을 재현하기 위해 저장소에 올려야 하는 원본 파일이 아닙니다. 실물 합격 기준은 [TESTING_ko.md](TESTING_ko.md)와 센서별 시험 문서를 따릅니다.

## 참고

- [PXT 의존성 설치](https://makecode.com/cli/install)
- [MakeCode 로컬 서버](https://makecode.com/cli/serve)

BMP280: `npm run check:bmp280`, `npm run test:bmp280`, `npm run build:bmp280:v1`, `npm run build:bmp280:v2`.
