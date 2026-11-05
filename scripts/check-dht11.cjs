const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');

// Run the real TypeScript wrapper with only its native hardware shim replaced.
// Namespace state, cache logic, error propagation and port mapping stay intact.
require('pxt-core');
const source = fs.readFileSync(path.join(root, 'custom.ts'), 'utf8');
// Load the real base class required by the extension's NeoPixel transmitter.
const libraryJS = ts.transpile(fs.readFileSync(path.join(root, 'pxt_modules/neopixel/neopixel.ts'), 'utf8'),
    { target: ts.ScriptTarget.ES5, module: ts.ModuleKind.None });
const ast = ts.createSourceFile('custom.ts', source, ts.ScriptTarget.ES5, true);
let body;
function visit(node) {
    if (node.kind === ts.SyntaxKind.FunctionDeclaration && node.name.text === 'readDHT11Shim') body = node.body;
    ts.forEachChild(node, visit);
}
visit(ast);
assert(body, 'Native DHT11 shim missing');
const instrumented = source.slice(0, body.pos) + '{ return __readDHT11(pin); }' + source.slice(body.end);
const js = ts.transpile(instrumented, { target: ts.ScriptTarget.ES5, module: ts.ModuleKind.None });
let time = 2000, calls = 0, reading = (601 << 12) | 235, hook;
const math = Object.create(Math); math.idiv = (a,b) => Math.trunc(a/b);
const context = vm.createContext({
    AnalogPin: {P0:100,P1:101,P2:102},
    DigitalPin: {P8:108,P12:112,P13:113,P16:116},
    input: { runningTime: () => time }, Math: math,
    __readDHT11: pin => { calls++; if (hook) hook(pin); return reading; }
});
vm.runInContext(libraryJS, context, { timeout: 1000 });
vm.runInContext(js, context, { timeout: 1000 });
let checks = 0;
const equal = (actual, expected) => { assert.equal(actual, expected); checks++; };
const read = (port, kind) => {
    context.__port = port; context.__kind = kind;
    return vm.runInContext('ezmaker.readDHT11(__port, __kind)', context, { timeout: 1000 });
};
equal(read(999,0), -1); equal(calls,0);
equal(read(116,0),23.5); equal(read(116,1),60.1); equal(calls,1);
time += 999; equal(read(116,0),23.5); equal(calls,1);
time += 1; reading = -4; equal(read(116,0),-4); equal(read(116,1),-4); equal(calls,2);
for (const error of [-4,-5,-6,-7,-8]) {
    time += 1000; reading = (550 << 12) | 186;
    equal(read(116,0),18.6); equal(read(116,1),55);
    const previous = calls;
    time += 1000; reading = error;
    equal(read(116,0),error); equal(read(116,1),error); equal(read(116,0),error);
    equal(calls, previous+1);
}
time += 1000; reading = (400 << 12) | 205;
hook = () => { equal(read(116,1),-9); equal(read(112,0),-9); };
equal(read(116,0),20.5); hook = null; equal(read(116,1),40);
const beforeSwitch = calls;
reading = -6; equal(read(108,0),-6); equal(read(108,1),-6); equal(calls,beforeSwitch+1);
reading = (500 << 12) | 250; equal(read(112,0),25); equal(read(112,1),50);
time = 10; equal(read(112,0),25); equal(calls,beforeSwitch+3);
// Confirm that the production simulator body also runs safely without a sensor.
const simulator = vm.createContext({AnalogPin:{P0:100,P1:101,P2:102},DigitalPin:{P8:108,P12:112,P13:113,P16:116},input:{runningTime:()=>2000},Math:math});
vm.runInContext(libraryJS,simulator,{timeout:1000});
vm.runInContext(ts.transpile(source, {target:ts.ScriptTarget.ES5}),simulator,{timeout:1000});
equal(vm.runInContext('ezmaker.readDHT11(116,0)',simulator,{timeout:1000}),-4);
equal(vm.runInContext('ezmaker.readDHT11(116,1)',simulator,{timeout:1000}),-4);
console.log(`PASS: ${checks} actual TypeScript cache/error/concurrency/port/simulator checks.`);

const candidates = [
    path.join(os.homedir(),'AppData/Local/Programs/DockerDesktop/resources/bin/docker.exe'),
    path.join(process.env.ProgramFiles || 'C:/Program Files','Docker/Docker/resources/bin/docker.exe')
];
const docker = candidates.find(file => fs.existsSync(file)) || 'docker';
const result = spawnSync(docker, ['run','--rm','-v',root+':/src:ro',
    'pext/yotta:update-yotta3','/bin/sh','-c',
    'g++ -std=c++11 -Wall -Wextra -Werror -I/src /src/scripts/tests/dht11.cpp -o /tmp/ezmaker-dht11-test && /tmp/ezmaker-dht11-test'],
    {cwd:root,shell:false,windowsHide:true,stdio:'inherit'});
if (result.error) console.error(result.error.message);
process.exitCode = result.status === 0 && !result.error ? 0 : 1;
