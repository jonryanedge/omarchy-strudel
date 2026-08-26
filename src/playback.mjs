import './polyfill.mjs';
import * as core from '@strudel/core';
import * as webaudio from '@strudel/webaudio';
import * as tonal from '@strudel/tonal';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

Object.assign(globalThis, core);
Object.assign(globalThis, webaudio);
Object.assign(globalThis, tonal);

let scheduler = null;
let audioCtx = null;
let initialized = false;
let masterGain = null;
let volume = 0.7;

async function init() {
  if (initialized) return;

  audioCtx = webaudio.getAudioContext();
  if (audioCtx.state === 'suspended') {
    await audioCtx.resume();
  }

  webaudio.registerSynthSounds();
  tonal.registerVoicings();

  const replInstance = core.repl({
    defaultOutput: webaudio.webaudioOutput,
    getTime: () => audioCtx.currentTime,
  });
  scheduler = replInstance.scheduler;

  masterGain = audioCtx.createGain();
  masterGain.gain.value = volume;

  initialized = true;
}

export async function play(code) {
  await init();

  const pattern = await eval(code);

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
