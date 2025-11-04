import '@testing-library/jest-dom';

// Mock global crypto for tests
Object.assign(global, {
  crypto: {
    getRandomValues: (arr: any) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256);
      }
      return arr;
    }
  }
});

// Provide TextEncoder and TextDecoder globally
if (typeof global.TextEncoder === 'undefined') {
  const { TextEncoder, TextDecoder } = require('util');
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
}

// Mock localStorage for tests
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock browser extension APIs
Object.defineProperty(window, 'chrome', {
  value: {
    runtime: {
      id: 'test-extension-id'
    }
  },
  writable: true
});

// Mock ResizeObserver (needed for some UI components)
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

if (typeof window !== 'undefined') {
  (window as any).ResizeObserver = ResizeObserverMock;
}

// Mock IntersectionObserver (needed for some UI components)
class IntersectionObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

if (typeof window !== 'undefined') {
  (window as any).IntersectionObserver = IntersectionObserverMock;
}