/**
 * Security Features Test Suite
 * Tests authentication, rate limiting, and input sanitization
 */

import { Request, Response, NextFunction } from 'express';
import { sanitizeAndValidate } from '../middleware/sanitize';
import { apiKeyAuth, errorHandler } from '../middleware/security';

// Mock request and response objects
const mockRequest = (data: Record<string, unknown> = {}): Partial<Request> => ({
  headers: {},
  body: {},
  ...data,
});

const mockResponse = (): Partial<Response> => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.setHeader = jest.fn().mockReturnValue(res);
  return res;
};

const mockNext: NextFunction = jest.fn();

describe('Security Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.API_KEY = 'test-api-key';
  });

  describe('API Key Authentication', () => {
    it('should allow requests with valid API key', () => {
      const req = mockRequest({
        headers: { 'x-api-key': 'test-api-key' }
      });
      const res = mockResponse();

      apiKeyAuth(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should reject requests with invalid API key', () => {
      const req = mockRequest({
        headers: { 'x-api-key': 'invalid-key' }
      });
      const res = mockResponse();

      apiKeyAuth(req as Request, res as Response, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Unauthorized',
        message: 'Invalid API key'
      });
    });

    it('should reject requests without API key', () => {
      const req = mockRequest();
      const res = mockResponse();

      apiKeyAuth(req as Request, res as Response, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Unauthorized',
        message: 'Invalid or missing API key'
      });
    });
  });

  describe('Input Sanitization', () => {
    it('should sanitize HTML in input fields', () => {
      const req = mockRequest({
        body: {
          name: '<script>alert("xss")</script>John<p>Test</p>',
          email: 'john@example.com'
        }
      });
      const res = mockResponse();

      sanitizeAndValidate(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(req.body).toEqual({
        name: 'John',
        email: 'john@example.com'
      });
    });

    it('should validate email format', () => {
      const req = mockRequest({
        body: {
          name: 'John',
          email: 'invalid-email'
        }
      });
      const res = mockResponse();

      sanitizeAndValidate(req as Request, res as Response, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Invalid Input',
        message: 'Invalid input data'
      });
    });

    it('should handle empty input', () => {
      const req = mockRequest({
        body: {
          name: '',
          email: 'john@example.com'
        }
      });
      const res = mockResponse();

      sanitizeAndValidate(req as Request, res as Response, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('Error Handler', () => {
    it('should handle validation errors', () => {
      const error = new Error('Validation failed');
      error.name = 'ValidationError';
      const req = mockRequest();
      const res = mockResponse();

      errorHandler(error, req as Request, res as Response, mockNext);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Invalid Input',
        message: 'Invalid input data'
      });
    });

    it('should handle general errors', () => {
      const error = new Error('Internal error');
      const req = mockRequest();
      const res = mockResponse();

      errorHandler(error, req as Request, res as Response, mockNext);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Internal Server Error',
        message: 'An unexpected error occurred'
      });
    });
  });
});