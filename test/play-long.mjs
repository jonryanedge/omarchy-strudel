import '../src/polyfill.mjs';
import { readFileSync } from 'node:fs';
import * as core from '@strudel/core';
import * as webaudio from '@strudel/webaudio';
import * as tonal from '@strudel/tonal';
import { transpiler } from '@strudel/transpiler';
import * as mini from '@strudel/mini';
import { registerSoundfonts } from '@strudel/soundfonts';

const duration = parseInt(process.argv[2] || '60', 10);

const t0 = Date.now();
function ts() {
  return `[${((Date.now() - t0) / 1000).toFixed(1)}s]`;
}

mini.miniAllStrings();
Object.assign(globalThis, core);
Object.assign(globalThis, webaudio);
Object.assign(globalThis, tonal);
Object.assign(globalThis, mini);
webaudio.registerSynthSounds();
registerSoundfonts();
tonal.registerVoicings();

// Log every console.warn/error with a timestamp
const origWarn = console.warn;
console.warn = (...args) => origWarn(ts(), ...args);
const origError = console.error;
console.error = (...args) => origError(ts(), ...args);

const ctx = webaudio.getAudioContext();
await ctx.resume();

try {
  await webaudio.initAudio({ disableWorklets: true });
} catch (e) {
  console.warn('initAudio failed:', e.message);
}

const { scheduler, evaluate } = core.repl({
  defaultOutput: webaudio.webaudioOutput,
  getTime: () => ctx.currentTime,
  transpiler,
});

const code = readFileSync('songs/coastline.js', 'utf-8');

// Preload samples
const sampleMatch = code.match(/samples\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/);
if (sampleMatch) {
  console.log(ts(), 'Preloading samples from', sampleMatch[1]);
  await webaudio.samples(sampleMatch[1]);
  console.log(ts(), 'Samples loaded');
}

console.log(ts(), 'Evaluating coastline.js...');
await evaluate(code);
scheduler.start();
console.log(ts(), `Playing for ${duration}s. Listen for choppiness...`);

// Periodic health check: memory usage + audio context state
const memTimer = setInterval(() => {
  const mem = process.memoryUsage();
  console.log(
    ts(),
    `health: rss=${(mem.rss / 1024 / 1024).toFixed(0)}MB heap=${(mem.heapUsed / 1024 / 1024).toFixed(0)}MB ctx=${ctx.state}`
  );
}, 5000);

setTimeout(() => {
  clearInterval(memTimer);
  scheduler.stop();
  console.log(ts(), `Done. Played ${duration}s total.`);
  process.exit(0);
}, duration * 1000);

process.on('SIGINT', () => {
  clearInterval(memTimer);
  scheduler.stop();
  console.log(ts(), 'Interrupted.');
  process.exit(0);
});
