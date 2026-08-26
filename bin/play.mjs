import { play, stop } from '../src/playback.mjs';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const songPath = process.argv[2];
const duration = process.argv[3] ? parseInt(process.argv[3], 10) : null;

if (!songPath) {
  console.error('Usage: omarchy-strudel-play <song.js|song-name> [duration_seconds]');
  process.exit(1);
}

const code = readFileSync(songPath, 'utf-8');

console.log(`Playing: ${songPath}`);
console.log('Press Ctrl+C to stop...');

await play(code);

process.on('SIGINT', () => {
  stop();
  console.log('\nStopped.');
  process.exit(0);
});

if (duration) {
  setTimeout(() => {
    stop();
    console.log(`\nFinished after ${duration} seconds.`);
    process.exit(0);
  }, duration * 1000);
}
