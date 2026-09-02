import { createSocketServer, sendResponse } from './ipc.mjs';
import { loadConfig, saveConfig, updateConfig, loadState, updateState, ensureDirs, copyBundledSongs, log } from './config.mjs';
import { discoverSongs, findSong, loadSongCode } from './songs.mjs';
import { play as playPattern, stop as stopPattern, pause as pausePattern, setVolume, getVolume, isPlaying, loadSongFile } from './playback.mjs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BUNDLED_SONGS_DIR = join(__dirname, '..', 'songs');

let config = null;
let state = null;
let retryingPipeWire = false;
let playbackTimer = null;
let timerEndsAt = null;

function clearPlaybackTimer() {
  if (playbackTimer) {
    clearTimeout(playbackTimer);
    playbackTimer = null;
  }
  timerEndsAt = null;
}

function getRemainingSeconds() {
  if (!timerEndsAt) return null;
  const remaining = Math.max(0, Math.round((timerEndsAt - Date.now()) / 1000));
  return remaining;
}

// Start (or restart) the playback countdown. `secondsOverride` lets pause/resume
// continue the countdown with the time that was left instead of restarting it.
function startPlaybackTimer(secondsOverride) {
  clearPlaybackTimer();
  const seconds = secondsOverride ?? config.playbackSeconds ?? 0;
  if (seconds > 0) {
    timerEndsAt = Date.now() + seconds * 1000;
    playbackTimer = setTimeout(() => {
      log(`Playback duration of ${seconds}s reached, stopping`);
      stopPattern();
      state = updateState({ state: 'stopped' });
      clearPlaybackTimer();
    }, seconds * 1000);
    log(`Playback timer set: ${seconds}s`);
  }
}

async function handleCommand(msg, socket) {
  const { cmd } = msg;
  
  try {
    switch (cmd) {
      case 'ping':
        sendResponse(socket, { ok: true });
        break;
      
      case 'status':
        sendResponse(socket, {
          ok: true,
          state: state.state,
          song: state.song,
          artist: state.artist,
          title: state.title,
          volume: getVolume(),
          enabled: config.enabled,
          playbackSeconds: config.playbackSeconds ?? 0,
          remaining: state.state === 'playing' ? getRemainingSeconds() : null,
        });
        break;
      
      case 'play':
        if (!config.enabled) {
          sendResponse(socket, { ok: false, error: 'Playback is disabled' });
          break;
        }
        await doPlay();
        sendResponse(socket, { ok: true, state: state.state, song: state.song });
        break;
      
      case 'pause': {
        // Remember how much time was left so resume can continue the countdown
        const remaining = getRemainingSeconds();
        pausePattern();
        state = updateState({ state: 'paused', remainingSeconds: remaining });
        clearPlaybackTimer();
        sendResponse(socket, { ok: true, state: state.state });
        break;
      }

      case 'stop':
        stopPattern();
        state = updateState({ state: 'stopped', remainingSeconds: null });
        clearPlaybackTimer();
        sendResponse(socket, { ok: true, state: state.state });
        break;
      
      case 'next':
        await doSwitchSong(getNextSong());
        sendResponse(socket, { ok: true, state: state.state, song: state.song });
        break;
      
      case 'prev':
        await doSwitchSong(getPrevSong());
        sendResponse(socket, { ok: true, state: state.state, song: state.song });
        break;
      
      case 'switch':
        await doSwitchSong(msg.song);
        sendResponse(socket, { ok: true, state: state.state, song: state.song });
        break;
      
      case 'load':
        await doPlayCode(msg.code, msg.title || 'custom', msg.artist || 'user');
        sendResponse(socket, { ok: true, state: state.state, song: state.song });
        break;
      
      case 'load_file':
        const code = loadSongFile(msg.path);
        const meta = extractFilenameMeta(msg.path);
        await doPlayCode(code, meta.title, meta.artist);
        sendResponse(socket, { ok: true, state: state.state, song: state.song });
        break;
      
      case 'enable':
        config = updateConfig({ enabled: true });
        if (config.autoplay) {
          await doPlay();
        }
        sendResponse(socket, { ok: true, enabled: true });
        break;
      
      case 'disable':
        stopPattern();
        config = updateConfig({ enabled: false });
        state = updateState({ state: 'stopped', remainingSeconds: null });
        clearPlaybackTimer();
        sendResponse(socket, { ok: true, enabled: false });
        break;
      
      case 'volume':
        const vol = Math.max(0, Math.min(1, msg.level));
        setVolume(vol);
        config = updateConfig({ volume: vol });
        sendResponse(socket, { ok: true, volume: vol });
        break;

      case 'timeout': {
        const seconds = Math.max(0, Math.floor(Number(msg.seconds) || 0));
        config = updateConfig({ playbackSeconds: seconds });
        // If currently playing, apply the new duration as a fresh countdown
        if (state.state === 'playing') {
          startPlaybackTimer();
        }
        sendResponse(socket, { ok: true, playbackSeconds: seconds });
        break;
      }
      
      case 'list':
        const songs = discoverSongs().map(s => ({
          name: s.name,
          title: s.title,
          artist: s.artist,
          bundled: s.bundled,
        }));
        sendResponse(socket, { ok: true, songs });
        break;
      
      default:
        sendResponse(socket, { ok: false, error: `Unknown command: ${cmd}` });
    }
  } catch (e) {
    log(`Error handling ${cmd}: ${e.message}`);
    sendResponse(socket, { ok: false, error: e.message });
  }
}

