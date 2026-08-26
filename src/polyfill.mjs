import 'node-web-audio-api/polyfill.js';

if (!globalThis.document) {
  globalThis.document = {
    addEventListener: () => {},
    removeEventListener: () => {},
    createElement: () => ({ style: {}, getContext: () => null }),
    querySelector: () => null,
    body: {},
  };
}

if (!globalThis.window) {
  globalThis.window = {};
}
if (!globalThis.window.document) {
  globalThis.window.document = globalThis.document;
}
