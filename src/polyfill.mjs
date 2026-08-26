import 'node-web-audio-api/polyfill.js';
import { unlinkSync } from 'node:fs';
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
