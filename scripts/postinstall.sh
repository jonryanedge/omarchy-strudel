#!/bin/bash
# postinstall.sh — Fix @kabelsalat/web ESM resolution for Node.js
# The package has "type":"module" but "main" points to a CJS bundle.
# This patch adds an "exports" field so Node resolves to the .mjs file.
set -euo pipefail

PKG_DIR="node_modules/@kabelsalat/web"

if [[ ! -d "$PKG_DIR" ]]; then
  exit 0
fi

PKG_JSON="${PKG_DIR}/package.json"

if grep -q '"exports"' "$PKG_JSON" 2>/dev/null; then
  exit 0
fi

node -e "
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('$PKG_JSON', 'utf-8'));
pkg.exports = {
  '.': {
    'import': './dist/index.mjs',
    'require': './dist/index.js'
  }
};
fs.writeFileSync('$PKG_JSON', JSON.stringify(pkg, null, 2) + '\n');
console.log('Patched @kabelsalat/web exports field');
"
