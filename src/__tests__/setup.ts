import { jest } from '@jest/globals';

// Increase timeout for all tests
jest.setTimeout(30000);

// Mock console methods to reduce noise in test output
export const consoleMocks = {
  log: jest.spyOn(console, 'log').mockImplementation(() => {}),
  info: jest.spyOn(console, 'info').mockImplementation(() => {}),
  warn: jest.spyOn(console, 'warn').mockImplementation(() => {}),
  error: jest.spyOn(console, 'error').mockImplementation(() => {})
};

// Set test environment
process.env.NODE_ENV = 'test';
process.env.PORT = '3001';  // Use different port for tests
process.env.RATE_LIMIT_WINDOW_MS = '1000';  // 1 second for faster tests
process.env.RATE_LIMIT_MAX = '2';  // 2 requests per window for testing
process.env.API_KEY = 'test-api-key';
process.env.SESSION_SECRET = 'test-session-secret';
process.env.CSRF_SECRET = 'test-csrf-secret';

// Global teardown
global.afterAll(async () => {
  // Reset all mocks
  jest.clearAllMocks();
  
  // Reset environment variables
  process.env.NODE_ENV = 'test';
  process.env.PORT = '3000';
  process.env.RATE_LIMIT_WINDOW_MS = '900000';
  process.env.RATE_LIMIT_MAX = '100';
  
  // Allow time for any pending operations to complete
  await new Promise(resolve => setTimeout(resolve, 1000));
});