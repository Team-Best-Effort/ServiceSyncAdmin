// setupTests.ts
import '@testing-library/jest-dom';

// Polyfill TextEncoder/TextDecoder for Node environment
import { TextEncoder, TextDecoder } from 'util';
(global as any).TextEncoder = TextEncoder;
(global as any).TextDecoder = TextDecoder;

// Complete BroadcastChannel mock with proper TypeScript typing
class MockBroadcastChannel implements BroadcastChannel {
  name: string;
  onmessage: ((this: BroadcastChannel, ev: MessageEvent) => any) | null = null;
  onmessageerror: ((this: BroadcastChannel, ev: MessageEvent) => any) | null = null;

  constructor(name: string) {
    this.name = name;
  }
  
  postMessage(_data: any): void {}
  close(): void {}
  addEventListener(_type: string, _listener: EventListenerOrEventListenerObject, _options?: boolean | AddEventListenerOptions): void {}
  removeEventListener(_type: string, _listener: EventListenerOrEventListenerObject, _options?: boolean | EventListenerOptions): void {}
  dispatchEvent(_event: Event): boolean { return true; }
}

// Add TransformStream polyfill
class MockTransformStream {
  readable: any;
  writable: any;

  constructor() {
    this.readable = {};
    this.writable = {};
  }
}

// Add ReadableStream polyfill
class MockReadableStream {
  locked: boolean = false;
  
  constructor() {
    this.locked = false;
  }
  
  cancel(): Promise<void> { return Promise.resolve(); }
  getReader(): any { return {}; }
  pipeThrough(): any { return new MockReadableStream(); }
  pipeTo(): Promise<void> { return Promise.resolve(); }
  tee(): [MockReadableStream, MockReadableStream] { 
    return [new MockReadableStream(), new MockReadableStream()]; 
  }
}

// Add WritableStream polyfill
class MockWritableStream {
  locked: boolean = false;
  
  constructor() {
    this.locked = false;
  }
  
  abort(): Promise<void> { return Promise.resolve(); }
  close(): Promise<void> { return Promise.resolve(); }
  getWriter(): any { return {}; }
}

// Add CompressionStream and DecompressionStream polyfills
class MockCompressionStream {
  readable: any;
  writable: any;
  
  constructor(_format: string) {
    this.readable = new MockReadableStream();
    this.writable = new MockWritableStream();
  }
}

class MockDecompressionStream {
  readable: any;
  writable: any;
  
  constructor(_format: string) {
    this.readable = new MockReadableStream();
    this.writable = new MockWritableStream();
  }
}

// Set global polyfills
(global as any).BroadcastChannel = MockBroadcastChannel;
(global as any).TransformStream = MockTransformStream;
(global as any).ReadableStream = MockReadableStream;
(global as any).WritableStream = MockWritableStream;
(global as any).CompressionStream = MockCompressionStream;
(global as any).DecompressionStream = MockDecompressionStream;

// Add missing Browser APIs
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock alert and confirm
window.alert = jest.fn();
window.confirm = jest.fn().mockImplementation(() => true);

// Add better handling for Google API mocks
if (!(global as any).gapi) {
  (global as any).gapi = {
    load: jest.fn((api, callback) => {
      if (typeof callback === 'function') {
        callback();
      }
    }),
    client: {
      init: jest.fn().mockResolvedValue({}),
      calendar: {
        events: {
          list: jest.fn().mockResolvedValue({ result: { items: [] } }),
          insert: jest.fn().mockResolvedValue({ result: {} }),
          update: jest.fn().mockResolvedValue({ result: {} }),
          delete: jest.fn().mockResolvedValue({ result: {} })
        }
      }
    },
    auth2: {
      getAuthInstance: jest.fn().mockReturnValue({
        signIn: jest.fn().mockResolvedValue({}),
        isSignedIn: {
          get: jest.fn().mockReturnValue(false)
        }
      }),
      init: jest.fn().mockResolvedValue({})
    }
  };
}

// Modify console.error to filter out known React warnings in tests
const originalConsoleError = console.error;
console.error = (...args) => {
  // Filter out certain warnings and errors that are expected in tests
  if (
    (typeof args[0] === 'string' && (
      args[0].includes('Warning:') ||
      args[0].includes('auth instance not available') ||
      args[0].includes('act(') ||
      args[0].includes('ReactDOM.render is no longer supported')
    ))
  ) {
    return;
  }
  originalConsoleError(...args);
};