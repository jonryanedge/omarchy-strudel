#!/bin/bash
# test-playback.sh — Test the Strudel playback engine step by step
# All output is tee'd to test/test-results.txt for syncing back via git
set -euo pipefail

cd "$(dirname "$0")/.."

RESULTS="test/test-results.txt"

echo "=== omarchy-strudel playback test ===" > "$RESULTS"
echo "Date: $(date -u '+%Y-%m-%dT%H:%M:%SZ')" >> "$RESULTS"
echo "Node: $(node --version 2>/dev/null || echo 'not found')" >> "$RESULTS"
echo "npm: $(npm --version 2>/dev/null || echo 'not found')" >> "$RESULTS"
echo "" >> "$RESULTS"

echo "=== Step 0: Check node_modules ===" | tee -a "$RESULTS"
if [[ ! -d node_modules ]]; then
  echo "node_modules missing. Run: npm install" | tee -a "$RESULTS"
  echo "RESULT: FAIL at step 0" >> "$RESULTS"
  exit 1
fi
echo "node_modules present" | tee -a "$RESULTS"
echo "" >> "$RESULTS"

echo "=== Step 1: Test node-web-audio-api produces sound ===" | tee -a "$RESULTS"
echo "You should hear a 1-second tone..." | tee -a "$RESULTS"
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
" 2>&1 | tee -a "$RESULTS"
if [[ ${PIPESTATUS[0]} -ne 0 ]]; then
  echo "Step 1: FAIL" | tee -a "$RESULTS"
  echo "RESULT: FAIL at step 1" >> "$RESULTS"
  exit 1
fi
echo "" >> "$RESULTS"

echo "=== Step 2: Test @strudel/webaudio with polyfill ===" | tee -a "$RESULTS"
node --input-type=module -e "
import './src/polyfill.mjs';
import { getAudioContext } from '@strudel/webaudio';
console.log('imported getAudioContext:', typeof getAudioContext);
const ctx = getAudioContext();
console.log('got ctx:', typeof ctx);
console.log('ctx state:', ctx.state);
await ctx.resume();
console.log('ctx state after resume:', ctx.state);
console.log('Step 2: PASS');
process.exit(0);
" 2>&1 | tee -a "$RESULTS"
if [[ ${PIPESTATUS[0]} -ne 0 ]]; then
  echo "Step 2: FAIL" | tee -a "$RESULTS"
  echo "RESULT: FAIL at step 2" >> "$RESULTS"
  exit 1
fi
echo "" >> "$RESULTS"

echo "=== Step 3: Test a simple Strudel pattern ===" | tee -a "$RESULTS"
echo "You should hear a 3-second arpeggio..." | tee -a "$RESULTS"
node --input-type=module -e "
import './src/polyfill.mjs';
import { repl, note } from '@strudel/core';
import { getAudioContext, webaudioOutput } from '@strudel/webaudio';
const ctx = getAudioContext();
await ctx.resume();
const { scheduler } = repl({ defaultOutput: webaudioOutput, getTime: () => ctx.currentTime });
const p = note('c3 e3 g3 c4').s('sawtooth');
scheduler.setPattern(p);
scheduler.start();
setTimeout(() => { scheduler.stop(); console.log('Step 3: PASS'); process.exit(0); }, 3000);
" 2>&1 | tee -a "$RESULTS"
if [[ ${PIPESTATUS[0]} -ne 0 ]]; then
  echo "Step 3: FAIL" | tee -a "$RESULTS"
  echo "RESULT: FAIL at step 3" >> "$RESULTS"
  exit 1
fi
echo "" >> "$RESULTS"

echo "=== Step 4: Test the coastline song (samples + tonal) ===" | tee -a "$RESULTS"
echo "You should hear the beginning of coastline by eddyflux..." | tee -a "$RESULTS"
echo "(This fetches samples from GitHub — may take a few seconds to start)" | tee -a "$RESULTS"
timeout 30 node --input-type=module -e "
import './src/polyfill.mjs';
import { readFileSync } from 'node:fs';
import * as core from '@strudel/core';
import * as webaudio from '@strudel/webaudio';
import * as tonal from '@strudel/tonal';
Object.assign(globalThis, core);
Object.assign(globalThis, webaudio);
Object.assign(globalThis, tonal);
webaudio.registerSynthSounds();
tonal.registerVoicings();
const ctx = webaudio.getAudioContext();
await ctx.resume();
const { scheduler } = core.repl({ defaultOutput: webaudio.webaudioOutput, getTime: () => ctx.currentTime });
const code = readFileSync('songs/coastline.js', 'utf-8');
console.log('Loading samples from github:eddyflux/crate ...');
await webaudio.samples('github:eddyflux/crate');
console.log('Samples loaded. Evaluating pattern...');
const pattern = await eval(code);
scheduler.setPattern(pattern);
scheduler.start();
console.log('Playing! Will stop after 10 seconds...');
setTimeout(() => { scheduler.stop(); console.log('Step 4: PASS'); process.exit(0); }, 10000);
" 2>&1 | tee -a "$RESULTS"
if [[ ${PIPESTATUS[0]} -ne 0 ]]; then
  echo "Step 4: FAIL (or timed out)" | tee -a "$RESULTS"
  echo "RESULT: FAIL at step 4" >> "$RESULTS"
  exit 1
fi
echo "" >> "$RESULTS"

echo "=== All steps passed! ===" | tee -a "$RESULTS"
echo "RESULT: ALL PASS" >> "$RESULTS"
echo ""
echo "Test results saved to test/test-results.txt"
echo "To sync back: git add test/test-results.txt && git commit -m 'Test results' && git push"
