import '../src/polyfill.mjs';
import { readFileSync } from 'node:fs';
import * as core from '@strudel/core';
import * as webaudio from '@strudel/webaudio';
import * as tonal from '@strudel/tonal';
import { transpiler } from '@strudel/transpiler';
import * as mini from '@strudel/mini';
import { registerSoundfonts } from '@strudel/soundfonts';

mini.miniAllStrings();
Object.assign(globalThis, core);
Object.assign(globalThis, webaudio);
Object.assign(globalThis, tonal);
Object.assign(globalThis, mini);
webaudio.registerSynthSounds();
registerSoundfonts();
tonal.registerVoicings();

const ctx = webaudio.getAudioContext();
await ctx.resume();

try { await webaudio.initAudio({ disableWorklets: true }); } catch(e) { console.warn('initAudio failed:', e.message); }

const { scheduler, evaluate } = core.repl({
  defaultOutput: webaudio.webaudioOutput,
  getTime: () => ctx.currentTime,
  transpiler,
});

const code = readFileSync('songs/coastline.js', 'utf-8');
const sampleMatch = code.match(/samples\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/);
if (sampleMatch) {
  console.log('Preloading samples from ' + sampleMatch[1] + ' ...');
  await webaudio.samples(sampleMatch[1]);
  console.log('Samples loaded.');
}

console.log('Evaluating coastline.js...');
const pattern = await evaluate(code);
scheduler.start();
console.log('Playing! Will stop after 10 seconds...');
setTimeout(() => { scheduler.stop(); console.log('Step 4: PASS'); process.exit(0); }, 10000);
