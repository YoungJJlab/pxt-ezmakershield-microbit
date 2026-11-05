// Small instruction model for the actual Cortex-M0 sender source. Models its
// branches, memory reads and GPIO pulse widths; not an electrical/CPU simulator.
const assert = require('node:assert/strict');
function transmit(source, data, legacy = false, poison = 255) {
    const code = [], labels = new Map();
    for (let line of source.split(/\r?\n/)) {
        line = line.replace(/\/\/.*$/, '').trim();
        if (!line) continue;
        if (line.endsWith(':')) labels.set(line.slice(0,-1),code.length);
        else if (!line.startsWith('.')) code.push(line);
    }
    const r = new Array(16).fill(0), saved = [], bits = [], reads = [];
    const base=0x2000, outset=0x5008, outclr=0x500c, mask=32;
    const words = new Map([[0x1008,0x1100],[0x1104,mask],[0x1110,outclr],[0x110c,outset]]);
    if (legacy) { r[0]=0x1000; r[1]=base; r[2]=data.length; }
    else { r[0]=base; r[1]=data.length; r[2]=mask; r[3]=outset; }
    let pc=labels.get(legacy?'neopixel_send_buffer_core':'ezmaker_neopixel_send_v1');
    assert.notEqual(pc,undefined);
    let z=false,n=false,c=false,v=false,cycles=0,high=false,rise=0,done=false,steps=0;
    const reg = text => text==='lr'?14:text==='pc'?15:Number(text.slice(1));
    const value = text => text.startsWith('#')?Number(text.slice(1)):r[reg(text)];
    const address = text => {
        const m=text.match(/^\[(r\d+)(?:,\s*(#[\dxabcdef]+))?\]$/i);
        assert(m,'Unsupported address: '+text);
        return (value(m[1])+(m[2]?value(m[2]):0))>>>0;
    };
    const flags = result => { z=(result>>>0)===0; n=!!(result&0x80000000); };
    while (!done) {
        assert(++steps<1000000,'Sender did not terminate');
        const line=code[pc++]; assert(line,'Execution left sender');
        const m=line.match(/^(\w+)(?:\s+(.*))?$/), op=m[1];
        const args=(m[2]||'').split(/,(?![^\[]*\])/).map(s=>s.trim());
        if (['b','beq','bne','bcc','ble'].includes(op)) {
            const take=op==='b'||(op==='beq'&&z)||(op==='bne'&&!z)||(op==='bcc'&&!c)||(op==='ble'&&(z||n!==v));
            cycles+=take?3:1;
            if (take) { assert(labels.has(args[0])); pc=labels.get(args[0]); }
        } else if (op==='push') {
            saved.push(...r.slice(4,8)); cycles+=6;
        } else if (op==='pop') {
            for(let i=7;i>=4;i--)r[i]=saved.pop(); cycles+=6; done=true;
        } else if (op==='bx') { cycles+=3; done=true;
        } else if (op==='mov'||op==='movs') {
            r[reg(args[0])]=value(args[1])>>>0; if(op==='movs')flags(r[reg(args[0])]); cycles++;
        } else if (op==='cmp'||op==='subs'||op==='adds') {
            const a=value(args[0])>>>0,b=value(args[1])>>>0;
            const result=op==='adds'?(a+b)>>>0:(a-b)>>>0;
            c=op==='adds'?a+b>0xffffffff:a>=b;
            v=op==='adds'?!!((~(a^b)&(a^result))&0x80000000):!!(((a^b)&(a^result))&0x80000000);
            flags(result); if(op!=='cmp')r[reg(args[0])]=result; cycles++;
        } else if (op==='tst') { flags(value(args[0])&value(args[1])); cycles++;
        } else if (op==='lsrs') {
            const a=value(args[1]),shift=value(args[2]); c=!!(a&(1<<(shift-1)));
            r[reg(args[0])]=a>>>shift; flags(r[reg(args[0])]); cycles++;
        } else if (op==='ldr') {
            const addr=address(args[1]); assert(words.has(addr),'Unexpected word read');
            r[reg(args[0])]=words.get(addr); cycles+=3;
        } else if (op==='ldrb') {
            const offset=address(args[1])-base; reads.push(offset);
            r[reg(args[0])]=offset>=0&&offset<data.length?data[offset]:poison; cycles+=3;
        } else if (op==='str') {
            const addr=address(args[1]); assert.equal(value(args[0]),mask); cycles+=2;
            if (addr===outset) { assert(!high); high=true; rise=cycles; }
            else { assert.equal(addr,outclr); if(high){bits.push(cycles-rise>7?1:0);high=false;} }
        } else if (op==='nop') cycles++;
        else throw new Error('Unsupported sender instruction: '+line);
    }
    assert(!high); assert.equal(bits.length%8,0);
    const bytes=[];
    for(let i=0;i<bits.length;i+=8) bytes.push(bits.slice(i,i+8).reduce((a,b)=>(a<<1)|b,0));
    return {bytes,reads,cycles,steps};
}
module.exports={transmit};
