// Execute the actual DS18B20 TypeScript wrapper; replace only its native shim.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
require('pxt-core');
const source = fs.readFileSync(path.join(root, 'custom.ts'), 'utf8');
const ast = ts.createSourceFile('custom.ts', source, ts.ScriptTarget.ES5, true);
let body;
function visit(node) {
    if (node.kind === ts.SyntaxKind.FunctionDeclaration && node.name.text === 'readDS18B20Shim') body = node.body;
    ts.forEachChild(node, visit);
}
visit(ast);
assert(body, 'Native DS18B20 shim missing');
const instrumented = source.slice(0, body.pos) + '{ return __readDS18B20(pin); }' + source.slice(body.end);
const compile = code => ts.transpile(code, { target: ts.ScriptTarget.ES5, module: ts.ModuleKind.None });
const library = compile(fs.readFileSync(path.join(root, 'pxt_modules/neopixel/neopixel.ts'), 'utf8'));
const js = compile(instrumented);
function harness(code = js) {
    const state = { time: 2000, reading: 32.6, calls: [] };
    const context = vm.createContext({
        AnalogPin: { P0: 100, P1: 101, P2: 102 },
        DigitalPin: { P8: 108, P12: 112, P13: 113, P16: 116 },
        Math, input: { runningTime: () => state.time },
        __readDS18B20: pin => { state.calls.push(pin); return state.reading; }
    });
    vm.runInContext(library, context, { timeout: 1000 });
    vm.runInContext(code, context, { timeout: 1000 });
    state.read = port => {
        context.__port = port;
        return vm.runInContext('ezmaker.readDS18B20(__port)', context, { timeout: 1000 });
    };
    return state;
}
let checks = 0;
const equal = (actual, expected, label) => { assert.equal(actual, expected, label); checks++; };
const invalidPorts = [-1, 0, 8, 12, 13, 16, 100, 999];
for (const port of [108, 112, 113, 116]) {
    const h = harness();
    equal(h.read(port), 32.6, 'Valid measurement before invalid calls');
    equal(h.calls[0], port, 'Correct native GPIO mapping');
    for (const invalid of invalidPorts) {
        equal(h.read(invalid), -273, 'First invalid call rejects port ' + invalid);
        equal(h.read(invalid), -273, 'Repeated invalid call never returns stale temperature: ' + invalid);
        equal(h.calls.length, 1, 'Invalid port must not call the native sensor');
        equal(h.read(port), 32.6, 'Invalid port must not replace the valid cached measurement');
        equal(h.calls.length, 1, 'Valid cache survives invalid calls');
    }
    h.reading = 21.375;
    h.time += 999;
    equal(h.read(port), 32.6, 'Cached at 999 ms');
    equal(h.calls.length, 1, 'No extra native call before expiry');
    h.time += 1;
    equal(h.read(port), 21.38, 'Refresh at exactly 1000 ms with original rounding');
    equal(h.calls.length, 2, 'Exactly one new measurement after expiry');
    h.time += 1000;
    h.reading = -999;
    equal(h.read(port), -999, 'Sensor failure does not expose previous success');
    equal(h.read(port), -999, 'Failure cached within one second');
    equal(h.calls.length, 3, 'Cached error avoids extra sensor transaction');
    equal(h.read(999), -273, 'Invalid port remains distinct from sensor failure');
    equal(h.read(port), -999, 'Invalid call preserves cached sensor error');
    equal(h.calls.length, 3, 'Invalid call leaves error cache intact');
    h.time += 1000;
    h.reading = -12.25;
    equal(h.read(port), -12.25, 'Recovery and negative temperature');
    equal(h.calls.length, 4, 'Recovery triggers native measurement');
}
const fresh = harness();
for (const invalid of invalidPorts) {
    equal(fresh.read(invalid), -273, 'Reject invalid port before any valid measurement');
    equal(fresh.calls.length, 0, 'Invalid startup calls do not access hardware');
}
equal(fresh.read(113), 32.6, 'Valid read after invalid startup calls');
const switched = harness();
for (const [index, port] of [108, 112, 113, 116, 108].entries()) {
    switched.reading = index;
    equal(switched.read(port), index, 'Changing port reads that port rather than cached previous port');
    equal(switched.calls.length, index + 1, 'Each port switch triggers one native measurement');
}
const simulator = harness(compile(source));
equal(simulator.read(113), 32.6, 'Unmodified production simulator fallback');
equal(simulator.read(999), -273, 'Simulator invalid port');
equal(simulator.read(999), -273, 'Simulator repeated invalid port');
equal(simulator.calls.length, 0, 'Production simulator does not use instrumented shim');
fs.mkdirSync(path.join(root, '.dev'), { recursive: true });
fs.writeFileSync(path.join(root, '.dev/temperature-wrapper-test-results.json'),
    JSON.stringify({ recordedAt: new Date().toISOString(), checks, result: 'pass',
        scope: 'Actual TS wrapper; native shim stubbed except production-simulator profile',
        ports: [108, 112, 113, 116], invalidPorts }, null, 2) + '\n');
console.log(`PASS: ${checks} actual DS18B20 TypeScript port/cache/error/recovery/simulator checks.`);
