// Publication checks against exact filesystem names, including on Windows.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const config=JSON.parse(fs.readFileSync(path.join(root,'pxt.json'),'utf8'));
let checks=0;
function check(value,message){assert(value,message);checks++;}
check(config.public===true,'The root extension must set public: true');
check(/^\d+\.\d+\.\d+$/.test(config.version),'Expected a three-part release version');
const files=[...config.files,...config.testFiles];
check(new Set(files).size===files.length,'Duplicate manifest paths');
check(config.testFiles.includes('test.ts'),'Missing test.ts in testFiles');
for(const file of files){
    check(!path.isAbsolute(file)&&!file.split('/').some(part=>part==='..'||part.startsWith('.'))&&!file.startsWith('_private/'),file+': unexpected publication path');
    let current=root;
    for(const part of file.split('/')){
        check(fs.readdirSync(current).includes(part),file+': filename case or extension mismatch');
        current=path.join(current,part);
    }
    check(fs.statSync(current).isFile(),file+': expected a file');
}
const source=fs.readFileSync(path.join(root,'custom.ts'),'utf8');
const categories=[...new Set([...source.matchAll(/subcategory="([^"]+)"/g)].map(match=>match[1]))].sort();
check(JSON.stringify(categories)===JSON.stringify(['Data Transmission','NeoPixel','Sensors']),'Unexpected toolbox subcategories');
const ko=JSON.parse(fs.readFileSync(path.join(root,'_locales/ko/pxt-ezmakershield-microbit-strings.json'),'utf8'));
for(const [name,translated] of Object.entries({Sensors:'센서',NeoPixel:'네오픽셀','Data Transmission':'데이터전송'}))
    check(ko['{id:subcategory}'+name]===translated,name+': missing Korean category');
const result={recordedAt:new Date().toISOString(),checks,result:'pass',version:config.version,manifestFiles:files.length,subcategories:categories};
fs.mkdirSync(path.join(root,'.dev'),{recursive:true});
fs.writeFileSync(path.join(root,'.dev/approval-publication-check.json'),JSON.stringify(result,null,2)+'\n');
console.log(`PASS: ${checks} publication/manifest-path/localization checks (${files.length} files, public: true).`);
