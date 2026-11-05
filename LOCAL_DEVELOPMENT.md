# Local MakeCode development

[한국어 안내](LOCAL_DEVELOPMENT_ko.md)

The local editor reads this working folder, without waiting for a GitHub release. Product and lesson documentation is in [README.md](README.md); test expectations are in [TESTING.md](TESTING.md).

## First-time setup on another PC

Install Node.js with npm and reopen the terminal/VS Code so `node` and `npm` are on PATH. This project was validated with Node.js **24.22.0**. Native tests and firmware builds also need Git and Docker Desktop running **Linux containers**. Docker is not needed for the initial extension install or TypeScript/blocks check.

From the repository root on Windows:

```powershell
npm.cmd ci --cache .dev/npm-cache --no-audit --no-fund
npm.cmd run dev:setup
npm.cmd run check:blocks
npm.cmd run dev
```

On a system where the command is `npm` rather than `npm.cmd`, use `npm` for the same scripts. The filesystem runner uses Windows junctions on Windows and directory symlinks elsewhere; this project's end-to-end validation is on Windows.

`npm ci` installs exactly the versions in `package-lock.json`. `dev:setup` runs the pinned SDK's official `pxt install`, then prepares local project links:

| Dependency | Source/version |
|---|---|
| pxt-microbit | npm lock: 8.1.19 |
| pxt-core | npm lock: 12.3.14 |
| core | bundled in the pinned micro:bit target |
| neopixel | extension dependency: v0.7.3 |
| ws2812b | neopixel dependency: v0.1.1 |

An internet connection is needed for the first download. A global `pxt` installation or GitHub sign-in is not required for these public dependencies. Run `dev:setup` again after restoring a checkout or changing PXT dependencies; it preserves application `main.ts`/`main.blocks` files. Do not run `npm ci` against an editor that is currently running: it replaces `node_modules`; stop the editor first.

After `npm ci`, Windows users can alternatively run **Setup Local MakeCode.cmd**, then **Start Local MakeCode.cmd**. VS Code has a **MakeCode: Set up extension dependencies** task and the existing check/build/test tasks.

## Open the editor

Open the generated `.dev/Open Local MakeCode.url` after the server starts, then choose **EZMAKER local test**. The address uses `/index.html?ws=fs` and a local authentication token. The default HTTP port is 3232 and the websocket port is 3233. Use the generated shortcut or printed Filesystem editor URL for first access; a plain localhost address does not carry the token.

- `npm.cmd run dev` starts or locates the managed server.
- `npm.cmd run dev:stop` stops it. Ctrl+C also stops a foreground server.
- Set `EZMAKER_DEV_PORT` before starting to use a different HTTP port; the websocket port is one higher.
- Keep `.dev` private: shortcuts/state files contain local authentication details.

Save extension source, translations or help Markdown, then reload the local editor. This reads the current files immediately. Changes in `pxt.json` also need a reload. Right-click a block and choose Help; bundled reference pages follow the editor language.

## Node paths and Windows launchers

A normal Node.js installation on PATH needs no path edits. The `.cmd` launchers and Windows VS Code tasks resolve Node in this order:

1. `EZMAKER_NODE`, if explicitly set to the full path of `node.exe`.
2. A local path saved as one line in `.dev/node-path.txt`.
3. `node` on PATH.

Personal paths are kept in `.dev`; do not commit that directory. A portable Node installation also needs its folder on the terminal's PATH when running `npm.cmd` scripts. Example for one PowerShell session:

```powershell
$env:PATH = 'C:\Tools\node-v24.22.0-win-x64;' + $env:PATH
npm.cmd ci --cache .dev/npm-cache --no-audit --no-fund
npm.cmd run dev:setup
```

## Local projects and source files

`projects/ezmaker-extension` points at the repository root; `ezmaker-core`, `ezmaker-neopixel` and `ezmaker-ws2812b` point at installed PXT dependencies. Edit root source files, not copies in these links. The obsolete `dstemp` dependency is not used; old cache files do not make it an active dependency.

