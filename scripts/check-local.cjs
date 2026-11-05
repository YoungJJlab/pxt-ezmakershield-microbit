// Checks the running server's real filesystem API, not a GitHub cache.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '..');

async function main() {
    const state = JSON.parse(fs.readFileSync(path.join(root, '.dev', 'server.json'), 'utf8'));
    const get = async url => {
        const response = await fetch(state.origin + url, { headers: { authorization: state.token } });
        if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
        return response;
    };
    const index = await get('/index.html');
    if (!(await index.text()).includes('<html')) throw new Error('Editor HTML was not returned.');
    const list = await (await get('/api/list')).json();
    if (!list.pkgs.some(pkg => pkg.path === 'ezmaker-local-test')) throw new Error('Local test project is not listed.');
    const pkg = await (await get('/api/pkg/ezmaker-extension')).json();
    const manifest = JSON.parse(pkg.files.find(file => file.name === 'pxt.json').content);
    for (const name of manifest.files) {
        const file = pkg.files.find(file => file.name === name);
        if (!file || file.content !== fs.readFileSync(path.join(root, name), 'utf8')) {
            throw new Error('Local source differs from served source: ' + name);
        }
    }
    for (const name of ['core', 'neopixel', 'ws2812b']) {
        const pkg = await (await get('/api/pkg/ezmaker-' + name)).json();
        if (!pkg.files.some(file => file.name === 'pxt.json')) throw new Error('Dependency not served: ' + name);
    }
    for (const url of ['/pxtapp.js', '/target.js', '/simulator.html']) await get(url);
    const probeName = 'ezmaker-dev-probe-' + crypto.randomBytes(8).toString('hex');
    const probe = path.join(root, 'projects', probeName);
    fs.mkdirSync(probe);
    try {
        fs.writeFileSync(path.join(probe, 'pxt.json'), JSON.stringify({ name: 'freshness-probe', files: ['main.ts'] }));
        for (const value of ['// first read', '// changed on disk']) {
            fs.writeFileSync(path.join(probe, 'main.ts'), value);
            const pkg = await (await get('/api/pkg/' + probeName)).json();
            if (pkg.files.find(file => file.name === 'main.ts').content !== value) throw new Error('Source refresh check failed.');
        }
    } finally {
        fs.rmSync(path.join(probe, 'main.ts'), { force: true });
        fs.rmSync(path.join(probe, 'pxt.json'), { force: true });
        fs.rmdirSync(probe);
    }
    const extensionConfig = JSON.parse(pkg.files.find(file => file.name === 'pxt.json').content);
    const testProject = await (await get('/api/pkg/ezmaker-local-test')).json();
    const testConfig = JSON.parse(testProject.files.find(file => file.name === 'pxt.json').content);
    if (extensionConfig.dependencies.dstemp || testConfig.dependencies.dstemp) throw new Error('Obsolete dstemp dependency is still active.');
    console.log('PASS: editor, simulator assets, local test project, current TS/C++/Korean source, and all three local dependencies.');
    console.log('No GitHub publish/release is needed for source changes.');
    console.log('PASS: saving a file changed the next API response immediately (no stale source cache).');
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
