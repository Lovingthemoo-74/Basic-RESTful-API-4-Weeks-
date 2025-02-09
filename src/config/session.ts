import session from 'express-session';
import { Request, Response, NextFunction } from 'express';
import RedisStore from 'connect-redis';
import redisClient from './redis';

// Define session data interface
export interface UserSessionData {
    userId: string;
    role: string;
    lastAccess: Date;
}

// Extend Express.Session
declare module 'express-session' {
    interface Session {
        user?: UserSessionData;
    }
}

// Session configuration
const sessionConfig = {
  store: new RedisStore({
    client: redisClient,
    prefix: 'session:',
  }),
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  name: 'sessionId',
  resave: false,
  saveUninitialized: false,
  rolling: true,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'strict' as const,
  },
};

// Session middleware with type safety
export const sessionMiddleware = session(sessionConfig);

// Type-safe session handler
export const handleSession = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.session.user) {
    req.session.user = {
      userId: '',
      role: 'guest',
      lastAccess: new Date(),
    };
  }
  next();
};

// Session utilities
export const sessionUtils = {
  // Update session data
  updateSession(req: Request, data: Partial<UserSessionData>): void {
    if (req.session.user) {
      req.session.user = {
        ...req.session.user,
        ...data,
        lastAccess: new Date(),
      };
    }
  },

  // Clear session data
  clearSession(req: Request): void {
    req.session.destroy((err) => {
      if (err) {
        console.error('Error destroying session:', err);
      }
    });
  },

  // Get session data with type safety
  getSessionData(req: Request): UserSessionData | null {
    return req.session.user || null;
  },
};