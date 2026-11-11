const fs=require('node:fs'),path=require('node:path');
const {spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
const steps=[
    ['scripts/check-approval.cjs'],
    ['scripts/check-basic.cjs'],
    ['scripts/check-data-transmission.cjs'],
    ['scripts/check-bmp280.cjs'],
    ['scripts/check-temperature.cjs'],
    ['scripts/check-dht11.cjs'],
    ['scripts/check-neopixel.cjs'],
    ['scripts/makecode.cjs','check','--suite'],
    ['scripts/check-suite.cjs']
];
const results=[];
for(const args of steps){
    const start=Date.now();
    const result=spawnSync(process.execPath,args,{cwd:root,shell:false,windowsHide:true,stdio:'inherit'});
    results.push({args,exitCode:result.status,elapsedMs:Date.now()-start});
    if(result.error||result.status!==0){
        if(result.error)console.error(result.error.message);
        process.exitCode=1;break;
    }
}
fs.mkdirSync(path.join(root,'.dev'),{recursive:true});
fs.writeFileSync(path.join(root,'.dev/test-run.json'),JSON.stringify({recordedAt:new Date().toISOString(),result:process.exitCode?'fail':'pass',steps:results},null,2)+'\n');
if(!process.exitCode)console.log(`PASS: all ${steps.length} publication/regression/compilation/simulator steps completed. Physical module tests remain separate.`);
