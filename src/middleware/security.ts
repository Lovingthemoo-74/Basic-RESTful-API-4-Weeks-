/**
 * Security Middleware Configuration
 * 
 * Implements enterprise-grade security features:
 * - API Key Authentication with timing-safe comparison
 * - Rate Limiting with Redis support
 * - Security Headers (CSP, HSTS, etc.)
 * - Request Logging
 * - Error Handling
 */

import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import { doubleCsrf } from 'csrf-csrf';
import { randomUUID, timingSafeEqual } from 'crypto';
import redisClient from '../config/redis';
import { sessionMiddleware } from '../config/session';
import { MemoryStore } from './memory-store';
import { sanitizeAndValidate } from './sanitize';

/**
 * Custom CORS middleware that enforces strict CORS policy
 */
export const corsMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  res.setHeader('Vary', 'Origin');

  if (req.method === 'OPTIONS') {
    res.status(204);
  }

  res.on('finish', () => {
    const corsHeaders = [
      'access-control-allow-origin',
      'access-control-allow-methods',
      'access-control-allow-headers',
      'access-control-expose-headers',
      'access-control-max-age',
      'access-control-allow-credentials'
    ];

    corsHeaders.forEach(header => {
      if (res.hasHeader(header)) {
        res.removeHeader(header);
      }
    });
  });

  next();
};

/**
 * Sets essential security headers for all responses
 */
const setSecurityHeaders = (req: Request, res: Response, next: NextFunction): void => {
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains; preload'
  );
  res.setHeader('Content-Security-Policy', [
    'default-src "self"',
    'script-src "self"',
    'style-src "self"',
    'img-src "self" data: https:',
    'connect-src "self"',
    'font-src "self"',
    'object-src "none"',
    'media-src "self"',
    'frame-src "none"',
    'form-action "self"',
    'frame-ancestors "none"'
  ].join('; '));
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
};

/**
 * Creates rate limiter instance with Redis support
 */
const createRateLimiter = () => {
  const windowMs = Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000;
  const max = Number(process.env.RATE_LIMIT_MAX) || 100;
  
  const store = process.env.NODE_ENV === 'production'
    ? new RedisStore({
      sendCommand: (...args: string[]) => redisClient.sendCommand(args)
    })
    : MemoryStore.getInstance();

  const options = {
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    store,
    skipFailedRequests: false,
    handler: (_req: Request, res: Response) => {
      res.status(429).json({
        error: 'Too Many Requests',
        message: 'Please try again later'
      });
    },
    keyGenerator: (req: Request) => {
      const forwardedFor = req.headers['x-forwarded-for'];
      const ip = Array.isArray(forwardedFor)
        ? forwardedFor[0]
        : (forwardedFor || req.ip || '127.0.0.1');
      return ip.replace(/:\d+$/, '').trim();
    }
  };

  if (process.env.NODE_ENV === 'test') {
    options.max = 2;
    options.windowMs = 1000;
  }

  return rateLimit(options);
};

export const rateLimiter = createRateLimiter();

/**
 * CSRF Protection Configuration
 */
const { doubleCsrfProtection } = doubleCsrf({
  getSecret: () => process.env.CSRF_SECRET || 'your-secret-key',
  cookieName: 'x-csrf-token',
  cookieOptions: {
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    signed: true
  },
  size: 64,
  ignoredMethods: ['GET', 'HEAD', 'OPTIONS']
});

/**
 * API Key Authentication with timing-safe comparison
 */
export const apiKeyAuth = (req: Request, res: Response, next: NextFunction): void => {
  const apiKey = req.headers['x-api-key'];
  const validApiKey = process.env.API_KEY;

  if (!apiKey || typeof apiKey !== 'string' || !validApiKey) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or missing API key'
    });
    return;
  }

  // Use timing-safe comparison
  const apiKeyBuffer = Buffer.from(apiKey);
  const validKeyBuffer = Buffer.from(validApiKey);

  if (!timingSafeEqual(apiKeyBuffer, validKeyBuffer)) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid API key'
    });
    return;
  }

  next();
};

/**
 * Error Handler with detailed logging in development
 */
export const errorHandler = (err: Error, req: Request, res: Response, _next: NextFunction): void => {
  const requestId = req.headers['x-request-id'] || randomUUID();

  const errorDetails = {
    requestId,
    name: err.name,
    message: err.message,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString(),
    body: req.body
  };

  if (process.env.NODE_ENV === 'development') {
    console.error('Error details:', errorDetails);
  }

  if (err.name === 'ValidationError' || err.message.includes('validation')) {
    res.status(400).json({
      error: 'Invalid Input',
      message: process.env.NODE_ENV === 'development' ? err.message : 'Invalid input data'
    });
    return;
  }

  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred'
  });
};

/**
 * Request Logger with environment-aware logging
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  if (process.env.NODE_ENV === 'test') {
    next();
    return;
  }

  const start = Date.now();
  const requestId = randomUUID();
  req.headers['x-request-id'] = requestId;

  const logRequest = {
    level: 'info',
    type: 'request',
    id: requestId,
    method: req.method,
    path: req.path,
    query: Object.keys(req.query),
    timestamp: new Date().toISOString(),
    ip: (req.ip || req.socket.remoteAddress || '0.0.0.0').replace(/:\d+$/, ''),
    userAgent: req.get('user-agent') || 'unknown'
  };

  if (process.env.NODE_ENV === 'development') {
    console.info(JSON.stringify(logRequest));
  }

  res.on('finish', () => {
    const duration = Date.now() - start;
    const logResponse = {
      level: 'info',
      type: 'response',
      id: requestId,
      status: res.statusCode,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString()
    };

    if (process.env.NODE_ENV === 'development') {
      console.info(JSON.stringify(logResponse));
    }
  });

  next();
};

/**
 * Developer Signature Middleware
 */
export const developerSignature = (_req: Request, res: Response, next: NextFunction): void => {
  res.setHeader('X-Powered-By', 'Basic RESTful API');
  next();
};

/**
 * Combined Security Middleware Stack
 */
export const securityMiddleware = [
  corsMiddleware,
  sessionMiddleware,
  setSecurityHeaders,
  rateLimiter,
  doubleCsrfProtection,
  sanitizeAndValidate,
  requestLogger,
  developerSignature
];

export { setSecurityHeaders, createRateLimiter };