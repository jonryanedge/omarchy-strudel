import { play, stop } from '../src/playback.mjs';
import { readFileSync } from 'node:fs';
import * as webaudio from '@strudel/webaudio';

const duration = parseInt(process.argv[2] || '60', 10);

const t0 = Date.now();
function ts() {
  return `[${((Date.now() - t0) / 1000).toFixed(1)}s]`;
}

// Log every console.warn/error with a timestamp
const origWarn = console.warn;
console.warn = (...args) => origWarn(ts(), ...args);
const origError = console.error;
console.error = (...args) => origError(ts(), ...args);

const code = readFileSync('songs/coastline.js', 'utf-8');

console.log(ts(), 'Starting playback (includes sample preloading)...');
await play(code);
console.log(ts(), `Playing for ${duration}s. Listen for choppiness...`);

// Periodic health check
const ctx = webaudio.getAudioContext();
const memTimer = setInterval(() => {
  const mem = process.memoryUsage();
  console.log(
    ts(),
    `health: rss=${(mem.rss / 1024 / 1024).toFixed(0)}MB heap=${(mem.heapUsed / 1024 / 1024).toFixed(0)}MB ctx=${ctx.state}`
  );
}, 5000);

setTimeout(() => {
  clearInterval(memTimer);
  stop();
  console.log(ts(), `Done. Played ${duration}s total.`);
  process.exit(0);
}, duration * 1000);

process.on('SIGINT', () => {
  clearInterval(memTimer);
  stop();
  console.log(ts(), 'Interrupted.');
  process.exit(0);
});
