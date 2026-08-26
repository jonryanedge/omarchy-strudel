import { repl, transpiler } from '@strudel/core';
import { getAudioContext, webaudioOutput, samples as loadSamples, registerSynthSounds } from '@strudel/webaudio';
import { registerSynths } from '@strudel/tonal';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

let scheduler = null;
let evaluate = null;
let audioCtx = null;
let initialized = false;
let masterGain = null;
let volume = 0.7;

async function init() {
  if (initialized) return;

  audioCtx = getAudioContext();
  if (audioCtx.state === 'suspended') {
    await audioCtx.resume();
  }

  registerSynthSounds();
  registerSynths();

  const replInstance = repl({
    defaultOutput: webaudioOutput,
    getTime: () => audioCtx.currentTime,
  });
  scheduler = replInstance.scheduler;
  evaluate = replInstance.evaluate;

  masterGain = audioCtx.createGain();
  masterGain.gain.value = volume;

  initialized = true;
}

export async function play(code) {
  await init();

  const pattern = await evaluate(code, true);

  if (scheduler) {
    scheduler.setPattern(pattern);
    scheduler.start();
  }

  return pattern;
}

export function stop() {
  if (scheduler) {
    scheduler.stop();
  }
}

export function pause() {
  if (scheduler) {
    scheduler.stop();
  }
}

export function setVolume(v) {
  volume = v;
  if (masterGain && audioCtx) {
    masterGain.gain.setValueAtTime(v, audioCtx.currentTime);
  }
}

export function getVolume() {
  return volume;
}

export function isPlaying() {
  return scheduler && scheduler.started;
}

export async function loadSongFile(filePath) {
  return readFileSync(filePath, 'utf-8');
}

export function getSongPath() {
  return join(__dirname, '..', 'songs');
}
