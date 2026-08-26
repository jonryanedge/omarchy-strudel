import './polyfill.mjs';
import * as core from '@strudel/core';
import * as webaudio from '@strudel/webaudio';
import * as tonal from '@strudel/tonal';
import { transpiler } from '@strudel/transpiler';
import * as mini from '@strudel/mini';
import { registerSoundfonts } from '@strudel/soundfonts';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

mini.miniAllStrings();
Object.assign(globalThis, core);
Object.assign(globalThis, webaudio);
Object.assign(globalThis, tonal);
Object.assign(globalThis, mini);

let scheduler = null;
let evaluate = null;
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
  registerSoundfonts();
  tonal.registerVoicings();

  try {
    await webaudio.loadWorklets();
  } catch (e) {
    console.warn('[omarchy-strudel] Could not load AudioWorklets:', e.message);
  }

  const replInstance = core.repl({
    defaultOutput: webaudio.webaudioOutput,
    getTime: () => audioCtx.currentTime,
    transpiler,
  });
  scheduler = replInstance.scheduler;
  evaluate = replInstance.evaluate;

  masterGain = audioCtx.createGain();
  masterGain.gain.value = volume;

  initialized = true;
}

async function preloadSamples(code) {
  const sampleCalls = code.match(/samples\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g);
  if (!sampleCalls) return;

  for (const call of sampleCalls) {
    const urlMatch = call.match(/samples\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/);
    if (urlMatch) {
      const url = urlMatch[1];
      try {
        await webaudio.samples(url);
      } catch (e) {
        console.warn(`[omarchy-strudel] Could not preload samples from ${url}:`, e.message);
      }
    }
  }
}

export async function play(code) {
  await init();
  await preloadSamples(code);

  const pattern = await evaluate(code);

  scheduler.start();

  return pattern;
}

export function stop() {
  if (scheduler) {
    scheduler.stop();
  }
}

export function pause() {
  if (scheduler) {
    scheduler.pause();
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
