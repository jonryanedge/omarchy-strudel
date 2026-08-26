#!/bin/bash
# test-playback.sh — Test the Strudel playback engine step by step
set -euo pipefail

cd "$(dirname "$0")/.."

echo "=== Step 0: Check node_modules ==="
if [[ ! -d node_modules ]]; then
  echo "node_modules missing. Run: npm install"
  exit 1
fi

echo ""
echo "=== Step 1: Test node-web-audio-api produces sound ==="
echo "You should hear a 1-second tone..."
node --input-type=module -e "
import { AudioContext } from 'node-web-audio-api';
const ctx = new AudioContext();
const osc = ctx.createOscillator();
const gain = ctx.createGain();
gain.gain.value = 0.3;
osc.connect(gain);
gain.connect(ctx.destination);
osc.start();
setTimeout(() => { osc.stop(); ctx.close(); console.log('Step 1: PASS'); process.exit(0); }, 1000);
" || { echo "Step 1: FAIL"; exit 1; }

echo ""
echo "=== Step 2: Test @strudel/webaudio getAudioContext ==="
node --input-type=module -e "
import { getAudioContext } from '@strudel/webaudio';
const ctx = getAudioContext();
console.log('ctx state:', ctx.state);
await ctx.resume();
console.log('ctx state after resume:', ctx.state);
console.log('Step 2: PASS');
process.exit(0);
" || { echo "Step 2: FAIL"; exit 1; }

echo ""
echo "=== Step 3: Test a simple Strudel pattern ==="
echo "You should hear a 3-second arpeggio..."
node --input-type=module -e "
import { repl, note } from '@strudel/core';
import { getAudioContext, webaudioOutput } from '@strudel/webaudio';
const ctx = getAudioContext();
await ctx.resume();
const { scheduler } = repl({ defaultOutput: webaudioOutput, getTime: () => ctx.currentTime });
const p = note('c3 e3 g3 c4').s('sawtooth');
scheduler.setPattern(p);
scheduler.start();
setTimeout(() => { scheduler.stop(); console.log('Step 3: PASS'); process.exit(0); }, 3000);
" || { echo "Step 3: FAIL"; exit 1; }

echo ""
echo "=== Step 4: Test the coastline song (samples + tonal) ==="
echo "You should hear the beginning of coastline by eddyflux..."
echo "(This fetches samples from GitHub — may take a few seconds to start)"
timeout 15 node --input-type=module -e "
import { readFileSync } from 'node:fs';
import { repl } from '@strudel/core';
import { getAudioContext, webaudioOutput, samples } from '@strudel/webaudio';
const ctx = getAudioContext();
await ctx.resume();
const { scheduler } = repl({ defaultOutput: webaudioOutput, getTime: () => ctx.currentTime });
const code = readFileSync('songs/coastline.js', 'utf-8');
console.log('Evaluating coastline.js...');
try {
  const pattern = await evaluate(code);
  scheduler.setPattern(pattern);
  scheduler.start();
  console.log('Playing! Will stop after 10 seconds...');
  setTimeout(() => { scheduler.stop(); console.log('Step 4: PASS'); process.exit(0); }, 10000);
} catch(e) {
  console.error('Step 4: FAIL -', e.message);
  process.exit(1);
}
function evaluate(code) {
  // The repl evaluate may not be directly available, try manual approach
  return import('@strudel/core').then(core => {
    if (core.evaluate) return core.evaluate(code);
    throw new Error('No evaluate function found in @strudel/core');
  });
}
" || { echo "Step 4: FAIL (or timed out)"; exit 1; }

echo ""
echo "=== All steps passed! ==="
echo "The playback engine is working. Next: test the daemon."
