import 'node-web-audio-api/polyfill.js';

if (!globalThis.document) {
  globalThis.document = {
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => true,
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
