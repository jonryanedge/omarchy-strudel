import { readFileSync, writeFileSync, existsSync, mkdirSync, copyFileSync, readdirSync, appendFileSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';

const HOME = homedir();
const CONFIG_DIR = join(HOME, '.config', 'omarchy-strudel');
const CONFIG_FILE = join(CONFIG_DIR, 'config.json');
const STATE_FILE = join(CONFIG_DIR, 'state.json');
const SONGS_DIR = join(CONFIG_DIR, 'songs');
const CUSTOM_SONGS_DIR = join(SONGS_DIR, 'custom');
const STATE_DIR = join(HOME, '.local', 'state', 'omarchy-strudel');
const LOG_FILE = join(STATE_DIR, 'daemon.log');

const DEFAULT_CONFIG = {
  enabled: true,
  volume: 0.7,
  currentSong: 'rush-hour.js',
  autoplay: true,
  playbackSeconds: 0,
};

const DEFAULT_STATE = {
  state: 'stopped',
  song: null,
  artist: null,
};

export function getConfigDir() {
  return CONFIG_DIR;
}

export function getSongsDir() {
  return SONGS_DIR;
}

export function getCustomSongsDir() {
  return CUSTOM_SONGS_DIR;
}

export function getLogFile() {
  return LOG_FILE;
}

export function ensureDirs() {
  for (const dir of [CONFIG_DIR, SONGS_DIR, CUSTOM_SONGS_DIR, STATE_DIR]) {
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
  }
}

export function loadConfig() {
  ensureDirs();
  if (existsSync(CONFIG_FILE)) {
    try {
      const raw = readFileSync(CONFIG_FILE, 'utf-8');
      return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
    } catch {
      return { ...DEFAULT_CONFIG };
    }
  }
  saveConfig(DEFAULT_CONFIG);
  return { ...DEFAULT_CONFIG };
}

export function saveConfig(config) {
  ensureDirs();
  writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2) + '\n');
}

export function loadState() {
  ensureDirs();
  if (existsSync(STATE_FILE)) {
    try {
      const raw = readFileSync(STATE_FILE, 'utf-8');
      return { ...DEFAULT_STATE, ...JSON.parse(raw) };
    } catch {
      return { ...DEFAULT_STATE };
    }
  }
  return { ...DEFAULT_STATE };
}

export function saveState(state) {
  ensureDirs();
  writeFileSync(STATE_FILE, JSON.stringify(state, null, 2) + '\n');
}

export function updateConfig(updates) {
  const config = loadConfig();
  const newConfig = { ...config, ...updates };
  saveConfig(newConfig);
  return newConfig;
}

export function updateState(updates) {
  const state = loadState();
  const newState = { ...state, ...updates };
  saveState(newState);
  return newState;
}

export function copyBundledSongs(bundledSongsDir) {
  ensureDirs();
  if (!existsSync(bundledSongsDir)) return;
  
  const files = readdirSync(bundledSongsDir);
  for (const file of files) {
    if (file.endsWith('.js')) {
      const dest = join(SONGS_DIR, file);
      if (!existsSync(dest)) {
        copyFileSync(join(bundledSongsDir, file), dest);
      }
    }
  }
}

export function log(message) {
  ensureDirs();
  const timestamp = new Date().toISOString();
  const line = `[${timestamp}] ${message}\n`;
  try {
    appendFileSync(LOG_FILE, line);
  } catch {
  }
}
