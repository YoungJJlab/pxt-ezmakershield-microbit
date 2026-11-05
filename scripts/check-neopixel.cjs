// Execute the actual extension + pinned NeoPixel library + PXT buffer methods.
// Only GPIO transmission is captured; latched tail LEDs are modelled explicitly.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const {transmit} = require('./neopixel-arm-model.cjs');
const root = path.resolve(__dirname, '..');
require('pxt-core');
const simulator = vm.createContext({ console, setTimeout, clearTimeout, setInterval, clearInterval, performance });
vm.runInContext(fs.readFileSync(require.resolve('pxt-core/built/pxtsim.js'), 'utf8'), simulator, { timeout: 3000 });
const buffers = simulator.pxsim.BufferMethods;
const library = fs.readFileSync(path.join(root, 'pxt_modules/neopixel/neopixel.ts'), 'utf8');
const source = fs.readFileSync(path.join(root, 'custom.ts'), 'utf8');
const compile = text => ts.transpile(text, { target: ts.ScriptTarget.ES5, module: ts.ModuleKind.None });
// Keep negative controls reproducible without personal .dev backup files.
const legacyFixtures = JSON.parse(fs.readFileSync(path.join(__dirname, 'tests/neopixel-legacy-fixtures.json'), 'utf8'));
function legacySource(key) {
    const ast = ts.createSourceFile('custom.ts', source, ts.ScriptTarget.ES5, true);
    let body;
    function visit(node) {
        if (node.kind === ts.SyntaxKind.FunctionDeclaration && node.name.text === 'getNeoPixelStrip') body = node.body;
        ts.forEachChild(node, visit);
    }
    visit(ast);
    assert(body && legacyFixtures[key], 'Missing NeoPixel historical helper fixture');
    return source.slice(0, body.pos) + legacyFixtures[key] + source.slice(body.end);
}
function createBuffer(length) {
    const raw = buffers.createBuffer(length);
    return new Proxy(raw, {
        get(target, key) {
            if (key === 'length') return buffers.length(target);
            if (typeof key === 'string' && /^\d+$/.test(key)) return buffers.getByte(target, Number(key));
            if (['fill', 'shift', 'rotate'].includes(key)) return (...args) => buffers[key](target, ...args);
            return target[key];
        },
        set(target, key, value) {
            if (typeof key === 'string' && /^\d+$/.test(key)) buffers.setByte(target, Number(key), value);
            else target[key] = value;
            return true;
        }
    });
}
function harness(extensionSource, nativeWire = false) {
    const frames = [], allocations = [], physical = new Map();
    const buttons = {}, serial = [];
    let poison = 0;
    const oldAssembly = nativeWire ? fs.readFileSync(path.join(root,'pxt_modules/core/sendbuffer.s'),'utf8') : '';
    const newAssembly = nativeWire ? fs.readFileSync(path.join(root,'neopixel-sendbuffer.s'),'utf8') : '';
    const emit = (bytes,pin) => {
        frames.push({pin,bytes});
        if (!physical.has(pin)) physical.set(pin,new Array(36).fill(0));
        bytes.forEach((value,i)=>{if(i<36) physical.get(pin)[i]=value;});
    };
    const math = Object.create(Math);
    math.idiv = (a,b) => Math.trunc(a/b);
    math.clamp = (low,high,value) => Math.min(high, Math.max(low, value));
    const context = vm.createContext({
        Math: math, AnalogPin: {P0:100,P1:101,P2:102},
        DigitalPin: {P8:108,P12:112,P13:113,P16:116},
        input: {runningTime:()=>0,onButtonPressed:(button,handler)=>buttons[button]=handler},
        Button: {A:1,B:2,AB:3}, IconNames: {Yes:0,No:1},
        basic: {showNumber:()=>{},showIcon:()=>{}},
        serial: {writeValue:(name,value)=>serial.push({name,value})},
        __sendBounded: (buffer,pin)=>emit(transmit(newAssembly,Array.from(buffer.data),false,poison).bytes,pin),
        pins: {createBuffer, digitalWritePin:()=>{}},
        ws2812b: { sendBuffer(buffer,pin) {
            const payload = Array.from(buffer.data);
            const bytes = nativeWire ? transmit(oldAssembly,payload,true,poison).bytes : payload;
            // A short frame updates only its leading pixels. Tail LEDs retain
            // their previous latched values until a long enough frame clears them.
            emit(bytes,pin);
        }}
    });
    vm.runInContext(compile(library), context, { timeout: 1000 });
    const setPin = context.neopixel.Strip.prototype.setPin;
    context.neopixel.Strip.prototype.setPin = function(pin) {
        setPin.call(this,pin); allocations.push({pin,length:this.length(),strip:this});
    };
    if (nativeWire) {
        // Substitute only the native entry point, as the hardware compiler does.
        const ast=ts.createSourceFile('custom.ts',extensionSource,ts.ScriptTarget.ES5,true);
        let body;
        const visit=node=>{
            if(node.kind===ts.SyntaxKind.FunctionDeclaration&&node.name.text==='sendNeoPixelBuffer')body=node.body;
            ts.forEachChild(node,visit);
        };
        visit(ast);
        if(body)extensionSource=extensionSource.slice(0,body.pos)+'{ __sendBounded(buffer,pin); }'+extensionSource.slice(body.end);
    }
    vm.runInContext(compile(extensionSource), context, { timeout: 1000 });
    return {api:context.ezmaker,frames,allocations,physical,serial,last:()=>frames[frames.length-1],
        loadProgram:()=>vm.runInContext(compile(fs.readFileSync(path.join(root,'projects/ezmaker-neopixel-test/main.ts'),'utf8')),context,{timeout:1000}),
        press:button=>{assert(buttons[button]);buttons[button]();},setPoison:value=>{poison=value;}};
}
let checks = 0;
const equal = (a,b) => { assert.deepStrictEqual(a,b); checks++; };
const ok = condition => { assert(condition); checks++; };
const scaled = (color,brightness) => {
    const channels = [(color>>8)&255,(color>>16)&255,color&255]; // GRB
    return channels.map(value => brightness < 255 ? (value*brightness)>>8 : value);
};
const repeated = (color,brightness,length) => Array.from({length},()=>scaled(color,brightness)).flat();
const current = harness(source), api = current.api;
for (const pin of [108,112,113,116]) {
    for (const from of [1,7,12]) {
        for (const to of [1,7,12]) {
            api.setNeoPixelBrightness(from,pin,64);
            api.setNeoPixelColorAll(from,pin,0x804020);
            const before = current.allocations.length;
            api.setNeoPixelColorAll(to,pin,0x80c040);
            equal(current.allocations.length,before+(from===to?0:1));
            equal(current.last(),{pin,bytes:repeated(0x80c040,64,to)});
            if (from!==to) equal(current.frames[current.frames.length-2],{pin,bytes:new Array(from*3).fill(0)});
            const unchanged = current.allocations.length;
            api.setNeoPixelPixelColor(to,pin,to-1,0xff0000);
            equal(current.allocations.length,unchanged);
            equal(current.last().bytes.slice((to-1)*3),scaled(0xff0000,64));
            // No pixels outside the current logical length may remain lit.
            ok(current.physical.get(pin).slice(to*3).every(value=>value===0));
        }
    }
}
for (const brightness of [0,1,64,128,255]) {
    api.setNeoPixelBrightness(12,108,brightness);
    api.setNeoPixelColorAll(1,108,0xffffff);
    equal(current.last().bytes,scaled(0xffffff,brightness));
    api.setNeoPixelColorAll(7,108,0xffffff);
    equal(current.last().bytes,repeated(0xffffff,brightness,7));
}
// A resize on one port must not change another port's brightness or pixels.
api.setNeoPixelBrightness(7,112,255);
api.setNeoPixelColorAll(7,112,0x123456);
const otherPort = current.physical.get(112).slice();
api.setNeoPixelBrightness(12,108,32);
api.setNeoPixelColorAll(1,108,0xffffff);
equal(current.physical.get(112),otherPort);
api.setNeoPixelPixelColor(7,112,6,0xabcdef);
equal(current.last().bytes.slice(18),scaled(0xabcdef,255));

