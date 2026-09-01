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
    await webaudio.initAudio({ disableWorklets: true });
  } catch (e) {
    console.warn('[omarchy-strudel] initAudio failed:', e.message);
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

  // Collect bank names (from .bank("...")) and raw sound names (from s("...")).
  // Sound names may be embedded in mini-notation (e.g. s("~ [rim, sd:<2 3>]")),
  // so extract all word-like tokens from the pattern string.
  const banks = new Set();
  for (const m of code.matchAll(/\.bank\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g)) {
    banks.add(m[1].toLowerCase());
  }
  const soundNames = new Set();
  for (const m of code.matchAll(/\b(?:\.)?s\s*\(\s*['"`]([^'"`]+)['"`]/g)) {
    const tokens = m[1].match(/[a-zA-Z][a-zA-Z0-9_-]*/g) || [];
    for (const token of tokens) {
      if (token === 'x') continue; // struct marker, not a sound
      soundNames.add(token.toLowerCase());
    }
  }

  // With a bank, s("bd") looks up "crate_bd"; also try the bare name.
  const lookupNames = new Set(soundNames);
  for (const bank of banks) {
    for (const name of soundNames) {
      lookupNames.add(`${bank}_${name}`);
    }
  }

  for (const call of sampleCalls) {
    const urlMatch = call.match(/samples\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/);
    if (!urlMatch) continue;
    const url = urlMatch[1];
    try {
      await webaudio.samples(url);
    } catch (e) {
      console.warn(`[omarchy-strudel] Could not preload samples from ${url}:`, e.message);
      continue;
    }

    // Force-load audio buffers for the sounds this song actually uses,
    // so the first hit of each sound doesn't get skipped.
    const ctx2 = webaudio.getAudioContext();
    for (const name of lookupNames) {
      try {
        const sound = webaudio.getSound ? webaudio.getSound(name) : null;
        if (!sound || !sound.data) continue;
        const samples = sound.data.samples;
        if (!samples) continue;
        // samples can be an array of URLs, or an object of sub-arrays
        const urls = Array.isArray(samples)
          ? samples
          : Object.values(samples).flat().filter((v) => typeof v === 'string');
        await Promise.all(
          urls.slice(0, 6).map((u) =>
            webaudio.loadBuffer(u, ctx2).catch(() => {})
          )
        );
      } catch {
        // sound not in this bank — skip
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
