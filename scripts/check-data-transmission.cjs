// Execute the real TypeScript implementation with a serial wire recorder.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');require('pxt-core');
const calls=[];
const context=vm.createContext({AnalogPin:{P0:100,P1:101,P2:102},BaudRate:{BaudRate115200:115200},
    serial:{setBaudRate:baud=>calls.push(['baud',baud]),writeString:text=>calls.push(['text',text])}});
const compile=source=>ts.transpile(source,{target:ts.ScriptTarget.ES5,module:ts.ModuleKind.None});
vm.runInContext(compile(fs.readFileSync(path.join(root,'pxt_modules/neopixel/neopixel.ts'),'utf8')),context);
vm.runInContext(compile(fs.readFileSync(path.join(root,'custom.ts'),'utf8')),context);
const send=context.ezmaker.sendSensorData;
let checks=0;
const equal=(a,b)=>{assert.deepStrictEqual(a,b);checks++;};
const vectors=[
    {values:[],wire:'\r\n'},
    {values:[0],wire:'0\r\n'},
    {values:[10,20.5,-3],wire:'10,20.5,-3\r\n'},
    {values:[10,20.5,-3,40,50],wire:'10,20.5,-3,40,50\r\n'},
    {values:[-999,-273,-4],wire:'-999,-273,-4\r\n'},
    {values:[0.125,-0.5,1023],wire:'0.125,-0.5,1023\r\n'},
    {values:new Array(64).fill(0),wire:new Array(64).fill('0').join(',')+'\r\n'},
    {values:Array.from({length:128},(_,i)=>i),wire:Array.from({length:128},(_,i)=>String(i)).join(',')+'\r\n'}
];
for(const vector of vectors){
    calls.length=0;
    const before=vector.values.slice();send(vector.values);
    equal(calls,[['baud',115200],['text',vector.wire]]);
    equal(typeof calls[1][1],'string');
    equal(vector.values,before);
    equal(calls[1][1].endsWith('\r\n'),true);
}
for(const value of [undefined,null]){calls.length=0;send(value);equal(calls,[]);}
// Reuse one user list: growing/shrinking must change the next frame immediately.
const values=[1,2];calls.length=0;send(values);values.push(3);send(values);values.splice(0,2);send(values);
equal(calls,[['baud',115200],['text','1,2\r\n'],['baud',115200],['text','1,2,3\r\n'],['baud',115200],['text','3\r\n']]);
fs.mkdirSync(path.join(root,'.dev'),{recursive:true});
fs.writeFileSync(path.join(root,'.dev/data-transmission-test-results.json'),JSON.stringify({recordedAt:new Date().toISOString(),checks,result:'pass',physicalSerialValidated:false},null,2)+'\n');
console.log(`PASS: ${checks} actual sensor-data CSV/baud/order/line-ending/variable-length checks.`);
