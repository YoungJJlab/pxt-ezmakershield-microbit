// Exercise the actual TS calibration state/event handlers. Native sensor math is tested separately.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');require('pxt-core');
const source=fs.readFileSync(path.join(root,'custom.ts'),'utf8');
const pattern=/function readBMP280Shim\(channel: number, dataType: number, reference: number\): number \{\s*return -9999;\s*\}/;
assert(pattern.test(source));
const compile=s=>ts.transpile(s,{target:ts.ScriptTarget.ES5,module:ts.ModuleKind.None});
const neo=compile(fs.readFileSync(path.join(root,'pxt_modules/neopixel/neopixel.ts'),'utf8'));
let checks=0;
const equal=(a,b)=>{assert.deepStrictEqual(a,b);checks++;};
function harness(){
 const handlers=new Map(),registrations=[],calls=[],pressures=[1009.93,1000];let hook;
 const native=(channel,type,reference)=>{
  calls.push({channel,type,reference});
  const p=pressures[channel];
  if(hook)hook(channel,type);
  if(channel!==0&&channel!==1)return -9999;
  if(type===0)return p;
  if(type===2)return 26.27;
  if(type!==1||!(reference>0&&Number.isFinite(reference))||!(p>=300&&p<=1100))return -9999;
  return Math.round(44330*(1-Math.pow(p/reference,0.1903))*100)/100;
 };
 const c=vm.createContext({AnalogPin:{P0:100,P1:101,P2:102},Button:{A:1,B:2,AB:3},__bmp280:native,
  input:{onButtonPressed:(button,body)=>{registrations.push(button);handlers.set(button,body);}}});
 vm.runInContext(neo,c);
 vm.runInContext(compile(source.replace(pattern,'function readBMP280Shim(channel: number, dataType: number, reference: number): number { return __bmp280(channel, dataType, reference); }')),c);
 return {api:c.ezmaker,handlers,registrations,calls,pressures,press:button=>{const fn=handlers.get(button);if(fn)fn();},setHook:fn=>{hook=fn;}};
}
const expected=(p,reference)=>Math.round(44330*(1-Math.pow(p/reference,0.1903))*100)/100;
{
 const h=harness();equal(h.api.readBMP280(0,1),expected(1009.93,1013.25));equal(h.registrations,[]);
 for(const bad of [-1,2,0.5,NaN,undefined])h.api.enableBMP280AltitudeButtons(bad);
 equal(h.registrations,[]);
 h.api.enableBMP280AltitudeButtons(0);equal(h.registrations,[1,2]);equal(h.calls.length,1);
 h.api.enableBMP280AltitudeButtons(0);equal(h.registrations,[1,2]);
 h.press(1);equal(h.api.readBMP280(0,1),0);
 equal(h.calls[h.calls.length-1].reference,1009.93);
 equal(h.api.readBMP280(0,0),1009.93);equal(h.api.readBMP280(0,2),26.27);
 // A calibration overrides the optional read-block reference until B restores it.
 equal(h.api.readBMP280(0,1,1020),0);equal(h.calls[h.calls.length-1].reference,1009.93);
 h.pressures[0]=1009.5;equal(h.api.readBMP280(0,1)>0,true);
 h.pressures[0]=1010.5;equal(h.api.readBMP280(0,1)<0,true);
 h.press(1);equal(h.api.readBMP280(0,1),0);
 h.press(2);equal(h.api.readBMP280(0,1),expected(1010.5,1013.25));
 equal(h.api.readBMP280(0,1,1020),expected(1010.5,1020));equal(h.calls[h.calls.length-1].reference,1020);
 // A+B is not claimed by the setup block.
 equal(h.handlers.has(3),false);
}
{
 const h=harness();h.api.enableBMP280AltitudeButtons(0);h.press(1);
 h.api.enableBMP280AltitudeButtons(1);equal(h.api.readBMP280(1,1),expected(1000,1013.25));h.press(1);
 equal(h.api.readBMP280(1,1),0);equal(h.api.readBMP280(0,1),0);equal(h.registrations,[1,2]);
 h.press(2);equal(h.api.readBMP280(1,1),expected(1000,1013.25));equal(h.api.readBMP280(0,1),0);
 h.api.enableBMP280AltitudeButtons(0);h.press(2);equal(h.api.readBMP280(0,1),expected(1009.93,1013.25));
}
for(const failure of [-9999,0,NaN,Infinity,299.99,1100.01]){
 const h=harness();h.api.enableBMP280AltitudeButtons(0);h.press(1);
 h.pressures[0]=failure;h.press(1);const before=h.calls.length;
 equal(h.api.readBMP280(0,1),-9999);equal(h.calls.length,before);
 equal(h.api.readBMP280(1,1),expected(1000,1013.25));equal(h.api.readBMP280(0,2),26.27);
 h.pressures[0]=1009.93;h.press(1);equal(h.api.readBMP280(0,1),0);
 h.pressures[0]=failure;h.press(1);h.press(2);h.pressures[0]=1009.93;
 equal(h.api.readBMP280(0,1),expected(1009.93,1013.25));
}
// B or a channel change during native A sampling cancels the older A result.
for(const change of ['restore','channel','repeat-setup']){
 const h=harness();h.api.enableBMP280AltitudeButtons(0);let fired=false;
 h.setHook((channel,type)=>{if(channel===0&&type===0&&!fired){fired=true;
  if(change==='restore')h.press(2);else h.api.enableBMP280AltitudeButtons(change==='channel'?1:0);
 }});
 h.press(1);h.setHook(undefined);
 equal(fired,true);equal(h.api.readBMP280(0,1),expected(1009.93,1013.25));
 if(change==='channel'){h.press(1);equal(h.api.readBMP280(1,1),0);equal(h.api.readBMP280(0,1),expected(1009.93,1013.25));}
}
{
 const h=harness();h.api.enableBMP280AltitudeButtons(0);h.press(1);
 const fresh=harness();equal(fresh.api.readBMP280(0,1),expected(1009.93,1013.25));equal(fresh.registrations,[]);
}
fs.mkdirSync(path.join(root,'.dev'),{recursive:true});
fs.writeFileSync(path.join(root,'.dev/bmp280-altitude-test-results.json'),JSON.stringify({recordedAt:new Date().toISOString(),checks,result:'pass',
 scope:'Actual TS handlers: opt-in, A zero/B restore, reference precedence, per-channel state, invalid channels, failure/recovery and in-flight cancellation',physicalButtonsValidated:false},null,2)+'\n');
console.log(`PASS: ${checks} BMP280 relative-altitude/button/state/recovery/race checks.`);
module.exports={checks};
