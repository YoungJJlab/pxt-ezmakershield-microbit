// Execute the PXT-compiled test.ts with the real micro:bit simulator board model.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const test=fs.readFileSync(path.join(root,'test.ts'),'utf8');
assert.equal(test,fs.readFileSync(path.join(root,'projects/ezmaker-suite-test/main.ts'),'utf8'),'Run check:suite to refresh the generated runner.');
const apis=[...fs.readFileSync(path.join(root,'custom.ts'),'utf8').matchAll(/export function (\w+)\(/g)].map(m=>m[1]);
assert.equal(apis.length,27);
for(const name of apis)assert(new RegExp('ezmaker\\.'+name+'\\(').test(test),'test.ts omits '+name);
let code=fs.readFileSync(path.join(root,'projects/ezmaker-suite-test/built/debug/binary.js'),'utf8');
for(const name of apis){
    const pattern=new RegExp('function ezmaker_'+name+'__P\\d+\\(s\\) \\{');
    assert(pattern.test(code),'Compiled suite omitted '+name);
    // Observe first entry only. No function implementation or I/O shim changes.
    code=code.replace(pattern,header=>header+'\nif(s.pc===0)__apiCalled("'+name+'");');
}
const sources=['pxt-core/built/pxtsim.js','pxt-microbit/built/common-sim.js','pxt-microbit/built/sim.js']
    .map(name=>({name,text:fs.readFileSync(require.resolve(name),'utf8')}));
async function profile(version,adc){
    const called=new Set(),serial=[];
    const context=vm.createContext({console,setTimeout,clearTimeout,setInterval,clearInterval,performance,TextDecoder,TextEncoder,
        __apiCalled:name=>called.add(name)});
    for(const source of sources)vm.runInContext(source.text,context,{filename:source.name,timeout:5000});
    const sim=context.pxsim;sim.Runtime.messagePosted=()=>{};
    const runtime=new sim.Runtime({type:'run',code});
    runtime.board.hardwareVersion=version;
    for(const pin of [100,101,102])sim.getPin(pin).value=adc;
    const write=runtime.board.writeSerial.bind(runtime.board);
    runtime.board.writeSerial=text=>{serial.push(text);write(text);};
    const cleanup=()=>{
        // No SVG view is created in this headless run; detach its absent view.
        runtime.board.viewHost={removeEventListeners:()=>{}};
        runtime.kill();
    };
    await new Promise((resolve,reject)=>{
        const deadline=setTimeout(()=>{cleanup();reject(new Error('Suite did not finish within 10 seconds'));},10000);
        runtime.errorHandler=error=>{clearTimeout(deadline);cleanup();reject(error);};
        runtime.run(()=>{
            clearTimeout(deadline);
            try{
                assert(serial.join('').includes('EZMAKER TEST PASS'),'Missing PASS marker: '+serial.join(''));
                assert(serial.join('').includes('0,1,-2.5\r\n'),'Sensor CSV record must have exact separators and CRLF, without padding');
                assert.deepEqual([...called].sort(),[...apis].sort(),'Every public API must execute');
                cleanup();resolve();
            }catch(error){cleanup();reject(error);}
        });
    });
    const result={version,adc,publicApisExecuted:called.size,serialChecks:Number((serial.join('').match(/checks:(\d+)/)||[])[1]),result:'pass'};
    assert.equal(result.serialChecks,66);
    console.log(`PASS: actual micro:bit simulator V${version}, ADC ${adc}, ${called.size}/27 APIs executed, ${result.serialChecks} assertions and exact CSV record, finite completion.`);
    return result;
}
(async()=>{
    const profiles=[];
    for(const version of [1,2])for(const adc of [0,512,1023])profiles.push(await profile(version,adc));
    fs.mkdirSync(path.join(root,'.dev'),{recursive:true});
    fs.writeFileSync(path.join(root,'.dev/full-suite-simulator.json'),JSON.stringify({recordedAt:new Date().toISOString(),profiles,assertions:profiles.length*66,exactCsvRecordProfiles:profiles.length,hardwareEquivalent:false},null,2)+'\n');
})().catch(error=>{console.error(error);process.exitCode=1;});
