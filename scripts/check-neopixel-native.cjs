const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {transmit}=require('./neopixel-arm-model.cjs');
const root=path.resolve(__dirname,'..');
const legacy=fs.readFileSync(path.join(root,'pxt_modules/core/sendbuffer.s'),'utf8');
const fixed=fs.readFileSync(path.join(root,'neopixel-sendbuffer.s'),'utf8');
let checks=0;
const equal=(a,b)=>{assert.deepStrictEqual(a,b);checks++;};
for(const length of [0,1,2,3,6,21,36,37]) {
    for(const seed of [0,1,127,255]) {
        const payload=Array.from({length},(_,i)=>(seed+i*73)&255);
        for(const poison of [0,128,255]) {
            const result=transmit(fixed,payload,false,poison);
            equal(result.bytes,payload);
            equal(result.reads.every(offset=>offset>=0&&offset<length),true);
        }
        if(length>0) {
            const result=transmit(legacy,payload,true,255);
            equal(result.bytes,[...payload,255]);
            equal(result.reads.filter(offset=>offset===length).length,8);
        }
    }
}
console.log(`PASS: ${checks} source-instruction checks: exact byte stream, empty buffers, every read in bounds, and reproduction of legacy n+1-byte reads.`);
console.log('Instruction/pulse model only: actual board waveform and LEDs require hardware retest.');
