// Execute the real TypeScript implementation with a serial wire recorder.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');require('pxt-core');
const compile=source=>ts.transpile(source,{target:ts.ScriptTarget.ES5,module:ts.ModuleKind.None});
const sources=['pxt_modules/neopixel/neopixel.ts','custom.ts'].map(file=>compile(fs.readFileSync(path.join(root,file),'utf8')));
function board(route='USB'){
    const calls=[],packets=[],wire={baud:9600,route};
    const context=vm.createContext({AnalogPin:{P0:100,P1:101,P2:102},BaudRate:{BaudRate115200:115200},
        serial:{setBaudRate:baud=>{calls.push(['baud',baud]);wire.baud=baud;},
            writeString:text=>{calls.push(['text',text]);packets.push({baud:wire.baud,route:wire.route,text});}}});
    for(const source of sources)vm.runInContext(source,context);
    return {send:context.ezmaker.sendSensorData,calls,packets,wire,serial:context.serial};
}
let checks=0;
const equal=(a,b)=>{assert.deepStrictEqual(a,b);checks++;};
const b=board();
equal(b.calls,[]); // Merely importing the extension must not touch serial.
for(const value of [undefined,null]){b.send(value);equal(b.calls,[]);}
b.send([]);
equal(b.calls,[['baud',115200],['text','\r\n']]);
equal(b.packets,[{baud:115200,route:'USB',text:'\r\n'}]);
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
    b.calls.length=0;
    const before=vector.values.slice();b.send(vector.values);
    equal(b.calls,[['text',vector.wire]]);
    equal(typeof b.calls[0][1],'string');
    equal(vector.values,before);
    equal(b.packets[b.packets.length-1],{baud:115200,route:'USB',text:vector.wire});
}
for(const value of [undefined,null]){b.calls.length=0;b.send(value);equal(b.calls,[]);}
// Reuse one user list: growing/shrinking must change the next frame immediately.
const values=[1,2];b.calls.length=0;b.send(values);values.push(3);b.send(values);values.splice(0,2);b.send(values);
equal(b.calls,[['text','1,2\r\n'],['text','1,2,3\r\n'],['text','3\r\n']]);
// Repeated calls neither reconfigure serial nor lose, merge or pad records.
b.calls.length=0;
for(let i=0;i<100;i++)b.send([12345,67890]);
equal(b.calls.length,100);
equal(b.calls.every(call=>call[0]==='text'&&call[1]==='12345,67890\r\n'),true);
// Respect routing and explicit user speed changes made after first use.
b.calls.length=0;b.wire.route='P14/P15';b.serial.setBaudRate(9600);b.send([3,4]);
equal(b.calls,[['baud',9600],['text','3,4\r\n']]);
equal(b.packets[b.packets.length-1],{baud:9600,route:'P14/P15',text:'3,4\r\n'});
b.calls.length=0;b.serial.setBaudRate(115200);b.send([5,6]);
equal(b.calls,[['baud',115200],['text','5,6\r\n']]);
// A fresh program initializes again, including on a pre-selected UART route.
const reboot=board('P14/P15');reboot.send([7,8]);reboot.send([9]);
equal(reboot.calls,[['baud',115200],['text','7,8\r\n'],['text','9\r\n']]);
equal(reboot.packets[0],{baud:115200,route:'P14/P15',text:'7,8\r\n'});
fs.mkdirSync(path.join(root,'.dev'),{recursive:true});
fs.writeFileSync(path.join(root,'.dev/data-transmission-test-results.json'),JSON.stringify({recordedAt:new Date().toISOString(),checks,result:'pass',physicalSerialValidated:false},null,2)+'\n');
console.log(`PASS: ${checks} actual sensor-data first-use baud/CSV/routing/restart/variable-length checks.`);
