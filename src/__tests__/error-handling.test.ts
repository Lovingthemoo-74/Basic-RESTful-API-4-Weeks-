import { describe, expect, it, beforeEach } from '@jest/globals';
import request from 'supertest';
import app from '../server';

describe('Error Handling', () => {
  const validApiKey = 'test-api-key';

  beforeEach(() => {
    process.env.API_KEY = validApiKey;
  });

  describe('HTTP Errors', () => {
    it('should handle 404 errors properly', async () => {
      const response = await request(app)
        .get('/api/nonexistent')
        .set('X-API-Key', validApiKey)
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Not Found');
    });

    it('should handle method not allowed', async () => {
      const response = await request(app)
        .patch('/api/users')
        .set('X-API-Key', validApiKey)
        .expect(405);

      expect(response.body.error).toBe('Method Not Allowed');
    });
  });

  describe('Validation Errors', () => {
    it('should handle malformed JSON', async () => {
      const response = await request(app)
        .post('/api/users')
        .set('X-API-Key', validApiKey)
        .set('Content-Type', 'application/json')
        .send('{malformed json}')
        .expect(400);

      expect(response.body.error).toBe('Invalid Input');
    });

    it('should handle invalid content type', async () => {
      const response = await request(app)
        .post('/api/users')
        .set('X-API-Key', validApiKey)
        .set('Content-Type', 'text/plain')
        .send('plain text')
        .expect(415);

      expect(response.body.error).toBe('Unsupported Media Type');
    });

    it('should handle missing required fields', async () => {
      const response = await request(app)
        .post('/api/users')
        .set('X-API-Key', validApiKey)
        .send({})
        .expect(400);

      expect(response.body.error).toBe('Invalid Input');
      expect(response.body.message).toContain('required');
    });
  });

  describe('Environment-Specific Errors', () => {
    it('should show detailed errors in development', async () => {
      process.env.NODE_ENV = 'development';
      
      const response = await request(app)
        .post('/api/users')
        .set('X-API-Key', validApiKey)
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('validation');
      
      process.env.NODE_ENV = 'test';
    });

    it('should sanitize error messages in production', async () => {
      process.env.NODE_ENV = 'production';
      
      const response = await request(app)
        .get('/api/error-test')
        .set('X-API-Key', validApiKey)
        .expect(404);

      expect(response.body.message).not.toContain('stack');
      expect(response.body.message).not.toContain('trace');
      
      process.env.NODE_ENV = 'test';
    });
  });

  describe('Error Response Format', () => {
    it('should include request ID in errors', async () => {
      const response = await request(app)
        .get('/api/nonexistent')
        .set('X-API-Key', validApiKey)
        .expect(404);

      expect(response.headers).toHaveProperty('x-request-id');
      expect(response.body).toHaveProperty('requestId');
    });

    it('should include timestamp in errors', async () => {
      const response = await request(app)
        .get('/api/nonexistent')
        .set('X-API-Key', validApiKey)
        .expect(404);

      expect(response.body).toHaveProperty('timestamp');
      expect(new Date(response.body.timestamp)).toBeInstanceOf(Date);
    });

    it('should include error code in response', async () => {
      const response = await request(app)
        .post('/api/users')
        .set('X-API-Key', validApiKey)
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('code');
      expect(typeof response.body.code).toBe('string');
    });
  });
});