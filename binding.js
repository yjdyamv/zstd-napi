const fs = require('fs');
const path = require('path');

function isMusl() {
  try {
    const { execSync } = require('child_process');
    const out = execSync('ldd --version 2>&1', { timeout: 3000 }).toString();
    return out.includes('musl');
  } catch {
    return false;
  }
}

const buildType =
  process.config.target_defaults?.default_configuration ?? 'Release';

const archMap = { x64: 'x64', arm64: 'arm64', arm: 'arm', ia32: 'ia32' };
const mappedArch = archMap[process.arch] || process.arch;
let platformKey = `${process.platform}-${mappedArch}`;
if (isMusl()) platformKey += '-musl';

const platformPath = path.join(
  __dirname,
  'build',
  buildType,
  platformKey,
  'binding.node',
);
const defaultPath = path.join(__dirname, 'build', buildType, 'binding.node');

if (fs.existsSync(platformPath)) {
  module.exports = require(platformPath);
} else if (fs.existsSync(defaultPath)) {
  module.exports = require(defaultPath);
} else {
  throw new Error(
    `zstd-napi native binding not found for platform ${platformKey}`,
  );
}
