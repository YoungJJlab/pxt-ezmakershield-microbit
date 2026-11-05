// Validate the actual public TypeScript wrapper, then compile/run the production native driver.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),os=require('node:os');
const {spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');require('pxt-core');
const relative=require('./check-bmp280-altitude.cjs');
let checks=0;const calls=[];let nativeResult=-12.34;
const compile=s=>ts.transpile(s,{target:ts.ScriptTarget.ES5,module:ts.ModuleKind.None});
const actual=fs.readFileSync(path.join(root,'custom.ts'),'utf8');
const pattern=/function readBMP280Shim\(channel: number, dataType: number, reference: number\): number \{\s*return -9999;\s*\}/;
assert(pattern.test(actual),'Native shim seam missing');
function context(source){
 const c=vm.createContext({AnalogPin:{P0:100,P1:101,P2:102},__bmp280:(channel,type,reference)=>{calls.push({channel,type,reference});return nativeResult;}});
 vm.runInContext(compile(fs.readFileSync(path.join(root,'pxt_modules/neopixel/neopixel.ts'),'utf8')),c);
 vm.runInContext(compile(source),c);return c.ezmaker;
}
const api=context(actual.replace(pattern,'function readBMP280Shim(channel: number, dataType: number, reference: number): number { return __bmp280(channel, dataType, reference); }'));
function equal(a,b){assert.deepStrictEqual(a,b);checks++;}
for(const channel of [0,1])for(const type of [0,1,2]){
 calls.length=0;equal(api.readBMP280(channel,type),-12.34);equal(calls,[{channel,type,reference:1013.25}]);
 calls.length=0;equal(api.readBMP280(channel,type,1000),-12.34);equal(calls,[{channel,type,reference:1000}]);
}
// Native validation rejects these; the wrapper must preserve the supplied values and error sentinel.
nativeResult=-9999;
for(const [channel,type,reference]of [[-1,0,1013.25],[2,0,1013.25],[0.5,0,1013.25],[NaN,0,1013.25],[0,-1,1013.25],[0,3,1013.25],[0,NaN,1013.25],
 [0,1,0],[0,1,-1],[0,1,NaN],[0,1,Infinity],[0,1,-Infinity]]){
 calls.length=0;equal(api.readBMP280(channel,type,reference),-9999);equal(calls,[{channel,type,reference}]);
}
const simulator=context(actual);
for(const ch of [0,1])for(const type of [0,1,2])equal(simulator.readBMP280(ch,type),-9999);
const candidates=[path.join(os.homedir(),'AppData/Local/Programs/DockerDesktop/resources/bin/docker.exe'),path.join(process.env.ProgramFiles||'C:/Program Files','Docker/Docker/resources/bin/docker.exe')];
const docker=candidates.find(name=>fs.existsSync(name))||'docker';
const result=spawnSync(docker,['run','--rm','-v',root+':/src:ro','pext/yotta:update-yotta3','/bin/sh','-c',
 'g++ -std=c++11 -Wall -Wextra -Werror -fsanitize=undefined -fno-sanitize-recover=undefined -I/src /src/scripts/tests/bmp280.cpp -o /tmp/ezmaker-bmp280-test && /tmp/ezmaker-bmp280-test'],{cwd:root,shell:false,windowsHide:true,encoding:'utf8'});
if(result.error||result.status!==0){console.error(result.error||result.stdout+result.stderr);process.exit(1);}
const native=Number((result.stdout.match(/BMP280_NATIVE_CHECKS=(\d+)/)||[])[1]);assert(native>0,result.stdout);
fs.mkdirSync(path.join(root,'.dev'),{recursive:true});
fs.writeFileSync(path.join(root,'.dev/bmp280-test-results.json'),JSON.stringify({recordedAt:new Date().toISOString(),checks:checks+native+relative.checks,wrapperChecks:checks,nativeChecks:native,relativeAltitudeChecks:relative.checks,result:'pass',
 oracle:'Bosch fixed-point-temperature/64-bit-pressure equations, independent of the production floating-point driver; undefined-behavior sanitizer enabled',physicalSensorValidated:false},null,2)+'\n');
console.log('PASS: '+checks+' BMP280 TypeScript wrapper/simulator checks; '+native+' production native compensation/register/address/error/recovery/lock checks.');