| Project | Purpose |
|---|---|
| ezmaker-local-test | Single NeoPixel on P8 and DIY-A on P0 |
| ezmaker-bmp280-test | BMP280 channel 0=0x77 / channel 1=0x76 |
| ezmaker-temperature-test | MAX31850 P12 / DS18B20 P13 |
| ezmaker-dht11-test | DHT11 P16 |
| ezmaker-neopixel-test | NeoPixel length/brightness regression on P8 |
| ezmaker-suite-test | Generated runner for root `test.ts`; disconnect external modules |
| ezmaker-basic-test | Interactive basic module checks |

Setup manages project configs/links and preserves editable application programs. The suite runner is the exception: `check --suite`/`build --suite` copies root `test.ts` into its generated `main.ts`.

## Checks and firmware

```powershell
npm.cmd run dev:doctor
npm.cmd run dev:check
npm.cmd run check:blocks
npm.cmd test
```

`dev:doctor` reports tool/dependency versions. `dev:check` needs a running local server and compares every extension manifest file, including help pages, against the served files. `check:blocks` checks PXT compilation and blocks conversion. `npm test` needs Docker and runs the documented **3,091** regression/simulator checks; it does not replace hardware observations.

Historical NeoPixel failures use small public helper fixtures in `scripts/tests/neopixel-legacy-fixtures.json`. The tests do not depend on private backup files in `.dev`.

Build sequentially because the projects share native toolchain caches:

```powershell
npm.cmd run build:v1
npm.cmd run build:v2
npm.cmd run build:suite:v1
npm.cmd run build:suite:v2
npm.cmd run build:basic:v1
npm.cmd run build:basic:v2
```

Files are written to `.dev/firmware/ezmaker-v1.hex`, `ezmaker-v2.hex`, `ezmaker-suite-v1.hex`, `ezmaker-suite-v2.hex`, `ezmaker-basic-v1.hex` and `ezmaker-basic-v2.hex`. Copy the matching successful build to the board's MICROBIT drive. A failed build does not replace an older HEX; check build success rather than treating an old file as a new result.

First native builds fetch the public DAL/CODAL dependencies and Docker images. The runner uses `pext/yotta:gcc5` for V1 and substitutes the Docker-compatible `pext/yotta:update-yotta3` for the legacy V2 image. Product C++ is compiled locally. Later builds reuse the cache. Native builds must not run concurrently.

Successful builds also seed the local editor's runtime HEX cache. Use the CLI-produced HEX for controlled hardware verification. The browser Download button can request cloud compilation if a suitable runtime is absent; the commands above explicitly use local builds.

## Troubleshooting

- **Missing SDK**: run `npm ci` from this repository root.
- **Missing pxt_modules/core/neopixel/ws2812b**: run `npm run dev:setup` before serving, checking or testing.
- **Node not found**: reopen VS Code after installation, or configure the portable Node path described above.
- **Docker unavailable**: start Docker Desktop's Linux engine; `docker info` should succeed in the same terminal.
- **Old source or untranslated help**: verify the local editor URL, reload it, and run `dev:check`. GitHub-imported cloud projects are distinct from the filesystem projects.
- **Ports already occupied**: stop the existing managed editor or choose another `EZMAKER_DEV_PORT`.

See [TESTING.md](TESTING.md), [TESTING_ko.md](TESTING_ko.md) and the sensor-specific procedures for physical pass/fail observations. Generated firmware and local caches are build outputs, not files that must be committed to reproduce the test.

## References

- [PXT dependency installation](https://makecode.com/cli/install)
- [Local MakeCode server](https://makecode.com/cli/serve)

BMP280: `npm run check:bmp280`, `npm run test:bmp280`, `npm run build:bmp280:v1`, `npm run build:bmp280:v2`.
