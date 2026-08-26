import 'node-web-audio-api/polyfill.js';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const domStub = {
  addEventListener: () => {},
  removeEventListener: () => {},
  dispatchEvent: () => true,
};

if (!globalThis.document) {
  globalThis.document = {
    ...domStub,
    createElement: () => ({ style: {}, getContext: () => null }),
    querySelector: () => null,
    body: {},
  };
}

if (!globalThis.CustomEvent) {
  globalThis.CustomEvent = class CustomEvent {
    constructor(type, options = {}) {
      this.type = type;
      this.detail = options.detail;
      this.bubbles = options.bubbles || false;
    }
  };
}

if (!globalThis.window) {
  globalThis.window = {};
}

if (!globalThis.window.document) {
  globalThis.window.document = globalThis.document;
}

globalThis.window.addEventListener = globalThis.window.addEventListener || domStub.addEventListener;
globalThis.window.removeEventListener = globalThis.window.removeEventListener || domStub.removeEventListener;
globalThis.window.dispatchEvent = globalThis.window.dispatchEvent || domStub.dispatchEvent;

const _AudioWorklet = globalThis.AudioContext?.prototype?.constructor?.name ? null : null;
const origAddModule = globalThis.AudioContext?.prototype && Object.getOwnPropertyDescriptor(
  Object.getPrototypeOf(Object.getPrototypeOf(globalThis.AudioContext.prototype)),
  'audioWorklet'
);

try {
  const proto = Object.getPrototypeOf(globalThis.AudioContext.prototype);
  const desc = Object.getOwnPropertyDescriptor(proto, 'audioWorklet');
  if (desc && desc.get) {
    const origGet = desc.get;
    Object.defineProperty(proto, 'audioWorklet', {
      get() {
        const worklet = origGet.call(this);
        if (worklet && !worklet.__patched) {
          const origAddModule = worklet.addModule.bind(worklet);
          worklet.addModule = async function (moduleUrl) {
            if (typeof moduleUrl === 'string' && moduleUrl.startsWith('data:')) {
              const match = moduleUrl.match(/^data:text\/javascript;base64,(.+)$/);
              if (match) {
                const code = Buffer.from(match[1], 'base64').toString('utf-8');
                const tmpFile = join(tmpdir(), `strudel-worklet-${Date.now()}-${Math.random().toString(36).slice(2)}.mjs`);
                writeFileSync(tmpFile, code);
                return origAddModule(tmpFile);
              }
            }
            return origAddModule(moduleUrl);
          };
          worklet.__patched = true;
        }
        return worklet;
      },
      configurable: true,
    });
  }
} catch (e) {
  // AudioContext not available or already patched
}
