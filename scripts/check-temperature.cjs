// Compile and execute the actual portable decoder in a local Docker container.
// Check the TypeScript API/cache before testing the native protocol decoder.
require('./check-temperature-wrapper.cjs');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { spawnSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const candidates = [
    path.join(os.homedir(), 'AppData/Local/Programs/DockerDesktop/resources/bin/docker.exe'),
    path.join(process.env.ProgramFiles || 'C:/Program Files', 'Docker/Docker/resources/bin/docker.exe')
];
const docker = candidates.find(file => fs.existsSync(file)) || 'docker';
const result = spawnSync(docker, ['run', '--rm', '-v', root + ':/src:ro',
    'pext/yotta:update-yotta3', '/bin/sh', '-c',
    'g++ -std=c++11 -Wall -Wextra -Werror -I/src /src/scripts/tests/temperature.cpp -o /tmp/ezmaker-temperature-test && /tmp/ezmaker-temperature-test'],
    { cwd: root, shell: false, windowsHide: true, stdio: 'inherit' });
if (result.error) console.error(result.error.message);
process.exitCode = result.status === 0 && !result.error ? 0 : 1;
