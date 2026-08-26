import { AudioContext } from 'node-web-audio-api';
globalThis.AudioContext = AudioContext;

import { repl, transpiler } from '@strudel/core';
import { getAudioContext, webaudioOutput, samples as loadSamples, registerSynthSounds } from '@strudel/webaudio';
import { registerSynths } from '@strudel/tonal';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

let scheduler = null;
let replInstance = null;
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

  replInstance = repl({
    defaultOutput: webaudioOutput,
    getTime: () => audioCtx.currentTime,
  });
  scheduler = replInstance.scheduler;

  masterGain = audioCtx.createGain();
  masterGain.gain.value = volume;

  initialized = true;
}

export async function play(code) {
  await init();

  const pattern = await evaluateCode(code);

  if (scheduler) {
    scheduler.setPattern(pattern);
    scheduler.start();
  }

  return pattern;
}

async function evaluateCode(code) {
  const transpiled = transpiler.transpile(code);

  const core = await import('@strudel/core');
  const tonal = await import('@strudel/tonal');
  const webaudio = await import('@strudel/webaudio');

  const ctx = {
    samples: webaudio.samples,
    setcps: core.setcps,
    s: core.s,
    n: core.n,
    note: core.note,
    stack: core.stack,
    seq: core.seq,
    fastcat: core.fastcat,
    timeCat: core.timeCat,
    cat: core.cat,
    silence: core.silence,
    sound: core.sound,
    chord: tonal.chord,
    voicing: tonal.voicing,
    sine: core.sine,
    cosine: core.cosine,
    rand: core.rand,
    perlin: core.perlin,
    rev: core.rev,
    fast: core.fast,
    slow: core.slow,
    struct: core.struct,
    mask: core.mask,
    gain: core.gain,
    room: core.room,
    shape: core.shape,
    delay: core.delay,
    lpf: core.lpf,
    lpq: core.lpq,
    hpf: core.hpf,
    cutoff: core.cutoff,
    pan: core.pan,
    clip: core.clip,
    segment: core.segment,
    anchor: tonal.anchor,
    mode: tonal.mode,
    set: core.set,
    offset: tonal.offset,
    bank: core.bank,
    jux: core.jux,
    ply: core.ply,
    chunk: core.chunk,
    rarely: core.rarely,
    sometimes: core.sometimes,
    always: core.always,
    never: core.never,
    add: core.add,
    sub: core.sub,
    late: core.late,
    early: core.early,
    size: core.size,
    dec: core.dec,
    decay: core.decay,
    sustain: core.sustain,
    release: core.release,
    attack: core.attack,
    phaser: core.phaser,
    fm: core.fm,
    fmh: core.fmh,
    fmi: core.fmi,
    speed: core.speed,
    begin: core.begin,
    end: core.end,
    legato: core.legato,
    octave: core.octave,
    up: core.up,
    down: core.down,
    scale: tonal.scale,
    dict: tonal.dict,
    off: core.off,
    superimpose: core.superimpose,
    degradeBy: core.degradeBy,
    degrade: core.degrade,
    range: core.range,
    slowcat: core.slowcat,
    reify: core.reify,
    pure: core.pure,
    cycle: core.cycle,
    scan: core.scan,
    list: core.list,
    $: (x) => x,
  };

  const keys = Object.keys(ctx);
  const vals = Object.values(ctx);

  const fn = new Function(...keys, `${transpiled}`);
  const result = fn(...vals);

  if (result && typeof result.then === 'function') {
    return await result;
  }
  return result;
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
