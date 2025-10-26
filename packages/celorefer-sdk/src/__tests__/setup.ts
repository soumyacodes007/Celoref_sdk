// Setup file for tests
import { vi } from 'vitest';

// Mock window object for server-side testing
Object.defineProperty(global, 'window', {
  value: {
    location: {
      origin: 'http://localhost:3000'
    }
  },
  writable: true
});