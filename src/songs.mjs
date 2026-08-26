import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join, basename } from 'node:path';
import { getSongsDir, getCustomSongsDir } from './config.mjs';

export function discoverSongs() {
  const songs = [];
  const seen = new Set();
  
  for (const dir of [getSongsDir(), getCustomSongsDir()]) {
    if (!existsSync(dir)) continue;
    
    const files = readdirSync(dir);
    for (const file of files) {
      if (!file.endsWith('.js')) continue;
      if (seen.has(file)) continue;
      seen.add(file);
      
      const filePath = join(dir, file);
      const meta = extractMetadata(filePath);
      songs.push({
        name: file,
        path: filePath,
        title: meta.title || file.replace(/\.js$/, ''),
        artist: meta.artist || 'unknown',
        bundled: dir === getSongsDir(),
      });
    }
  }
  
  return songs;
}

export function extractMetadata(filePath) {
  const code = readFileSync(filePath, 'utf-8');
  const meta = {};
  
  const titleMatch = code.match(/@title\s+(.+)/);
  if (titleMatch) meta.title = titleMatch[1].trim();
  
  const artistMatch = code.match(/@by\s+(.+)/);
  if (artistMatch) meta.artist = artistMatch[1].trim();
  
  const versionMatch = code.match(/@version\s+(.+)/);
  if (versionMatch) meta.version = versionMatch[1].trim();
  
  return meta;
}

export function findSong(name) {
  const songs = discoverSongs();
  return songs.find(s => s.name === name || s.title === name);
}

export function loadSongCode(filePath) {
  return readFileSync(filePath, 'utf-8');
}

export function getSongByName(name) {
  const songs = discoverSongs();
  return songs.find(s => s.name === name || s.title === name);
}

export function listSongNames() {
  return discoverSongs().map(s => s.name);
}
