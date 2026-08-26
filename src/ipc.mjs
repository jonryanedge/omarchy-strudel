import { createServer as createNetServer, connect as netConnect } from 'node:net';
import { unlinkSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { homedir, hostname } from 'node:os';

export function getSocketPath() {
  const xdgRuntime = process.env.XDG_RUNTIME_DIR || `/run/user/${process.getuid()}`;
  return join(xdgRuntime, 'omarchy-strudel.sock');
}

export function createSocketServer(handleConnection) {
  const socketPath = getSocketPath();
  
  if (existsSync(socketPath)) {
    try {
      unlinkSync(socketPath);
    } catch (e) {
    }
  }
  
  const server = createNetServer((socket) => {
    let buffer = '';
    
    socket.on('data', (data) => {
      buffer += data.toString();
      let newlineIdx;
      while ((newlineIdx = buffer.indexOf('\n')) !== -1) {
        const line = buffer.slice(0, newlineIdx).trim();
        buffer = buffer.slice(newlineIdx + 1);
        
        if (!line) continue;
        
        try {
          const msg = JSON.parse(line);
          handleConnection(msg, socket);
        } catch (e) {
          sendResponse(socket, { ok: false, error: `Invalid JSON: ${e.message}` });
        }
      }
    });
    
    socket.on('error', () => {});
  });
  
  server.listen(socketPath, () => {
    try {
      server.chmod(socketPath, 0o600);
    } catch (e) {
    }
  });
  
  return server;
}

export function sendResponse(socket, obj) {
  if (socket.writable) {
    socket.write(JSON.stringify(obj) + '\n');
  }
}

export function sendCommand(cmd) {
  return new Promise((resolve, reject) => {
    const socketPath = getSocketPath();
    const socket = netConnect(socketPath, () => {
      socket.write(JSON.stringify(cmd) + '\n');
    });
    
    let buffer = '';
    
    socket.on('data', (data) => {
      buffer += data.toString();
      const newlineIdx = buffer.indexOf('\n');
      if (newlineIdx !== -1) {
        const line = buffer.slice(0, newlineIdx).trim();
        try {
          const response = JSON.parse(line);
          resolve(response);
        } catch (e) {
          reject(new Error(`Invalid response: ${e.message}`));
        }
        socket.end();
      }
    });
    
    socket.on('error', (e) => {
      reject(new Error(`Cannot connect to daemon. Is it running? (${e.message})`));
    });
    
    socket.setTimeout(5000, () => {
      socket.destroy();
      reject(new Error('Command timed out'));
    });
  });
}

export function isDaemonRunning() {
  const socketPath = getSocketPath();
  if (!existsSync(socketPath)) return false;
  
  return new Promise((resolve) => {
    const socket = netConnect(socketPath, () => {
      socket.write(JSON.stringify({ cmd: 'ping' }) + '\n');
    });
    
    let buffer = '';
    socket.on('data', (data) => {
      buffer += data.toString();
      if (buffer.includes('\n')) {
        try {
          const resp = JSON.parse(buffer.trim());
          resolve(resp.ok === true);
        } catch {
          resolve(false);
        }
        socket.end();
      }
    });
    
    socket.on('error', () => resolve(false));
    socket.setTimeout(2000, () => {
      socket.destroy();
      resolve(false);
    });
  });
}
