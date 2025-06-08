// jest.setup.cjs
require('@testing-library/jest-dom');

// polyfill fetch so spyOn/global.fetch exists
global.fetch = global.fetch || jest.fn(() =>
  Promise.resolve({ ok: true, json: async () => ({}) })
);


const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Shim import.meta.env if your code still reads it at runtime:
global.importMetaEnv = {
  VITE_API_BASE:      '',
  VITE_WEBSOCKET_URL: '',
};

// ← Add this:
global.fetch = jest.fn();

jest.mock('react-router-dom', () => {
  const orig = jest.requireActual('react-router-dom');
  return {
    ...orig,
    BrowserRouter: ({ children }) => children,      // no-op
  };
});

// polyfill matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});