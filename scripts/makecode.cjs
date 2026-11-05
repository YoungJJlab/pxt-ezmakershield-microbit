// Development runner for the PXT version pinned by package-lock.json.
// It loads the installed CLI directly; no global pxt installation is required.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const os = require('node:os');
const { spawnSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const stateDir = path.join(root, '.dev');
const stateFile = path.join(stateDir, 'server.json');
let targetDir;
try { targetDir = path.dirname(require.resolve('pxt-microbit/pxtarget.json')); }
catch (error) {
    if (error.code !== 'MODULE_NOT_FOUND') throw error;
    console.error('MakeCode SDK is missing. Run npm ci, then npm run dev:setup. See LOCAL_DEVELOPMENT.md.');
    process.exit(1);
}
const args = process.argv.slice(2);
const mode = args[0] || 'serve';
const temperatureTest = args.includes('--temperature');
const dht11Test = args.includes('--dht11');
const neopixelTest = args.includes('--neopixel');
const suiteTest = args.includes('--suite');
const basicTest = args.includes('--basic');
const dataTest = args.includes('--data');
const bmp280Test = args.includes('--bmp280');
const serialDiagnosticTest = args.includes('--serial-diagnostic');
if (args.includes('--ultrasonic')) throw new Error('Ultrasonic support has been removed; use the supported test projects.');
if ([temperatureTest, dht11Test, neopixelTest, suiteTest, basicTest, dataTest, serialDiagnosticTest, bmp280Test].filter(Boolean).length > 1)
    throw new Error('Select only one test project.');
const sensorTest = bmp280Test ? 'bmp280' : serialDiagnosticTest ? 'serial-diagnostic' : dataTest ? 'data' : suiteTest ? 'suite' : basicTest ? 'basic' : neopixelTest ? 'neopixel' : dht11Test ? 'dht11' : temperatureTest ? 'temperature' : null;
const baselineProject = path.join(root, 'projects', 'ezmaker-local-test');
const project = sensorTest ? path.join(root, 'projects', `ezmaker-${sensorTest}-test`) : baselineProject;
process.chdir(root);
// Docker Desktop's per-user install is not always on the terminal's PATH.
for (const dir of [path.join(os.homedir(), 'AppData/Local/Programs/DockerDesktop/resources/bin'),
    path.join(process.env.ProgramFiles || 'C:/Program Files', 'Docker/Docker/resources/bin')]) {
    if (fs.existsSync(path.join(dir, 'docker.exe'))) process.env.PATH = dir + path.delimiter + process.env.PATH;
}

function writeJson(file, value) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, JSON.stringify(value, null, 4) + '\n');
}

function ensureProject() {
    // Check sources before creating links, so a fresh checkout reports the
    // required setup command rather than a broken junction/realpath error.
    for (const name of ['core', 'neopixel', 'ws2812b']) {
        if (!fs.existsSync(path.join(root, 'pxt_modules', name, 'pxt.json'))) {
            throw new Error(`Missing pxt_modules/${name}. Run npm run dev:setup first.`);
        }
    }
    fs.mkdirSync(project, { recursive: true });
    // The filesystem workspace resolves file: dependencies by project path.
    // Junctions expose the original files without copying or relocating them.
    for (const [name, source] of Object.entries({
        'ezmaker-extension': root,
        'ezmaker-core': path.join(root, 'pxt_modules/core'),
        'ezmaker-neopixel': path.join(root, 'pxt_modules/neopixel'),
        'ezmaker-ws2812b': path.join(root, 'pxt_modules/ws2812b')
    })) {
        const link = path.join(root, 'projects', name);
        if (!fs.existsSync(link)) fs.symlinkSync(source, link, process.platform === 'win32' ? 'junction' : 'dir');
        if (fs.realpathSync(link) !== fs.realpathSync(source)) throw new Error('Unexpected development link: ' + link);
    }
    // These references deliberately override the extension's GitHub dependencies.
    // Application source remains editable in the browser and is never reset here.
    const dependencies = {
        core: 'file:../ezmaker-core',
        ws2812b: 'file:../ezmaker-ws2812b',
        neopixel: 'file:../ezmaker-neopixel',
        'pxt-ezmakershield-microbit': 'file:../ezmaker-extension'
    };
    const configFile = path.join(project, 'pxt.json');
    const config = fs.existsSync(configFile) ? JSON.parse(fs.readFileSync(configFile, 'utf8')) : {
        name: 'EZMAKER local test',
        description: 'Loads the extension directly from the working folder.',
        files: ['main.blocks', 'main.ts'],
        preferredEditor: 'blocksprj',
        supportedTargets: ['microbit']
    };
    config.dependencies = dependencies;
    config.targetVersions = { target: require('pxt-microbit/package.json').version, targetId: 'microbit' };
    writeJson(configFile, config);
    if (suiteTest) {
        // Root test.ts is the published source of truth. This project is a
        // generated local runner, so it never replaces a user's test project.
        fs.copyFileSync(path.join(root, 'test.ts'), path.join(project, 'main.ts'));
    }
}

