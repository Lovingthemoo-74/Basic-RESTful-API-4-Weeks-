# Testing Documentation

## Overview
This document outlines the testing strategy, implementation, and results for the Basic RESTful API project, with a focus on security testing.

## Test Structure

### 1. Security Tests (`src/__tests__/security.test.ts`)

#### API Key Authentication
```typescript
describe('API Key Authentication', () => {
  it('should reject requests without API key')
  it('should accept requests with valid API key')
  it('should reject requests with invalid API key')
});
```

#### Rate Limiting
```typescript
describe('Rate Limiting', () => {
  it('should limit excessive requests')
});
```

#### Security Headers
```typescript
describe('Security Headers', () => {
  it('should include security headers')
});
```

#### Input Sanitization
```typescript
describe('Input Sanitization', () => {
  it('should sanitize HTML in request body')
  it('should trim whitespace from input')
});
```

#### Error Handling
```typescript
describe('Error Handling', () => {
  it('should handle 404 errors properly')
  it('should sanitize error messages in production')
});
```

### 2. Test Environment Setup

#### Configuration (`src/__tests__/setup.ts`)
```typescript
// Test environment variables
process.env.NODE_ENV = 'test';
process.env.PORT = '3001';
process.env.RATE_LIMIT_WINDOW_MS = '1000';
process.env.RATE_LIMIT_MAX = '2';
process.env.API_KEY = 'test-api-key';
```

#### Memory Store for Testing
```typescript
class MemoryStore implements Store {
  static getInstance(): MemoryStore
  async increment(key: string): Promise<ClientRateLimitInfo>
  async resetAll(): Promise<void>
}
```

## Test Results

### Current Status

#### Passing Tests
- ✅ API Key Authentication - Missing Key
- ✅ API Key Authentication - Valid Key
- ✅ API Key Authentication - Invalid Key
- ✅ Rate Limiting
- ✅ Security Headers
- ✅ Error Handling - 404
- ✅ Error Handling - Production Messages

#### Failing Tests
- ❌ Input Sanitization - HTML
- ❌ Input Sanitization - Whitespace

### Coverage Report

```
All files         : 64.55%
Statements       : 64.55%
Branches         : 40.50%
Functions        : 44.73%
Lines            : 64.62%
```

## Testing Strategy

### 1. Unit Tests
- Individual middleware functions
- Input sanitization rules
- Error handling functions

### 2. Integration Tests
- Complete request flow
- Rate limiting behavior
- Security header presence

### 3. Security-Specific Tests
- API key validation
- Input sanitization
- Rate limiting
- Error message sanitization

## Test Implementation Details

### 1. Rate Limiting Tests

#### Test Setup
```typescript
beforeEach(async () => {
  process.env.RATE_LIMIT_WINDOW_MS = '1000';
  process.env.RATE_LIMIT_MAX = '2';
  await MemoryStore.getInstance().resetAll();
});
```

#### Test Implementation
```typescript
it('should limit excessive requests', async () => {
  // First request (should succeed)
  await request(app)
    .get('/api/health')
    .set('X-API-Key', validApiKey)
    .expect(200);

  // Second request (should succeed)
  await request(app)
    .get('/api/health')
    .set('X-API-Key', validApiKey)
    .expect(200);

  // Third request (should be rate limited)
  await request(app)
    .get('/api/health')
    .set('X-API-Key', validApiKey)
    .expect(429);
});
```

### 2. Input Sanitization Tests

#### Test Cases
```typescript
// HTML Sanitization
const testInput = '<script>alert("xss")</script>John<p>Test</p>';
expect(response.body.name).toBe('John Test');

// Whitespace Handling
const testInput = '  Jane Doe  ';
expect(response.body.name).toBe('Jane Doe');
```

## Running Tests

### Commands

```bash
# Run all tests
npm test

# Run security tests only
npm run test:security

# Run with coverage
npm run test:security -- --coverage

# Run with verbose output
npm run test:security -- --verbose

# Run with open handle detection
npm run test:security -- --detectOpenHandles
```

## Debugging Tests

### Common Issues

1. Rate Limiting
   - Store not resetting between tests
   - Configuration not applying
   - Race conditions

2. Input Sanitization
   - Regex patterns too strict
   - Whitespace handling
   - HTML stripping issues

### Solutions

1. Rate Limiting
   - Use singleton store pattern
   - Reset store between tests
   - Add proper test isolation

2. Input Sanitization
   - Improve regex patterns
   - Add better error handling
   - Enhance validation rules

## Future Improvements

### Test Coverage
- Increase overall coverage to 80%
- Add more edge cases
- Improve error scenario coverage

### Test Implementation
- Add performance tests
- Add load testing
- Enhance security testing

### Documentation
- Add more test examples
- Improve debugging guides
- Add performance benchmarks

## Test Maintenance

### Guidelines
1. Keep tests isolated
2. Reset state between tests
3. Use proper assertions
4. Document edge cases
5. Maintain test coverage

### Best Practices
1. One assertion per test
2. Clear test descriptions
3. Proper setup and teardown
4. Consistent naming conventions
5. Comprehensive error checking