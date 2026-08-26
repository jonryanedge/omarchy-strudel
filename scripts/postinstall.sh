#!/bin/bash
# postinstall.sh — Fix CJS/ESM interop issues for Node.js
set -euo pipefail

# Fix @kabelsalat/web: has "type":"module" but "main" points to CJS bundle
PKG_DIR="node_modules/@kabelsalat/web"
if [[ -d "$PKG_DIR" ]] && ! grep -q '"exports"' "${PKG_DIR}/package.json" 2>/dev/null; then
  node -e "
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('${PKG_DIR}/package.json', 'utf-8'));
pkg.exports = { '.': { 'import': './dist/index.mjs', 'require': './dist/index.js' } };
fs.writeFileSync('${PKG_DIR}/package.json', JSON.stringify(pkg, null, 2) + '\n');
console.log('Patched @kabelsalat/web exports field');
"
fi

# Fix soundfont2: CJS package, but sfumato imports named exports from it.
# Create an ESM wrapper and patch package.json exports + type.
PKG_DIR="node_modules/soundfont2"
if [[ -d "$PKG_DIR" ]]; then
  cat > "${PKG_DIR}/esm-wrapper.mjs" <<'WRAPPER'
import sf2 from './lib/SoundFont2.node.js';
export const DEFAULT_GENERATOR_VALUES = sf2.DEFAULT_GENERATOR_VALUES;
export const SoundFont2 = sf2.SoundFont2;
export default sf2;
WRAPPER

  node -e "
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('${PKG_DIR}/package.json', 'utf-8'));
pkg.type = 'module';
pkg.exports = {
  '.': {
    'import': './esm-wrapper.mjs',
    'require': './lib/SoundFont2.node.js'
  }
};
fs.writeFileSync('${PKG_DIR}/package.json', JSON.stringify(pkg, null, 2) + '\n');
console.log('Patched soundfont2 with ESM wrapper + type:module');
"
fi