function loadCli() {
    const cli = require('pxt-core');
    if (sensorTest) {
        // These projects use the same target and native sources. Reuse the
        // existing SDK/toolchain caches; run local builds one at a time.
        const engines = require('pxt-core/built/buildengine').buildEngines;
        engines.dockeryotta.buildPath = '../ezmaker-local-test/built/dockeryt';
        engines.dockercodal.buildPath = '../ezmaker-local-test/built/dockercodal';
    }
    const nodeutil = require(path.join(path.dirname(require.resolve('pxt-core')), 'nodeutil'));
    // PXT 12 defaults to shell:true on Windows. Preserve Docker's bash -c argument
    // and avoid cmd.exe reinterpreting native executable arguments.
    for (const name of ['spawnAsync', 'spawnWithPipeAsync']) {
        const spawn = nodeutil[name];
        nodeutil[name] = options => spawn({ ...options,
            // The historical :latest image uses a schema-1 manifest rejected by
            // Docker 29. This maintained PXT image is also used by Microsoft's
            // CODAL target configuration (pxt-calliope).
            args: options.cmd === 'docker' ? options.args.map(arg => arg === 'pext/yotta:latest'
                ? (process.env.EZMAKER_CODAL_IMAGE || 'pext/yotta:update-yotta3') : arg) : options.args,
            shell: ['docker', 'git', 'git.exe'].includes(options.cmd) ? false : options.shell });
    }
    // Keep development authentication and compilation cache inside this workspace.
    // Do not repurpose HOME/USERPROFILE or modify the SDK installation.
    const homeConfig = path.join(os.homedir(), '.pxt', 'config.json');
    const oldConfig = fs.existsSync(homeConfig) ? JSON.parse(fs.readFileSync(homeConfig, 'utf8')) : {};
    let tokenFile = path.join(stateDir, 'local-token.json');
    if (!fs.existsSync(tokenFile)) writeJson(tokenFile, { token: crypto.randomBytes(24).toString('hex') });
    cli.globalConfig.localToken = oldConfig.localToken || JSON.parse(fs.readFileSync(tokenFile, 'utf8')).token;
    const getHexInfo = pxt.hexloader.getHexInfoAsync;
    pxt.hexloader.getHexInfoAsync = (host, info) => {
        const cachedHost = Object.create(host);
        cachedHost.cacheGetAsync = async id => {
            try { return fs.readFileSync(path.join(stateDir, 'cache', encodeURIComponent(id)), 'utf8'); }
            catch (error) { if (error.code === 'ENOENT') return null; throw error; }
        };
        cachedHost.cacheStoreAsync = async (id, value) => {
            const file = path.join(stateDir, 'cache', encodeURIComponent(id));
            fs.mkdirSync(path.dirname(file), { recursive: true });
            fs.writeFileSync(file, value);
        };
        return getHexInfo.call(pxt.hexloader, cachedHost, info);
    };
    const compile = ts.pxtc.compile;
    ts.pxtc.compile = options => {
        // Publish only already-built native runtimes to the local server cache.
        // This is generated build output; SDK source/configuration is unchanged.
        for (const ext of [options.extinfo, ...(options.otherMultiVariants || []).map(value => value.extinfo)]) {
            if (ext && /^[a-f0-9]{64}$/.test(ext.sha) && ext.hexinfo && ext.hexinfo.hex) {
                const cache = path.join(targetDir, 'built/hexcache', ext.sha + '.hex');
                fs.mkdirSync(path.dirname(cache), { recursive: true });
                fs.writeFileSync(cache, Array.isArray(ext.hexinfo.hex) ? ext.hexinfo.hex.join('\n') : ext.hexinfo.hex);
            }
        }
        return compile(options);
    };
    return cli;
}