function extractFilenameMeta(path) {
  const filename = path.split('/').pop().replace(/\.js$/, '');
  return { title: filename, artist: 'user' };
}

function getNextSong() {
  const songs = discoverSongs();
  if (songs.length === 0) return null;
  const currentIdx = songs.findIndex(s => s.name === config.currentSong);
  const nextIdx = (currentIdx + 1) % songs.length;
  return songs[nextIdx].name;
}

function getPrevSong() {
  const songs = discoverSongs();
  if (songs.length === 0) return null;
  const currentIdx = songs.findIndex(s => s.name === config.currentSong);
  const prevIdx = (currentIdx - 1 + songs.length) % songs.length;
  return songs[prevIdx].name;
}

async function doPlay() {
  if (!config.currentSong) {
    const songs = discoverSongs();
    if (songs.length > 0) {
      config = updateConfig({ currentSong: songs[0].name });
    } else {
      throw new Error('No songs available');
    }
  }
  
  const song = findSong(config.currentSong);
  if (!song) {
    throw new Error(`Song not found: ${config.currentSong}`);
  }
  
  await doPlayCode(loadSongCode(song.path), song.title, song.artist);
}

async function doSwitchSong(songName) {
  if (!songName) throw new Error('No song specified');
  
  const song = findSong(songName);
  if (!song) throw new Error(`Song not found: ${songName}`);
  
  config = updateConfig({ currentSong: song.name });
  await doPlayCode(loadSongCode(song.path), song.title, song.artist);
}

async function doPlayCode(code, title, artist) {
  if (!config.enabled) {
    state = updateState({ state: 'stopped' });
    return;
  }

  try {
    await playPattern(code);
    state = updateState({ state: 'playing', song: title, artist, title });
    log(`Playing: ${title} by ${artist}`);
    // Fresh countdown (or continue one that survived pause)
    const resumeRemaining = state.remainingSeconds;
    startPlaybackTimer(resumeRemaining ?? undefined);
    if (resumeRemaining != null) {
      state = updateState({ remainingSeconds: null });
    }
  } catch (e) {
    log(`Playback error: ${e.message}`);
    state = updateState({ state: 'error', error: e.message });
    throw e;
  }
}

async function waitForPipeWire(maxRetries = 5, delayMs = 2000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const { getAudioContext } = await import('@strudel/webaudio');
      const ctx = getAudioContext();
      if (ctx.state !== 'suspended') return true;
      await ctx.resume();
      if (ctx.state !== 'suspended') return true;
    } catch {
    }
    
    if (i < maxRetries - 1) {
      log(`PipeWire not ready, retrying (${i + 1}/${maxRetries})...`);
      await new Promise(r => setTimeout(r, delayMs));
    }
  }
  log('PipeWire not available after retries');
  return false;
}

async function main() {
  ensureDirs();
  copyBundledSongs(BUNDLED_SONGS_DIR);
  
  config = loadConfig();
  state = loadState();
  
  log('omarchy-strudel daemon starting');
  
  const server = createSocketServer(handleCommand);
  
  server.on('error', (e) => {
    log(`Socket server error: ${e.message}`);
    process.exit(1);
  });
  
  process.on('SIGTERM', () => {
    log('Received SIGTERM, shutting down');
    stopPattern();
    server.close();
    process.exit(0);
  });
  
  process.on('SIGINT', () => {
    log('Received SIGINT, shutting down');
    stopPattern();
    server.close();
    process.exit(0);
  });
  
  if (config.enabled && config.autoplay) {
    log('Autoplay enabled, waiting for PipeWire...');
    const ready = await waitForPipeWire();
    if (ready) {
      try {
        await doPlay();
        log(`Autoplay started: ${state.song}`);
      } catch (e) {
        log(`Autoplay failed: ${e.message}`);
      }
    } else {
      log('PipeWire not ready, will not autoplay');
    }
  } else {
    log('Autoplay disabled or playback disabled, daemon is idle');
  }
  
  log('Daemon ready');
}

main().catch((e) => {
  console.error(`Fatal error: ${e.message}`);
  process.exit(1);
});
