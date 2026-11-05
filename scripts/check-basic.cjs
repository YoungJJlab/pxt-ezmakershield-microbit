// Deterministic regression vectors for the supported analog/digital APIs.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');require('pxt-core');
let adc=0;const analogReads=[],writes=[];
const digital=new Map();const math=Object.create(Math);math.idiv=(a,b)=>Math.trunc(a/b);
const context=vm.createContext({AnalogPin:{P0:100,P1:101,P2:102},DigitalPin:{P8:108,P12:112,P13:113,P16:116},Math:math,
    input:{runningTime:()=>0},
    pins:{analogReadPin:pin=>{analogReads.push(pin);return adc;},digitalReadPin:pin=>digital.get(pin)||0,
        digitalWritePin:(pin,value)=>{writes.push({pin,value});digital.set(pin,value);}},
    ws2812b:{sendBuffer:()=>{}}});
const compile=source=>ts.transpile(source,{target:ts.ScriptTarget.ES5,module:ts.ModuleKind.None});
vm.runInContext(compile(fs.readFileSync(path.join(root,'pxt_modules/neopixel/neopixel.ts'),'utf8')),context,{timeout:1000});
vm.runInContext(compile(fs.readFileSync(path.join(root,'custom.ts'),'utf8')),context,{timeout:1000});
const api=context.ezmaker;let checks=0;
const equal=(a,b)=>{assert.deepStrictEqual(a,b);checks++;};
const inputs=[
    {raw:0,voltage:0,scaled:0,percent:0},
    {raw:1,voltage:0,scaled:0.02,percent:0},
    {raw:511,voltage:1.65,scaled:8.24,percent:50},
    {raw:512,voltage:1.65,scaled:8.26,percent:50},
    {raw:1022,voltage:3.3,scaled:16.48,percent:100},
    {raw:1023,voltage:3.3,scaled:16.5,percent:100}
];
for(const pin of [100,101,102])for(const input of inputs){
    adc=input.raw;
    for(const name of ['readDIYARaw','readDIYBAnalog','readLightRaw','readSoundRaw']){equal(api[name](pin),adc);equal(analogReads[analogReads.length-1],pin);}
    equal(api.readDIYAVoltage(pin),input.voltage);
    equal(api.readVoltage(pin),input.scaled);
    equal(api.readLightPercentage(pin),input.percent);
    equal(api.readSoundPercentage(pin),input.percent);
}
// Fixed vectors for current nominal coefficients, not physical gas calibration.
const gasVectors=[{raw:0,ppm:[0,0,0,0,0]},
    {raw:512,ppm:[3.81,0.08,33.19,0.27,4.94]},
    {raw:1023,ppm:[40538.8,1141787.51,14278303.52,1039762.09,41930.93]}];
for(const pin of [100,101,102])for(const vector of gasVectors){adc=vector.raw;for(let gas=0;gas<5;gas++)equal(api.readMQ2(gas,pin),vector.ppm[gas]);}
for(const pin of [108,112,113,116]){
    api.writeDigitalPin(pin,1);equal(writes[writes.length-1],{pin,value:1});equal(api.readDIYBDigital(pin),true);
    api.writeDigitalPin(pin,0);equal(writes[writes.length-1],{pin,value:0});equal(api.readDIYBDigital(pin),false);
}
adc=512;
for(const name of ['readDIYARaw','readDIYAVoltage','readDIYBAnalog','readLightRaw','readLightPercentage','readSoundRaw','readSoundPercentage','readVoltage']){
    api[name](999);equal(analogReads[analogReads.length-1],100);
}
const before=writes.length;api.writeDigitalPin(999,1);equal(writes.length,before);equal(api.readDIYBDigital(999),false);
console.log(`PASS: ${checks} deterministic analog/voltage/MQ2/digital checks across all supported ports.`);
fs.mkdirSync(path.join(root,'.dev'),{recursive:true});
fs.writeFileSync(path.join(root,'.dev/basic-test-results.json'),JSON.stringify({recordedAt:new Date().toISOString(),checks,result:'pass',calibrationValidated:false},null,2)+'\n');
