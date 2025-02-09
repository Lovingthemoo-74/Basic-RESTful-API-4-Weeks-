/**
 * Redis Client Configuration
 * Handles Redis connection and lifecycle management
 */

import { createClient } from 'redis';

// Redis client configuration
const redisConfig = {
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  password: process.env.REDIS_PASSWORD,
};

// Create Redis client with proper error handling
const redisClient = createClient(redisConfig);

// Error handling
redisClient.on('error', (err) => {
  if (process.env.NODE_ENV === 'development') {
    console.error('Redis Client Error:', err);
  }
});

// Connection handling
redisClient.on('connect', () => {
  if (process.env.NODE_ENV === 'development') {
    console.info('Redis Client Connected');
  }
});

redisClient.on('ready', () => {
  if (process.env.NODE_ENV === 'development') {
    console.info('Redis Client Ready');
  }
});

redisClient.on('end', () => {
  if (process.env.NODE_ENV === 'development') {
    console.info('Redis Client Connection Ended');
  }
});

// Connect to Redis
(async () => {
  try {
    await redisClient.connect();
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Redis Connection Error:', error);
    }
    process.exit(1);
  }
})();

// Graceful shutdown
process.on('SIGTERM', async () => {
  try {
    await redisClient.quit();
    if (process.env.NODE_ENV === 'development') {
      console.info('Redis connection closed.');
    }
    process.exit(0);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error during shutdown:', error);
    }
    process.exit(1);
  }
});

export default redisClient;