// src/hooks/useAwsWebSocketFlags.test.js
import { renderHook } from '@testing-library/react';
import useAwsWebSocketFlags from '../useAwsWebSocketFlags';

describe('useAwsWebSocketFlags hook', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  describe('when VITE_WEBSOCKET_URL is unset or placeholder', () => {
    beforeEach(() => {
      import.meta.env.VITE_WEBSOCKET_URL = '';
      jest
        .spyOn(console, 'warn')
        .mockImplementation(() => {});
    });

    test('logs a warning and does not try to connect', () => {
      renderHook(() => useAwsWebSocketFlags(() => {}));
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('Skipping WebSocket subscription')
      );
    });
  });

  describe('when VITE_WEBSOCKET_URL is provided', () => {
    let originalWebSocket;
    let instances;
    let MockWebSocket;

    beforeAll(() => {
      originalWebSocket = global.WebSocket;
    });

    beforeEach(() => {
      // set a valid URL
      import.meta.env.VITE_WEBSOCKET_URL = 'wss://example.com/socket';
      instances = [];

      // spy on console.log / console.error
      jest.spyOn(console, 'log').mockImplementation(() => {});
      jest.spyOn(console, 'error').mockImplementation(() => {});

      // a minimal mock WebSocket class
      MockWebSocket = class {
        constructor(url) {
          this.url = url;
          this.readyState = MockWebSocket.CONNECTING;
          this.onopen = null;
          this.onmessage = null;
          this.onclose = null;
          this.onerror = null;
          instances.push(this);
        }
        static CONNECTING = 0;
        static OPEN = 1;
        static CLOSING = 2;
        static CLOSED = 3;
        close() {
          this.readyState = MockWebSocket.CLOSING;
          this.onclose && this.onclose({ code: 1000 });
          this.readyState = MockWebSocket.CLOSED;
        }
      };

      global.WebSocket = MockWebSocket;
    });

    afterEach(() => {
      global.WebSocket = originalWebSocket;
      jest.restoreAllMocks();
      delete import.meta.env.VITE_WEBSOCKET_URL;
    });

    test('connects, logs on open, and cleans up on unmount', () => {
      const onEvent = jest.fn();
      const { unmount } = renderHook(() =>
        useAwsWebSocketFlags(onEvent)
      );

      // exactly one WebSocket instance created
      expect(instances).toHaveLength(1);
      const ws = instances[0];
      expect(ws.url).toBe('wss://example.com/socket');

      // simulate open
      ws.onopen();
      expect(console.log).toHaveBeenCalledWith(
        'WebSocket connected to',
        'wss://example.com/socket'
      );

      // unmount => cleanup should close the socket
      unmount();
      expect(ws.readyState).toBe(MockWebSocket.CLOSED);
      expect(console.log).toHaveBeenCalledWith(
        'Cleaning up WebSocket'
      );
    });

    test('invokes onEvent only for the five flag events, and logs parse errors', () => {
      const onEvent = jest.fn();
      renderHook(() => useAwsWebSocketFlags(onEvent));
      const ws = instances[0];

      // irrelevant event should not call onEvent
      ws.onmessage({ data: JSON.stringify({ event: 'some-other' }) });
      expect(onEvent).not.toHaveBeenCalled();

      // each of the five events should
      [
        'flag-created',
        'flag-updated',
        'flag-deleted',
        'flags-deleted',
        'flags-updated',
      ].forEach((evt) => {
        ws.onmessage({ data: JSON.stringify({ event: evt }) });
        expect(onEvent).toHaveBeenCalled();
        onEvent.mockClear();
      });

      // broken JSON => parse error logged
      ws.onmessage({ data: 'not-a-json' });
      expect(console.error).toHaveBeenCalledWith(
        'WebSocket parse error:',
        expect.any(SyntaxError)
      );
    });

    test('logs socket errors only after socket has opened', () => {
      const onEvent = jest.fn();
      renderHook(() => useAwsWebSocketFlags(onEvent));
      const ws = instances[0];
      const err = new Error('oops');

      // before open => no log
      ws.onerror(err);
      expect(console.error).not.toHaveBeenCalled();

      // after open => should log
      ws.onopen();
      ws.onerror(err);
      expect(console.error).toHaveBeenCalledWith(
        'Encountered error:',
        err
      );
    });
  });
});
