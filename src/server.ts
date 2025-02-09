/**
 * Main Server Application
 * Sets up Express server with security middleware and routes
 */

import express from 'express';
import { json } from 'body-parser';
import swaggerUi from 'swagger-ui-express';
import { securityMiddleware, errorHandler } from './middleware/security';
import userRoutes from './routes/users';
import healthRoutes from './routes/health';

// Initialize express app
const app = express();

// Basic middleware
app.use(json());

// Security middleware
app.use(securityMiddleware);

// API Documentation
const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Basic RESTful API',
    version: '1.0.0',
    description: 'A secure REST API implementation with enterprise-grade features',
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Development server',
    },
  ],
  components: {
    securitySchemes: {
      ApiKeyAuth: {
        type: 'apiKey',
        in: 'header',
        name: 'X-API-Key',
      },
    },
  },
  security: [
    {
      ApiKeyAuth: [],
    },
  ],
  paths: {
    '/api/health': {
      get: {
        tags: ['Health'],
        summary: 'Health check endpoint',
        responses: {
          200: {
            description: 'Server is healthy',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: {
                      type: 'string',
                      example: 'ok',
                    },
                    timestamp: {
                      type: 'string',
                      format: 'date-time',
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/users': {
      post: {
        tags: ['Users'],
        summary: 'Create a new user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: {
                    type: 'string',
                  },
                  email: {
                    type: 'string',
                    format: 'email',
                  },
                },
                required: ['name', 'email'],
              },
            },
          },
        },
        responses: {
          201: {
            description: 'User created successfully',
          },
          400: {
            description: 'Invalid input',
          },
          401: {
            description: 'Unauthorized',
          },
        },
      },
    },
  },
};

// Routes
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/api/users', userRoutes);
app.use('/api/health', healthRoutes);

// Error handling
app.use(errorHandler);

// Export for testing
export default app;