async function main() {
    if (mode === 'setup') {
        if (sensorTest) throw new Error('Setup prepares the baseline project; omit sensor flags.');
        // The official installer reads the pinned target bundle for core and
        // the exact GitHub tags from pxt.json for external dependencies.
        const cli = loadCli();
        await cli.mainCli(targetDir, ['install']);
        ensureProject();
        for (const [name, version] of [['neopixel', '0.7.3'], ['ws2812b', '0.1.1']]) {
            const installed = JSON.parse(fs.readFileSync(path.join(root, 'pxt_modules', name, 'pxt.json'), 'utf8'));
            if (installed.version !== version) throw new Error(`Expected ${name} ${version}, found ${installed.version}.`);
        }
        writeJson(path.join(stateDir, 'setup.json'), {
            recordedAt: new Date().toISOString(), node: process.version,
            target: require('pxt-microbit/package.json').version,
            pxt: require('pxt-core/package.json').version,
            dependencies: { core: 'bundled with pinned target', neopixel: '0.7.3', ws2812b: '0.1.1' }
        });
        console.log('PASS: core, neopixel 0.7.3, ws2812b 0.1.1 and local project links are ready.');
        console.log('Next: npm run check:blocks, npm run dev, or npm test with Docker running.');
        return;
    }
    if (mode === 'stop') {
        if (!fs.existsSync(stateFile)) { console.log('No managed local server is recorded.'); return; }
        const state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
        // Verify the PID still serves our token before stopping it (PIDs can be reused).
        const response = await fetch(`${state.origin}/api/list`, { headers: { authorization: state.token } });
        if (!response.ok) throw new Error('Server identity check failed; the recorded PID was not stopped.');
        process.kill(state.pid);
        fs.rmSync(stateFile, { force: true });
        console.log('Stopped the managed MakeCode server.');
        return;
    }
    if (mode === 'doctor') {
        const command = name => {
            const result = spawnSync(name, ['--version'], { encoding: 'utf8', shell: false, windowsHide: true });
            return result.error ? result.error.code : (result.stdout || result.stderr).trim().split('\n')[0];
        };
        console.log(JSON.stringify({ node: process.version, target: require('pxt-microbit/package.json').version,
            pxt: require('pxt-core/package.json').version, docker: command('docker'), project,
            source: root, dependencies: ['core', 'neopixel', 'ws2812b'].map(name => ({ name,
                present: fs.existsSync(path.join(root, 'pxt_modules', name, 'pxt.json')) })) }, null, 2));
        return;
    }
    ensureProject();
    const cli = loadCli();
    if (mode === 'serve') {
        const port = Number(process.env.EZMAKER_DEV_PORT || 3232);
        const wsPort = port + 1;
        if (fs.existsSync(stateFile)) {
            const existing = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
            try {
                const response = await fetch(`${existing.origin}/api/list`, {
                    headers: { authorization: existing.token }, signal: AbortSignal.timeout(2000) });
                if (response.ok) {
                    console.log('MakeCode is already running. Open .dev/Open Local MakeCode.url');
                    return;
                }
            } catch { /* A stale state file can be replaced. */ }
        }
        writeJson(stateFile, { pid: process.pid, origin: `http://localhost:${port}`, token: cli.globalConfig.localToken });
        fs.writeFileSync(path.join(stateDir, 'Open Local MakeCode.url'),
            `[InternetShortcut]\r\nURL=http://localhost:${port}/index.html?ws=fs#local_token=${cli.globalConfig.localToken}&wsport=${wsPort}\r\n`);
        console.log('Local test project: EZMAKER local test');
        console.log('Source: ' + root);
        console.log('Save in VS Code, then reload this local editor to read fresh source.');
        console.log(`Filesystem editor: http://localhost:${port}/index.html?ws=fs#local_token=${cli.globalConfig.localToken}&wsport=${wsPort}`);
        process.on('exit', () => {
            if (fs.existsSync(stateFile)) {
                const state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
                if (state.pid === process.pid) fs.rmSync(stateFile, { force: true });
            }
        });
        await cli.mainCli(targetDir, ['serve', '--just', '--noBrowser', '--noSerial', '--hostname', 'localhost',
            '--port', String(port), '--wsport', String(wsPort)]);
    } else if (mode === 'check') {
        process.chdir(project);
        pxt.debug = () => {};
        const compile = ts.pxtc.compile;
        let result, compileOptions;
        ts.pxtc.compile = options => {
            options.ast = true;
            compileOptions = options;
            const debug = pxt.options.debug;
            pxt.options.debug = false;
            try { return result = compile(options); }
            finally { pxt.options.debug = debug; }
        };
        const log = pxt.log;
        pxt.log = (message, ...rest) => {
            if (typeof message === 'string' && /(^|\n)PROC /.test(message)) return;
            log(message, ...rest);
        };
        await cli.mainCli(targetDir, ['build', '--debug']);
        const api = ts.pxtc.getApiInfo(result.ast, compileOptions.jres);
        const blocksInfo = ts.pxtc.getBlocksInfo(api);
        const blocks = blocksInfo.blocks.filter(block => block.qName.startsWith('ezmaker.'));
        if (blocks.length !== 27) throw new Error('Expected 27 supported extension blocks.');
        if (suiteTest) {
            console.log(`PASS: root test.ts simulator compilation and ${blocks.length} extension blocks.`);
            console.log('This test program is TypeScript; no blocks conversion is required.');
            return;
        }
        const decompiled = ts.pxtc.decompiler.decompileToBlocks(blocksInfo, result.ast.getSourceFile('main.ts'),
            { alwaysEmitOnStart: true, errorOnGreyBlocks: true });
        if (!decompiled.success) throw new Error(decompiled.diagnostics.map(ts.pxtc.getDiagnosticString).join('\n'));
        fs.writeFileSync(path.join(stateDir, sensorTest ? `generated-${sensorTest}.blocks` : 'generated-main.blocks'), decompiled.outfiles['main.blocks']);
        console.log(`PASS: simulator/TypeScript compilation, ${blocks.length} extension block definitions, and TypeScript-to-blocks conversion.`);
        console.log('This does not run the sensor program or validate C++ firmware.');
    } else if (mode === 'build') {
        const version = args[1];
        if (!['v1', 'v2'].includes(version)) throw new Error('Specify v1 or v2.');
        if (!args.includes('--cloud')) {
            const docker = spawnSync('docker', ['info'], { encoding: 'utf8', shell: false, windowsHide: true });
            if (docker.error || docker.status !== 0) {
                throw new Error('Docker Desktop with Linux containers must be installed and running. See LOCAL_DEVELOPMENT.md.');
            }
            const engineDir = path.join(baselineProject, 'built', version === 'v1' ? 'dockeryt' : 'dockercodal');
            const expected = version === 'v1' ? path.join(engineDir, 'build/bbc-microbit-classic-gcc/source/pxt-microbit-app-combined.hex')
                : path.join(engineDir, 'build/MICROBIT.hex');
            if (!fs.existsSync(expected)) fs.rmSync(path.join(engineDir, 'buildcache.json'), { force: true });
        }
        process.chdir(project);
        process.env.PXT_COMPILE_SWITCHES = [process.env.PXT_COMPILE_SWITCHES,
            'csv---' + (version === 'v1' ? 'mbdal' : 'mbcodal')].filter(Boolean).join(',');
        await cli.mainCli(targetDir, ['build',
            args.includes('--cloud') ? '--cloud' : '--local']);
        const binary = path.join(project, 'built', 'binary.hex');
        if (!fs.existsSync(binary)) throw new Error('The build did not produce binary.hex.');
        const output = path.join(stateDir, 'firmware', `ezmaker-${sensorTest ? sensorTest + '-' : ''}${version}.hex`);
        fs.mkdirSync(path.dirname(output), { recursive: true });
        fs.copyFileSync(binary, output);
        console.log('Firmware: ' + output);
    } else throw new Error('Unknown development command: ' + mode);
}
main().catch(error => { console.error(error.message || error); process.exitCode = 1; });