const palette = [0xff0000,0x00ff00,0x0000ff,0x884400,0x448800,0x004488,0x440088,0x220044,0x442200,0x224400,0x004422,0x440022];
api.setNeoPixelBrightness(1,113,128);
api.setNeoPixelBar(113,...palette.slice(0,7));
equal(current.last().bytes,palette.slice(0,7).flatMap(c=>scaled(c,128)));
api.setNeoPixelRing(113,...palette);
equal(current.last().bytes,palette.flatMap(c=>scaled(c,128)));
api.clearNeoPixel(7,113);
equal(current.last().bytes,new Array(21).fill(0));
ok(current.physical.get(113).every(value=>value===0));

// All public NeoPixel operations can be the first operation after a size change.
for (const pin of [108,112,113,116]) {
    api.setNeoPixelBrightness(12,pin,255);
    api.clearNeoPixel(1,pin);
    equal(current.last().bytes,[0,0,0]);
    api.showNeoPixelRainbow(7,pin,1,300);
    equal(current.last().bytes.length,21); ok(current.last().bytes.some(value=>value!==0));
    const pixels = current.last().bytes.slice();
    api.shiftNeoPixel(7,pin,1);
    equal(current.last().bytes,[0,0,0,...pixels.slice(0,-3)]);
    api.rotateNeoPixel(7,pin,-1);
    equal(current.last().bytes,[...pixels.slice(0,-3),0,0,0]);
    api.rotateNeoPixel(12,pin,1); // recreated, with a black buffer
    equal(current.last().bytes,new Array(36).fill(0));
    api.shiftNeoPixel(1,pin,1);
    equal(current.last().bytes,[0,0,0]);
    api.showNeoPixelBarGraph(12,pin,100,100);
    equal(current.last().bytes.length,36); ok(current.last().bytes.some(value=>value!==0));
    api.clearNeoPixel(1,pin);
    ok(current.physical.get(pin).every(value=>value===0));
    api.setNeoPixelPixelColor(12,pin,11,0x0000ff);
    equal(current.last().bytes.slice(33),[0,0,255]);
    const beforeInvalid = current.last().bytes.slice();
    api.setNeoPixelPixelColor(12,pin,12,0xff0000);
    equal(current.last().bytes,beforeInvalid);
    api.setNeoPixelPixelColor(12,pin,-1,0xff0000);
    equal(current.last().bytes,beforeInvalid);
}
// Long repeated switching must allocate only when length changes, then reuse.
const beforeLoop = current.allocations.length;
for (let i=0;i<90;i++) {
    const length=[1,7,12][i%3];
    api.setNeoPixelColorAll(length,116,0x000040);
    api.setNeoPixelPixelColor(length,116,length-1,0x000020);
}
equal(current.allocations.length,beforeLoop+90);
const fresh = harness(source);
fresh.api.setNeoPixelColorAll(1,108,0xffffff);
equal(fresh.last().bytes,[127,127,127]); // pinned library's original default brightness

// Show that the pre-fix code exhibits the exact length regression being tested.
{
    const previous = harness(legacySource('beforeLengthFix'));
    previous.api.setNeoPixelColorAll(1,108,0xff0000);
    previous.api.setNeoPixelColorAll(12,108,0x00ff00);
    equal(previous.last().bytes.length,3);
    previous.api.setNeoPixelColorAll(12,112,0x00ff00);
    previous.api.setNeoPixelColorAll(1,112,0xff0000);
    equal(previous.last().bytes.length,36);
}
// Execute the user's exact button sequence against the sender instruction model.
const wireFixed=harness(source,true);
wireFixed.loadProgram();
for(const button of [1,1,1,1,2])wireFixed.press(button);
wireFixed.setPoison(255);
for(const button of [1,1,1])wireFixed.press(button);
equal(wireFixed.physical.get(108).slice(0,3),[0,7,0]);
equal(wireFixed.physical.get(108).slice(3),new Array(33).fill(0));
for(let i=0;i<12;i++){
    wireFixed.setPoison([255,128,85,0][i%4]);
    wireFixed.press(2);
    for(const button of [1,1,1])wireFixed.press(button);
    equal(wireFixed.physical.get(108).slice(3),new Array(33).fill(0));
}
wireFixed.press(3);
equal(wireFixed.physical.get(108),new Array(36).fill(0));
{
    const wireOld=harness(legacySource('beforeV1SenderFix'),true);
    wireOld.loadProgram();
    for(const button of [1,1,1,1,2])wireOld.press(button);
    wireOld.setPoison(255);
    for(const button of [1,1,1])wireOld.press(button);
    equal(wireOld.physical.get(108).slice(0,3),[0,7,0]);
    equal(wireOld.physical.get(108).slice(3,6),[255,0,0]); // full green, independent of brightness
}
console.log(`PASS: ${checks} actual extension/library/buffer and button-sequence checks, including poisoned-memory V1 transmission regression.`);
console.log('Physical V1/V2 LEDs and electrical timing still require the hardware test.');
require('./check-neopixel-native.cjs');
